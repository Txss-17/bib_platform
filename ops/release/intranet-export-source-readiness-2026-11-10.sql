-- READ-ONLY preflight for the BIB Platform project that actually hosts intranet-export.
-- Run against Platform, not Intranet. Never create missing Platform tables in Intranet.
SELECT current_database() AS database_name, current_schema() AS connected_schema,
  current_setting('server_version') AS postgres_version;

SELECT src.name AS required_export_source,
  to_regclass('public.'||src.name) IS NOT NULL AS exists_in_platform_database
FROM (VALUES
 ('boutiques'),('orders'),('support_tickets'),('partner_onboarding_submissions'),
 ('subscriptions'),('payments'),('plans'),('customer_product_favorites'),
 ('customer_boutique_favorites'),('products'),('product_customization_dossiers'),
 ('stock_restock_requests'),('refunds'),('sav_escalation_events'),
 ('prelaunch_survey_responses')
) src(name) ORDER BY src.name;

-- Compare the connected Platform database to the actual runtime secrets of the
-- deployed intranet-export Edge Function through environment configuration.
-- Do not print secret values in logs; verify project ref and deployment target
-- in hosting/secret-management UI before invoking any production pull.
-- The bridge consumer must reject incomplete snapshots: never fabricate empty
-- favorites, merchants, boutiques, or receipts to make a pull appear successful.
