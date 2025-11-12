// src/components/FormationNameModal.jsx
import React from 'react';
import TextInput from './common/TextInput.jsx';

const FormationNameModal = ({ isOpen, onClose, onConfirm, value, onChange }) => {
  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm();
  };

  return (
    <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-black border border-[#6B6B6B] p-6 rounded-2xl shadow-xl w-80">
        <h3 className="text-xl text-white text-center font-bold mb-4 pb-4">포메이션 저장</h3>
        <TextInput
          type="text"
          className="w-full mb-4"
          placeholder="예: 공격형 4-3-3"
          value={value}
          onChange={onChange}
        />
        <div className="pt-12 flex justify-center space-x-3">
          <button
            onClick={onClose}
            className="py-1 px-4 bg-[#0D1117] text-white border border-[#6B6B6B] rounded-xl hover:bg-gray-400"
          >
            취소
          </button>
          <button
            onClick={handleConfirm}
            className="py-1 px-4 bg-green-600 text-white border border-[#6B6B6B] rounded-xl hover:bg-green-700"
            disabled={!value.trim()}
          >
            저장
          </button>
        </div>
      </div>
    </div>
  );
};

export default FormationNameModal;
