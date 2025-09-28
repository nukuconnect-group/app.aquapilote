import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.0fc17be62fd043fbab5dd4fda8d4767c',
  appName: 'aqua-pilote',
  webDir: 'dist',
  server: {
    url: 'https://0fc17be6-2fd0-43fb-ab5d-d4fda8d4767c.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 0,
      backgroundColor: '#ffffff'
    }
  }
};

export default config;