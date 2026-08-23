#!/usr/bin/env bash
# Remove extensions not in build/minimal-extensions.allowlist.json (and copilot).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

if [[ "$(node -p "require('./product.json').applicationName")" != "notely" ]]; then
	echo "Refusing to trim: product.json applicationName is not 'notely'" >&2
	exit 1
fi

mapfile -t KEEP < <(node --experimental-strip-types -e "
import { getNotelyExtensionNames } from './build/lib/notelyExtensions.ts';
for (const n of getNotelyExtensionNames()) console.log(n);
")

removed=0
for dir in "$ROOT/extensions"/*; do
	[[ -d "$dir" ]] || continue
	name="$(basename "$dir")"
	case "$name" in
		node_modules|out) continue ;;
	esac
	for k in "${KEEP[@]}"; do
		if [[ "$name" == "$k" ]]; then
			continue 2
		fi
	done
	echo "remove extensions/$name"
	rm -rf "$dir"
	removed=$((removed + 1))
done

echo "Removed $removed extension folders; kept ${#KEEP[@]} allowlisted."

if [[ -d "$ROOT/remote" ]]; then
	echo "remove remote/ (not used by Notely desktop)"
	rm -rf "$ROOT/remote"
fi
