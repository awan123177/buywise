import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'store.buywiser.app',
  appName: 'BuyWise',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
  },
};

export default config;
