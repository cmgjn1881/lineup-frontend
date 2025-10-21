// src/pages/PlayerListPage.jsx

import React, { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { useApiClient } from '../api/ApiClient';
import PlayerForm from '../components/PlayerForm'; // 🔑 PlayerForm 컴포넌트 import
import { Users, Loader2, Plus, ArrowLeft, Trash2, Edit } from 'lucide-react'; // Trash2, Edit 아이콘 추가

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
        alert(`${formData.name} 선수가 수정되었습니다.`);
      } else {
        // 🔑 등록 API 호출
        await api.createPlayer(teamId, playerPayload);
        alert(`${formData.name} 선수가 등록되었습니다.`);
      }

      // 성공 후 폼 닫기 및 목록 새로고침
      handleFormCancel();
      fetchPlayers();
    } catch (err) {
      const playerId = initialFormData?.id;
      setFormError(err.response?.data?.message || `선수 ${playerId ? '수정' : '등록'}에 실패했습니다.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 💡 [추가] 삭제 로직
  const handleDeletePlayer = async (playerId, playerName) => {
    if (!window.confirm(`정말로 선수 '${playerName}'을(를) 삭제하시겠습니까?`)) {
      return;
    }
    setError('');
    setIsDeleting(playerId);

    try {
      // 🔑 삭제 API 호출
      await api.deletePlayer(teamId, playerId);
      fetchPlayers();
      alert(`${playerName} 선수가 성공적으로 삭제되었습니다.`);
    } catch (err) {
      setError(err.response?.data?.message || '선수 삭제에 실패했습니다. (권한 확인)');
    } finally {
      setIsDeleting(null);
    }
  };

  // 💡 [수정] 수정 버튼 클릭 시
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

  // 💡 [수정] 등록 버튼 클릭 시
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

  return (
    <div className="p-4">
      <h2 className="text-3xl font-bold flex items-center mb-6 text-gray-800">{teamName}</h2>

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
        className={`py-2 px-4 font-semibold rounded-lg shadow-md transition duration-200 flex items-center mb-6 
            ${
              isCreateFormOpen ? 'bg-red-500 hover:bg-red-600 text-white' : 'bg-blue-500 hover:bg-blue-600 text-white'
            }`}
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
          submitLabel={'선수 등록 완료'}
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
              players.map((player) => (
                <React.Fragment key={player.playerId}>
                  <div className="bg-white p-4 border rounded-lg shadow-sm flex justify-between items-center">
                    {/* 선수 정보 */}
                    <div>
                      <p className="text-lg font-semibold">
                        {player.name} ({player.position})
                      </p>
                      <p className="text-sm text-gray-500">등번호: {player.backNumber || player.number}</p>
                    </div>

                    {/* 🔑 수정/삭제 버튼 그룹 */}
                    <div className="space-x-2 flex items-center">
                      {/* 수정 버튼 */}
                      <button
                        onClick={() => handleEditClick(player)}
                        className="text-blue-500 hover:text-blue-700 p-2 rounded-full hover:bg-blue-50 transition duration-150"
                        aria-label={`${player.name} 수정`}
                        disabled={isFormActive && editingPlayerId !== player.playerId}
                      >
                        <Edit className="w-5 h-5" />
                      </button>

                      {/* 삭제 버튼 */}
                      <button
                        onClick={() => handleDeletePlayer(player.playerId, player.name)}
                        className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-50 transition duration-150"
                        aria-label={`${player.name} 삭제`}
                        disabled={isDeleting === player.playerId || isFormActive}
                      >
                        {isDeleting === player.playerId ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <Trash2 className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </div>
                  {/* 🔑 [핵심] 인라인 수정 폼 조건부 렌더링 */}
                  {editingPlayerId === player.playerId && (
                    <div className="p-4 border border-indigo-300 rounded-lg bg-indigo-50/50 -mt-2 shadow-inner">
                      <PlayerForm
                        initialData={initialFormData}
                        onSubmit={handleFormSubmit}
                        onCancel={handleFormCancel}
                        submitLabel={'선수 정보 수정'}
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
    </div>
  );
};

export default PlayerListPage;
