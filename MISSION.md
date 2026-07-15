# Mission: Effect-first application architecture

## Why

Build and extend a reusable monorepo template without accidentally creating competing runtime, request-state, or dependency-lifecycle systems. The goal is to make sound Effect architecture decisions in real application builds, not merely copy Effect syntax.

## Success looks like

- Explain which layer owns an HTTP request from contract to React render
- Add Effect HTTP API queries and mutations without handwritten runtime bridges
- Recognize when Effect Atom or TanStack Query is the coherent choice
- Keep Effect package identity and runtime composition consistent across workspaces

## Constraints

- Teach through the code in this repository
- Prefer small vertical slices and deliberate additions
- React filenames and directories use snake_case
- Effect dependencies remain centrally and exactly pinned while v4 is beta

## Out of scope

- Choosing product-specific routing, authentication, persistence, or deployment
- Teaching the whole Effect ecosystem before it is needed
