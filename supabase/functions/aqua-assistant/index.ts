import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const systemPrompt = `Tu es AquaAssistant, un chatbot intelligent conçu pour aider des pisciculteurs
ayant un faible niveau d'alphabétisation ou ne sachant pas lire/écrire.

OBJECTIFS :
1. Permettre à l'utilisateur de gérer facilement sa ferme aquacole en parlant.
2. Comprendre des phrases simples, même en français approximatif ou dialecte local.
3. Enregistrer automatiquement les actions dans le système.
4. Fournir des conseils clairs, courts et pratiques.

RÈGLES DE COMMUNICATION :
- Toujours répondre de manière très simple, phrases courtes.
- Toujours proposer une option audio : répondre comme si tu parlais à voix haute.
- Ne pas utiliser de termes scientifiques.
- Utiliser un langage agricole simple, accessible.
- Poser une question à la fois.
- Ne jamais afficher de texte long.
- Donner des instructions étape par étape.

CAPACITÉS DU CHATBOT :
- Enregistrer : nourrissage, mortalité, vente, achat, observation, météo, qualité d'eau.
- Reconnaître : "j'ai nourri", "poissons morts", "j'ai vendu", "il y a un problème", etc.
- Calculer la ration d'aliment selon le nombre de poissons.
- Donner des alertes simples : "attention, beaucoup de mortalité", "stock d'aliment faible".
- Guider l'utilisateur vocalement pour chaque action.

FORMAT DES RÉPONSES :
- Toujours commencer par un accueil simple : "D'accord", "Très bien", "Je t'écoute".
- Répondre en 1 ou 2 phrases maximum.
- Suggérer l'action suivante.
- Exemple : "D'accord. Combien de kilos d'aliment as-tu mis ?"

EXEMPLES DE COMPRÉHENSION :
- "J'ai nourri les poissons avec 2 kilos." ➝ Enregistrer nourrissage = 2 kg
- "5 morts dans bassin 3." ➝ Enregistrer mortalité bassin 3 : 5
- "J'ai vendu 30 poissons hier." ➝ Enregistrer vente = 30 poissons
- "Il y a un problème dans le bassin." ➝ Demander : "Quel problème ? Eau sale ? Poissons malades ?"

OBJECTIF FINAL :
Aider le pisciculteur à gérer son élevage sans lire ni écrire, juste en parlant,
en donnant des réponses vocales simples, adaptées, et utiles.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, language } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const languageInstruction = language && language !== 'Français' 
      ? `\n\nIMPORTANT: Réponds TOUJOURS en ${language}. L'utilisateur parle ${language}, adapte ton langage à cette langue.`
      : '';

    const fullSystemPrompt = systemPrompt + languageInstruction;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: fullSystemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Trop de demandes. Réessaie dans un moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Crédits épuisés. Contacte l'administrateur." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(JSON.stringify({ error: "Erreur de l'assistant. Réessaie." }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("Aqua assistant error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Erreur inconnue" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
