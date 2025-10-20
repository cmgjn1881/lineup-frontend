// src/pages/PlayerListPage.jsx

import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useApiClient } from '../api/ApiClient';
import PlayerForm from '../components/PlayerForm'; // 🔑 PlayerForm 컴포넌트 import
import { Users, Loader2, Plus, ArrowLeft, Trash2, Edit } from 'lucide-react'; // Trash2, Edit 아이콘 추가

const PlayerListPage = ({ teamId }) => {
  const api = useApiClient();
  const navigate = useNavigate();
  const location = useLocation();
  const team = location.state?.team;

  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // 🔑 [핵심 상태] 등록/수정/삭제 공통 상태
  const [isSubmitting, setIsSubmitting] = useState(false); // 폼 제출 공통 로딩
  const [isDeleting, setIsDeleting] = useState(null); // 삭제 중인 선수 ID
  const [formError, setFormError] = useState(''); // 폼 전용 에러 메시지

  // 🔑 [폼 상태] 폼을 열고 닫는 상태, 수정 시 초기 데이터
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [initialFormData, setInitialFormData] = useState(null);

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
      setIsFormOpen(false);
      setInitialFormData(null);
      fetchPlayers();
    } catch (err) {
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

  // 💡 [추가] 수정 버튼 클릭 시
  const handleEditClick = (player) => {
    const rawBackNumber = player.backNumber || player.number; // DB 값 (숫자)
    // 폼을 수정 모드로 열기 위해 데이터 설정
    setInitialFormData({
      id: player.playerId,
      name: player.name,
      position: player.position,
      backNumber: rawBackNumber !== undefined && rawBackNumber !== null ? String(rawBackNumber) : '',
    });
    setIsFormOpen(true);
  };

  // 💡 [추가] 등록 버튼 클릭 시
  const handleCreateClick = () => {
    setInitialFormData(null); // 초기화하여 등록 모드로 설정
    setIsFormOpen(true);
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
  const isEditMode = !!initialFormData?.id; // 수정 모드 여부

  return (
    <div className="p-4">
      {/* 🔑 뒤로가기 버튼 유지 */}
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center text-gray-500 hover:text-indigo-600 mb-4"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        {teamName} 팀 상세로 돌아가기
      </button>
      <h2 className="text-3xl font-bold flex items-center mb-6 text-gray-800">
        {teamName}
        <br></br>선수 관리
      </h2>

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
            ${isFormOpen ? 'bg-red-500 hover:bg-red-600 text-white' : 'bg-blue-500 hover:bg-blue-600 text-white'}`}
        disabled={isFormOpen} // 폼이 열려있으면 비활성화
      >
        <Plus className="w-5 h-5 mr-1" /> 새 선수 등록
      </button>

      {/* 🔑 PlayerForm 컴포넌트 렌더링 (분리된 폼 사용) */}
      {isFormOpen && (
        <PlayerForm
          initialData={initialFormData} // 수정 시 데이터, 등록 시 null
          teamId={teamId}
          onSubmit={handleFormSubmit}
          onCancel={() => {
            setIsFormOpen(false);
            setInitialFormData(null);
          }} // 취소 시 초기화
          submitLabel={isEditMode ? '선수 정보 수정' : '선수 등록 완료'}
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
                <div
                  key={player.playerId}
                  className="bg-white p-4 border rounded-lg shadow-sm flex justify-between items-center"
                >
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
                      disabled={isFormOpen}
                    >
                      <Edit className="w-5 h-5" />
                    </button>

                    {/* 삭제 버튼 */}
                    <button
                      onClick={() => handleDeletePlayer(player.playerId, player.name)}
                      className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-50 transition duration-150"
                      aria-label={`${player.name} 삭제`}
                      disabled={isDeleting === player.playerId || isFormOpen}
                    >
                      {isDeleting === player.playerId ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <Trash2 className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default PlayerListPage;
