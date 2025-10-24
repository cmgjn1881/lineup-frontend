// src/pages/OAuthRedirectPage.jsx

import React, { useEffect } from 'react';
import axios from 'axios'; // 💡 axios를 직접 사용하기 위해 임포트합니다.
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import { Loader2 } from 'lucide-react';

const OAuthRedirectPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const auth = useAuth();

  useEffect(() => {
    const exchangeToken = async () => {
      console.log('OAuthRedirectPage useEffect 실행!');

      // 1. 💡 [수정] URL에서 tempToken을 추출합니다.
      const searchParams = new URLSearchParams(location.search);
      const tempToken = searchParams.get('tempToken');

      if (tempToken) {
        try {
          console.log('✅ 임시 토큰 추출 성공! 토큰 교환을 시도합니다.');
          // 2. 💡 [수정] 백엔드에 tempToken을 보내 실제 토큰들을 받아옵니다.
          const response = await axios.post('/api/auth/token/exchange', { tempToken });

          // 3. 💡 [수정] 응답으로 받은 실제 토큰 정보로 로그인 처리를 위임합니다.
          const { accessToken, refreshToken, userId, username } = response.data;
          auth.loginWithToken(accessToken, refreshToken, userId, username, navigate);
        } catch (error) {
          console.error('토큰 교환 실패:', error);
          alert('로그인 처리 중 오류가 발생했습니다. 다시 시도해주세요.');
          navigate('/', { replace: true });
        }
      } else {
        // 🚨 임시 토큰이 없는 경우
        if (location.search) {
          console.error('소셜 로그인에 필요한 임시 토큰이 없습니다. Search:', location.search);
        }

        if (!auth.isAuthenticated) {
          navigate('/', { replace: true });
        }
      }
    };

    exchangeToken();
  }, []); // 💡 [수정] 의존성 배열을 비워 이 useEffect가 처음 마운트될 때 한 번만 실행되도록 합니다.

  return (
    <div className="flex items-center justify-center h-screen text-gray-600">
      <Loader2 className="w-8 h-8 animate-spin mr-3" />
      <p className="text-lg">로그인 처리 중입니다...</p>
    </div>
  );
};

export default OAuthRedirectPage;
