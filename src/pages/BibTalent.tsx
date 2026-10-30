import { ArrowRight, ArrowUpRight, Compass, Lightbulb, PlayCircle, Sparkles, Users, Workflow, Shapes, Store, ShoppingBag, Truck, Package } from "lucide-react";
import { useSEO } from "@/hooks/useSEO";
import { useLanguage } from "@/contexts/LanguageContext";
import bibProjectFilm from "@/assets/bib-project-talent.mp4";
import platformDashboard from "@/assets/landing-dashboard.jpg";
import clientExperience from "@/assets/landing-unboxing.jpg";
import partnerEcosystem from "@/assets/landing-partener.jpg";

const FORM_URL = "https://docs.google.com/forms/d/e/1FAIpQLSemotUUORqFwUdM60S1BAW-79YzSm-5TiocRvm-wuTUiCevvg/viewform";
const GOLD = "#b88949";

const contributions=[
 {icon:Lightbulb,name:"Idées & innovation",desc:"Explorer des concepts, repenser les usages et proposer de nouvelles pistes."},
 {icon:Shapes,name:"Produit & expérience",desc:"Imaginer des parcours, tester des prototypes et améliorer les solutions BIB."},
 {icon:Users,name:"Communauté & communication",desc:"Faire connaître les idées et participer à l'identité du projet."},
 {icon:Workflow,name:"Opérations & écosystème",desc:"Réfléchir aux interactions entre marchands, fournisseurs et partenaires."},
];

function Join({secondary=false}:{secondary?:boolean}) {
 return <a href={FORM_URL} target="_blank" rel="noopener noreferrer" className={"inline-flex w-fit items-center justify-center gap-3 rounded-full px-7 py-4 text-sm font-bold shadow-sm transition hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 "+(secondary?"bg-[#18334e] text-white hover:bg-[#274764]":"bg-[#c2965b] text-[#142e47] hover:bg-[#d2a76c]")}>Rejoindre BIB Talent <ArrowUpRight size={18}/></a>;
}

export default function BibTalent(){
 useLanguage(); // Shared language state; the BIB Talent pilot's public editorial is French-first.
 useSEO({title:"BIB Talent — Contribuer à construire Brand-in-a-Box",description:"Découvrez Brand-in-a-Box (BIB), un écosystème en construction qui connecte marchands, clients, fournisseurs et partenaires logistiques. Explorez le projet et BIB Talent."});
 return <div className="min-h-screen bg-[#fbfcfd] font-sans text-[#18334e]" style={{colorScheme:"light"}}>
   <header className="sticky top-0 z-30 border-b border-[#e3eaf0] bg-white/95 backdrop-blur">
     <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-8" aria-label="Navigation BIB Talent">
       <a href="/carrieres/talent" className="text-xl font-black tracking-tight text-[#18334e]">BIB <span className="font-medium text-[#b88949]">TALENT</span></a>
       <div className="flex items-center gap-5">
         <a href="#projet-bib" className="hidden text-sm font-semibold text-[#43566a] hover:text-[#b88949] sm:inline">Le projet BIB</a>
         <a href="#decouvrir" className="hidden text-sm font-semibold text-[#43566a] hover:text-[#b88949] lg:inline">Voir le film</a>
         <a href={FORM_URL} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-full bg-[#18334e] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#2d4e6a]">Participer <ArrowUpRight size={15}/></a>
       </div>
     </nav>
   </header>
   <main>
     <section className="relative overflow-hidden bg-[#f3f8fc]">
       <div className="pointer-events-none absolute right-[-170px] top-[-140px] h-[530px] w-[530px] rounded-full bg-[#e4ecf5]" aria-hidden="true"/>
       <div className="pointer-events-none absolute bottom-[-160px] left-[-180px] h-[420px] w-[420px] rounded-full bg-[#f8ecdb]" aria-hidden="true"/>
       <div className="relative mx-auto grid max-w-7xl gap-12 px-5 py-20 sm:px-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:py-28">
         <div>
           <span className="inline-flex items-center gap-2 rounded-full border border-[#e4d0ad] bg-white px-4 py-2 text-xs font-extrabold uppercase tracking-[0.19em] text-[#916a37]"><Sparkles size={15}/> Programme BIB Talent</span>
           <h1 className="mt-7 max-w-3xl text-5xl font-extrabold leading-[1.06] tracking-tight text-[#18334e] sm:text-6xl xl:text-7xl">Derrière BIB Talent, <span className="text-[#b88949]">un projet à construire.</span></h1>
           <p className="mt-7 max-w-2xl text-lg leading-8 text-[#4b6072]"><strong className="font-semibold text-[#18334e]">Brand-in-a-Box (BIB)</strong> développe un écosystème de commerce qui met en relation <strong>marchands, clients, fournisseurs et partenaires logistiques</strong>. L'ambition : simplifier les expériences de vente, d'achat et de coordination au sein d'une même plateforme.</p>
           <p className="mt-4 max-w-2xl text-base leading-7 text-[#53697c]">BIB Talent, c'est la porte d'entrée pour participer à la réflexion, aux tests et à la création de cet écosystème.</p>
           <div className="mt-9 flex flex-wrap items-center gap-5"><a href="#projet-bib" className="inline-flex w-fit items-center justify-center gap-3 rounded-full bg-[#18334e] px-7 py-4 text-sm font-bold text-white transition hover:bg-[#274764]">Comprendre BIB <ArrowRight size={18}/></a><a href="#decouvrir" className="inline-flex items-center gap-2 font-semibold text-[#18334e] hover:text-[#ac7c3c]"><PlayCircle size={20}/> Voir le film du projet</a></div>
         </div>
         <div className="relative">
           <div aria-hidden="true" className="absolute -inset-5 rotate-3 rounded-[2.5rem] bg-[#e4eff7]"/>
           <div className="relative rounded-[2rem] border border-[#e4eaf0] bg-white p-6 shadow-[0_24px_70px_-34px_rgba(24,51,78,0.28)] sm:p-9">
             <div className="flex items-center justify-between border-b border-[#e8edf1] pb-6"><span className="text-sm font-extrabold tracking-[0.16em]">BRAND-IN-A-BOX</span><Compass size={27} color={GOLD}/></div>
             <div className="py-8"><span className="text-xs font-bold uppercase tracking-widest text-[#a47b47]">La vision du projet</span><p className="mt-3 text-3xl font-extrabold leading-tight sm:text-4xl">Un écosystème.<br/><span className="text-[#b88949]">Quatre acteurs.</span><br/>Des expériences reliées.</p></div>
             <div className="grid grid-cols-2 gap-3 border-t border-[#e8edf1] pt-6">{["Marchands","Clients","Fournisseurs","Logistique"].map((x,i)=><div key={x} className="rounded-xl bg-[#f4f8fb] p-3 text-center text-xs font-bold text-[#3f576a]"><span className="mr-2 text-[#b88949]">0{i+1}</span>{x}</div>)}</div>
           </div>
         </div>
       </div>
     </section>
     <section id="projet-bib" className="mx-auto max-w-7xl scroll-mt-24 px-5 py-20 sm:px-8 lg:py-28">
       <div className="max-w-4xl"><span className="text-xs font-extrabold uppercase tracking-[0.22em] text-[#a47b47]">Le projet derrière BIB Talent</span><h2 className="mt-4 text-4xl font-extrabold tracking-tight sm:text-5xl">BIB, c'est quoi concrètement ?</h2><p className="mt-6 text-lg leading-8 text-[#526778]">BIB (Brand-in-a-Box) est une plateforme en cours de développement. Son principe est simple : connecter les activités de vente, d'achat, d'approvisionnement et de livraison, plutôt que de laisser chaque acteur fonctionner isolément.</p></div>
       <div className="mt-12 grid gap-6 lg:grid-cols-3">
         <div className="overflow-hidden rounded-[1.75rem] border border-[#e0eaf1] bg-white shadow-sm">
           <img src={platformDashboard} alt="Visuel de présentation de la plateforme BIB utilisé dans le projet" loading="lazy" className="h-48 w-full object-cover sm:h-56"/>
           <div className="p-7"><div className="flex items-center gap-3"><Store className="text-[#b88949]" size={23}/><h3 className="text-xl font-extrabold">Les marchands</h3></div><p className="mt-4 text-sm leading-7 text-[#526778]">Créer leur vitrine, proposer des produits et disposer d'outils de gestion pour leur activité.</p></div>
         </div>
         <div className="overflow-hidden rounded-[1.75rem] border border-[#e0eaf1] bg-white shadow-sm">
           <img src={clientExperience} alt="Visuel de l'expérience client issu des contenus de présentation BIB" loading="lazy" className="h-48 w-full object-cover sm:h-56"/>
           <div className="p-7"><div className="flex items-center gap-3"><ShoppingBag className="text-[#b88949]" size={23}/><h3 className="text-xl font-extrabold">Les clients</h3></div><p className="mt-4 text-sm leading-7 text-[#526778]">Découvrir des marques, explorer leurs produits et suivre plus facilement leurs commandes.</p></div>
         </div>
         <div className="overflow-hidden rounded-[1.75rem] border border-[#e0eaf1] bg-white shadow-sm">
           <img src={partnerEcosystem} alt="Visuel de l'écosystème de partenaires présenté par BIB" loading="lazy" className="h-48 w-full object-cover sm:h-56"/>
           <div className="p-7"><div className="flex items-center gap-3"><Package className="text-[#b88949]" size={23}/><h3 className="text-xl font-extrabold">Les fournisseurs</h3></div><p className="mt-4 text-sm leading-7 text-[#526778]">Référencer des produits et participer à un réseau organisé autour des besoins des marques.</p></div>
         </div>
       </div>
       <div className="mt-6 flex flex-col items-start gap-4 rounded-2xl border border-[#d9e5ec] bg-[#eff6f9] p-6 sm:flex-row sm:items-center sm:gap-6">
         <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white text-[#b88949]"><Truck size={28}/></span>
         <div><h3 className="text-lg font-extrabold">Et la logistique ?</h3><p className="mt-2 text-sm leading-7 text-[#526778]">BIB prévoit de coordonner la préparation et l'acheminement des commandes grâce à ses partenaires opérationnels. L'expédition directe marchand → client ne constitue pas le modèle logistique BIB.</p></div>
       </div>
       <p className="mt-6 text-sm leading-6 text-[#697d8d]">Aperçus visuels issus des supports de présentation du projet. BIB est en développement : ces illustrations ne signifient pas que toutes les fonctionnalités sont déjà ouvertes au public.</p>
     </section>
     <section id="decouvrir" className="scroll-mt-24 bg-[#eff5f9] px-5 py-20 sm:py-24">
       <div className="mx-auto max-w-7xl">
         <div className="mb-10 max-w-4xl"><span className="text-xs font-extrabold uppercase tracking-[0.22em] text-[#a47b47]">Film de présentation · Brand-in-a-Box</span><h2 className="mt-4 text-4xl font-extrabold tracking-tight sm:text-5xl">Découvrez le projet BIB en 30 secondes.</h2><p className="mt-5 text-lg leading-8 text-[#526778]">Des boutiques aux clients, des fournisseurs à la logistique : une présentation concrète de l'écosystème que nous construisons et des domaines dans lesquels BIB Talent peut contribuer.</p></div>
         <div className="overflow-hidden rounded-[1.75rem] border border-[#d9e5ed] bg-white shadow-[0_30px_90px_-38px_rgba(24,51,78,0.2)]">
           <video controls playsInline preload="metadata" poster={platformDashboard} className="aspect-video w-full bg-[#edf3f8] object-contain" aria-label="Film de présentation de l'écosystème Brand-in-a-Box : marchands, clients, fournisseurs, logistique et BIB Talent">
             <source src={bibProjectFilm} type="video/mp4"/>
             Votre navigateur ne permet pas la lecture de cette vidéo. Le résumé du projet est présenté juste au-dessus.
           </video>
           <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 text-sm text-[#526778] sm:px-7">
             <span>Film original BIB · Parcours et vision de la plateforme · Sous-titres intégrés</span>
             <a href="#fonctionnement" className="inline-flex items-center gap-2 font-semibold text-[#18334e] hover:text-[#ac7c3c]">Et BIB Talent dans tout ça ? <ArrowRight size={16}/></a>
           </div>
         </div>
         <div className="mt-9 flex flex-col items-start justify-between gap-5 sm:flex-row sm:items-center"><p className="max-w-xl text-sm leading-6 text-[#526778]">Vous connaissez maintenant le projet. Vous souhaitez apporter vos idées à sa construction ?</p><Join secondary/></div>
       </div>
     </section>
     <section className="bg-[#eff5f9] py-20 sm:py-24">
       <div className="mx-auto max-w-7xl px-5 sm:px-8">
         <div className="max-w-3xl"><span className="text-xs font-extrabold uppercase tracking-[0.22em] text-[#a47b47]">Ce qu'on peut imaginer ensemble</span><h2 className="mt-4 text-4xl font-extrabold tracking-tight sm:text-5xl">BIB Talent : contribuer à ce qui se construit.</h2><p className="mt-5 text-lg leading-8 text-[#526778]">Le programme BIB Talent permet de réfléchir à des solutions concrètes pour la plateforme : parcours utilisateur, nouveaux services, communication, processus et écosystème.</p></div>
         <div className="mt-11 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{contributions.map(({icon:Icon,name,desc})=><div key={name} className="rounded-[1.5rem] border border-[#e2e9ee] bg-white p-7 shadow-sm"><div className="mb-8 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f5e8d3] text-[#946d3d]"><Icon size={23}/></div><h3 className="text-xl font-bold">{name}</h3><p className="mt-4 text-sm leading-7 text-[#53697c]">{desc}</p></div>)}</div>
       </div>
     </section>
     <section id="fonctionnement" className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:py-28">
       <div className="max-w-3xl"><span className="text-xs font-extrabold uppercase tracking-[0.22em] text-[#a47b47]">Comment fonctionne BIB Talent ?</span><h2 className="mt-4 text-4xl font-extrabold tracking-tight sm:text-5xl">Un premier échange peut devenir une belle idée.</h2></div>
       <div className="mt-12 grid gap-5 md:grid-cols-3">
         {[["01","Partage ton univers","Raconte ce qui t'intéresse, ce que tu explores et ce que tu aimerais apporter."],["02","Échangeons sur les idées","Nous découvrons tes centres d'intérêt et les sujets qui nous donnent envie d'avancer."],["03","Imaginons la suite","Selon les possibilités et les envies, nous définissons ensemble de nouvelles pistes de contribution."]].map(([n,t,d])=><div key={n} className="border-t-2 border-[#c9a26c] py-7"><span className="text-sm font-extrabold text-[#a47b47]">{n}</span><h3 className="mt-5 text-2xl font-bold">{t}</h3><p className="mt-4 max-w-sm leading-7 text-[#526778]">{d}</p></div>)}
       </div>
     </section>
     <section className="bg-[#e9f3f9] px-5 py-20 text-center sm:py-24">
       <div className="mx-auto max-w-3xl"><span className="text-xs font-extrabold uppercase tracking-[0.22em] text-[#a47b47]">BIB Talent</span><h2 className="mt-4 text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl">Et si la prochaine idée venait de toi ?</h2><p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-[#53697c]">Viens partager ton regard et découvrir comment participer à la construction de BIB.</p><div className="mt-8 flex justify-center"><Join secondary/></div></div>
     </section>
   </main>
   <footer className="border-t border-[#e3eaf0] bg-white">
     <div className="mx-auto flex max-w-7xl flex-col gap-5 px-5 py-9 text-sm text-[#53697c] sm:flex-row sm:items-center sm:justify-between sm:px-8">
       <span><strong className="text-[#18334e]">BIB Talent</strong> · Une initiative Brand-in-a-Box</span>
       <nav aria-label="Informations BIB Talent" className="flex flex-wrap gap-5"><a className="underline-offset-4 hover:underline" href="/talent/confidentialite">Confidentialité</a><a className="underline-offset-4 hover:underline" href="/talent/mentions-legales">Mentions légales</a><a className="underline-offset-4 hover:underline" href="/talent/cookies">Cookies</a></nav>
     </div>
   </footer>
 </div>;
}
