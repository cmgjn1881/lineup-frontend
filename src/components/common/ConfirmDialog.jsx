import React from 'react';
import SecondaryButton from './SecondaryButton';
import RedBtn from './RedBtn';

const ConfirmDialog = ({ isOpen, onClose, onConfirm, title, message, confirmText = '확인', cancelText = '취소' }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-black border border-[#6B6B6B] p-6 rounded-2xl shadow-xl w-80 m-4 text-center">
        <h3 className="text-xl text-white font-bold mb-4">{title}</h3>
        <p className="text-white mb-8 whitespace-pre-wrap">{message}</p>
        <div className="flex justify-center space-x-4">
          <SecondaryButton onClick={onClose}>{cancelText}</SecondaryButton>
          <RedBtn onClick={onConfirm}>{confirmText}</RedBtn>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
