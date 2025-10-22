// src/App.jsx

import React, { useRef } from 'react';
import { AuthProvider } from './context/AuthContext';
import { HashRouter, Routes, Route, Navigate, useParams, useLocation, Link } from 'react-router-dom';
import { useAuth } from './context/useAuth';
import LoginPage from './pages/LoginPage'; // 분리된 페이지 임포트
import TeamPage from './pages/TeamPage'; // 분리된 페이지 임포트
import TeamDetailPage from './pages/TeamDetailPage'; // 새로운 컴포넌트 임포트
import PlayerListPage from './pages/PlayerListPage'; // 새로운 컴포넌트 임포트
import ProfilePage from './pages/ProfilePage';
import FormationPage from './pages/FormationPage';
import ScrollToTop from './components/ScrollToTop';
import { User, Briefcase, Shield } from 'lucide-react';

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

const FormationWrapper = () => {
  const { teamId } = useParams(); // URL에서 teamId 추출
  return <FormationPage teamId={teamId} />;
};

/**
 * 인증 상태에 따라 로그인 페이지 또는 팀 페이지로 리다이렉트하는 컴포넌트입니다.
 */
const AuthRedirect = () => {
  const auth = useAuth();
  return auth.isAuthenticated ? <Navigate to="/teams" replace /> : <LoginPage />;
};

const Header = () => {
  const location = useLocation();

  // 현재 경로를 기반으로 제목 결정
  let pageTitle = 'LineupMaker';

  if (location.pathname.startsWith('/teams')) {
    // 팀 상세 경로는 제외 (하위 컴포넌트가 처리해야 함)
    if (location.pathname === '/teams') {
      pageTitle = '팀 관리';
    } else if (location.pathname.includes('/players')) {
      pageTitle = '선수 관리'; // 팀 이름은 FormationPage/PlayerListPage에서 직접 표시하는 것이 일반적
    } else if (location.pathname.includes('/formation')) {
      pageTitle = '포메이션 관리';
    }
  } else if (location.pathname === '/profile') {
    pageTitle = '내 정보';
  } else if (location.pathname === '/') {
    pageTitle = '로그인';
  }

  return (
    <nav className="bg-gray-800 shadow-lg fixed top-0 left-0 w-full z-10 h-16">
      <div className="max-w-sm mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          {/* 🔑 제목 영역에 조건부 텍스트 삽입 */}
          <div className="text-white font-extrabold text-xl tracking-wider">{pageTitle}</div>
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

  const isHiddenPath = location.pathname.includes('/formation');

  // 비인증 상태이거나 숨김 경로일 때는 null 반환
  if (!auth.isAuthenticated || isHiddenPath) {
    return null; // 🔑 특정 경로일 때 렌더링하지 않음
  }

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
          <Shield className="w-6 h-6 mb-1" />팀 관리
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

// src/App.jsx (AppContent 컴포넌트 수정)

const AppContent = () => {
  const location = useLocation();
  const isFormationPage = location.pathname.includes('/formation');
  const mainRef = useRef(null);

  return (
    // ⚽️ [핵심 수정] Flexbox를 사용하여 전체 레이아웃을 구성합니다.
    // 1. 최상위 div: 화면 전체 높이를 차지하고, 자식 요소들을 세로(flex-col)로 배치합니다.
    <div className="flex flex-col h-screen bg-gray-50">
      <Header /> {/* Header는 fixed position */}
      <main
        // 2. main: flex-1을 통해 남은 공간을 모두 차지하고, 내용이 넘치면 스스로 스크롤됩니다.
        // Header와 Footer가 fixed이므로, 내용이 가려지지 않도록 상단과 하단에 패딩을 줍니다.
        className={`w-full flex-1 overflow-y-auto ${
          isFormationPage ? 'pt-16' : 'pt-16 pb-16' // FormationPage는 Footer가 없으므로 하단 패딩 제외
        }`}
        ref={mainRef} // 🔑 mainRef를 할당
      >
        {/* 3. 내부 컨텐츠 영역 */}
        <div className={isFormationPage ? '' : 'max-w-sm mx-auto py-6 px-4'}>
          {/* 🔑 [수정] ScrollToTop에 Ref 전달 */}
          <ScrollToTop targetRef={mainRef} />
          <Routes>
            {/* ... 기존 Routes 유지 ... */}
            <Route path="/" element={<AuthRedirect />} />
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
              path="/teams/:teamId/players"
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
            <Route
              path="/teams/:teamId/formation"
              element={
                <ProtectedRoute>
                  <FormationWrapper />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<Navigate to="/teams" replace />} />
          </Routes>
        </div>
      </main>
      <FooterNav /> {/* FooterNav는 fixed position */}
    </div>
  );
};

const App = () => (
  <div style={{ fontFamily: 'Inter, sans-serif' }}>
    {/* 🔑 useLocation이 내부의 AppContent에서 호출되도록 <HashRouter>를 가장 바깥쪽에 배치 */}
    <HashRouter>
      <AuthProvider>
        <AppContent /> {/* 🔑 AppContent를 렌더링 */}
      </AuthProvider>
    </HashRouter>
  </div>
);

export default App;
