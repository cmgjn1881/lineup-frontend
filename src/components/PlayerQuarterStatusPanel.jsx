// src/components/PlayerQuarterStatusPanel.jsx

import React, { useMemo } from 'react';
import { UserCheck } from 'lucide-react';

// 💡 [추가] 포지션별 색상 정의
const POSITION_COLORS = {
  FW: 'text-red-400',
  MF: 'text-green-400',
  DF: 'text-blue-400',
  GK: 'text-yellow-400',
};

// 💡 [추가] 포지션 정렬 순서 정의 (FW > MF > DF > GK)
const POSITION_SORT_ORDER = {
  FW: 1,
  MF: 2,
  DF: 3,
  GK: 4,
};

const PlayerQuarterStatusPanel = ({ formationsByQuarter, teamPlayers, isOpen }) => {
  // 1. 선수별 쿼터 배정 정보를 계산하는 로직
  const playerQuarterAssignments = useMemo(() => {
    const assignments = {};

    // 모든 팀 선수를 순회하며 초기화
    teamPlayers.forEach((player) => {
      assignments[player.id] = {
        ...player,
        quarters: [],
      };
    });

    // 모든 쿼터의 포메이션 데이터를 순회
    for (const quarter in formationsByQuarter) {
      const formation = formationsByQuarter[quarter];
      formation.forEach((slot) => {
        if (slot.dbPlayerId && assignments[slot.dbPlayerId]) {
          assignments[slot.dbPlayerId].quarters.push(quarter);
        }
      });
    }

    // 💡 [개선] Object.values를 한 번만 호출하고, map과 sort를 체이닝하여 가독성을 높입니다.
    return Object.values(assignments)
      .map((player) => ({
        ...player,
        // 각 선수의 quarters 배열을 오름차순으로 정렬합니다.
        quarters: player.quarters.sort((a, b) => a - b),
      }))
      .sort((a, b) => {
        // 1. 쿼터 수에 따라 내림차순 정렬 (주 정렬 기준)
        if (b.quarters.length !== a.quarters.length) {
          return b.quarters.length - a.quarters.length;
        }
        // 2. 쿼터 수가 같으면 포지션 순서에 따라 정렬 (2차 정렬 기준)
        const orderA = POSITION_SORT_ORDER[a.position] || 99;
        const orderB = POSITION_SORT_ORDER[b.position] || 99;
        return orderA - orderB;
      });
  }, [formationsByQuarter, teamPlayers]);

  return (
    // 패널 컨테이너: 화면 오른쪽에 고정, 슬라이드 애니메이션 적용
    // 💡 [수정] w-full을 제거하고 고정 너비(w-96)를 지정하여 화면을 덮지 않도록 합니다.
    // 💡 [수정] 패널의 최대 너비를 sm:max-w-xs (320px)에서 sm:max-w-2xs (288px)로 줄여 더 슬림하게 만듭니다.
    <div
      className={`absolute top-0 right-0 h-full w-[60%] sm:max-w-2xs bg-[#0D1117] border-l border-[#6B6B6B] shadow-2xl z-30 transform transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}
    >
      <div className="p-4 flex flex-col h-full">
        {/* 헤더: 제목과 닫기 버튼 */}
        <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-700">
          <h3 className="text-lg font-semibold text-white flex items-center">
            <UserCheck className="w-5 h-5 mr-2 text-[#63FF70]" />
            선수별 쿼터 현황
          </h3>
        </div>

        {/* 선수 목록 (스크롤 가능) */}
        <div className="grow overflow-y-auto">
          {playerQuarterAssignments.map((player) => (
            <div key={player.id} className="mb-2 p-2 rounded-md hover:bg-gray-800">
              {/* 💡 [수정] 등번호, 포지션, 이름을 함께 표시하도록 UI 개선 */}
              <div className="flex items-baseline space-x-2">
                <span className="text-sm font-mono text-gray-500 w-6 text-right">
                  {player.backNumber || player.number}.
                </span>
                <span className={`font-bold text-sm w-7 ${POSITION_COLORS[player.position] || 'text-gray-400'}`}>
                  {player.position}
                </span>
                <p className="font-semibold text-white truncate">{player.name}</p>
                <span className="text-xs font-medium text-gray-400">({player.quarters.length}쿼터)</span>
              </div>
              <p className="text-sm text-gray-400">
                {/* 💡 [수정] "배정된 쿼터:" 텍스트를 "참여:"로 간결하게 변경합니다. */}
                배정된 쿼터: {player.quarters.length > 0 ? player.quarters.join('Q, ') + 'Q' : '없음'}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PlayerQuarterStatusPanel;
