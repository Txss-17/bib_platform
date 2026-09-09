import Header from "@/components/Header";
import Footer from "@/components/Footer";
import {useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useSEO } from "@/hooks/useSEO";


export default function BibTalent() {
  useSEO({
    title: "BIB Talent — Brand-In-A-Box",
    description:
      "Découvrez BIB Talent, le programme Early Team de Brand-in-a-box, et explorez les opportunités de contribuer au développement du projet en Tech, Produit, R&D et Communication",
  });

 return ();
}
