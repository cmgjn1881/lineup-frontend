// src/components/SignupForm.jsx (또는 src/pages/SignupForm.jsx)

import React, { useState } from 'react';
import { useApiClient } from '../api/ApiClient';
import { Send, CheckCircle, Loader2 } from 'lucide-react'; // 아이콘 추가

const SignupForm = ({ onSignupSuccess, onCancel }) => {
  const [email, setEmail] = useState('');
  const [authCode, setAuthCode] = useState(''); // 🔑 인증 코드 상태 추가
  const [isEmailVerified, setIsEmailVerified] = useState(false); // 🔑 인증 완료 상태

  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [username, setUsername] = useState('');

  const [error, setError] = useState('');
  const [statusMessage, setStatusMessage] = useState(''); // 상태 메시지
  const [isSendingCode, setIsSendingCode] = useState(false); // 코드 전송 중 로딩 상태
  const [isCodeSent, setIsCodeSent] = useState(false); // 코드 전송 완료 상태

  const api = useApiClient();

  // 1. 🔑 인증 코드 발송 요청
  const handleSendCode = async () => {
    setError('');
    setStatusMessage('');
    if (!email) {
      setError('이메일을 입력해 주세요.');
      return;
    }

    setIsSendingCode(true);
    try {
      // 💡 APIClient에 sendVerificationCode(email) 메서드가 있다고 가정
      await api.sendVerificationCode(email);

      setStatusMessage('인증 코드가 이메일로 전송되었습니다. 6자리 코드를 입력해 주세요.');
      setIsCodeSent(true);
    } catch (err) {
      setError(err.response?.data?.message || '인증 코드 발송에 실패했습니다.');
    } finally {
      setIsSendingCode(false);
    }
  };

  // 2. 🔑 인증 코드 확인 요청
  const handleVerifyCode = async (e) => {
    e.preventDefault(); // 폼 제출 방지
    setError('');
    setStatusMessage('');
    if (!authCode || authCode.length !== 6) {
      setError('6자리 인증 코드를 정확히 입력해 주세요.');
      return;
    }

    try {
      // 💡 APIClient에 verifyCode(email, authCode) 메서드가 있다고 가정
      await api.verifyCode(email, authCode);

      setStatusMessage('✅ 이메일 인증에 성공했습니다. 나머지 정보를 입력해 주세요.');
      setIsEmailVerified(true); // 최종 회원가입 폼 활성화
    } catch (err) {
      setError(err.response?.data?.message || '인증 코드 확인에 실패했습니다.');
    }
  };

  // 3. 🔑 최종 회원가입 요청
  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== passwordConfirm) {
      setError('비밀번호와 비밀번호 확인이 일치하지 않습니다.');
      return;
    }

    if (!isEmailVerified) {
      setError('이메일 인증을 먼저 완료해 주세요.');
      return;
    }

    try {
      // 이메일 인증이 완료된 상태이므로, 인증 코드(authCode)를 포함하여 최종 회원가입 요청
      // 백엔드에서 이메일과 코드의 유효성을 다시 확인한다고 가정
      await api.signup(email, password, username, authCode);

      alert('회원가입 성공! 이제 로그인해주세요.');
      onSignupSuccess();
    } catch (err) {
      setError(err.response?.data?.message || '회원가입 중 오류가 발생했습니다.');
    }
  };

  return (
    <form onSubmit={handleSignup} className="space-y-4">
      <h2 className="text-3xl font-bold mb-6 text-center text-indigo-600">회원가입</h2>

      {/* 1. 이메일 및 인증 코드 입력 단계 */}
      <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
        <p className="font-semibold text-indigo-500">이메일 인증</p>

        {/* 이메일 입력 필드 */}
        <div className="flex space-x-2">
          <input
            type="email"
            placeholder="이메일"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={isCodeSent} // 코드가 전송된 후에는 이메일 변경 불가
            className="flex-grow px-4 py-2 border rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
          />
          <button
            type="button"
            onClick={handleSendCode}
            disabled={isSendingCode || isEmailVerified}
            className={`px-4 py-2 rounded-lg text-white font-semibold transition duration-200 flex items-center justify-center ${
              isEmailVerified ? 'bg-green-500' : 'bg-indigo-500 hover:bg-indigo-600'
            }`}
          >
            {isSendingCode ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : isEmailVerified ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* 인증 코드 입력 필드 (코드가 전송되었고, 인증이 완료되지 않았을 때만 표시) */}
        {isCodeSent && !isEmailVerified && (
          <div className="flex space-x-2">
            <input
              type="text"
              placeholder="6자리 인증 코드"
              value={authCode}
              onChange={(e) => setAuthCode(e.target.value.trim())}
              required
              maxLength={6}
              className="flex-grow px-4 py-2 border rounded-lg focus:ring-green-500 focus:border-green-500"
            />
            <button
              type="button"
              onClick={handleVerifyCode}
              className="px-4 py-2 rounded-lg bg-green-500 hover:bg-green-600 text-white font-semibold transition duration-200"
            >
              확인
            </button>
          </div>
        )}

        {statusMessage && <p className="text-green-600 text-sm mt-2">{statusMessage}</p>}
      </div>

      {/* 2. 최종 회원가입 정보 입력 단계 (이메일 인증 완료 시 활성화) */}
      <fieldset disabled={!isEmailVerified} className={`space-y-4 ${!isEmailVerified ? 'opacity-50' : ''}`}>
        <input
          type="password"
          placeholder="비밀번호"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
        />
        <input
          type="password"
          placeholder="비밀번호 확인"
          value={passwordConfirm}
          onChange={(e) => setPasswordConfirm(e.target.value)}
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
        />
        <input
          type="text"
          placeholder="사용자 이름"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
        />

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <button
          type="submit"
          disabled={!isEmailVerified}
          className="w-full py-2 px-4 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 transition duration-200"
        >
          가입하기
        </button>
      </fieldset>

      <button
        onClick={onCancel}
        type="button"
        className="mt-4 w-full text-sm text-center text-indigo-500 hover:text-indigo-700 transition duration-200"
      >
        이미 계정이 있으신가요? 로그인
      </button>
    </form>
  );
};

export default SignupForm;
