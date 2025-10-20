// src/pages/TeamPage.jsx

import React, { useState, useEffect, useCallback } from 'react';
// React Router를 사용한다면 아래와 같이 Link를 import합니다.
import { Link } from 'react-router-dom';
import { useApiClient } from '../api/ApiClient';
import { useAuth } from '../context/useAuth';
import { Briefcase, Plus, Trash2 } from 'lucide-react';

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
    <div className="p-4">
      <h2 className="text-3xl font-bold flex items-center mb-6 text-gray-800">
        <Briefcase className="mr-2" /> 팀 관리
      </h2>

      {/* 팀 생성 폼 */}
      <form onSubmit={handleCreateTeam} className="flex space-x-2 mb-6 p-4 border rounded-lg shadow-sm">
        <input
          type="text"
          placeholder="새 팀 이름 (예: FC 서울 개발팀)"
          value={newTeamName}
          onChange={(e) => setNewTeamName(e.target.value)}
          required
          className="flex-grow px-4 py-2 border rounded-lg focus:ring-indigo-500 focus:border-indigo-500 text-xs"
        />
        <button
          type="submit"
          className="py-2 px-4 bg-green-500 text-white text-xs font-semibold rounded-lg shadow-md hover:bg-green-600 transition duration-200 flex items-center"
        >
          <Plus className="w-3 h-3 mr-1" /> 팀 생성
        </button>
      </form>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      {/* 팀 목록 */}
      <div className="space-y-4">
        {teams.length === 0 ? (
          <p className="text-gray-500">생성된 팀이 없습니다.</p>
        ) : (
          teams.map((team) => (
            // **[변경] a 태그 대신 Link 컴포넌트 사용 (React Router)**
            <Link
              key={team.teamId}
              to={`/teams/${team.teamId}`} // URL 경로: /teams/1234
              state={{ team: team }} // << [수정] 페이지 이동 시 team 객체 전체를 state로 전달
              className="w-full text-left bg-white p-4 border border-gray-200 rounded-lg shadow-md flex justify-between items-center transition duration-150 hover:shadow-lg hover:border-indigo-400 cursor-pointer"
            >
              <div>
                <p className="text-xl font-semibold text-indigo-700">{team.name}</p>
                <p className="text-sm text-gray-500">생성 일자: {team.createdAt.substring(0, 10)}</p>
              </div>
              <div className="space-x-2">
                <button
                  // 삭제 버튼 클릭 시 Link의 페이지 이동을 막고 버블링 방지
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleDeleteTeam(team.teamId, team.name);
                  }}
                  className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-50"
                  aria-label={`팀 ${team.name} 삭제`}
                >
                  <Trash2 className="w-5 h-5" />
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
