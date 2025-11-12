import React from 'react';

const ConfirmDialog = ({ isOpen, onClose, onConfirm, title, message, confirmText = '확인', cancelText = '취소' }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-black border border-[#6B6B6B] p-6 rounded-2xl shadow-xl w-80 m-4 text-center">
        <h3 className="text-xl text-white font-bold mb-4">{title}</h3>
        <p className="text-white mb-8 whitespace-pre-wrap">{message}</p>
        <div className="flex justify-center space-x-4">
          <button
            onClick={onClose}
            className="py-1 px-6 bg-[#0D1117] text-white border border-[#6B6B6B] rounded-xl hover:bg-gray-700 transition"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className="py-1 px-6 bg-red-600 text-white rounded-xl hover:bg-red-700 transition"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
