import { translateUi } from "@/lib/uiTranslation";
import { useLanguage } from "@/contexts/LanguageContext";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { StorefrontHeader } from "@/components/storefront/StorefrontHeader";
import { StorefrontFooter } from "@/components/storefront/StorefrontFooter";
import { CartProvider } from "@/contexts/CartContext";
import { Loader2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ThemeSettings } from "@/lib/boutiqueTemplates";

interface LegalPageProps {
  type: "cgv" | "cgu" | "mentions" | "about";
}

function LegalPageContent({ type }: LegalPageProps) {
  useLanguage();
  const { slug } = useParams<{ slug: string }>();

  const { data: boutique, isLoading } = useQuery({
    queryKey: ["public-boutique-legal", slug],
    queryFn: async () => {
      if (!slug) return null;
      const { data, error } = await supabase
        .from("boutiques")
        .select("*")
        .eq("slug", slug)
        .eq("status", "published")
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!slug,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!boutique) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">
          {translateUi("Page introuvable")}
        </p>
      </div>
    );
  }

  const theme = boutique.theme_settings as unknown as ThemeSettings | null;
  const primaryColor = theme?.primaryColor || "#102036";

  const titles: Record<string, string> = {
    cgv: "Conditions Générales de Vente",
    cgu: "Conditions Générales d'Utilisation",
    mentions: "Mentions légales de la boutique",
    about: "À Propos",
  };

  // DEC-015: merchant-authored theme text must never replace BIB's
  // controlled common CGV/CGU. The boutique remains the seller.
  const content = theme?.customAboutText || boutique.description;
  const sellerName = boutique.legal_business_name?.trim();
  const sellerSiret = boutique.legal_siret?.trim();
  const sellerAddress = boutique.legal_address?.trim();
  const sellerEmail = boutique.legal_email?.trim();
  const sellerPhone = boutique.legal_phone?.trim();
  // For third-party and EI-owned boutiques alike, no fictitious legal owner.
  // Additional evidence verification requires the administrative approval flow.
  const identityComplete = Boolean(sellerName && sellerSiret && sellerAddress && sellerEmail);
  const effectiveTemplateVersion = type === "cgv" ? "JUR-B01 / projet v1.0" :
    type === "cgu" ? "JUR-B02 / projet v1.0" : "JUR-B03 / projet v1.0";
  const legalSection = type !== "about" && (
    <div className="space-y-5 text-sm leading-relaxed">
      <p className="rounded-lg border p-3 text-muted-foreground">Modèle BIB centralisé : {effectiveTemplateVersion} — 4 novembre 2026. La validation juridique, la vérification des informations obligatoires et l'activation commerciale restent préalables à toute vente. Cette page n'atteste pas la signature ni l'acceptation d'une version contractuelle.</p>
      <section className="rounded-lg border p-4 space-y-2">
        <h2 className="font-semibold">Identité du vendeur professionnel de cette boutique</h2>
        <p><strong>Boutique :</strong> {boutique.name}</p>
        <p><strong>Exploitant :</strong> {sellerName || "Identité non renseignée"}</p>
        <p><strong>SIREN/SIRET :</strong> {sellerSiret || "Non renseigné"}</p>
        <p><strong>Adresse professionnelle :</strong> {sellerAddress || "Non renseignée"}</p>
        <p><strong>Contact :</strong> {sellerEmail || "Non renseigné"}</p>
        {sellerPhone && <p><strong>Téléphone :</strong> {sellerPhone}</p>}
        {!identityComplete && <p role="alert" className="font-medium text-destructive">Identité du vendeur incomplète : elle doit être vérifiée avant la publication commerciale de la boutique.</p>}
        <p className="text-xs text-muted-foreground">Une boutique exploitée en propre par l’entreprise individuelle BIB doit afficher l’identité réelle de cette même EI, et non un SIREN distinct fictif.</p>
      </section>
      {type === "cgv" && <>
        <section className="space-y-2"><h2 className="font-semibold">1. Vendeur et contrat de vente</h2><p>La vente de marchandises est conclue entre le client et le vendeur identifié ci-dessus, qu’il s’agisse d’un marchand tiers ou d’une boutique appartenant à l’entreprise individuelle exploitante BIB. BIB fournit ses services de plateforme et de coordination logistique dans le périmètre contractuel applicable. Les CGV de cette boutique sont celles du modèle JUR-B01 enrichi de l’identité réelle du vendeur, non des clauses librement rédigées dans le thème graphique.</p></section>
        <section className="space-y-2"><h2 className="font-semibold">2. Produits et prix</h2><p>La fiche produit et le récapitulatif avant paiement indiquent les caractéristiques essentielles, le prix total réellement applicable, les taxes et frais obligatoires ainsi que la date ou période prévisionnelle de livraison. La personnalisation de marque convenue entre fournisseur et marchand est incluse dans le prix fournisseur prévu ; le client n'a pas à connaître les étapes techniques internes d’approvisionnement.</p></section>
        <section className="space-y-2"><h2 className="font-semibold">3. Commandes et précommandes</h2><p>Une commande doit être confirmée après vérification des conditions et du paiement effectif. Les références préparées à la commande peuvent suivre des fenêtres de précommande regroupées, avec capacité fournisseur confirmée et échéance de livraison annoncée. Le lancement de fabrication doit être tracé séparément du seul paiement.</p></section>
        <section className="space-y-2"><h2 className="font-semibold">4. Livraison et suivi</h2><p>BIB coordonne la livraison avec les partenaires contractuels. Les obligations de livraison et les risques de perte relèvent du droit applicable au contrat de vente, sans diminution des droits légaux du consommateur. Les retards, indisponibilités et non-conformités ouvrent les recours légaux appropriés.</p></section>
        <section className="space-y-2"><h2 className="font-semibold">5. Annulation et rétractation</h2><p>Une annulation commerciale sans frais est prévue avant le feu vert effectif de production lorsque les conditions annoncées le permettent. La production engagée ne supprime pas automatiquement le droit légal de rétractation. En principe, celui-ci s'exerce pendant quatorze jours après réception, sauf exception légale effectivement applicable. Un logo du marchand ou une préparation standard à la commande ne suffisent pas à prouver une personnalisation selon les spécifications du consommateur.</p></section>
        <section className="space-y-2"><h2 className="font-semibold">6. Retours, remboursements et garanties</h2><p>Le vendeur professionnel reste responsable des garanties légales de conformité et des vices cachés. BIB peut coordonner le service après-vente, la logistique des retours et la traçabilité des remboursements ; cela ne transfère pas automatiquement la qualité de vendeur. Un retour est réintégré au stock uniquement après contrôle de son état et de sa traçabilité.</p></section>
        <section className="space-y-2"><h2 className="font-semibold">7. Réclamations et médiation</h2><p>Le client peut contacter le vendeur à l’adresse indiquée. Les coordonnées du médiateur de la consommation compétent doivent être renseignées et vérifiées avant la vente ; aucune désignation n'est supposée sans preuve. Les voies de recours prévues par le droit français restent ouvertes.</p></section>
      </>}
      {type === "cgu" && <>
        <section className="space-y-2"><h2 className="font-semibold">1. Objet et accès</h2><p>Ces conditions définissent l'usage de la vitrine commerciale de {boutique.name}. Les fonctionnalités de compte général, de panier et d'assistance de BIB Platform relèvent également des <Link className="underline" to="/cgu">CGU Acheteurs BIB</Link>. Le contrat de vente demeure régi par les <Link className="underline" to={`/boutique/${slug}/cgv`}>CGV de cette boutique</Link>.</p></section>
        <section className="space-y-2"><h2 className="font-semibold">2. Navigation, comptes et sécurité</h2><p>L'utilisateur fournit des coordonnées exactes et utilise les fonctions effectivement disponibles. Toute fraude, copie illicite ou usage malveillant peut entraîner une restriction proportionnée du service. La disponibilité technique ou commerciale n’est pas garantie sans interruption.</p></section>
        <section className="space-y-2"><h2 className="font-semibold">3. Contenus et droits</h2><p>Les noms, logos, descriptifs et visuels de la boutique sont utilisés sous la responsabilité des titulaires de droits ; les conditions communes BIB ne confèrent aucun droit de reproduction non autorisée.</p></section>
        <section className="space-y-2"><h2 className="font-semibold">4. Données et traceurs</h2><p>Le traitement des données relève des responsabilités effectivement identifiées pour BIB et le vendeur. L'acceptation de ces CGU ne vaut pas consentement aux cookies facultatifs ou au marketing. Consultez la <Link className="underline" to="/confidentialite">politique de confidentialité</Link> et la <Link className="underline" to="/cookies">politique de cookies</Link>.</p></section>
      </>}
      {type === "mentions" && <>
        <section className="space-y-2"><h2 className="font-semibold">Éditeur de la vitrine et opérateur technique</h2><p>La boutique est commercialement exploitée par le vendeur indiqué ci-dessus ; la plateforme technique est BIB. Le nom commercial et le logo de la boutique ne remplacent jamais l'identité juridique du vendeur. L’identification de l'exploitant légal de BIB et celle de l'hébergeur contractuel sont décrites dans les <Link className="underline" to="/mentions-legales">mentions légales de la plateforme</Link>, sous réserve des justificatifs non encore confirmés.</p></section>
        <section className="space-y-2"><h2 className="font-semibold">Responsabilité, droits et informations</h2><p>Les ventes sont conclues avec le vendeur réel ; BIB intervient selon les contrats de plateforme et de logistique. Les notices de <Link className="underline" to="/confidentialite">confidentialité</Link> et de <Link className="underline" to="/cookies">traceurs</Link> demeurent accessibles, sans préjuger de la qualification RGPD de chaque partie.</p></section>
      </>}
      <p className="text-xs text-muted-foreground">Version du modèle présentée : {effectiveTemplateVersion}. La conservation d'une preuve de la version réellement présentée et acceptée par commande reste un prérequis technique distinct de cette page.</p>
    </div>
  );

  return (
    <CartProvider>
      <div className="bg-background min-h-screen">
        <StorefrontHeader
          boutiqueName={boutique.name}
          primaryColor={primaryColor}
          boutiqueSlug={slug}
        />
        <div className="max-w-3xl mx-auto px-4 py-8">
          <Link to={`/boutique/${slug}`}>
            <Button variant="ghost" size="sm" className="mb-4 gap-2">
              <ArrowLeft className="w-4 h-4" /> {translateUi("Retour")}
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-foreground mb-6">
            {titles[type]}
          </h1>
          {type === "about" ? (
            content ? <div className="prose prose-gray max-w-none whitespace-pre-wrap text-foreground/80">{content}</div> :
            <p className="text-muted-foreground">{translateUi("Cette page n'a pas encore été renseignée par le propriétaire de la boutique.")}</p>
          ) : legalSection}

        </div>
        <StorefrontFooter primaryColor={primaryColor} />
      </div>
    </CartProvider>
  );
}

export function BoutiqueCGVPage() {
  useLanguage();
  return <LegalPageContent type="cgv" />;
}
export function BoutiqueCGUPage() {
  useLanguage();
  return <LegalPageContent type="cgu" />;
}
export function BoutiqueMentionsPage() {
  useLanguage();
  return <LegalPageContent type="mentions" />;
}
export function BoutiqueAboutPage() {
  useLanguage();
  return <LegalPageContent type="about" />;
}
