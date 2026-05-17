import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useSEO } from "@/hooks/useSEO";
import { ReactNode } from "react";

function LegalShell({ title, eyebrow, updated, children }: { title: string; eyebrow: string; updated: string; children: ReactNode }) {
  return (
    <div className="min-h-screen bg-bib-ivory">
      <Header />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28 max-w-3xl">
        <span className="inline-block px-3 py-1 rounded-full bg-bib-marine/5 text-bib-marine text-[11px] font-semibold uppercase tracking-[0.18em] mb-5">
          {eyebrow}
        </span>
        <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-bib-marine leading-tight">{title}</h1>
        <p className="mt-3 text-sm text-muted-foreground">Dernière mise à jour : {updated}</p>
        <article className="mt-10 prose prose-slate max-w-none prose-headings:font-display prose-headings:text-bib-marine prose-a:text-bib-gold prose-strong:text-bib-marine">
          {children}
        </article>
      </main>
      <Footer />
    </div>
  );
}

export function MentionsLegales() {
  useSEO({ title: "Mentions légales — Brand-In-A-Box", description: "Mentions légales de la plateforme Brand-In-A-Box." });
  return (
    <LegalShell eyebrow="Légal" title="Mentions légales" updated="17 mai 2026">
      <h2>Éditeur du site</h2>
      <p>
        Le site <strong>brand-in-a-box.space</strong> est édité par <strong>Brand-In-A-Box SAS</strong>,
        société par actions simplifiée au capital social de 10 000 €, dont le siège social est situé en France.
      </p>
      <p>Email de contact : <a href="mailto:contact@brand-in-a-box.space">contact@brand-in-a-box.space</a></p>
      <h2>Directeur de la publication</h2>
      <p>Le directeur de la publication est le représentant légal de Brand-In-A-Box SAS.</p>
      <h2>Hébergement</h2>
      <p>Le site est hébergé par <strong>Vercel Inc.</strong>, 340 S Lemon Ave #4133, Walnut, CA 91789, États-Unis.</p>
      <h2>Propriété intellectuelle</h2>
      <p>L'ensemble des contenus (textes, images, logos, marques) est protégé par le droit d'auteur. Toute reproduction est interdite sans autorisation préalable.</p>
      <h2>Signalement</h2>
      <p>Pour toute question juridique ou demande de retrait : <a href="mailto:legal@brand-in-a-box.space">legal@brand-in-a-box.space</a>.</p>
    </LegalShell>
  );
}

export function CGU() {
  useSEO({ title: "Conditions Générales d'Utilisation — Brand-In-A-Box", description: "CGU de la plateforme Brand-In-A-Box." });
  return (
    <LegalShell eyebrow="Légal" title="Conditions Générales d'Utilisation" updated="17 mai 2026">
      <h2>1. Objet</h2>
      <p>Les présentes CGU régissent l'accès et l'utilisation de la plateforme Brand-In-A-Box (ci-après « la Plateforme »), qui permet aux entrepreneurs de créer et opérer une boutique e-commerce premium.</p>
      <h2>2. Création de compte</h2>
      <p>L'accès à la Plateforme nécessite la création d'un compte. L'utilisateur doit être majeur (18 ans révolus) et fournir des informations exactes.</p>
      <h2>3. Services fournis</h2>
      <p>La Plateforme fournit : builder de boutique, accès au catalogue fournisseurs pré-validé, gestion logistique, encaissement, support 24/7.</p>
      <h2>4. Engagements du vendeur</h2>
      <ul>
        <li>Respecter la législation en vigueur sur la vente à distance.</li>
        <li>Gérer la relation client (escalade plateforme sous 48 h en cas de litige).</li>
        <li>Valider un échantillon Stripe avant activation de chaque produit.</li>
      </ul>
      <h2>5. Tarification</h2>
      <p>Les plans Starter, Pro et Scale sont décrits sur la page <a href="/tarifs">Tarifs</a>. La commission s'applique sur chaque vente.</p>
      <h2>6. Résiliation</h2>
      <p>Chaque utilisateur peut résilier son abonnement à tout moment. La suppression du compte est conditionnée à un stock vide et l'absence de commandes ouvertes.</p>
      <h2>7. Responsabilité</h2>
      <p>Brand-In-A-Box agit en tant qu'opérateur logistique et technique. Le vendeur reste responsable du contenu commercial de sa boutique.</p>
      <h2>8. Droit applicable</h2>
      <p>Les présentes CGU sont régies par le droit français. Tout litige relève des tribunaux compétents de Paris.</p>
    </LegalShell>
  );
}

export function Confidentialite() {
  useSEO({ title: "Politique de confidentialité — Brand-In-A-Box", description: "Comment Brand-In-A-Box traite vos données personnelles." });
  return (
    <LegalShell eyebrow="Légal" title="Politique de confidentialité" updated="17 mai 2026">
      <h2>1. Responsable de traitement</h2>
      <p>Brand-In-A-Box SAS est responsable du traitement des données collectées sur la Plateforme, conformément au RGPD.</p>
      <h2>2. Données collectées</h2>
      <ul>
        <li><strong>Compte :</strong> nom, email, mot de passe chiffré, plan d'abonnement.</li>
        <li><strong>Boutique :</strong> informations légales, logo, paramètres de personnalisation.</li>
        <li><strong>Transactions :</strong> historique de commandes, KYC pour les vendeurs.</li>
        <li><strong>Analytics :</strong> mesures d'audience anonymisées sur les boutiques.</li>
      </ul>
      <h2>3. Finalités</h2>
      <p>Fournir le service, sécuriser les transactions, respecter les obligations légales, améliorer la Plateforme.</p>
      <h2>4. Durée de conservation</h2>
      <p>Données de compte : 3 ans après dernière activité. Données comptables : 10 ans (obligation légale).</p>
      <h2>5. Vos droits</h2>
      <p>Accès, rectification, suppression, portabilité, opposition. Exercez vos droits via <a href="mailto:privacy@brand-in-a-box.space">privacy@brand-in-a-box.space</a>.</p>
      <h2>6. Sous-traitants</h2>
      <p>Supabase (hébergement données), Stripe (paiements), Vercel (hébergement front), Resend (emails transactionnels).</p>
      <h2>7. Sécurité</h2>
      <p>Chiffrement TLS 1.3, RLS Postgres, audits réguliers, sauvegardes chiffrées.</p>
    </LegalShell>
  );
}

export function Cookies() {
  useSEO({ title: "Politique cookies — Brand-In-A-Box", description: "Politique d'utilisation des cookies sur Brand-In-A-Box." });
  return (
    <LegalShell eyebrow="Légal" title="Politique cookies" updated="17 mai 2026">
      <h2>Qu'est-ce qu'un cookie ?</h2>
      <p>Un cookie est un petit fichier déposé sur votre appareil lors de votre visite. Il permet de mémoriser vos préférences ou mesurer l'audience.</p>
      <h2>Cookies utilisés</h2>
      <ul>
        <li><strong>Essentiels :</strong> session d'authentification, panier — exemptés de consentement.</li>
        <li><strong>Préférences :</strong> langue (FR/EN), thème (clair/sombre).</li>
        <li><strong>Mesure d'audience :</strong> statistiques anonymisées sur l'utilisation de la Plateforme.</li>
      </ul>
      <h2>Gestion</h2>
      <p>Vous pouvez à tout moment supprimer ou bloquer les cookies depuis les paramètres de votre navigateur.</p>
    </LegalShell>
  );
}