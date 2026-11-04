# Issue tracker

Issues and specs live in GitHub Issues in sandonl/effect-app-template.

Use the connected GitHub plugin for external operations. Confirm the
repository before creating an issue.

- Publishing a spec or ticket means creating a GitHub issue.
- Fetching a ticket means reading its body, labels and comments.
- Use native sub-issues for parent/child relationships.
- Use native issue dependencies for blockers. If unavailable, record
  “Blocked by: #number” in the issue body.
- A ticket is startable when all blockers are closed.
- When resolving an issue, record the outcome before closing it.
- For triage labels, read `docs/agents/triage-labels.md`.

PRs as a request surface: no.

For wayfinding, use one issue labelled `wayfinder:map`, with child issues
labelled `wayfinder:research`, `wayfinder:prototype`,
`wayfinder:grilling` or `wayfinder:task`. Claim an unassigned,
unblocked child before starting it. Record resolved findings in the map.
