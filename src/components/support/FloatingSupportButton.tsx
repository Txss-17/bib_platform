import { translateUi } from "@/lib/uiTranslation";
import { useLanguage } from "@/contexts/LanguageContext";
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Bot,
  Send,
  Ticket,
  Loader2,
  Paperclip,
  X,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { uploadTicketAttachment } from "@/hooks/useSupportTickets";

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
 * Answers BIB questions conversationally and requests explicit approval
 * before submitting a support ticket.
 */
export function FloatingSupportButton({
  source = "dashboard_ai",
  boutiqueId,
  contactEmail,
  contactName,
  className,
}: FloatingSupportButtonProps) {
  useLanguage();
  const { user, profile } = useAuth();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [offerTicket, setOfferTicket] = useState(false);
  const [offerId, setOfferId] = useState<string | null>(null);
  const [turnToken, setTurnToken] = useState<string | null>(null);
  const [askAnotherTopic, setAskAnotherTopic] = useState(false);
  const [conversationClosed, setConversationClosed] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([
    {
      role: "assistant",
      content:
        "Bonjour ! Comment puis-je vous aider ?",
    },
  ]);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, loading]);

  const send = async () => {
    const text = input.trim();
    if (!text || loading || askAnotherTopic || conversationClosed || offerTicket) return;
    setInput("");
    setOfferTicket(false);
    setOfferId(null);
    const next = [...messages, { role: "user" as const, content: text }];
    setMessages(next);
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("support-ai", {
        body: {
          messages: next.filter(msg => msg.role === "user").slice(-16),
          turn_token: turnToken,
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
      const reply = typeof data?.reply === "string" ? data.reply : "Pouvez-vous préciser votre demande ?";
      const proposed = data?.offer_ticket === true && typeof data?.offer_id === "string";
      setOfferTicket(proposed);
      setOfferId(proposed ? data.offer_id : null);
      setTurnToken(typeof data?.turn_token === "string" ? data.turn_token : null);
      setAskAnotherTopic(data?.offer_another_topic === true && !proposed);
      setMessages((m) => [...m, { role: "assistant", content: reply }]);
    } catch {
      const msg = "Veuillez réessayer ou utiliser la rubrique Mes tickets.";
      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          content: `Désolé, une erreur s'est produite : ${msg}`,
        },
      ]);
      toast.error(translateUi("Assistant indisponible"));
    } finally {
      setLoading(false);
    }
  };

  const confirmTicket = async () => {
    if (!offerTicket || !offerId || loading || conversationClosed) return;
    setOfferTicket(false);
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("support-ai", {
        body: {
          action: "create_ticket",
          confirmed: true,
          offer_id: offerId,
          turn_token: turnToken,
          messages: messages.filter(msg => msg.role === "user").slice(-16),
          context: { source, boutique_id: boutiqueId ?? null },
        },
      });
      if (error || !data?.ticket?.id) throw error ?? new Error("ticket_creation_failed");
      setMessages((previous) => [...previous, {
        role: "assistant", content: data.reply || "Votre demande a bien été transmise au support.",
      }]);
      for (const file of pendingFiles) {
        try {
          await uploadTicketAttachment(data.ticket.id, file, user?.id ?? null);
        } catch {
          toast.error(translateUi("Une pièce jointe n’a pas pu être transmise."));
        }
      }
      setPendingFiles([]);
      setOfferId(null);
      setTurnToken(null);
      setAskAnotherTopic(true);
      toast.success(translateUi("Ticket créé"), { icon: <Ticket className="w-4 h-4" /> });
    } catch {
      setOfferId(null);
      setOfferTicket(false);
      setMessages(previous => [...previous, { role: "assistant", content:
        "L'ouverture n'a pas abouti. Aucun nouveau ticket n'est confirmé. Souhaitez-vous continuer la discussion pour réessayer ?" }]);
      toast.error(translateUi("La création du ticket a échoué. Réessayez."));
    } finally {
      setLoading(false);
    }
  };

  const declineTicket = () => {
    setOfferTicket(false);
    setOfferId(null);
    setTurnToken(null);
    setAskAnotherTopic(true);
    setMessages(previous => [...previous, {
      role: "assistant", content: "Très bien, aucun ticket n'a été créé. Souhaitez-vous aborder un autre sujet ?",
    }]);
  };

  const finishTopic = () => {
    if (loading || offerTicket || askAnotherTopic || conversationClosed) return;
    setAskAnotherTopic(true);
    setMessages(previous => [...previous, {
      role: "assistant", content: "Souhaitez-vous en savoir davantage sur un autre sujet ?",
    }]);
  };

  const continueWithNewTopic = () => {
    setMessages([{
      role: "assistant", content: "Avec plaisir. Quel autre sujet souhaitez-vous aborder ?",
    }]);
    setAskAnotherTopic(false);
    setOfferTicket(false);
    setOfferId(null);
    setTurnToken(null);
    setPendingFiles([]);
    setInput("");
  };

  const closeConversation = () => {
    setAskAnotherTopic(false);
    setConversationClosed(true);
    setTurnToken(null);
    setOfferId(null);
    setPendingFiles([]);
    setMessages(previous => [...previous, {
      role: "assistant", content: "Merci d'avoir échangé avec BIB. Je vous souhaite une excellente continuation. 🙇",
    }]);
  };

  const restartConversation = () => {
    setConversationClosed(false);
    continueWithNewTopic();
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          aria-label={translateUi("Ouvrir l'assistant support")}
          className={cn(
            "fixed bottom-4 right-4 z-50 min-h-14 max-w-[calc(100vw-2rem)] rounded-full px-4 py-3 shadow-xl ring-2 ring-secondary/40 sm:bottom-6 sm:right-6",
            "bg-primary hover:bg-primary/90 text-primary-foreground",
            "flex items-center justify-center gap-2.5",
            className,
          )}
        >
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-foreground/15">
            <Bot className="h-5 w-5" aria-hidden="true" />
          </span>
          <span className="flex flex-col items-start leading-tight">
            <span className="text-sm font-bold">{translateUi("Assistant BIB")}</span>
            <span className="text-[11px] opacity-90">{translateUi("Besoin d’aide ?")}</span>
          </span>
        </Button>
      </SheetTrigger>
      <SheetContent
        side="right"
        className="flex h-full w-full min-w-0 flex-col p-0 sm:max-w-md"
      >
        <SheetHeader className="border-b bg-muted/25 p-4 pr-12">
          <SheetTitle className="flex items-center gap-2 text-base">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground"><Bot className="h-5 w-5" /></span>
            {translateUi("Assistant BIB · Support")}
          </SheetTitle>
          <p className="text-xs text-muted-foreground">
            {translateUi(
              "Conseils sur BIB · possibilité de contacter le support humain",
            )}
          </p>
        </SheetHeader>

        <div ref={scrollRef} className="min-h-0 min-w-0 flex-1 overflow-y-auto p-4 space-y-3">
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
          {offerTicket && offerId && !loading && (
            <div className="space-y-2 rounded-xl border border-border/70 bg-muted/30 p-3" role="group" aria-label={translateUi("Confirmer l'ouverture d'un ticket")}>
              <p className="text-xs text-muted-foreground">
                {translateUi("Le ticket ne sera ouvert que si vous choisissez Oui.")}
              </p>
              <div className="flex flex-wrap gap-2">
                <Button type="button" size="sm" onClick={confirmTicket} className="gap-1.5">
                  <Ticket className="h-4 w-4" /> {translateUi("Oui, ouvrir un ticket")}
                </Button>
                <Button type="button" size="sm" variant="outline" onClick={declineTicket}>
                  {translateUi("Non, pas de ticket")}
                </Button>
              </div>
            </div>
          )}
          {askAnotherTopic && !loading && !conversationClosed && (
            <div className="space-y-2 rounded-xl border border-border/70 p-3" role="group" aria-label={translateUi("Aborder un autre sujet")}>
              <p className="text-sm font-medium">{translateUi("Souhaitez-vous aborder un autre sujet ?")}</p>
              <div className="flex flex-wrap gap-2">
                <Button type="button" size="sm" onClick={continueWithNewTopic}>
                  {translateUi("Oui, un autre sujet")}
                </Button>
                <Button type="button" size="sm" variant="outline" onClick={closeConversation}>
                  {translateUi("Non, merci")}
                </Button>
              </div>
            </div>
          )}
          {conversationClosed && !loading && (
            <Button type="button" size="sm" variant="outline" onClick={restartConversation}>
              {translateUi("Nouvelle conversation")}
            </Button>
          )}
          {!offerTicket && !askAnotherTopic && !conversationClosed && !loading && messages.length > 2 && messages[messages.length - 1]?.role === "assistant" && (
            <Button type="button" size="sm" variant="ghost" className="text-xs text-muted-foreground" onClick={finishTopic}>
              {translateUi("Ce sujet est résolu")}
            </Button>
          )}
          {loading && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Loader2 className="w-3 h-3 animate-spin" />{" "}
              {translateUi("L'assistant rédige…")}
            </div>
          )}
        </div>

        <div className="min-w-0 border-t p-3 flex items-end gap-2">
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            multiple
            accept="image/*,application/pdf,.doc,.docx,.txt"
            onChange={(e) => {
              const files = Array.from(e.target.files ?? []);
              const max = 5 * 1024 * 1024; // 5 MB
              const ok = files.filter((f) => f.size <= max);
              if (ok.length < files.length) {
                toast.error(translateUi("Fichier trop volumineux (>5 Mo)"));
              }
              setPendingFiles((prev) => [...prev, ...ok].slice(0, 5));
              if (fileInputRef.current) fileInputRef.current.value = "";
            }}
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => fileInputRef.current?.click()}
            disabled={loading || offerTicket || askAnotherTopic || conversationClosed}
            aria-label={translateUi("Joindre un fichier")}
          >
            <Paperclip className="w-4 h-4" />
          </Button>
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={translateUi("Votre question…")}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send();
              }
            }}
            disabled={loading || offerTicket || askAnotherTopic || conversationClosed}
          />
          <Button
            onClick={send}
            disabled={loading || offerTicket || askAnotherTopic || conversationClosed || !input.trim()}
            size="icon"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
        {pendingFiles.length > 0 && (
          <div className="border-t px-3 py-2 flex flex-wrap gap-1.5">
            {pendingFiles.map((f, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1 text-xs bg-muted rounded-full px-2 py-0.5"
              >
                <Paperclip className="w-3 h-3" />
                <span className="max-w-[140px] truncate">{f.name}</span>
                <button
                  type="button"
                  onClick={() =>
                    setPendingFiles((prev) =>
                      prev.filter((_, idx) => idx !== i),
                    )
                  }
                  className="ml-1 hover:text-destructive"
                  aria-label={translateUi("Retirer")}
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
            <span className="text-[10px] text-muted-foreground self-center">
              {translateUi(
                "Les fichiers seront envoyés dès la création du ticket.",
              )}
            </span>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
