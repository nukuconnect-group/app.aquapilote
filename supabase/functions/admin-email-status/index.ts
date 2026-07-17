import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Verify caller is admin
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const authed = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData, error: userErr } = await authed.auth.getUser();
    if (userErr || !userData?.user) {
      return new Response(JSON.stringify({ error: "unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const admin = createClient(supabaseUrl, serviceKey);
    const { data: roleRow } = await admin
      .from("user_roles")
      .select("role")
      .eq("user_id", userData.user.id)
      .eq("role", "admin")
      .maybeSingle();
    if (!roleRow) {
      return new Response(JSON.stringify({ error: "forbidden" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Aggregate: list all auth users with confirmation status
    const perPage = 1000;
    let page = 1;
    type Row = {
      id: string;
      email: string | null;
      created_at: string;
      email_confirmed_at: string | null;
      last_sign_in_at: string | null;
      confirmation_sent_at: string | null;
      full_name?: string | null;
      is_activated?: boolean | null;
    };
    const users: Row[] = [];
    // adminApi.listUsers is paginated
    // deno-lint-ignore no-explicit-any
    let more = true;
    while (more) {
      const { data, error } = await admin.auth.admin.listUsers({ page, perPage });
      if (error) throw error;
      const list = data?.users ?? [];
      for (const u of list) {
        users.push({
          id: u.id,
          email: u.email ?? null,
          created_at: u.created_at,
          email_confirmed_at: (u as any).email_confirmed_at ?? (u as any).confirmed_at ?? null,
          last_sign_in_at: u.last_sign_in_at ?? null,
          confirmation_sent_at: (u as any).confirmation_sent_at ?? null,
        });
      }
      more = list.length === perPage;
      page += 1;
      if (page > 20) break; // safety
    }

    // Enrich with profile info
    if (users.length > 0) {
      const { data: profiles } = await admin
        .from("profiles")
        .select("id, full_name, is_activated")
        .in("id", users.map((u) => u.id));
      const pmap = new Map((profiles ?? []).map((p: any) => [p.id, p]));
      for (const u of users) {
        const p = pmap.get(u.id);
        u.full_name = p?.full_name ?? null;
        u.is_activated = p?.is_activated ?? null;
      }
    }

    const confirmed = users.filter((u) => !!u.email_confirmed_at);
    const pending = users.filter((u) => !u.email_confirmed_at);
    const neverSignedIn = users.filter((u) => !!u.email_confirmed_at && !u.last_sign_in_at);

    // Basic email config check
    const hasResend = !!Deno.env.get("RESEND_API_KEY");
    const hasLovableAI = !!Deno.env.get("LOVABLE_API_KEY");

    return new Response(
      JSON.stringify({
        total: users.length,
        confirmed_count: confirmed.length,
        pending_count: pending.length,
        never_signed_in_count: neverSignedIn.length,
        users,
        config: {
          resend_configured: hasResend,
          lovable_ai_configured: hasLovableAI,
          supabase_url: supabaseUrl,
        },
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    console.error("admin-email-status error", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "unknown" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
