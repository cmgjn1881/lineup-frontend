// src/components/PlayerForm.jsx

import React, { useState, useEffect, useMemo } from 'react';
import { Loader2 } from 'lucide-react';

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
    <form onSubmit={handleSubmit} className="p-4 mb-6 border border-blue-200 rounded-lg shadow-md space-y-3 bg-white">
      <p className="font-semibold text-lg text-blue-700">{submitLabel}</p>

      {currentError && <p className="text-red-500 text-sm">{currentError}</p>}

      <input
        type="text"
        name="name"
        placeholder="선수 이름 (예: 손흥민)"
        value={formData.name}
        onChange={handleChange}
        required
        className="w-full px-3 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
      />
      <div className="flex space-x-3">
        <input
          type="text"
          name="position"
          placeholder="포지션 (예: CF, LW)"
          value={formData.position}
          onChange={handleChange}
          required
          className="w-2/3 px-3 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
        />
        <input
          type="number"
          name="backNumber"
          placeholder="등번호 (예: 7)"
          value={formData.backNumber}
          onChange={handleChange}
          required
          min="1"
          max="99"
          className="w-1/3 px-3 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div className="flex space-x-3">
        <button
          type="submit"
          className="flex-grow py-2 px-4 bg-green-500 text-white font-semibold rounded-lg shadow-md hover:bg-green-600 transition duration-200 flex items-center justify-center"
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
          className="py-2 px-4 bg-gray-400 text-white font-semibold rounded-lg shadow-md hover:bg-gray-500 transition duration-200"
          disabled={isSubmitting}
        >
          취소
        </button>
      </div>
    </form>
  );
};

export default PlayerForm;
