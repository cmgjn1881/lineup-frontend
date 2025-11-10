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
  const isProfilePage = location.pathname === '/profile';
  const isTeamDetailPage = /^\/teams\/\d+$/.test(location.pathname);
  const isLoginPage = location.pathname === '/';
  const mainRef = useRef(null);

  return (
    <>
      {!isLoginPage && <Header />}
      {/* 💡 [수정] flex-1을 제거하여 레이아웃 계산을 더 단순하고 안정적으로 만듭니다. */}
      <main
        className={`w-full max-w-sm mx-auto bg-black ${
          isLoginPage
            ? '' // 로그인 페이지는 패딩 없음
            : isFormationPage || isProfilePage || isTeamDetailPage
            ? 'pt-14' // 💡 [수정] 스크롤이 필요 없는 페이지들은 하단 패딩을 적용하지 않습니다.
            : 'pt-14 pb-16' // 나머지 페이지는 상하단 패딩 모두 적용
        }`}
        ref={mainRef}
      >
        <ScrollToTop targetRef={mainRef} />
        <Outlet />
      </main>
      {!isLoginPage && <FooterNav />}
    </>
  );
};

const router = createHashRouter([
  {
    path: '/',
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
      {
        path: '*',
        element: <Navigate to="/teams" replace />,
      },
    ],
  },
]);

const App = () => (
  // 💡 [핵심 수정] h-dvh를 가진 최상위 레이아웃 컨테이너를 먼저 렌더링합니다.
  // 이 컨테이너는 앱의 생명주기 동안 절대 교체되지 않습니다.
  <div className="flex flex-col h-dvh bg-black" style={{ fontFamily: 'Inter, sans-serif' }}>
    {/* AuthProvider는 레이아웃 안에서 라우터만 감싸서 인증 상태를 관리합니다. */}
    {/* AuthProvider가 로딩 중일 때는 RouterProvider가 렌더링되지 않습니다. */}
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </div>
);

export default App;
