import { z } from "npm:zod@3";
import { adminClient, bridgeCors, checkBridgeKey, json } from "../_shared/bridge.ts";
import { parseStockReceipt } from "../_shared/stockReceipt.ts";

const ProductData = z.object({
  platform_id: z.string().uuid().optional(),
  intranet_id: z.string().min(1).max(100).optional(),
  name: z.string().min(1).max(255).optional(),
  description: z.string().max(5000).nullable().optional(),
  image_url: z.string().url().nullable().optional(),
  moq: z.number().int().min(1).optional(),
  market: z.string().min(1).max(50).optional(),
  base_price: z.number().min(0).optional(),
  max_margin_percent: z.number().int().min(0).max(1000).optional(),
  customization_capabilities: z.object({
    logo: z.array(z.string().max(80)).max(30).optional(),
    colors: z.array(z.string().regex(/^#[0-9A-Fa-f]{6}$/)).max(30).optional(),
    materials: z.array(z.string().max(80)).max(50).optional(),
    finishes: z.array(z.string().max(80)).max(50).optional(),
    packaging: z.array(z.string().max(120)).max(50).optional(),
    marking: z.array(z.string().max(80)).max(30).optional(),
    text: z.boolean().optional(),
  }).optional(),
  rotation_indicator: z.enum(["green", "yellow", "orange", "red"]).optional(),
  category: z.string().min(1).max(100).optional(),
  is_active: z.boolean().optional(),
}).refine((d) => d.platform_id || d.intranet_id, { message: "platform_id or intranet_id required" });

const Body = z.discriminatedUnion("type", [
  z.object({ type: z.literal("stock_receipt"), data: z.unknown() }),
  z.object({ type: z.literal("supplier_product"), data: ProductData }),
  z.object({
    type: z.literal("boutique_status"),
    data: z.object({ id: z.string().uuid(), status: z.enum(["draft", "published"]) }),
  }),
]);

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: bridgeCors });
  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);
  const denied = checkBridgeKey(req);
  if (denied) return denied;

  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return json({ error: parsed.error.flatten() }, 400);
  const sb = adminClient();

  if (parsed.data.type === "stock_receipt") {
    const receipt = parseStockReceipt(parsed.data.data);
    if (!receipt) return json({ error: "invalid_stock_receipt" }, 400);
    const { data, error } = await sb.rpc("receive_product_stock", {
      p_product_id: receipt.product_id,
      p_quantity: receipt.quantity,
      p_receipt_id: receipt.receipt_id,
    });
    if (error) return json({ error: error.message }, 400);
    return json({ id: receipt.product_id, stock_quantity: data });
  }

  if (parsed.data.type === "boutique_status") {
    const { id, status } = parsed.data.data;
    const { data, error } = await sb.from("boutiques").update({ status }).eq("id", id).select("id").maybeSingle();
    if (error) return json({ error: error.message }, 500);
    if (!data) return json({ error: "boutique_not_found" }, 404);
    return json({ id: data.id });
  }

  const { platform_id, ...fields } = parsed.data.data;
  const clean = Object.fromEntries(Object.entries(fields).filter(([, v]) => v !== undefined));

  let existingId: string | null = null;
  if (platform_id) {
    const { data } = await sb.from("supplier_products").select("id").eq("id", platform_id).maybeSingle();
    existingId = data?.id ?? null;
  }
  if (!existingId && fields.intranet_id) {
    const { data } = await sb.from("supplier_products").select("id").eq("intranet_id", fields.intranet_id).maybeSingle();
    existingId = data?.id ?? null;
  }

  if (existingId) {
    const { error } = await sb.from("supplier_products").update(clean).eq("id", existingId);
    if (error) return json({ error: error.message }, 500);
    return json({ id: existingId });
  }

  for (const k of ["name", "market", "base_price", "category"]) {
    if (clean[k] === undefined) return json({ error: `missing_field_for_create: ${k}` }, 400);
  }
  const { data, error } = await sb.from("supplier_products").insert(clean).select("id").single();
  if (error) return json({ error: error.message }, 500);
  return json({ id: data.id });
});
