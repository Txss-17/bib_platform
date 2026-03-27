import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

async function callSync(action: string, data?: any) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error("Non authentifié");

  const res = await supabase.functions.invoke("linksy-connect-sync", {
    body: { action, data },
  });

  if (res.error) throw res.error;
  return res.data;
}

export function useConnectStatus() {
  return useQuery({
    queryKey: ["connect-status"],
    queryFn: () => callSync("sync-status"),
    refetchInterval: 60000,
  });
}

export function useSyncOrders() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => callSync("sync-orders"),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["connect-status"] }),
  });
}

export function useSyncFinancials() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => callSync("sync-financials"),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["connect-status"] }),
  });
}

export function useConnectCatalog() {
  return useQuery({
    queryKey: ["connect-catalog"],
    queryFn: () => callSync("fetch-catalog"),
  });
}

export function useConnectTickets() {
  return useQuery({
    queryKey: ["connect-tickets"],
    queryFn: () => callSync("fetch-tickets"),
  });
}

export function useCreateTicket() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { subject: string; content: string; email: string; name?: string }) =>
      callSync("create-ticket", data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["connect-tickets"] }),
  });
}

export function useConnectIncidents() {
  return useQuery({
    queryKey: ["connect-incidents"],
    queryFn: () => callSync("fetch-incidents"),
  });
}

export function useConnectSuppliers() {
  return useQuery({
    queryKey: ["connect-suppliers"],
    queryFn: () => callSync("fetch-suppliers"),
  });
}
