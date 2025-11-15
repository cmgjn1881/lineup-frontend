// src/components/common/SecondaryButton.jsx

import React from 'react';

const SecondaryButton = ({ onClick, children, className = '', ...props }) => {
  return (
    <button
      onClick={onClick}
      className={`py-1 px-4 bg-[#0D1117] border border-[#6B6B6B] text-white rounded-xl hover:bg-gray-400 transition-colors ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default SecondaryButton;
