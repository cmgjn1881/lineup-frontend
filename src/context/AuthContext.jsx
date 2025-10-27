// src/context/AuthContext.jsx

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../api/ApiClient'; // 💡 API_BASE_URL 임포트
import { useApiClient } from '../api/ApiClient'; // 💡 ApiClient 사용을 위해 임포트
// 1. Context 정의를 별도 파일에서 임포트
import { AuthContext } from './AuthContextDefinition';

// 2. Auth Provider Component
export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userEmail, setUserEmail] = useState(localStorage.getItem('userEmail'));
  const [userName, setUserName] = useState(localStorage.getItem('userName')); // ✨ userName 상태 추가
  const [accessToken, setAccessToken] = useState(localStorage.getItem('accessToken'));
  const [isSocial, setIsSocial] = useState(localStorage.getItem('isSocial') === 'true'); // 💡 소셜 로그인 여부 상태
  const [refreshToken, setRefreshToken] = useState(localStorage.getItem('refreshToken'));

  // 초기 로드 시 인증 상태 복원
  useEffect(() => {
    if (accessToken) {
      const storedEmail = localStorage.getItem('userEmail');
      const storedUserName = localStorage.getItem('userName'); // ✨ userName 불러오기
      if (storedEmail) setUserEmail(storedEmail);
      if (localStorage.getItem('isSocial') === 'true') setIsSocial(true); // 💡 isSocial 상태 복원
      if (storedUserName) setUserName(storedUserName); // ✨ userName 상태 설정
      setIsAuthenticated(true);
    }
  }, [accessToken]);

  // 🔑 [재사용 함수] 클라이언트 측 인증 데이터 초기화
  const clearAuthData = useCallback(() => {
    setAccessToken(null);
    setRefreshToken(null);
    setUserName(null); // ✨ userName 초기화
    setUserEmail(null);
    setIsSocial(false); // 💡 isSocial 초기화
    setIsAuthenticated(false);
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('isSocial'); // 💡 isSocial 제거
    localStorage.removeItem('userName'); // 💡 userName 제거
    localStorage.removeItem('userId'); // 💡 userId도 제거
  }, []);

  // 로그아웃 처리
  const logout = useCallback(
    async (reason) => {
      const wasSocial = localStorage.getItem('isSocial') === 'true';
      const accessToken = localStorage.getItem('accessToken');

      // 1. 백엔드에 로그아웃 요청 (토큰이 있는 경우)
      // 💡 [개선] 사용자가 직접 로그아웃 버튼을 눌렀을 때만 서버에 요청
      if (accessToken && reason === 'user') {
        try {
          await axios.post(`${API_BASE_URL}/auth/logout`, {}, { headers: { Authorization: `Bearer ${accessToken}` } });
        } catch (err) {
          console.error('백엔드 로그아웃 요청 실패:', err);
          // 실패하더라도 클라이언트 측 로그아웃은 계속 진행
        }
      }

      // 2. 클라이언트 측 인증 정보 초기화
      clearAuthData();

      // 💡 [개선] 로그아웃 사유에 따라 다른 메시지를 표시합니다.
      if (reason === 'session_expired') {
        alert('세션이 만료되어 자동으로 로그아웃되었습니다. 다시 로그인해주세요.');
      } else {
        alert('로그아웃되었습니다.');
      }

      // 3. 카카오 로그인 사용자였을 경우, 카카오 세션도 로그아웃
      if (wasSocial) {
        const KAKAO_CLIENT_ID = import.meta.env.VITE_KAKAO_CLIENT_ID;
        const LOGOUT_REDIRECT_URI = `${window.location.origin}/`; // 로그아웃 후 돌아갈 메인 페이지

        // 페이지를 카카오 로그아웃 URL로 이동시킵니다.
        window.location.href = `https://kauth.kakao.com/oauth/logout?client_id=${KAKAO_CLIENT_ID}&logout_redirect_uri=${LOGOUT_REDIRECT_URI}`;
      } else {
        // 일반 로그인의 경우, 메인 페이지로 이동
        // (이미 ProtectedRoute에 의해 로그인 페이지로 리다이렉트되므로 이 코드는 선택사항)
        window.location.href = '/';
      }
    },
    [clearAuthData]
  );

  // 토큰 저장 및 상태 업데이트
  const setTokens = useCallback((newAccess, newRefresh, email, name) => {
    setAccessToken(newAccess);
    setRefreshToken(newRefresh);
    localStorage.setItem('accessToken', newAccess);
    localStorage.setItem('refreshToken', newRefresh);

    setIsAuthenticated(true);
    localStorage.setItem('isSocial', 'false'); // 💡 일반 로그인은 isSocial을 false로 저장

    if (email) {
      setUserEmail(email);
      localStorage.setItem('userEmail', email);
    }
    if (name) {
      setUserName(name);
      localStorage.setItem('userName', name); // ✨ userName 저장
    }
  }, []);

  // 💡 [추가] 소셜 로그인 후 토큰과 userId로 로그인 처리하는 함수
  //    ApiClient를 직접 사용하지 않고, axios를 사용하여 순환 참조를 방지합니다.
  const loginWithToken = useCallback(
    (accessToken, refreshToken, userId, username, navigate) => {
      // 💡 [수정] username 파라미터 추가
      try {
        // 💡 [수정] 이제 모든 정보가 준비된 상태로 호출되므로, 바로 저장하고 인증 상태로 만듭니다.
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        localStorage.setItem('userId', userId);
        localStorage.setItem('userName', username);
        localStorage.setItem('isSocial', 'true'); // 💡 소셜 로그인은 isSocial을 true로 저장

        setAccessToken(accessToken);
        setRefreshToken(refreshToken);
        setUserName(username);
        setIsSocial(true);
        setIsAuthenticated(true); // ⭐️ 모든 정보가 준비된 후 인증 상태로 변경
        navigate('/teams', { replace: true }); // ⭐️ 모든 처리가 끝난 후 페이지 이동
      } catch (error) {
        console.error('소셜 로그인 사용자 정보 조회 실패:', error);
        logout(); // 실패 시 모든 인증 정보 초기화
      }
    },
    [logout] // setTokens는 더 이상 직접적인 의존성이 아님
  );

  // � [추가] 계정 탈퇴 처리
  const api = useApiClient(); // 💡 ApiClient 인스턴스 생성
  const withdraw = useCallback(async () => {
    const isConfirmed = window.confirm('정말로 계정을 탈퇴하시겠습니까? 모든 데이터가 삭제되며 복구할 수 없습니다.');
    if (!isConfirmed) {
      return;
    }

    let password = '';
    // 💡 [수정] 소셜 로그인 사용자가 아닌 경우에만 비밀번호를 입력받습니다.
    if (!isSocial) {
      password = window.prompt('계정 탈퇴를 위해 비밀번호를 입력해주세요.');
      if (password === null) {
        // 사용자가 '취소'를 누르면 null이 반환됩니다.
        alert('탈퇴가 취소되었습니다.');
        return;
      }
    }

    try {
      // 💡 [수정] ApiClient를 사용하여 토큰 만료 시 자동 재발급을 활용합니다.
      // 💡 [수정] isSocial 값에 따라 password 전달
      await api.withdraw(isSocial ? '' : password);

      // 서버 처리 성공 시:
      alert('계정이 성공적으로 탈퇴되었습니다.');

      // 💡 [개선] 소셜 로그인 사용자의 경우, 카카오와 연결도 끊습니다.
      if (isSocial) {
        const KAKAO_CLIENT_ID = import.meta.env.VITE_KAKAO_CLIENT_ID;
        const LOGOUT_REDIRECT_URI = `${window.location.origin}/`; // 연결 해제 후 돌아올 메인 페이지
        window.location.href = `https://kauth.kakao.com/oauth/logout?client_id=${KAKAO_CLIENT_ID}&logout_redirect_uri=${LOGOUT_REDIRECT_URI}`;
      } else {
        // 일반 사용자는 클라이언트 데이터만 정리
        clearAuthData();
      }
    } catch (err) {
      console.error('계정 탈퇴 실패:', err);
      // 💡 [수정] ApiClient의 인터셉터가 401을 처리하므로, 여기서는 logout()을 직접 호출할 필요가 없습니다.
      if (err.response?.status === 401 || err.response?.status === 403) {
        alert('인증 정보가 유효하지 않아 탈퇴 처리에 실패했습니다. 다시 로그인해 주세요.');
      } else {
        alert(err.response?.data?.message || '계정 탈퇴 중 오류가 발생했습니다.');
      }
    }
  }, [api, isSocial, clearAuthData]); // 💡 의존성 배열 업데이트

  const authContextValue = useMemo(
    () => ({
      isAuthenticated,
      userEmail,
      userName, // ✨ Context 값으로 전달
      isSocial, // 💡 isSocial 값 전달
      accessToken,
      refreshToken,
      setTokens,
      loginWithToken, // 💡 새로 만든 함수를 context에 포함
      logout,
      withdraw,
    }),
    [
      isAuthenticated,
      userEmail,
      userName,
      isSocial,
      accessToken,
      refreshToken,
      setTokens,
      loginWithToken,
      logout,
      withdraw,
    ]
  );

  return <AuthContext.Provider value={authContextValue}>{children}</AuthContext.Provider>;
};
