import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import {
  Plus, Star, TrendingUp, TrendingDown, Minus, Package, Palette,
  Play, Image as ImageIcon, ChevronLeft, ChevronRight, Info, BarChart3,
  MessageSquare, Paintbrush, ShieldCheck, Calculator
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";
import type { Tables } from "@/integrations/supabase/types";

type SupplierProduct = Tables<"supplier_products">;
type RotationIndicator = "green" | "yellow" | "orange" | "red";

const rotationConfig: Record<RotationIndicator, { label: string; color: string; badgeClass: string }> = {
  green: { label: "Demande Élevée", color: "bg-green-500", badgeClass: "bg-green-500/15 text-green-700 border-green-200" },
  yellow: { label: "Demande Modérée", color: "bg-yellow-500", badgeClass: "bg-yellow-500/15 text-yellow-700 border-yellow-200" },
  orange: { label: "Demande Faible", color: "bg-orange-500", badgeClass: "bg-orange-500/15 text-orange-700 border-orange-200" },
  red: { label: "Très Utilisé", color: "bg-red-500", badgeClass: "bg-blue-500/15 text-blue-700 border-blue-200" },
};

// Mock performance data derived from product
function generatePerformanceData(product: SupplierProduct) {
  const history = product.performance_history as any[] | null;
  if (history && history.length > 0) return history;
  
  const months = ["Jan", "Fév", "Mar", "Avr", "Mai", "Jun"];
  const base = product.rotation_indicator === "green" ? 80 : product.rotation_indicator === "yellow" ? 50 : 30;
  return months.map((m, i) => ({
    month: m,
    ventes: Math.round(base + Math.random() * 40 - 10 + i * 3),
    demande: Math.round(base + 10 + Math.random() * 30 + i * 2),
  }));
}

// Mock reviews
function generateReviews(product: SupplierProduct) {
  const names = ["Sophie M.", "Karim B.", "Marie L.", "Jean-Pierre D.", "Fatou S."];
  const comments = [
    "Excellent produit, mes clients adorent. La qualité est au rendez-vous.",
    "Bon rapport qualité-prix. Livraison rapide via la plateforme.",
    "Se vend très bien dans ma boutique, je recommande.",
    "Correct mais l'emballage pourrait être amélioré.",
    "Très satisfait, je renouvelle ma commande régulièrement.",
  ];
  const baseRating = product.rotation_indicator === "green" ? 4.5 : product.rotation_indicator === "yellow" ? 4.0 : 3.5;
  
  return names.slice(0, 3 + Math.floor(Math.random() * 2)).map((name, i) => ({
    id: i,
    author: name,
    rating: Math.min(5, Math.max(3, Math.round((baseRating + (Math.random() - 0.5)) * 2) / 2)),
    comment: comments[i],
    date: `${Math.floor(Math.random() * 28) + 1}/0${Math.floor(Math.random() * 3) + 1}/2025`,
    verified: Math.random() > 0.3,
  }));
}

function StarRating({ rating, size = "sm" }: { rating: number; size?: "sm" | "md" }) {
  const sizeClass = size === "md" ? "w-4 h-4" : "w-3 h-3";
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <Star
          key={i}
          className={`${sizeClass} ${i <= rating ? "fill-yellow-400 text-yellow-400" : i - 0.5 <= rating ? "fill-yellow-400/50 text-yellow-400" : "text-muted-foreground/30"}`}
        />
      ))}
    </div>
  );
}

interface ProductDetailDialogProps {
  product: SupplierProduct;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProductDetailDialog({ product, open, onOpenChange }: ProductDetailDialogProps) {
  const rotation = rotationConfig[product.rotation_indicator as RotationIndicator];
  const perfData = generatePerformanceData(product);
  const reviews = generateReviews(product);
  const avgRating = reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;
  const [margin, setMargin] = useState(20);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [customNote, setCustomNote] = useState("");

  const sellingPrice = product.base_price * (1 + margin / 100);
  const profit = sellingPrice - product.base_price;

  // Mock gallery (main image + placeholders)
  const gallery = [
    product.image_url || null,
    null, // placeholder for additional images
    null,
  ].filter(Boolean) as string[];

  const isCustomizable = product.category.toLowerCase() === "mode" || product.category.toLowerCase() === "maison";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] sm:max-w-3xl max-h-[90vh] overflow-y-auto p-0">
        {/* Header with image + key info */}
        <div className="flex flex-col sm:flex-row">
          {/* Media section */}
          <div className="sm:w-[45%] bg-muted relative">
            <AspectRatio ratio={1}>
              {product.image_url ? (
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ImageIcon className="w-12 h-12 text-muted-foreground/40" />
                </div>
              )}
            </AspectRatio>
            {/* Category badge */}
            <span className="absolute top-3 left-3 bg-background/80 backdrop-blur-sm text-xs font-medium px-2 py-1 rounded-md">
              {product.category}
            </span>
            {/* Thumbnail strip */}
            {gallery.length > 1 && (
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                {gallery.map((_, i) => (
                  <button
                    key={i}
                    className={`w-2 h-2 rounded-full transition-colors ${i === selectedImageIndex ? "bg-primary" : "bg-background/60"}`}
                    onClick={() => setSelectedImageIndex(i)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Key info */}
          <div className="flex-1 p-4 sm:p-6 space-y-3">
            <DialogHeader className="space-y-1 text-left">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="outline" className={`text-[10px] ${rotation.badgeClass}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${rotation.color} mr-1`} />
                  {rotation.label}
                </Badge>
                {isCustomizable && (
                  <Badge variant="outline" className="text-[10px] bg-purple-500/10 text-purple-700 border-purple-200">
                    <Palette className="w-3 h-3 mr-1" /> Personnalisable
                  </Badge>
                )}
              </div>
              <DialogTitle className="text-lg sm:text-xl font-bold leading-tight">
                {product.name}
              </DialogTitle>
            </DialogHeader>

            {/* Rating summary */}
            <div className="flex items-center gap-2">
              <StarRating rating={avgRating} size="md" />
              <span className="text-sm font-medium">{avgRating.toFixed(1)}</span>
              <span className="text-xs text-muted-foreground">({reviews.length} avis vendeurs)</span>
            </div>

            {/* Price + margin quick calc */}
            <div className="bg-muted/50 rounded-lg p-3 space-y-2">
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-[10px] text-muted-foreground">Prix de base (logistique incl.)</p>
                  <p className="text-2xl font-bold text-foreground">{product.base_price.toFixed(2)} €</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-muted-foreground">Prix de vente estimé</p>
                  <p className="text-xl font-bold text-primary">{sellingPrice.toFixed(2)} €</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Calculator className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                <Slider
                  min={0} max={product.max_margin_percent} step={1}
                  value={[margin]}
                  onValueChange={([v]) => setMargin(v)}
                  className="flex-1"
                />
                <span className="text-xs font-mono w-10 text-right">{margin}%</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Profit/unité: <span className="text-green-600 font-semibold">+{profit.toFixed(2)} €</span></span>
                <span className="text-muted-foreground">MOQ: <span className="font-semibold text-foreground">{product.moq} unités</span></span>
              </div>
            </div>

            <Button className="w-full gap-2" size="lg">
              <Plus className="w-4 h-4" />
              Ajouter à ma boutique
            </Button>
          </div>
        </div>

        {/* Tabs section */}
        <div className="px-4 sm:px-6 pb-6">
          <Tabs defaultValue="description" className="w-full">
            <TabsList className="w-full h-auto flex-wrap justify-start gap-1 bg-transparent p-0 border-b rounded-none">
              <TabsTrigger value="description" className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none text-xs sm:text-sm px-3 pb-2 gap-1">
                <Info className="w-3.5 h-3.5" /> Description
              </TabsTrigger>
              <TabsTrigger value="performance" className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none text-xs sm:text-sm px-3 pb-2 gap-1">
                <BarChart3 className="w-3.5 h-3.5" /> Performance
              </TabsTrigger>
              <TabsTrigger value="reviews" className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none text-xs sm:text-sm px-3 pb-2 gap-1">
                <MessageSquare className="w-3.5 h-3.5" /> Avis ({reviews.length})
              </TabsTrigger>
              {isCustomizable && (
                <TabsTrigger value="customize" className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none text-xs sm:text-sm px-3 pb-2 gap-1">
                  <Paintbrush className="w-3.5 h-3.5" /> Personnaliser
                </TabsTrigger>
              )}
            </TabsList>

            {/* Description Tab */}
            <TabsContent value="description" className="mt-4 space-y-4">
              <div>
                <h4 className="text-sm font-semibold mb-2">À propos du produit</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {product.description || "Ce produit a été sélectionné et validé par notre équipe pour sa qualité, sa conformité et son potentiel de vente sur les marchés ciblés. Tous les aspects logistiques (stockage, expédition, douane) sont gérés par la plateforme Linksy."}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Card className="bg-muted/30">
                  <CardContent className="p-3">
                    <p className="text-[10px] text-muted-foreground mb-0.5">Marché cible</p>
                    <p className="text-sm font-semibold">{product.market}</p>
                  </CardContent>
                </Card>
                <Card className="bg-muted/30">
                  <CardContent className="p-3">
                    <p className="text-[10px] text-muted-foreground mb-0.5">MOQ</p>
                    <p className="text-sm font-semibold">{product.moq} unités</p>
                  </CardContent>
                </Card>
                <Card className="bg-muted/30">
                  <CardContent className="p-3">
                    <p className="text-[10px] text-muted-foreground mb-0.5">Marge maximale</p>
                    <p className="text-sm font-semibold">{product.max_margin_percent}%</p>
                  </CardContent>
                </Card>
                <Card className="bg-muted/30">
                  <CardContent className="p-3">
                    <p className="text-[10px] text-muted-foreground mb-0.5">Rotation</p>
                    <div className="flex items-center gap-1">
                      <span className={`w-2 h-2 rounded-full ${rotation.color}`} />
                      <p className="text-sm font-semibold">{rotation.label}</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div>
                <h4 className="text-sm font-semibold mb-2">Logistique incluse</h4>
                <div className="flex flex-wrap gap-2">
                  {["Stockage", "Emballage", "Expédition", "Suivi", "Retours"].map(item => (
                    <Badge key={item} variant="secondary" className="text-[10px] gap-1">
                      <ShieldCheck className="w-3 h-3 text-green-500" /> {item}
                    </Badge>
                  ))}
                </div>
              </div>
            </TabsContent>

            {/* Performance Tab */}
            <TabsContent value="performance" className="mt-4 space-y-4">
              <div>
                <h4 className="text-sm font-semibold mb-1">Tendance des ventes (6 derniers mois)</h4>
                <p className="text-xs text-muted-foreground mb-3">Données agrégées de tous les vendeurs sur la plateforme</p>
                <div className="h-48 sm:h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={perfData}>
                      <defs>
                        <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                      <Area type="monotone" dataKey="ventes" stroke="hsl(var(--primary))" fill="url(#salesGrad)" strokeWidth={2} name="Ventes" />
                      <Area type="monotone" dataKey="demande" stroke="hsl(var(--muted-foreground))" fill="transparent" strokeWidth={1.5} strokeDasharray="5 5" name="Demande" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <Card className="bg-muted/30">
                  <CardContent className="p-3 text-center">
                    <TrendingUp className="w-4 h-4 text-green-500 mx-auto mb-1" />
                    <p className="text-lg font-bold">
                      +{Math.round(((perfData[perfData.length - 1] as any)?.ventes / (perfData[0] as any)?.ventes - 1) * 100)}%
                    </p>
                    <p className="text-[10px] text-muted-foreground">Croissance</p>
                  </CardContent>
                </Card>
                <Card className="bg-muted/30">
                  <CardContent className="p-3 text-center">
                    <Package className="w-4 h-4 text-primary mx-auto mb-1" />
                    <p className="text-lg font-bold">
                      {perfData.reduce((s: number, d: any) => s + (d.ventes || 0), 0)}
                    </p>
                    <p className="text-[10px] text-muted-foreground">Ventes totales</p>
                  </CardContent>
                </Card>
                <Card className="bg-muted/30">
                  <CardContent className="p-3 text-center">
                    <Star className="w-4 h-4 text-yellow-500 mx-auto mb-1" />
                    <p className="text-lg font-bold">{avgRating.toFixed(1)}</p>
                    <p className="text-[10px] text-muted-foreground">Note moy.</p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Reviews Tab */}
            <TabsContent value="reviews" className="mt-4 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-semibold">Avis des vendeurs</h4>
                  <p className="text-xs text-muted-foreground">Retours de vendeurs ayant ajouté ce produit</p>
                </div>
                <div className="flex items-center gap-2">
                  <StarRating rating={avgRating} size="md" />
                  <span className="text-lg font-bold">{avgRating.toFixed(1)}</span>
                </div>
              </div>

              <div className="space-y-3">
                {reviews.map(review => (
                  <Card key={review.id} className="bg-muted/20">
                    <CardContent className="p-3">
                      <div className="flex items-start justify-between mb-1.5">
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium">{review.author}</p>
                            {review.verified && (
                              <Badge variant="secondary" className="text-[9px] h-4 px-1.5 gap-0.5">
                                <ShieldCheck className="w-2.5 h-2.5 text-green-500" /> Vérifié
                              </Badge>
                            )}
                          </div>
                          <p className="text-[10px] text-muted-foreground">{review.date}</p>
                        </div>
                        <StarRating rating={review.rating} />
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">{review.comment}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Customize Tab */}
            {isCustomizable && (
              <TabsContent value="customize" className="mt-4 space-y-4">
                <div className="bg-purple-500/5 border border-purple-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Palette className="w-5 h-5 text-purple-600 mt-0.5 shrink-0" />
                    <div>
                      <h4 className="text-sm font-semibold text-foreground">Ce produit est personnalisable</h4>
                      <p className="text-xs text-muted-foreground mt-1">
                        Vous pouvez ajouter votre logo, choisir des couleurs ou ajouter des instructions spéciales avant l'ajout à votre boutique.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-medium">Logo / Image personnalisée</label>
                    <div className="mt-1.5 border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer hover:bg-muted/30 transition-colors">
                      <ImageIcon className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-xs text-muted-foreground">Cliquez ou glissez votre logo ici</p>
                      <p className="text-[10px] text-muted-foreground mt-1">PNG, SVG ou JPG — max 5 Mo</p>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-medium">Couleur souhaitée</label>
                    <div className="flex gap-2 mt-1.5">
                      {["#000000", "#FFFFFF", "#1E40AF", "#DC2626", "#16A34A", "#9333EA"].map(color => (
                        <button
                          key={color}
                          className="w-8 h-8 rounded-full border-2 border-border hover:scale-110 transition-transform"
                          style={{ backgroundColor: color }}
                          title={color}
                        />
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-medium">Instructions spéciales</label>
                    <Textarea
                      placeholder="Ex: Ajoutez mon logo sur le côté droit, texte en blanc..."
                      value={customNote}
                      onChange={(e) => setCustomNote(e.target.value)}
                      className="mt-1.5 text-sm min-h-[80px]"
                    />
                  </div>
                </div>

                <Button className="w-full gap-2" size="lg">
                  <Plus className="w-4 h-4" />
                  Ajouter avec personnalisation
                </Button>
              </TabsContent>
            )}
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}
