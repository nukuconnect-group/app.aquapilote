# 📱 Guide de build mobile natif — AQUA PILOT (Capacitor)

## ✅ Ce qui a été configuré dans Lovable

- ❌ **SEO totalement désactivé** (`robots.txt` Disallow + `<meta robots="noindex,nofollow">` + retrait des balises og/twitter)
- ✅ **Capacitor configuré pour production** (`capacitor.config.ts`) : SplashScreen, StatusBar, Keyboard, PushNotifications, LocalNotifications, deep linking, sécurité (mixed content off, debug off, app-bound domains iOS)
- ✅ **PWA déjà active** (vite-plugin-pwa) — utilisable comme app installable côté web
- ✅ **Preview forcé en mobile** dans l'éditeur

## 🚀 Étapes pour générer APK / AAB / IPA

> Ces étapes se font **en local sur ta machine** — Xcode et Android Studio ne tournent pas dans Lovable.

### 1. Récupérer le projet
```bash
# Via le bouton "Export to GitHub" dans Lovable
git clone <ton-repo>
cd <ton-repo>
npm install
```

### 2. Retirer le bloc `server` de `capacitor.config.ts`
Pour les builds production, **supprime le bloc `server: { url: ... }`** sinon l'app pointera vers le sandbox Lovable au lieu d'utiliser le bundle local.

### 3. Ajouter les plateformes natives
```bash
npx cap add ios
npx cap add android
```

### 4. Installer les plugins Capacitor recommandés
```bash
npm install @capacitor/splash-screen @capacitor/status-bar @capacitor/keyboard \
            @capacitor/push-notifications @capacitor/local-notifications \
            @capacitor/app @capacitor/haptics @capacitor/network \
            @capacitor/preferences @capacitor/share @capacitor/device
```

### 5. Build & sync
```bash
npm run build
npx cap sync
```

### 6a. Android (APK / AAB)
```bash
npx cap open android
```
Dans Android Studio :
- **Build → Generate Signed Bundle / APK**
- Choisir **Android App Bundle (.aab)** pour Google Play
- Créer un keystore (à conserver précieusement, requis pour toutes les futures mises à jour)
- Variant : `release`

### 6b. iOS (IPA)
```bash
npx cap open ios
```
Dans Xcode (macOS uniquement) :
- Sélectionner **Any iOS Device (arm64)**
- **Product → Archive**
- **Distribute App → App Store Connect**

## 🔔 Push Notifications (Firebase)
1. Créer un projet Firebase → ajouter les apps Android (package `app.lovable.0fc17be62fd043fbab5dd4fda8d4767c`) et iOS
2. Télécharger `google-services.json` → `android/app/`
3. Télécharger `GoogleService-Info.plist` → `ios/App/App/`
4. iOS : générer une clé APNs depuis Apple Developer → uploader dans Firebase

## 🔐 Comptes développeur requis
- **Apple Developer** — 99 $/an — https://developer.apple.com
- **Google Play Console** — 25 $ unique — https://play.google.com/console

## 🔗 Deep Linking
- Schéma personnalisé : `aquapilot://`
- Universal Links iOS / App Links Android : `https://aqua-pilote.lovable.app/...`
- Configurer `apple-app-site-association` et `assetlinks.json` côté domaine après publication

## 📋 Permissions à déclarer
**Android** (`android/app/src/main/AndroidManifest.xml`) :
- `INTERNET`, `ACCESS_NETWORK_STATE`, `POST_NOTIFICATIONS`, `CAMERA`, `ACCESS_FINE_LOCATION` (selon usage)

**iOS** (`ios/App/App/Info.plist`) :
- `NSCameraUsageDescription`, `NSLocationWhenInUseUsageDescription`, `NSPhotoLibraryUsageDescription`

## 🎨 Icônes & Splash Screen
```bash
npm install -D @capacitor/assets
npx capacitor-assets generate --iconBackgroundColor '#047857' --splashBackgroundColor '#047857'
```
Place une icône 1024×1024 dans `resources/icon.png` et un splash 2732×2732 dans `resources/splash.png`.
