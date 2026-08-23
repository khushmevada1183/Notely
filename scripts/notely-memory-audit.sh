#!/usr/bin/env bash
# Reproducible cold-start and idle process-tree memory measurement for Notely.
set -euo pipefail

if [[ "${1:-}" == "--self-check" ]]; then
	echo "Running memory audit self-check..."
	test_pid=$$
	rss_kb=$(grep -i VmRSS /proc/$test_pid/status | awk '{print $2}')
	if [[ -z "$rss_kb" || ! "$rss_kb" =~ ^[0-9]+$ ]]; then
		echo "Self-check failed: Non-numeric VmRSS" >&2
		exit 1
	fi
	pss_kb=0
	if [[ -f "/proc/$test_pid/smaps_rollup" ]]; then
		pss_kb=$(grep -i '^Pss:' /proc/$test_pid/smaps_rollup | awk '{print $2}' || echo 0)
	fi
	echo "Self-check PASSED: root PID $test_pid, VmRSS: ${rss_kb} KB, PSS: ${pss_kb} KB"
	echo "total_rss_kb: $rss_kb"
	echo "total_pss_kb: $pss_kb"
	exit 0
fi

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

NODE_BIN="${NODE_BIN:-node}"
AUDIT_SECONDS="${NOTELY_AUDIT_SECONDS:-10}"
USER_DATA="${NOTELY_AUDIT_PROFILE:-$(mktemp -d /tmp/notely-audit-XXXXXX)}"
INPUT_PATH="${NOTELY_AUDIT_INPUT:-/tmp}"
LOG="$(mktemp /tmp/notely-audit-log-XXXXXX)"

cleanup() {
	if [[ -n "${MAIN_PID:-}" ]] && kill -0 "$MAIN_PID" 2>/dev/null; then
		pkill -P "$MAIN_PID" 2>/dev/null || true
		kill "$MAIN_PID" 2>/dev/null || true
		wait "$MAIN_PID" 2>/dev/null || true
	fi
	rm -rf "$USER_DATA"
	rm -f "$LOG"
}
trap cleanup EXIT

if [[ -z "${VSCODE_SKIP_PRELAUNCH:-}" ]]; then
	"$NODE_BIN" build/lib/preLaunch.ts >/dev/null 2>&1 || true
fi

APP_NAME="$("$NODE_BIN" -p "require('./product.json').applicationName")"
ELECTRON="$ROOT/.build/electron/$APP_NAME"
if [[ ! -e "$ELECTRON" ]] && [[ -e "$ROOT/.build/electron/code-oss" ]]; then
	ln -sf code-oss "$ELECTRON"
fi

LAUNCH_PREFIX=()
if [[ -z "${DISPLAY:-}" ]] && command -v xvfb-run >/dev/null 2>&1; then
	LAUNCH_PREFIX=(xvfb-run -a)
fi

export VSCODE_SKIP_PRELAUNCH=1

"${LAUNCH_PREFIX[@]}" "$ROOT/scripts/code.sh" --no-sandbox \
	--user-data-dir="$USER_DATA" \
	--disable-extensions \
	--skip-welcome \
	--skip-release-notes \
	--disable-workspace-trust \
	"$INPUT_PATH" >"$LOG" 2>&1 &
MAIN_PID=$!

READY=0
for _ in $(seq 1 30); do
	if grep -qE 'Lifecycle#phase.*(Restored|Eventually)|\[main\] .*workbench|workbench#open|Started local extension host' "$LOG" 2>/dev/null; then
		READY=1
		break
	fi
	if ! kill -0 "$MAIN_PID" 2>/dev/null; then
		break
	fi
	sleep 0.2
done

if [[ "$READY" -eq 0 ]]; then
	echo "Warning: Readiness marker not detected within timeout; proceeding with memory sample." >&2
fi

sleep "$AUDIT_SECONDS"

get_all_descendants() {
	local pid=$1
	echo "$pid"
	for child in $(pgrep -P "$pid" 2>/dev/null || true); do
		get_all_descendants "$child"
	done
}

pids=$(get_all_descendants "$MAIN_PID" | sort -u)

total_rss_kb=0
total_pss_kb=0
count=0

printf "%-8s %-12s %-12s %s\n" "PID" "RSS (MB)" "PSS (MB)" "COMMAND"
printf "%-8s %-12s %-12s %s\n" "---" "--------" "--------" "-------"

for pid in $pids; do
    ps -p "$pid" -o pid=,rss=,args=ww | while read -r p rss_kb cmd; do
        if [[ -n "$p" ]] && [[ "$p" != "PID" ]]; then
            rss_kb=${rss_kb:-0}
            if ! [[ "$rss_kb" =~ ^[0-9]+$ ]]; then rss_kb=0; fi
            rss_mb=$(echo "scale=2; $rss_kb / 1024" | bc)
            
            # Fetch PSS from smaps_rollup
            pss_kb=0
            if [[ -f "/proc/$p/smaps_rollup" ]]; then
                pss_kb=$(awk '/^Pss:/ {print $2}' "/proc/$p/smaps_rollup" || echo 0)
            fi
            pss_kb=${pss_kb:-0}
            if ! [[ "$pss_kb" =~ ^[0-9]+$ ]]; then pss_kb=0; fi
            pss_mb=$(echo "scale=2; $pss_kb / 1024" | bc)
            
            total_rss_kb=$((total_rss_kb + rss_kb))
            total_pss_kb=$((total_pss_kb + pss_kb))
            count=$((count + 1))
            
            # Print full command but wrap it for readability if needed, or just let it print
            printf "%-8s %-12s %-12s %s\n" "$p" "$rss_mb" "$pss_mb" "${cmd:0:150}"
        fi
    done
done

total_rss_mb=$(awk "BEGIN {printf \"%.2f\", $total_rss_kb/1024}")
total_pss_mb=$(awk "BEGIN {printf \"%.2f\", $total_pss_kb/1024}")

echo ""
echo "=== Memory Audit Summary ==="
echo "Process Count : $count"
echo "Total RSS     : ${total_rss_mb} MB (${total_rss_kb} KB)"
echo "Total PSS     : ${total_pss_mb} MB (${total_pss_kb} KB)"
echo "total_rss_kb: $total_rss_kb"
echo "total_pss_kb: $total_pss_kb"
