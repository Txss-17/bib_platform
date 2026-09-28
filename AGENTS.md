# Project decisions

- Keep generated page media in Lovable assets with a checked-in `.asset.json` pointer; this avoids shipping large binary media in the app source and keeps video URLs stable.
- Proxy Lovable asset URLs through Vite in local preview; relative URLs stay same-origin so video and poster load like published assets.