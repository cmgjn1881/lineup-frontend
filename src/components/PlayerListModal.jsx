// src/components/PlayerListModal.jsx

import React from 'react';

const PlayerListModal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 bg-opacity-60">
      <div
        className="relative max-w-sm w-11/12 mx-auto bg-black rounded-2xl transform transition-all duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b flex justify-between items-center">
          <h3 className="text-xl text-center font-bold text-white grow pr-4 truncate">{title}</h3>
        </div>

        <div className="p-4 max-h-[80vh] overflow-x-auto">{children}</div>
        <div className="flex justify-center space-x-3 pb-4">
          <button
            onClick={onClose}
            className="py-1 px-4 text-white border border-[#6B6B6B] bg-[#0D1117] hover:text-gray-700 p-1 rounded-xl hover:bg-gray-100"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};

export default PlayerListModal;
