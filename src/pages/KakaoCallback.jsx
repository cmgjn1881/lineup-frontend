// src/pages/KakaoCallback.jsx (새 파일)

import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useApiClient } from '../api/ApiClient';
import { useAuth } from '../context/useAuth';
import { Loader2 } from 'lucide-react';

const KakaoCallback = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const api = useApiClient();
  const auth = useAuth();
  const [error, setError] = useState(null);

  useEffect(() => {
    const processKakaoLogin = async () => {
      // 1. URL에서 인가 코드(code)를 추출합니다.
      const code = new URLSearchParams(location.search).get('code');

      if (!code) {
        setError('카카오 인증에 실패했습니다. (인가 코드가 없음)');
        console.error('인가 코드를 받아오지 못했습니다.');
        return;
      }

      try {
        // 2. 백엔드에 인가 코드를 보내 토큰을 요청합니다.
        // 💡 백엔드의 카카오 로그인 처리 API 엔드포인트를 호출합니다.
        //    (예: /api/auth/kakao, /login/oauth2/code/kakao 등)
        const res = await api.kakaoLogin(code); // ApiClient에 kakaoLogin 함수 추가 필요

        // 3. 백엔드로부터 받은 토큰(우리 서비스의 토큰)을 저장하고 로그인 처리합니다.
        const { accessToken, refreshToken, email: userEmail, username: userName } = res.data;
        auth.setTokens(accessToken, refreshToken, userEmail, userName);

        // 4. 로그인 성공 후 메인 페이지로 이동합니다.
        navigate('/teams');
      } catch (err) {
        // 💡 여기서 백엔드로부터 받은 에러 메시지를 확인할 수 있습니다.
        console.error('카카오 로그인 처리 중 오류:', err);
        setError(err.response?.data?.message || '카카오 로그인에 실패했습니다. 잠시 후 다시 시도해주세요.');
      }
    };

    processKakaoLogin();
  }, [location, api, auth, navigate]); // 💡 의존성 배열 순서를 조정하고, navigate의 역할을 명확히 합니다. (현재 구조에서는 큰 문제 없음)

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      {error ? (
        <div className="text-center">
          <p className="text-red-500 font-bold mb-4">로그인 오류</p>
          <p className="text-gray-700">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="mt-6 py-2 px-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            로그인 페이지로 돌아가기
          </button>
        </div>
      ) : (
        <div className="flex items-center text-gray-600">
          <Loader2 className="w-8 h-8 animate-spin mr-3" />
          <p className="text-lg">카카오 로그인 처리 중입니다...</p>
        </div>
      )}
    </div>
  );
};

export default KakaoCallback;
