import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Send, CheckCircle2 } from "lucide-react";

function getSchema(english: boolean) {
  return z.object({
    company: z.string().trim().min(2, english ? "Company name is required" : "Nom de société requis").max(120),
    contact_name: z.string().trim().min(2, english ? "Contact name is required" : "Nom du contact requis").max(120),
    email: z.string().trim().email(english ? "Invalid email" : "Email invalide").max(255),
    phone: z.string().trim().max(40).optional().or(z.literal("")),
    message: z.string().trim().min(10, english ? "Please describe your request (10 characters minimum)" : "Décrivez votre besoin (10 caractères min.)").max(2000),
  });
}


interface PartnerContactFormProps {
  /** "suppliers" | "ops" — drives subject + summary tag */
  portal: "suppliers" | "ops";
}

export function PartnerContactForm({ portal }: PartnerContactFormProps) {
  const { toast } = useToast();
  const { lang } = useLanguage();
  const english = lang === "en";
  const tx = (fr: string, en: string) => english ? en : fr;
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const parsed = getSchema(english).safeParse({
      company: data.get("company"),
      contact_name: data.get("contact_name"),
      email: data.get("email"),
      phone: data.get("phone") ?? "",
      message: data.get("message"),
    });
    if (!parsed.success) {
      toast({
        title: tx("Formulaire incomplet", "Incomplete form"),
        description: parsed.error.issues[0]?.message ?? tx("Vérifiez les champs", "Check the form fields"),
        variant: "destructive",
      });
      return;
    }
    setSubmitting(true);
    const portalLabel = portal === "suppliers" ? "Supplier" : "Operations / Logistics";
    const subject = `[${portalLabel}] ${tx("Demande de partenariat", "Partnership request")} — ${parsed.data.company}`;
    const message =
      `Société : ${parsed.data.company}\n` +
      `Contact : ${parsed.data.contact_name}\n` +
      `Email : ${parsed.data.email}\n` +
      `Téléphone : ${parsed.data.phone || "—"}\n\n` +
      `${parsed.data.message}`;

    const { error } = await supabase.from("support_tickets").insert({
      source: "partner_inquiry",
      contact_email: parsed.data.email,
      contact_name: parsed.data.contact_name,
      subject,
      message,
      boutique_id: null,
    } as any);

    setSubmitting(false);
    if (error) {
      toast({
        title: tx("Envoi impossible", "Unable to submit"),
        description: tx("Réessayez ou contactez sales@brand-in-a-box.space", "Try again or contact sales@brand-in-a-box.space"),
        variant: "destructive",
      });
      return;
    }
    setDone(true);
    toast({ title: tx("Demande envoyée", "Request sent"), description: tx("Notre équipe vous contactera sous 48h.", "Our team will contact you within 48 hours.") });
  }

  if (done) {
    return (
      <Card className="p-8 text-center space-y-3 bg-success/5 border-success/30">
        <CheckCircle2 className="w-10 h-10 text-success mx-auto" />
        <h3 className="font-display text-xl">{tx("Merci pour votre demande", "Thank you for your request")}</h3>
        <p className="text-sm text-muted-foreground">
          {tx("Notre équipe partenaires vous répond sous 48h ouvrées.", "Our partner team will reply within 2 business days.")}
        </p>
      </Card>
    );
  }

  return (
    <Card className="p-6 sm:p-8">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="company">{tx("Société *", "Company *")}</Label>
            <Input id="company" name="company" required maxLength={120} placeholder="Atelier Dupont" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="contact_name">{tx("Nom du contact *", "Contact name *")}</Label>
            <Input id="contact_name" name="contact_name" required maxLength={120} placeholder="Marie Dupont" />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="email">Email *</Label>
            <Input id="email" name="email" type="email" required maxLength={255} placeholder="contact@societe.com" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="phone">{tx("Téléphone", "Phone")}</Label>
            <Input id="phone" name="phone" type="tel" maxLength={40} placeholder="+33 6 12 34 56 78" />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="message">
            {portal === "suppliers"
              ? tx("Catégorie de produits, MOQ, capacités logistiques, certifications…", "Product categories, MOQs, logistics capacity, certifications…")
              : tx("Réseau, zones couvertes, capacités d'entreposage, intégrations existantes…", "Network, service areas, storage capacity, existing integrations…")}
            {" *"}
          </Label>
          <Textarea id="message" name="message" required minLength={10} maxLength={2000} rows={6} />
        </div>
        <Button type="submit" disabled={submitting} variant="coral" size="lg" className="w-full sm:w-auto">
          {submitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
          {tx("Envoyer ma demande", "Submit my request")}
        </Button>
        <p className="text-xs text-muted-foreground">
          {tx("En soumettant, vous acceptez d'être recontacté par l'équipe Brand-In-A-Box.", "By submitting, you agree to be contacted by the Brand-In-A-Box team.")}
        </p>
      </form>
    </Card>
  );
}