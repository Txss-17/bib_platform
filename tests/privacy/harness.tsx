// Local browser fixture. Network requests are intercepted by browser.mjs.
import { createRoot } from "react-dom/client";
import { LanguageProvider } from "../../src/contexts/LanguageContext";
import { CookieConsentManager } from "../../src/components/privacy/CookieConsentManager";
import { StorefrontVideo } from "../../src/components/storefront/StorefrontVideo";
import { ConsentProtectedFrame } from "../../src/components/privacy/ConsentProtectedFrame";
import { trackStorefrontEvent } from "../../src/lib/storefrontTracking";
import "../../src/index.css";

createRoot(document.getElementById("root")!).render(<LanguageProvider>
  <main className="mx-auto max-w-3xl p-5">
    <h1 className="text-2xl font-semibold">Recette cookies BIB</h1>
    <button className="my-4 rounded border px-4 py-2" onClick={() => void trackStorefrontEvent("test-store", "boutique_view")}>Émettre un événement de test</button>
    <StorefrontVideo primaryColor="#123456" videoUrl="https://www.youtube.com/watch?v=dQw4w9WgXcQ" title="Vidéo de démonstration" />
    <div className="aspect-video"><ConsentProtectedFrame src="https://www.google.com/maps/embed?pb=test" title="Carte de démonstration" className="h-full w-full" /></div>
  </main>
  <CookieConsentManager />
</LanguageProvider>);
