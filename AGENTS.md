# Project decisions

- Keep generated page media in Lovable assets with a checked-in `.asset.json` pointer; this avoids shipping large binary media in the app source and keeps video URLs stable.
- Proxy Lovable asset URLs through Vite in local preview; relative URLs stay same-origin so video and poster load like published assets.
- Studio publication readiness uses persisted boutique metadata, homepage scenes (`page_id IS NULL`) and an exact active supplier-linked product count; re-read them before publishing because preview props and optimistic caches are not authoritative. This client gate is not atomic server enforcement.
- Use the Drizzle migration journal as the deployment history; legacy Supabase SQL files are reference-only and must not be replayed wholesale because they contain overlapping and foreign-schema changes.
- Credit physical stock through the bridge-protected stock_receipt import and service-only transactional receive_product_stock RPC; unique receipt-line references prevent duplicate credits and merchant edits must not send stock quantities.
- Keep platform-owned interface copy reactive to LanguageContext, including dates and currency; never translate merchant-authored content implicitly.