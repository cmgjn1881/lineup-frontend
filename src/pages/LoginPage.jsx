// src/pages/LoginPage.jsx

import React, { useState } from 'react';
import { useApiClient } from '../api/ApiClient'; // 분리된 클라이언트 임포트
import { useAuth } from '../context/useAuth';
import SignupForm from './SignupForm';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignup, setIsSignup] = useState(false);
  const [error, setError] = useState('');

  const api = useApiClient();
  const auth = useAuth(); // useAuth 훅 사용

  const handleLogin = async (e) => {
    // 🔑 함수명을 handleLogin으로 변경
    e.preventDefault();
    setError('');
    try {
      const res = await api.login(email, password);
      //console.log('로그인 응답 데이터:', res.data); // ✨ 로그인 응답 데이터 확인
      const { accessToken, refreshToken, email: userEmail, username: userName } = res.data; // ✨ username 받아오기
      auth.setTokens(accessToken, refreshToken, userEmail, userName); // ✨ setTokens에 userName 전달
      window.location.hash = '#/teams'; // 화면 전환 명령
    } catch (err) {
      setError(err.response?.data?.message || '로그인 요청 처리 중 오류가 발생했습니다.');
    }
  };

  // 🔑 회원가입 상태라면 SignupForm을 렌더링합니다.
  if (isSignup) {
    return (
      <div className="p-4 max-w-sm mx-auto">
        <SignupForm
          onSignupSuccess={() => {
            setIsSignup(false); // 가입 성공 후 로그인 폼으로 전환
            setEmail(''); // 폼 초기화
            setPassword('');
          }}
          onCancel={() => setIsSignup(false)} // '로그인' 버튼 클릭 시 전환
        />
      </div>
    );
  }

  return (
    <div className="p-4 max-w-sm mx-auto">
      <h2 className="text-3xl font-bold mb-6 text-center text-indigo-600">{isSignup ? '회원가입' : '로그인'}</h2>
      <form onSubmit={handleLogin} className="space-y-4">
        {/* ... (이전과 동일한 UI) ... */}
        <input
          type="email"
          placeholder="이메일"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
        />
        <input
          type="password"
          placeholder="비밀번호"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
        />

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <button
          type="submit"
          className="w-full py-2 px-4 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 transition duration-200"
        >
          로그인
        </button>
      </form>
      <button
        onClick={() => setIsSignup(true)}
        className="mt-4 w-full text-sm text-center text-indigo-500 hover:text-indigo-700 transition duration-200"
      >
        계정이 없으신가요? 회원가입
      </button>
    </div>
  );
};

export default LoginPage;
