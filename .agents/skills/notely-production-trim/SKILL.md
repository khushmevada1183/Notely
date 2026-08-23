---
name: notely-production-trim
description: Use when optimizing Notely for production installers, trimming VS Code services still loaded in a minimal notepad fork, or when extension-host logs show UNKNOWN service errors for chat, MCP, git, or agent host.
---

# Notely Production Trim

## Overview

Notely runtime = three slices. Trim at the **lowest layer that still satisfies the dependency** — do not delete npm packages; remove **imports** from entry files.

## Three Layers

| Layer | File | Trim target |
|-------|------|-------------|
| Renderer | `workbench.minimal.main.ts` | Notebook, remote, sync, activity, outline, dataChannel |
| Desktop | `workbench.desktop.main.ts` | MCP, agent host, tunnels, telemetry, search, sync tips |
| Extension RPC | `extensionHost.minimal.contribution.ts` | Chat, AI, git, notebook, terminal MainThreads |

**Keep:** `updateService` + `contrib/update/browser/update.contribution.js` for auto-update UI.

## Desktop — Remove

`mcp*`, `agentHost*`, `playwrightWorkbenchService`, `localTranscriptionService`, `remoteTunnelService`, `tunnelService`, `sharedProcessTunnelService`, `searchService`, `userDataSync*`, `extensionTipsService`, `telemetryService`, `customEndpointTelemetryService`, `meteredConnectionService`, `imageResizeService`, `webContentExtractorService`, `profilingService`, `extensionHostDebugService`.

## Renderer — Remove

`notebookDocumentService`, `remoteExplorerService`, `remoteExtensionsScanner`, `embedderTerminalService`, `userDataSync*`, `extensionRecommendations*`, `extensionFeaturesManagemetService`, `activityService`, `outlineService`, `dataChannelService`, `userActivity*`, `userAttention*`, `editSessionIdentityService`, `canonicalUriService`, `remoteUserDataProfiles`.

## Extension Host

Replace `extensionHost.contribution.js` with `extensionHost.minimal.contribution.js` in minimal.main.

Register `nullQuickDiffModelService.ts` — `mainThreadDocumentsAndEditors` needs `IQuickDiffModelService`; stub returns `undefined` instead of pulling SCM.

## Stubs Over Re-imports

If a MainThread you keep requires a service whose contrib was removed, add a **null singleton** under `contrib/minimalEditor/browser/` — never re-import full VS Code contribs (SCM, chat, webview).

## Quick Reference

| Symptom | Fix |
|---------|-----|
| `UNKNOWN service agentSessions` | Use minimal extension host |
| `UNKNOWN service gitService` | Drop `mainThreadGitExtensionService` |
| `UNKNOWN service IQuickDiffModelService` | `NullQuickDiffModelService` |
| Blank screen + `chatExtensionId` | `NullDefaultAccountService` when no `defaultChatAgent` |
| Update menu missing | Add `update.contribution.js` to desktop contrib region |

## Verify

```bash
npm run compile-client
./scripts/notely-run.sh
grep -i 'UNKNOWN service\|chatExtensionId' logs/notely-live.log
```

## Common Mistakes

- Trimming `updateService` — user expects GitHub release auto-update.
- Using `extensionHost.contribution.js` in minimal.main — pulls 50+ chat/git RPCs.
- Re-adding `workbench.common.main.ts` — restores full VS Code UI stack.
