import { CapacitorConfig } from '@capacitor/cli';

/**
 * Configuration Capacitor — Application mobile native AQUA PILOT
 *
 * IMPORTANT pour les builds production (Play Store / App Store) :
 * Supprimer le bloc `server` ci-dessous avant de générer APK/AAB/IPA.
 * Le bloc `server` n'est utile qu'en développement (hot-reload depuis le sandbox Lovable).
 *
 * Workflow build natif (à exécuter en local après `git pull`) :
 *   npm install
 *   npx cap add ios && npx cap add android
 *   npm run build
 *   npx cap sync
 *   npx cap open ios       # Xcode → Archive → IPA
 *   npx cap open android   # Android Studio → Build → APK / AAB signé
 */
const config: CapacitorConfig = {
  appId: 'app.lovable.0fc17be62fd043fbab5dd4fda8d4767c',
  appName: 'Aqua Pilot',
  webDir: 'dist',

  // ⚠️ DEV uniquement — supprimer pour les builds Play Store / App Store
  server: {
    url: 'https://0fc17be6-2fd0-43fb-ab5d-d4fda8d4767c.lovableproject.com?forceHideBadge=true',
    cleartext: true,
    androidScheme: 'https',
    iosScheme: 'https',
    allowNavigation: ['*.lovableproject.com', '*.supabase.co']
  },

  // Sécurité native
  android: {
    allowMixedContent: false,
    captureInput: true,
    webContentsDebuggingEnabled: false,
    backgroundColor: '#047857'
  },
  ios: {
    contentInset: 'always',
    scrollEnabled: true,
    backgroundColor: '#047857',
    limitsNavigationsToAppBoundDomains: true
  },

  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: '#047857',
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
      showSpinner: true,
      androidSpinnerStyle: 'large',
      iosSpinnerStyle: 'small',
      spinnerColor: '#ffffff',
      splashFullScreen: true,
      splashImmersive: true
    },
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#047857',
      overlaysWebView: false
    },
    Keyboard: {
      resize: 'body',
      style: 'DARK',
      resizeOnFullScreen: true
    },
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert']
    },
    LocalNotifications: {
      smallIcon: 'ic_stat_icon_config_sample',
      iconColor: '#047857',
      sound: 'beep.wav'
    },
    App: {
      // Deep linking universel
      // Schéma personnalisé : aquapilot://
      // Universal Links iOS / App Links Android : aqua-pilote.lovable.app
    },
    CapacitorHttp: {
      enabled: true
    }
  }
};

export default config;
