import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [react()],
    define: {
      'process.env.NODE_ENV': JSON.stringify(env.NODE_ENV ?? mode),
      'process.env.REACT_APP_FE': JSON.stringify(env.REACT_APP_FE ?? ''),
      'process.env.REACT_APP_BE': JSON.stringify(env.REACT_APP_BE ?? ''),
      'process.env.REACT_APP_AUTHENTICATION_MOCKED': JSON.stringify(
        env.REACT_APP_AUTHENTICATION_MOCKED ?? '',
      ),
      'process.env.PUBLIC_URL': JSON.stringify(env.PUBLIC_URL ?? ''),
    },
    resolve: {
      alias: {
        assets: path.resolve(__dirname, 'src/assets'),
        authentication: path.resolve(__dirname, 'src/authentication'),
        components: path.resolve(__dirname, 'src/components'),
        "connected-react-router": path.resolve(
          __dirname,
          'src/shims/connected-react-router.ts',
        ),
        hooks: path.resolve(__dirname, 'src/hooks'),
        hoc: path.resolve(__dirname, 'src/hoc'),
        lodash: path.resolve(__dirname, 'src/shims/lodash.ts'),
        model: path.resolve(__dirname, 'src/model'),
        moment: path.resolve(__dirname, 'src/shims/moment.ts'),
        localization: path.resolve(__dirname, 'src/localization'),
        pages: path.resolve(__dirname, 'src/pages'),
        qs: path.resolve(__dirname, 'src/shims/qs.ts'),
        "react-device-detect": path.resolve(
          __dirname,
          'src/shims/react-device-detect.ts',
        ),
        "react-intl": path.resolve(__dirname, 'src/shims/react-intl.tsx'),
        "redux-devtools-extension": path.resolve(
          __dirname,
          'src/shims/redux-devtools-extension.ts',
        ),
        styles: path.resolve(__dirname, 'src/styles'),
        store: path.resolve(__dirname, 'src/store'),
        tools: path.resolve(__dirname, 'src/tools'),
        'react-dates/initialize': path.resolve(
          __dirname,
          'src/vendor/react-dates/initialize.ts',
        ),
        'react-dates/lib/css/_datepicker.css': path.resolve(
          __dirname,
          'src/vendor/react-dates/datepicker.css',
        ),
        utils: path.resolve(__dirname, 'src/utils'),
      },
    },
    server: {
      proxy: {
        '/wmpbe': {
          target: 'https://rep-test.i.openreply.eu',
          changeOrigin: true,
          secure: true,
        },
      },
    },
  }
})
