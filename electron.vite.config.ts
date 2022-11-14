import { join, resolve } from 'path';
import { defineConfig, externalizeDepsPlugin } from 'electron-vite';

const PACKAGE_ROOT = __dirname;

const alias = {
  'main/': join(PACKAGE_ROOT, 'src/main/'),
  'renderer/': join(PACKAGE_ROOT, 'src/renderer/'),
  'base/': join(PACKAGE_ROOT, 'src/base/'),
  'platform/': join(PACKAGE_ROOT, 'src/platform/'),
};

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()],
    resolve: {
      alias,
    },
  },
  preload: {
    plugins: [externalizeDepsPlugin()],
    build: {
      rollupOptions: {
        input: {
          preload: join(__dirname, 'src/preload/index.ts'),
        },
      },
    },
  },
  renderer: {
    resolve: {
      alias: alias,
    },
    build: {
      rollupOptions: {
        input: {
          main: resolve(__dirname, 'src/renderer/index.html'),
        },
      },
    },
  },
});
