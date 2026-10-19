# Project decisions

- Keep generated page media in Lovable assets with a checked-in `.asset.json` pointer; this avoids shipping large binary media in the app source and keeps video URLs stable.
- Proxy Lovable asset URLs through Vite in local preview; relative URLs stay same-origin so video and poster load like published assets.
- Studio publication readiness uses persisted boutique metadata, homepage scenes (`page_id IS NULL`) and an exact active supplier-linked product count; re-read them before publishing because preview props and optimistic caches are not authoritative. This client gate is not atomic server enforcement.