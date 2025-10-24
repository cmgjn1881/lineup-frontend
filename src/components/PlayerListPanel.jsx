// src/components/PlayerListPanel.jsx

import React from 'react';
import { Users, Loader2 } from 'lucide-react';

const POSITION_STYLES = {
  FW: {
    border: 'border-red-500',
    text: 'text-red-600',
    hoverBg: 'hover:bg-red-50',
  },
  MF: {
    border: 'border-green-500',
    text: 'text-green-600',
    hoverBg: 'hover:bg-green-50',
  },
  DF: {
    border: 'border-blue-500',
    text: 'text-blue-600',
    hoverBg: 'hover:bg-blue-50',
  },
  GK: {
    border: 'border-yellow-500',
    text: 'text-yellow-600',
    hoverBg: 'hover:bg-yellow-50',
  },
  default: {
    border: 'border-gray-300',
    text: 'text-gray-500',
    hoverBg: 'hover:bg-gray-100',
  },
};

const PlayerListPanel = ({ allPlayers, onPlayerClick, loading }) => {
  const totalPlayers = allPlayers;

  const ITEM_WIDTH = 'w-24';

  return (
    <div className="mt-2 mb-2 p-4 border rounded-lg bg-white shadow-md">
      {/* 제목 변경 및 전체 선수 수 표시 */}
      <h3 className="text-lg font-bold text-gray-700 flex items-center mb-3 border-b pb-2">
        <Users className="w-5 h-5 mr-2" /> 팀 선수 전체 목록 ({totalPlayers.length}명)
      </h3>

      {loading ? (
        <div className="flex justify-center items-center py-4">
          <Loader2 className="w-5 h-5 animate-spin text-gray-400 mr-2" />
          <p className="text-sm text-gray-500">선수 목록을 불러오는 중...</p>
        </div>
      ) : totalPlayers.length === 0 ? (
        <p className="text-sm text-gray-500 text-center py-4">등록된 선수가 없습니다.</p>
      ) : (
        // 가로 스크롤 컨테이너 유지
        <div className="flex space-x-2 overflow-x-auto pb-2">
          {totalPlayers.map((player) => {
            // ⭐️ [추가] 포지션에 따른 스타일 적용
            const styles = POSITION_STYLES[player.position] || POSITION_STYLES.default;
            return (
              <div
                key={player.id}
                onClick={() => onPlayerClick(player)}
                className={`p-2 border-2 rounded-md text-center text-xs font-medium cursor-pointer 
                            bg-white transition duration-150 flex-shrink-0 ${ITEM_WIDTH}
                            ${styles.border} ${styles.hoverBg}`}
              >
                {/* ⭐️ [추가] 포지션 표시 */}
                <div className={`text-xs font-bold mb-1 border-b pb-1 ${styles.text}`}>{player.position}</div>
                <div className="truncate font-semibold text-gray-800">{player.name}</div>
                <div className="text-gray-500">{player.backNumber || player.number}</div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default PlayerListPanel;
