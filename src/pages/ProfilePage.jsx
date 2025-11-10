// src/pages/ProfilePage.jsx

import React from 'react';
import { useAuth } from '../context/useAuth';

const ProfilePage = () => {
  const auth = useAuth();
  const userEmail = auth.userEmail;
  const userName = auth.userName;

  return (
    <div className="p-4 h-full flex flex-col">
      {/* 1. 계정 정보 영역 (남은 공간을 모두 차지) */}
      <div className="grow">
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

      {/* 2. 하단 버튼 영역 (flex 컨테이너의 맨 아래에 위치) */}
      {/* mt-auto: 상단에 자동 마진을 주어 아래로 밀어냅니다. */}
      <div className="mt-auto">
        <div className="space-y-3 p-4">
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
