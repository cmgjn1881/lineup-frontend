// src/components/PlayerForm.jsx

import React, { useState, useEffect, useMemo } from 'react';
import { Loader2 } from 'lucide-react';
import TextInput from './common/TextInput';

const POSITION_OPTIONS = ['FW', 'MF', 'DF', 'GK'];

const POSITION_COLORS = {
  FW: 'bg-red-600 hover:bg-red-700', // 공격수 - 빨강
  MF: 'bg-green-600 hover:bg-green-700', // 미드필더 - 초록
  DF: 'bg-blue-600 hover:bg-blue-700', // 수비수 - 파랑
  GK: 'bg-yellow-500 hover:bg-yellow-600', // 골키퍼 - 노랑
};

const DEFAULT_UNSELECTED_STYLE = 'bg-[#0D1117] text-white hover:bg-gray-300 border border-[#6B6B6B]';

const PlayerForm = ({ initialData, onSubmit, onCancel, submitLabel, error: propError, isSubmitting }) => {
  // 🔑 [수정] 초기 데이터가 없을 때 모든 필드를 명시적으로 빈 문자열("")로 설정
  const defaultData = useMemo(() => ({ name: '', position: '', backNumber: '' }), []);
  // 🔑 initialData의 모든 값이 undefined가 아닌지 확인하여 formData를 설정
  const [formData, setFormData] = useState({
    ...defaultData,
    ...(initialData || {}),
  });

  const [localError, setLocalError] = useState('');

  useEffect(() => {
    const data = initialData || {};

    // 🔑 [핵심 수정] 등번호가 undefined/null이 아니면 String으로 변환합니다.
    const rawBackNumber = data.backNumber;
    const backNumberString =
      rawBackNumber !== undefined && rawBackNumber !== null
        ? String(rawBackNumber) // DB 숫자를 문자열로 변환
        : '';

    setFormData({
      ...defaultData,
      ...data,
      backNumber: backNumberString, // 🔑 문자열로 변환된 값 강제 주입
    });
    setLocalError('');
  }, [initialData, defaultData]);

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

    // 1. 클라이언트 측 유효성 검사
    if (!formData.name || !formData.position || !formData.backNumber) {
      setLocalError('모든 필드를 입력해주세요.');
      return;
    }

    // 2. 부모 컴포넌트의 onSubmit 함수 호출
    onSubmit(formData);
  };

  const currentError = propError || localError;

  return (
    <form onSubmit={handleSubmit} className="p-4 mb-3 border border-[#6B6B6B] rounded-3xl shadow-md space-y-3 bg-black">
      <p className="block text-center font-semibold text-lg text-white">{submitLabel}</p>

      {currentError && <p className="text-red-500 text-sm">{currentError}</p>}

      <div className="space-y-2">
        <label className="block text-center text-sm font-medium text-[#63FF70]">포지션 선택</label>
        <div className="flex justify-around space-x-2 pt-1 pb-1">
          {POSITION_OPTIONS.map((pos) => (
            <button
              key={pos}
              type="button" // 폼 제출을 막기 위해 필수
              onClick={() => handlePositionSelect(pos)}
              className={`
                px-3 py-2 rounded-xl font-semibold transition duration-150 w-full text-sm
                ${
                  formData.position === pos
                    ? `${POSITION_COLORS[pos]} text-white shadow-md` // 선택된 스타일
                    : DEFAULT_UNSELECTED_STYLE // 기본 스타일
                }
              `}
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

      <div className="flex space-x-3">
        <button
          type="submit"
          className="w-full py-2 px-4 bg-green-500 text-white font-semibold rounded-xl shadow-md hover:bg-green-600 transition duration-200 flex items-center justify-center"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin mr-2" /> 처리 중...
            </>
          ) : (
            submitLabel
          )}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="w-full py-2 px-4 bg-gray-400 text-white font-semibold rounded-xl shadow-md hover:bg-gray-500 transition duration-200"
          disabled={isSubmitting}
        >
          취소
        </button>
      </div>
    </form>
  );
};

export default PlayerForm;
