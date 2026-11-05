import { useEffect, useState } from "react";
import { Cookie, ShieldCheck } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useCookieConsent } from "@/hooks/useCookieConsent";
import { cookieCopy } from "@/lib/cookieCopy";
import { COOKIE_SETTINGS_EVENT, openCookieSettings, saveCookieConsent, type CookiePurposes } from "@/lib/cookieConsent";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export function CookieSettingsButton({ className, id }: { className?: string; id?: string }) {
  const { lang } = useLanguage();
  return <button id={id} type="button" className={className} onClick={openCookieSettings} aria-haspopup="dialog">{cookieCopy(lang).manage}</button>;
}

export function CookieConsentManager() {
  const { lang } = useLanguage();
  const copy = cookieCopy(lang);
  const receipt = useCookieConsent();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<CookiePurposes>({ analytics: false, externalMedia: false });
  const [status, setStatus] = useState("");
  const [sessionOnly, setSessionOnly] = useState(false);
  useEffect(() => {
    const show = () => setOpen(true);
    window.addEventListener(COOKIE_SETTINGS_EVENT, show);
    return () => window.removeEventListener(COOKIE_SETTINGS_EVENT, show);
  }, []);
  useEffect(() => {
    // Another tab's withdrawal also replaces any stale draft in an open panel.
    if (open) setDraft(receipt?.purposes ?? { analytics: false, externalMedia: false });
  }, [open, receipt]);

  const save = (purposes: CookiePurposes, choice: "accepted" | "refused" | "custom") => {
    const persisted = saveCookieConsent(purposes, choice);
    setSessionOnly(!persisted);
    setStatus(persisted ? copy.saved : copy.sessionOnly);
    setOpen(false);
  };
  const refuse = () => save({ analytics: false, externalMedia: false }, "refused");
  const accept = () => save({ analytics: true, externalMedia: true }, "accepted");
  return <>
    {!receipt && !open ? <section aria-labelledby="cookie-banner-title" className="fixed inset-x-3 bottom-3 z-40 mx-auto max-h-[calc(100dvh-2rem)] max-w-3xl overflow-y-auto rounded-2xl border border-border bg-background p-5 text-foreground shadow-xl sm:p-6">
      <h2 id="cookie-banner-title" className="flex items-center gap-2 text-base font-semibold"><Cookie className="h-5 w-5" aria-hidden="true" />{copy.title}</h2>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{copy.intro}</p>
      <a href="/cookies" className="mt-2 inline-block text-sm underline underline-offset-4">{copy.policy}</a>
      <div className="mt-4 grid gap-2 sm:grid-cols-3">
        <Button type="button" variant="outline" onClick={accept}>{copy.accept}</Button>
        <Button type="button" variant="outline" onClick={refuse}>{copy.refuse}</Button>
        <Button id="cookie-settings-trigger" type="button" variant="outline" onClick={() => setOpen(true)}>{copy.customize}</Button>
      </div>
    </section> : <CookieSettingsButton id="cookie-settings-trigger" className="fixed bottom-3 left-3 z-40 rounded-full border border-border bg-background px-3 py-2 text-xs font-medium text-foreground shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />}

    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent onCloseAutoFocus={event => { event.preventDefault(); window.setTimeout(() => document.getElementById("cookie-settings-trigger")?.focus(), 0); }} className="max-h-[90dvh] w-[calc(100vw-2rem)] max-w-2xl overflow-y-auto rounded-xl">
        <DialogHeader>
          <DialogTitle>{copy.details}</DialogTitle>
          <DialogDescription>{copy.explanation}</DialogDescription>
        </DialogHeader>
        <div className="rounded-lg border border-border p-4">
          <div className="flex flex-wrap items-center justify-between gap-2"><h3 className="text-sm font-semibold">{copy.necessary}</h3><span className="flex items-center gap-1 text-xs text-muted-foreground"><ShieldCheck className="h-4 w-4" aria-hidden="true" />{copy.alwaysOn}</span></div>
          <p className="mt-2 text-sm text-muted-foreground">{copy.necessaryDescription}</p>
        </div>
        {(["analytics", "externalMedia"] as const).map(purpose => <div key={purpose} className="rounded-lg border border-border p-4">
          <div className="flex items-center justify-between gap-4">
            <label className="text-sm font-semibold" htmlFor={`cookie-${purpose}`}>{copy[purpose]}</label>
            <Switch id={`cookie-${purpose}`} checked={draft[purpose]} onCheckedChange={checked => setDraft(previous => ({ ...previous, [purpose]: checked }))} aria-describedby={`cookie-${purpose}-description`} />
          </div>
          <p id={`cookie-${purpose}-description`} className="mt-2 text-sm leading-relaxed text-muted-foreground">{copy[`${purpose}Description`]}</p>
        </div>)}
        <p className="text-xs leading-relaxed text-muted-foreground">{copy.advertising} {copy.retention}</p>
        <a href="/cookies" className="text-sm underline underline-offset-4">{copy.policy}</a>
        <div className="grid gap-2 sm:grid-cols-3">
          <Button type="button" variant="outline" onClick={accept}>{copy.accept}</Button>
          <Button type="button" variant="outline" onClick={refuse}>{copy.refuse}</Button>
          <Button type="button" variant="outline" onClick={() => save(draft, "custom")}>{copy.save}</Button>
        </div>
      </DialogContent>
    </Dialog>
    <p role="status" className={sessionOnly ? "fixed bottom-14 left-3 z-40 max-w-sm rounded-lg border bg-background p-3 text-xs text-foreground shadow-md" : "sr-only"}>{status}</p>
  </>;
}
