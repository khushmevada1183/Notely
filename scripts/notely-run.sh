#!/usr/bin/env bash
# Start Notely with live logging — dated log files under logs/
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

export PATH="${HOME}/.local/node/node-v24.18.0-linux-x64/bin:${PATH}"

if ! node -v | grep -q '^v24\.'; then
	echo "Notely requires Node 24.x (see .nvmrc). Current: $(node -v)" >&2
	exit 1
fi

LOG_DIR="$ROOT/logs"
mkdir -p "$LOG_DIR"

STAMP="$(date +%Y-%m-%d_%H-%M-%S)"
LOG_FILE="$LOG_DIR/notely-${STAMP}.log"
LATEST_LINK="$LOG_DIR/notely-latest.log"
PID_FILE="$LOG_DIR/notely.pid"
NOTELY_LOG_DIR="$LOG_DIR/notely-session-${STAMP}"

ln -sf "$(basename "$LOG_FILE")" "$LATEST_LINK"

APP="$(node -p "require('./product.json').applicationName")"
CODE=".build/electron/$APP"
[[ -e "$CODE" ]] || ln -sf code-oss "$CODE"

node --experimental-strip-types build/lib/preLaunch.ts

export NODE_ENV=development VSCODE_DEV=1 VSCODE_CLI=1
export ELECTRON_ENABLE_STACK_DUMPING=1 ELECTRON_ENABLE_LOGGING=1

ARGS=(. --disable-extension=vscode.vscode-api-tests --no-sandbox --log trace --logsPath "$NOTELY_LOG_DIR")
FOREGROUND=false
[[ "${1:-}" == "--fg" ]] && { FOREGROUND=true; shift; }
ARGS+=("$@")

echo "Notely started     : $(date '+%Y-%m-%d %H:%M:%S %Z')"
echo "Live log file      : $LOG_FILE"
echo "Latest log symlink : $LATEST_LINK"
echo "VS Code log dir    : $NOTELY_LOG_DIR"
echo ""
echo "  tail -f $LOG_FILE"
echo "  tail -f $LATEST_LINK"
echo "  grep -iE 'error|warn|fail' $LOG_FILE"
echo "---"

if $FOREGROUND; then
	exec "$CODE" "${ARGS[@]}" 2>&1 | tee -a "$LOG_FILE"
else
	# stdbuf -oL: line-buffered stdout so tail -f updates live while you surf
	if command -v stdbuf >/dev/null 2>&1; then
		stdbuf -oL -eL "$CODE" "${ARGS[@]}" >> "$LOG_FILE" 2>&1 &
	else
		"$CODE" "${ARGS[@]}" >> "$LOG_FILE" 2>&1 &
	fi
	echo "$!" > "$PID_FILE"
	echo "Started PID $(cat "$PID_FILE") (background)"
	echo "Stop: kill \$(cat $PID_FILE)"
fi
