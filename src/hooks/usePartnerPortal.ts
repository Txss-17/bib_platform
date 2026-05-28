import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface PortalSubmission {
  id: string;
  portal: "suppliers" | "ops";
  contact_email: string;
  contact_name: string | null;
  company: string | null;
  status: string;
  payload: Record<string, unknown>;
  approved_at: string | null;
  submitted_at: string | null;
}

export interface PortalDocument {
  id: string;
  category: string;
  file_name: string;
  storage_path: string;
  mime_type: string | null;
  byte_size: number | null;
  status: "received" | "validated" | "rejected";
  created_at: string;
}

export interface PortalEvent {
  id: string;
  portal: "suppliers" | "ops";
  kind:
    | "catalog_draft"
    | "moq_request"
    | "issue_report"
    | "delivery_update"
    | "packaging_alert"
    | "return_logged";
  title: string;
  payload: Record<string, unknown>;
  status: "open" | "in_progress" | "resolved" | "rejected";
  created_at: string;
  updated_at: string;
}

export interface PortalData {
  submission: PortalSubmission;
  documents: PortalDocument[];
  events: PortalEvent[];
}

export function usePartnerPortal(token: string | undefined) {
  const [data, setData] = useState<PortalData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!token) {
      setError("Lien invalide.");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    const client = supabase as unknown as {
      rpc: (fn: string, p: Record<string, unknown>) => Promise<{ data: unknown; error: unknown }>;
    };
    const { data: rows, error: err } = await client.rpc("partner_load_operational_portal", {
      _access_token: token,
    });
    setLoading(false);
    if (err || !rows || (Array.isArray(rows) && rows.length === 0)) {
      setError(
        "Dossier introuvable ou pas encore validé. L'accès opérationnel s'ouvre après validation par l'équipe Ops.",
      );
      return;
    }
    const row = (Array.isArray(rows) ? rows[0] : rows) as {
      submission: PortalSubmission;
      documents: PortalDocument[] | null;
      events: PortalEvent[] | null;
    };
    setData({
      submission: row.submission,
      documents: row.documents ?? [],
      events: row.events ?? [],
    });
  }, [token]);

  useEffect(() => {
    load();
  }, [load]);

  const callAction = useCallback(
    async (body: Record<string, unknown>) => {
      const res = await supabase.functions.invoke("partner-portal-action", {
        body: { access_token: token, ...body },
      });
      if (res.error) throw new Error(res.error.message);
      await load();
      return res.data;
    },
    [token, load],
  );

  return { data, loading, error, reload: load, callAction };
}