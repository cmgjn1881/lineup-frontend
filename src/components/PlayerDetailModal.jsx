// src/components/PlayerDetailModal.jsx
import React from 'react';

const PlayerDetailModal = ({ isOpen, onClose, selectedSlot, onRemove, onModify }) => {
  if (!isOpen || !selectedSlot) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl w-80">
        <h3 className="text-xl font-bold mb-4 border-b pb-2">{selectedSlot.name} 선수 정보</h3>

        {/* 선수 정보 표시 */}
        <div className="mb-4 text-gray-700">
          <p>
            <strong>포지션:</strong> {selectedSlot.posKey}
          </p>
          <p>
            <strong>등번호:</strong> {selectedSlot.backNumber}
          </p>
        </div>

        <div className="flex justify-end space-x-3">
          {/* 1. 삭제 버튼 */}
          <button onClick={onRemove} className="py-2 px-4 bg-red-500 text-white rounded-lg hover:bg-red-600">
            삭제
          </button>
          {/* 2. 수정 버튼 (선수 목록 모달로 연결) */}
          <button onClick={onModify} className="py-2 px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
            수정
          </button>
          {/* 3. 취소 버튼 */}
          <button onClick={onClose} className="py-2 px-4 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400">
            취소
          </button>
        </div>
      </div>
    </div>
  );
};

export default PlayerDetailModal;
