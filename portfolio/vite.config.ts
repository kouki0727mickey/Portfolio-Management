import { defineConfig, type Plugin } from 'vitest/config';
import { profile } from './src/content/profile';
import { renderNoscript } from './src/noscript';

// ビルド時に profile から <noscript> を差し込む
const noscript = (): Plugin => ({
  name: 'inject-noscript',
  transformIndexHtml: (html) => html.replace('<!--NOSCRIPT-->', renderNoscript(profile)),
});

export default defineConfig({
  base: './',
  plugins: [noscript()],
  test: {
    environment: 'jsdom',
    include: ['tests/unit/**/*.test.ts'],
  },
});
