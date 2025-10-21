// src/pages/FormationPage.jsx

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import FootballPitch from '../components/FootballPitch'; // 🔑 축구장 컴포넌트 임포트
import PlayerIcon from '../components/PlayerIcon';
import { Shield, RotateCcw, List, Save } from 'lucide-react'; // Trash2, Edit 아이콘 추가
import { SLOT_ZONES_BOUNDS, findZoneKeyByCoordinates, POSITIONS, DEFAULT_PLAYERS } from '../utils/formationConstants';

const FormationPage = ({ teamId }) => {
  const location = useLocation();
  const navigate = useNavigate();

  // 현재 포메이션 상태 (선수 위치 관리를 위함)
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
  const formationRef = useRef(currentFormation); // 🔑 [추가] 핸들러에서 최신 포메이션을 참조하기 위한 ref

  // 💡 포메이션이 변경될 때마다 ref를 업데이트합니다.
  useEffect(() => {
    formationRef.current = currentFormation;
  }, [currentFormation]);

  // 💡 [핵심] 마우스 이동 감지 핸들러
  // 💡 [핵심] 마우스 이동 감지 핸들러
  const handleMouseMove = useCallback(
    (e) => {
      if (e.type === 'mousemove') {
        e.preventDefault();
      }
      const currentDraggingId = draggingIdRef.current;
      // 🔑 [추가] 드래그 중인 선수 정보 확인
      const draggedPlayer = formationRef.current.find((p) => p.id === currentDraggingId);
      const isGK = draggedPlayer && draggedPlayer.position === 'GK';

      if (!currentDraggingId || !pitchRef) return;

      const isTouch = e.type.startsWith('touch');
      if (isTouch && e.touches.length === 0) return;

      // 터치 이벤트(touchmove)인 경우 e.touches[0]에서 좌표를 가져옵니다.
      const clientX = e.type.startsWith('touch') ? e.touches[0].clientX : e.clientX;
      const clientY = e.type.startsWith('touch') ? e.touches[0].clientY : e.clientY;

      const rect = pitchRef.getBoundingClientRect();

      //  [핵심 수정] 구역 경계 대신, 축구장 전체를 기준으로 좌표를 계산합니다.
      // 픽셀 좌표를 백분율(%)로 변환합니다.
      const rawX = ((clientX - rect.left) / rect.width) * 100;
      const rawY = ((clientY - rect.top) / rect.height) * 100;

      // 🔑 [핵심 수정] 아이콘의 실제 픽셀 높이를 기반으로 Y 좌표 제한
      // PlayerIcon의 w-16 h-16은 4rem x 4rem (64px x 64px) 입니다.
      // 포지션 텍스트가 위로 튀어나온 부분을 고려하여 상단 여백을 계산합니다.
      const ICON_HEIGHT_PX = 64; // 아이콘의 기본 높이 (h-16)
      const POSITION_TEXT_OFFSET_PX = 12; // 포지션 텍스트의 상단 오프셋 (top-3)

      // 아이콘의 실제 높이 절반(중심점부터 가장자리까지)을 경기장 높이에 대한 백분율로 변환
      const iconTopMarginPercent = ((ICON_HEIGHT_PX / 2 + POSITION_TEXT_OFFSET_PX) / rect.height) * 100;
      const iconBottomMarginPercent = (ICON_HEIGHT_PX / 2 / rect.height) * 100;
      // ⚽️ [핵심 수정] 가로 너비도 픽셀 기반으로 동적 계산
      const ICON_WIDTH_PX = 64; // 아이콘의 기본 너비 (w-16)
      const iconHalfWidthPercent = (ICON_WIDTH_PX / 2 / rect.width) * 100;

      // ⚽️ [핵심 수정] GK가 아니면 하단 이동 범위를 GK 영역 위쪽으로 제한합니다.
      const maxY = isGK ? 100 - iconBottomMarginPercent : SLOT_ZONES_BOUNDS.GK.minY - iconBottomMarginPercent;

      // 아이콘이 경기장 밖으로 나가지 않도록 좌표를 제한합니다.
      const newX = Math.max(iconHalfWidthPercent, Math.min(100 - iconHalfWidthPercent, rawX));
      // ⚽️ [핵심 변경] 픽셀 기반으로 계산된 여백을 사용하여 Y 좌표를 제한합니다.
      const newY = Math.max(iconTopMarginPercent, Math.min(maxY, rawY));

      const currentZone = findZoneKeyByCoordinates(newX, newY);
      console.log(
        `[ID ${currentDraggingId} 이동] Current Zone: ${currentZone} (X: ${newX.toFixed(1)}, Y: ${newY.toFixed(1)})`
      );

      setCurrentFormation((prevFormation) =>
        prevFormation.map((player) => (player.id === currentDraggingId ? { ...player, x: newX, y: newY } : player))
      );
    },
    [draggingIdRef, pitchRef, formationRef] // 🔑 formationRef 의존성 추가
  );
  // 💡 [추가] 선수 위치 교환 로직
  const handlePlayerSwap = useCallback(
    (draggedPlayerId, targetPlayerId, targetPosKey, originalPosKey, draggedPlayerInitialPos) => {
      setCurrentFormation((prevFormation) => {
        // 1. 타겟 선수의 현재 정보와 드래그된 선수의 현재 위치를 찾습니다.
        const draggedPlayer = prevFormation.find((p) => p.id === draggedPlayerId);
        const targetPlayer = prevFormation.find((p) => p.id === targetPlayerId);

        // 🚨 [핵심 안전성 체크] targetPlayer의 위치가 유효하지 않으면 교환 중단
        // targetPlayer가 존재하지 않거나, x 또는 y가 숫자가 아니면 중단합니다.
        if (
          !draggedPlayer ||
          !targetPlayer ||
          !targetPosKey ||
          !originalPosKey ||
          !draggedPlayerInitialPos ||
          typeof targetPlayer.x !== 'number' || // 🔑 [핵심] 유효성 검사
          typeof targetPlayer.y !== 'number' // 🔑 [핵심] 유효성 검사
        ) {
          // console.error("❌ Invalid swap data. Aborting."); // 디버깅 용
          return prevFormation;
        }

        // 2. 새로운 포메이션 배열 생성
        const newFormation = prevFormation.map((player) => {
          if (player.id === draggedPlayerId) {
            // 🔑 [핵심] 드래그된 선수:
            // - 위치: 타겟 선수의 현재 위치
            // - 포지션: 타겟 구역의 포지션 키(targetPosKey)
            return {
              ...player,
              x: targetPlayer.x,
              y: targetPlayer.y,
              position: targetPosKey, // 🚨 포지션 최신화
              posKey: targetPosKey, // 🚨 posKey 최신화
            };
          }

          if (player.id === targetPlayerId) {
            // 🔑 [핵심] 타겟 선수:
            // - 위치: 드래그된 선수의 시작 위치 (기존 위치)
            // - 포지션: 드래그된 선수의 원래 구역 포지션 키(originalPosKey)

            // 🚨 POSITIONS에서 originalPosKey의 중심 좌표를 가져와야 합니다.
            const origZone = SLOT_ZONES_BOUNDS[originalPosKey];

            if (!origZone) return player; // 안전 장치

            return {
              ...player,
              x: draggedPlayerInitialPos.x, // 🔑 [핵심] 시작 시점의 X 좌표
              y: draggedPlayerInitialPos.y, // 🔑 [핵심] 시작 시점의 Y 좌표
              position: originalPosKey,
              posKey: originalPosKey,
            };
          }
          //console.log(`✨ Player Swap: ID ${draggedPlayerId} <=> ID ${targetPlayerId}`);
          return player;
        });
        return newFormation;
      });
    },
    [] // POSITIONS 상수를 참조하므로 의존성 추가
  );

  // 💡 [핵심] 드래그 시작 핸들러
  const handleMouseDown = useCallback(
    (e, id) => {
      const playerToDrag = currentFormation.find((p) => p.id === id);

      // 골키퍼(GK)는 드래그를 시작할 수 없도록 막습니다.
      if (playerToDrag && playerToDrag.position === 'GK') {
        // 골키퍼는 여기서 드래그 시작 로직을 종료합니다.
        //console.log('⛔️ GK는 드래그하여 위치를 옮길 수 없습니다.');
        return;
      }

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

        // 🔑 [추가] 드롭 시점의 선수 정보 확인
        const droppedPlayer = formationRef.current.find((p) => p.id === finalDraggingId);
        const isDroppedPlayerGK = droppedPlayer && droppedPlayer.position === 'GK';

        const rect = pitchRef.getBoundingClientRect();
        let dropX = ((clientX - rect.left) / rect.width) * 100;
        let dropY = ((clientY - rect.top) / rect.height) * 100;

        // 🔑 [핵심 수정] 드롭 좌표를 경기장 경계 안으로 제한합니다.
        const ICON_HEIGHT_PX = 64;
        const POSITION_TEXT_OFFSET_PX = 12;
        const iconTopMarginPercent = ((ICON_HEIGHT_PX / 2 + POSITION_TEXT_OFFSET_PX) / rect.height) * 100;
        const iconBottomMarginPercent = (ICON_HEIGHT_PX / 2 / rect.height) * 100;
        const ICON_WIDTH_PX = 64;
        const iconHalfWidthPercent = (ICON_WIDTH_PX / 2 / rect.width) * 100;

        // ⚽️ [핵심 수정] 드롭 좌표도 GK 영역 밖으로 제한
        const dropMaxY = isDroppedPlayerGK
          ? 100 - iconBottomMarginPercent
          : SLOT_ZONES_BOUNDS.GK.minY - iconBottomMarginPercent;

        dropX = Math.max(iconHalfWidthPercent, Math.min(100 - iconHalfWidthPercent, dropX));
        dropY = Math.max(iconTopMarginPercent, Math.min(dropMaxY, dropY));

        // 2. 드롭된 좌표가 속한 구역 키 찾기
        const targetPosKey = findZoneKeyByCoordinates(dropX, dropY);
        console.log(
          `[ID ${finalDraggingId} 드롭] Drop Zone: ${targetPosKey} (X: ${dropX.toFixed(1)}, Y: ${dropY.toFixed(1)})`
        );

        // 🔑 [추가] 2. 타겟 선수 찾기 (드롭 위치가 다른 선수 아이콘 근처인지 확인)
        // (선수 아이콘 크기가 5% x 5%라고 가정하고 충돌 판정)
        const TARGET_AREA_THRESHOLD = 5; // % 단위, 아이콘 크기
        const targetPlayer = currentFormation.find((player) => {
          if (player.id === finalDraggingId) return false; // 자기 자신 제외
          if (player.position === 'GK') return false; // GK는 교환 대상에서 제외

          // 드롭 좌표와 타겟 선수 좌표 간의 거리가 임계값 이내인지 확인
          const dx = Math.abs(player.x - dropX);
          const dy = Math.abs(player.y - dropY);

          return dx < TARGET_AREA_THRESHOLD && dy < TARGET_AREA_THRESHOLD;
        });

        // 🔑 4. 원래 구역 키 찾기 (교환 로직에서 필요)
        const originalPosKey = initialPosition ? findZoneKeyByCoordinates(initialPosition.x, initialPosition.y) : null;

        // 🔑 [핵심 로직 분기] 요청하신 세 가지 규칙 적용
        if (targetPlayer && targetPosKey && originalPosKey) {
          // Case 1: 구역에 선수가 있고 겹쳤으면 스왑
          handlePlayerSwap(finalDraggingId, targetPlayer.id, targetPosKey, originalPosKey, initialPosition);
          console.log(`✨ 선수 교환 (아이콘 겹침): ${originalPosKey} ↔️ ${targetPosKey}`);
        } else if (targetPosKey) {
          // 🔑 [핵심 수정] Case 2: 드롭한 구역이 비어있는지 확인
          const occupyingPlayer = currentFormation.find((p) => p.posKey === targetPosKey && p.id !== finalDraggingId);

          if (occupyingPlayer && occupyingPlayer.position !== 'GK') {
            // 2-1. 🔑 [핵심 변경] 구역이 점유되었고, GK가 아니면 스왑
            handlePlayerSwap(finalDraggingId, occupyingPlayer.id, targetPosKey, originalPosKey, initialPosition);
            console.log(`✨ 선수 교환 (빈 구역 드롭): ${originalPosKey} ↔️ ${targetPosKey}`);
          } else if (!occupyingPlayer) {
            // 2-2. 빈 구역임 -> 위치와 포지션 업데이트
            setCurrentFormation((prevFormation) =>
              prevFormation.map((player) =>
                player.id === finalDraggingId
                  ? { ...player, x: dropX, y: dropY, position: targetPosKey, posKey: targetPosKey }
                  : player
              )
            );
            console.log(`✅ 빈 구역 ${targetPosKey}으로 이동.`);
          } else {
            // 2-3. GK가 있는 구역이거나 다른 이유로 이동 불가 -> 원래 위치로 복귀
            setCurrentFormation((prevFormation) =>
              prevFormation.map((player) =>
                player.id === finalDraggingId ? { ...player, x: initialPosition.x, y: initialPosition.y } : player
              )
            );
            console.log(`❌ ${targetPosKey} 구역으로 이동할 수 없습니다. 원래 위치로 복귀.`);
          }
        } else {
          // Case 3: 🔑 [핵심 수정] 구역 밖에서 드롭한 경우 -> 원래 위치로 복귀
          setCurrentFormation((prevFormation) =>
            prevFormation.map((player) =>
              player.id === finalDraggingId ? { ...player, x: initialPosition.x, y: initialPosition.y } : player
            )
          );
          //console.log('❌ 구역 밖 드롭. 원래 위치로 복귀.');
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
    // 현재 포메이션 상태 (선수 위치 관리를 위함)
    const isConfirmed = window.confirm(
      '정말로 현재 포메이션을 초기 상태로 되돌리시겠습니까? 저장되지 않은 변경 사항은 손실됩니다.'
    );

    if (!isConfirmed) {
      console.log('포메이션 초기화가 취소되었습니다.');
      return; // 사용자가 '취소'를 누르면 여기서 함수 종료
    }
    setCurrentFormation(() => {
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
