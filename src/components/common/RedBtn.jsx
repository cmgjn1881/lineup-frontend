// src/components/common/RedBtn.jsx

import React from 'react';

const RedBtn = ({ children, className = '', ...props }) => {
  return (
    <button
      {...props}
      className={`py-1 px-4 border border-[#6B6B6B] rounded-xl bg-[#0D1117] text-[#FF4444] hover:bg-red-600 hover:text-white whitespace-nowrap transition-colors ${className}`}
    >
      {children}
    </button>
  );
};

export default RedBtn;
