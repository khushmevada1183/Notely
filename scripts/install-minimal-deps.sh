#!/usr/bin/env bash
# Install minimal-editor dependencies in isolation (Option B).
# Keeps VS Code root node_modules untouched; see build/MINIMAL_CONFIG_README.md.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
INSTALL_DIR="${ROOT}/node_modules-minimal"

echo "Installing minimal editor dependencies to ${INSTALL_DIR}..."

mkdir -p "${INSTALL_DIR}"
cp "${ROOT}/package-minimal.json" "${INSTALL_DIR}/package.json"

npm install --prefix "${INSTALL_DIR}" --no-package-lock --omit=optional

echo ""
echo "Installed packages:"
du -sh "${INSTALL_DIR}/node_modules/monaco-editor" "${INSTALL_DIR}/node_modules/electron" 2>/dev/null || true
du -sh "${INSTALL_DIR}/node_modules" 2>/dev/null || true
echo "Done."
