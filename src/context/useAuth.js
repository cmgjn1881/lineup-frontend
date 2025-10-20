// src/context/useAuth.js (새 파일)
import { useContext } from 'react';
import { AuthContext } from './AuthContextDefinition'; // Context 정의 임포트

// Custom Hook: 인증 정보를 쉽게 사용하도록 제공
export const useAuth = () => useContext(AuthContext);
