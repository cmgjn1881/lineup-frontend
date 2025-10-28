// src/context/AuthContext.jsx

import React, { useState, useEffect, useCallback, useMemo } from 'react'; // 💡 ApiClient 사용을 위해 임포트
import axios from 'axios';
import { API_BASE_URL, ApiClient } from '../api/ApiClient'; // 💡 API_BASE_URL 및 ApiClient 임포트
// 1. Context 정의를 별도 파일에서 임포트
import { AuthContext } from './AuthContextDefinition';

// 2. Auth Provider Component
export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userEmail, setUserEmail] = useState(localStorage.getItem('userEmail'));
  const [userName, setUserName] = useState(localStorage.getItem('userName')); // ✨ userName 상태 추가
  const [userId, setUserId] = useState(localStorage.getItem('userId')); // ✨ userId 상태 추가
  const [accessToken, setAccessToken] = useState(localStorage.getItem('accessToken'));
  const [isSocial, setIsSocial] = useState(localStorage.getItem('isSocial') === 'true'); // 💡 소셜 로그인 여부 상태
  const [refreshToken, setRefreshToken] = useState(localStorage.getItem('refreshToken'));

  // 초기 로드 시 인증 상태 복원
  useEffect(() => {
    if (accessToken) {
      const storedEmail = localStorage.getItem('userEmail');
      const storedUserName = localStorage.getItem('userName'); // ✨ userName 불러오기
      const storedUserId = localStorage.getItem('userId'); // ✨ userId 불러오기
      if (storedEmail) setUserEmail(storedEmail);
      if (localStorage.getItem('isSocial') === 'true') setIsSocial(true); // 💡 isSocial 상태 복원
      if (storedUserId) setUserId(storedUserId); // ✨ userId 상태 설정
      if (storedUserName) setUserName(storedUserName); // ✨ userName 상태 설정
      setIsAuthenticated(true);
    }
  }, [accessToken]);

  // 🔑 [재사용 함수] 클라이언트 측 인증 데이터 초기화
  const clearAuthData = useCallback(() => {
    setAccessToken(null);
    setRefreshToken(null);
    setUserName(null); // ✨ userName 초기화
    setUserId(null); // ✨ userId 초기화
    setUserEmail(null);
    setIsSocial(false); // 💡 isSocial 초기화
    setIsAuthenticated(false);
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('isSocial'); // 💡 isSocial 제거
    localStorage.removeItem('userName'); // ✨ userName 제거
    localStorage.removeItem('userId'); // 💡 userId도 제거
  }, []);

  // 로그아웃 처리
  const logout = useCallback(
    async (reason) => {
      //const wasSocial = localStorage.getItem('isSocial') === 'true';
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
    },
    [clearAuthData]
  );

  // 토큰 저장 및 상태 업데이트
  const setTokens = useCallback(
    (newAccess, newRefresh, email, name) => {
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
    },
    [
      // 💡 [수정] setTokens가 의존하는 모든 상태 업데이트 함수를 배열에 추가합니다.
      // 이렇게 하면 setTokens 함수가 항상 최신 상태 업데이트 함수를 참조하게 됩니다.
      setAccessToken,
      setRefreshToken,
      setIsAuthenticated,
      setUserEmail,
      setUserName,
    ]
  );

  // 💡 [추가] 소셜 로그인 후 토큰과 userId로 로그인 처리하는 함수
  //    ApiClient를 직접 사용하지 않고, axios를 사용하여 순환 참조를 방지합니다.
  const loginWithToken = useCallback(
    async (accessToken, refreshToken, newUserId, username) => {
      // 💡 [수정] username 파라미터 추가, navigate 제거, async 추가
      try {
        // 💡 [수정] 이제 모든 정보가 준비된 상태로 호출되므로, 바로 저장하고 인증 상태로 만듭니다.
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        localStorage.setItem('userId', newUserId);
        localStorage.setItem('userName', username);
        localStorage.setItem('isSocial', 'true'); // 💡 소셜 로그인은 isSocial을 true로 저장

        setAccessToken(accessToken);
        setRefreshToken(refreshToken);
        setUserId(newUserId);
        setUserName(username);
        setIsSocial(true);
        setIsAuthenticated(true); // ⭐️ 모든 정보가 준비된 후 인증 상태로 변경
        // ⭐️ 페이지 이동은 호출한 쪽에서 담당하도록 Promise를 반환합니다.
        return Promise.resolve();
      } catch (error) {
        console.error('소셜 로그인 처리 중 에러:', error);
        logout('session_expired'); // 실패 시 모든 인증 정보 초기화
        return Promise.reject(error);
      }
    },
    [
      // 💡 [수정] loginWithToken이 의존하는 모든 상태 업데이트 함수와 logout을 배열에 추가합니다.
      setAccessToken,
      setRefreshToken,
      setUserId,
      setUserName,
      setIsSocial,
      setIsAuthenticated,
      logout,
    ]
  );

  // 💡 [수정] ApiClient 인스턴스를 AuthProvider 내에서 생성합니다.
  // 이제 ApiClient는 setTokens와 logout 함수에만 의존하므로,
  // 상태(accessToken 등)가 변경되어도 재생성되지 않아 stale state 문제가 발생하지 않습니다.
  const api = useMemo(() => new ApiClient(setTokens, logout), [setTokens, logout]);

  // 계정 탈퇴 처리 (useCallback의 의존성 배열에 api 추가)
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
      await api.withdraw(isSocial ? null : password);

      // 서버 처리 성공 시:
      alert('계정이 성공적으로 탈퇴되었습니다.');

      // 💡 [개선] 사용자 종류와 관계없이 클라이언트 데이터를 먼저 정리합니다.
      // 서버에서 탈퇴 처리가 성공했으므로 클라이언트 데이터 정리
      clearAuthData();

      // 💡 [수정] 서버에서 연결 끊기를 담당하므로, 클라이언트는 홈으로 이동만 합니다.
      window.location.href = '/';
    } catch (err) {
      console.error('계정 탈퇴 실패:', err);
      // 💡 [수정] 401 오류는 ApiClient의 인터셉터가 토큰 재발급을 시도하므로 별도 처리가 필요 없습니다.
      // 재발급마저 실패하여 최종적으로 401, 403 오류가 발생한 경우에만 사용자에게 알립니다.
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
      userName, // ✨ Context 값으로 전달
      userId, // ✨ userId 값 전달
      isSocial, // 💡 isSocial 값 전달
      accessToken,
      refreshToken,
      setTokens,
      loginWithToken, // 💡 새로 만든 함수를 context에 포함
      logout,
      // 💡 [추가] withdraw와 clearAuthData를 context value에 포함시켜야 합니다.
      // useApiClient의 의존성 배열에서 제거되었으므로, 다른 곳에서 사용될 수 있도록 명시적으로 전달해야 합니다.
      withdraw,
      clearAuthData,
    }),
    [
      isAuthenticated,
      userId,
      userEmail,
      userName,
      isSocial,
      accessToken,
      refreshToken,
      setTokens,
      loginWithToken,
      logout,
      withdraw,
      clearAuthData,
    ]
  );

  return <AuthContext.Provider value={authContextValue}>{children}</AuthContext.Provider>;
};
