import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

// Simple hash function for browser compatibility
const hashCode = async (code: string): Promise<string> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(code);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

// Generate a random recovery code (8 alphanumeric characters)
const generateCode = (): string => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Exclude confusing chars like 0, O, 1, I
  let code = '';
  const array = new Uint8Array(8);
  crypto.getRandomValues(array);
  for (let i = 0; i < 8; i++) {
    code += chars[array[i] % chars.length];
  }
  return code;
};

export const useRecoveryCodes = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [hasRecoveryCodes, setHasRecoveryCodes] = useState<boolean | null>(null);
  const [remainingCodes, setRemainingCodes] = useState<number>(0);
  const { toast } = useToast();

  // Generate new recovery codes
  const generateRecoveryCodes = useCallback(async (): Promise<string[] | null> => {
    setIsGenerating(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('Utilisateur non connecté');
      }

      // Generate 10 new codes
      const newCodes: string[] = [];
      for (let i = 0; i < 10; i++) {
        newCodes.push(generateCode());
      }

      // Delete existing recovery codes for this user
      const { error: deleteError } = await supabase
        .from('mfa_recovery_codes')
        .delete()
        .eq('user_id', user.id);

      if (deleteError) {
        console.error('Error deleting old codes:', deleteError);
      }

      // Hash and store the new codes
      const codesToInsert = await Promise.all(
        newCodes.map(async (code) => ({
          user_id: user.id,
          code_hash: await hashCode(code),
          is_used: false
        }))
      );

      const { error: insertError } = await supabase
        .from('mfa_recovery_codes')
        .insert(codesToInsert);

      if (insertError) {
        throw insertError;
      }

      setHasRecoveryCodes(true);
      setRemainingCodes(10);

      return newCodes;
    } catch (error: any) {
      console.error('Error generating recovery codes:', error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible de générer les codes de récupération",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsGenerating(false);
    }
  }, [toast]);

  // Verify a recovery code
  const verifyRecoveryCode = useCallback(async (code: string, userId?: string): Promise<boolean> => {
    setIsVerifying(true);
    
    try {
      let targetUserId = userId;
      
      if (!targetUserId) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          throw new Error('Utilisateur non connecté');
        }
        targetUserId = user.id;
      }

      const codeHash = await hashCode(code.toUpperCase());

      // Find unused code with matching hash
      const { data: codes, error: fetchError } = await supabase
        .from('mfa_recovery_codes')
        .select('id')
        .eq('user_id', targetUserId)
        .eq('code_hash', codeHash)
        .eq('is_used', false)
        .limit(1);

      if (fetchError) {
        throw fetchError;
      }

      if (!codes || codes.length === 0) {
        return false;
      }

      // Mark the code as used
      const { error: updateError } = await supabase
        .from('mfa_recovery_codes')
        .update({ 
          is_used: true,
          used_at: new Date().toISOString()
        })
        .eq('id', codes[0].id);

      if (updateError) {
        throw updateError;
      }

      // Update remaining codes count
      await checkRecoveryCodes();

      return true;
    } catch (error: any) {
      console.error('Error verifying recovery code:', error);
      return false;
    } finally {
      setIsVerifying(false);
    }
  }, []);

  // Check if user has recovery codes
  const checkRecoveryCodes = useCallback(async (): Promise<void> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setHasRecoveryCodes(false);
        setRemainingCodes(0);
        return;
      }

      const { data: codes, error } = await supabase
        .from('mfa_recovery_codes')
        .select('id')
        .eq('user_id', user.id)
        .eq('is_used', false);

      if (error) {
        console.error('Error checking recovery codes:', error);
        setHasRecoveryCodes(false);
        setRemainingCodes(0);
        return;
      }

      setHasRecoveryCodes(codes && codes.length > 0);
      setRemainingCodes(codes ? codes.length : 0);
    } catch (error) {
      console.error('Error checking recovery codes:', error);
      setHasRecoveryCodes(false);
      setRemainingCodes(0);
    }
  }, []);

  // Delete all recovery codes
  const deleteRecoveryCodes = useCallback(async (): Promise<boolean> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('Utilisateur non connecté');
      }

      const { error } = await supabase
        .from('mfa_recovery_codes')
        .delete()
        .eq('user_id', user.id);

      if (error) {
        throw error;
      }

      setHasRecoveryCodes(false);
      setRemainingCodes(0);

      return true;
    } catch (error: any) {
      console.error('Error deleting recovery codes:', error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible de supprimer les codes de récupération",
        variant: "destructive",
      });
      return false;
    }
  }, [toast]);

  return {
    generateRecoveryCodes,
    verifyRecoveryCode,
    checkRecoveryCodes,
    deleteRecoveryCodes,
    isGenerating,
    isVerifying,
    hasRecoveryCodes,
    remainingCodes
  };
};
