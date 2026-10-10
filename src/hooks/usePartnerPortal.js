import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
function usePartnerPortal(token) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const load = useCallback(async () => {
    if (!token) {
      setError("Lien invalide.");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    const client = supabase;
    const { data: rows, error: err } = await client.rpc("partner_load_operational_portal", {
      _access_token: token
    });
    setLoading(false);
    if (err || !rows || Array.isArray(rows) && rows.length === 0) {
      setError(
        "Dossier introuvable ou pas encore valid\xE9. L'acc\xE8s op\xE9rationnel s'ouvre apr\xE8s validation par l'\xE9quipe Ops."
      );
      return;
    }
    const row = Array.isArray(rows) ? rows[0] : rows;
    setData({
      submission: row.submission,
      documents: row.documents ?? [],
      events: row.events ?? []
    });
  }, [token]);
  useEffect(() => {
    load();
  }, [load]);
  const callAction = useCallback(
    async (body) => {
      const res = await supabase.functions.invoke("partner-portal-action", {
        body: { access_token: token, ...body }
      });
      if (res.error) throw new Error(res.error.message);
      await load();
      return res.data;
    },
    [token, load]
  );
  return { data, loading, error, reload: load, callAction };
}
export {
  usePartnerPortal
};
