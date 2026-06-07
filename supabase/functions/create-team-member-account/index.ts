import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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

const normalizeEmail = (email: string) => email.trim().toLowerCase();

// Fast lookup: check the public.profiles table first (most users have a profile)
const findUserIdByEmail = async (
  supabaseAdmin: ReturnType<typeof createClient>,
  email: string,
): Promise<string | null> => {
  const target = normalizeEmail(email);
  try {
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .ilike('email', target)
      .maybeSingle();
    if (profile?.id) return profile.id as string;
  } catch (e) {
    console.error('profiles lookup error:', e);
  }

  // Fallback: scan first few pages of auth users (rarely needed)
  try {
    for (let page = 1; page <= 5; page++) {
      const { data, error } = await supabaseAdmin.auth.admin.listUsers({ page, perPage: 200 });
      if (error) break;
      const users = data?.users || [];
      const found = users.find((u) => (u.email ? normalizeEmail(u.email) : '') === target);
      if (found) return found.id;
      if (users.length < 200) break;
    }
  } catch (e) {
    console.error('listUsers fallback error:', e);
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
      return new Response(JSON.stringify({ error: 'Non autorisé' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    // Extract token explicitly — calling getUser() without arg relies on a
    // session in the client storage which doesn't exist server-side.
    const token = authHeader.replace(/^Bearer\s+/i, '').trim();
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError || !user) {
      console.error('Auth error:', userError);
      return new Response(JSON.stringify({ error: 'Non autorisé' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const body = await req.json();
    const { email, full_name, team_member_id, password: providedPassword, sendEmail: shouldSendEmail } = body;

    console.log('[create-team-member-account] Request:', { email, full_name, team_member_id, requestedBy: user.id });

    if (!email || !full_name) {
      return new Response(JSON.stringify({ error: 'Email et nom requis' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(JSON.stringify({ error: 'Format d\'email invalide' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const cleanEmail = normalizeEmail(email);
    const cleanName = full_name.trim();
    const appUrl = req.headers.get('origin') || 'https://aqua-pilote.lovable.app';
    const loginUrl = `${appUrl}/auth`;

    // Verify ownership of the team_member record
    if (team_member_id) {
      const { data: teamMember, error: teamError } = await supabaseAdmin
        .from('team_members')
        .select('owner_id, member_email, user_id, status')
        .eq('id', team_member_id)
        .single();

      if (teamError || !teamMember) {
        console.error('Team member not found:', teamError);
        return new Response(JSON.stringify({ error: 'Membre d\'équipe non trouvé' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      // Already linked → idempotent success
      if (teamMember.user_id) {
        return new Response(JSON.stringify({
          success: true, existingUser: true, alreadyLinked: true,
          user: { id: teamMember.user_id, email: cleanEmail, full_name: cleanName },
          credentials: { email: cleanEmail, password: null, loginUrl },
          message: 'Ce membre est déjà lié à un compte.'
        }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      // Ownership check
      if (teamMember.owner_id !== user.id) {
        const { data: roleData } = await supabaseAdmin
          .from('user_roles').select('role').eq('user_id', user.id).maybeSingle();
        if (!roleData || roleData.role !== 'admin') {
          return new Response(JSON.stringify({ error: 'Vous n\'avez pas les droits pour créer ce compte' }),
            { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }
      }

      if (normalizeEmail(teamMember.member_email) !== cleanEmail) {
        return new Response(JSON.stringify({ error: 'L\'email ne correspond pas au membre d\'équipe' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }
    }

    let password = (typeof providedPassword === 'string' && providedPassword.trim().length >= 8)
      ? providedPassword : generatePassword();

    if (password.length < 8 || !/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/[0-9]/.test(password)) {
      password = generatePassword();
    }

    // Try to create the user directly. If they exist, link them.
    let createdUserId: string | null = null;
    let isExistingUser = false;

    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: cleanEmail,
      password,
      email_confirm: true,
      user_metadata: { full_name: cleanName, team_member_id },
    });

    if (authError) {
      const msg = (authError.message || '').toLowerCase();
      console.log('createUser error:', authError.message);
      if (msg.includes('already') || msg.includes('exists') || msg.includes('registered') || msg.includes('duplicate')) {
        // User exists — find them
        const existingId = await findUserIdByEmail(supabaseAdmin, cleanEmail);
        if (!existingId) {
          console.error('User exists per createUser but not found via lookup');
          return new Response(JSON.stringify({ error: 'Utilisateur existant introuvable. Veuillez réinitialiser le mot de passe.' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }
        createdUserId = existingId;
        isExistingUser = true;
      } else {
        console.error('Unexpected auth error:', authError);
        return new Response(JSON.stringify({ error: authError.message || 'Erreur lors de la création du compte' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }
    } else if (authData?.user) {
      createdUserId = authData.user.id;
    } else {
      return new Response(JSON.stringify({ error: 'Erreur lors de la création de l\'utilisateur' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    console.log('[create-team-member-account] User ready:', { createdUserId, isExistingUser });

    // Link team_member record
    if (team_member_id && createdUserId) {
      const { error: updateError } = await supabaseAdmin
        .from('team_members')
        .update({ user_id: createdUserId, status: 'active', accepted_at: new Date().toISOString() })
        .eq('id', team_member_id);
      if (updateError) {
        console.error('Error linking team_member:', updateError);
      }
    }

    // Upsert profile
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .upsert({
        id: createdUserId, email: cleanEmail, full_name: cleanName,
        updated_at: new Date().toISOString()
      }, { onConflict: 'id' });
    if (profileError) console.error('Profile upsert error:', profileError);

    // If existing user, do not return the password (we don't know their real one)
    if (isExistingUser) {
      return new Response(JSON.stringify({
        success: true, existingUser: true,
        user: { id: createdUserId, email: cleanEmail, full_name: cleanName },
        credentials: { email: cleanEmail, password: null, loginUrl },
        message: 'Utilisateur existant lié. Réinitialisez le mot de passe si besoin.'
      }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Send email if requested
    let emailSent = false;
    let emailError: string | null = null;
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    if (resendApiKey && shouldSendEmail !== false) {
      try {
        const resend = new Resend(resendApiKey);
        await resend.emails.send({
          from: "AquaPilote <onboarding@resend.dev>",
          to: [cleanEmail],
          subject: "Bienvenue sur AquaPilote - Vos identifiants",
          html: `<div style="font-family:Arial;max-width:600px;margin:auto;padding:20px">
            <h2>Bienvenue ${cleanName}!</h2>
            <p>Votre compte AquaPilote a été créé.</p>
            <p><strong>Email:</strong> ${cleanEmail}<br><strong>Mot de passe:</strong> ${password}</p>
            <p><a href="${loginUrl}" style="background:#0ea5e9;color:white;padding:10px 20px;text-decoration:none;border-radius:6px">Se connecter</a></p>
          </div>`,
        });
        emailSent = true;
      } catch (e: any) {
        console.error('Email send error:', e);
        emailError = e.message;
      }
    }

    return new Response(JSON.stringify({
      success: true,
      user: { id: createdUserId, email: cleanEmail, full_name: cleanName },
      credentials: { email: cleanEmail, password, loginUrl },
      emailSent, emailError,
      message: emailSent ? 'Compte créé et email envoyé.' : 'Compte créé.'
    }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  } catch (error: any) {
    console.error('[create-team-member-account] Unexpected error:', error?.message, error?.stack);
    return new Response(JSON.stringify({ error: error?.message || 'Erreur serveur interne' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
