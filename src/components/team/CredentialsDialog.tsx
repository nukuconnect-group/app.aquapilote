import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CheckCircle, AlertCircle, Mail, Copy, Link } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useSettings } from '@/contexts/SettingsContext';

interface CreatedCredentials {
  email: string;
  password?: string | null;
  loginUrl: string;
  memberName: string;
  emailSent: boolean;
  emailError?: string | null;
  existingUser?: boolean;
}

interface CredentialsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  credentials: CreatedCredentials | null;
}

const CredentialsDialog: React.FC<CredentialsDialogProps> = ({ open, onOpenChange, credentials }) => {
  const { toast } = useToast();

  if (!credentials) return null;

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({ title: t('copied'), description: `${label} ${t('copied_to_clipboard')}` });
    } catch {
      toast({ title: t('error'), description: t('copy_error'), variant: "destructive" });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            {credentials.existingUser ? 'Compte lié' : 'Compte créé avec succès'}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {credentials.existingUser ? (
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="w-5 h-5 text-amber-600" />
                <span className="font-medium text-amber-800 dark:text-amber-200">Utilisateur déjà existant</span>
              </div>
              <p className="text-sm text-amber-700 dark:text-amber-300">
                Un compte existait déjà pour <strong>{credentials.email}</strong> et a été lié à ce membre.
                Utilisez <strong>"Réinitialiser mot de passe"</strong> si le membre ne le connaît pas.
              </p>
            </div>
          ) : credentials.emailSent ? (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Mail className="w-5 h-5 text-green-600" />
                <span className="font-medium text-green-800 dark:text-green-200">Email envoyé avec succès!</span>
              </div>
              <p className="text-sm text-green-700 dark:text-green-300">
                Un email avec les identifiants de connexion a été envoyé à <strong>{credentials.email}</strong>.
              </p>
            </div>
          ) : (
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="w-5 h-5 text-amber-600" />
                <span className="font-medium text-amber-800 dark:text-amber-200">Email non envoyé</span>
              </div>
              <p className="text-sm text-amber-700 dark:text-amber-300">
                Le compte a été créé mais l'email n'a pas pu être envoyé{credentials.emailError ? `: ${credentials.emailError}` : ''}.
                Envoyez manuellement les informations ci-dessous à <strong>{credentials.memberName}</strong>.
              </p>
            </div>
          )}

          <div className="space-y-3">
            <div>
              <Label className="text-muted-foreground">Lien de connexion</Label>
              <div className="flex items-center gap-2 mt-1">
                <Input value={credentials.loginUrl} readOnly className="font-mono text-sm" />
                <Button variant="outline" size="icon" onClick={() => copyToClipboard(credentials.loginUrl, 'Lien')}>
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <div>
              <Label className="text-muted-foreground">Email</Label>
              <div className="flex items-center gap-2 mt-1">
                <Input value={credentials.email} readOnly className="font-mono text-sm" />
                <Button variant="outline" size="icon" onClick={() => copyToClipboard(credentials.email, 'Email')}>
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>
            {!!credentials.password && !credentials.existingUser && (
              <div>
                <Label className="text-muted-foreground">Mot de passe temporaire</Label>
                <div className="flex items-center gap-2 mt-1">
                  <Input type="text" value={credentials.password} readOnly className="font-mono text-sm" />
                  <Button variant="outline" size="icon" onClick={() => copyToClipboard(credentials.password || '', 'Mot de passe')}>
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-1">Communiquez-le de manière sécurisée au membre.</p>
              </div>
            )}
          </div>

          {!credentials.existingUser && !!credentials.password && (
            <div className="border-t pt-4">
              <Button
                className="w-full"
                onClick={() => {
                  const message = `Bonjour ${credentials.memberName},\n\nVotre compte AquaPilote a été créé.\n\nLien de connexion: ${credentials.loginUrl}\nEmail: ${credentials.email}\nMot de passe: ${credentials.password}\n\nVeuillez changer votre mot de passe après votre première connexion.`;
                  copyToClipboard(message, 'Message');
                }}
              >
                <Link className="w-4 h-4 mr-2" />
                Copier tout le message d'invitation
              </Button>
            </div>
          )}

          {!credentials.existingUser && (
            <p className="text-xs text-muted-foreground text-center">
              Conseil: Demandez au membre de changer son mot de passe après la première connexion.
            </p>
          )}
        </div>
        <div className="flex justify-end mt-4">
          <Button onClick={() => onOpenChange(false)}>Fermer</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CredentialsDialog;
