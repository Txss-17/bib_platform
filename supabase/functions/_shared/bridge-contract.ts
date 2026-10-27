import { z } from "npm:zod@3";
import {
  parseCustomizationCapabilities,
  parseCustomizationTerms,
  parseCatalogDetails,
} from "./customization-contract.ts";
const metadata = <T>(parse: (value: unknown) => T) =>
  z.unknown().transform((value, ctx): T => {
    try {
      return parse(value);
    } catch (error) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          error instanceof Error ? error.message : "invalid_catalog_metadata",
      });
      return z.NEVER;
    }
  });

// Null means "not supplied" for fields with a non-null database default.
const optional = <T extends z.ZodTypeAny>(schema: T) =>
  schema.nullish().transform((value) => value ?? undefined);

export const SupplierProduct = z
  .object({
    platform_id: optional(z.string().uuid()),
    intranet_id: optional(z.string().trim().min(1).max(100)),
    source_updated_at: optional(z.string().datetime({ offset: true })),
    name: optional(z.string().trim().min(1).max(255)),
    description: z.string().max(5000).nullable().optional(),
    image_url: z.string().url().nullable().optional(),
    moq: optional(z.number().int().min(1)),
    market: optional(z.string().trim().min(1).max(50)),
    base_price: optional(z.number().finite().min(0)),
    max_margin_percent: optional(z.number().int().min(0).max(1000)),
    customization_capabilities: optional(
      metadata(parseCustomizationCapabilities),
    ),
    customization_terms: optional(metadata(parseCustomizationTerms)),
    catalog_details: optional(metadata(parseCatalogDetails)),
    rotation_indicator: optional(z.enum(["green", "yellow", "orange", "red"])),
    category: optional(z.string().trim().min(1).max(100)),
    is_active: optional(z.boolean()),
  })
  .refine((data) => data.platform_id || data.intranet_id, {
    message: "platform_id or intranet_id required",
  });

const ShopStatus = z
  .object({
    id: z.string().uuid().optional(),
    platform_id: z.string().uuid().optional(),
    status: z.enum([
      "draft",
      "published",
      "application",
      "review",
      "active",
      "inactive",
      "suspended",
      "closed",
    ]),
  })
  .refine((data) => data.id || data.platform_id, {
    message: "boutique id required",
  })
  .refine(
    (data) => !data.id || !data.platform_id || data.id === data.platform_id,
    {
      message: "conflicting boutique identifiers",
    },
  )
  .transform((data) => ({
    id: (data.id ?? data.platform_id)!,
    // Intranet approval never publishes an unfinished storefront.
    status: data.status === "published" ? ("active" as const) : data.status,
  }));

export const BridgeBody = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("restock_review"),
    data: z.object({
      request_id: z.string().uuid(),
      version: z.number().int().min(1).max(2147483647),
      status: z.enum(["approved", "rejected"]),
      comment: z.string().max(2000).nullable().optional(),
    }).refine((data) => data.status !== "rejected" || !!data.comment?.trim(), {
      message: "rejection_reason_required",
    }),
  }),
  z.object({
    type: z.literal("customization_review"),
    data: z.object({
      product_id: z.string().uuid(),
      version: z.number().int().min(1),
      status: z.enum([
        "in_review",
        "approved",
        "changes_requested",
        "rejected",
      ]),
      comment: z.string().max(2000).nullable().optional(),
    }),
  }),
  z.object({
    type: z.literal("shipment_assignment"),
    data: z.object({
      order_id: z.string().uuid(),
      submission_id: z.string().uuid(),
    }),
  }),
  z.object({ type: z.literal("stock_receipt"), data: z.unknown() }),
  z.object({ type: z.literal("supplier_product"), data: SupplierProduct }),
  z.object({ type: z.literal("boutique_status"), data: ShopStatus }),
]);
