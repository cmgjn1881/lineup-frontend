// src/components/PlayerListModal.jsx

import React from 'react';
import { X } from 'lucide-react';

const PlayerListModal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative max-w-sm w-11/12 mx-auto bg-white rounded-xl shadow-2xl transform transition-all duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b flex justify-between items-center">
          <h3 className="text-xl font-bold text-gray-800 grow pr-4 truncate">{title}</h3>

          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100"
            aria-label="모달 닫기"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 max-h-[80vh] overflow-x-auto">{children}</div>
      </div>
    </div>
  );
};

export default PlayerListModal;
