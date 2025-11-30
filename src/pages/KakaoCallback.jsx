// src/pages/KakaoCallback.jsx (새 파일)

import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios'; // 💡 카카오와 직접 통신하기 위해 axios를 임포트합니다.
import { useNavigate } from 'react-router-dom';
import { useApiClient } from '../api/ApiClient';
import { useAuth } from '../context/useAuth';
import { Loader2 } from 'lucide-react';

const KakaoCallback = () => {
  //const location = useLocation();
  const navigate = useNavigate();
  const api = useApiClient();
  const auth = useAuth();
  const [error, setError] = useState(null);

  // 💡 [개선] 1. 인가 코드로 카카오 토큰을 요청하는 함수를 분리합니다.
  const getKakaoToken = useCallback(async (code) => {
    const KAKAO_CLIENT_ID = import.meta.env.VITE_KAKAO_CLIENT_ID;
    const KAKAO_REDIRECT_URI = `${window.location.origin}/kakao-redirect.html`;
    // 💡 [개선] 환경 변수에서 client_secret을 가져옵니다.
    const KAKAO_CLIENT_SECRET = import.meta.env.VITE_KAKAO_CLIENT_SECRET;

    const params = new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: KAKAO_CLIENT_ID,
      redirect_uri: KAKAO_REDIRECT_URI,
      code: code,
    });

    // 💡 [개선] client_secret 값이 존재할 경우에만 파라미터에 추가합니다. 현재는 사용 안함
    if (KAKAO_CLIENT_SECRET) {
      params.append('client_secret', KAKAO_CLIENT_SECRET);
    }

    const response = await axios.post('https://kauth.kakao.com/oauth/token', params, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
      },
    });

    const kakaoAccessToken = response.data.access_token;
    if (!kakaoAccessToken) {
      throw new Error('카카오 엑세스 토큰 발급에 실패했습니다.');
    }
    return kakaoAccessToken;
  }, []);

  // 💡 [개선] 2. 카카오 토큰으로 우리 서버에 로그인하는 함수를 분리합니다.
  const loginToServer = useCallback(
    async (kakaoAccessToken) => {
      const serverResponse = await api.socialLogin('kakao', kakaoAccessToken);
      // 💡 [수정] 응답 데이터에서 email을 추출하여 loginWithToken으로 전달합니다.
      const { accessToken, refreshToken, userId, username, email } = serverResponse.data;
      await auth.loginWithToken(accessToken, refreshToken, userId, username, email);
      navigate('/teams', { replace: true });
    },
    [api, auth, navigate]
  );

  // 💡 [수정] 컴포넌트가 마운트되면 localStorage에서 인가 코드를 직접 확인하여 로그인 프로세스를 시작합니다.
  useEffect(() => {
    const processKakaoLogin = async () => {
      // 💡 [수정] 1. URL 쿼리 대신 localStorage에서 인가 코드를 가져옵니다.
      const code = localStorage.getItem('kakao-code');
      const kakaoError = localStorage.getItem('kakao-error');

      // 사용한 코드는 즉시 삭제하여 보안을 강화합니다.
      // 이 로직이 useEffect 내에서 여러 번 실행되더라도 문제가 발생하지 않도록 합니다.
      localStorage.removeItem('kakao-code');
      localStorage.removeItem('kakao-error');

      if (kakaoError) {
        const parsedError = JSON.parse(kakaoError);
        const errorMessage = parsedError.error_description || '카카오 인증 중 오류가 발생했습니다.';
        setError(errorMessage);
        console.error('카카오 인증 오류:', parsedError);
        return;
      }

      // 💡 [수정] 코드가 없으면 그냥 리턴하여 무한 로딩 상태를 유지합니다.
      // kakao-redirect.html에서 코드를 설정하고 이 페이지로 리디렉션하므로,
      // 잠시 후 코드가 발견될 것입니다. 만약 계속 코드가 없다면 문제가 있는 상황입니다.
      if (!code) {
        return;
      }

      try {
        // 💡 [개선] 추상화된 함수를 순서대로 호출
        const kakaoAccessToken = await getKakaoToken(code);
        await loginToServer(kakaoAccessToken);
      } catch (err) {
        // 💡 에러 핸들링 강화
        if (err.response) {
          console.error('카카오 로그인 처리 중 서버 오류:', err.response.data);
          setError(
            err.response.data.error_description ||
              err.response.data.message ||
              '로그인 처리 중 서버에서 오류가 발생했습니다.'
          );
        } else {
          console.error('카카오 로그인 처리 중 네트워크 오류:', err.message);
          setError('카카오 로그인에 실패했습니다. 네트워크 연결을 확인해주세요.');
        }
      }
    };

    processKakaoLogin();
  }, [getKakaoToken, loginToServer]);

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
