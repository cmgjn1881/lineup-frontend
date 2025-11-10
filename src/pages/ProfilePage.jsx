// src/pages/ProfilePage.jsx

import React from 'react';
import { useAuth } from '../context/useAuth';

const ProfilePage = () => {
  const auth = useAuth();
  const userEmail = auth.userEmail;
  const userName = auth.userName;

  return (
    // 💡 [핵심 수정] pb-16을 ProfilePage의 루트 div에 적용합니다.
    // 이렇게 하면 FooterNav가 올라올 공간을 확보하면서도, 페이지 전체 높이가 화면을 초과하지 않습니다.
    <div className="p-4 flex flex-col h-full pb-16">
      <div className="grow">
        {/* 계정 정보 */}
        <div className="bg-[#0D1117] p-4 mt-4 rounded-3xl shadow-md border border-[#6B6B6B]">
          <h3 className="text-lg font-semibold text-white mb-2">계정 정보</h3>
          <div className="flex justify-between items-center py-2">
            <span className="text-white">이름</span>
            <span className="font-medium text-[#63FF70]">{userName}</span>
          </div>
          <div className="flex justify-between items-center py-2">
            <span className="text-white">{auth.isSocial ? '로그인 방식' : '이메일'}</span>
            <span className="font-medium text-gray-800">
              {auth.isSocial ? <span className="text-[#FBD300] font-bold">카카오 로그인</span> : userEmail}
            </span>
          </div>
        </div>
      </div>

      {/* 2. 하단 버튼 영역 */}
      <div>
        {/* 💡 [수정] 루트 div로 pb-16을 옮겼으므로, 여기서는 pb-4로 충분한 여백만 남깁니다. */}
        <div className="space-y-3 pb-4">
          <button
            onClick={() => auth.logout('user')}
            className="block text-red-500 hover:text-red-400 transition-colors text-sm"
          >
            로그아웃
          </button>

          <button onClick={auth.withdraw} className="block text-gray-400 hover:text-white transition-colors text-sm">
            계정 탈퇴
          </button>
          <a
            href="https://sites.google.com/view/squadbuilder-privacypolicy"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-xs text-gray-400 underline hover:text-gray-200 transition-colors"
          >
            개인정보처리방침
          </a>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
