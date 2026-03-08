# AICar patch: allow re-bootstrap when users list is empty

This patch changes `/api/auth/bootstrap` to allow creating a super admin even if the bootstrap flag already exists,
*only when* the current users list is empty (e.g., users key was cleared or changed).

It also adds `scripts/bootstrap_superadmin.ps1` to create/update the super admin without npm/node.

## Apply
1) Copy `src/` and `scripts/` into your repo root (with overwrite).
2) `git add -A && git commit -m "fix: allow re-bootstrap if users are missing" && git push`
3) After Vercel deploy: open `/setup?t=...` and create admin again OR run the script:

```powershell
$token = "<AICAR_BOOTSTRAP_TOKEN>"
.\scriptsootstrap_superadmin.ps1 -Email "admin@aicar.md" -Password "NewStrongPass123!" -Token $token
```
