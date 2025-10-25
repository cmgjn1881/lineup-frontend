// src/api/ApiClient.js

import axios from 'axios';
import { useContext, useMemo } from 'react';
import { AuthContext } from '../context/AuthContextDefinition';

export const RENDER_BASE_URL = import.meta.env.VITE_API_BASE_URL;
export const API_BASE_URL = `${RENDER_BASE_URL}/api`;

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

          if (refreshToken) {
            try {
              const refreshEndpoint = `${RENDER_BASE_URL}/api/auth/refresh`;

              const refreshResponse = await axios.post(refreshEndpoint, {
                refreshToken: refreshToken,
                oldAccessToken: originalRequest.headers.Authorization?.replace('Bearer ', ''), // 이전 토큰은 config에서 가져올 수 있음
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
          } else {
            // Refresh Token이 없으면 로그아웃 처리
            this.auth.logout();
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
  getTeams = () => this.client.get('/teams');
  // 💡 [추가] 계정 탈퇴 API
  withdraw = (password) => this.client.delete('/auth/withdraw', { data: { password } });

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

  // 💡 카카오 로그인 API
  // 백엔드의 카카오 로그인 처리 엔드포인트로 GET 요청을 보냅니다.
  // Spring Security를 사용한다면 '/login/oauth2/code/kakao'가 기본 경로일 수 있습니다.
  // 백엔드 구현에 맞게 URL을 수정해주세요. (예: '/api/auth/kakao')
  kakaoLogin = (code) => this.client.get(`/login/oauth2/code/kakao`, { params: { code } });
}

// Custom Hook: API 클라이언트를 사용하기 쉽게 제공
export const useApiClient = () => {
  const auth = useContext(AuthContext);
  // authContext가 변경될 때만 새로운 인스턴스를 생성하도록 useMemo 사용
  return useMemo(() => new ApiClient(auth), [auth]);
};
