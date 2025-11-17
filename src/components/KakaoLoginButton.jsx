// src/pages/KakaoLoginButton.jsx
import kakaoLogo from '../assets/kakaoLogo.svg';

import React from 'react';

const KakaoLoginButton = () => {
  const handleKakaoLogin = () => {
    const KAKAO_CLIENT_ID = import.meta.env.VITE_KAKAO_CLIENT_ID;
    const KAKAO_REDIRECT_URI = `${window.location.origin}/kakao-redirect.html`;

    const KAKAO_AUTH_URL = `https://kauth.kakao.com/oauth/authorize?response_type=code&client_id=${KAKAO_CLIENT_ID}&redirect_uri=${KAKAO_REDIRECT_URI}`;
    window.location.href = KAKAO_AUTH_URL;
  };

  return (
    <button
      onClick={handleKakaoLogin}
      className="w-50 py-2 px-4 bg-[#FBD300] text-[#3C1E1E] font-semibold rounded-lg shadow-md hover:bg-yellow-400 transition duration-200 flex items-center justify-center"
    >
      <img src={kakaoLogo} alt="Kakao Logo" className="w-5 h-5 mr-2" />
      카카오로 로그인
    </button>
  );
};

export default KakaoLoginButton;
