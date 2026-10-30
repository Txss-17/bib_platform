#!/usr/bin/env python3
"""Create an original, silent BIB product explainer from this repository's own
visual assets. This is a cinematic illustration of the product vision, not
a recording or proof that all Platform features are production-ready.
"""
from pathlib import Path
from tempfile import TemporaryDirectory
import subprocess
import math
import textwrap
from PIL import Image, ImageDraw, ImageFont, ImageOps, ImageFilter

ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / "src" / "assets"
DEST = ASSETS / "bib-project-talent.mp4"
W, H = 1280, 720
NAVY = "#18334e"
INK = "#1b344d"
MUTED = "#51677a"
GOLD = "#b78b50"
IVORY = "#f7f9fc"
WHITE = "#ffffff"

def font(size, bold=False):
    paths = [
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf" if bold else "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
        "/usr/share/fonts/truetype/liberation2/LiberationSans-Bold.ttf" if bold else "/usr/share/fonts/truetype/liberation2/LiberationSans-Regular.ttf",
    ]
    for path in paths:
        if Path(path).exists():
            return ImageFont.truetype(path, size)
    return ImageFont.load_default()

def rounded(draw, rect, radius, color, outline=None, width=1):
    draw.rounded_rectangle(rect, radius=radius, fill=color, outline=outline, width=width)

def fit_text(draw, content, max_width, size=62, minimum=28, bold=True):
    while size>minimum:
        f=font(size,bold)
        lines=wrap(draw,content,f,max_width)
        if len(lines)<=3: return f,lines
        size-=3
    f=font(minimum,bold)
    return f,wrap(draw,content,f,max_width)

def wrap(draw, text, ft, maxw):
    lines=[]
    for paragraph in text.split("\n"):
        words=paragraph.split()
        cur=""
        for word in words:
            proposed=(cur+" "+word).strip()
            if draw.textbbox((0,0), proposed, font=ft)[2]<=maxw or not cur:
                cur=proposed
            else:
                lines.append(cur)
                cur=word
        if cur: lines.append(cur)
    return lines

def text_lines(draw, lines, x, y, ft, fill, spacing=12, anchor=None):
    asc=ft.size
    for line in lines:
        draw.text((x,y),line,font=ft,fill=fill,anchor=anchor)
        y+=asc+spacing
    return y

def base_scene(n, label):
    img=Image.new("RGB",(W,H),IVORY)
    d=ImageDraw.Draw(img)
    d.ellipse((970,-320,1590,320),fill="#e8f0f6")
    d.ellipse((-250,580,170,995),fill="#f5eddd")
    rounded(d,(66,52,244,106),20,WHITE,outline="#e5ebf1",width=2)
    d.text((86,66),"BIB",font=font(28,True),fill=NAVY)
    d.text((159,74),"TALENT",font=font(16,True),fill=GOLD)
    d.text((1070,76),f"{n:02d} / 07",font=font(15,True),fill=MUTED)
    d.line((66,654,1215,654),fill="#dfe8f0",width=2)
    d.text((68,672),"BRAND-IN-A-BOX  ·  VISION DU PROJET",font=font(13,True),fill=MUTED)
    d.text((1148,672),label.upper(),font=font(13,True),fill=GOLD,anchor="ra")
    return img,d

def picture(img, name, rect):
    path=ASSETS/name
    if not path.exists():
        raise FileNotFoundError(f"Required on-brand source image missing: {path}")
    (x0,y0,x1,y1)=rect
    w,h=x1-x0,y1-y0
    photo=Image.open(path).convert("RGB")
    photo=ImageOps.fit(photo,(w,h),method=Image.Resampling.LANCZOS,centering=(0.5,0.5))
    mask=Image.new("L",(w,h))
    md=ImageDraw.Draw(mask)
    md.rounded_rectangle((0,0,w-1,h-1),radius=28,fill=255)
    img.paste(photo,(x0,y0),mask)
    d=ImageDraw.Draw(img)
    d.rounded_rectangle((x0,y0,x1,y1),radius=28,outline="#d9e5ee",width=2)

def heading(d, step, title, desc, area_width=510):
    d.text((75,164),step.upper(),font=font(20,True),fill=GOLD)
    ft,lines=fit_text(d,title,area_width,size=54)
    end=text_lines(d,lines,75,218,ft,INK,spacing=13)
    dsc=wrap(d,desc,font(23),area_width)
    text_lines(d,dsc,75,end+30,font(23),MUTED,spacing=11)

def card(draw,x,y,w,h,title,desc,fill=WHITE):
    rounded(draw,(x,y,x+w,y+h),24,fill,outline="#dbe5ee",width=2)
    draw.text((x+24,y+22),title,font=font(21,True),fill=INK)
    for idx,line in enumerate(wrap(draw,desc,font(16),w-45)[:3]):
        draw.text((x+24,y+63+idx*25),line,font=font(16),fill=MUTED)

def scene_intro():
    im,d=base_scene(1,"La vision")
    d.text((76,167),"BIB  /  BRAND-IN-A-BOX",font=font(23,True),fill=GOLD)
    ft,lines=fit_text(d,"Un écosystème pour les marques et leurs clients.",890,size=66)
    end=text_lines(d,lines,76,236,ft,INK,spacing=14)
    d.text((78,end+33),"Boutiques  ·  Produits  ·  Fournisseurs  ·  Logistique",font=font(23),fill=MUTED)
    rounded(d,(78,545,560,606),22,WHITE,outline="#dbe5ee",width=2)
    d.text((103,561),"Une plateforme en construction",font=font(21,True),fill=NAVY)
    return im

def scene_merchant():
    im,d=base_scene(2,"Marchands")
    picture(im,"landing-dashboard.jpg",(655,150,1206,580))
    d=ImageDraw.Draw(im)
    heading(d,"01  /  Marchands","Créer et piloter sa marque.","Une boutique, un catalogue et un espace pour suivre son activité.",495)
    rounded(d,(658,583,1115,620),12,WHITE)
    d.text((674,592),"Visuel existant du projet BIB",font=font(14,True),fill=MUTED)
    return im

def scene_client():
    im,d=base_scene(3,"Clients")
    picture(im,"landing-unboxing.jpg",(655,150,1206,580))
    d=ImageDraw.Draw(im)
    heading(d,"02  /  Clients","Découvrir, choisir et commander.","Des vitrines de marques, des produits et un parcours de commande suivi.",495)
    return im

def scene_supplier():
    im,d=base_scene(4,"Fournisseurs")
    picture(im,"landing-partener.jpg",(655,150,1206,580))
    d=ImageDraw.Draw(im)
    heading(d,"03  /  Fournisseurs","Relier les bons produits aux bonnes marques.","Sélection, référencement et collaboration avec les marchands de l'écosystème.",490)
    return im

def scene_logistics():
    im,d=base_scene(5,"Logistique")
    heading(d,"04  /  Logistique","Coordonner la livraison de bout en bout.","BIB s'appuie sur des partenaires opérationnels pour les expéditions et le suivi.",535)
    rounded(d,(677,145,1200,590),34,WHITE,outline="#dbe5ee",width=2)
    d.text((716,183),"LE PARCOURS LOGISTIQUE",font=font(18,True),fill=GOLD)
    stages=[("Commande","validée"),("Préparation","coordonnée"),("Acheminement","suivi"),("Livraison","au client")]
    for idx,(a,b) in enumerate(stages):
        y=231+idx*81
        rounded(d,(714,y,1160,y+64),17,"#edf4f9" if idx%2==0 else "#f9f2e7")
        rounded(d,(728,y+10,771,y+53),14,NAVY)
        d.text((749,y+31),str(idx+1),font=font(21,True),fill=WHITE,anchor="mm")
        d.text((793,y+10),a,font=font(21,True),fill=INK)
        d.text((793,y+35),b,font=font(16),fill=MUTED)
    return im

def scene_ecosystem():
    im,d=base_scene(6,"Écosystème")
    d.text((74,164),"UN MÊME RÉSEAU",font=font(20,True),fill=GOLD)
    ft,lines=fit_text(d,"Quatre acteurs. Une expérience cohérente.",1080,size=58)
    text_lines(d,lines,74,222,ft,INK,spacing=7)
    actors=[("MARCHANDS",90,420),("FOURNISSEURS",395,420),("PARTENAIRES BIB",700,420),("CLIENTS",1005,420)]
    for idx,(word,x,y) in enumerate(actors):
        rounded(d,(x,y,x+235,y+100),22,WHITE,outline="#dbe5ee",width=2)
        d.text((x+117,y+39),word,font=font(17,True),fill=NAVY,anchor="mm")
        d.text((x+117,y+70),["Vitrines","Référencement","Logistique","Découverte"][idx],font=font(15),fill=MUTED,anchor="mm")
        if idx<3:
            d.text((x+268,y+50),"→",font=font(33,True),fill=GOLD,anchor="mm")
    d.text((76,572),"BIB : la plateforme qui relie et coordonne l'écosystème.",font=font(21,True),fill=GOLD)
    return im

def scene_talent():
    im,d=base_scene(7,"BIB Talent")
    d.text((75,174),"LE PROJET SE CONSTRUIT",font=font(21,True),fill=GOLD)
    ft,lines=fit_text(d,"Et si tu participais à sa création ?",1090,size=68)
    end=text_lines(d,lines,75,247,ft,INK,spacing=15)
    d.text((78,end+29),"Imaginer. Tester. Apporter des idées. Construire ensemble.",font=font(25),fill=MUTED)
    rounded(d,(78,548,530,610),23,NAVY)
    d.text((105,565),"Découvrir BIB Talent",font=font(24,True),fill=WHITE)
    d.text((1044,581),"BIB  ✦  TALENT",font=font(24,True),fill=GOLD)
    return im

def main():
    scenes=[scene_intro(),scene_merchant(),scene_client(),scene_supplier(),scene_logistics(),scene_ecosystem(),scene_talent()]
    with TemporaryDirectory(prefix="bib-video-") as temp:
        tmp=Path(temp)
        files=[]
        for idx,im in enumerate(scenes):
            p=tmp/f"scene_{idx:02d}.png"
            im.save(p,optimize=True)
            files.append(str(p))
        args=["ffmpeg","-hide_banner","-loglevel","error","-y"]
        for p in files:
            args+=["-loop","1","-framerate","24","-t","4.5","-i",p]
        filters=[f"[{idx}:v]scale={W}:{H},format=yuv420p,setsar=1[v{idx}]" for idx in range(len(files))]
        prev="v0"
        for idx in range(1,len(files)):
            dst=f"x{idx}"
            filters.append(f"[{prev}][v{idx}]xfade=transition=fade:duration=0.5:offset={4.0*idx:.1f}[{dst}]")
            prev=dst
        args+=["-filter_complex",";".join(filters),"-map",f"[{prev}]","-an",
                "-c:v","libx264","-preset","ultrafast","-crf","27",
                "-pix_fmt","yuv420p","-movflags","+faststart","-t","28.5",str(DEST)]
        subprocess.run(args,check=True)
    print(f"Created {DEST}: {DEST.stat().st_size} bytes")

if __name__=="__main__":
    main()
