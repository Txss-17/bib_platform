import { useMemo, useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { useBoutiques } from "@/hooks/useBoutiques";
import { useCustomers, useUpdateCustomer, type BoutiqueCustomer } from "@/hooks/useCustomers";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Users, Search, Download, Mail, ShoppingBag, Euro, Sparkles } from "lucide-react";
import { exportToCSV } from "@/lib/exportUtils";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";

const fmtCents = (c: number) => (c / 100).toLocaleString("fr-FR", { style: "currency", currency: "EUR" });

export default function Clients() {
  const navigate = useNavigate();
  const { data: boutiques = [] } = useBoutiques();
  const [boutiqueId, setBoutiqueId] = useState<string>("");
  const activeId = boutiqueId || boutiques[0]?.id || "";
  const { data: customers = [], isLoading } = useCustomers(activeId);
  const updateCustomer = useUpdateCustomer();

  const [search, setSearch] = useState("");
  const [optInOnly, setOptInOnly] = useState(false);

  const filtered = useMemo(() => {
    return customers.filter((c) => {
      if (optInOnly && !c.marketing_opt_in) return false;
      if (search) {
        const s = search.toLowerCase();
        if (
          !c.email.toLowerCase().includes(s) &&
          !(c.full_name ?? "").toLowerCase().includes(s)
        ) return false;
      }
      return true;
    });
  }, [customers, search, optInOnly]);

  const stats = useMemo(() => ({
    total: customers.length,
    optIn: customers.filter((c) => c.marketing_opt_in).length,
    revenue: customers.reduce((s, c) => s + c.total_spent_cents, 0),
    avgBasket: customers.length
      ? customers.reduce((s, c) => s + c.total_spent_cents, 0) /
        Math.max(1, customers.reduce((s, c) => s + c.orders_count, 0))
      : 0,
  }), [customers]);

  const handleExport = () => {
    exportToCSV(
      filtered,
      [
        { header: "Email", accessor: (r) => r.email },
        { header: "Nom", accessor: (r) => r.full_name ?? "" },
        { header: "Ville", accessor: (r) => r.city ?? "" },
        { header: "Commandes", accessor: (r) => String(r.orders_count) },
        { header: "Dépensé (€)", accessor: (r) => (r.total_spent_cents / 100).toFixed(2) },
        { header: "Dernière commande", accessor: (r) => r.last_order_at ?? "" },
        { header: "Opt-in", accessor: (r) => (r.marketing_opt_in ? "oui" : "non") },
        { header: "Source", accessor: (r) => r.source },
      ],
      `clients-${activeId}`,
    );
    toast({ title: "Export CSV généré" });
  };

  return (
    <DashboardLayout>
      <div className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl font-display font-bold text-foreground flex items-center gap-2">
              <Users className="w-6 h-6 text-primary" /> Clients
            </h1>
            <p className="text-sm text-muted-foreground">
              Base alimentée automatiquement à chaque commande payée + opt-in newsletter.
            </p>
          </div>
          <div className="flex gap-2 items-center">
            {boutiques.length > 1 && (
              <Select value={activeId} onValueChange={setBoutiqueId}>
                <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {boutiques.map((b: any) => (
                    <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            <Button variant="outline" size="sm" onClick={handleExport} disabled={!filtered.length}>
              <Download className="w-4 h-4 mr-2" /> CSV
            </Button>
            <Button size="sm" onClick={() => navigate("/dashboard/marketing")}>
              <Sparkles className="w-4 h-4 mr-2" /> Envoyer une campagne
            </Button>
          </div>
        </div>

        {/* KPI */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <KpiTile icon={Users} label="Contacts" value={stats.total.toString()} />
          <KpiTile icon={Mail} label="Opt-in marketing" value={`${stats.optIn} / ${stats.total}`} />
          <KpiTile icon={Euro} label="CA cumulé" value={fmtCents(stats.revenue)} />
          <KpiTile icon={ShoppingBag} label="Panier moyen" value={fmtCents(stats.avgBasket)} />
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-3 flex flex-wrap items-center gap-2">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Recherche email ou nom…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-9"
              />
            </div>
            <label className="flex items-center gap-2 text-sm">
              <Switch checked={optInOnly} onCheckedChange={setOptInOnly} /> Opt-in only
            </label>
          </CardContent>
        </Card>

        {/* Table */}
        <Card>
          <CardContent className="p-0 overflow-x-auto">
            {isLoading ? (
              <div className="p-4 space-y-2">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-10" />)}</div>
            ) : filtered.length === 0 ? (
              <div className="p-10 text-center text-muted-foreground">
                <Users className="w-10 h-10 mx-auto mb-3 opacity-30" />
                Aucun client pour cette boutique.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Client</TableHead>
                    <TableHead>Commandes</TableHead>
                    <TableHead>Dépensé</TableHead>
                    <TableHead>Dernière cmd</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead className="text-right">Opt-in</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.slice(0, 200).map((c) => (
                    <TableRow key={c.id}>
                      <TableCell>
                        <div className="font-medium text-foreground">{c.full_name || "—"}</div>
                        <div className="text-xs text-muted-foreground">{c.email}</div>
                      </TableCell>
                      <TableCell><Badge variant="secondary">{c.orders_count}</Badge></TableCell>
                      <TableCell className="font-semibold">{fmtCents(c.total_spent_cents)}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {c.last_order_at ? new Date(c.last_order_at).toLocaleDateString("fr-FR") : "—"}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-[10px]">{c.source}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Switch
                          checked={c.marketing_opt_in}
                          onCheckedChange={(v) =>
                            updateCustomer.mutate({
                              id: c.id,
                              patch: { marketing_opt_in: v, ...(v ? { opt_in_at: new Date().toISOString() } as any : {}) },
                            })
                          }
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {filtered.length > 200 && (
          <p className="text-xs text-muted-foreground text-center">
            Affichage limité à 200 lignes — utilisez l'export CSV pour la liste complète.
          </p>
        )}
      </div>
    </DashboardLayout>
  );
}

function KpiTile({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <Card>
      <CardContent className="p-4 flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
          <Icon className="w-5 h-5 text-primary" />
        </div>
        <div className="min-w-0">
          <div className="text-xs text-muted-foreground">{label}</div>
          <div className="text-lg font-bold text-foreground truncate">{value}</div>
        </div>
      </CardContent>
    </Card>
  );
}