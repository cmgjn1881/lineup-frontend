// src/context/AuthContext.jsx

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
// 1. Context 정의를 별도 파일에서 임포트
import { AuthContext } from './AuthContextDefinition';

// 2. Auth Provider Component
export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userEmail, setUserEmail] = useState(localStorage.getItem('userEmail'));
  const [userName, setUserName] = useState(localStorage.getItem('userName')); // ✨ userName 상태 추가
  const [accessToken, setAccessToken] = useState(localStorage.getItem('accessToken'));
  const [refreshToken, setRefreshToken] = useState(localStorage.getItem('refreshToken'));

  // 초기 로드 시 인증 상태 복원
  useEffect(() => {
    if (accessToken) {
      const storedEmail = localStorage.getItem('userEmail');
      const storedUserName = localStorage.getItem('userName'); // ✨ userName 불러오기
      if (storedEmail) setUserEmail(storedEmail);
      if (storedUserName) setUserName(storedUserName); // ✨ userName 상태 설정
      setIsAuthenticated(true);
    }
  }, [accessToken]);

  // 토큰 저장 및 상태 업데이트
  const setTokens = useCallback((newAccess, newRefresh, email, name) => {
    setAccessToken(newAccess);
    setRefreshToken(newRefresh);
    localStorage.setItem('accessToken', newAccess);
    localStorage.setItem('refreshToken', newRefresh);
    setIsAuthenticated(true);

    if (email) {
      setUserEmail(email);
      localStorage.setItem('userEmail', email);
    }
    if (name) {
      setUserName(name);
      localStorage.setItem('userName', name); // ✨ userName 저장
    }
  }, []);

  // 🔑 [재사용 함수] 클라이언트 측 인증 데이터 초기화
  const clearAuthData = useCallback(() => {
    setAccessToken(null);
    setRefreshToken(null);
    setUserName(null); // ✨ userName 초기화
    setUserEmail(null);
    setIsAuthenticated(false);
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userEmail');
  }, []);

  // 로그아웃 처리
  const logout = useCallback(() => {
    const currentAccess = localStorage.getItem('accessToken');
    const currentRefresh = localStorage.getItem('refreshToken');

    if (currentRefresh && currentAccess) {
      // API 클라이언트가 아닌 axios를 직접 사용하여 순환 참조 방지
      axios.post('/api/auth/logout', { refreshToken: currentRefresh, accessToken: currentAccess }).catch((err) => {
        console.error('백엔드 로그아웃 실패:', err);
      });
    }

    // 클라이언트 측 토큰 삭제
    clearAuthData();
    alert('로그아웃되었습니다.');
  }, [clearAuthData]);

  // 🔑 [추가] 계정 탈퇴 처리
  const withdraw = useCallback(async () => {
    const isConfirmed = window.confirm('정말로 계정을 탈퇴하시겠습니까? 모든 데이터가 삭제되며 복구할 수 없습니다.');
    if (!isConfirmed) return;

    try {
      const currentAccess = localStorage.getItem('accessToken');

      // Access Token을 헤더에 담아 탈퇴 API (DELETE) 호출 가정
      await axios.delete('/api/auth/withdraw', {
        headers: {
          Authorization: `Bearer ${currentAccess}`,
        },
      });

      // 서버 처리 성공 시: 클라이언트 상태 초기화 로직 재사용
      clearAuthData();
      alert('계정이 성공적으로 탈퇴되었습니다.');
    } catch (err) {
      console.error('계정 탈퇴 실패:', err);
      if (err.response?.status === 401 || err.response?.status === 403) {
        alert('인증 정보가 만료되어 탈퇴 처리에 실패했습니다. 다시 로그인해 주세요.');
        logout(); // 인증 실패 시 강제 로그아웃 (백엔드 로그아웃 로직 포함)
      } else {
        alert(err.response?.data?.message || '계정 탈퇴 중 오류가 발생했습니다.');
      }
    }
  }, [clearAuthData, logout]);

  const authContextValue = useMemo(
    () => ({
      isAuthenticated,
      userEmail,
      userName, // ✨ Context 값으로 전달
      accessToken,
      refreshToken,
      setTokens,
      logout,
      withdraw,
    }),
    [isAuthenticated, userEmail, userName, accessToken, refreshToken, setTokens, logout, withdraw]
  );

  return <AuthContext.Provider value={authContextValue}>{children}</AuthContext.Provider>;
};
