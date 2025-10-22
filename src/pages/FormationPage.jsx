// src/pages/FormationPage.jsx

import React, { useState, useEffect } from 'react'; // 🔑 Hooks 유지
import { useNavigate, useLocation } from 'react-router-dom';
import FootballPitch from '../components/FootballPitch';
import PlayerIcon from '../components/PlayerIcon';
import PlayerListPanel from '../components/PlayerListPanel';
import { Shield, RotateCcw, List, Save } from 'lucide-react';
import { useApiClient } from '../api/ApiClient';
import PlayerListModal from '../components/PlayerListModal';
import { useFormationDrag } from '../hooks/useFormationDrag'; // 🔑 useFormationDrag 훅 임포트
import { useBlocker } from 'react-router-dom'; // ⚽️ [추가] React Router의 useBlocker 훅
import { Users, ChevronDown, ChevronUp } from 'lucide-react';

const FormationPage = ({ teamId }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const api = useApiClient();

  // 🔑 [핵심] useFormationDrag 훅 호출 및 반환 값 구조 분해 할당
  const {
    currentFormation,
    draggingId,
    setPitchRef,
    handleMouseDown,
    activeSlot,
    handleSlotClick,
    handleAssignPlayer,
    resetFormation, // 초기화 함수
    isDirty, // ⚽️ [추가] 포메이션 변경 여부 상태
  } = useFormationDrag();

  // 🔑 API 관련 상태 및 로직 (훅과 독립적)
  const [teamPlayers, setTeamPlayers] = useState([]);
  const [playersLoading, setPlayersLoading] = useState(true);

  // 💡 컴포넌트 마운트 시 팀 선수 목록을 불러옵니다.
  useEffect(() => {
    const fetchTeamPlayers = async () => {
      if (!teamId) return;
      setPlayersLoading(true);
      try {
        const res = await api.getTeamPlayers(teamId);
        const playersWithId = res.data.map((p) => ({ ...p, id: p.playerId }));
        setTeamPlayers(playersWithId);
      } catch (err) {
        console.error(err.response?.data?.message || '선수 목록을 불러오는 데 실패했습니다.');
      } finally {
        setPlayersLoading(false);
      }
    };
    fetchTeamPlayers();
  }, [api, teamId]);

  // 🔑 Link State에서 팀 정보 추출
  const stateTeam = location.state?.team;
  const teamName = stateTeam?.name || `팀 ID ${teamId} (정보 없음)`;

  // ⚽️ [핵심 추가] 변경 사항이 있을 때만 페이지 이동을 막는 Blocker 설정
  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) => isDirty && currentLocation.pathname !== nextLocation.pathname
  );

  // ⚽️ [핵심 수정] Blocker의 상태가 'blocked'일 때 모달을 띄우고, 사용자의 선택에 따라 blocker를 제어합니다.
  // 이 로직은 useEffect 안에서 처리하여 렌더링 중 사이드 이펙트를 방지하고, 무한 알림 버그를 해결합니다.
  useEffect(() => {
    if (blocker.state === 'blocked') {
      if (window.confirm('저장되지 않은 변경사항이 있습니다. 정말로 페이지를 나가시겠습니까?')) {
        blocker.proceed(); // 사용자가 '확인'을 누르면 내비게이션을 계속 진행합니다.
      } else {
        blocker.reset(); // 사용자가 '취소'를 누르면 내비게이션을 중단하고 blocker 상태를 초기화합니다.
      }
    }
  }, [blocker]);

  // 1. 🚨 필수 데이터 (팀 이름)가 없는 경우 즉시 오류 메시지 반환
  if (!stateTeam?.name) {
    return (
      <div className="p-4 text-center text-red-600">
        <h2 className="text-2xl font-bold mb-4">페이지 접근 오류</h2>
        <p>팀 정보가 전달되지 않았습니다. 팀 상세 페이지를 통해 접근해 주세요.</p>
        <button
          onClick={() => navigate('/teams')}
          className="mt-4 py-2 px-4 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600"
        >
          팀 목록으로 이동
        </button>
      </div>
    );
  }

  // 💡 버튼 클릭 핸들러 (뷰 로직)
  const handleReset = () => {
    const isConfirmed = window.confirm(
      '정말로 현재 포메이션을 초기 상태로 되돌리시겠습니까? 저장되지 않은 변경 사항은 손실됩니다.'
    );
    if (isConfirmed) {
      resetFormation(); // 🔑 훅에서 제공하는 초기화 함수 호출
    }
  };

  const handleLoad = () => {
    console.log('포메이션 불러오기 기능 실행');
  };
  const handleSave = () => {
    // 🔑 [핵심] 현재 포메이션 배열의 길이가 11인지 확인
    if (currentFormation.length !== 11) {
      alert('저장할 수 없습니다: 포메이션에는 11명의 선수가 모두 필요합니다.');
      console.warn('저장 실패: 선수 수 불일치');
      return;
    }

    // 🔑 [핵심 수정] dbPlayerId가 null인 요소가 하나라도 있는지 확인합니다.
    const isComplete = currentFormation.every((player) => player.dbPlayerId !== null);

    if (!isComplete) {
      alert('저장할 수 없습니다: 모든 포지션에 선수를 할당해 주세요.');
      return;
    }

    console.log('포메이션 저장 기능 실행');
    // 💡 11명 확인 완료, 이제 API 호출 로직을 여기에 작성합니다.
    // api.saveFormation(teamId, currentFormation);
  };

  return (
    <div className="p-0">
      {/* 🔑 [수정] H2 태그를 flex 컨테이너로 사용하고, 좌우 패딩을 줍니다. */}
      <div className="px-4 mt-1 flex justify-between items-center">
        {/* 1. 팀 이름 (왼쪽 정렬) */}
        <h2 className="text-xl font-bold flex items-center text-gray-800 flex-shrink">
          <Shield className="w-6 h-6 mr-2" />
          {teamName}
        </h2>
        {/* 2. 기능 버튼 그룹 (오른쪽 정렬) */}
        <div className="flex space-x-2">
          {/* 초기화 버튼 */}
          <button
            onClick={handleReset}
            className="p-2 text-sm text-red-500 hover:bg-gray-200 rounded-full transition duration-150"
            aria-label="포메이션 초기화"
          >
            <RotateCcw className="w-5 h-5" />
          </button>

          {/* 불러오기 버튼 */}
          <button
            onClick={handleLoad}
            className="p-2 text-sm hover:bg-gray-200 rounded-full transition duration-150"
            aria-label="포메이션 불러오기"
          >
            <List className="w-5 h-5" />
          </button>
          {/* 저장 버튼 */}
          <button
            onClick={handleSave}
            className="p-2 text-sm text-green-600 hover:bg-green-100 rounded-full transition duration-150"
            aria-label="포메이션 저장"
          >
            <Save className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* 🔑 [배치] 축구장 컴포넌트를 배치합니다. */}
      <div className="mx-auto">
        <FootballPitch ref={setPitchRef}>
          {/* 🔑 11명 선수 아이콘 렌더링 (currentFormation 상태 사용) */}
          {currentFormation.map((player) => {
            return (
              <div
                key={player.id}
                className="absolute"
                // 🔑 [핵심] 드래그 시작 이벤트 핸들러를 이 div로 이동/적용합니다.
                onMouseDown={(e) => handleMouseDown(e, player.id)}
                onTouchStart={(e) => handleMouseDown(e, player.id)} // 모바일 터치 이벤트 대비
                onClick={() => handleSlotClick(player.id, player.posKey)}
                style={{
                  top: `${player.y}%`,
                  left: `${player.x}%`,
                  transform: 'translate(-50%, -50%)',
                  zIndex: player.id === draggingId ? 10 : 1, // 드래그 중인 요소를 위로 올림
                  touchAction: 'pan-y', // ⚽️ 세로 스크롤은 항상 허용
                }}
              >
                <PlayerIcon player={player} shirtColor="bg-blue-600" />
              </div>
            );
          })}
        </FootballPitch>

        {/* 🔑 [핵심] 3. PlayerListPanel Modal 구현 */}
        {activeSlot && (
          <PlayerListModal
            isOpen={!!activeSlot}
            onClose={() => handleSlotClick(null)}
            title={`'${activeSlot.posKey}' 포지션 선수 배정`}
          >
            <PlayerListPanel
              allPlayers={teamPlayers}
              loading={playersLoading}
              // 🔑 클릭된 선수를 activeSlot에 배정하는 함수 연결
              onPlayerClick={(player) => handleAssignPlayer(activeSlot.id, player)}
            />
          </PlayerListModal>
        )}
      </div>
    </div>
  );
};

export default FormationPage;
