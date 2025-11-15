// src/components/GreenBtn.jsx

import React from 'react';

const GreenBtn = ({ children, className = '', ...props }) => {
  return (
    <button
      {...props}
      className={`py-1 px-4 border border-[#6B6B6B] rounded-xl bg-[#0D1117] text-[#63FF70] hover:bg-green-600 hover:text-white ${className}`}
    >
      {children}
    </button>
  );
};

export default GreenBtn;
