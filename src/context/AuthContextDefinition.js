// src/context/AuthContextDefinition.js (새 파일)
import { createContext } from 'react';

// Context의 기본값 정의 (Fast Refresh와 무관하지만 분리)
export const AuthContext = createContext({
  isAuthenticated: false,
  userEmail: null,
  userName: null,
  accessToken: null,
  refreshToken: null,
  setTokens: () => {},
  logout: () => {},
});
