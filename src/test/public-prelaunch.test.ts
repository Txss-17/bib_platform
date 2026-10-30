import { describe, expect, it } from "vitest";
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
  expect(PRELAUNCH_PUBLIC_ROUTES).toContain("/confidentialite");
  for (const route of ["/dashboard","/tarifs","/vendre","/login","/store","/checkout","/signup"])
   expect(PRELAUNCH_PUBLIC_ROUTES).not.toContain(route);
 });
});
