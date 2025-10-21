// src/components/PlayerIcon.jsx

import React from 'react';

const PlayerIcon = ({ player, shirtColor = 'bg-blue-600', textColor = 'text-white' }) => {
  // player 객체에서 정보 추출 (id, name, position, backNumber가 있다고 가정)
  const { name, position, backNumber } = player;

  // 등번호가 숫자가 아닌 경우를 대비하여 문자열로 변환
  const displayBackNumber = String(backNumber || '');

  return (
    // 1. 셔츠 모양 컨테이너
    <div
      className="relative w-16 h-16 cursor-grab select-none flex flex-col items-center justify-center text-center"
      // 💡 드래그 앤 드롭 구현 시 여기에 draggable 속성을 추가할 수 있습니다.
    >
      {/* 2. 셔츠 상의 모양 (CSS로 구현) */}
      <div
        className={`relative w-12 h-12 rounded-full border-2 border-white ${shirtColor} shadow-md flex items-center justify-center select-none`}
      >
        {/* 🔑 중앙 등번호 (가장 크고 눈에 띄게) */}
        <span className={`text-2xl font-black ${textColor} leading-none`}>{displayBackNumber}</span>

        {/* 🔑 상단 포지션 (셔츠 위쪽) */}
        <div
          className={`absolute -top-3 left-1/2 transform -translate-x-1/2 px-1 rounded ${textColor} text-xs font-semibold bg-gray-900/70`}
        >
          {position}
        </div>
      </div>

      {/* 🔑 하단 이름 (셔츠 아래) */}
      <div className={`mt-1 text-xs font-medium text-gray-100 truncate w-full`}>{name}</div>
    </div>
  );
};

export default PlayerIcon;
