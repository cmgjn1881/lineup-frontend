// src/App.jsx

import React, { useRef } from 'react';
import { Toaster } from 'react-hot-toast';
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
import HeaderActionsProvider from './context/HeaderActionsContext.jsx';
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
  //const isTeamDetailPage = /^\/teams\/\d+$/.test(location.pathname);
  const isLoginPage = location.pathname === '/';
  const mainRef = useRef(null);

  return (
    // 💡 [핵심 수정] AppContent의 구조를 변경하여 fixed 헤더/푸터와 main 콘텐츠를 분리합니다.
    // Flexbox 레이아웃 대신, fixed 헤더/푸터와 padding으로 공간을 확보하는 표준 방식으로 변경합니다.
    <>
      {!isLoginPage && <Header />}
      {/* 💡 [최종 수정] main 태그를 absolute 포지셔닝으로 변경하여 헤더/푸터 사이의 공간을 정확히 차지하도록 합니다. */}
      {/* h-full과 padding을 함께 사용하던 문제를 근본적으로 해결합니다. */}
      <main
        className={`w-full md:max-w-md md:mx-auto bg-black absolute inset-x-0 ${
          isProfilePage ? 'overflow-y-hidden' : 'overflow-y-auto'
        } ${
          // 💡 [핵심 수정] 포메이션 페이지에서 '당겨서 새로고침' 방지
          isFormationPage ? 'overscroll-y-contain' : ''
        } ${isLoginPage ? 'top-0 bottom-0' : isFormationPage ? 'top-14 bottom-0' : 'top-14 bottom-16'}`}
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
  // 💡 [최종 수정] h-dvh 대신 h-full을 사용하여 부모(#root)의 높이를 100% 채웁니다.
  <div className="h-full" style={{ fontFamily: 'Inter, sans-serif' }}>
    {/* AuthProvider는 레이아웃 안에서 라우터만 감싸서 인증 상태를 관리합니다. */}
    {/* AuthProvider가 로딩 중일 때는 RouterProvider가 렌더링되지 않습니다. */}
    <AuthProvider>
      {/* 💡 [추가] react-hot-toast의 Toaster 컴포넌트 */}
      {/* 앱 전체에서 토스트 알림을 띄울 수 있도록 최상단에 위치시킵니다. */}
      <Toaster
        position="top-center"
        reverseOrder={false}
        toastOptions={{
          style: { background: '#333', color: '#fff' },
        }}
      />
      <HeaderActionsProvider>
        <RouterProvider router={router} />
      </HeaderActionsProvider>
    </AuthProvider>
  </div>
);

export default App;
