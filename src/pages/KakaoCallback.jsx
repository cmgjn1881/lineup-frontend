// src/pages/KakaoCallback.jsx (새 파일)

import React, { useEffect, useState } from 'react';
import axios from 'axios'; // 💡 카카오와 직접 통신하기 위해 axios를 임포트합니다.
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
      // 💡 [오류 수정] getKakaoToken, loginToServer 함수를 useEffect 내부로 이동하여
      //    의존성 문제를 해결하고 코드를 더 안정적으로 만듭니다.

      // 1. URL에서 인가 코드(code)를 추출합니다.
      const code = new URLSearchParams(location.search).get('code');

      if (!code) {
        setError('카카오 인증에 실패했습니다. (인가 코드가 없음)');
        console.error('카카오로부터 인가 코드를 받아오지 못했습니다.');
        return;
      }

      try {
        // 1-1. 인가 코드로 카카오 토큰을 요청하는 함수
        const getKakaoToken = async (code) => {
          const KAKAO_CLIENT_ID = import.meta.env.VITE_KAKAO_CLIENT_ID;
          // 💡 [수정] KakaoLoginButton과 동일하게 redirect_uri를 동적으로 생성합니다.
          // 이 값은 카카오에 토큰을 요청할 때, 첫 단계(로그인 버튼 클릭)에서 사용한 redirect_uri와 일치해야 합니다.
          const KAKAO_REDIRECT_URI = `${window.location.origin}/#/kakao/callback`;

          const response = await axios.post(
            'https://kauth.kakao.com/oauth/token',
            new URLSearchParams({
              grant_type: 'authorization_code',
              client_id: KAKAO_CLIENT_ID,
              redirect_uri: KAKAO_REDIRECT_URI,
              code: code,
            }),
            {
              headers: {
                'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
              },
            }
          );

          const kakaoAccessToken = response.data.access_token;
          if (!kakaoAccessToken) {
            throw new Error('카카오 엑세스 토큰 발급에 실패했습니다.');
          }
          return kakaoAccessToken;
        };

        // 1-2. 카카오 토큰으로 우리 서버에 로그인하는 함수
        const loginToServer = async (kakaoAccessToken) => {
          const serverResponse = await api.socialLogin('kakao', kakaoAccessToken);
          const { accessToken, refreshToken, userId, username } = serverResponse.data;

          // auth.loginWithToken은 성공 시 페이지 이동까지 책임짐
          auth.loginWithToken(accessToken, refreshToken, userId, username, navigate);
        };

        // 💡 [개선] 추상화된 함수를 순서대로 호출
        const kakaoAccessToken = await getKakaoToken(code);
        await loginToServer(kakaoAccessToken);
      } catch (err) {
        // 💡 에러 핸들링 강화
        if (err.response) {
          // 서버(카카오 또는 우리 서버)에서 에러 응답을 보낸 경우
          console.error('카카오 로그인 처리 중 서버 오류:', err.response.data);
          setError(
            err.response.data.error_description ||
              err.response.data.message ||
              '로그인 처리 중 서버에서 오류가 발생했습니다.'
          );
        } else {
          // 네트워크 오류 등
          console.error('카카오 로그인 처리 중 네트워크 오류:', err.message);
          setError('카카오 로그인에 실패했습니다. 네트워크 연결을 확인해주세요.');
        }
      }
    };

    processKakaoLogin();
  }, [location, api, auth, navigate]);

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
