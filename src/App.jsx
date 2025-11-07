// src/App.jsx

import React, { useRef } from 'react';
import { AuthProvider } from './context/AuthContext';
import { createHashRouter, RouterProvider, Outlet, Navigate, useParams, useLocation, Link } from 'react-router-dom';
import { useAuth } from './context/useAuth';
import LoginPage from './pages/LoginPage';
import TeamPage from './pages/TeamPage';
import TeamDetailPage from './pages/TeamDetailPage';
import PlayerListPage from './pages/PlayerListPage';
import ProfilePage from './pages/ProfilePage';
import FormationPage from './pages/FormationPage';
import ScrollToTop from './components/ScrollToTop';
import KakaoCallback from './pages/KakaoCallback';
import Header from './components/common/Header';
import FooterNav from './components/common/FooterNav';
import { User, Briefcase, Shield } from 'lucide-react';

const ProtectedRoute = ({ children }) => {
  const auth = useAuth();
  if (!auth.isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  return children;
};

const TeamDetailWrapper = () => {
  const { teamId } = useParams();
  return <TeamDetailPage teamId={teamId} />;
};

const PlayerListWrapper = () => {
  const { teamId } = useParams();
  return <PlayerListPage teamId={teamId} />;
};

const FormationWrapper = () => {
  const { teamId } = useParams();
  return <FormationPage teamId={teamId} />;
};

const AuthRedirect = () => {
  const auth = useAuth();
  return auth.isAuthenticated ? <Navigate to="/teams" replace /> : <LoginPage />;
};

const AppContent = () => {
  const location = useLocation();
  const isFormationPage = location.pathname.includes('/formation');
  const isLoginPage = location.pathname === '/';
  const mainRef = useRef(null);

  return (
    <div className="flex flex-col h-screen bg-black">
      {!isLoginPage && <Header />}
      {/* 💡 [수정] main 태그로 스타일을 통합하고, 내부의 불필요한 div를 제거합니다. */}
      <main
        className={`w-full flex-1 overflow-y-auto max-w-sm mx-auto bg-black ${
          isLoginPage
            ? '' // 로그인 페이지는 패딩 없음
            : isFormationPage
            ? 'pt-14' // 포메이션 페이지는 하단 패딩 없음
            : 'pt-14 pb-16' // 나머지 페이지는 상하단 패딩 적용
        }`}
        ref={mainRef}
      >
        <ScrollToTop targetRef={mainRef} />
        <Outlet />
      </main>
      <FooterNav />
    </div>
  );
};

// ⚽️ [핵심 수정] createHashRouter를 사용하여 데이터 라우터를 생성합니다.
const router = createHashRouter([
  {
    path: '/',
    // 💡 [수정] AppContent를 모든 페이지의 공통 레이아웃으로 사용하고, 그 안에 자식 라우트를 정의합니다.
    element: <AppContent />,
    children: [
      // 1. 인증이 필요 없는 공용 라우트
      {
        index: true, // '/' 경로에 해당
        element: <AuthRedirect />,
      },
      {
        path: 'kakao/callback',
        element: <KakaoCallback />,
      },
      // 2. 인증이 필요한 보호된 라우트 (각각 ProtectedRoute로 감싸줍니다)
      {
        path: 'teams',
        element: (
          <ProtectedRoute>
            <TeamPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'teams/:teamId',
        element: (
          <ProtectedRoute>
            <TeamDetailWrapper />
          </ProtectedRoute>
        ),
      },
      {
        path: 'teams/:teamId/players',
        element: (
          <ProtectedRoute>
            <PlayerListWrapper />
          </ProtectedRoute>
        ),
      },
      {
        path: 'teams/:teamId/formation',
        element: (
          <ProtectedRoute>
            <FormationWrapper />
          </ProtectedRoute>
        ),
      },
      {
        path: 'profile',
        element: (
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        ),
      },
      // 3. 일치하는 라우트가 없을 경우 처리
      {
        path: '*',
        element: <Navigate to="/teams" replace />,
      },
    ],
  },
]);

const App = () => (
  <div style={{ fontFamily: 'Inter, sans-serif' }}>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </div>
);

export default App;
