// src/components/SignupForm.jsx (또는 src/pages/SignupForm.jsx)

import React, { useState } from 'react';
import { useApiClient } from '../api/ApiClient';
import { Send, CheckCircle, Loader2 } from 'lucide-react'; // 아이콘 추가

const SignupForm = ({ onSignupSuccess, onCancel }) => {
  const [email, setEmail] = useState('');

  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [username, setUsername] = useState('');

  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false); // 제출 로딩 상태

  const api = useApiClient();

  // 3. 🔑 최종 회원가입 요청
  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== passwordConfirm) {
      setError('비밀번호와 비밀번호 확인이 일치하지 않습니다.');
      return;
    }

    try {
      // 이메일 인증이 완료된 상태이므로, 인증 코드(authCode)를 포함하여 최종 회원가입 요청
      // 백엔드에서 이메일과 코드의 유효성을 다시 확인한다고 가정
      await api.signup(email, password, username);

      alert('회원가입 성공! 이제 로그인해주세요.');
      onSignupSuccess();
    } catch (err) {
      setError(err.response?.data?.message || '회원가입 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSignup} className="space-y-4">
      <h2 className="text-3xl font-bold mb-6 text-center text-indigo-600">회원가입</h2>

      {/* 1. 이메일 및 사용자 정보 입력 단계 (인증 단계 없이 통합) */}
      <div className="space-y-4">
        {/* 이메일 입력 필드 */}
        <input
          type="email"
          placeholder="이메일"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
        />

        {/* 비밀번호 입력 필드 */}
        <input
          type="password"
          placeholder="비밀번호"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
        />
        <input
          type="password"
          placeholder="비밀번호 확인"
          value={passwordConfirm}
          onChange={(e) => setPasswordConfirm(e.target.value)}
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
        />
        <input
          type="text"
          placeholder="사용자 이름"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
        />

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-2 px-4 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 transition duration-200 flex items-center justify-center"
        >
          {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : '가입하기'}
        </button>
      </div>

      <button
        onClick={onCancel}
        type="button"
        className="mt-4 w-full text-sm text-center text-indigo-500 hover:text-indigo-700 transition duration-200"
      >
        이미 계정이 있으신가요? 로그인
      </button>
    </form>
  );
};

export default SignupForm;
