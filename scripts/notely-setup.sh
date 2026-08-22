#!/usr/bin/env bash
# Notely dev setup — Node 24 + extension deps + compile + electron symlink
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

if ! node -v | grep -q '^v24\.'; then
  echo "Notely requires Node 24.x (see .nvmrc). Current: $(node -v)" >&2
  exit 1
fi

npm install --ignore-scripts
for d in extensions/*/; do
  [[ -f "${d}package.json" ]] && npm install --ignore-scripts --no-package-lock --prefix "$d" >/dev/null 2>&1 || true
done
npm install --ignore-scripts --prefix build >/dev/null 2>&1 || true

npm rebuild @vscode/spdlog @vscode/sqlite3 2>/dev/null || true

npm run compile-client
node --experimental-strip-types build/lib/preLaunch.ts

APP=$(node -p "require('./product.json').applicationName")
[[ -e ".build/electron/$APP" ]] || ln -sf code-oss ".build/electron/$APP"

echo "Ready. Run: ./scripts/code.sh --no-sandbox"
