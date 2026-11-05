import type { IframeHTMLAttributes } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useCookieConsent } from "@/hooks/useCookieConsent";
import { cookieCopy } from "@/lib/cookieCopy";
import { supportedExternalEmbed } from "@/lib/externalEmbeds";
import { CookieSettingsButton } from "./CookieConsentManager";

export function ConsentProtectedFrame({ src, ...props }: Omit<IframeHTMLAttributes<HTMLIFrameElement>, "srcDoc"> & { src: string }) {
  const { lang } = useLanguage();
  const copy = cookieCopy(lang);
  const receipt = useCookieConsent();
  const embed = supportedExternalEmbed(src);
  if (embed && receipt?.purposes.externalMedia) {
    return <iframe {...props} src={embed.url} referrerPolicy="no-referrer" />;
  }
  return <div className="flex h-full min-h-48 flex-col items-center justify-center gap-3 bg-muted p-5 text-center text-foreground" role="group" aria-label={embed?.provider ?? copy.unsupported}>
    <p className="text-sm font-semibold">{embed ? `${embed.provider} — ${copy.mediaBlocked}` : copy.unsupported}</p>
    {embed && <><p className="max-w-md text-sm text-muted-foreground">{copy.mediaExplanation}</p><CookieSettingsButton className="rounded-md border border-border bg-background px-4 py-2 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" /></>}
  </div>;
}
