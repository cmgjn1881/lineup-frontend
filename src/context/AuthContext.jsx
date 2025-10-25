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
    localStorage.removeItem('userId'); // 💡 userId도 제거
  }, []);

  // 로그아웃 처리
  const logout = useCallback(() => {
    const currentAccess = localStorage.getItem('accessToken');
    const currentRefresh = localStorage.getItem('refreshToken');

    if (currentRefresh && currentAccess) {
      // API 클라이언트가 아닌 axios를 직접 사용하여 순환 참조 방지
      // 💡 [수정] 백엔드는 accessToken만 필요로 하므로, accessToken만 담아서 요청합니다.
      // 💡 [수정] axios를 직접 사용하므로 Authorization 헤더를 수동으로 추가해야 합니다.
      axios
        .post(
          `${API_BASE_URL}/auth/logout`, // 💡 [수정] API_BASE_URL 사용
          {}, // 💡 [수정] 서버는 헤더에서 토큰을 읽으므로 요청 본문은 비워둡니다.
          {
            headers: { Authorization: `Bearer ${currentAccess}` },
          }
        )
        .catch((err) => {
          console.error('백엔드 로그아웃 실패:', err);
        });
    }

    // 클라이언트 측 토큰 삭제
    clearAuthData();
    alert('로그아웃되었습니다.');
  }, [clearAuthData]);

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
      await api.withdraw(password);

      // 서버 처리 성공 시: 클라이언트 상태 초기화 로직 재사용
      clearAuthData();
      alert('계정이 성공적으로 탈퇴되었습니다.');
    } catch (err) {
      console.error('계정 탈퇴 실패:', err);
      // 💡 [수정] ApiClient의 인터셉터가 401을 처리하므로, 여기서는 logout()을 직접 호출할 필요가 없습니다.
      if (err.response?.status === 401 || err.response?.status === 403) {
        alert('인증 정보가 유효하지 않아 탈퇴 처리에 실패했습니다. 다시 로그인해 주세요.');
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
