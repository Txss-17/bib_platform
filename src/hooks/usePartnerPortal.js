 function _nullishCoalesce(lhs, rhsFn) { if (lhs != null) { return lhs; } else { return rhsFn(); } }import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";















































export function usePartnerPortal(token) {
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
    const client = supabase 

;
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
    const row = (Array.isArray(rows) ? rows[0] : rows) 



;
    setData({
      submission: row.submission,
      documents: _nullishCoalesce(row.documents, () => ( [])),
      events: _nullishCoalesce(row.events, () => ( [])),
    });
  }, [token]);

  useEffect(() => {
    load();
  }, [load]);

  const callAction = useCallback(
    async (body) => {
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