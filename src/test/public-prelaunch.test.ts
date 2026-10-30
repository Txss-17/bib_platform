import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { isPublicPrelaunchHost, PRELAUNCH_PUBLIC_ROUTES } from "@/lib/publicPrelaunch";

describe("BIB Talent public prelaunch boundary", () => {
 it("publishes only marketing pages on the public Lovable and BIB domains", () => {
  expect(isPublicPrelaunchHost("bib-platform.lovable.app")).toBe(true);
  expect(isPublicPrelaunchHost("talent.brand-in-a-box.space")).toBe(true);
  expect(isPublicPrelaunchHost("brand-in-a-box.space")).toBe(true);
 });
 it("keeps editor preview and local QA on full routing", () => {
  expect(isPublicPrelaunchHost("id-preview--1aa1b209-5f17-4dd2-aaca-54cdffc202fc.lovable.app")).toBe(false);
  expect(isPublicPrelaunchHost("localhost")).toBe(false);
  expect(isPublicPrelaunchHost("127.0.0.1")).toBe(false);
 });
 it("exposes no checkout, storefront, signup or internal module route", () => {
  expect(PRELAUNCH_PUBLIC_ROUTES).toContain("/carrieres/talent");
  expect(PRELAUNCH_PUBLIC_ROUTES).toContain("/talent/confidentialite");
  expect(PRELAUNCH_PUBLIC_ROUTES).toContain("/talent/cookies");
  expect(PRELAUNCH_PUBLIC_ROUTES).toContain("/talent/mentions-legales");
  for (const route of ["/dashboard","/tarifs","/vendre","/login","/store","/checkout","/signup"])
   expect(PRELAUNCH_PUBLIC_ROUTES).not.toContain(route);
 });
});

describe("Public BIB Talent programme editorial boundaries", () => {
  const talent=readFileSync("src/pages/BibTalent.tsx","utf8");
  const legal=readFileSync("src/pages/TalentLegal.tsx","utf8");
  const router=readFileSync("src/App.tsx","utf8");
  it("describes contribution rather than a recruitment offer or internal employee access",()=>{
    expect(talent).toContain("Les grandes idées");
    expect(talent).toContain("Comment fonctionne BIB Talent ?");
    for (const banned of ["candidature", "recrutement", "promesse d'emploi", "Intranet", "rémunération le cas échéant", "À savoir"]) {
      expect(talent).not.toContain(banned);
    }
  });
  it("replaces the former MP4 with a pauseable animated storyboard, respecting reduced motion",()=>{
    expect(talent).toContain("function TalentMotion()");
    expect(talent).toContain("prefers-reduced-motion");
    expect(talent).toContain("setPlaying");
    expect(talent).not.toContain("bib-talent.mp4");
    expect(talent).toContain('bg-[#fbfcfd]');
    expect(talent).toContain('colorScheme:"light"');
  });
  it("uses dedicated Talent legal content and links without store, subscription or checkout notices",()=>{
    for(const route of ["/talent/mentions-legales","/talent/confidentialite","/talent/cookies"]){
      expect(talent).toContain(route);
      expect(router).toContain(route);
    }
    expect(legal).toContain("Google Forms");
    expect(legal).toContain("BIB Talent");
    expect(legal).not.toContain("Cookies utilisés : session d'authentification, panier");
  });
});
