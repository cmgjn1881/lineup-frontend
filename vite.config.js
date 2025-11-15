// vite.config.js
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// Node.js path 모듈을 'node:path' 형식으로 가져옵니다.
import path from 'node:path';
import { fileURLToPath } from 'node:url'; // url 모듈 추가

// 1. ESM 환경에서 현재 파일의 디렉토리를 구합니다.
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig(({ mode }) => {
  // 2. __dirname (vite.config.js가 있는 폴더)를 루트 경로로 사용하여 환경 변수를 로드합니다.
  const env = loadEnv(mode, __dirname, 'VITE_');

  // 3. 환경 변수 env에서 VITE_API_BASE_URL 값을 가져옵니다.
  const API_BASE_URL = env.VITE_API_BASE_URL;

  // 4. 디버깅: 로드된 API URL을 콘솔에 출력합니다.
  console.log(`[Vite Config] 로드된 API Base URL: ${API_BASE_URL}`);

  if (!API_BASE_URL) {
    // 5. 로드 실패 시 서버 실행을 멈추고 사용자에게 .env 확인을 강제합니다.
    throw new Error(
      '환경 변수 VITE_API_BASE_URL을 로드하지 못했습니다. .env 파일을 확인하거나 로드 코드를 점검해주세요.'
    );
  }

  return {
    plugins: [react(), tailwindcss()],
    server: {
      proxy: {
        '/api': {
          target: API_BASE_URL,
          changeOrigin: true,
        },
      },
    },
  };
});
