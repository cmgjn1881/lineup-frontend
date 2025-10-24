// src/pages/KakaoLoginButton.jsx

import React from 'react';

const KakaoLoginButton = () => {
  // 💡 백엔드의 카카오 로그인 시작 URL로 직접 이동시킵니다.
  //    vite.config.js의 VITE_API_BASE_URL을 사용합니다.
  const KAKAO_AUTH_URL = `${import.meta.env.VITE_API_BASE_URL}/oauth2/authorization/kakao`;

  const handleKakaoLogin = () => {
    window.location.href = KAKAO_AUTH_URL;
  };

  return (
    <button
      onClick={handleKakaoLogin}
      className="w-full py-2 px-4 bg-[#FEE500] text-[#3C1E1E] font-semibold rounded-lg shadow-md hover:bg-yellow-400 transition duration-200 flex items-center justify-center"
    >
      {/* 카카오 로고 SVG */}
      <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="#000000" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10c5.524 0 10-4.477 10-10S17.524 2 12 2zM8.812 14.444c-.08.2-.24.356-.44.444-.111.044-.231.067-.351.067-.28 0-.551-.124-.741-.346-.2-.222-.301-.511-.301-.822s.101-.6.301-.822c.2-.222.471-.347.741-.347.12 0 .24.022.351.067.2.088.36.244.44.444.08.2.12.422.12.656s-.04.456-.12.656zm3.188-5.111c-.08.2-.24.356-.44.444-.111.044-.231.067-.351.067-.28 0-.551-.124-.741-.346-.2-.222-.301-.511-.301-.822s.101-.6.301-.822c.2-.222.471-.347.741-.347.12 0 .24.022.351.067.2.088.36.244.44.444.08.2.12.422.12.656s-.04.456-.12.656zm3.188 5.111c-.08.2-.24.356-.44.444-.111.044-.231.067-.351.067-.28 0-.551-.124-.741-.346-.2-.222-.301-.511-.301-.822s.101-.6.301-.822c.2-.222.471-.347.741-.347.12 0 .24.022.351.067.2.088.36.244.44.444.08.2.12.422.12.656s-.04.456-.12.656z" />
      </svg>
      카카오로 로그인
    </button>
  );
};

export default KakaoLoginButton;
