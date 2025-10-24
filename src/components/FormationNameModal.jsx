// src/components/FormationNameModal.jsx
import React from 'react';

const FormationNameModal = ({ isOpen, onClose, onConfirm, value, onChange }) => {
  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl w-80">
        <h3 className="text-xl font-bold mb-4">포메이션 이름 입력</h3>
        <input
          type="text"
          className="w-full p-2 border rounded-lg mb-4"
          placeholder="예: 공격형 4-3-3"
          value={value}
          onChange={onChange}
        />
        <div className="flex justify-end space-x-3">
          <button onClick={onClose} className="py-2 px-4 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400">
            취소
          </button>
          <button
            onClick={handleConfirm}
            className="py-2 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700"
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
