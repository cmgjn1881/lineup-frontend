// src/pages/ProfilePage.jsx

import React from 'react';
import { useAuth } from '../context/useAuth';
import { LogOut, Trash2 } from 'lucide-react';

const ProfilePage = () => {
  const auth = useAuth();

  // auth.user에서 이메일을 가져오며, 없을 경우 '정보 없음'으로 표시
  const userEmail = auth.userEmail;
  const userName = auth.userName;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800 border-b pb-2">내 정보</h2>

      {/* 이메일 표시 영역 (계정 정보) */}
      <div className="bg-white p-4 rounded-xl shadow-md border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-700 mb-2">계정 정보</h3>
        <div className="flex justify-between items-center py-2">
          <span className="text-gray-500">이름</span>
          <span className="font-medium text-gray-800">{userName}</span>
        </div>
        <div className="flex justify-between items-center py-2">
          {/* 💡 [수정] 소셜 로그인 여부에 따라 표시 내용 변경 */}
          <span className="text-gray-500">{auth.isSocial ? '로그인 방식' : '이메일'}</span>
          <span className="font-medium text-gray-800">
            {auth.isSocial ? <span className="text-yellow-600 font-bold">카카오 로그인</span> : userEmail}
          </span>
        </div>
      </div>

      {/* 버튼 영역 */}
      <div className="space-y-4 pt-4">
        {/* 1. 로그아웃 버튼 */}
        <button
          onClick={() => auth.logout('user')} // 💡 사용자가 직접 누른 로그아웃임을 명시
          className="w-full flex items-center justify-center bg-indigo-600 text-white py-3 px-4 rounded-lg font-semibold shadow-md hover:bg-indigo-700 transition duration-200"
        >
          <LogOut className="w-5 h-5 mr-2" />
          로그아웃
        </button>

        {/* 2. 탈퇴 버튼 */}
        <button
          onClick={auth.withdraw}
          className="w-full flex items-center justify-center bg-red-500 text-white py-3 px-4 rounded-lg font-semibold shadow-md hover:bg-red-600 transition duration-200"
        >
          <Trash2 className="w-5 h-5 mr-2" />
          계정 탈퇴
        </button>
      </div>

      <p className="text-center text-xs text-gray-400 pt-4">
        계정 탈퇴 시 모든 팀 및 선수 정보가 영구적으로 삭제됩니다.
      </p>
    </div>
  );
};

export default ProfilePage;
