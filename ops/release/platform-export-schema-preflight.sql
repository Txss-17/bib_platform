-- BIB Platform: read-only preflight for required Intranet export sources.
-- Apply missing migrations in a staging environment, in journal order;
-- do not fabricate empty snapshots when an export source is unavailable.
BEGIN READ ONLY;

SELECT 'platform_drizzle_history' AS check_name,
       count(*) AS migration_count,
       max(created_at) AS latest_migration_timestamp
FROM drizzle.__drizzle_migrations;

SELECT name, to_regclass('public.'||name) IS NOT NULL AS present
FROM (VALUES
 ('boutiques'), ('orders'), ('support_tickets'),
 ('partner_onboarding_submissions'), ('subscriptions'),
 ('payments'), ('plans'), ('customer_product_favorites'),
 ('customer_boutique_favorites'), ('products'),
 ('product_customization_dossiers'), ('stock_restock_requests'),
 ('order_refunds'), ('sav_escalation_events')
) required(name) ORDER BY name;

-- Fail deployment preflight if any source for the current export is missing.
DO $preflight$
DECLARE missing text[];
BEGIN
 SELECT array_agg(name ORDER BY name) INTO missing
 FROM (VALUES
 ('boutiques'),('orders'),('support_tickets'),
 ('partner_onboarding_submissions'),('subscriptions'),
 ('payments'),('plans'),('customer_product_favorites'),
 ('customer_boutique_favorites'),('products'),
 ('product_customization_dossiers'),('stock_restock_requests'),
 ('order_refunds'),('sav_escalation_events')
 ) required(name)
 WHERE to_regclass('public.'||name) IS NULL;
 IF missing IS NOT NULL THEN
   RAISE EXCEPTION 'BIB_PLATFORM_EXPORT_NOT_READY: missing %', array_to_string(missing,', ')
     USING ERRCODE='55000';
 END IF;
END;
$preflight$;
SELECT 'BIB_PLATFORM_EXPORT_PRECHECK_OK' AS result;
ROLLBACK;
