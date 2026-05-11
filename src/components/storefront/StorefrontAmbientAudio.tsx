import { useEffect, useRef, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";

interface Props {
  src?: string | null;
  volume?: number;
}

/**
 * Persistent ambient audio for the storefront.
 * Browsers block autoplay with sound, so playback only starts after the
 * visitor clicks the floating speaker. Mute state is remembered per session.
 */
export function StorefrontAmbientAudio({ src, volume = 0.4 }: Props) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.volume = Math.min(Math.max(volume, 0), 1);
  }, [volume]);

  if (!src) return null;

  const toggle = async () => {
    const el = audioRef.current;
    if (!el) return;
    if (playing) {
      el.pause();
      setPlaying(false);
    } else {
      try {
        await el.play();
        setPlaying(true);
      } catch {
        setPlaying(false);
      }
    }
  };

  return (
    <>
      <audio ref={audioRef} src={src} loop preload="none" />
      <button
        type="button"
        onClick={toggle}
        aria-label={playing ? "Couper l'ambiance sonore" : "Activer l'ambiance sonore"}
        className="fixed bottom-4 right-4 z-40 h-11 w-11 rounded-full bg-background/90 backdrop-blur border border-border shadow-md flex items-center justify-center text-foreground hover:bg-background transition"
      >
        {playing ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4 opacity-60" />}
      </button>
    </>
  );
}