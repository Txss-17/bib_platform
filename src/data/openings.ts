import { translateUi } from "@/lib/uiTranslation";
export interface Opening {
  title: string;
  team: string;
  location: string;
  type: string;
  summary: string;
}

export const openings: Opening[] = [
  {
    get title() {
      return translateUi("Développement & architecture");
    },
    team: "Tech",
    location: "À distance",
    type: "Contribution",
    summary:
      "Contribuer à la conception de la plateforme BIB, de ses interfaces, de ses services et de ses fondations techniques.",
  },
  {
    get title() {
      return translateUi("Produit & expérimentation");
    },
    team: "R&D / Product",
    location: "À distance",
    type: "Contribution",
    summary:
      "Explorer les usages, challenger les concepts, prototyper des solutions et contribuer à l'évolution des produits et services BIB.",
  },
  {
    get title() {
      return translateUi("Identité & communication");
    },
    team: "Communication",
    location: "À distance",
    type: "Contribution",
    summary:
      "Participer à la construction de l'identité BIB, de ses contenus, de son storytelling et de sa présence digitale.",
  },
  {
    get title() {
      return translateUi("Opérations & structuration");
    },
    team: "Opérations",
    location: "À distance",
    type: "Contribution",
    summary:
      "Contribuer à la définition des processus, à la structuration opérationnelle, à la qualité et à la coordination des différents acteurs.",
  },
  {
    get title() {
      return translateUi("Qualité, audit & conformité");
    },
    team: "Opérations",
    location: "À distance",
    type: "Contribution",
    summary:
      "Participer à la réflexion sur les méthodes de qualification, de contrôle, d'audit et de conformité nécessaires au fonctionnement de BIB.",
  },
];

export const MAX_OPENINGS_PREVIEW = 5;
