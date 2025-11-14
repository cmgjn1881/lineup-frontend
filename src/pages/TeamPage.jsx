// src/pages/TeamPage.jsx

import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useApiClient } from '../api/ApiClient';
import { useAuth } from '../context/useAuth';
import GreenBtn from '../components/common/GreenBtn';
import TextInput from '../components/common/TextInput';
import toast from 'react-hot-toast';
import ConfirmDialog from '../components/common/ConfirmDialog';
import { CircleX } from 'lucide-react';

const TeamPage = () => {
  const api = useApiClient();
  const auth = useAuth();
  const [teams, setTeams] = useState([]);
  const [newTeamName, setNewTeamName] = useState('');
  const [error, setError] = useState('');
  const [sortOrder, setSortOrder] = useState('latest');

  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [teamToDelete, setTeamToDelete] = useState(null);

  const fetchTeams = useCallback(async () => {
    try {
      const res = await api.getTeams(sortOrder);
      setTeams(res.data);
      setError('');
    } catch {
      const errorMessage = '팀 목록을 불러오지 못했습니다. (세션 만료 가능성)';
      setError(errorMessage);
      // 💡 toast.error로 변경
      toast.error(errorMessage);
    }
  }, [api, sortOrder]);

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
      toast.success(`'${newTeamName}' 팀이 생성되었습니다.`);
      setNewTeamName('');

      fetchTeams();
    } catch (err) {
      const errorMessage = err.response?.data?.message || '팀 생성에 실패했습니다.';
      setError(errorMessage);
      toast.error(errorMessage);
    }
  };

  const handleDeleteClick = (teamId, teamName) => {
    setTeamToDelete({ id: teamId, name: teamName });
    setIsConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!teamToDelete) return;
    const { id, name } = teamToDelete;

    setError('');
    setIsConfirmOpen(false);

    try {
      await api.deleteTeam(id);

      fetchTeams();
      toast.success(`팀 '${name}'이(가) 성공적으로 삭제되었습니다.`);
    } catch (err) {
      const errorMessage = err.response?.data?.message || '팀 삭제에 실패했습니다. (권한 없음 확인)';
      setError(errorMessage);
      toast.error(errorMessage);
    }
  };

  return (
    <div className="p-4">
      <h1 className="font-bold text-white">팀 추가하기</h1>
      <form onSubmit={handleCreateTeam} className="flex space-x-2 mb-3 pt-4 pb-4 border rounded-lg shadow-sm">
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

      {/* 정렬 드롭다운 */}
      <div className="flex justify-end mb-4">
        <select
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value)}
          className="bg-[#0D1117] text-white border border-[#6B6B6B] rounded-lg px-1 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-[#63FF70]"
          aria-label="팀 목록 정렬"
        >
          <option value="latest">최신순</option>
          <option value="name">이름순</option>
        </select>
      </div>

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
                    handleDeleteClick(team.teamId, team.name);
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
      <ConfirmDialog
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        title="팀 삭제"
        message={`정말로 '${teamToDelete?.name}' 팀을 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.`}
        confirmText="삭제"
      />
    </div>
  );
};

export default TeamPage;
