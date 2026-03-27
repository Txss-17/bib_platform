import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import {
  RefreshCw, CheckCircle, XCircle, ArrowUpDown, Package, CreditCard,
  MessageSquare, AlertTriangle, Truck, Loader2, Send, Clock, Zap,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import {
  useConnectStatus, useSyncOrders, useSyncFinancials,
  useConnectCatalog, useConnectTickets, useCreateTicket,
  useConnectIncidents, useConnectSuppliers, useTriggerAutoSync,
} from "@/hooks/useLinksyConnect";

function StatusBadge({ connected }: { connected: boolean }) {
  return connected ? (
    <Badge className="bg-green-500/10 text-green-500 gap-1"><CheckCircle className="w-3 h-3" /> Connecté</Badge>
  ) : (
    <Badge variant="destructive" className="gap-1"><XCircle className="w-3 h-3" /> Déconnecté</Badge>
  );
}

export default function LinksyConnect() {
  const { data: status, isLoading: statusLoading } = useConnectStatus();
  const syncOrders = useSyncOrders();
  const syncFinancials = useSyncFinancials();
  const { data: catalogData, isLoading: catalogLoading } = useConnectCatalog();
  const { data: ticketsData, isLoading: ticketsLoading } = useConnectTickets();
  const { data: incidentsData, isLoading: incidentsLoading } = useConnectIncidents();
  const { data: suppliersData, isLoading: suppliersLoading } = useConnectSuppliers();
  const createTicket = useCreateTicket();
  const autoSync = useTriggerAutoSync();

  const [ticketForm, setTicketForm] = useState({ subject: "", content: "", email: "", name: "" });

  const handleAutoSync = async () => {
    try {
      const result = await autoSync.mutateAsync();
      toast.success(`Sync auto terminée : ${result.orders?.synced || 0} commandes, ${result.financials?.synced || 0} paiements`);
    } catch { toast.error("Erreur de synchronisation automatique"); }
  };

  const handleSyncOrders = async () => {
    try {
      const result = await syncOrders.mutateAsync();
      toast.success(`${result.synced}/${result.total} commandes synchronisées`);
    } catch { toast.error("Erreur de synchronisation des commandes"); }
  };

  const handleSyncFinancials = async () => {
    try {
      const result = await syncFinancials.mutateAsync();
      toast.success(`${result.synced}/${result.total} paiements synchronisés`);
    } catch { toast.error("Erreur de synchronisation financière"); }
  };

  const handleCreateTicket = async () => {
    if (!ticketForm.subject || !ticketForm.content || !ticketForm.email) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }
    try {
      await createTicket.mutateAsync(ticketForm);
      toast.success("Ticket créé avec succès");
      setTicketForm({ subject: "", content: "", email: "", name: "" });
    } catch { toast.error("Erreur lors de la création du ticket"); }
  };

  return (
    <DashboardLayout title="LINKSY Connect" subtitle="Synchronisation avec votre système de gestion interne">
      {/* Status Card */}
      <Card className="mb-6 bg-card border-border/50">
        <CardContent className="p-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <ArrowUpDown className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h3 className="font-bold text-foreground text-lg">Statut de connexion</h3>
                <p className="text-sm text-muted-foreground">
                  {statusLoading ? "Vérification..." : status?.connected
                    ? `Connecté • ${status.connect_orders} commandes dans Connect`
                    : status?.error || "Non connecté"}
                </p>
              </div>
            </div>
            {statusLoading ? <Skeleton className="h-6 w-24" /> : <StatusBadge connected={status?.connected} />}
          </div>
        </CardContent>
      </Card>

      {/* Auto Sync */}
      <Card className="mb-6 bg-accent/5 border-accent/20">
        <CardContent className="p-6 flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
              <Zap className="w-5 h-5 text-accent-foreground" />
            </div>
            <div>
              <p className="font-medium text-foreground">Synchronisation automatique</p>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="w-3 h-3" /> Toutes les 2 heures (commandes + finances)
              </p>
            </div>
          </div>
          <Button onClick={handleAutoSync} disabled={autoSync.isPending} variant="outline">
            {autoSync.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <RefreshCw className="w-4 h-4 mr-2" />}
            Lancer maintenant
          </Button>
        </CardContent>
      </Card>

      {/* Sync Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <Card className="bg-card border-border/50">
          <CardContent className="p-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Package className="w-5 h-5 text-primary" />
              <div>
                <p className="font-medium text-foreground">Synchroniser les commandes</p>
                <p className="text-xs text-muted-foreground">Business OS → Connect</p>
              </div>
            </div>
            <Button size="sm" onClick={handleSyncOrders} disabled={syncOrders.isPending}>
              {syncOrders.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
              <span className="ml-2">Sync</span>
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-card border-border/50">
          <CardContent className="p-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CreditCard className="w-5 h-5 text-primary" />
              <div>
                <p className="font-medium text-foreground">Synchroniser les finances</p>
                <p className="text-xs text-muted-foreground">Paiements → Cashflows</p>
              </div>
            </div>
            <Button size="sm" onClick={handleSyncFinancials} disabled={syncFinancials.isPending}>
              {syncFinancials.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
              <span className="ml-2">Sync</span>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="catalog" className="space-y-4">
        <TabsList className="w-full flex flex-wrap">
          <TabsTrigger value="catalog" className="flex-1 gap-1"><Truck className="w-4 h-4" /> Catalogue</TabsTrigger>
          <TabsTrigger value="tickets" className="flex-1 gap-1"><MessageSquare className="w-4 h-4" /> Tickets</TabsTrigger>
          <TabsTrigger value="incidents" className="flex-1 gap-1"><AlertTriangle className="w-4 h-4" /> Incidents</TabsTrigger>
          <TabsTrigger value="suppliers" className="flex-1 gap-1"><Package className="w-4 h-4" /> Fournisseurs</TabsTrigger>
        </TabsList>

        {/* Catalog Tab */}
        <TabsContent value="catalog">
          <Card className="bg-card border-border/50">
            <CardHeader>
              <CardTitle>Catalogue Connect</CardTitle>
              <CardDescription>Produits disponibles depuis LINKSY Connect</CardDescription>
            </CardHeader>
            <CardContent>
              {catalogLoading ? (
                <div className="space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-12 w-full" />)}</div>
              ) : !catalogData?.products?.length ? (
                <p className="text-muted-foreground text-center py-8">Aucun produit trouvé dans Connect</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Produit</TableHead>
                      <TableHead>Catégorie</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead className="text-right">Prix</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {catalogData.products.slice(0, 20).map((p: any) => (
                      <TableRow key={p.id}>
                        <TableCell className="font-medium">{p.name}</TableCell>
                        <TableCell>{p.category || "—"}</TableCell>
                        <TableCell>
                          <Badge variant={p.status === "active" ? "default" : "secondary"}>{p.status || "—"}</Badge>
                        </TableCell>
                        <TableCell className="text-right">{p.price ? `${p.price} €` : "—"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tickets Tab */}
        <TabsContent value="tickets">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-card border-border/50">
              <CardHeader>
                <CardTitle>Tickets de support</CardTitle>
              </CardHeader>
              <CardContent>
                {ticketsLoading ? (
                  <div className="space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-12 w-full" />)}</div>
                ) : !ticketsData?.tickets?.length ? (
                  <p className="text-muted-foreground text-center py-8">Aucun ticket</p>
                ) : (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {ticketsData.tickets.map((t: any) => (
                      <div key={t.id} className="p-3 rounded-lg bg-muted/50 border border-border/30">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="font-medium text-sm text-foreground">{t.subject}</p>
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{t.content}</p>
                          </div>
                          <Badge variant={t.status === "resolved" ? "default" : "outline"} className="shrink-0 text-xs">
                            {t.status || "pending"}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">{new Date(t.created_at).toLocaleDateString("fr-FR")}</p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="bg-card border-border/50">
              <CardHeader>
                <CardTitle>Créer un ticket</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input placeholder="Votre nom" value={ticketForm.name}
                  onChange={e => setTicketForm(f => ({ ...f, name: e.target.value }))} />
                <Input placeholder="Email *" type="email" value={ticketForm.email}
                  onChange={e => setTicketForm(f => ({ ...f, email: e.target.value }))} />
                <Input placeholder="Sujet *" value={ticketForm.subject}
                  onChange={e => setTicketForm(f => ({ ...f, subject: e.target.value }))} />
                <Textarea placeholder="Description du problème *" rows={4} value={ticketForm.content}
                  onChange={e => setTicketForm(f => ({ ...f, content: e.target.value }))} />
                <Button onClick={handleCreateTicket} disabled={createTicket.isPending} className="w-full">
                  {createTicket.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Send className="w-4 h-4 mr-2" />}
                  Envoyer le ticket
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Incidents Tab */}
        <TabsContent value="incidents">
          <Card className="bg-card border-border/50">
            <CardHeader>
              <CardTitle>Incidents logistiques</CardTitle>
              <CardDescription>Incidents remontés depuis LINKSY Connect</CardDescription>
            </CardHeader>
            <CardContent>
              {incidentsLoading ? (
                <div className="space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-12 w-full" />)}</div>
              ) : !incidentsData?.incidents?.length ? (
                <p className="text-muted-foreground text-center py-8">Aucun incident</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Type</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Sévérité</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {incidentsData.incidents.map((inc: any) => (
                      <TableRow key={inc.id}>
                        <TableCell className="font-medium">{inc.incident_type}</TableCell>
                        <TableCell className="max-w-xs truncate">{inc.description}</TableCell>
                        <TableCell>
                          <Badge variant={inc.severity === "critical" ? "destructive" : "outline"}>{inc.severity || "—"}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={inc.status === "resolved" ? "default" : "secondary"}>{inc.status || "—"}</Badge>
                        </TableCell>
                        <TableCell>{new Date(inc.created_at).toLocaleDateString("fr-FR")}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Suppliers Tab */}
        <TabsContent value="suppliers">
          <Card className="bg-card border-border/50">
            <CardHeader>
              <CardTitle>Fournisseurs certifiés</CardTitle>
              <CardDescription>Liste des fournisseurs depuis LINKSY Connect</CardDescription>
            </CardHeader>
            <CardContent>
              {suppliersLoading ? (
                <div className="space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-12 w-full" />)}</div>
              ) : !suppliersData?.suppliers?.length ? (
                <p className="text-muted-foreground text-center py-8">Aucun fournisseur trouvé</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nom</TableHead>
                      <TableHead>Pays</TableHead>
                      <TableHead>Note</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead>Contact</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {suppliersData.suppliers.map((s: any) => (
                      <TableRow key={s.id}>
                        <TableCell className="font-medium">{s.name}</TableCell>
                        <TableCell>{s.country || "—"}</TableCell>
                        <TableCell>{s.rating ? `${s.rating}/5` : "—"}</TableCell>
                        <TableCell>
                          <Badge variant={s.status === "active" ? "default" : "secondary"}>{s.status || "—"}</Badge>
                        </TableCell>
                        <TableCell className="text-sm">{s.contact_email || "—"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
}
