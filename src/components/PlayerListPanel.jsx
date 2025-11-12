// src/components/PlayerListPanel.jsx

import React from 'react';
import { Loader2 } from 'lucide-react';
import PlayerCard from './PlayerCard'; // 💡 [추가] 새로 만든 PlayerCard 컴포넌트를 가져옵니다.

const PlayerListPanel = ({ allPlayers, onPlayerClick, loading }) => {
  const totalPlayers = allPlayers;

  return (
    <div className="mt-2 mb-2 p-4 border rounded-lg bg-black shadow-md">
      {/* 제목 변경 및 전체 선수 수 표시 */}
      <h3 className="text-lg font-bold text-white flex justify-center text-center mb-3 border-b pb-2">
        선수 목록 ({totalPlayers.length}명)
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
            return (
              // 기존 div 대신 PlayerCard 컴포넌트를 사용합니다.
              <PlayerCard key={player.id} player={player} onPlayerClick={onPlayerClick} />
            );
          })}
        </div>
      )}
    </div>
  );
};

export default PlayerListPanel;
