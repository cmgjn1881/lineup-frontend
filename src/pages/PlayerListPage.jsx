// src/pages/PlayerListPage.jsx

import React, { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { useLocation } from 'react-router-dom';
import { useApiClient } from '../api/ApiClient';
import PlayerForm from '../components/PlayerForm';
import ConfirmDialog from '../components/common/ConfirmDialog';
import { Users, Loader2, Plus, Edit, CircleX } from 'lucide-react';

const POSITION_COLORS = {
  FW: 'text-red-600', // 공격수 - 빨강
  MF: 'text-green-600', // 미드필더 - 초록
  DF: 'text-blue-600', // 수비수 - 파랑
  GK: 'text-yellow-500', // 골키퍼 - 노랑
};

const PlayerListPage = ({ teamId }) => {
  const api = useApiClient();
  const location = useLocation();
  const team = location.state?.team;

  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // 🔑 [핵심 상태] 등록/수정/삭제 공통 상태
  const [isSubmitting, setIsSubmitting] = useState(false); // 폼 제출 공통 로딩
  const [isDeleting, setIsDeleting] = useState(null); // 삭제 중인 선수 ID
  const [formError, setFormError] = useState(''); // 폼 전용 에러 메시지

  // 🔑 [수정] 폼 상태 분리 (isFormOpen 대신)
  const [isCreateFormOpen, setIsCreateFormOpen] = useState(false); // 등록 폼 제어
  const [editingPlayerId, setEditingPlayerId] = useState(null); // 수정 중인 선수 ID

  // 💡 [추가] 삭제 확인 다이얼로그 상태
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [playerToDelete, setPlayerToDelete] = useState(null); // { id, name }

  const [initialFormData, setInitialFormData] = useState(null);

  // 💡 폼이 하나라도 열려있는지 확인하는 공통 상태
  const isFormActive = isCreateFormOpen || !!editingPlayerId;

  // 💡 [수정] 폼 닫기 공통 함수 (등록/수정 취소 시 호출)
  const handleFormCancel = () => {
    setIsCreateFormOpen(false);
    setEditingPlayerId(null);
    setInitialFormData(null);
    setFormError('');
  };

  // 💡 팀 목록 조회 로직 (유지)
  const fetchPlayers = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.getTeamPlayers(teamId);
      setPlayers(res.data);
    } catch (err) {
      setError(err.response?.data?.message || '선수 목록을 불러오는 데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }, [api, teamId]);

  // 💡 [핵심] 등록 및 수정 공통 처리 함수
  const handleFormSubmit = async (formData) => {
    setFormError('');
    setIsSubmitting(true);

    // API 요청 바디 형태 조정
    const playerPayload = {
      name: formData.name,
      position: formData.position.toUpperCase(),
      backNumber: parseInt(formData.backNumber),
    };

    const playerId = initialFormData?.id; // 수정 모드일 때만 playerId가 존재

    try {
      if (playerId) {
        // 🔑 수정 API 호출
        await api.updatePlayer(teamId, playerId, playerPayload);
        toast.success(`${formData.name} 선수가 수정되었습니다.`);
      } else {
        // 🔑 등록 API 호출
        await api.createPlayer(teamId, playerPayload);
        toast.success(`${formData.name} 선수가 등록되었습니다.`);
      }

      // 성공 후 폼 닫기 및 목록 새로고침
      handleFormCancel();
      fetchPlayers();
    } catch (err) {
      const errorMessage = err.response?.data?.message || `선수 ${playerId ? '수정' : '등록'}에 실패했습니다.`;
      setFormError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteClick = (playerId, playerName) => {
    setPlayerToDelete({ id: playerId, name: playerName });
    setIsConfirmOpen(true);
  };

  // 💡 [추가] 삭제 로직
  const handleConfirmDelete = async () => {
    if (!playerToDelete) return;

    const { id, name } = playerToDelete;

    setError('');
    setIsDeleting(id);
    setIsConfirmOpen(false);

    try {
      // 🔑 삭제 API 호출
      await api.deletePlayer(teamId, id);
      toast.success(`${name} 선수가 성공적으로 삭제되었습니다.`);

      fetchPlayers();
    } catch (err) {
      const errorMessage = err.response?.data?.message || '선수 삭제에 실패했습니다. (권한 확인)';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsDeleting(null);
    }
  };

  // 수정 버튼 클릭 시
  const handleEditClick = (player) => {
    // 🔑 [핵심] 다른 폼이 열려있거나 이미 이 선수가 수정 중이면 토글
    if (isFormActive && editingPlayerId !== player.playerId) return;

    if (editingPlayerId === player.playerId) {
      handleFormCancel(); // 이미 열려있으면 닫기
      return;
    }

    const rawBackNumber = player.backNumber || player.number;
    setFormError('');
    setInitialFormData({
      id: player.playerId,
      name: player.name,
      position: player.position,
      backNumber: rawBackNumber !== undefined && rawBackNumber !== null ? String(rawBackNumber) : '',
    });

    setIsCreateFormOpen(false); // 혹시 열려있을 등록 폼 닫기
    setEditingPlayerId(player.playerId); // 🔑 수정 중인 ID 설정 (폼 렌더링 트리거)
  };

  // 등록 버튼 클릭 시
  const handleCreateClick = () => {
    // 🔑 [핵심] 다른 폼이 열려있으면 닫고, 아니면 폼 열기
    if (isFormActive && !isCreateFormOpen) {
      handleFormCancel(); // 수정 폼이 열려있으면 닫음
    }

    setFormError('');
    setInitialFormData(null);
    setEditingPlayerId(null); // 수정 상태 해제
    setIsCreateFormOpen(!isCreateFormOpen); // 등록 폼 토글
  };

  // ... (useEffect 유지) ...
  useEffect(() => {
    if (teamId) {
      fetchPlayers();
    }
  }, [teamId, fetchPlayers]);

  if (!teamId || !team?.name) {
    return <div className="p-4 text-red-500">유효하지 않은 팀 정보입니다.</div>;
  }

  if (!teamId || !team?.name) {
    return <div className="p-4 text-red-500">유효하지 않은 팀 정보입니다.</div>;
  }

  const teamName = team.name || `팀 ID ${teamId}`;
  //const isEditMode = !!initialFormData?.id; // 수정 모드 여부
  const playerCount = players.length;

  // 포지션별 순서를 정의합니다.
  const positionOrder = {
    GK: 4,
    DF: 3,
    MF: 2,
    FW: 1,
    // 기타 포지션은 가장 뒤로
  };

  const sortedPlayers = [...players].sort((a, b) => {
    const orderA = positionOrder[a.position] || 99;
    const orderB = positionOrder[b.position] || 99;

    return orderA - orderB; // 포지션 순서대로 오름차순 정렬
  });

  return (
    // 💡 [수정] main 태그가 스크롤을 담당하므로, 여기서는 overflow-y-auto를 제거합니다.
    <div className="p-4">
      <h2 className="text-3xl font-bold flex items-center mb-6 text-white">{teamName}</h2>
      <div className="flex items-center text-gray-600 mb-4">
        <Users className="w-5 h-5 mr-2 text-[#63FF70]" />
        <span className="text-lg text-[#D9D9D9]">선수 목록 ({playerCount}명)</span>
      </div>

      {/* ... (로딩/에러 메시지 유지) ... */}
      {loading && (
        <div className="flex justify-center items-center py-10">
          <Loader2 className="w-6 h-6 animate-spin text-indigo-500 mr-2" />
          <p className="text-indigo-500">선수 목록을 불러오는 중...</p>
        </div>
      )}

      {/* 🔑 새 선수 등록 버튼 (폼 열림/닫힘 제어) */}
      <button
        onClick={handleCreateClick}
        className={`py-1 px-3 font-medium rounded-lg shadow-md transition duration-200 flex items-center mb-6 border
            ${isCreateFormOpen ? 'bg-red-500 hover:bg-red-600 text-white' : 'bg-[#0D1117 text-white'}`}
        disabled={isFormActive && !isCreateFormOpen} // 다른 폼(수정)이 열려있을 때만 비활성화
      >
        <Plus className="w-5 h-5 mr-1" /> {isCreateFormOpen ? '등록 취소' : '새 선수 등록'}
      </button>

      {/* 🔑 [핵심] 상단에 등록 폼만 렌더링 */}
      {isCreateFormOpen && (
        <PlayerForm
          initialData={initialFormData}
          onSubmit={handleFormSubmit}
          onCancel={handleFormCancel} // 🔑 공통 닫기 함수
          submitLabel={'등록'}
          error={formError}
          isSubmitting={isSubmitting}
        />
      )}

      {!loading && !error && (
        <>
          <div className="space-y-3">
            {players.length === 0 ? (
              <p className="text-gray-500">등록된 선수가 없습니다.</p>
            ) : (
              sortedPlayers.map((player) => (
                <React.Fragment key={player.playerId}>
                  <div className="bg-[#0D1117] p-4 border border-[#6B6B6B] rounded-3xl shadow-sm flex justify-between items-center">
                    {/* 선수 정보 */}
                    <div>
                      <p className="text-lg font-semibold text-white flex items-center">
                        <span className={`text-lg mr-2 ${POSITION_COLORS[player.position]}`}>{player.position}</span>
                        {player.name}
                      </p>
                      <p className="text-sm text-[#D9D9D9]">등번호: {player.backNumber || player.number}</p>
                    </div>

                    {/* 🔑 수정/삭제 버튼 그룹 */}
                    <div className="space-x-2 flex items-center">
                      {/* 수정 버튼 */}
                      <button
                        onClick={() => handleEditClick(player)}
                        className="text-[#A7A8A6] hover:text-blue-100 p-2 rounded-full hover:bg-blue-900 transition duration-150"
                        aria-label={`${player.name} 수정`}
                        disabled={isFormActive && editingPlayerId !== player.playerId}
                      >
                        <Edit className="w-5 h-5" />
                      </button>

                      {/* 삭제 버튼 */}
                      <button
                        onClick={() => handleDeleteClick(player.playerId, player.name)}
                        className="text-red-500 hover:text-red-100 p-2 rounded-full hover:bg-red-900 transition duration-150"
                        aria-label={`${player.name} 삭제`}
                        disabled={isDeleting === player.playerId || isFormActive}
                      >
                        {isDeleting === player.playerId ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <CircleX className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </div>
                  {/* 🔑 [핵심] 인라인 수정 폼 조건부 렌더링 */}
                  {editingPlayerId === player.playerId && (
                    <div className="p-1">
                      <PlayerForm
                        initialData={initialFormData}
                        onSubmit={handleFormSubmit}
                        onCancel={handleFormCancel}
                        submitLabel={'수정'}
                        error={formError}
                        isSubmitting={isSubmitting}
                      />
                    </div>
                  )}
                </React.Fragment>
              ))
            )}
          </div>
        </>
      )}
      {/* 💡 [추가] 삭제 확인 다이얼로그 렌더링 */}
      <ConfirmDialog
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        title="선수 삭제"
        message={`정말로 '${playerToDelete?.name}' 선수를 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.`}
        confirmText="삭제"
      />
    </div>
  );
};

export default PlayerListPage;
