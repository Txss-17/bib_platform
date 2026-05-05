import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger,
} from "@/components/ui/sheet";
import { LifeBuoy, Send, Sparkles, Ticket, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type Msg = { role: "user" | "assistant"; content: string };

interface FloatingSupportButtonProps {
  source?: "dashboard_ai" | "storefront";
  boutiqueId?: string;
  contactEmail?: string;
  contactName?: string;
  className?: string;
}

/**
 * Floating Support widget powered by Lovable AI.
 * Answers from the BIB FAQ; auto-creates a support ticket via tool-call
 * when it cannot resolve the request.
 */
export function FloatingSupportButton({
  source = "dashboard_ai",
  boutiqueId,
  contactEmail,
  contactName,
  className,
}: FloatingSupportButtonProps) {
  const { user, profile } = useAuth();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([
    {
      role: "assistant",
      content:
        "Bonjour 👋 Je suis l'assistant Brand-In-A-Box. Posez votre question — si je ne peux pas répondre, je crée un ticket pour l'équipe humaine.",
    },
  ]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;
    setInput("");
    const next = [...messages, { role: "user" as const, content: text }];
    setMessages(next);
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("support-ai", {
        body: {
          messages: next,
          context: {
            source,
            boutique_id: boutiqueId ?? null,
            user_id: user?.id ?? null,
            contact_email: contactEmail ?? user?.email ?? null,
            contact_name: contactName ?? profile?.full_name ?? null,
          },
        },
      });
      if (error) throw error;
      const reply = data?.reply ?? "…";
      setMessages((m) => [...m, { role: "assistant", content: reply }]);
      if (data?.ticket?.id) {
        toast.success("Ticket créé", {
          description: `« ${data.ticket.subject } » — réponse sous 24 h ouvrées.`,
          icon: <Ticket className="w-4 h-4" />,
        });
      }
    } catch (e: any) {
      const msg = e?.message ?? "Erreur réseau";
      setMessages((m) => [
        ...m,
        { role: "assistant", content: `Désolé, une erreur s'est produite : ${msg}` },
      ]);
      toast.error("Assistant indisponible");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          aria-label="Ouvrir l'assistant support"
          className={cn(
            "fixed bottom-5 right-5 z-50 h-14 w-14 rounded-full shadow-lg",
            "bg-primary hover:bg-primary/90 text-primary-foreground",
            "flex items-center justify-center",
            className,
          )}
          size="icon"
        >
          <LifeBuoy className="w-6 h-6" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full sm:max-w-md flex flex-col p-0">
        <SheetHeader className="border-b p-4">
          <SheetTitle className="flex items-center gap-2 text-base">
            <Sparkles className="w-4 h-4 text-secondary" />
            Assistant Support
          </SheetTitle>
          <p className="text-xs text-muted-foreground">
            Réponses instantanées · ticket créé automatiquement si besoin
          </p>
        </SheetHeader>

        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.map((m, i) => (
            <div
              key={i}
              className={cn(
                "max-w-[85%] rounded-2xl px-3 py-2 text-sm leading-relaxed whitespace-pre-wrap",
                m.role === "user"
                  ? "ml-auto bg-primary text-primary-foreground rounded-br-sm"
                  : "bg-muted text-foreground rounded-bl-sm",
              )}
            >
              {m.content}
            </div>
          ))}
          {loading && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Loader2 className="w-3 h-3 animate-spin" /> L'assistant rédige…
            </div>
          )}
        </div>

        <div className="border-t p-3 flex items-end gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Votre question…"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send();
              }
            }}
            disabled={loading}
          />
          <Button onClick={send} disabled={loading || !input.trim()} size="icon">
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
