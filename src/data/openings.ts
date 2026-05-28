export interface Opening {
  title: string;
  team: string;
  location: string;
  type: string;
  summary: string;
}

export const openings: Opening[] = [
  {
    title: "Senior Product Designer",
    team: "Design",
    location: "Paris / Remote EU",
    type: "CDI",
    summary: "Façonner l'expérience du builder boutique et du dashboard live.",
  },
  {
    title: "Full-Stack Engineer (React / Supabase)",
    team: "Plateforme",
    location: "Remote EU",
    type: "CDI",
    summary: "Construire les fondations du Commerce OS, du storefront aux APIs paiement.",
  },
  {
    title: "Supplier Operations Lead",
    team: "Opérations",
    location: "Lyon / Hybride",
    type: "CDI",
    summary: "Sourcer, qualifier et accompagner les fournisseurs du catalogue pré-validé.",
  },
  {
    title: "Brand & Content Lead",
    team: "Marketing",
    location: "Paris / Remote EU",
    type: "CDI",
    summary: "Porter la voix éditoriale BIB et faire grandir la communauté de fondateurs.",
  },
  {
    title: "Customer Success — FR/EN",
    team: "Support",
    location: "Remote",
    type: "CDI",
    summary: "Accompagner les vendeurs sur le terrain, du lancement à leur première traction.",
  },
];

export const MAX_OPENINGS_PREVIEW = 5;