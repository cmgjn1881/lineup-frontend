import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import backArrowIcon from '../../assets/arrow_back.svg';

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleBack = () => {
    navigate(-1);
  };

  let pageTitle = '팀 관리';
  const showBackButton = location.pathname !== '/teams' && location.pathname !== '/profile';

  if (location.pathname.startsWith('/teams')) {
    if (location.pathname === '/teams') {
      pageTitle = '팀 목록';
    } else if (location.pathname.includes('/players')) {
      pageTitle = '선수 관리';
    } else if (location.pathname.includes('/formation')) {
      pageTitle = '포메이션 관리';
    } else {
      pageTitle = '팀 상세 정보';
    }
  } else if (location.pathname === '/profile') {
    pageTitle = '내 정보';
  }

  return (
    // 💡 [핵심 수정] 다시 fixed 포지셔닝을 사용하여 뷰포트 상단에 고정합니다.
    <nav className="bg-black border-b border-[#6B6B6B] fixed top-0 left-0 w-full z-10 h-14">
      <div className="max-w-sm mx-auto px-4">
        <div className="flex items-center h-14">
          {showBackButton && (
            <button onClick={handleBack} className="p-2 -ml-2">
              <img src={backArrowIcon} alt="뒤로 가기" className="w-6 h-6" />
            </button>
          )}
          <div className="text-white font-bold text-lg tracking-wider">{pageTitle}</div>
        </div>
      </div>
    </nav>
  );
};

export default Header;
