// src/pages/KakaoLoginButton.jsx

import React from 'react';

const KakaoLoginButton = () => {
  // 💡 [수정] 프론트엔드에서 직접 카카오 인증을 요청합니다.
  const KAKAO_CLIENT_ID = import.meta.env.VITE_KAKAO_CLIENT_ID;
  // 💡 [개선] .env 파일에서 Redirect URI를 가져옵니다.
  const KAKAO_REDIRECT_URI = import.meta.env.VITE_KAKAO_REDIRECT_URI;

  const KAKAO_AUTH_URL = `https://kauth.kakao.com/oauth/authorize?client_id=${KAKAO_CLIENT_ID}&redirect_uri=${KAKAO_REDIRECT_URI}&response_type=code`;

  const handleKakaoLogin = () => {
    window.location.href = KAKAO_AUTH_URL;
  };

  return (
    <button
      onClick={handleKakaoLogin}
      className="w-full py-2 px-4 bg-[#FEE500] text-[#3C1E1E] font-semibold rounded-lg shadow-md hover:bg-yellow-400 transition duration-200 flex items-center justify-center"
    >
      {/* 💡 [개선] 공식 카카오 심볼 SVG로 교체 */}
      <svg
        className="w-5 h-5 mr-2"
        aria-hidden="true"
        focusable="false"
        role="img"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 48 48"
      >
        <path
          fill="#3C1E1E"
          d="M24 4C12.95 4 4 12.95 4 24s8.95 20 20 20 20-8.95 20-20S35.05 4 24 4zm7.25 29.3c-.35.2-.78.34-1.2.45-1.1.28-2.3.43-3.55.43-3.35 0-6.4-1.4-8.5-3.8-2.1-2.4-3.2-5.4-3.2-8.8 0-3.4 1.1-6.4 3.2-8.8 2.1-2.4 5.15-3.8 8.5-3.8 1.25 0 2.45.15 3.55.43.42.1.85.25 1.2.45l-.65 2.7c-.3-.15-.6-.25-.9-.35-.8-.2-1.65-.3-2.55-.3-2.15 0-4.1.8-5.6 2.3-1.5 1.5-2.3 3.5-2.3 5.8s.8 4.3 2.3 5.8c1.5 1.5 3.45 2.3 5.6 2.3.9 0 1.75-.1 2.55-.3.3-.1.6-.2.9-.35l.65 2.7z"
        />
      </svg>
      카카오로 로그인
    </button>
  );
};

export default KakaoLoginButton;
