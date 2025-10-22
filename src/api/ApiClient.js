// src/api/ApiClient.js

import axios from 'axios';
import { useContext, useMemo } from 'react';
import { AuthContext } from '../context/AuthContextDefinition';

const RENDER_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const API_BASE_URL = `${RENDER_BASE_URL}/api`;

// [핵심] Interceptor 설정이 포함된 API Client
class ApiClient {
  constructor(authContext) {
    this.auth = authContext;
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: { 'Content-Type': 'application/json' },
    });

    // 1. 요청 Interceptor: Access Token 추가
    this.client.interceptors.request.use((config) => {
      const token = this.auth.accessToken;
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // 2. 응답 Interceptor: 401 에러 감지 및 토큰 재발급 로직
    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        if (error.response && error.response.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          const refreshToken = this.auth.refreshToken;
          const oldAccessToken = this.auth.accessToken;

          if (refreshToken) {
            try {
              // 토큰 재발급 요청 (refresh API 호출)
              const refreshResponse = await this.client.post('/auth/refresh', {
                // baseURL 사용
                refreshToken: refreshToken,
                oldAccessToken: oldAccessToken,
              });

              const {
                accessToken: newAccessToken,
                refreshToken: newRefreshToken,
                email: userEmail,
                username: userName, // ✨ username 받아오기
              } = refreshResponse.data;

              // 토큰 업데이트 및 원래 요청 재시도
              this.auth.setTokens(newAccessToken, newRefreshToken, userEmail, userName); // ✨ setTokens에 userName 전달
              originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

              return this.client(originalRequest);
            } catch (refreshError) {
              // Refresh Token 만료 시 로그아웃 처리
              this.auth.logout();
              return Promise.reject(refreshError);
            }
          }
        }

        return Promise.reject(error);
      }
    );
  }

  // API 엔드포인트 호출 메서드
  login = (email, password) => this.client.post('/auth/login', { email, password });
  signup = (email, password, username, verificationCode) => {
    return this.client.post('/auth/signup', { email, password, username, verificationCode });
  };

  // 1. 이메일로 인증 코드 발송 요청 (POST /api/auth/send-code)
  sendVerificationCode = (email) => {
    return this.client.post('/auth/send-code', { email });
  };

  // 2. 인증 코드 확인 요청 (POST /api/auth/verify-code)
  verifyCode = (email, verificationCode) => {
    return this.client.post('/auth/verify-code', { email, verificationCode });
  };

  // 백엔드 로그아웃은 AuthProvider에서 axios 직접 사용 (순환 참조 방지)
  getUserInfo = () => this.client.get('/auth/profile'); // ProfilePage에서 사용할 API 추가

  // 팀 관리 API
  createTeam = (name) => this.client.post('/teams', { name });
  getTeams = () => this.client.get('/teams');
  deleteTeam = (teamId) => this.client.delete(`/teams/${teamId}`);

  // 선수 관리 API
  getTeamPlayers = (teamId) => this.client.get(`/teams/${teamId}/players`);
  createPlayer = (teamId, playerData) => this.client.post(`/teams/${teamId}/players`, playerData);
  updatePlayer = (teamId, playerId, playerData) => this.client.put(`/teams/${teamId}/players/${playerId}`, playerData);
  deletePlayer = (teamId, playerId) => this.client.delete(`/teams/${teamId}/players/${playerId}`);
}

// Custom Hook: API 클라이언트를 사용하기 쉽게 제공
export const useApiClient = () => {
  const auth = useContext(AuthContext);
  // authContext가 변경될 때만 새로운 인스턴스를 생성하도록 useMemo 사용
  return useMemo(() => new ApiClient(auth), [auth]);
};

// Custom Hook만 export하여 컴포넌트에서 사용
// export default ApiClient; // 클래스 자체는 불필요
