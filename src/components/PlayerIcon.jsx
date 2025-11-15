// src/components/PlayerIcon.jsx

import React from 'react';

const PlayerIcon = ({ player, shirtColor = 'bg-blue-600', textColor = 'text-white' }) => {
  // player 객체에서 정보 추출 (id, name, position, backNumber가 있다고 가정)
  const { name, position, backNumber } = player;

  // 등번호가 숫자가 아닌 경우를 대비하여 문자열로 변환
  const displayBackNumber = String(backNumber || '');

  return (
    // 💡 [수정] flexbox 대신, 모든 자식 요소를 absolute로 배치할 기준이 되는 relative 컨테이너로 변경합니다.
    <div
      className="relative w-16 h-21 cursor-grab select-none text-center"
      draggable="false" // 🔑 브라우저 기본 드래그 동작 방지
    >
      {/* 💡 [수정] 포지션 텍스트: 컨테이너 상단에 절대 위치로 고정합니다. */}
      {/* 💡 [수정] top-0을 top-1로 변경하여 셔츠 아이콘과 더 가깝게 배치합니다. */}
      {/* 💡 [수정] z-10을 추가하여 셔츠 아이콘 위에 렌더링되도록 하고, top-4로 위치를 조정합니다. */}
      {/* 💡 [개선] top-3 대신, 셔츠 아이콘(top-5)을 기준으로 상대적인 위치(translate-y-1/2)를 지정하여 유지보수성을 높입니다. */}
      <div className="absolute top-5 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
        <div className={`px-1 rounded-sm ${textColor} text-xs font-semibold bg-gray-900/70 whitespace-nowrap`}>
          {position}
        </div>
      </div>

      {/* 💡 [수정] 셔츠 아이콘: 포지션 텍스트 아래에 절대 위치로 고정합니다. */}
      <div
        className={`absolute top-5 left-1/2 transform -translate-x-1/2 w-12 h-12 rounded-full border-2 border-white ${shirtColor} shadow-md flex items-center justify-center select-none`}
      >
        {/* 🔑 중앙 등번호 (가장 크고 눈에 띄게) */}
        <span className={`text-2xl font-black ${textColor} leading-none`}>{displayBackNumber}</span>
      </div>

      {/* 💡 [수정] 이름 텍스트: 컨테이너 하단에 절대 위치로 고정합니다. */}
      {/* 💡 [수정] text-shadow를 추가하여 배경이 밝아도 글자가 잘 보이도록 가독성을 높입니다. */}
      <div className="absolute bottom-0 left-0 w-full text-xs font-medium text-gray-100 truncate [text-shadow:0_1px_3px_#0009]">
        {name}
      </div>
    </div>
  );
};

export default PlayerIcon;
