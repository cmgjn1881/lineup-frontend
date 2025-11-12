// src/components/PlayerDetailModal.jsx
import React from 'react';
import PlayerCard from './PlayerCard';

const PlayerDetailModal = ({ isOpen, onClose, selectedSlot, onRemove, onModify }) => {
  if (!isOpen || !selectedSlot) return null;

  return (
    <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-black border border-[#6B6B6B] p-6 rounded-2xl shadow-xl w-80">
        <h3 className="text-xl text-center text-white font-bold mb-4 border-b pb-2">선수 정보</h3>

        {/* 기존 텍스트 정보 대신 PlayerCard 컴포넌트를 사용합니다. */}
        <div className="flex justify-center mb-6">
          <PlayerCard
            player={{
              ...selectedSlot,
              position: selectedSlot.posKey, // posKey를 position으로 매핑
            }}
            onPlayerClick={() => {}} // 모달 안에서는 클릭 동작이 필요 없으므로 빈 함수 전달
          />
        </div>

        <div className="flex justify-center space-x-3">
          {/* 1. 삭제 버튼 */}
          <button
            onClick={onRemove}
            className="py-1 px-4 border border-[#6B6B6B] bg-[#0D1117] text-[#FF4444] rounded-xl hover:bg-red-600 hover:text-white"
          >
            제거
          </button>
          {/* 2. 수정 버튼 (선수 목록 모달로 연결) */}
          <button
            onClick={onModify}
            className="py-1 px-4 border border-[#6B6B6B] bg-[#0D1117] text-[#63FF70] rounded-xl hover:bg-[#63FF70] hover:text-white"
          >
            수정
          </button>
          {/* 3. 취소 버튼 */}
          <button
            onClick={onClose}
            className="py-1 px-4 border border-[#6B6B6B] bg-[#0D1117] text-white rounded-xl hover:bg-gray-500"
          >
            취소
          </button>
        </div>
      </div>
    </div>
  );
};

export default PlayerDetailModal;
