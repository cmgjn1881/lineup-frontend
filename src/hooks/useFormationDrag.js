// src/hooks/useFormationDrag.js

import { useState, useCallback, useRef, useEffect } from 'react';
// 💡 constants는 FormationPage와 동일한 경로에서 import해야 합니다. (utils/formationConstants 파일이 존재한다고 가정)
import { SLOT_ZONES_BOUNDS, findZoneKeyByCoordinates, POSITIONS, DEFAULT_PLAYERS } from '../utils/formationConstants';

// 🔑 [도우미 함수] 초기 포메이션 데이터 준비
const calculateInitialFormation = () => {
  return DEFAULT_PLAYERS.map((player, index) => {
    const [y, x] = POSITIONS[player.posKey];
    return {
      ...player,
      id: index + 1, // 고유 ID 부여
      dbPlayerId: null, // 🔑 [추가] DB 선수가 할당되면 여기에 실제 ID를 저장
      x: x, // 초기 X 좌표 (%)
      y: y, // 초기 Y 좌표 (%)
    };
  });
};

export const useFormationDrag = () => {
  // 1. 상태 및 Ref 정의
  const [currentFormation, setCurrentFormation] = useState(calculateInitialFormation);
  const [draggingId, setDraggingId] = useState(null);
  const [pitchRef, setPitchRef] = useState(null);

  const draggingIdRef = useRef(null);
  const startPositionRef = useRef(null);
  const formationRef = useRef(currentFormation); // 최신 포메이션 상태 참조

  // 💡 포메이션이 변경될 때마다 ref를 업데이트합니다.
  useEffect(() => {
    formationRef.current = currentFormation;
  }, [currentFormation]);

  // 2. 💡 [추가] 선수 위치 교환 로직 (handlePlayerSwap)
  const handlePlayerSwap = useCallback(
    (draggedPlayerId, targetPlayerId, targetPosKey, originalPosKey, draggedPlayerInitialPos) => {
      setCurrentFormation((prevFormation) => {
        const draggedPlayer = prevFormation.find((p) => p.id === draggedPlayerId);
        const targetPlayer = prevFormation.find((p) => p.id === targetPlayerId);

        // 🚨 [핵심 안전성 체크] 유효성 검사
        if (!draggedPlayer || !targetPlayer || !targetPosKey || !originalPosKey || typeof targetPlayer.x !== 'number') {
          return prevFormation;
        }

        const newFormation = prevFormation.map((player) => {
          if (player.id === draggedPlayerId) {
            return {
              ...player,
              x: targetPlayer.x,
              y: targetPlayer.y,
              position: targetPosKey,
              posKey: targetPosKey,
            };
          }
          if (player.id === targetPlayerId) {
            const origZone = SLOT_ZONES_BOUNDS[originalPosKey]; // SLOT_ZONES_BOUNDS 참조

            if (!origZone) return player;

            return {
              ...player,
              x: draggedPlayerInitialPos.x,
              y: draggedPlayerInitialPos.y,
              position: originalPosKey,
              posKey: originalPosKey,
            };
          }
          return player;
        });
        console.log(`Swapped Player ID ${draggedPlayerId} with Player ID ${targetPlayerId}`);
        return newFormation;
      });
    },
    [] // SLOT_ZONES_BOUNDS 등 상수는 외부에서 가져왔고 변하지 않는다고 가정
  );

  // 3. 💡 [핵심] 마우스 이동 감지 핸들러 (handleMouseMove)
  const handleMouseMove = useCallback(
    (e) => {
      const currentDraggingId = draggingIdRef.current;
      if (!currentDraggingId || !pitchRef) return;

      // 💡 [스크롤 방지] touchmove 이벤트에서 스크롤 차단
      const isTouch = e.type.startsWith('touch');
      if (e.type === 'touchmove') {
        // 🚨 [필수] 브라우저 스크롤을 막습니다. (passive: false 덕분에 작동함)
        e.preventDefault();
      }

      const draggedPlayer = formationRef.current.find((p) => p.id === currentDraggingId);
      const isGK = draggedPlayer && draggedPlayer.position === 'GK';

      const clientX = isTouch ? e.touches[0].clientX : e.clientX;
      const clientY = isTouch ? e.touches[0].clientY : e.clientY;

      const rect = pitchRef.getBoundingClientRect();
      const rawX = ((clientX - rect.left) / rect.width) * 100;
      const rawY = ((clientY - rect.top) / rect.height) * 100;

      // 🚨 [경계 계산 상수]
      const ICON_HEIGHT_PX = 64;
      const POSITION_TEXT_OFFSET_PX = 12;

      const iconTopMarginPercent = ((ICON_HEIGHT_PX / 2 + POSITION_TEXT_OFFSET_PX) / rect.height) * 100;
      const iconHalfWidthPercent = (ICON_HEIGHT_PX / 2 / rect.width) * 100;
      const iconBottomMarginPercent = (ICON_HEIGHT_PX / 2 / rect.height) * 100;

      // GK 영역 제한 상수 참조 및 경계 제한 계산
      const dropMaxY = isGK ? 100 - iconBottomMarginPercent : SLOT_ZONES_BOUNDS.GK.minY - iconBottomMarginPercent;

      const newX = Math.max(iconHalfWidthPercent, Math.min(100 - iconHalfWidthPercent, rawX));
      const newY = Math.max(iconTopMarginPercent, Math.min(dropMaxY, rawY));

      setCurrentFormation((prevFormation) =>
        prevFormation.map((player) => (player.id === currentDraggingId ? { ...player, x: newX, y: newY } : player))
      );
    },
    [draggingIdRef, pitchRef, formationRef]
  );

  // 4. 💡 [핵심] 드래그 종료/드롭 처리 핸들러 (handleMouseUp)
  const handleMouseUp = useCallback(
    (event) => {
      const finalDraggingId = draggingIdRef.current;
      const initialPosition = startPositionRef.current;

      // 1. 드래그 종료 상태 업데이트 (클린업 시작)
      setDraggingId(null);
      draggingIdRef.current = null;
      startPositionRef.current = null;

      // 2. [필수] 전역 이벤트 리스너 제거
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleMouseMove);
      window.removeEventListener('touchend', handleMouseUp);

      if (!finalDraggingId || !initialPosition) return;

      // 3. 드롭 좌표 계산
      const clientX = event.type.startsWith('touch') ? event.changedTouches[0].clientX : event.clientX;
      const clientY = event.type.startsWith('touch') ? event.changedTouches[0].clientY : event.clientY;

      const rect = pitchRef.getBoundingClientRect();
      let dropX = ((clientX - rect.left) / rect.width) * 100;
      let dropY = ((clientY - rect.top) / rect.height) * 100;

      // 4. 드롭 로직 전체 (경계 제한 및 교환/복귀)
      const droppedPlayer = formationRef.current.find((p) => p.id === finalDraggingId);
      const isDroppedPlayerGK = droppedPlayer && droppedPlayer.position === 'GK';

      const ICON_HEIGHT_PX = 64;
      const POSITION_TEXT_OFFSET_PX = 12;
      const iconTopMarginPercent = ((ICON_HEIGHT_PX / 2 + POSITION_TEXT_OFFSET_PX) / rect.height) * 100;
      const iconBottomMarginPercent = (ICON_HEIGHT_PX / 2 / rect.height) * 100;
      const ICON_WIDTH_PX = 64;
      const iconHalfWidthPercent = (ICON_WIDTH_PX / 2 / rect.width) * 100;

      const dropMaxY = isDroppedPlayerGK
        ? 100 - iconBottomMarginPercent
        : SLOT_ZONES_BOUNDS.GK.minY - iconBottomMarginPercent;

      dropX = Math.max(iconHalfWidthPercent, Math.min(100 - iconHalfWidthPercent, dropX));
      dropY = Math.max(iconTopMarginPercent, Math.min(dropMaxY, dropY));

      const targetPosKey = findZoneKeyByCoordinates(dropX, dropY);

      const TARGET_AREA_THRESHOLD = 5;
      const targetPlayer = currentFormation.find((player) => {
        if (player.id === finalDraggingId) return false;
        if (player.position === 'GK') return false;
        const dx = Math.abs(player.x - dropX);
        const dy = Math.abs(player.y - dropY);
        return dx < TARGET_AREA_THRESHOLD && dy < TARGET_AREA_THRESHOLD;
      });

      const originalPosKey = initialPosition ? findZoneKeyByCoordinates(initialPosition.x, initialPosition.y) : null;

      if (targetPlayer && targetPosKey && originalPosKey) {
        // Case 1: 스왑 (아이콘 겹침)
        handlePlayerSwap(finalDraggingId, targetPlayer.id, targetPosKey, originalPosKey, initialPosition);
      } else if (targetPosKey) {
        // Case 2: 구역 드롭
        const occupyingPlayer = formationRef.current.find((p) => p.posKey === targetPosKey && p.id !== finalDraggingId);

        if (occupyingPlayer && occupyingPlayer.position !== 'GK') {
          // 2-1. 구역 점유 시 스왑
          handlePlayerSwap(finalDraggingId, occupyingPlayer.id, targetPosKey, originalPosKey, initialPosition);
        } else if (!occupyingPlayer) {
          // 2-2. 빈 구역 이동
          setCurrentFormation((prevFormation) =>
            prevFormation.map((player) =>
              player.id === finalDraggingId
                ? { ...player, x: dropX, y: dropY, position: targetPosKey, posKey: targetPosKey }
                : player
            )
          );
          console.log(`Player ID ${finalDraggingId} moved to empty zone ${targetPosKey}`);
        } else {
          // 2-3. GK 구역 등 이동 불가 -> 원래 위치 복귀
          setCurrentFormation((prevFormation) =>
            prevFormation.map((player) =>
              player.id === finalDraggingId ? { ...player, x: initialPosition.x, y: initialPosition.y } : player
            )
          );
        }
      } else {
        // Case 3: 구역 밖 드롭 -> 원래 위치 복귀
        setCurrentFormation((prevFormation) =>
          prevFormation.map((player) =>
            player.id === finalDraggingId ? { ...player, x: initialPosition.x, y: initialPosition.y } : player
          )
        );
      }
    },
    [handleMouseMove, pitchRef, currentFormation, handlePlayerSwap, SLOT_ZONES_BOUNDS] // 🔑 의존성 추가
  );

  // 5. 💡 [핵심] 드래그 시작 핸들러 (handleMouseDown)
  const handleMouseDown = useCallback(
    (e, id) => {
      const playerToDrag = formationRef.current.find((p) => p.id === id);

      if (playerToDrag && playerToDrag.position === 'GK') return;

      if (e.type === 'mousedown') {
        e.preventDefault();
      }

      console.log('Drag started for player ID:', id);

      if (playerToDrag) {
        startPositionRef.current = { x: playerToDrag.x, y: playerToDrag.y };
      }

      setDraggingId(id);
      draggingIdRef.current = id;

      // 리스너 등록
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchmove', handleMouseMove, { passive: false });
      window.addEventListener('touchend', handleMouseUp);
    },
    [handleMouseMove, handleMouseUp]
  );

  // 6. 💡 [클린업] 컴포넌트 언마운트 시 전역 이벤트 리스너 정리
  useEffect(() => {
    const handleMove = handleMouseMove;
    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('touchmove', handleMove);
      // mouseup/touchend는 handleMouseUp 내부에서 정리되므로 move 이벤트만 정리
    };
  }, [handleMouseMove]);

  // 7. 💡 [리셋 함수] 초기 포메이션 상태로 되돌립니다.
  const resetFormation = useCallback(() => {
    setCurrentFormation(calculateInitialFormation());
  }, []);

  return {
    currentFormation,
    draggingId,
    pitchRef,
    setPitchRef,
    handleMouseDown,
    handlePlayerSwap,
    resetFormation,
  };
};
