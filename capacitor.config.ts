import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.snakeretro.game',
  appName: 'Snake Retro',
  webDir: 'dist',
  android: {
    backgroundColor: '#0a0a12',
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 1000,
      backgroundColor: '#0a0a12',
      showSpinner: false,
    },
  },
};

export default config;
