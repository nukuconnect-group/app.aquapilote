import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const FROM_EMAIL = "AquaPilote <noreply@aquapilote.com>";
const APP_URL = "https://app.aquapilote.com";

type EmailKind =
  | "new_signup_admin"
  | "account_activated"
  | "team_member_invited"
  | "critical_alert"
  | "generic";

interface Payload {
  kind: EmailKind;
  to?: string;
  user_id?: string;
  title?: string;
  message?: string;
  metadata?: Record<string, any>;
}

function escapeHtml(str: string): string {
  return String(str ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function baseTemplate(title: string, bodyHtml: string, ctaLabel?: string, ctaUrl?: string): string {
  const cta = ctaLabel && ctaUrl
    ? `<div style="text-align:center;margin:28px 0"><a href="${ctaUrl}" style="background:#0ea5e9;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:600;display:inline-block">${escapeHtml(ctaLabel)}</a></div>`
    : "";
  return `<!DOCTYPE html><html><body style="margin:0;padding:0;background:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif">
    <div style="max-width:600px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.05)">
      <div style="background:linear-gradient(135deg,#0f172a 0%,#0369a1 100%);padding:32px 24px;text-align:center">
        <h1 style="color:#fff;margin:0;font-size:22px;font-weight:700">🐟 AquaPilote</h1>
      </div>
      <div style="padding:32px 28px;color:#0f172a">
        <h2 style="margin:0 0 16px;font-size:20px;color:#0f172a">${escapeHtml(title)}</h2>
        <div style="color:#334155;line-height:1.6;font-size:15px">${bodyHtml}</div>
        ${cta}
      </div>
      <div style="background:#f8fafc;padding:16px 24px;text-align:center;color:#64748b;font-size:12px;border-top:1px solid #e2e8f0">
        AquaPilote · Plateforme de gestion aquacole intelligente<br/>
        <a href="${APP_URL}" style="color:#0ea5e9;text-decoration:none">${APP_URL}</a>
      </div>
    </div></body></html>`;
}

async function sendResend(to: string, subject: string, html: string): Promise<Response> {
  const key = Deno.env.get("RESEND_API_KEY");
  if (!key) throw new Error("RESEND_API_KEY not configured");
  const r = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from: FROM_EMAIL, to: [to], subject, html }),
  });
  if (!r.ok) {
    const body = await r.text();
    console.error("Resend error", r.status, body);
    throw new Error(`Resend failed: ${r.status} ${body}`);
  }
  return r;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const payload = (await req.json()) as Payload;
    if (!payload?.kind) {
      return new Response(JSON.stringify({ error: "kind required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Resolve recipient(s) if not provided
    let recipients: string[] = payload.to ? [payload.to] : [];
    if (!recipients.length && payload.user_id) {
      const { data: prof } = await admin
        .from("profiles")
        .select("email")
        .eq("id", payload.user_id)
        .maybeSingle();
      if (prof?.email) recipients = [prof.email];
    }

    let subject = payload.title || "Notification AquaPilote";
    let html = "";
    let cta: { label: string; url: string } | undefined;

    switch (payload.kind) {
      case "new_signup_admin": {
        // Send to all admins
        const { data: admins } = await admin
          .from("user_roles")
          .select("user_id")
          .eq("role", "admin");
        const ids = (admins || []).map((a: any) => a.user_id);
        if (ids.length) {
          const { data: profs } = await admin
            .from("profiles")
            .select("email")
            .in("id", ids);
          recipients = (profs || []).map((p: any) => p.email).filter(Boolean);
        }
        const meta = payload.metadata || {};
        subject = "🆕 Nouveau compte en attente d'activation";
        html = `<p>Un nouvel utilisateur vient de créer un compte sur AquaPilote et attend votre activation.</p>
          <table style="width:100%;border-collapse:collapse;margin-top:12px">
            <tr><td style="padding:8px;background:#f8fafc;border-radius:6px 0 0 6px"><strong>Nom</strong></td><td style="padding:8px;background:#f8fafc;border-radius:0 6px 6px 0">${escapeHtml(meta.full_name || "—")}</td></tr>
            <tr><td style="padding:8px"><strong>Email</strong></td><td style="padding:8px">${escapeHtml(meta.email || "—")}</td></tr>
            <tr><td style="padding:8px;background:#f8fafc;border-radius:6px 0 0 6px"><strong>Type d'exploitation</strong></td><td style="padding:8px;background:#f8fafc;border-radius:0 6px 6px 0">${escapeHtml(meta.exploitation_type || "—")}</td></tr>
          </table>`;
        cta = { label: "Activer le compte", url: `${APP_URL}/dashboard` };
        break;
      }
      case "account_activated": {
        subject = "✅ Votre compte AquaPilote est activé";
        html = `<p>Bonne nouvelle ! Votre compte AquaPilote vient d'être activé par un administrateur.</p>
          <p>Vous pouvez maintenant vous connecter et accéder à toutes les fonctionnalités de la plateforme.</p>`;
        cta = { label: "Se connecter", url: `${APP_URL}` };
        break;
      }
      case "team_member_invited": {
        const meta = payload.metadata || {};
        subject = "👥 Vous avez été ajouté(e) à une équipe AquaPilote";
        html = `<p>Bonjour ${escapeHtml(meta.full_name || "")},</p>
          <p>Vous avez été ajouté(e) à l'équipe <strong>${escapeHtml(meta.owner_name || "AquaPilote")}</strong> avec le rôle <strong>${escapeHtml(meta.role || "membre")}</strong>.</p>
          <p>Voici vos identifiants de connexion :</p>
          <table style="width:100%;border-collapse:collapse;margin-top:8px">
            <tr><td style="padding:10px;background:#f8fafc"><strong>Email</strong></td><td style="padding:10px;background:#f8fafc"><code>${escapeHtml(meta.email || "")}</code></td></tr>
            <tr><td style="padding:10px"><strong>Mot de passe temporaire</strong></td><td style="padding:10px"><code>${escapeHtml(meta.password || "")}</code></td></tr>
          </table>
          <p style="margin-top:14px;color:#b45309;font-size:13px">⚠️ Modifiez votre mot de passe après la première connexion.</p>`;
        cta = { label: "Accéder à mon espace", url: `${APP_URL}` };
        break;
      }
      case "critical_alert": {
        subject = `🚨 ${payload.title || "Alerte critique"}`;
        html = `<p style="padding:12px;background:#fef2f2;border-left:4px solid #dc2626;border-radius:6px;color:#991b1b">${escapeHtml(payload.message || "")}</p>`;
        cta = { label: "Voir dans AquaPilote", url: `${APP_URL}/dashboard` };
        break;
      }
      case "generic":
      default: {
        subject = payload.title || subject;
        html = `<p>${escapeHtml(payload.message || "")}</p>`;
        cta = { label: "Ouvrir AquaPilote", url: `${APP_URL}` };
      }
    }

    if (!recipients.length) {
      return new Response(JSON.stringify({ skipped: true, reason: "no_recipient" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const finalHtml = baseTemplate(subject.replace(/^[^\w]+\s?/, ""), html, cta?.label, cta?.url);
    const results = await Promise.allSettled(recipients.map((r) => sendResend(r, subject, finalHtml)));
    const failed = results.filter((r) => r.status === "rejected").length;

    return new Response(
      JSON.stringify({ sent: recipients.length - failed, failed, recipients: recipients.length }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e: any) {
    console.error("send-notification-email error", e);
    return new Response(JSON.stringify({ error: e.message || "internal_error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});