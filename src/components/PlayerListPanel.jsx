// src/components/PlayerListPanel.jsx

import React from 'react';
import { Users, Loader2 } from 'lucide-react';

// 🔑 [수정] formationPlayers prop을 사용하지 않고, allPlayers만 표시합니다.
const PlayerListPanel = ({ allPlayers, onPlayerClick, loading }) => {
  // ❌ 이전의 필터링 로직 제거
  // const formationPlayerIds = new Set(formationPlayers.map(p => p.id));
  // const benchPlayers = allPlayers.filter(p => !formationPlayerIds.has(p.id));

  const totalPlayers = allPlayers; // 🔑 전체 선수를 표시합니다.

  const ITEM_WIDTH = 'w-24';

  return (
    <div className="mt-2 mb-2 p-4 border rounded-lg bg-white shadow-md">
      {/* 🔑 [수정] 제목 변경 및 전체 선수 수 표시 */}
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
          {totalPlayers.map(
            (
              player // 🔑 totalPlayers(전체 선수) 렌더링
            ) => (
              <div
                key={player.id}
                onClick={() => onPlayerClick(player)}
                className={`p-2 border rounded-md text-center text-xs font-medium cursor-pointer 
                          bg-gray-100 hover:bg-indigo-100 transition duration-150 flex-shrink-0 ${ITEM_WIDTH}`}
              >
                <div className="truncate font-semibold text-gray-800">{player.name}</div>
                <div className="text-gray-500">#{player.backNumber || player.number}</div>
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
};

export default PlayerListPanel;
