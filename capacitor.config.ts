import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.buywise.app',
  appName: 'BuyWise',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
