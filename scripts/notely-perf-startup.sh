#!/usr/bin/env bash
# Best-effort Notely cold-start timing on Linux (works headless with xvfb-run).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

export PATH="${PATH}"
NODE_BIN="${NODE_BIN:-node}"

APP_NAME="$("$NODE_BIN" -p "require('./product.json').applicationName")"
ELECTRON="$ROOT/.build/electron/$APP_NAME"

if [[ ! -e "$ELECTRON" ]] && [[ -e "$ROOT/.build/electron/code-oss" ]]; then
	ln -sf code-oss "$ELECTRON"
fi

USER_DATA="$(mktemp -d /tmp/notely-perf-XXXXXX)"
LOG="$(mktemp /tmp/notely-perf-log-XXXXXX)"
cleanup() {
	rm -rf "$USER_DATA"
	rm -f "$LOG"
}
trap cleanup EXIT

if [[ -z "${VSCODE_SKIP_PRELAUNCH:-}" ]]; then
	"$NODE_BIN" build/lib/preLaunch.ts
fi

LAUNCH_PREFIX=()
if [[ -z "${DISPLAY:-}" ]] && command -v xvfb-run >/dev/null 2>&1; then
	LAUNCH_PREFIX=(xvfb-run -a)
fi

START_MS="$("$NODE_BIN" -e 'process.stdout.write(String(Date.now()))')"

"${LAUNCH_PREFIX[@]}" "$ROOT/scripts/code.sh" --no-sandbox \
	--user-data-dir="$USER_DATA" \
	--disable-extensions \
	--skip-welcome \
	--skip-release-notes \
	--disable-workspace-trust \
	/tmp >"$LOG" 2>&1 &
PID=$!

READY=0
for _ in $(seq 1 120); do
	if grep -qE 'Lifecycle#phase.*(Restored|Eventually)|\[main\] .*workbench|workbench#open' "$LOG" 2>/dev/null; then
		READY=1
		break
	fi
	if ! kill -0 "$PID" 2>/dev/null; then
		break
	fi
	sleep 0.5
done

END_MS="$("$NODE_BIN" -e 'process.stdout.write(String(Date.now()))')"
ELAPSED_MS=$((END_MS - START_MS))

kill "$PID" 2>/dev/null || true
wait "$PID" 2>/dev/null || true

echo "Notely startup (best effort): ${ELAPSED_MS} ms"
echo "Ready marker detected: $([ "$READY" -eq 1 ] && echo yes || echo no)"
echo "Target: < 1000 ms (Req 7)"
echo "Log: $LOG"
