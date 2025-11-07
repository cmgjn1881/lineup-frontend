// src/components/GreenBtn.jsx

import React from 'react';

/**
 * 앱의 주요 액션 버튼 컴포넌트
 * @param {object} props - children, onClick, type, disabled 등 표준 button 속성
 */
const GreenBtn = ({ children, ...props }) => {
  return (
    <button
      {...props} // onClick, type, disabled 등의 속성을 그대로 전달받습니다.
      className="py-2 px-4 bg-[#0D1117] text-[#63FF70] border border-[#6B6B6B] text-xs font-semibold rounded-xl shadow-md transition duration-200 flex items-center whitespace-nowrap"
    >
      {children}
    </button>
  );
};

export default GreenBtn;
