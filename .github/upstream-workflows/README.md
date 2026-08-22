# Upstream VS Code workflows (archived)

These GitHub Actions workflows were inherited from [microsoft/vscode](https://github.com/microsoft/vscode).
They are **not run** by GitHub (only `.github/workflows/*.yml` at the repo root is active).

Notely uses:

| Workflow | Purpose |
|----------|---------|
| `.github/workflows/notely-ci.yml` | Compile check on push/PR to `main` |
| `.github/workflows/notely-release.yml` | Native installers on `v*` tags |

Restore a file here to `.github/workflows/` if you need an upstream workflow again.
