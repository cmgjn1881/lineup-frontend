import { useAuth } from '../../context/useAuth'; // 💡 [수정] 경로 수정
import { useLocation, Link } from 'react-router-dom';
import { House, User } from 'lucide-react'; // 💡 [수정] lucide-react에서 User 아이콘을 가져옵니다.

const FooterNav = () => {
  const auth = useAuth();
  const location = useLocation();

  // 💡 location.pathname 또는 location.hash를 사용하여 현재 경로를 확인
  const currentPath = location.pathname; // 예: /teams, /profile

  const isHiddenPath = location.pathname.includes('/formation');

  // 비인증 상태이거나 숨김 경로일 때는 null 반환
  if (!auth.isAuthenticated || isHiddenPath) {
    return null; // 🔑 특정 경로일 때 렌더링하지 않음
  }

  // 모바일 앱 하단 탭 바 스타일
  return (
    // 💡 [핵심 수정] 다시 fixed 포지셔닝을 사용하여 뷰포트 하단에 고정합니다.
    <footer className="fixed bottom-0 left-0 w-full bg-black border-t border-[#6B6B6B] shadow-2xl z-20">
      <div className="max-w-sm mx-auto flex justify-around items-center h-16">
        {/* 1. 팀 관리 (TeamPage) 버튼 */}
        <Link // 🔑 a 태그 대신 Link 사용
          to="/teams" // 🔑 HashRouter이므로 '#/' 제거
          className={`flex flex-col items-center justify-center p-2 text-xs font-medium transition duration-150 
            ${currentPath.startsWith('/teams') ? 'text-[#63FF70]' : 'text-[#6B6B6B] hover:text-gray-700'}`}
        >
          <House className="w-6 h-6 mb-1" />팀 관리
        </Link>

        {/* 2. 내 정보 (ProfilePage) 버튼 */}
        <Link // 🔑 a 태그 대신 Link 사용
          to="/profile" // 🔑 HashRouter이므로 '#/' 제거
          className={`flex flex-col items-center justify-center p-2 text-xs font-medium transition duration-150 
            ${currentPath.startsWith('/profile') ? 'text-[#63FF70]' : 'text-[#6B6B6B] hover:text-gray-700'}`}
        >
          {/* 💡 [수정] 커스텀 아이콘 대신 lucide-react의 User 아이콘을 사용합니다. */}
          <User className="w-6 h-6 mb-1" />내 정보
        </Link>
      </div>
    </footer>
  );
};

export default FooterNav;
