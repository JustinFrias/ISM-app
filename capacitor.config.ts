import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.ism.inventory',
  appName: 'ISM Inventory',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
  },
};

export default config;
