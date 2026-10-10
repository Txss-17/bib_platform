import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
const DEFAULT_TEMPLATES = [
  {
    type: "welcome",
    label: "Bienvenue",
    subject: "Bienvenue chez {{boutique_name}} ! \u{1F389}",
    body_html: `<h1>Bienvenue chez {{boutique_name}} !</h1>
<p>Merci de votre inscription. Nous sommes ravis de vous compter parmi nos clients.</p>
<p>D\xE9couvrez notre s\xE9lection de produits et profitez de la livraison incluse sur toutes vos commandes.</p>
<p>\xC0 tr\xE8s bient\xF4t,<br/>L'\xE9quipe {{boutique_name}}</p>`
  },
  {
    type: "order_confirmation",
    label: "Confirmation de commande",
    subject: "Commande {{order_number}} confirm\xE9e \u2705",
    body_html: `<h1>Merci pour votre commande !</h1>
<p>Votre commande <strong>{{order_number}}</strong> a bien \xE9t\xE9 enregistr\xE9e.</p>
<p><strong>R\xE9capitulatif :</strong></p>
<ul>
  <li>Produit : {{product_name}}</li>
  <li>Montant : {{amount}} \u20AC</li>
</ul>
<p>Vous recevrez un email d\xE8s que votre colis sera exp\xE9di\xE9.</p>
<p>L'\xE9quipe {{boutique_name}}</p>`
  },
  {
    type: "shipping",
    label: "Exp\xE9dition",
    subject: "Votre commande {{order_number}} est en route ! \u{1F69A}",
    body_html: `<h1>Votre colis est en route !</h1>
<p>Bonne nouvelle ! Votre commande <strong>{{order_number}}</strong> vient d'\xEAtre exp\xE9di\xE9e.</p>
<p>Vous pouvez suivre votre colis \xE0 tout moment depuis notre page de suivi.</p>
<p>Livraison estim\xE9e sous 3-5 jours ouvr\xE9s.</p>
<p>L'\xE9quipe {{boutique_name}}</p>`
  },
  {
    type: "promo",
    label: "Promotion",
    subject: "Offre sp\xE9ciale chez {{boutique_name}} ! \u{1F381}",
    body_html: `<h1>Offre exclusive pour vous !</h1>
<p>Profitez de nos derni\xE8res promotions sur une s\xE9lection de produits.</p>
<p>Ne manquez pas cette occasion \u2014 offre valable pour une dur\xE9e limit\xE9e.</p>
<p>L'\xE9quipe {{boutique_name}}</p>`
  }
];
function useEmailTemplates(boutiqueId) {
  return useQuery({
    queryKey: ["email-templates", boutiqueId],
    queryFn: async () => {
      if (!boutiqueId) return [];
      const { data, error } = await supabase.from("email_templates").select("*").eq("boutique_id", boutiqueId).order("type");
      if (error) throw error;
      return data;
    },
    enabled: !!boutiqueId
  });
}
function useUpsertEmailTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (template) => {
      const { data, error } = await supabase.from("email_templates").upsert(
        {
          boutique_id: template.boutique_id,
          type: template.type,
          subject: template.subject,
          body_html: template.body_html,
          is_active: template.is_active ?? true
        },
        { onConflict: "boutique_id,type" }
      ).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ["email-templates", vars.boutique_id] });
    }
  });
}
export {
  DEFAULT_TEMPLATES,
  useEmailTemplates,
  useUpsertEmailTemplate
};
