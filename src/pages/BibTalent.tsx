import { useEffect, useState } from "react";
import { ArrowRight, ArrowUpRight, Compass, Lightbulb, Pause, Play, Sparkles, Users, Workflow, Shapes } from "lucide-react";
import { useSEO } from "@/hooks/useSEO";

const FORM_URL = "https://docs.google.com/forms/d/e/1FAIpQLSemotUUORqFwUdM60S1BAW-79YzSm-5TiocRvm-wuTUiCevvg/viewform";
const BLUE = "#18334e";
const GOLD = "#b88949";

const steps = [
  {number:"01", eyebrow:"EXPLORER", headline:"Une idée peut tout changer.", subline:"Observer les usages. Questionner l'existant. Identifier de nouvelles possibilités.", word:"OBSERVER", tint:"#e6f2fc"},
  {number:"02", eyebrow:"IMAGINER", headline:"Créer ce qui n'existe pas encore.", subline:"Croiser les regards. Imaginer des expériences. Faire émerger des solutions.", word:"IMAGINER", tint:"#faf0de"},
  {number:"03", eyebrow:"CONSTRUIRE", headline:"Faire avancer BIB, ensemble.", subline:"Prototyper, tester, améliorer. Transformer les échanges en projets concrets.", word:"CONSTRUIRE", tint:"#e7f3ef"},
] as const;

function TalentMotion() {
  const [current, setCurrent] = useState(0);
  const [playing, setPlaying] = useState(() => typeof window !== "undefined" &&
    !window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  useEffect(() => {
    if (!playing) return;
    const id = window.setInterval(() => setCurrent(i => (i+1)%steps.length), 3500);
    return () => window.clearInterval(id);
  },[playing]);
  const step=steps[current];
  return (
    <div className="overflow-hidden rounded-[2rem] border border-[#d6e3ed] bg-white shadow-[0_30px_90px_-38px_rgba(24,51,78,0.25)]" role="region" aria-label="Présentation animée du programme BIB Talent">
      <div className="flex items-center justify-between gap-3 border-b border-[#e6edf2] px-5 py-4 sm:px-8">
        <span className="flex items-center gap-2 text-xs font-semibold tracking-[0.18em] text-[#53677b]"><span className="h-2 w-2 rounded-full bg-[#b88949]"/>BIB TALENT · EN MOUVEMENT</span>
        <button type="button" onClick={() => setPlaying(p=>!p)} className="inline-flex items-center gap-2 rounded-full border border-[#d7e2ea] bg-[#f7fafc] px-4 py-2 text-sm font-semibold text-[#18334e] hover:bg-[#edf4f9]" aria-label={playing?"Mettre l'animation en pause":"Lire l'animation"}>
          {playing?<Pause size={15}/>:<Play size={15}/>} {playing?"Pause":"Lecture"}
        </button>
      </div>
      <div className="relative flex min-h-[320px] flex-col justify-center overflow-hidden px-6 py-12 sm:min-h-[425px] sm:px-12 lg:px-16" style={{background:step.tint}}>
        <div aria-hidden="true" className="pointer-events-none absolute -right-20 -top-24 h-80 w-80 rounded-full border-[34px] border-white/65"/>
        <div aria-hidden="true" className="pointer-events-none absolute bottom-[-130px] right-12 h-72 w-72 rotate-12 rounded-[3rem] border-[35px] border-white/55"/>
        <span className="relative mb-5 inline-flex w-fit rounded-full bg-white/80 px-4 py-2 text-xs font-extrabold tracking-[0.17em] text-[#8d693f]">{step.number} / {step.eyebrow}</span>
        <h3 key={step.word} className="relative max-w-3xl text-4xl font-extrabold leading-[1.1] tracking-tight text-[#18334e] sm:text-5xl lg:text-6xl">{step.headline}</h3>
        <p className="relative mt-6 max-w-xl text-base leading-7 text-[#3c5268] sm:text-lg">{step.subline}</p>
        <div className="relative mt-9 text-xs font-bold tracking-[0.28em] text-[#8d693f]">{step.word} / BIB</div>
      </div>
      <div className="grid grid-cols-3 gap-3 p-5 sm:p-6" role="group" aria-label="Séquences de l'animation">
        {steps.map((item,i)=><button key={item.number} type="button" onClick={()=>setCurrent(i)} aria-current={i===current?"step":undefined} className={"rounded-xl border px-2 py-3 text-center text-xs font-bold transition sm:text-sm "+(current===i?"border-[#b88949] bg-[#fff7ea] text-[#18334e]":"border-[#e5ecf1] bg-white text-[#607486] hover:bg-[#f2f6fa]")}>{item.number} · {item.eyebrow}</button>)}
      </div>
    </div>
  );
}

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
 useSEO({title:"BIB Talent — Imaginez et construisez BIB avec nous",description:"BIB Talent est l'espace de contribution et d'exploration de Brand-in-a-Box : idées, innovation, produit et communauté."});
 return <div className="min-h-screen bg-[#fbfcfd] font-sans text-[#18334e]" style={{colorScheme:"light"}}>
   <header className="sticky top-0 z-30 border-b border-[#e3eaf0] bg-white/95 backdrop-blur">
     <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-8" aria-label="Navigation BIB Talent">
       <a href="/carrieres/talent" className="text-xl font-black tracking-tight text-[#18334e]">BIB <span className="font-medium text-[#b88949]">TALENT</span></a>
       <div className="flex items-center gap-5">
         <a href="#fonctionnement" className="hidden text-sm font-semibold text-[#43566a] hover:text-[#b88949] sm:inline">Comment ça fonctionne</a>
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
           <h1 className="mt-7 max-w-3xl text-5xl font-extrabold leading-[1.06] tracking-tight text-[#18334e] sm:text-6xl xl:text-7xl">Les grandes idées <span className="text-[#b88949]">se construisent ensemble.</span></h1>
           <p className="mt-7 max-w-2xl text-lg leading-8 text-[#4b6072]">BIB Talent réunit des esprits curieux, créatifs et engagés autour d'un projet en construction : <strong className="font-semibold text-[#18334e]">imaginer et faire grandir Brand-in-a-Box.</strong></p>
           <div className="mt-9 flex flex-wrap items-center gap-5"><Join/><a href="#decouvrir" className="inline-flex items-center gap-2 font-semibold text-[#18334e] hover:text-[#ac7c3c]">Découvrir le programme <ArrowRight size={17}/></a></div>
         </div>
         <div className="relative">
           <div aria-hidden="true" className="absolute -inset-5 rotate-3 rounded-[2.5rem] bg-[#e4eff7]"/>
           <div className="relative rounded-[2rem] border border-[#e4eaf0] bg-white p-6 shadow-[0_24px_70px_-34px_rgba(24,51,78,0.28)] sm:p-9">
             <div className="flex items-center justify-between border-b border-[#e8edf1] pb-6"><span className="text-sm font-extrabold tracking-[0.16em]">BIB / TALENT</span><Compass size={27} color={GOLD}/></div>
             <div className="py-9"><span className="text-xs font-bold uppercase tracking-widest text-[#a47b47]">Le point de départ</span><p className="mt-4 text-3xl font-extrabold leading-tight sm:text-4xl">Une intuition.<br/>Une rencontre.<br/><span className="text-[#b88949]">Une nouvelle possibilité.</span></p></div>
             <div className="grid grid-cols-3 gap-3 border-t border-[#e8edf1] pt-6">{["Explorer","Imaginer","Construire"].map((x,i)=><div key={x} className="rounded-xl bg-[#f4f8fb] p-3 text-center text-xs font-bold text-[#3f576a]"><span className="mb-2 block text-[#b88949]">0{i+1}</span>{x}</div>)}</div>
           </div>
         </div>
       </div>
     </section>
     <section id="decouvrir" className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:py-28">
       <div className="mb-10 max-w-3xl"><span className="text-xs font-extrabold uppercase tracking-[0.22em] text-[#a47b47]">Le programme en mouvement</span><h2 className="mt-4 text-4xl font-extrabold tracking-tight sm:text-5xl">Chaque contribution ouvre une perspective.</h2><p className="mt-5 text-lg leading-8 text-[#526778]">Une nouvelle présentation animée pour raconter l'esprit BIB Talent : observer, imaginer, construire.</p></div>
       <TalentMotion/>
       <div className="mt-9 flex flex-col items-start justify-between gap-5 sm:flex-row sm:items-center"><p className="max-w-xl text-sm leading-6 text-[#526778]">Tu as envie d'apporter ton regard, tes compétences ou une idée ? Présente-toi dans notre formulaire.</p><Join secondary/></div>
     </section>
     <section className="bg-[#eff5f9] py-20 sm:py-24">
       <div className="mx-auto max-w-7xl px-5 sm:px-8">
         <div className="max-w-3xl"><span className="text-xs font-extrabold uppercase tracking-[0.22em] text-[#a47b47]">Ce qu'on peut imaginer ensemble</span><h2 className="mt-4 text-4xl font-extrabold tracking-tight sm:text-5xl">Des horizons différents. Un projet commun.</h2><p className="mt-5 text-lg leading-8 text-[#526778]">La diversité des expériences nourrit les projets. Voici quelques terrains d'exploration de BIB Talent.</p></div>
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
