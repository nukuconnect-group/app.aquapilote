import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, Smartphone, Monitor, CheckCircle2, Apple, Chrome, Share2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { usePWAInstallState } from '@/hooks/usePWAInstallState';

type Platform = 'android' | 'ios' | 'desktop-chrome' | 'desktop-safari' | 'desktop-firefox' | 'other';

const detectPlatform = (): Platform => {
  const ua = navigator.userAgent.toLowerCase();
  if (/iphone|ipad|ipod/.test(ua)) return 'ios';
  if (/android/.test(ua)) return 'android';
  if (/safari/.test(ua) && !/chrome|chromium|edg/.test(ua)) return 'desktop-safari';
  if (/firefox/.test(ua)) return 'desktop-firefox';
  if (/chrome|chromium|edg/.test(ua)) return 'desktop-chrome';
  return 'other';
};

const PLATFORM_STEPS: Record<Platform, { title: string; icon: React.ElementType; steps: string[] }> = {
  android: {
    title: 'Android (Chrome)',
    icon: Smartphone,
    steps: [
      "Touchez le bouton \"Installer\" ci-dessus si disponible.",
      "Sinon, ouvrez le menu (⋮) en haut à droite du navigateur.",
      "Choisissez \"Installer l'application\" ou \"Ajouter à l'écran d'accueil\".",
      "Confirmez. L'icône AQUAPILOTE apparaît sur votre écran d'accueil.",
    ],
  },
  ios: {
    title: 'iPhone / iPad (Safari)',
    icon: Apple,
    steps: [
      "Ouvrez cette page dans Safari (pas Chrome).",
      "Touchez l'icône Partage (□↑) en bas de l'écran.",
      "Faites défiler et sélectionnez \"Sur l'écran d'accueil\".",
      "Touchez \"Ajouter\" en haut à droite.",
    ],
  },
  'desktop-chrome': {
    title: 'Ordinateur (Chrome / Edge)',
    icon: Chrome,
    steps: [
      "Cliquez sur \"Installer\" ci-dessus si le bouton est actif.",
      "Sinon, cliquez sur l'icône d'installation ⊕ dans la barre d'adresse.",
      "Ou ouvrez le menu (⋮) → \"Installer AQUAPILOTE\".",
      "L'app s'ouvre dans sa propre fenêtre, comme un logiciel classique.",
    ],
  },
  'desktop-safari': {
    title: 'Ordinateur Mac (Safari)',
    icon: Apple,
    steps: [
      "Ouvrez le menu \"Fichier\" de Safari.",
      "Choisissez \"Ajouter au Dock…\".",
      "L'application AQUAPILOTE sera disponible depuis votre Dock.",
    ],
  },
  'desktop-firefox': {
    title: 'Ordinateur (Firefox)',
    icon: Monitor,
    steps: [
      "Firefox ne propose pas l'installation directe des PWA.",
      "Créez un raccourci : clic droit sur l'onglet → \"Épingler l'onglet\".",
      "Ou utilisez Chrome/Edge pour une vraie installation.",
    ],
  },
  other: {
    title: 'Autre navigateur',
    icon: Share2,
    steps: [
      "Ouvrez le menu de votre navigateur.",
      "Cherchez \"Installer\", \"Ajouter à l'écran d'accueil\" ou \"Ajouter aux applications\".",
      "Suivez les instructions du navigateur pour finaliser l'installation.",
    ],
  },
};

const PWAInstallCard: React.FC = () => {
  const { toast } = useToast();
  const { isInstalled, canPromptInstall, promptInstall } = usePWAInstallState();
  const [platform, setPlatform] = useState<Platform>('other');

  useEffect(() => {
    setPlatform(detectPlatform());
  }, []);

  const handleInstall = async () => {
    if (!canPromptInstall) {
      toast({
        title: 'Installation manuelle',
        description: 'Suivez les instructions ci-dessous pour votre appareil.',
      });
      return;
    }
    const outcome = await promptInstall();
    if (outcome === 'accepted') {
      toast({ title: 'Installation lancée', description: "AQUAPILOTE s'installe sur votre appareil." });
    }
  };

  const info = PLATFORM_STEPS[platform];
  const Icon = info.icon;

  return (
    <Card className="border-primary/30">
      <CardHeader>
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div className="min-w-0 flex-1">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <Download className="w-5 h-5 text-primary" />
              Installer AQUAPILOTE sur votre appareil
            </CardTitle>
            <CardDescription className="mt-1">
              Un raccourci sur votre écran d'accueil, sans passer par le navigateur ni les stores.
            </CardDescription>
          </div>
          {isInstalled ? (
            <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300 gap-1">
              <CheckCircle2 className="w-3 h-3" />
              Installée
            </Badge>
          ) : (
            <Badge variant="outline">Non installée</Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {isInstalled ? (
          <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-3 text-sm text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-200 dark:border-emerald-800">
            L'application est déjà installée. Ouvrez-la depuis l'icône AQUAPILOTE sur votre écran d'accueil ou dans votre menu d'applications.
          </div>
        ) : (
          <>
            <Button
              onClick={handleInstall}
              className="w-full sm:w-auto"
              size="lg"
              disabled={!canPromptInstall && platform === 'ios'}
            >
              <Download className="w-4 h-4 mr-2" />
              {canPromptInstall ? "Installer l'application" : "Voir les instructions"}
            </Button>
            {!canPromptInstall && (
              <p className="text-xs text-muted-foreground">
                Le bouton d'installation direct n'est pas disponible sur ce navigateur. Suivez les étapes ci-dessous.
              </p>
            )}
          </>
        )}

        <div className="rounded-lg border bg-muted/40 p-3 sm:p-4 space-y-2">
          <div className="flex items-center gap-2 font-medium text-sm">
            <Icon className="w-4 h-4 text-primary" />
            Instructions pour {info.title}
          </div>
          <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground marker:text-primary marker:font-semibold">
            {info.steps.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ol>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
          <div className="flex items-center gap-2 p-2 rounded bg-muted/40">
            <Smartphone className="w-4 h-4 text-primary shrink-0" />
            <span>Mobile Android/iPhone</span>
          </div>
          <div className="flex items-center gap-2 p-2 rounded bg-muted/40">
            <Monitor className="w-4 h-4 text-primary shrink-0" />
            <span>Windows / macOS / Linux</span>
          </div>
          <div className="flex items-center gap-2 p-2 rounded bg-muted/40">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Utilisable hors connexion</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PWAInstallCard;