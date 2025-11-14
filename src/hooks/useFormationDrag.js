// src/hooks/useFormationDrag.js

import { useState, useCallback, useRef, useEffect } from 'react';
// 💡 constants는 FormationPage와 동일한 경로에서 import해야 합니다.
import { SLOT_ZONES_BOUNDS, findZoneKeyByCoordinates, POSITIONS, DEFAULT_PLAYERS } from '../utils/formationConstants';

// 🔑 [도우미 함수] 초기 포메이션 데이터 준비
const calculateInitialFormation = () => {
  return DEFAULT_PLAYERS.map((player, index) => {
    const [y, x] = POSITIONS[player.posKey];
    return {
      ...player,
      id: index + 1,
      dbPlayerId: null, // DB 선수가 할당되면 여기에 실제 ID를 저장
      x: x, // 초기 X 좌표 (%)
      y: y, // 초기 Y 좌표 (%)
    };
  });
};

export const useFormationDrag = () => {
  // 1. 상태 및 Ref 정의
  const [initialFormation] = useState(calculateInitialFormation);
  const [formationsByQuarter, setFormationsByQuarter] = useState({
    1: calculateInitialFormation(),
  });
  const [activeQuarter, setActiveQuarter] = useState(1);
  const [draggingId, setDraggingId] = useState(null);
  const [activeSlot, setActiveSlot] = useState(null);
  const [pitchRef, setPitchRef] = useState(null);
  const [isDirty, setIsDirty] = useState(false);

  const draggingIdRef = useRef(null);
  const isDraggingRef = useRef(false);
  const startPositionRef = useRef(null);
  const formationRef = useRef(formationsByQuarter, activeQuarter);

  const resetIsDirty = useCallback(() => {
    setIsDirty(false);
  }, []);

  // ⭐️ [개선 제안] 쿼터 변경 및 자동 생성 로직
  const handleQuarterChange = useCallback((quarter) => {
    setFormationsByQuarter((prev) => {
      // 만약 클릭한 쿼터에 아직 포메이션 데이터가 없다면,
      // 초기 포메이션을 생성하여 추가합니다.
      if (!prev[quarter]) {
        return { ...prev, [quarter]: calculateInitialFormation() };
      }
      return prev; // 이미 데이터가 있으면 상태를 변경하지 않습니다.
    });
    setActiveQuarter(quarter); // 활성 쿼터를 변경합니다.
  }, []);
  useEffect(() => {
    const isDirty = JSON.stringify(formationsByQuarter) !== JSON.stringify({ 1: initialFormation });
    setIsDirty(isDirty);
  }, [formationsByQuarter, initialFormation]);

  useEffect(() => {
    formationRef.current = formationsByQuarter[activeQuarter] || [];
  }, [formationsByQuarter, activeQuarter]);

  // [핵심 추가] 외부에서 포메이션 데이터를 받아 상태를 업데이트하는 함수
  const loadFormation = useCallback(
    (loadedPlacements, allPlayers) => {
      // 1. 쿼터별로 그룹화할 객체 초기화
      const newFormationsByQuarter = {};

      // 2. 서버에서 받은 placements 배열을 순회
      loadedPlacements.forEach((p) => {
        const quarter = p.quarter; // 백엔드 데이터의 quarter 필드 사용
        const playerInfo = allPlayers.find((player) => player.id === p.playerId);

        // 3. 해당 쿼터의 배열이 없으면 새로 생성
        if (!newFormationsByQuarter[quarter]) {
          newFormationsByQuarter[quarter] = [];
        }

        // [수정] 서버 좌표(0-1000)를 경기장 좌표(0-100)로 먼저 변환합니다.
        const newX = p.coordX / 10;
        const newY = p.coordY / 10;

        // [수정] 서버 데이터(p)와 선수 정보(playerInfo)를 조합하여 상태 객체를 만듭니다.
        const positionKey = findZoneKeyByCoordinates(newX, newY); // 변환된 좌표로 포지션을 찾습니다.
        newFormationsByQuarter[quarter].push({
          id: newFormationsByQuarter[quarter].length + 1,
          dbPlayerId: p.playerId,
          name: p.playerName || playerInfo?.name || 'Unknown',
          backNumber: p.playerBackNumber || playerInfo?.backNumber,
          position: positionKey,
          posKey: positionKey,
          x: newX,
          y: newY,
        });
      });

      // 5. 그룹화된 객체로 상태 업데이트
      setFormationsByQuarter(newFormationsByQuarter);

      // [추가] 불러오기가 완료되면 isDirty 상태를 false로 초기화합니다.
      resetIsDirty();

      // 6. 불러온 후 첫 번째 쿼터를 활성화
      const firstQuarter = Object.keys(newFormationsByQuarter)[0] || 1;
      setActiveQuarter(parseInt(firstQuarter));

      console.log('✅ 포메이션 로드 완료 (쿼터별 그룹화):', newFormationsByQuarter);
    },
    [resetIsDirty]
  );

  // 2. 💡 [추가] 슬롯 클릭 및 배정 핸들러
  const handleSlotClick = useCallback((id, posKey) => {
    if (isDraggingRef.current) {
      return;
    }

    if (id === null) {
      setActiveSlot(null);
      return;
    }

    setActiveSlot((prev) => (prev?.id === id ? null : { id, posKey }));
  }, []);

  const handleAssignPlayer = useCallback(
    (slotId, player) => {
      setFormationsByQuarter((prevFormation) => ({
        ...prevFormation,
        [activeQuarter]: prevFormation[activeQuarter].map((p) =>
          p.id === slotId
            ? {
                ...p,
                dbPlayerId: player.id || null,
                name: player.name || 'PLAYER',
                backNumber: player.backNumber || player.number || '+',
                //position: player.position, // 포지션은 변경하지 않음
                posKey: p.posKey,
              }
            : p
        ),
      }));
      setActiveSlot(null); // 배정 후 모달 닫기
    },
    [activeQuarter]
  );

  // [추가] 선수 위치 교환 로직 (handlePlayerSwap)
  const handlePlayerSwap = useCallback(
    (draggedPlayerId, targetPlayerId, targetPosKey, originalPosKey, draggedPlayerInitialPos) => {
      setFormationsByQuarter((prev) => {
        const formationToUpdate = prev[activeQuarter];
        if (!formationToUpdate) return prev; // 안전장치

        const draggedPlayer = formationToUpdate.find((p) => p.id === draggedPlayerId);
        const targetPlayer = formationToUpdate.find((p) => p.id === targetPlayerId);

        // [핵심 안전성 체크] 유효성 검사
        if (!draggedPlayer || !targetPlayer || !targetPosKey || !originalPosKey || typeof targetPlayer.x !== 'number') {
          return prev;
        }

        const newFormation = formationToUpdate.map((player) => {
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
        return { ...prev, [activeQuarter]: newFormation };
      });
    },
    [activeQuarter]
  );

  // [핵심] 마우스 이동 감지 핸들러 (handleMouseMove)
  const handleMouseMove = useCallback(
    (e) => {
      const currentDraggingId = draggingIdRef.current;
      if (!currentDraggingId || !pitchRef) return;

      // [핵심 수정] 드래그 중 스크롤 방지 로직 강화
      // 이벤트가 취소 가능할 때만 preventDefault를 호출하여 오류를 방지하고, 스크롤을 확실하게 막습니다.
      if (e.cancelable) {
        e.preventDefault();
      }

      const draggedPlayer = formationRef.current.find((p) => p.id === currentDraggingId);
      const isGK = draggedPlayer && draggedPlayer.position === 'GK';

      const isTouch = e.type.startsWith('touch');
      const clientX = isTouch ? e.touches[0].clientX : e.clientX;
      const clientY = isTouch ? e.touches[0].clientY : e.clientY;

      // [추가] 드래그 임계값(threshold) 로직
      // 사용자가 선수를 잡고 일정 거리 이상 움직였을 때만 드래그로 간주합니다.
      if (!isDraggingRef.current) {
        const startPos = startPositionRef.current;
        if (startPos) {
          const dx = Math.abs(clientX - startPos.clientX);
          const dy = Math.abs(clientY - startPos.clientY);
          // 3px 이상 움직이면 드래그로 확정
          if (dx > 3 || dy > 3) {
            isDraggingRef.current = true;
          } else {
            // 임계값 미만이면 아무것도 하지 않음 (스크롤 허용)
            return;
          }
        }
      }

      const rect = pitchRef.getBoundingClientRect();
      const rawX = ((clientX - rect.left) / rect.width) * 100;
      const rawY = ((clientY - rect.top) / rect.height) * 100;

      // [경계 계산 상수]
      const ICON_HEIGHT_PX = 64;
      const POSITION_TEXT_OFFSET_PX = 12;

      const iconTopMarginPercent = ((ICON_HEIGHT_PX / 2 + POSITION_TEXT_OFFSET_PX) / rect.height) * 100;
      const iconHalfWidthPercent = (ICON_HEIGHT_PX / 2 / rect.width) * 100;
      const iconBottomMarginPercent = (ICON_HEIGHT_PX / 2 / rect.height) * 100;

      // GK 영역 제한 상수 참조 및 경계 제한 계산
      const dropMaxY = isGK ? 100 - iconBottomMarginPercent : SLOT_ZONES_BOUNDS.GK.minY - iconBottomMarginPercent;

      const newX = Math.max(iconHalfWidthPercent, Math.min(100 - iconHalfWidthPercent, rawX));
      const newY = Math.max(iconTopMarginPercent, Math.min(dropMaxY, rawY));

      setFormationsByQuarter((prev) => {
        const formationToUpdate = prev[activeQuarter];
        if (!formationToUpdate) return prev; // 안전장치
        const newFormation = formationToUpdate.map((player) =>
          player.id === currentDraggingId ? { ...player, x: newX, y: newY } : player
        );
        return { ...prev, [activeQuarter]: newFormation };
      });
    },
    [draggingIdRef, pitchRef, formationRef, activeQuarter]
  );

  // [핵심] 드래그 종료/드롭 처리 핸들러 (handleMouseUp)
  const handleMouseUp = useCallback(
    (event) => {
      const finalDraggingId = draggingIdRef.current;
      const initialPosition = startPositionRef.current;
      const wasDragging = isDraggingRef.current;

      // 1. 드래그 종료 상태 업데이트 (클린업 시작)
      setDraggingId(null);
      draggingIdRef.current = null;
      startPositionRef.current = null;

      // [핵심 수정] isDraggingRef.current를 즉시 false로 바꾸면, 뒤이어 발생하는 click 이벤트에서
      // 드래그 여부를 판단할 수 없습니다. setTimeout으로 초기화를 지연시켜 이 문제를 해결합니다.
      setTimeout(() => {
        isDraggingRef.current = false;
      }, 0);

      // 2. [필수] 전역 이벤트 리스너 제거
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleMouseMove);
      window.removeEventListener('touchend', handleMouseUp);

      // [추가] 드래그가 아닌 단순 클릭이었는지 확인하고 콘솔에 로그를 출력합니다.
      if (!wasDragging) {
        console.log('Player icon clicked (not dragged)');
      }

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
      const targetPlayer = formationRef.current.find((player) => {
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
          setFormationsByQuarter((prev) => ({
            ...prev,
            [activeQuarter]: prev[activeQuarter].map((player) =>
              player.id === finalDraggingId
                ? { ...player, x: dropX, y: dropY, position: targetPosKey, posKey: targetPosKey }
                : player
            ),
          }));
          console.log(`Player ID ${finalDraggingId} moved to empty zone ${targetPosKey}`);
        } else {
          // 2-3. GK 구역 등 이동 불가 -> 원래 위치 복귀
          setFormationsByQuarter((prev) => ({
            ...prev,
            [activeQuarter]: prev[activeQuarter].map((player) =>
              player.id === finalDraggingId ? { ...player, x: initialPosition.x, y: initialPosition.y } : player
            ),
          }));
        }
      } else {
        // Case 3: 구역 밖 드롭 -> 원래 위치 복귀
        setFormationsByQuarter((prev) => ({
          ...prev,
          [activeQuarter]: prev[activeQuarter].map((player) =>
            player.id === finalDraggingId ? { ...player, x: initialPosition.x, y: initialPosition.y } : player
          ),
        }));
      }
    },
    [handleMouseMove, pitchRef, handlePlayerSwap, activeQuarter] // 🔑 의존성 유지
  );

  // [핵심] 드래그 시작 핸들러 (handleMouseDown)
  const handleMouseDown = useCallback(
    (e, id) => {
      const playerToDrag = formationRef.current.find((p) => p.id === id);
      const isTouch = e.type.startsWith('touch');
      const clientX = isTouch ? e.touches[0].clientX : e.clientX;
      const clientY = isTouch ? e.touches[0].clientY : e.clientY;

      if (playerToDrag && playerToDrag.position === 'GK') return;

      console.log('Drag started for player ID:', id);
      // 할당된 선수가 없으면 null이 출력됩니다.
      console.log('DB Player ID:', playerToDrag?.dbPlayerId);

      // 드래그 시작 시점의 화면 좌표(clientX, clientY)도 함께 저장합니다.
      startPositionRef.current = {
        x: playerToDrag.x,
        y: playerToDrag.y,
        clientX: clientX,
        clientY: clientY,
      };

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

  // [클린업] 컴포넌트 언마운트 시 전역 이벤트 리스너 정리
  useEffect(() => {
    const handleMove = handleMouseMove;
    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('touchmove', handleMove);
    };
  }, [handleMouseMove]);

  // [리셋 함수] 초기 포메이션 상태로 되돌립니다.
  const resetFormation = useCallback(() => {
    setFormationsByQuarter({ 1: initialFormation }); // 1쿼터만 있는 초기 객체로 리셋
    setActiveQuarter(1); // 활성 쿼터도 1로 리셋
    // isDirty는 useEffect에 의해 자동으로 false로 변경됩니다.
  }, [initialFormation]);

  return {
    formationsByQuarter,
    activeQuarter,
    setActiveQuarter: handleQuarterChange,
    draggingId,
    pitchRef,
    activeSlot,
    setPitchRef,
    handleMouseDown,
    handlePlayerSwap,
    resetFormation,
    handleSlotClick,
    handleAssignPlayer,
    isDirty,
    loadFormation,
    resetIsDirty,
  };
};
