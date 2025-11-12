// src/components/FootballPitch.jsx

import React, { forwardRef } from 'react';

const FootballPitch = forwardRef(({ children }, ref) => {
  // 🔑 [수정] 사실적인 잔디 색상 정의
  const DARK_GREEN = '#005900'; // 짙은 녹색 (줄무늬의 어두운 부분)
  const LIGHT_GREEN = '#147D19'; // 차분한 연두 (줄무늬의 밝은 부분)

  // 줄무늬 패턴을 생성하는 CSS 값
  const grassGradient = `linear-gradient(to bottom, 
    ${LIGHT_GREEN} 0%, ${LIGHT_GREEN} 10%, 
    ${DARK_GREEN} 10%, ${DARK_GREEN} 20%, 
    ${LIGHT_GREEN} 20%, ${LIGHT_GREEN} 30%, 
    ${DARK_GREEN} 30%, ${DARK_GREEN} 40%, 
    ${LIGHT_GREEN} 40%, ${LIGHT_GREEN} 50%, 
    ${DARK_GREEN} 50%, ${DARK_GREEN} 60%, 
    ${LIGHT_GREEN} 60%, ${LIGHT_GREEN} 70%, 
    ${DARK_GREEN} 70%, ${DARK_GREEN} 80%, 
    ${LIGHT_GREEN} 80%, ${LIGHT_GREEN} 90%, 
    ${DARK_GREEN} 90%, ${DARK_GREEN} 100%)`;

  return (
    <div
      ref={ref}
      className="relative w-full aspect-2/3 border-8 border-white rounded-md shadow-lg overflow-auto mx-auto"
      style={{
        backgroundImage: grassGradient, // 🔑 수정된 그라데이션 적용
        backgroundSize: '100% 100%',
        touchAction: 'pan-y', // ⚽️ 모바일에서 피치 배경 스크롤 허용
      }}
    >
      {/* 🔑 [수정] 중앙 서클 크기: w-28 h-28로 확대 (이전에 적용된 최종 크기 유지) */}
      <div className="absolute top-1/2 left-1/2 w-28 h-28 border-4 border-white rounded-full transform -translate-x-1/2 -translate-y-1/2"></div>

      {/* 중앙선, 페널티 박스 등 마크는 흰색(border-white)이므로 색상 변경 없음 */}
      <div className="absolute top-1/2 left-0 w-full h-0.5 bg-white transform -translate-y-1/2"></div>
      <div className="absolute top-1/2 left-1/2 w-1.5 h-1.5 bg-white rounded-full transform -translate-x-1/2 -translate-y-1/2"></div>

      {/* 상단 페널티 박스 (유지) */}
      <div className="absolute top-0 left-1/2 w-64 h-32 border-4 border-white transform -translate-x-1/2 rounded-b-lg">
        <div className="absolute bottom-0 left-1/2 w-32 h-16 border-t-4 border-white transform -translate-x-1/2"></div>
        <div className="absolute bottom-16 left-1/2 w-1.5 h-1.5 bg-white rounded-full transform -translate-x-1/2"></div>
        <div className="absolute top-0 left-1/2 w-20 h-5 bg-gray-800 border-2 border-gray-400 transform -translate-x-1/2"></div>
      </div>

      {/* 하단 페널티 박스 (유지) */}
      <div className="absolute bottom-0 left-1/2 w-64 h-32 border-4 border-white transform -translate-x-1/2 rounded-t-lg">
        <div className="absolute top-0 left-1/2 w-32 h-16 border-b-4 border-white transform -translate-x-1/2"></div>
        <div className="absolute top-16 left-1/2 w-1.5 h-1.5 bg-white rounded-full transform -translate-x-1/2"></div>
        <div className="absolute bottom-0 left-1/2 w-20 h-5 bg-gray-800 border-2 border-gray-400 transform -translate-x-1/2"></div>
      </div>

      {children}
    </div>
  );
});

export default FootballPitch;
