import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Generate a secure random password
const generatePassword = () => {
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  const special = '!@#$%&*';
  
  let password = '';
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += special[Math.floor(Math.random() * special.length)];
  
  const allChars = uppercase + lowercase + numbers + special;
  for (let i = 0; i < 8; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)];
  }
  
  return password.split('').sort(() => Math.random() - 0.5).join('');
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Non autorisé' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    // Verify user is authenticated
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Non autorisé' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const body = await req.json();
    const { email, member_name, sendEmail } = body;

    console.log('Resetting password for:', { email, member_name, sendEmail, requestedBy: user.id });

    if (!email) {
      return new Response(
        JSON.stringify({ error: 'Email requis' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create admin client
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // SECURITY: Verify that the caller owns this team member
    const { data: teamMember, error: teamError } = await supabaseAdmin
      .from('team_members')
      .select('owner_id, id, member_name')
      .eq('member_email', email.trim().toLowerCase())
      .single();

    if (teamError || !teamMember) {
      console.error('Team member not found:', teamError);
      return new Response(
        JSON.stringify({ error: 'Membre d\'équipe non trouvé' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check ownership - only allow if the caller is the owner of the team member
    if (teamMember.owner_id !== user.id) {
      // Check if user is an admin
      const { data: roleData } = await supabaseAdmin
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .single();

      if (!roleData || roleData.role !== 'admin') {
        console.error('Unauthorized password reset attempt:', { 
          requestedBy: user.id, 
          teamMemberOwnerId: teamMember.owner_id,
          targetEmail: email 
        });
        return new Response(
          JSON.stringify({ error: 'Vous n\'avez pas les droits pour réinitialiser ce mot de passe' }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Find the user by email
    const { data: existingUsers, error: listError } = await supabaseAdmin.auth.admin.listUsers();
    if (listError) {
      console.error('Error listing users:', listError);
      return new Response(
        JSON.stringify({ error: 'Erreur lors de la recherche de l\'utilisateur' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const targetUser = existingUsers?.users?.find(u => u.email?.toLowerCase() === email.trim().toLowerCase());
    
    if (!targetUser) {
      return new Response(
        JSON.stringify({ error: 'Utilisateur non trouvé avec cet email' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Generate new password
    const newPassword = generatePassword();

    // Update user password
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      targetUser.id,
      { password: newPassword }
    );

    if (updateError) {
      console.error('Error updating password:', updateError);
      return new Response(
        JSON.stringify({ error: 'Erreur lors de la réinitialisation du mot de passe' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const appUrl = req.headers.get('origin') || 'https://hhsvraqchtqqgaezhnzn.lovableproject.com';
    const loginUrl = `${appUrl}/auth`;

    // Send email with new password if requested
    let emailSent = false;
    let emailError = null;
    
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    if (resendApiKey && sendEmail === true) {
      try {
        const resend = new Resend(resendApiKey);
        
        const emailResponse = await resend.emails.send({
          from: "AquaPilote <onboarding@resend.dev>",
          to: [email.trim()],
          subject: "AquaPilote - Votre nouveau mot de passe",
          html: `
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="utf-8">
              <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #f59e0b, #d97706); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                .content { background: #f8fafc; padding: 30px; border-radius: 0 0 10px 10px; }
                .credentials { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b; }
                .credential-item { margin: 10px 0; }
                .label { font-weight: bold; color: #64748b; }
                .value { font-family: monospace; background: #e2e8f0; padding: 8px 12px; border-radius: 4px; display: inline-block; margin-top: 5px; }
                .btn { display: inline-block; background: #f59e0b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 20px; }
                .footer { text-align: center; color: #64748b; font-size: 12px; margin-top: 30px; }
              </style>
            </head>
            <body>
              <div class="header">
                <h1>🔐 Mot de passe réinitialisé</h1>
              </div>
              <div class="content">
                <p>Bonjour <strong>${member_name || teamMember.member_name || 'Membre'}</strong>,</p>
                <p>Votre mot de passe AquaPilote a été réinitialisé par un administrateur. Voici vos nouveaux identifiants de connexion:</p>
                
                <div class="credentials">
                  <div class="credential-item">
                    <span class="label">📧 Email:</span><br>
                    <span class="value">${email.trim()}</span>
                  </div>
                  <div class="credential-item">
                    <span class="label">🔐 Nouveau mot de passe:</span><br>
                    <span class="value">${newPassword}</span>
                  </div>
                </div>
                
                <p><strong>Important:</strong> Nous vous recommandons fortement de changer votre mot de passe après votre connexion.</p>
                
                <center>
                  <a href="${loginUrl}" class="btn">Se connecter à AquaPilote</a>
                </center>
                
                <div class="footer">
                  <p>Si vous n'avez pas demandé cette réinitialisation, contactez immédiatement votre administrateur.</p>
                  <p>© ${new Date().getFullYear()} AquaPilote - Gestion aquacole intelligente</p>
                </div>
              </div>
            </body>
            </html>
          `,
        });
        
        console.log('Email sent successfully:', emailResponse);
        emailSent = true;
      } catch (e) {
        console.error('Error sending email:', e);
        emailError = e.message;
      }
    }

    console.log('Password reset successfully for:', email, 'by owner:', user.id);
    
    // SECURITY: Do not return password in response - it's sent via email only
    return new Response(
      JSON.stringify({ 
        success: true,
        loginUrl,
        emailSent,
        emailError,
        message: emailSent 
          ? 'Mot de passe réinitialisé avec succès. Les nouveaux identifiants ont été envoyés par email.' 
          : 'Mot de passe réinitialisé avec succès. Veuillez noter que l\'email n\'a pas pu être envoyé.'
        // newPassword intentionally NOT included - sent via email only
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: 'Erreur serveur interne' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
