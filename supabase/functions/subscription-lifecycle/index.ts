import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

/**
 * Daily lifecycle:
 *  - Mark trial/active subscriptions past end_date as 'expired'
 *  - Notify affected users (in-app notification)
 */
serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    // Scheduler auth (fixes OPEN_ENDPOINTS: open_sub_lifecycle)
    const expectedToken = Deno.env.get("CRON_SECRET_TOKEN");
    const authHeader = req.headers.get("Authorization") || "";
    const provided = authHeader.replace(/^Bearer\s+/i, "");
    if (!expectedToken || provided !== expectedToken) {
      return new Response(JSON.stringify({ error: "unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Find subscriptions to expire
    const today = new Date().toISOString().slice(0, 10);
    const { data: toExpire, error: findErr } = await admin
      .from("subscriptions")
      .select("id, user_id, plan")
      .in("status", ["trial", "active"])
      .lt("end_date", today);

    if (findErr) throw findErr;

    let expiredCount = 0;
    if (toExpire && toExpire.length > 0) {
      const ids = toExpire.map((s: any) => s.id);
      const { error: updateErr } = await admin
        .from("subscriptions")
        .update({ status: "expired", updated_at: new Date().toISOString() })
        .in("id", ids);
      if (updateErr) throw updateErr;
      expiredCount = toExpire.length;

      // In-app notifications
      const notifs = toExpire.map((s: any) => ({
        user_id: s.user_id,
        title: "⏰ Votre abonnement a expiré",
        message: "Votre essai est terminé. Souscrivez à un plan pour continuer à utiliser AquaPilote. Vos données sont conservées.",
        type: "warning",
        module: "Abonnement",
        is_critical: true,
        metadata: { subscription_id: s.id, plan: s.plan },
      }));
      await admin.from("notifications").insert(notifs);
    }

    return new Response(
      JSON.stringify({ ok: true, expired_count: expiredCount }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e: any) {
    console.error("subscription-lifecycle error", e);
    return new Response(JSON.stringify({ error: e.message || "internal_error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
