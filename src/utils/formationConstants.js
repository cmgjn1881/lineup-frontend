// src/utils/formationConstants.js

// 축구장 구역 경계 정의 (단위: %)
// 각 포지션 슬롯의 사각형 경계 (minX, maxX, minY, maxY) 및 중심 좌표를 정의합니다.
export const SLOT_ZONES_BOUNDS = {
  // Defense/GK Zone: Y > 85%
  GK: { minX: 40, maxX: 60, minY: 87, maxY: 100, centerX: 50, centerY: 92 }, // Goalkeeper

  // Defensive Zone
  LWB: { minX: 7, maxX: 24, minY: 60, maxY: 73, centerX: 16, centerY: 66 }, // Left Wing Back
  LB: { minX: 7, maxX: 24, minY: 73, maxY: 85, centerX: 16, centerY: 79 }, // Left Back
  LCB: { minX: 24, maxX: 40, minY: 71, maxY: 85, centerX: 32, centerY: 78 }, // Left Center Back
  CB: { minX: 40, maxX: 60, minY: 71, maxY: 85, centerX: 50, centerY: 78 }, // Center Back
  RCB: { minX: 60, maxX: 76, minY: 71, maxY: 85, centerX: 68, centerY: 78 }, // Right Center Back
  RB: { minX: 76, maxX: 93, minY: 73, maxY: 85, centerX: 84, centerY: 79 }, // Right Back
  RWB: { minX: 76, maxX: 93, minY: 60, maxY: 73, centerX: 84, centerY: 66 }, // Right Wing Back

  // Midfield Zone
  LDM: { minX: 24, maxX: 40, minY: 57, maxY: 71, centerX: 32, centerY: 64 }, // Left Defensive Mid
  CDM: { minX: 40, maxX: 60, minY: 57, maxY: 71, centerX: 50, centerY: 64 }, // Central Defensive Mid
  RDM: { minX: 60, maxX: 76, minY: 57, maxY: 71, centerX: 68, centerY: 64 }, // Right Defensive Mid

  LCM: { minX: 24, maxX: 40, minY: 43, maxY: 57, centerX: 32, centerY: 50 }, // Left Center Mid
  CM: { minX: 40, maxX: 60, minY: 43, maxY: 57, centerX: 50, centerY: 50 }, // Central Mid
  RCM: { minX: 60, maxX: 76, minY: 43, maxY: 57, centerX: 68, centerY: 50 }, // Right Center Mid

  LAM: { minX: 24, maxX: 40, minY: 29, maxY: 43, centerX: 32, centerY: 36 }, // Left Attacking Mid
  CAM: { minX: 40, maxX: 60, minY: 29, maxY: 43, centerX: 50, centerY: 36 }, // Central Attacking Mid
  RAM: { minX: 60, maxX: 76, minY: 29, maxY: 43, centerX: 68, centerY: 36 }, // Right Attacking Mid

  LM: { minX: 7, maxX: 24, minY: 30, maxY: 60, centerX: 16, centerY: 45 }, // Left Mid
  RM: { minX: 76, maxX: 93, minY: 30, maxY: 60, centerX: 84, centerY: 45 }, // Right Mid

  // Forward Zone
  LW: { minX: 7, maxX: 24, minY: 0, maxY: 30, centerX: 16, centerY: 15 }, // Left Wing
  LS: { minX: 24, maxX: 40, minY: 0, maxY: 15, centerX: 32, centerY: 7 }, // Left Striker
  ST: { minX: 40, maxX: 60, minY: 0, maxY: 15, centerX: 50, centerY: 9 }, // Striker
  RS: { minX: 60, maxX: 76, minY: 0, maxY: 15, centerX: 68, centerY: 7 }, // Right Striker
  RW: { minX: 76, maxX: 93, minY: 0, maxY: 30, centerX: 84, centerY: 15 }, // Right Wing

  LF: { minX: 24, maxX: 40, minY: 15, maxY: 29, centerX: 32, centerY: 22 }, // Left Forward
  CF: { minX: 40, maxX: 60, minY: 15, maxY: 29, centerX: 50, centerY: 22 }, // Center Forward
  RF: { minX: 60, maxX: 76, minY: 15, maxY: 29, centerX: 68, centerY: 22 }, // Right Forward
};

// 💡 [추가] 좌표를 기반으로 해당 ZONE의 posKey를 찾는 함수 (사각형 경계 체크)
export const findZoneKeyByCoordinates = (dropX, dropY) => {
  for (const [posKey, bounds] of Object.entries(SLOT_ZONES_BOUNDS)) {
    const isXInBound = dropX >= bounds.minX && dropX <= bounds.maxX;
    const isYInBound = dropY >= bounds.minY && dropY <= bounds.maxY;

    if (isXInBound && isYInBound) {
      return posKey;
    }
  }
  return null;
};

// 4-3-3 포메이션에 해당하는 11개 포지션 키만 선택하여 중심 좌표를 사용
export const POSITIONS = {
  GK: [SLOT_ZONES_BOUNDS.GK.centerY, SLOT_ZONES_BOUNDS.GK.centerX],

  // 4백 (DF Line)
  RB: [SLOT_ZONES_BOUNDS.RB.centerY, SLOT_ZONES_BOUNDS.RB.centerX],
  RCB: [SLOT_ZONES_BOUNDS.RCB.centerY, SLOT_ZONES_BOUNDS.RCB.centerX],
  LCB: [SLOT_ZONES_BOUNDS.LCB.centerY, SLOT_ZONES_BOUNDS.LCB.centerX],
  LB: [SLOT_ZONES_BOUNDS.LB.centerY, SLOT_ZONES_BOUNDS.LB.centerX],

  // 3선 (Midfield)
  RCM: [SLOT_ZONES_BOUNDS.RCM.centerY, SLOT_ZONES_BOUNDS.RCM.centerX],
  CDM: [SLOT_ZONES_BOUNDS.CDM.centerY, SLOT_ZONES_BOUNDS.CDM.centerX],
  LCM: [SLOT_ZONES_BOUNDS.LCM.centerY, SLOT_ZONES_BOUNDS.LCM.centerX],

  // 3톱 (Forward)
  RW: [SLOT_ZONES_BOUNDS.RW.centerY, SLOT_ZONES_BOUNDS.RW.centerX],
  ST: [SLOT_ZONES_BOUNDS.ST.centerY, SLOT_ZONES_BOUNDS.ST.centerX],
  LW: [SLOT_ZONES_BOUNDS.LW.centerY, SLOT_ZONES_BOUNDS.LW.centerX],
};

// 💡 임시 선수 데이터 (초기 상태 정의용)
export const DEFAULT_PLAYERS = [
  { name: 'PLAYER', position: 'GK', backNumber: '+', posKey: 'GK' },
  { name: 'PLAYER', position: 'RB', backNumber: '+', posKey: 'RB' },
  { name: 'PLAYER', position: 'RCB', backNumber: '+', posKey: 'RCB' },
  { name: 'PLAYER', position: 'LCB', backNumber: '+', posKey: 'LCB' },
  { name: 'PLAYER', position: 'LB', backNumber: '+', posKey: 'LB' },
  { name: 'PLAYER', position: 'RCM', backNumber: '+', posKey: 'RCM' },
  { name: 'PLAYER', position: 'CDM', backNumber: '+', posKey: 'CDM' },
  { name: 'PLAYER', position: 'LCM', backNumber: '+', posKey: 'LCM' },
  { name: 'PLAYER', position: 'RW', backNumber: '+', posKey: 'RW' },
  { name: 'PLAYER', position: 'ST', backNumber: '+', posKey: 'ST' },
  { name: 'PLAYER', position: 'LW', backNumber: '+', posKey: 'LW' },
];
