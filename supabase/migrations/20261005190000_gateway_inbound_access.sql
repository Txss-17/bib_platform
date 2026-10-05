-- ============================================================
-- BIB Gateway — accès aux messages entrants non attribués
-- ============================================================
--
-- Un message entrant arrive d'abord avec :
--   status = 'pending'
--   routed_to_pole = NULL
--
-- Il doit être visible dans Gateway avant son attribution.
--
-- Gateway est transversal : les collaborateurs disposant d'un
-- pôle BIB peuvent consulter les messages Gateway.
-- ============================================================

DROP POLICY IF EXISTS "Gateway staff can view external messages"
ON public.external_messages;

CREATE POLICY "Gateway staff can view external messages"
ON public.external_messages
FOR SELECT
TO authenticated
USING (
  public.is_leadership(auth.uid())
  OR public.has_role(auth.uid(), 'admin')
  OR public.has_role(auth.uid(), 'manager')
  OR public.has_any_pole(
    auth.uid(),
    ARRAY[
      'direction',
      'finance',
      'ops',
      'supplier',
      'marketplace',
      'support',
      'marketing',
      'rh',
      'audit',
      'compliance',
      'rse',
      'product',
      'data',
      'security'
    ]
  )
);
