import { translateUi } from "@/lib/uiTranslation";
import { useLanguage } from "@/contexts/LanguageContext";
import { Play } from "lucide-react";
import { ConsentProtectedFrame } from "@/components/privacy/ConsentProtectedFrame";
import { supportedExternalEmbed } from "@/lib/externalEmbeds";

interface StorefrontVideoProps {
  primaryColor: string;
  videoUrl?: string;
  title?: string;
}

export function StorefrontVideo({
  primaryColor,
  videoUrl,
  title,
}: StorefrontVideoProps) {
  useLanguage();
  const embedUrl = videoUrl ? supportedExternalEmbed(videoUrl)?.url : null;

  return (
    <section className="py-12 md:py-16 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {title && (
          <h2 className="text-2xl md:text-3xl font-semibold text-gray-900 text-center mb-8">
            {title}
          </h2>
        )}
        <div className="aspect-video rounded-xl overflow-hidden shadow-lg border border-gray-100">
          {embedUrl ? (
            <ConsentProtectedFrame
              src={embedUrl}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              title={title || translateUi("Vidéo")}
            />
          ) : (
            <div
              className="w-full h-full flex flex-col items-center justify-center"
              style={{ backgroundColor: `${primaryColor}10` }}
            >
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center mb-3"
                style={{ backgroundColor: primaryColor }}
              >
                <Play className="w-7 h-7 text-white ml-1" />
              </div>
              <p className="text-gray-400 text-sm">
                {translateUi("Vidéo de présentation")}
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
