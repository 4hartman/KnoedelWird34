#!/usr/bin/env bash
# Assembles the Firebase Hosting deploy directory (public/):
#   public/        -> the editor SPA (login, projects, editor)
#   public/g/      -> the published-gift runtime, served at /g/{slug}
#   public/*.ico   -> shared favicons referenced by the runtime as ../favicon.*
#
# Run from the repo root, then deploy with:  firebase deploy
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

echo "Building editor…"
( cd editor && npm run build )

echo "Assembling public/…"
rm -rf public
mkdir -p public/g

cp -R editor/dist/. public/
cp -R runtime/. public/g/

# Favicons referenced by runtime/index.html as ../favicon.*
for f in favicon.png favicon.ico apple-touch-icon.png; do
  [ -f "$f" ] && cp "$f" public/ || true
done

echo "Done. Deploy with:  firebase deploy"
