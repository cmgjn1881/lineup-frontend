// src/components/GreenBtn.jsx

import React from 'react';

const GreenBtn = ({ children, className = '', ...props }) => {
  return (
    <button
      {...props}
      // 💡 [수정] whitespace-nowrap 클래스를 추가하여 텍스트가 줄바꿈되지 않도록 합니다.
      className={`py-1 px-4 border border-[#6B6B6B] rounded-xl bg-[#0D1117] text-[#63FF70] hover:bg-green-600 hover:text-white whitespace-nowrap transition-colors ${className}`}
    >
      {children}
    </button>
  );
};

export default GreenBtn;
