// src/main.jsx

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';

import './input.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// PWA 서비스 워커 등록: 프로덕션 빌드에서만 활성화
// import.meta.env.DEV가 true이면 개발 서버(npm run dev) 환경입니다.
// 개발 중에는 서비스 워커의 캐싱 기능이 즉각적인 코드 변경 확인을 방해하므로, 프로덕션 환경에서만 등록하도록 합니다.
if ('serviceWorker' in navigator && !import.meta.env.DEV) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/service-worker.js')
      .then((registration) => {
        console.log('ServiceWorker registration successful with scope: ', registration.scope);
      })
      .catch((err) => {
        console.log('ServiceWorker registration failed: ', err);
      });
  });
}
