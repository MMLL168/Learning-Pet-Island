import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // 設定 base 為 './' 讓網站可以正確運行在 GitHub Pages 的子目錄中
  base: './',
});