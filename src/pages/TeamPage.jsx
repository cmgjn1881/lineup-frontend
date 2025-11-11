// src/pages/TeamPage.jsx

import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useApiClient } from '../api/ApiClient';
import { useAuth } from '../context/useAuth';
import GreenBtn from '../components/common/GreenBtn';
import TextInput from '../components/common/TextInput';
import { CircleX } from 'lucide-react';

const TeamPage = () => {
  const api = useApiClient();
  const auth = useAuth();
  const [teams, setTeams] = useState([]);
  const [newTeamName, setNewTeamName] = useState('');
  const [error, setError] = useState('');

  const fetchTeams = useCallback(async () => {
    try {
      const res = await api.getTeams();
      setTeams(res.data);
      setError('');
    } catch {
      setError('팀 목록을 불러오지 못했습니다. (세션 만료 가능성)');
    }
  }, [api]);

  useEffect(() => {
    if (auth.isAuthenticated) {
      fetchTeams();
    }
  }, [auth.isAuthenticated, fetchTeams]);

  const handleCreateTeam = async (e) => {
    e.preventDefault();
    setError('');
    if (!newTeamName.trim()) return;

    try {
      await api.createTeam(newTeamName);
      setNewTeamName('');
      fetchTeams();
    } catch (err) {
      setError(err.response?.data?.message || '팀 생성에 실패했습니다.');
    }
  };

  const handleDeleteTeam = async (teamId, teamName) => {
    if (!window.confirm(`정말로 팀 '${teamName}'을(를) 삭제하시겠습니까?`)) {
      return;
    }
    setError('');
    try {
      await api.deleteTeam(teamId);
      fetchTeams();
      alert(`팀 '${teamName}'이(가) 성공적으로 삭제되었습니다.`);
    } catch (err) {
      setError(err.response?.data?.message || '팀 삭제에 실패했습니다. (권한 없음 확인)');
    }
  };

  return (
    // 💡 [수정] main 태그가 스크롤을 담당하므로, 여기서는 overflow-y-auto를 제거합니다.
    <div className="p-4">
      <h1 className="font-bold text-white">팀 추가하기</h1>
      <form onSubmit={handleCreateTeam} className="flex space-x-2 mb-6 pt-4 pb-4 border rounded-lg shadow-sm">
        <TextInput
          type="text"
          placeholder="새 팀 이름 (예: FC 서울 개발팀)"
          value={newTeamName}
          onChange={(e) => setNewTeamName(e.target.value)}
          required
        />
        <GreenBtn type="submit">팀 생성</GreenBtn>
      </form>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      {/* 팀 목록 */}
      <div className="space-y-4">
        {teams.length === 0 ? (
          <p className="text-gray-500">생성된 팀이 없습니다.</p>
        ) : (
          teams.map((team) => (
            <Link
              key={team.teamId}
              to={`/teams/${team.teamId}`}
              state={{ team: team }}
              className="w-full text-left bg-[#0D1117] p-4 border border-[#6B6B6B] rounded-2xl shadow-md flex justify-between items-center transition duration-150 hover:shadow-lg hover:border-[#63FF70] cursor-pointer"
            >
              <div>
                <p className="text-xl font-semibold text-white">{team.name}</p>
                <p className="text-sm text-[#4493F8]">생성 일자: {team.createdAt.substring(0, 10)}</p>
              </div>
              <div className="space-x-2">
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleDeleteTeam(team.teamId, team.name);
                  }}
                  className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-950"
                  aria-label={`팀 ${team.name} 삭제`}
                >
                  <CircleX className="w-5 h-5" />
                </button>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
};

export default TeamPage;
