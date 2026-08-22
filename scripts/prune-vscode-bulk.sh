#!/usr/bin/env bash
# Remove VS Code bulk that Minimal Editor does not use.
# Safe because minimal-*.ts has zero imports from src/vs/.
# Themes/grammars are vendored in resources/ — extensions/ is not needed at runtime.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

echo "Pruning VS Code bulk from $ROOT ..."

# VS Code application source
rm -rf src/vs

# VS Code Electron entrypoints (minimal uses src/minimal-main.ts)
for f in main.ts server-main.ts server-cli.ts cli.ts \
	bootstrap-cli.ts bootstrap-esm.ts bootstrap-fork.ts bootstrap-import.ts \
	bootstrap-meta.ts bootstrap-node.ts bootstrap-server.ts; do
	rm -f "src/$f"
done

# Extension marketplace + language servers + git + copilot etc.
rm -rf extensions

# VS Code integration/E2E test harnesses (minimal tests stay)
rm -rf test/automation test/mcp test/sanity test/smoke

# Microsoft CI pipelines (not used by minimal build)
rm -rf build/azure-pipelines

echo "Done. Run: npm run minimal:test-unit"
echo "Optional: npm run minimal:build (needs deps)"
