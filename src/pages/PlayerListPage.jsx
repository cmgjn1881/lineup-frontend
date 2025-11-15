// src/pages/PlayerListPage.jsx

import React, { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { useLocation } from 'react-router-dom';
import { useApiClient } from '../api/ApiClient';
import ConfirmDialog from '../components/common/ConfirmDialog';
import { Users, Loader2, Plus, Edit, CircleX } from 'lucide-react';
import LoadingOverlay from '../components/common/LoadingOverlay';
import PlayerFormModal from '../components/PlayerFormModal';

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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(null);
  const [formError, setFormError] = useState('');

  // 🔑 폼 모달의 열림/닫힘 상태
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState(null); // 수정 중인 선수 ID

  // 💡 [추가] 삭제 확인 다이얼로그 상태
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [playerToDelete, setPlayerToDelete] = useState(null); // { id, name }

  // 💡 팀 목록 조회 로직 (유지)
  const fetchPlayers = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.getTeamPlayers(teamId);
      // 💡 [수정] API 응답 데이터의 'number' 속성을 'backNumber'로 매핑하여 데이터 일관성을 맞춥니다.
      const playersWithConsistentData = res.data.map((player) => ({
        ...player,
        backNumber: player.number,
      }));
      setPlayers(playersWithConsistentData);
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

    // 💡 [수정] editingPlayer 객체의 'id' 대신 'playerId'를 사용합니다.
    const playerId = editingPlayer?.playerId;

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
    setEditingPlayer(player); // 수정 모드 + 선수 정보 전달
    setFormError('');
    setIsFormModalOpen(true);
  };

  // 등록 버튼 클릭 시
  const handleCreateClick = () => {
    setEditingPlayer(null); // 등록 모드
    setFormError('');
    setIsFormModalOpen(true);
  };

  // 폼 닫기 공통 함수 (등록/수정 취소 시 호출)
  const handleFormCancel = () => {
    setIsFormModalOpen(false);
    setEditingPlayer(null);
    setFormError('');
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
    <div className="p-4 relative">
      <LoadingOverlay
        isActive={loading}
        mainText="선수 목록 로딩 중..."
        subText="팀의 선수 정보를 불러오고 있습니다."
      />
      <LoadingOverlay
        isActive={isSubmitting}
        mainText={editingPlayer?.playerId ? '선수 정보 수정 중...' : '새 선수 등록 중...'}
        subText="잠시만 기다려주세요."
      />
      <LoadingOverlay
        isActive={!!isDeleting}
        mainText="선수 삭제 중..."
        subText="선택하신 선수를 팀에서 제외하고 있습니다."
      />
      <h2 className="text-3xl font-bold flex items-center mb-6 text-white">{teamName}</h2>
      <div className="flex items-center text-gray-600 mb-4">
        <Users className="w-5 h-5 mr-2 text-[#63FF70]" />
        <span className="text-lg text-[#D9D9D9]">선수 목록 ({playerCount}명)</span>
      </div>

      {/* 🔑 새 선수 등록 버튼 (폼 열림/닫힘 제어) */}
      <button
        onClick={handleCreateClick}
        className="py-1 px-3 font-medium rounded-lg shadow-md transition duration-200 flex items-center mb-6 border bg-[#0D1117] text-white"
      >
        <Plus className="w-5 h-5 mr-1" /> 새 선수 등록
      </button>

      {!loading && !error && (
        <>
          <div className="space-y-3">
            {players.length === 0 ? (
              <p className="text-gray-500">등록된 선수가 없습니다.</p>
            ) : (
              sortedPlayers.map((player) => (
                <div
                  key={player.playerId}
                  className="bg-[#0D1117] p-4 border border-[#6B6B6B] rounded-3xl shadow-sm flex justify-between items-center"
                >
                  {/* 선수 정보 */}
                  <div>
                    <p className="text-lg font-semibold text-white flex items-center">
                      <span className={`text-lg mr-2 ${POSITION_COLORS[player.position]}`}>{player.position}</span>
                      {player.name}
                    </p>
                    {/* 💡 [수정] 'number' 속성 대신 'backNumber'만 참조하도록 통일합니다. */}
                    <p className="text-sm text-[#D9D9D9]">등번호: {player.backNumber}</p>
                  </div>

                  {/* 🔑 수정/삭제 버튼 그룹 */}
                  <div className="space-x-2 flex items-center">
                    {/* 수정 버튼 */}
                    <button
                      onClick={() => handleEditClick(player)}
                      className="text-[#A7A8A6] hover:text-blue-100 p-2 rounded-full hover:bg-blue-900 transition duration-150"
                      aria-label={`${player.name} 수정`}
                    >
                      <Edit className="w-5 h-5" />
                    </button>

                    {/* 삭제 버튼 */}
                    <button
                      onClick={() => handleDeleteClick(player.playerId, player.name)}
                      className="text-red-500 hover:text-red-100 p-2 rounded-full hover:bg-red-900 transition duration-150"
                      aria-label={`${player.name} 삭제`}
                      disabled={!!isDeleting}
                    >
                      {isDeleting === player.playerId ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <CircleX className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}
      {/* 선수 등록/수정 모달 렌더링 */}
      <PlayerFormModal
        isOpen={isFormModalOpen}
        onClose={handleFormCancel}
        onSubmit={handleFormSubmit}
        initialData={editingPlayer}
        isSubmitting={isSubmitting}
        error={formError}
      />

      {/* 삭제 확인 다이얼로그 렌더링 */}
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
