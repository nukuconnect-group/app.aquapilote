import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Key, Mail, AlertCircle, Copy, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { TeamMember } from '@/hooks/useTeamMembers';

interface ResetPasswordResult {
  password: string;
  loginUrl: string;
  emailSent: boolean;
}

interface ResetPasswordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  member: TeamMember | null;
  result: ResetPasswordResult | null;
  isResetting: boolean;
  onReset: (member: TeamMember, sendEmail: boolean) => void;
  onClearResult: () => void;
}

const ResetPasswordDialog: React.FC<ResetPasswordDialogProps> = ({
  open,
  onOpenChange,
  member,
  result,
  isResetting,
  onReset,
  onClearResult,
}) => {
  const { toast } = useToast();

  if (!member) return null;

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) { onOpenChange(false); onClearResult(); } }}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Key className="w-5 h-5 text-amber-600" />
            Réinitialiser le mot de passe
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {!result ? (
            <>
              <div className="bg-muted/50 rounded-lg p-4">
                <p className="text-sm">
                  Vous allez réinitialiser le mot de passe de <strong>{member.member_name}</strong> ({member.member_email}).
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Un nouveau mot de passe sécurisé sera généré.
                </p>
              </div>
              <div className="flex flex-col gap-2">
                <Button onClick={() => onReset(member, true)} disabled={isResetting} className="w-full">
                  {isResetting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  <Mail className="w-4 h-4 mr-2" />
                  Réinitialiser et envoyer par email
                </Button>
                <Button variant="secondary" onClick={() => onReset(member, false)} disabled={isResetting} className="w-full">
                  {isResetting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Réinitialiser sans email
                </Button>
                <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isResetting} className="w-full">
                  Annuler
                </Button>
              </div>
            </>
          ) : (
            <>
              {result.emailSent ? (
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Mail className="w-5 h-5 text-green-600" />
                    <span className="font-medium text-green-800 dark:text-green-200">Email envoyé avec succès!</span>
                  </div>
                  <p className="text-sm text-green-700 dark:text-green-300">
                    Le nouveau mot de passe a été envoyé à <strong>{member.member_email}</strong>.
                  </p>
                </div>
              ) : (
                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="w-5 h-5 text-amber-600" />
                    <span className="font-medium text-amber-800 dark:text-amber-200">Mot de passe réinitialisé</span>
                  </div>
                  <p className="text-sm text-amber-700 dark:text-amber-300">
                    Partagez manuellement les informations ci-dessous à <strong>{member.member_name}</strong>.
                  </p>
                </div>
              )}

              <div className="space-y-3">
                <div>
                  <Label className="text-muted-foreground text-xs">Nouveau mot de passe</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Input value={result.password} readOnly className="font-mono text-sm" />
                    <Button variant="outline" size="icon" onClick={() => { navigator.clipboard.writeText(result.password); toast({ title: "Mot de passe copié" }); }}>
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <div>
                  <Label className="text-muted-foreground text-xs">Lien de connexion</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Input value={result.loginUrl} readOnly className="font-mono text-sm" />
                    <Button variant="outline" size="icon" onClick={() => { navigator.clipboard.writeText(result.loginUrl); toast({ title: "Lien copié" }); }}>
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>

              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  const message = `Bonjour ${member.member_name},\n\nVotre mot de passe AquaPilote a été réinitialisé.\n\nLien de connexion: ${result.loginUrl}\nEmail: ${member.member_email}\nNouveau mot de passe: ${result.password}\n\nVeuillez changer votre mot de passe après votre connexion.`;
                  navigator.clipboard.writeText(message);
                  toast({ title: "Message complet copié" });
                }}
              >
                <Copy className="w-4 h-4 mr-2" />
                Copier tous les identifiants
              </Button>

              <div className="flex justify-end">
                <Button onClick={() => { onOpenChange(false); onClearResult(); }}>Fermer</Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ResetPasswordDialog;
