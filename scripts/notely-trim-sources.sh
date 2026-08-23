#!/usr/bin/env bash
# Delete AI source trees excluded from Notely compile (Tier 3).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

if [[ "$(node -p "require('./product.json').applicationName")" != "notely" ]]; then
	echo "Refusing: product.json applicationName is not 'notely'" >&2
	exit 1
fi

DIRS=(
	src/vs/workbench/contrib/chat
	src/vs/workbench/contrib/inlineChat
	src/vs/workbench/contrib/mcp
	src/vs/workbench/contrib/agentsVoice
	src/vs/workbench/contrib/welcomeAgentSessions
	src/vs/workbench/contrib/speech
	src/vs/workbench/services/agentHost
	src/vs/workbench/services/mcp
	src/vs/workbench/services/localTranscription
	src/vs/platform/agentHost
	src/vs/platform/mcp
	src/vs/platform/localTranscription
	src/vs/sessions
)

removed=0
for d in "${DIRS[@]}"; do
	if [[ -d "$ROOT/$d" ]]; then
		echo "remove $d"
		rm -rf "$ROOT/$d"
		removed=$((removed + 1))
	fi
done

echo "Removed $removed AI source trees."
