// src/App.jsx

import React from 'react';
import { AuthProvider } from './context/AuthContext';
import { HashRouter, Routes, Route, Navigate, useParams, useLocation, Link } from 'react-router-dom';
import { useAuth } from './context/useAuth';
import LoginPage from './pages/LoginPage'; // 분리된 페이지 임포트
import TeamPage from './pages/TeamPage'; // 분리된 페이지 임포트
import TeamDetailPage from './pages/TeamDetailPage'; // 새로운 컴포넌트 임포트
import PlayerListPage from './pages/PlayerListPage'; // 새로운 컴포넌트 임포트
import ProfilePage from './pages/ProfilePage';
import { User, LogIn, Briefcase, LogOut } from 'lucide-react';

// =================================================================================
// Router & Nav Component (App.jsx에 유지)
// =================================================================================

/**
 * 인증된 사용자만 접근할 수 있는 경로를 보호하는 컴포넌트입니다.
 * 인증되지 않은 경우 로그인 페이지로 리다이렉트합니다.
 */
const ProtectedRoute = ({ children }) => {
  const auth = useAuth();
  if (!auth.isAuthenticated) {
    // 로그인 페이지로 리다이렉트하면서, 로그인 후 돌아올 경로를 state로 전달할 수 있습니다.
    // return <Navigate to="/" replace />; (LoginPage 경로가 '/'일 경우)
    return <LoginPage />; // 현재 구조에서는 LoginPage를 직접 렌더링
  }
  return children;
};

/**
 * URL 파라미터(:teamId)를 추출하여 TeamDetailPage에 props로 전달하는 Wrapper 컴포넌트입니다.
 */
const TeamDetailWrapper = () => {
  const { teamId } = useParams(); // URL에서 teamId를 추출
  return <TeamDetailPage teamId={teamId} />;
};

const PlayerListWrapper = () => {
  const { teamId } = useParams(); // URL에서 teamId 추출
  return <PlayerListPage teamId={teamId} />;
};

/**
 * 인증 상태에 따라 로그인 페이지 또는 팀 페이지로 리다이렉트하는 컴포넌트입니다.
 */
const AuthRedirect = () => {
  const auth = useAuth();
  return auth.isAuthenticated ? <Navigate to="/team" replace /> : <LoginPage />;
};

const Header = () => {
  return (
    <nav className="bg-gray-800 sticky top-0 z-10">
      <div className="max-w-sm mx-auto px-4 bg-gray-800 shadow-lg rounded-md">
        <div className="flex justify-between items-center py-4">
          <div className="text-white font-extrabold text-xl tracking-wider">LineupMaker</div>
        </div>
      </div>
    </nav>
  );
};

// =================================================================================
// FooterNav Component (하단 고정 내비게이션)
// =================================================================================
const FooterNav = () => {
  const auth = useAuth();
  const location = useLocation(); // 🔑 useLocation 훅 사용

  // 💡 location.pathname 또는 location.hash를 사용하여 현재 경로를 확인
  const currentPath = location.pathname; // 예: /teams, /profile

  // 비인증 상태에서는 FooterNav를 표시하지 않습니다.
  if (!auth.isAuthenticated) return null;

  // 모바일 앱 하단 탭 바 스타일
  return (
    <footer className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 shadow-2xl z-20">
      <div className="max-w-sm mx-auto flex justify-around items-center h-16">
        {/* 1. 팀 관리 (TeamPage) 버튼 */}
        <Link // 🔑 a 태그 대신 Link 사용
          to="/teams" // 🔑 HashRouter이므로 '#/' 제거
          className={`flex flex-col items-center justify-center p-2 text-xs font-medium transition duration-150 
            ${currentPath.startsWith('/teams') ? 'text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
        >
          <Briefcase className="w-6 h-6 mb-1" />팀 관리
        </Link>

        {/* 2. 내 정보 (ProfilePage) 버튼 */}
        <Link // 🔑 a 태그 대신 Link 사용
          to="/profile" // 🔑 HashRouter이므로 '#/' 제거
          className={`flex flex-col items-center justify-center p-2 text-xs font-medium transition duration-150 
            ${currentPath.startsWith('/profile') ? 'text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
        >
          <User className="w-6 h-6 mb-1" />내 정보
        </Link>
      </div>
    </footer>
  );
};

const App = () => (
  <div style={{ fontFamily: 'Inter, sans-serif' }} className="min-h-screen bg-gray-50">
    <HashRouter>
      <AuthProvider>
        <Header />
        <main className="max-w-sm mx-auto py-6 px-4">
          <Routes>
            {/* 1. 루트 경로: 인증 상태에 따라 로그인 또는 팀 목록으로 자동 이동 */}
            <Route path="/" element={<AuthRedirect />} />

            {/* 2. 보호된 경로들: 인증된 사용자만 접근 가능 */}
            <Route
              path="/teams"
              element={
                <ProtectedRoute>
                  <TeamPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/teams/:teamId"
              element={
                <ProtectedRoute>
                  <TeamDetailWrapper />
                </ProtectedRoute>
              }
            />
            <Route
              path="/teams/:teamId/players" // <--- 팀 ID 하위의 /players 경로
              element={
                <ProtectedRoute>
                  <PlayerListWrapper />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />

            {/* 3. 일치하는 경로가 없을 때: 팀 목록 페이지로 이동 */}
            <Route path="*" element={<Navigate to="/teams" replace />} />
          </Routes>
        </main>
        <FooterNav />
      </AuthProvider>
    </HashRouter>
  </div>
);

export default App;
