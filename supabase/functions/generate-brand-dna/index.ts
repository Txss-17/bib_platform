import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Configuration, OpenAIApi } from "https://esm.sh/openai@3.2.1";

const configuration = new Configuration({
  apiKey: Deno.env.get("OPENAI_API_KEY"),
});
const openai = new OpenAIApi(configuration);

interface StudioAnswers {
  brandName: string;
  activity: string;
  idealCustomer: string;
  visualTerritory: string;
  personality: string[];
}

serve(async (req) => {
  // Sécurité : On n'accepte que les requêtes POST
  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  try {
    const { answers }: { answers: StudioAnswers } = await req.json();

    // Vérification basique des données d'entrée
    if (!answers.brandName || !answers.activity || !answers.idealCustomer) {
      return new Response(
        JSON.stringify({ error: "Données du studio manquantes." }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Construction du Prompt Système pour forcer le format JSON
    const systemPrompt = `
Tu es un directeur artistique IA expert en branding pour des boutiques e-commerce.
À partir des réponses de l'utilisateur, tu dois générer un "ADN de marque" strictement au format JSON.

Le JSON doit respecter exactement cette structure :
{
  "palette": {
    "primary": "#hex",
    "secondary": "#hex",
    "accent": "#hex",
    "background": "#hex",
    "text": "#hex"
  },
  "typography": {
    "headingFont": "Nom de la police Google Fonts (ex: Playfair Display)",
    "bodyFont": "Nom de la police Google Fonts lisible (ex: Lato)"
  },
  "copy": {
    "tagline": "Une phrase d'accroche courte et percutante",
    "heroTitle": "Le titre principal de la page d'accueil",
    "heroSubtitle": "Le sous-titre expliquant la proposition de valeur",
    "ctaLabel": "Texte du bouton d'action principal (ex: Découvrir la collection)"
  }
}

Règles de design :
- Les couleurs doivent être harmonieuses et correspondre au territoire visuel et à la personnalité.
- Les polices doivent être disponibles sur Google Fonts.
- Le ton du copy doit refléter la personnalité choisie.
- Réponds UNIQUEMENT avec le JSON valide, sans texte avant ou après.
    `;

    const userPrompt = `
Nom de la marque: ${answers.brandName}
Activité: ${answers.activity}
Client idéal: ${answers.idealCustomer}
Territoire visuel: ${answers.visualTerritory}
Personnalité: ${answers.personality.join(", ")}
    `;

    // Appel à OpenAI (GPT-4 ou GPT-3.5-turbo)
    const completion = await openai.createChatCompletion({
      model: "gpt-3.5-turbo", // Remplace par "gpt-4" pour de meilleurs résultats visuels
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.7,
    });

    const aiContent = completion.data.choices[0].message?.content;

    if (!aiContent) {
      throw new Error("Réponse vide de l'IA.");
    }

    // On parse le JSON renvoyé par l'IA pour vérifier sa validité
    const generatedDna = JSON.parse(aiContent);

    return new Response(
      JSON.stringify({ dna: generatedDna }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Erreur Edge Function:", error);
    return new Response(
      JSON.stringify({ error: "Erreur interne du serveur lors de la génération." }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});
