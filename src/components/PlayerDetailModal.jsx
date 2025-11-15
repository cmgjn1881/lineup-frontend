// src/components/PlayerDetailModal.jsx
import React from 'react';
import PlayerCard from './PlayerCard';
import SecondaryButton from './common/SecondaryButton';
import RedBtn from './common/RedBtn';
import GreenBtn from './common/GreenBtn';

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
          <RedBtn onClick={onRemove}>제거</RedBtn>
          {/* 2. 수정 버튼 (선수 목록 모달로 연결) */}
          <GreenBtn onClick={onModify}>수정</GreenBtn>
          {/* 3. 취소 버튼 */}
          <SecondaryButton onClick={onClose}>취소</SecondaryButton>
        </div>
      </div>
    </div>
  );
};

export default PlayerDetailModal;
