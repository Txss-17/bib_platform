import {
  adminClient,
  bridgeCors,
  checkBridgeKey,
  json,
} from "../_shared/bridge.ts";
import { BridgeBody, SupplierProduct } from "../_shared/bridge-contract.ts";
import { parseStockReceipt } from "../_shared/stockReceipt.ts";
import type { z } from "npm:zod@3";

type Client = ReturnType<typeof adminClient>;
type Product = z.infer<typeof SupplierProduct>;

async function syncProduct(
  sb: Client,
  input: Product,
  retry = true,
): Promise<Response> {
  const { platform_id, source_updated_at, ...fields } = input;
  const clean = Object.fromEntries(
    Object.entries(fields).filter(([, value]) => value !== undefined),
  );
  const columns = "id, intranet_id, intranet_source_updated_at";
  let existing: {
    id: string;
    intranet_id: string | null;
    intranet_source_updated_at: string | null;
  } | null = null;

  if (platform_id) {
    const result = await sb
      .from("supplier_products")
      .select(columns)
      .eq("id", platform_id)
      .maybeSingle();
    if (result.error) return json({ error: "product_lookup_failed" }, 503);
    if (!result.data) return json({ error: "supplier_product_not_found" }, 404);
    existing = result.data;
    if (
      fields.intranet_id &&
      existing.intranet_id &&
      existing.intranet_id !== fields.intranet_id
    ) {
      return json({ error: "supplier_identity_conflict" }, 409);
    }
  }
  if (fields.intranet_id) {
    const result = await sb
      .from("supplier_products")
      .select(columns)
      .eq("intranet_id", fields.intranet_id)
      .maybeSingle();
    if (result.error) return json({ error: "product_lookup_failed" }, 503);
    if (existing && result.data && result.data.id !== existing.id) {
      return json({ error: "supplier_identity_conflict" }, 409);
    }
    existing ??= result.data;
  }

  if (existing) {
    const previous = existing.intranet_source_updated_at;
    if (previous && !source_updated_at)
      return json({ error: "source_version_required" }, 409);
    if (
      previous &&
      source_updated_at &&
      Date.parse(source_updated_at) <= Date.parse(previous)
    ) {
      return json({ id: existing.id, replayed: true });
    }
    if (source_updated_at) clean.intranet_source_updated_at = source_updated_at;
    let query = sb
      .from("supplier_products")
      .update(clean)
      .eq("id", existing.id);
    query = previous
      ? query.eq("intranet_source_updated_at", previous)
      : query.is("intranet_source_updated_at", null);
    const result = await query.select("id").maybeSingle();
    if (result.error)
      return json({ error: "supplier_product_update_failed" }, 503);
    if (!result.data)
      return json({ error: "concurrent_supplier_update_retry" }, 409);
    return json({ id: result.data.id });
  }

  for (const key of ["name", "market", "base_price", "category"]) {
    if (clean[key] === undefined)
      return json({ error: "missing_field_for_create: " + key }, 400);
  }
  if (source_updated_at) clean.intranet_source_updated_at = source_updated_at;
  const result = await sb
    .from("supplier_products")
    .insert(clean)
    .select("id")
    .single();
  // The unique intranet_id prevents duplicate creation during concurrent delivery.
  if (result.error?.code === "23505" && fields.intranet_id && retry)
    return syncProduct(sb, input, false);
  if (result.error)
    return json({ error: "supplier_product_create_failed" }, 503);
  return json({ id: result.data.id });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS")
    return new Response("ok", { headers: bridgeCors });
  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);
  const denied = checkBridgeKey(req);
  if (denied) return denied;

  const parsed = BridgeBody.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return json({ error: parsed.error.flatten() }, 400);
  const sb = adminClient();

  if (parsed.data.type === "customization_review") {
    const input = parsed.data.data;
    const { data, error } = await sb.rpc("apply_product_customization_review", {
      p_product_id: input.product_id,
      p_version: input.version,
      p_status: input.status,
      p_comment: input.comment ?? null,
    });
    if (error?.code === "40001")
      return json({ error: "customization_version_conflict" }, 409);
    if (error?.code === "22023")
      return json({ error: "invalid_customization_review" }, 400);
    if (error) return json({ error: "customization_review_failed" }, 503);
    return json({ id: data });
  }

  if (parsed.data.type === "shipment_assignment") {
    const { order_id, submission_id } = parsed.data.data;
    const { data, error } = await sb.rpc("assign_order_shipment", {
      p_order_id: order_id,
      p_submission_id: submission_id,
    });
    if (error?.code === "P0002")
      return json({ error: "eligible_order_or_partner_not_found" }, 404);
    if (error) return json({ error: "shipment_assignment_failed" }, 503);
    return json({ id: data });
  }

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
    const { data, error } = await sb.rpc("apply_intranet_boutique_status", {
      p_boutique_id: id,
      p_status: status,
    });
    if (error) return json({ error: "boutique_status_update_failed" }, 503);
    if (!data) return json({ error: "boutique_not_found" }, 404);
    return json({ id: data });
  }

  return syncProduct(sb, parsed.data.data);
});
