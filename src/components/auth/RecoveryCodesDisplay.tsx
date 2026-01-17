import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Copy, Check, Download, AlertTriangle, Shield, Eye, EyeOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface RecoveryCodesDisplayProps {
  codes: string[];
  onComplete: () => void;
  isNewEnrollment?: boolean;
}

const RecoveryCodesDisplay: React.FC<RecoveryCodesDisplayProps> = ({ 
  codes, 
  onComplete,
  isNewEnrollment = false 
}) => {
  const [copied, setCopied] = useState(false);
  const [showCodes, setShowCodes] = useState(false);
  const [hasAcknowledged, setHasAcknowledged] = useState(false);
  const { toast } = useToast();

  const copyAllCodes = async () => {
    const codesText = codes.join('\n');
    await navigator.clipboard.writeText(codesText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({
      title: "Codes copiés !",
      description: "Les codes de récupération ont été copiés dans le presse-papiers.",
    });
  };

  const downloadCodes = () => {
    const codesText = `AQUA PILOT - Codes de récupération 2FA
========================================
Date de génération: ${new Date().toLocaleDateString('fr-FR', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })}

IMPORTANT: Conservez ces codes en lieu sûr. 
Chaque code ne peut être utilisé qu'une seule fois.

Codes de récupération:
${codes.map((code, i) => `${i + 1}. ${code}`).join('\n')}

========================================
En cas de perte de votre téléphone, utilisez 
l'un de ces codes pour accéder à votre compte.
`;
    
    const blob = new Blob([codesText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `aqua-pilot-recovery-codes-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Téléchargement démarré",
      description: "Les codes de récupération ont été téléchargés.",
    });
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
          <Shield className="h-6 w-6 text-amber-600 dark:text-amber-400" />
        </div>
        <CardTitle className="text-xl">Codes de récupération</CardTitle>
        <CardDescription>
          {isNewEnrollment 
            ? "Sauvegardez ces codes de secours en cas de perte de votre téléphone"
            : "Vos nouveaux codes de récupération ont été générés"
          }
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <Alert variant="destructive" className="bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800">
          <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          <AlertDescription className="text-amber-800 dark:text-amber-200">
            <strong>Important !</strong> Conservez ces codes en lieu sûr. 
            Chaque code ne peut être utilisé qu'une seule fois. 
            Sans ces codes et sans votre téléphone, vous ne pourrez plus accéder à votre compte.
          </AlertDescription>
        </Alert>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">
              {codes.length} codes de récupération
            </span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowCodes(!showCodes)}
            >
              {showCodes ? (
                <>
                  <EyeOff className="h-4 w-4 mr-1" />
                  Masquer
                </>
              ) : (
                <>
                  <Eye className="h-4 w-4 mr-1" />
                  Afficher
                </>
              )}
            </Button>
          </div>
          
          <div className="grid grid-cols-2 gap-2 p-4 bg-muted/50 rounded-lg border">
            {codes.map((code, index) => (
              <div
                key={index}
                className="font-mono text-sm p-2 bg-background rounded border text-center"
              >
                {showCodes ? code : '••••••••'}
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={copyAllCodes}
            className="flex-1"
          >
            {copied ? (
              <>
                <Check className="h-4 w-4 mr-2" />
                Copié !
              </>
            ) : (
              <>
                <Copy className="h-4 w-4 mr-2" />
                Copier
              </>
            )}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={downloadCodes}
            className="flex-1"
          >
            <Download className="h-4 w-4 mr-2" />
            Télécharger
          </Button>
        </div>

        <div className="flex items-center gap-2 pt-2">
          <input
            type="checkbox"
            id="acknowledge"
            checked={hasAcknowledged}
            onChange={(e) => setHasAcknowledged(e.target.checked)}
            className="h-4 w-4 rounded border-input"
          />
          <label htmlFor="acknowledge" className="text-sm text-muted-foreground">
            J'ai sauvegardé mes codes de récupération
          </label>
        </div>

        <Button
          onClick={onComplete}
          disabled={!hasAcknowledged}
          className="w-full"
        >
          Continuer
        </Button>
      </CardContent>
    </Card>
  );
};

export default RecoveryCodesDisplay;
