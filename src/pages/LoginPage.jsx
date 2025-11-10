// src/pages/LoginPage.jsx
/* eslint-disable no-unused-vars */ // 💡 이 파일 내에서 '사용하지 않는 변수' 경고를 비활성화합니다.

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApiClient } from '../api/ApiClient';
import { useAuth } from '../context/useAuth';
import SignupForm from './SignupForm';
import KakaoLoginButton from './KakaoLoginButton';
import mainLogo from '../assets/mainlogo.svg';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignup, setIsSignup] = useState(false);
  const [error, setError] = useState('');

  const api = useApiClient();
  const auth = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await api.login(email, password);
      //console.log('로그인 응답 데이터:', res.data);
      const { accessToken, refreshToken, email: userEmail, username: userName } = res.data;
      auth.login(accessToken, refreshToken, userEmail, userName); // 💡 이름 변경: setTokens -> login
      navigate('/teams', { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || '로그인 요청 처리 중 오류가 발생했습니다.');
    }
  };

  // 회원가입 상태라면 SignupForm을 렌더링합니다.
  if (isSignup) {
    return (
      <div className="p-4 max-w-sm mx-auto">
        <SignupForm
          onSignupSuccess={() => {
            setIsSignup(false);
            setEmail('');
            setPassword('');
          }}
          onCancel={() => setIsSignup(false)}
        />
      </div>
    );
  }

  return (
    <div className="p-4 max-w-sm mx-auto">
      {/* 💡 [임시 수정] 일반 로그인/회원가입 UI를 주석 처리하고 카카오 로그인만 남깁니다. */}
      {/* 💡 [수정] 기존 코드를 삭제하는 대신 주석으로 남겨둡니다. */}
      {/*
      <h2 className="text-3xl font-bold mb-6 text-center text-indigo-600">로그인</h2>
      <form onSubmit={handleLogin} className="space-y-4">
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
      <button onClick={() => setIsSignup(true)} className="mt-4 w-full text-sm text-center text-indigo-500 hover:text-indigo-700 transition duration-200">
        계정이 없으신가요? 회원가입
      </button>
      */}

      {/* 화면 중앙에 소셜 로그인 버튼을 배치하기 위해 flexbox를 사용합니다. */}
      <div className="flex flex-col justify-center items-center h-[calc(100vh-8rem)]">
        {/* 💡 [수정] h2 텍스트를 로고 이미지로 교체합니다. */}
        <img src={mainLogo} alt="Lineup Maker Logo" className="w-48 mb-12" />
        {/* 💡 카카오 로그인 버튼 렌더링 */}
        <KakaoLoginButton />
      </div>
    </div>
  );
};

export default LoginPage;
