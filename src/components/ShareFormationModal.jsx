// src/components/ShareFormationModal.jsx (작성 가이드)

import React, { useState, useMemo } from 'react';
import toast from 'react-hot-toast';
import GreenBtn from './common/GreenBtn';
import SecondaryButton from './common/SecondaryButton';
// Modal, GreenBtn, toast 등 필요한 다른 컴포E넌트를 import 하세요.

const ShareFormationModal = ({ isOpen, onClose, onSubmit, formationsByQuarter }) => {
  // 1. 사용자가 선택한 쿼터를 저장할 상태를 만듭니다. (초기값: 빈 배열)
  const [selectedQuarters, setSelectedQuarters] = useState([]);

  // 2. 선수가 한 명이라도 배치된 쿼터만 필터링하여 선택지로 보여줍니다.
  const availableQuarters = useMemo(() => {
    return Object.keys(formationsByQuarter)
      .filter((q) => formationsByQuarter[q].some((player) => player.dbPlayerId))
      .sort((a, b) => a - b); // 쿼터 번호 순으로 정렬
  }, [formationsByQuarter]);

  // 3. 쿼터 체크박스를 클릭할 때마다 선택/해제하는 함수를 만듭니다.
  const handleToggleQuarter = (quarter) => {
    setSelectedQuarters((prev) => (prev.includes(quarter) ? prev.filter((q) => q !== quarter) : [...prev, quarter]));
  };

  // 4. '이미지 생성' 버튼 클릭 시 실행될 함수를 만듭니다.
  const handleSubmit = () => {
    if (selectedQuarters.length === 0) {
      toast.error('공유할 쿼터를 하나 이상 선택해주세요.');
      return;
    }
    // 부모 컴포넌트(FormationPage)로 선택된 쿼터 목록을 전달합니다.
    onSubmit(selectedQuarters);
  };

  if (!isOpen) return null;

  return (
    // 💡 [수정] 다른 모달과 동일하게 전체 화면을 덮는 배경과 z-index를 적용합니다.
    <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50">
      {/* 💡 [수정] 모달 컨텐츠 영역의 스타일을 적용합니다. */}
      <div className="bg-black border border-[#6B6B6B] p-6 m-2 rounded-2xl shadow-xl w-full max-w-sm">
        <h3 className="text-xl font-bold mb-4 border-b pb-2 text-white text-center">공유할 쿼터 선택</h3>

        {/* 쿼터 선택 목록 */}
        <div className="my-4 space-y-2">
          {availableQuarters.length > 0 ? (
            availableQuarters.map((q) => (
              <label key={q} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-800 cursor-pointer">
                {/* 💡 [수정] 체크박스 스타일을 적용합니다. */}
                <input
                  type="checkbox"
                  className="w-5 h-5 rounded bg-gray-700 border-gray-600 text-green-500 focus:ring-2 focus:ring-green-500"
                  checked={selectedQuarters.includes(q)}
                  onChange={() => handleToggleQuarter(q)}
                />
                <span className="text-white font-medium">{q}쿼터</span>
              </label>
            ))
          ) : (
            <p className="text-gray-400 text-center py-4">공유할 포메이션이 없습니다.</p>
          )}
        </div>

        {/* 하단 버튼 그룹 */}
        <div className="flex justify-center space-x-4 pt-4">
          <SecondaryButton onClick={onClose}>취소</SecondaryButton>
          <GreenBtn onClick={handleSubmit}>공유</GreenBtn>
        </div>
      </div>
    </div>
  );
};

export default ShareFormationModal;
