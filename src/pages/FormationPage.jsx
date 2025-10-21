// src/pages/FormationPage.jsx

import React, { useState, useCallback, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import FootballPitch from '../components/FootballPitch'; // 🔑 축구장 컴포넌트 임포트
import PlayerIcon from '../components/PlayerIcon';
import { Shield, RotateCcw, List, Save } from 'lucide-react'; // Trash2, Edit 아이콘 추가

// Y축(세로)은 0% (골대)에서 100% (반대편 골대)까지이며, 골키퍼는 Y=90% 근처에 배치
const POSITIONS = {
  // [Y축, X축]
  GK: [90, 50],

  // 4백 (수비 라인: Y=75%)
  RB: [75, 10], // 라이트 백
  RCB: [75, 40], // 중앙 수비 우
  LCB: [75, 60], // 중앙 수비 좌
  LB: [75, 90], // 레프트 백

  // 3선 (미드필더 수비형: Y=50%)
  RCM: [50, 20], // 중앙 미드필더 우
  CDM: [50, 50], // 수비형 미드필더
  LCM: [50, 80], // 중앙 미드필더 좌

  // 3톱 (공격 라인: Y=25%)
  RW: [25, 15], // 라이트 윙
  ST: [25, 50], // 스트라이커
  LW: [25, 85], // 레프트 윙
};

// 💡 임시 선수 데이터 (나중에 실제 players 상태로 대체해야 합니다)
const DEFAULT_PLAYERS = [
  { name: 'S. K.', position: 'GK', backNumber: 1, posKey: 'GK' },
  { name: 'C. M.', position: 'RB', backNumber: 2, posKey: 'RB' },
  { name: 'K. Y.', position: 'RCB', backNumber: 4, posKey: 'RCB' },
  { name: 'J. H.', position: 'LCB', backNumber: 19, posKey: 'LCB' },
  { name: 'K. T.', position: 'LB', backNumber: 3, posKey: 'LB' },
  { name: 'J. S.', position: 'RCM', backNumber: 8, posKey: 'RCM' },
  { name: 'H. B.', position: 'CDM', backNumber: 6, posKey: 'CDM' },
  { name: 'W. Y.', position: 'LCM', backNumber: 15, posKey: 'LCM' },
  { name: 'J. L.', position: 'RW', backNumber: 11, posKey: 'RW' },
  { name: 'H. M.', position: 'ST', backNumber: 9, posKey: 'ST' },
  { name: 'S. M.', position: 'LW', backNumber: 7, posKey: 'LW' },
];

const FormationPage = ({ teamId }) => {
  const location = useLocation();
  const navigate = useNavigate();

  // 🔑 [추가] 현재 포메이션 상태 (선수 위치 관리를 위함)
  const [currentFormation, setCurrentFormation] = useState(() => {
    // DEFAULT_PLAYERS에 고유 ID를 부여하고, POSITIONS와 결합하여 초기 상태 설정
    return DEFAULT_PLAYERS.map((player, index) => {
      const [y, x] = POSITIONS[player.posKey];
      return {
        ...player,
        id: index + 1, // 고유 ID 부여
        x: x, // 초기 X 좌표 (%)
        y: y, // 초기 Y 좌표 (%)
      };
    });
  });

  // 🔑 [추가] 드래그 상태 관리
  const [draggingId, setDraggingId] = useState(null);
  const draggingIdRef = useRef(null);
  const startPositionRef = useRef(null);
  const [pitchRef, setPitchRef] = useState(null); // 축구장 DOM 요소를 참조

  // 💡 [핵심] 마우스 이동 감지 핸들러
  const handleMouseMove = useCallback(
    (e) => {
      // 🔑 [필수] 브라우저의 기본 동작 (스크롤, 이미지 드래그 등)을 막습니다.
      e.preventDefault();
      const currentDraggingId = draggingIdRef.current;
      if (!currentDraggingId || !pitchRef) return;

      // 🚨 디버깅용 로그 추가
      console.log('🔄 Dragging...');

      const isTouch = e.type.startsWith('touch');

      if (isTouch && e.touches.length === 0) return;

      // 터치 이벤트(touchmove)인 경우 e.touches[0]에서 좌표를 가져옵니다.
      const clientX = e.type.startsWith('touch') ? e.touches[0].clientX : e.clientX;
      const clientY = e.type.startsWith('touch') ? e.touches[0].clientY : e.clientY;

      // 1. 축구장 영역의 위치 및 크기 계산
      const rect = pitchRef.getBoundingClientRect();

      const MIN_X = 8;
      const MAX_X = 92;

      const MIN_Y = 8;
      const MAX_Y = 85;

      // 2. 축구장 내부에서의 마우스 상대 좌표 (픽셀)
      const mouseX = clientX - rect.left;
      const mouseY = clientY - rect.top;

      // 3. 픽셀 좌표를 백분율(%)로 변환 (MIN_X, MIN_Y ~ MAX_X, MAX_Y 범위로 제한)
      let newX = Math.max(MIN_X, Math.min(MAX_X, (mouseX / rect.width) * 100));
      let newY = Math.max(MIN_Y, Math.min(MAX_Y, (mouseY / rect.height) * 100));

      // 4. 상태 업데이트
      setCurrentFormation((prevFormation) =>
        prevFormation.map((player) => (player.id === currentDraggingId ? { ...player, x: newX, y: newY } : player))
      );
    },
    [draggingIdRef, pitchRef]
  );

  // 💡 [추가] 선수 위치 교환 로직
  const handlePlayerSwap = useCallback(
    (draggedPlayerId, targetPlayerId, draggedPlayerInitialPos) => {
      setCurrentFormation((prevFormation) => {
        // 1. 타겟 선수의 현재 정보를 찾습니다.
        const targetPlayer = prevFormation.find((p) => p.id === targetPlayerId);

        if (!targetPlayer || !draggedPlayerInitialPos) {
          return prevFormation; // 예외 처리
        }

        // 2. 두 선수의 x, y 좌표를 교환합니다.
        const newFormation = prevFormation.map((player) => {
          if (player.id === draggedPlayerId) {
            // 드래그된 선수는 타겟 선수의 위치를 갖습니다.
            return { ...player, x: targetPlayer.x, y: targetPlayer.y };
          }
          if (player.id === targetPlayerId) {
            // 타겟 선수는 드래그된 선수의 위치를 갖습니다.
            return { ...player, x: draggedPlayerInitialPos.x, y: draggedPlayerInitialPos.y };
          }
          return player;
        });

        console.log(`✨ Player Swap: ID ${draggedPlayerId} <=> ID ${targetPlayerId}`);
        return newFormation;
      });
    },
    [] // 이 함수는 상태 업데이트 함수를 호출하므로 의존성이 필요 없습니다.
  );

  // 💡 [핵심] 드래그 시작 핸들러
  const handleMouseDown = useCallback(
    (e, id) => {
      const playerToDrag = currentFormation.find((p) => p.id === id);

      // 골키퍼(GK)는 드래그를 시작할 수 없도록 막습니다.
      if (playerToDrag && playerToDrag.position === 'GK') {
        // 골키퍼는 여기서 드래그 시작 로직을 종료합니다.
        console.log('⛔️ GK는 드래그하여 위치를 옮길 수 없습니다.');
        return;
      }

      if (e.type === 'mousedown') {
        e.preventDefault();
      }
      // 🔑 [핵심 수정] 터치 이벤트의 기본 스크롤 동작을 막습니다.
      console.log('✅ DRAG START - Player ID:', id);

      // 🔑 [추가] 드래그 시작 선수의 현재 위치 저장

      if (playerToDrag) {
        startPositionRef.current = { x: playerToDrag.x, y: playerToDrag.y };
      }

      setDraggingId(id); // 드래그 시작 선수 ID 설정
      draggingIdRef.current = id;

      // 🚨 [핵심 수정] 드래그 중 마우스 떼기 핸들러를 handleMouseDown 내부에서 정의
      const stopDrag = (event) => {
        const finalDraggingId = draggingIdRef.current;
        const initialPosition = startPositionRef.current; // 💡 시작 위치 가져오기

        setDraggingId(null);
        draggingIdRef.current = null;
        startPositionRef.current = null; // Ref 초기화

        // 🔑 [추가] 1. 드롭된 좌표 계산 (마우스 떼는 순간의 좌표)
        const clientX = event.type.startsWith('touch') ? event.changedTouches[0].clientX : event.clientX;
        const clientY = event.type.startsWith('touch') ? event.changedTouches[0].clientY : event.clientY;

        const rect = pitchRef.getBoundingClientRect();
        const dropX = ((clientX - rect.left) / rect.width) * 100;
        const dropY = ((clientY - rect.top) / rect.height) * 100;

        // 🔑 [추가] 2. 타겟 선수 찾기 (드롭 위치가 다른 선수 아이콘 근처인지 확인)
        // (선수 아이콘 크기가 5% x 5%라고 가정하고 충돌 판정)
        const TARGET_AREA_THRESHOLD = 5; // % 단위, 아이콘 크기
        const targetPlayer = currentFormation.find((player) => {
          // 드래그된 선수는 제외
          if (player.id === finalDraggingId) return false;

          // 드롭 좌표와 타겟 선수 좌표 간의 거리가 임계값 이내인지 확인
          const dx = Math.abs(player.x - dropX);
          const dy = Math.abs(player.y - dropY);

          return dx < TARGET_AREA_THRESHOLD && dy < TARGET_AREA_THRESHOLD;
        });

        // 🔑 [핵심 수정] 3. 분리된 조건문 로직 적용
        if (targetPlayer && targetPlayer.position === 'GK' && initialPosition) {
          // Case 1: 타겟이 GK일 경우 -> 드래그 시작 위치로 복귀
          setCurrentFormation((prevFormation) =>
            prevFormation.map((player) =>
              player.id === finalDraggingId ? { ...player, x: initialPosition.x, y: initialPosition.y } : player
            )
          );
          console.log('⛔️ GK 위치에 드롭하여 시작 위치로 복귀됨.');
        } else if (targetPlayer && initialPosition) {
          // Case 2: 타겟이 필드 선수일 경우 -> 위치 교환
          // 타겟 선수가 존재하고, GK가 아닐 경우 (position !== 'GK'), 교환 로직 실행
          handlePlayerSwap(finalDraggingId, targetPlayer.id, initialPosition);
          console.log('✨ 선수 교환 완료.');
        } else {
          // Case 3: 타겟이 없을 경우 -> 드롭 위치에 그대로 배치 (기존 로직 유지)
          console.log('드롭 위치에 다른 선수가 없어 드래그된 위치에 배치됨.');
        }

        // 등록된 리스너를 정확히 제거 (클로저를 활용)
        window.removeEventListener('mousemove', handleMove);
        window.removeEventListener('mouseup', stopDrag);
        window.removeEventListener('touchmove', handleMove);
        window.removeEventListener('touchend', stopDrag);
      };

      const handleMove = handleMouseMove;
      // 드래그 시작 시 전역 이벤트 리스너 등록
      window.addEventListener('mousemove', handleMove);
      window.addEventListener('mouseup', stopDrag);
      window.addEventListener('touchmove', handleMove, { passive: false });
      window.addEventListener('touchend', stopDrag);
    },
    [handleMouseMove, pitchRef, currentFormation, handlePlayerSwap]
  );

  // 🔑 Link State에서 팀 정보 추출
  const stateTeam = location.state?.team;

  // 🔑 팀 이름 결정: State에 이름이 있으면 사용, 없으면 '정보 없음'으로 처리
  const teamName = stateTeam?.name || `팀 ID ${teamId} (정보 없음)`;

  // 1. 🚨 필수 데이터 (팀 이름)가 없는 경우 즉시 오류 메시지 반환
  // 팀 이름을 가져오는 API 로직을 제거했으므로, state에 이름이 없으면 유효하지 않은 접근으로 간주합니다.
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

  // 💡 버튼 클릭 핸들러 (기능은 콘솔 로그로 대체)
  const handleReset = () => {
    console.log('포메이션 초기화 기능 실행');
  };
  const handleLoad = () => {
    console.log('포메이션 불러오기 기능 실행');
  };
  const handleSave = () => {
    console.log('포메이션 저장 기능 실행');
  };

  return (
    <div className="p-0">
      {/* 🔑 [수정] H2 태그를 flex 컨테이너로 사용하고, 좌우 패딩을 줍니다. */}
      <div className="px-4 mb-1 flex justify-between items-center">
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
                style={{
                  top: `${player.y}%`,
                  left: `${player.x}%`,
                  transform: 'translate(-50%, -50%)',
                  zIndex: player.id === draggingId ? 10 : 1, // 드래그 중인 요소를 위로 올림
                  touchAction: 'none', // 터치 장치에서 기본 동작 방지
                }}
                // 🔑 [핵심] 드래그 시작 이벤트 핸들러 연결
                onMouseDown={(e) => handleMouseDown(e, player.id)}
                onTouchStart={(e) => handleMouseDown(e, player.id)} // 모바일 터치 이벤트 대비
              >
                <PlayerIcon player={player} shirtColor="bg-blue-600" />
              </div>
            );
          })}
        </FootballPitch>
      </div>

      <div className="mt-4 text-center text-gray-500 text-sm">
        여기에 포메이션 설정 및 선수 드래그앤드롭 기능이 들어갈 예정입니다.
      </div>
    </div>
  );
};

export default FormationPage;
