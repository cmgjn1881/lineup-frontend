// src/pages/ProfilePage.jsx

import React from 'react';
import { useAuth } from '../context/useAuth';

const ProfilePage = () => {
  const auth = useAuth();
  const userEmail = auth.userEmail;
  const userName = auth.userName;

  return (
    // 💡 [수정] 불필요한 flex, h-full, pb-16을 제거하고, 콘텐츠 영역만 남깁니다.
    <div className="p-4">
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

      {/* 💡 [핵심 수정] 하단 버튼 영역을 position: fixed로 화면 하단에 고정합니다. */}
      <div className="fixed bottom-16 left-0 right-0 max-w-sm mx-auto p-4 bg-black">
        {/* 
          bottom-16: FooterNav의 높이(h-16)만큼 위로 띄웁니다.
          max-w-sm mx-auto: App.jsx의 main 태그와 동일한 너비 및 중앙 정렬을 유지합니다.
        */}
        <div className="space-y-3">
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
