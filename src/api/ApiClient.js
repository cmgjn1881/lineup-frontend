// src/api/ApiClient.js

import axios from 'axios';
import { useContext, useMemo } from 'react';
import { AuthContext } from '../context/AuthContextDefinition';

export const RENDER_BASE_URL = import.meta.env.VITE_API_BASE_URL;
export const API_BASE_URL = `${RENDER_BASE_URL}/api`;

export class ApiClient {
  // 💡 [수정] 생성자에서 authContext 전체 대신 setTokens와 logout 함수만 받습니다.
  // 이렇게 하면 ApiClient가 accessToken, refreshToken 같은 상태 값에 직접 의존하지 않게 됩니다.
  constructor(refreshTokens, logout) {
    // 💡 [추가] 토큰 재발급 로직의 경쟁 상태를 방지하기 위한 변수
    this.refreshTokens = refreshTokens;
    this.isRefreshing = false;
    this.failedQueue = [];

    this.logout = logout;
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: { 'Content-Type': 'application/json' },
    });

    // 1. 요청 Interceptor: Access Token 추가
    this.client.interceptors.request.use((config) => {
      // AuthContext의 상태 대신 localStorage에서 직접 토큰을 읽어옵니다.
      const token = localStorage.getItem('accessToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // 2. 응답 Interceptor: 401 에러 감지 및 토큰 재발급 로직
    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        // 💡 [수정] processFailedQueue와 addFailedRequest 함수를 인터셉터 내부에 정의합니다.
        const processFailedQueue = (error, token = null) => {
          this.failedQueue.forEach((prom) => {
            if (error) {
              prom.reject(error);
            } else {
              prom.resolve(token);
            }
          });
          this.failedQueue = [];
        };

        const addFailedRequest = (originalRequest) => {
          return new Promise((resolve, reject) => {
            this.failedQueue.push({ resolve, reject, originalRequest });
          });
        };

        const originalRequest = error.config;

        if (error.response && error.response.status === 401 && !originalRequest._retry) {
          // 💡 [수정] 토큰 재발급 중에는 다른 요청들을 대기시킵니다.
          if (this.isRefreshing) {
            const newAccessToken = await addFailedRequest(originalRequest);
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
            return this.client(originalRequest);
          }

          originalRequest._retry = true;
          this.isRefreshing = true;

          // 💡 [수정] localStorage에서 직접 토큰을 읽어옵니다.
          const refreshToken = localStorage.getItem('refreshToken');

          if (refreshToken) {
            try {
              const refreshEndpoint = `${RENDER_BASE_URL}/api/auth/refresh`;

              // 💡 [수정] refreshToken을 body에 담아 토큰 재발급을 요청합니다.
              const refreshResponse = await axios.post(
                refreshEndpoint,
                { refreshToken } // 요청 본문에 refreshToken을 포함합니다.
              );

              // 💡 [수정] 서버로부터 새로운 accessToken과 refreshToken을 받습니다.
              const { accessToken: newAccessToken, refreshToken: newRefreshToken } = refreshResponse.data;

              // 💡 [핵심 수정] 사용자 정보를 건드리지 않고 토큰만 갱신하는 새 함수를 호출합니다.
              this.refreshTokens(newAccessToken, newRefreshToken);
              processFailedQueue(null, newAccessToken); // 💡 대기 중인 요청들 재개
              originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

              return this.client(originalRequest);
            } catch (refreshError) {
              // Refresh Token 만료 시 로그아웃 처리
              processFailedQueue(refreshError, null); // 💡 대기 중인 요청들 실패 처리
              this.logout('session_expired');
              return Promise.reject(refreshError);
            } finally {
              this.isRefreshing = false; // 💡 재발급 프로세스 종료
            }
          } else {
            // Refresh Token이 없으면 로그아웃 처리
            this.isRefreshing = false; // 💡 재발급 프로세스 종료
            this.logout('session_expired');
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

  getUserInfo = () => this.client.get(`/auth/info`);

  // 팀 관리 API
  createTeam = (name) => this.client.post('/teams', { name });
  getTeams = (sort = 'latest') => {
    const sortBy = sort === 'latest' ? 'createdAt' : 'name';
    return this.client.get('/teams', {
      params: {
        sort: sortBy,
      },
    });
  };
  // 💡 [추가] 계정 탈퇴 API
  // 💡 [수정] password가 falsy(null, '') 값일 경우 data 객체에서 제외합니다.
  // 이렇게 하면 소셜 로그인 사용자의 탈퇴 요청 시 불필요한 password 필드가 전송되지 않습니다.
  withdraw = (password) => this.client.delete('/auth/withdraw', { data: password ? { password } : {} });

  deleteTeam = (teamId) => this.client.delete(`/teams/${teamId}`);

  // 선수 관리 API
  getTeamPlayers = (teamId) => this.client.get(`/teams/${teamId}/players`);
  createPlayer = (teamId, playerData) => this.client.post(`/teams/${teamId}/players`, playerData);
  updatePlayer = (teamId, playerId, playerData) => this.client.put(`/teams/${teamId}/players/${playerId}`, playerData);
  deletePlayer = (teamId, playerId) => this.client.delete(`/teams/${teamId}/players/${playerId}`);

  // 포메이션 관리 API
  saveTeamFormation = (formationData) => this.client.post(`/formation`, formationData);
  updateFormation = (formationId, formationData) => this.client.put(`/formation/${formationId}`, formationData);
  deleteFormation = (formationId) => this.client.delete(`/formation/${formationId}`);
  getFormationList = (teamId) => this.client.get(`/formation`, { params: { teamId: teamId } });
  getFormationDetail = (formationId) => this.client.get(`/formation/${formationId}`);

  // 💡 [수정] 소셜 로그인 API
  // provider(e.g., 'kakao')와 소셜 엑세스 토큰을 백엔드로 보내 서비스 토큰을 요청합니다.
  socialLogin = (provider, accessToken) =>
    this.client.post(
      `/auth/social-login`,
      { provider, accessToken },
      {
        // 💡 [핵심 수정] 소셜 로그인 요청 시에는 기존 인증 토큰을 보내지 않도록 헤더를 명시적으로 비웁니다.
        // 이렇게 하면 만료된 토큰으로 인해 401 오류가 발생하는 것을 방지할 수 있습니다.
        headers: { Authorization: null },
      }
    );
}

// Custom Hook: API 클라이언트를 사용하기 쉽게 제공
export const useApiClient = () => {
  // 💡 [수정] AuthContext에서 refreshTokens와 logout 함수만 가져옵니다.
  const { refreshTokens, logout } = useContext(AuthContext);

  // 💡 [수정] ApiClient가 더 이상 상태 값에 의존하지 않으므로, 의존성 배열에서 상태 관련 값들을 제거합니다.
  return useMemo(() => new ApiClient(refreshTokens, logout), [refreshTokens, logout]);
};
