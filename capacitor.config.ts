import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.portoseguro.crm',
  appName: 'Porto Seguro CRM',
  webDir: 'www',
  plugins: {
    CapacitorSQLite: {
      webUseIndexedDB: true
    }
  }
};

export default config;
