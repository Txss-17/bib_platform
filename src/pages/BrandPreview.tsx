import { BrandIcon, Logo, LogoImage } from "@/components/Logo";
import logoImg from "@/assets/brand-in-a-box-logo.png";

/**
 * Internal QA page — verifies the official Brand-In-A-Box icon crop
 * stays pixel-true across the sizes used in the app.
 *
 * Open at /brand-preview (no auth).
 */
const SIZES = [24, 28, 32, 36, 40, 44, 56, 72, 96, 128];

const BrandPreview = () => {
  return (
    <main className="min-h-screen bg-bib-ivory text-bib-marine py-10 px-4 sm:px-8">
      <div className="max-w-5xl mx-auto space-y-12">
        <header>
          <h1 className="font-display text-3xl sm:text-4xl font-bold mb-2">
            Brand icon — preview grid
          </h1>
          <p className="text-sm text-muted-foreground">
            Vérification interne du recadrage de l'icône officielle. Le rendu
            doit rester strictement identique à toutes les tailles
            (mobile&nbsp;36px → desktop&nbsp;72px+).
          </p>
        </header>

        {/* Crop grid — every cell uses the same percent-based crop */}
        <section>
          <h2 className="font-display text-xl font-semibold mb-4">
            Crop sizes (light background)
          </h2>
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-6 p-6 rounded-2xl bg-white border border-border">
            {SIZES.map((s) => (
              <figure key={s} className="flex flex-col items-center gap-2">
                <BrandIcon size={s} />
                <figcaption className="text-[11px] uppercase tracking-wider text-muted-foreground">
                  {s}px
                </figcaption>
              </figure>
            ))}
          </div>
        </section>

        <section>
          <h2 className="font-display text-xl font-semibold mb-4">
            Crop sizes (marine background)
          </h2>
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-6 p-6 rounded-2xl bg-bib-marine">
            {SIZES.map((s) => (
              <figure key={s} className="flex flex-col items-center gap-2">
                <BrandIcon size={s} />
                <figcaption className="text-[11px] uppercase tracking-wider text-bib-ivory/70">
                  {s}px
                </figcaption>
              </figure>
            ))}
          </div>
        </section>

        {/* Header parity — mobile vs desktop */}
        <section>
          <h2 className="font-display text-xl font-semibold mb-4">
            Header parity
          </h2>
          <div className="space-y-4">
            <div className="rounded-xl border border-border bg-white p-4 flex items-center justify-between">
              <Logo iconSize={36} asLink={false} />
              <span className="text-xs text-muted-foreground">
                Mobile header — 36px
              </span>
            </div>
            <div className="rounded-xl border border-border bg-white p-4 flex items-center justify-between">
              <Logo iconSize={44} asLink={false} />
              <span className="text-xs text-muted-foreground">
                Desktop header — 44px
              </span>
            </div>
            <div className="rounded-xl border border-border bg-bib-marine p-4 flex items-center justify-between">
              <Logo iconSize={40} variant="full" onLight={false} asLink={false} />
              <span className="text-xs text-bib-ivory/70">
                Footer — 40px on marine
              </span>
            </div>
          </div>
        </section>

        {/* Pixel-true overlay — render at 36 next to a 2× scaled 36 to compare with 72 */}
        <section>
          <h2 className="font-display text-xl font-semibold mb-4">
            Pixel-true overlay test
          </h2>
          <p className="text-sm text-muted-foreground mb-4">
            Le bloc du milieu est un <code>BrandIcon size=36</code> mis à
            l'échelle CSS&nbsp;2× — il doit visuellement coïncider avec le
            <code> size=72 </code>natif à droite (le crop est défini en % donc
            indépendant de la taille).
          </p>
          <div className="flex items-end gap-8 p-6 rounded-2xl bg-white border border-border">
            <figure className="flex flex-col items-center gap-2">
              <BrandIcon size={36} />
              <figcaption className="text-[11px] text-muted-foreground">
                native 36
              </figcaption>
            </figure>
            <figure className="flex flex-col items-center gap-2">
              <div style={{ transform: "scale(2)", transformOrigin: "bottom left" }}>
                <BrandIcon size={36} />
              </div>
              <figcaption className="text-[11px] text-muted-foreground mt-10">
                36 × CSS scale 2
              </figcaption>
            </figure>
            <figure className="flex flex-col items-center gap-2">
              <BrandIcon size={72} />
              <figcaption className="text-[11px] text-muted-foreground">
                native 72
              </figcaption>
            </figure>
          </div>
        </section>

        {/* Source asset, full */}
        <section>
          <h2 className="font-display text-xl font-semibold mb-4">
            Source asset (1243×629)
          </h2>
          <div className="rounded-2xl bg-white border border-border p-6 overflow-hidden">
            <LogoImage className="w-full max-w-2xl mx-auto" />
            <p className="text-xs text-muted-foreground mt-4 text-center">
              Référence officielle — tout recadrage utilisé dans l'app dérive
              de cette image, jamais d'une recréation typographique.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
};

export default BrandPreview;
