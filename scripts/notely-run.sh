#!/usr/bin/env bash
# Start Notely with live logging to logs/notely-live.log
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
LOG_FILE="$LOG_DIR/notely-live.log"
PID_FILE="$LOG_DIR/notely.pid"
STAMP="$(date +%Y%m%d-%H%M%S)"
NOTELY_LOG_DIR="$LOG_DIR/notely-$STAMP"

# Fresh log each launch; previous run archived if non-empty
if [[ -s "$LOG_FILE" ]]; then
	mv "$LOG_FILE" "$LOG_DIR/notely-${STAMP}.log"
fi
: > "$LOG_FILE"

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

echo "Notely live log : $LOG_FILE"
echo "Notely log dir  : $NOTELY_LOG_DIR"
echo "Tail errors     : tail -f $LOG_FILE"
echo "Filter errors   : grep -i err $LOG_FILE"
echo "---"

if $FOREGROUND; then
	exec "$CODE" "${ARGS[@]}" 2>&1 | tee -a "$LOG_FILE"
else
	"$CODE" "${ARGS[@]}" >> "$LOG_FILE" 2>&1 &
	echo "$!" > "$PID_FILE"
	echo "Started PID $(cat "$PID_FILE") (background)"
	echo "Stop           : kill \$(cat $PID_FILE)"
fi
