#
Copilot instructions for this repository

Purpose: repository-specific signals for Copilot sessions: build/test/lint commands, high-level architecture, and repo-specific patterns.

---

## Build / dev / lint commands

- Install deps: npm install
- Dev server (HMR): npm run dev (vite)
- Build production: npm run build (runs tsc -b && vite build)
- Preview production: npm run preview (vite preview)
- Lint: npm run lint (eslint .)

Tests: No test runner configured. When tests are added, run a single test file directly with the runner CLI (example): npx vitest run path/to/test.file or npx jest path/to/test.file.

---

## High-level architecture

- SPA frontend: React + TypeScript
- Dev/build: Vite (vite.config.ts + @vitejs/plugin-react)
- TypeScript: project references (root tsconfig.json references tsconfig.app.json and tsconfig.node.json); builds use tsc -b
- Backend/data: Supabase client dependency (@supabase/supabase-js) — search src/ for usage
- Static: public/ and index.html are the HTML/asset entry points
- Source: src/ contains app entry (e.g., src/main.tsx), components, routes, and utilities

---

## Key conventions and repo-specific patterns

- Build step includes TypeScript project build (tsc -b) before Vite build — type errors can block production builds.
- ESLint is run across the repo (eslint .). The repository includes eslint.config.js; consider enabling type-aware rules by referencing tsconfig.* if you need stricter checks.
- TypeScript version ~6 and React 19 — match types/devDeps when adding tools or plugins.
- No test framework yet; add test scripts/devDependencies explicitly when introducing tests.
- If adding new tsconfig.* files, update the project references in tsconfig.json and keep tsc -b workflow in mind.

---

## Agent / AI assistant config files checked

Searched for common assistant files (CLAUDE.md, AGENTS.md, CONVENTIONS.md, .cursorrules, .windsurfrules, .clinerules, .github/copilot-instructions.md). None present.

---

## Quick pointers for automated agents

- package.json — scripts & deps (root)
- vite.config.ts — Vite plugins
- tsconfig.app.json / tsconfig.node.json — TypeScript layout
- src/ — app code and Supabase usage
- public/ + index.html — static entry
- eslint.config.js — lint rules

---

If you want this expanded (examples for adding tests, recommended eslint rules, or Playwright test patterns), say which area.