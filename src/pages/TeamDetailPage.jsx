// src/pages/TeamDetailPage.jsx

import React, { useEffect, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Briefcase, Users, Grid, ArrowLeft } from 'lucide-react';
// import { useApiClient } from '../api/ApiClient'; // API 연동 시 주석 해제

const TeamDetailPage = ({ teamId }) => {
  const location = useLocation();
  // const api = useApiClient(); // API 연동 시 주석 해제

  // 1. Link state에서 초기 팀 정보를 가져옵니다.
  const [team, setTeam] = useState(location.state?.team || null);
  const [error] = useState('');

  useEffect(() => {
    const fetchTeamDetails = async () => {
      // 2. teamId를 사용하여 API로 최신 팀 상세 정보를 가져오는 로직 (향후 구현)
      // try {
      //   const res = await api.getTeam(teamId);
      //   setTeam(res.data); // 상태를 최신 정보로 업데이트
      // } catch (err) {
      //   setError('팀 정보를 불러오는 데 실패했습니다.');
      // }
    };

    // state로 팀 정보가 전달되지 않은 경우 (예: URL 직접 입력) API 호출
    if (!team) {
      fetchTeamDetails(); // API 연동 시 주석 해제
      // 임시로 로딩 상태 표시
      setTeam({ name: '팀 정보 로딩 중...' });
    }
  }, [teamId, team /*, api */]);

  // teamId가 없거나, 아직 team 객체가 설정되지 않았을 때의 처리
  if (!team) {
    return <div className="p-6 text-red-500">잘못된 팀 정보입니다.</div>;
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <Link to="/teams" className="inline-flex items-center text-gray-500 hover:text-indigo-600 mb-4">
        <ArrowLeft className="w-4 h-4 mr-2" />
        모든 팀 목록으로 돌아가기
      </Link>
      <h2 className="text-4xl font-extrabold mb-2 text-indigo-700 flex items-center">
        <Briefcase className="w-8 h-8 mr-3" /> {team.name}
      </h2>
      <p className="text-gray-500 mb-10">
        팀 ID: {team.teamId} | 소유자: {team.ownerEmail}
      </p>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      <p className="text-gray-600 mb-10 text-lg">팀 '**{team.name}**'을(를) 관리할 기능을 선택하세요.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 1. 팀 선수 관리 버튼 */}
        <Link
          to={`/teams/${teamId}/players`}
          state={{ team: team }} // 팀 정보를 state로 전달
          className="p-6 bg-white border border-gray-200 rounded-xl shadow-lg hover:shadow-xl transition duration-300 flex flex-col items-center text-center"
        >
          <Users className="w-10 h-10 text-blue-500 mb-3" />
          <h3 className="text-2xl font-semibold text-gray-800">팀 선수 관리</h3>
          <p className="text-gray-500 mt-2">선수를 추가, 수정, 삭제합니다.</p>
        </Link>

        {/* 2. 포메이션 관리 버튼 */}
        <Link
          to={`/teams/${teamId}/formation`}
          className="p-6 bg-white border border-gray-200 rounded-xl shadow-lg hover:shadow-xl transition duration-300 flex flex-col items-center text-center"
        >
          <Grid className="w-10 h-10 text-green-500 mb-3" />
          <h3 className="text-2xl font-semibold text-gray-800">포메이션 관리</h3>
          <p className="text-gray-500 mt-2">전술 및 기본 포메이션을 설정합니다.</p>
        </Link>
      </div>
    </div>
  );
};

export default TeamDetailPage;
