import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface EmailTemplate {
  id: string;
  boutique_id: string;
  type: string;
  subject: string;
  body_html: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const DEFAULT_TEMPLATES: { type: string; label: string; subject: string; body_html: string }[] = [
  {
    type: "welcome",
    label: "Bienvenue",
    subject: "Bienvenue chez {{boutique_name}} ! 🎉",
    body_html: `<h1>Bienvenue chez {{boutique_name}} !</h1>
<p>Merci de votre inscription. Nous sommes ravis de vous compter parmi nos clients.</p>
<p>Découvrez notre sélection de produits et profitez de la livraison incluse sur toutes vos commandes.</p>
<p>À très bientôt,<br/>L'équipe {{boutique_name}}</p>`,
  },
  {
    type: "order_confirmation",
    label: "Confirmation de commande",
    subject: "Commande {{order_number}} confirmée ✅",
    body_html: `<h1>Merci pour votre commande !</h1>
<p>Votre commande <strong>{{order_number}}</strong> a bien été enregistrée.</p>
<p><strong>Récapitulatif :</strong></p>
<ul>
  <li>Produit : {{product_name}}</li>
  <li>Montant : {{amount}} €</li>
</ul>
<p>Vous recevrez un email dès que votre colis sera expédié.</p>
<p>L'équipe {{boutique_name}}</p>`,
  },
  {
    type: "shipping",
    label: "Expédition",
    subject: "Votre commande {{order_number}} est en route ! 🚚",
    body_html: `<h1>Votre colis est en route !</h1>
<p>Bonne nouvelle ! Votre commande <strong>{{order_number}}</strong> vient d'être expédiée.</p>
<p>Vous pouvez suivre votre colis à tout moment depuis notre page de suivi.</p>
<p>Livraison estimée sous 3-5 jours ouvrés.</p>
<p>L'équipe {{boutique_name}}</p>`,
  },
  {
    type: "promo",
    label: "Promotion",
    subject: "Offre spéciale chez {{boutique_name}} ! 🎁",
    body_html: `<h1>Offre exclusive pour vous !</h1>
<p>Profitez de nos dernières promotions sur une sélection de produits.</p>
<p>Ne manquez pas cette occasion — offre valable pour une durée limitée.</p>
<p>L'équipe {{boutique_name}}</p>`,
  },
];

export { DEFAULT_TEMPLATES };

export function useEmailTemplates(boutiqueId: string | undefined) {
  return useQuery({
    queryKey: ["email-templates", boutiqueId],
    queryFn: async () => {
      if (!boutiqueId) return [];
      const { data, error } = await supabase
        .from("email_templates")
        .select("*")
        .eq("boutique_id", boutiqueId)
        .order("type");
      if (error) throw error;
      return data as EmailTemplate[];
    },
    enabled: !!boutiqueId,
  });
}

export function useUpsertEmailTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (template: {
      boutique_id: string;
      type: string;
      subject: string;
      body_html: string;
      is_active?: boolean;
    }) => {
      const { data, error } = await supabase
        .from("email_templates")
        .upsert(
          {
            boutique_id: template.boutique_id,
            type: template.type,
            subject: template.subject,
            body_html: template.body_html,
            is_active: template.is_active ?? true,
          },
          { onConflict: "boutique_id,type" }
        )
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ["email-templates", vars.boutique_id] });
    },
  });
}
