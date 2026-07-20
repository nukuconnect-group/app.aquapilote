import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const truncate = (value: unknown, max = 12000) => {
  const text = typeof value === "string" ? value : JSON.stringify(value ?? null);
  return text.length > max ? `${text.slice(0, max)}…` : text;
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const authHeader = req.headers.get("Authorization") || "";
    const payload = await req.json();

    let userId: string | null = null;
    let userName = "Client Web";
    if (authHeader) {
      const authed = createClient(supabaseUrl, anonKey, { global: { headers: { Authorization: authHeader } } });
      const { data } = await authed.auth.getUser();
      userId = data.user?.id ?? null;
      userName = data.user?.email ?? userName;
    }

    const admin = createClient(supabaseUrl, serviceKey);
    const moduleName = payload?.route?.moduleParam || payload?.route?.renderedModule || "navigation";
    const { error } = await admin.from("activity_logs").insert({
      user_id: userId,
      user_name: userName,
      action: payload?.label || payload?.kind || "client_error",
      module: String(moduleName).slice(0, 80),
      details: truncate(payload),
      severity: "error",
    });

    if (error) throw error;
    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("client-error-log error", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "unknown" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});