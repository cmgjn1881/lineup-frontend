// src/context/AuthContext.jsx

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import { API_BASE_URL, ApiClient } from '../api/ApiClient';
import { AuthContext } from './AuthContextDefinition';

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userEmail, setUserEmail] = useState(localStorage.getItem('userEmail'));
  const [userName, setUserName] = useState(localStorage.getItem('userName'));
  const [userId, setUserId] = useState(localStorage.getItem('userId'));
  const [accessToken, setAccessToken] = useState(localStorage.getItem('accessToken'));
  const [isSocial, setIsSocial] = useState(localStorage.getItem('isSocial') === 'true');
  const [refreshToken, setRefreshToken] = useState(localStorage.getItem('refreshToken'));

  const [isLoading, setIsLoading] = useState(true);

  // 💡 [핵심 수정] 초기 로드 시 localStorage에서 인증 정보를 동기적으로 확인합니다.
  // API 호출 없이, 저장된 정보만으로 인증 상태를 복원합니다.
  useEffect(() => {
    const storedToken = localStorage.getItem('accessToken');
    const storedUserName = localStorage.getItem('userName');

    if (storedToken && storedUserName) {
      // localStorage에 필요한 정보가 모두 있으면, 상태를 복원합니다.
      const storedEmail = localStorage.getItem('userEmail');
      const storedUserId = localStorage.getItem('userId');
      const storedIsSocial = localStorage.getItem('isSocial') === 'true';

      if (storedEmail) setUserEmail(storedEmail);
      if (storedUserId) setUserId(storedUserId);
      setIsSocial(storedIsSocial);
      setUserName(storedUserName);
      setIsAuthenticated(true);
    }
    setIsLoading(false);
  }, []);

  const clearAuthData = useCallback(() => {
    setAccessToken(null);
    setRefreshToken(null);
    setUserName(null);
    setUserId(null);
    setUserEmail(null);
    setIsSocial(false);
    setIsAuthenticated(false);
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('isSocial');
    localStorage.removeItem('userName');
    localStorage.removeItem('userId');
  }, []);

  // 로그아웃 처리
  const logout = useCallback(
    async (reason) => {
      const accessToken = localStorage.getItem('accessToken');

      if (accessToken && reason === 'user') {
        try {
          await axios.post(`${API_BASE_URL}/auth/logout`, {}, { headers: { Authorization: `Bearer ${accessToken}` } });
        } catch (err) {
          console.error('백엔드 로그아웃 요청 실패:', err);
        }
      }

      clearAuthData();

      if (reason === 'session_expired') {
        alert('세션이 만료되어 자동으로 로그아웃되었습니다. 다시 로그인해주세요.');
      } else {
        alert('로그아웃되었습니다.');
      }
    },
    [clearAuthData]
  );

  // 💡 [신규] 토큰만 갱신하는 함수
  const refreshTokens = useCallback((newAccess, newRefresh) => {
    setAccessToken(newAccess);
    setRefreshToken(newRefresh);
    localStorage.setItem('accessToken', newAccess);
    localStorage.setItem('refreshToken', newRefresh);
  }, []);

  // 💡 [수정] setTokens 함수의 이름을 login으로 변경하고 역할을 명확히 함
  const login = useCallback(
    (newAccess, newRefresh, email, name) => {
      // 토큰 갱신
      refreshTokens(newAccess, newRefresh);

      // 사용자 정보 저장
      if (email) {
        setUserEmail(email);
        localStorage.setItem('userEmail', email);
      }
      if (name) {
        setUserName(name);
        localStorage.setItem('userName', name);
      }
      setIsAuthenticated(true);
      localStorage.setItem('isSocial', 'false'); // 일반 로그인이므로 isSocial은 false
    },
    [refreshTokens]
  );

  const loginWithToken = useCallback(
    async (accessToken, refreshToken, newUserId, username) => {
      try {
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        localStorage.setItem('userId', newUserId);
        localStorage.setItem('userName', username);
        localStorage.setItem('isSocial', 'true');

        setAccessToken(accessToken);
        setRefreshToken(refreshToken);
        setUserId(newUserId);
        setUserName(username);
        setIsSocial(true);
        setIsAuthenticated(true);
        return Promise.resolve();
      } catch (error) {
        console.error('소셜 로그인 처리 중 에러:', error);
        logout('session_expired');
        return Promise.reject(error);
      }
    },
    [setAccessToken, setRefreshToken, setUserId, setUserName, setIsSocial, setIsAuthenticated, logout]
  );

  // 💡 [수정] ApiClient 생성자에 setTokens 대신 refreshTokens를 전달합니다.
  // withdraw 함수 내에서 사용되는 api 인스턴스가 토큰 재발급 로직을 올바르게 사용하도록 수정합니다.
  const api = useMemo(() => new ApiClient(refreshTokens, logout), [refreshTokens, logout]);

  const withdraw = useCallback(async () => {
    const isConfirmed = window.confirm('정말로 계정을 탈퇴하시겠습니까? 모든 데이터가 삭제되며 복구할 수 없습니다.');
    if (!isConfirmed) {
      return;
    }

    let password = '';
    if (!isSocial) {
      password = window.prompt('계정 탈퇴를 위해 비밀번호를 입력해주세요.');
      if (password === null) {
        alert('탈퇴가 취소되었습니다.');
        return;
      }
    }

    try {
      await api.withdraw(isSocial ? null : password);

      alert('계정이 성공적으로 탈퇴되었습니다.');

      clearAuthData();

      window.location.href = '/';
    } catch (err) {
      console.error('계정 탈퇴 실패:', err);
      if (err.response?.status === 401 || err.response?.status === 403) {
        alert('인증 정보가 유효하지 않아 탈퇴 처리에 실패했습니다. 다시 로그인해 주세요.');
      } else {
        alert(err.response?.data?.message || '계정 탈퇴 중 오류가 발생했습니다.');
      }
    }
  }, [api, isSocial, clearAuthData]);

  const authContextValue = useMemo(
    () => ({
      isAuthenticated,
      userEmail,
      userName,
      userId,
      isSocial,
      isLoading,
      accessToken,
      refreshToken,
      login, // 💡 이름 변경
      refreshTokens, // 💡 신규 함수 추가
      loginWithToken,
      logout,
      withdraw,
      clearAuthData,
    }),
    [
      isAuthenticated,
      userId,
      isLoading,
      userEmail,
      userName,
      isSocial,
      accessToken,
      refreshToken,
      login,
      refreshTokens,
      loginWithToken,
      logout,
      withdraw,
      clearAuthData,
    ]
  );

  if (isLoading) {
    // 💡 [핵심 수정] AuthProvider는 더 이상 레이아웃을 그리지 않습니다.
    // 로딩 중에는 자식 컴포넌트(RouterProvider)의 렌더링을 막기 위해 아무것도 반환하지 않습니다.
    return null; // 또는 <></> (React.Fragment)
  }

  return <AuthContext.Provider value={authContextValue}>{children}</AuthContext.Provider>;
};
