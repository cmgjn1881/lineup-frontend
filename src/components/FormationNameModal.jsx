// src/components/FormationNameModal.jsx
import React from 'react';
import SecondaryButton from './common/SecondaryButton.jsx';
import GreenBtn from './common/GreenBtn.jsx';
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
          <SecondaryButton onClick={onClose}>취소</SecondaryButton>
          <GreenBtn onClick={handleConfirm} disabled={!value.trim()}>
            저장
          </GreenBtn>
        </div>
      </div>
    </div>
  );
};

export default FormationNameModal;
