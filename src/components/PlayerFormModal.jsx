// src/components/PlayerFormModal.jsx

import React, { useState, useEffect, useMemo } from 'react';
import { Loader2 } from 'lucide-react';
import TextInput from './common/TextInput';
import GreenBtn from './common/GreenBtn';
import SecondaryButton from './common/SecondaryButton';

// 💡 PlayerForm에서 사용하던 상수들을 가져옵니다.
const POSITION_OPTIONS = ['FW', 'MF', 'DF', 'GK'];
const POSITION_COLORS = {
  FW: 'bg-red-600 hover:bg-red-700',
  MF: 'bg-green-600 hover:bg-green-700',
  DF: 'bg-blue-600 hover:bg-blue-700',
  GK: 'bg-yellow-500 hover:bg-yellow-600',
};
const DEFAULT_UNSELECTED_STYLE = 'bg-[#0D1117] text-white hover:bg-gray-300 border border-[#6B6B6B]';

const PlayerFormModal = ({ isOpen, onClose, onSubmit, initialData, isSubmitting, error: propError }) => {
  // 💡 PlayerForm의 상태 관리 로직을 가져옵니다.
  const defaultData = useMemo(() => ({ name: '', position: '', backNumber: '' }), []);
  const [formData, setFormData] = useState({ ...defaultData, ...(initialData || {}) });
  const [localError, setLocalError] = useState('');

  useEffect(() => {
    const data = initialData || {};
    // 💡 [수정] 'backNumber' 또는 'number' 속성을 모두 확인하여 등번호를 가져옵니다.
    const rawBackNumber = data.backNumber ?? data.number;
    const backNumberString = rawBackNumber !== undefined && rawBackNumber !== null ? String(rawBackNumber) : '';
    setFormData({ ...defaultData, ...data, backNumber: backNumberString });
    setLocalError('');
  }, [initialData, defaultData]);

  // 💡 PlayerForm의 핸들러 함수들을 가져옵니다.
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePositionSelect = (positionValue) => {
    setFormData((prev) => ({ ...prev, position: positionValue }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLocalError('');
    if (!formData.name || !formData.position || !formData.backNumber) {
      setLocalError('모든 필드를 입력해주세요.');
      return;
    }
    onSubmit(formData);
  };

  const currentError = propError || localError;

  // 💡 [수정] 모든 훅이 호출된 후에 조건부 렌더링을 처리합니다.
  if (!isOpen) return null;

  const isEditMode = !!initialData;
  const submitLabel = isEditMode ? '수정' : '등록';

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-black border border-[#6B6B6B] p-1 rounded-3xl shadow-xl w-full max-w-sm m-4">
        {/* 💡 PlayerForm의 JSX를 여기에 통합합니다. */}
        <form onSubmit={handleSubmit} className="p-4 mb-1 space-y-3 bg-black rounded-3xl">
          <p className="block text-center font-semibold text-lg text-white">{submitLabel}</p>
          {currentError && <p className="text-red-500 text-sm">{currentError}</p>}
          <div className="space-y-2">
            <label className="block text-center text-sm font-medium text-[#63FF70]">포지션 선택</label>
            <div className="flex justify-around space-x-2 pt-1 pb-1">
              {POSITION_OPTIONS.map((pos) => (
                <button
                  key={pos}
                  type="button"
                  onClick={() => handlePositionSelect(pos)}
                  className={`px-3 py-2 rounded-xl font-semibold transition duration-150 w-full text-sm ${
                    formData.position === pos
                      ? `${POSITION_COLORS[pos]} text-white shadow-md`
                      : DEFAULT_UNSELECTED_STYLE
                  }`}
                >
                  {pos}
                </button>
              ))}
            </div>
          </div>
          <TextInput
            type="text"
            name="name"
            placeholder="선수 이름 (예: 손흥민)"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
          />
          <div className="flex space-x-3 pt-2 pb-1">
            <TextInput
              type="number"
              name="backNumber"
              placeholder="등번호 (예: 7)"
              value={formData.backNumber}
              onChange={handleChange}
              required
              min="1"
              max="99"
              className="w-1/3 px-3 py-2 pt-1 pb-1 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="flex space-x-3 justify-center">
            <GreenBtn type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin mr-2" /> 처리 중...
                </>
              ) : (
                submitLabel
              )}
            </GreenBtn>
            <SecondaryButton type="button" onClick={onClose} disabled={isSubmitting}>
              취소
            </SecondaryButton>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PlayerFormModal;
