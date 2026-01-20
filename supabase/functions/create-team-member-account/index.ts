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

  // Shuffle password
  return password.split('').sort(() => Math.random() - 0.5).join('');
};

const normalizeEmail = (email: string) => email.trim().toLowerCase();

const findAuthUserByEmail = async (
  supabaseAdmin: ReturnType<typeof createClient>,
  email: string,
): Promise<{ id: string; email?: string | null } | null> => {
  const target = normalizeEmail(email);

  // Supabase Admin API is paginated; scan a limited number of pages
  const perPage = 200;
  const maxPages = 50;

  for (let page = 1; page <= maxPages; page++) {
    const { data, error } = await supabaseAdmin.auth.admin.listUsers({ page, perPage });
    if (error) {
      console.error('Error listing users:', error);
      return null;
    }

    const users = data?.users || [];
    const found = users.find((u) => (u.email ? normalizeEmail(u.email) : '') === target);
    if (found) return { id: found.id, email: found.email };

    // No more pages
    if (users.length < perPage) return null;
  }

  return null;
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
    const { email, full_name, team_member_id, password: providedPassword, sendEmail: shouldSendEmail } = body;

    console.log('Creating team member account:', { email, full_name, team_member_id, shouldSendEmail, requestedBy: user.id });

    if (!email || !full_name) {
      return new Response(
        JSON.stringify({ error: 'Email et nom requis' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(
        JSON.stringify({ error: 'Format d\'email invalide' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create admin client
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // SECURITY: If team_member_id is provided, verify ownership
    if (team_member_id) {
      const { data: teamMember, error: teamError } = await supabaseAdmin
        .from('team_members')
        .select('owner_id, member_email, user_id, status')
        .eq('id', team_member_id)
        .single();

      if (teamError || !teamMember) {
        console.error('Team member not found:', teamError);
        return new Response(
          JSON.stringify({ error: 'Membre d\'équipe non trouvé' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Idempotent behavior: if already linked, return success instead of failing.
      // This avoids "Créer un compte" failing when the first attempt succeeded but UI wasn't refreshed.
      if (teamMember.user_id) {
        const appUrl = req.headers.get('origin') || 'https://aqua-pilote.lovable.app';
        const loginUrl = `${appUrl}/auth`;

        return new Response(
          JSON.stringify({
            success: true,
            existingUser: true,
            alreadyLinked: true,
            user: {
              id: teamMember.user_id,
              email: normalizeEmail(email),
              full_name: full_name?.trim?.() || null,
            },
            credentials: {
              email: normalizeEmail(email),
              password: null,
              loginUrl,
            },
            message: 'Ce membre est déjà lié à un compte. Vous pouvez vous connecter avec ses identifiants (ou réinitialiser le mot de passe).'
          }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Check ownership - only allow if the caller is the owner
      if (teamMember.owner_id !== user.id) {
        // Check if user is an admin
        const { data: roleData } = await supabaseAdmin
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .single();

        if (!roleData || roleData.role !== 'admin') {
          console.error('Unauthorized account creation attempt:', {
            requestedBy: user.id,
            teamMemberOwnerId: teamMember.owner_id,
            teamMemberId: team_member_id
          });
          return new Response(
            JSON.stringify({ error: 'Vous n\'avez pas les droits pour créer ce compte' }),
            { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      }

      // Verify that the email matches the team member's email
      if (teamMember.member_email.toLowerCase() !== email.trim().toLowerCase()) {
        return new Response(
          JSON.stringify({ error: 'L\'email ne correspond pas au membre d\'équipe' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Use provided password if present, else generate one
    let password = (typeof providedPassword === 'string' && providedPassword.trim().length > 0)
      ? providedPassword
      : generatePassword();

    // Basic password validation (server-side)
    if (password.length < 8) {
      return new Response(
        JSON.stringify({ error: 'Mot de passe trop court (min 8 caractères)' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    if (!/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/[0-9]/.test(password)) {
      return new Response(
        JSON.stringify({ error: 'Mot de passe invalide (maj/min/chiffre requis)' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if user already exists (paginated)
    const existingUser = await findAuthUserByEmail(supabaseAdmin, email);

    if (existingUser) {
      // User exists - link them to the team member record instead of failing
      if (team_member_id) {
        const { error: updateError } = await supabaseAdmin
          .from('team_members')
          .update({
            user_id: existingUser.id,
            status: 'active',
            accepted_at: new Date().toISOString()
          })
          .eq('id', team_member_id);

        if (updateError) {
          console.error('Error linking existing user to team member:', updateError);
          return new Response(
            JSON.stringify({ error: 'Erreur lors de la liaison du compte existant' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const appUrl = req.headers.get('origin') || 'https://aqua-pilote.lovable.app';
        const loginUrl = `${appUrl}/auth`;

        return new Response(
          JSON.stringify({
            success: true,
            existingUser: true,
            user: {
              id: existingUser.id,
              email: existingUser.email,
              full_name: full_name.trim()
            },
            credentials: {
              email: normalizeEmail(email),
              password: null,
              loginUrl
            },
            message: 'Utilisateur existant lié au membre d\'équipe. Utilisez son mot de passe existant ou réinitialisez-le.'
          }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ error: 'Un utilisateur avec cet email existe déjà' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

     // Create the user
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
       email: normalizeEmail(email),
      password: password,
      email_confirm: true,
      user_metadata: {
        full_name: full_name.trim(),
        team_member_id: team_member_id
      }
    });

    if (authError) {
      // Common case: email already exists but was not found due to pagination/race
      const msg = (authError as any)?.message || '';
      if (msg.toLowerCase().includes('already') || msg.toLowerCase().includes('exists') || msg.toLowerCase().includes('registered')) {
        const existing = await findAuthUserByEmail(supabaseAdmin, email);
        if (existing && team_member_id) {
          const { error: updateError } = await supabaseAdmin
            .from('team_members')
            .update({
              user_id: existing.id,
              status: 'active',
              accepted_at: new Date().toISOString()
            })
            .eq('id', team_member_id);

          if (updateError) {
            console.error('Error linking existing user after createUser conflict:', updateError);
            return new Response(
              JSON.stringify({ error: 'Erreur lors de la liaison du compte existant' }),
              { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }

          const appUrl = req.headers.get('origin') || 'https://aqua-pilote.lovable.app';
          const loginUrl = `${appUrl}/auth`;

          return new Response(
            JSON.stringify({
              success: true,
              existingUser: true,
              user: {
                id: existing.id,
                email: existing.email,
                full_name: full_name.trim()
              },
              credentials: {
                email: normalizeEmail(email),
                password: null,
                loginUrl
              },
              message: 'Utilisateur existant lié au membre d\'équipe. Utilisez son mot de passe existant ou réinitialisez-le.'
            }),
            { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      }

      console.error('User creation error:', authError);
      return new Response(
        JSON.stringify({ error: authError.message }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!authData.user) {
      return new Response(
        JSON.stringify({ error: 'Erreur lors de la création de l\'utilisateur' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('User created successfully:', authData.user.id);

    // CRITICAL: Update team member with user_id and set status to active
    if (team_member_id) {
      console.log('Updating team_member with user_id:', { team_member_id, user_id: authData.user.id });
      
      const { data: updateData, error: updateError } = await supabaseAdmin
        .from('team_members')
        .update({ 
          user_id: authData.user.id,
          status: 'active', 
          accepted_at: new Date().toISOString() 
        })
        .eq('id', team_member_id)
        .select();

      if (updateError) {
        console.error('Error updating team member with user_id:', updateError);
        // CRITICAL: If we can't link the user, we should still inform the caller
        // but continue because the auth account was created
      } else {
        console.log('Team member updated successfully:', updateData);
      }
    }

    // Also create or update profile for the new user
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .upsert({
        id: authData.user.id,
        email: email.trim(),
        full_name: full_name.trim(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }, { onConflict: 'id' });

    if (profileError) {
      console.error('Error creating profile:', profileError);
    }

    const appUrl = req.headers.get('origin') || 'https://aqua-pilote.lovable.app';
    const loginUrl = `${appUrl}/auth`;

    // Send email with credentials via Resend (only if shouldSendEmail is true or undefined)
    let emailSent = false;
    let emailError = null;
    
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    if (resendApiKey && shouldSendEmail !== false) {
      try {
        const resend = new Resend(resendApiKey);
        
        const emailResponse = await resend.emails.send({
          from: "AquaPilote <onboarding@resend.dev>",
          to: [email.trim()],
          subject: "Bienvenue sur AquaPilote - Vos identifiants de connexion",
          html: `
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="utf-8">
              <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #0ea5e9, #0284c7); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                .content { background: #f8fafc; padding: 30px; border-radius: 0 0 10px 10px; }
                .credentials { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #0ea5e9; }
                .credential-item { margin: 10px 0; }
                .label { font-weight: bold; color: #64748b; }
                .value { font-family: monospace; background: #e2e8f0; padding: 8px 12px; border-radius: 4px; display: inline-block; margin-top: 5px; }
                .btn { display: inline-block; background: #0ea5e9; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 20px; }
                .footer { text-align: center; color: #64748b; font-size: 12px; margin-top: 30px; }
              </style>
            </head>
            <body>
              <div class="header">
                <h1>🐟 Bienvenue sur AquaPilote!</h1>
              </div>
              <div class="content">
                <p>Bonjour <strong>${full_name.trim()}</strong>,</p>
                <p>Vous avez été ajouté en tant que membre d'équipe sur AquaPilote. Voici vos identifiants de connexion:</p>
                
                <div class="credentials">
                  <div class="credential-item">
                    <span class="label">📧 Email:</span><br>
                    <span class="value">${email.trim()}</span>
                  </div>
                  <div class="credential-item">
                    <span class="label">🔐 Mot de passe:</span><br>
                    <span class="value">${password}</span>
                  </div>
                </div>
                
                <p><strong>Important:</strong> Nous vous recommandons de changer votre mot de passe après votre première connexion.</p>
                
                <center>
                  <a href="${loginUrl}" class="btn">Se connecter à AquaPilote</a>
                </center>
                
                <div class="footer">
                  <p>Si vous n'êtes pas à l'origine de cette invitation, veuillez ignorer cet email.</p>
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
    } else {
      console.log('Email not sent: shouldSendEmail =', shouldSendEmail, ', resendApiKey configured:', !!resendApiKey);
    }

    console.log('Team member account created:', authData.user.id, 'linked to team_member_id:', team_member_id, 'by owner:', user.id);
    
    // Return password in response so the owner can share it with the team member
    // This is secure as only the authenticated owner who created the account receives this response
    return new Response(
      JSON.stringify({ 
        success: true,
        user: {
          id: authData.user.id,
          email: authData.user.email,
          full_name: full_name.trim()
        },
        credentials: {
          email: email.trim(),
          password: password,
          loginUrl: loginUrl
        },
        emailSent,
        emailError,
        message: emailSent 
          ? 'Compte créé avec succès. Les identifiants ont été envoyés par email.' 
          : 'Compte créé avec succès. Veuillez noter que l\'email n\'a pas pu être envoyé.'
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