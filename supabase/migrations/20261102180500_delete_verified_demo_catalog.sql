-- Explicitly identified legacy demo supplier catalog.
-- Generated together on 2026-01-30; no intranet source ID.
-- Only delete if none of their variants have financial or stock references.
BEGIN;
DO $$
DECLARE linked_count bigint;
BEGIN
  SELECT (SELECT count(*) FROM public.orders o JOIN public.products p ON p.id=o.product_id WHERE p.supplier_product_id=ANY(ARRAY[
    '4581b32d-8ca8-4e45-9b21-b2b94140010d','253685df-2632-44ce-84e2-8bfd6ed57e7e',
    'c192c0e0-01de-40c5-8b90-acefee96b807','d4a5120e-ed9f-4df5-82d0-b90c458de04c',
    '9a562a51-4243-4ec4-9c8b-e01513459341','3bf18a8a-02a6-45e6-a2c0-6f4751733b42']::uuid[]))
    + (SELECT count(*) FROM public.product_stock_movements sm JOIN public.products p ON p.id=sm.product_id WHERE p.supplier_product_id=ANY(ARRAY[
    '4581b32d-8ca8-4e45-9b21-b2b94140010d','253685df-2632-44ce-84e2-8bfd6ed57e7e',
    'c192c0e0-01de-40c5-8b90-acefee96b807','d4a5120e-ed9f-4df5-82d0-b90c458de04c',
    '9a562a51-4243-4ec4-9c8b-e01513459341','3bf18a8a-02a6-45e6-a2c0-6f4751733b42']::uuid[]))
    + (SELECT count(*) FROM public.product_stock_reservations sr JOIN public.products p ON p.id=sr.product_id WHERE p.supplier_product_id=ANY(ARRAY[
    '4581b32d-8ca8-4e45-9b21-b2b94140010d','253685df-2632-44ce-84e2-8bfd6ed57e7e',
    'c192c0e0-01de-40c5-8b90-acefee96b807','d4a5120e-ed9f-4df5-82d0-b90c458de04c',
    '9a562a51-4243-4ec4-9c8b-e01513459341','3bf18a8a-02a6-45e6-a2c0-6f4751733b42']::uuid[]))
    + (SELECT count(*) FROM public.moq_reservations mr WHERE mr.supplier_product_id=ANY(ARRAY[
    '4581b32d-8ca8-4e45-9b21-b2b94140010d','253685df-2632-44ce-84e2-8bfd6ed57e7e',
    'c192c0e0-01de-40c5-8b90-acefee96b807','d4a5120e-ed9f-4df5-82d0-b90c458de04c',
    '9a562a51-4243-4ec4-9c8b-e01513459341','3bf18a8a-02a6-45e6-a2c0-6f4751733b42']::uuid[]))
    INTO linked_count;
  IF linked_count > 0 THEN
    RAISE EXCEPTION 'Demo catalog removal blocked: % related transaction / stock records',linked_count;
  END IF;
  IF (SELECT count(*) FROM public.supplier_products WHERE id=ANY(ARRAY[
    '4581b32d-8ca8-4e45-9b21-b2b94140010d','253685df-2632-44ce-84e2-8bfd6ed57e7e',
    'c192c0e0-01de-40c5-8b90-acefee96b807','d4a5120e-ed9f-4df5-82d0-b90c458de04c',
    '9a562a51-4243-4ec4-9c8b-e01513459341','3bf18a8a-02a6-45e6-a2c0-6f4751733b42']::uuid[])
    AND intranet_id IS NULL AND created_at='2026-01-30 06:06:51.974667+00') <> 6 THEN
    RAISE EXCEPTION 'Demo product provenance changed; abort';
  END IF;
END $$;
DELETE FROM public.products WHERE supplier_product_id=ANY(ARRAY[
 '4581b32d-8ca8-4e45-9b21-b2b94140010d','253685df-2632-44ce-84e2-8bfd6ed57e7e',
 'c192c0e0-01de-40c5-8b90-acefee96b807','d4a5120e-ed9f-4df5-82d0-b90c458de04c',
 '9a562a51-4243-4ec4-9c8b-e01513459341','3bf18a8a-02a6-45e6-a2c0-6f4751733b42']::uuid[]);
DELETE FROM public.supplier_products WHERE id=ANY(ARRAY[
 '4581b32d-8ca8-4e45-9b21-b2b94140010d','253685df-2632-44ce-84e2-8bfd6ed57e7e',
 'c192c0e0-01de-40c5-8b90-acefee96b807','d4a5120e-ed9f-4df5-82d0-b90c458de04c',
 '9a562a51-4243-4ec4-9c8b-e01513459341','3bf18a8a-02a6-45e6-a2c0-6f4751733b42']::uuid[]);
COMMIT;