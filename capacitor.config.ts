import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.sreyassanker.lifeos',
  appName: 'LifeOS',
  webDir: 'out',
  android: {
    // WebView settings for optimal performance
    webContentsDebuggingEnabled: false,
    allowMixedContent: true,
    // Build type
    buildOptions: {
      keystorePath: undefined,
      keystoreAlias: undefined,
      releaseType: 'APK',
    },
  },
  server: {
    // Allow loading local assets
    androidScheme: 'https',
    // Handle navigation
    cleartext: true,
  },
  // Plugin config
  plugins: {},
};

export default config;
