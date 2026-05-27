# AGENTS.md

This document provides an overview of the project structure for developers and AI agents working on this codebase.

## Project Overview

GUARDA-CHUVA is a hospital triage web application for sensory screening of neurodivergent patients (PAAR V2 protocol) at Santa Casa de Misericórdia de Itu – PSI. Built with TanStack Start and deployed on Netlify.

## Key Directories

```
src/
  components/
    TriageSystem.tsx   # Entire triage UI — single self-contained component
  routes/
    __root.tsx         # HTML shell, lang="pt-BR", page title
    index.tsx          # Root route, renders <TriageSystem />
  styles.css           # Tailwind v4 import + pulse animation
```

## Triage Domain Logic

All domain logic lives in `TriageSystem.tsx`:

- `calcScore()` — pure function summing checkbox/dropdown values into a numeric score
- `getRiskLevel()` — maps score → `RiskLevel` ('waiting' | 'green' | 'yellow' | 'orange' | 'red')
- `riskConfig` — maps `RiskLevel` → visual styles, label, and clinical management tips

Score thresholds: 0=waiting, 1–5=green, 6–12=yellow, 13–20=orange, ≥21=red (pulsing).

## Non-Obvious Decisions

- Toggle buttons (`ToggleCheckbox`) replace native checkboxes for large-touch mobile accessibility.
- Score panel is `md:sticky` so tablets show the live score while scrolling the checklist.
- Red critical level uses `animate-pulse` — intentional clinical alerting behavior.
- No persistence: each session clears on refresh. Use `netlify-database` skill if persistence is added.
- Tailwind risk-level classes are hardcoded strings (not dynamic template literals) to ensure CSS bundle inclusion.

### Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | TanStack Start |
| Frontend | React 19, TanStack Router v1 |
| Build | Vite 7 |
| Styling | Tailwind CSS 4 |
| UI Components | Radix UI + custom components |
| Content | Content Collections (type-safe markdown) |
| AI | TanStack AI with multi-provider support |
| Language | TypeScript 5.7 (strict mode) |
| Deployment | Netlify |

## Directory Structure

```
├── public
│   ├── favicon.ico
│   ├── tanstack-circle-logo.png
│   └── tanstack-word-logo-white.svg  # TanStack wordmark logo (white) used in header/nav.
├── src
│   ├── components
│   │   ├── Calculator.tsx  # iOS-style calculator: digits, operations, evaluate, clear, percent.
│   │   ├── Header.tsx  # Header component.
│   │   └── HeaderNav.tsx  # Navigation sidebar template: mobile menu, Home link, add-on routes; EJS-driven for dynamic route generation.
│   ├── routes
│   │   ├── __root.tsx  # Root layout: HTML shell, styles.
│   │   └── index.tsx  # Home route: renders Calculator component.
│   ├── router.tsx  # TanStack Router setup: creates router from generated routeTree with scroll restoration.
│   └── styles.css  # Global styles: Tailwind import plus base body/code font styling.
├── .gitignore  # Template for .gitignore: node_modules, dist, .env, .netlify, .tanstack, etc.
├── AGENTS.md  # This document provides an overview of the project structure for developers and AI agents working on this codebase.
├── netlify.toml  # Netlify deployment config: build command (vite build), publish directory (dist/client), and dev server settings (port 8888, target 3000).
├── package.json  # Project manifest with TanStack Start, React 19, Vite 7, Tailwind CSS 4, and Netlify plugin dependencies; defines dev and build scripts.
├── pnpm-lock.yaml
├── tsconfig.json  # TypeScript config: ES2022 target, strict mode, @/* path alias for src/*, bundler module resolution.
└── vite.config.ts  # Vite config template: TanStack Start, React, Tailwind, Netlify plugin, and optional add-on integrations; processed by EJS.
```

## Key Concepts

### File-Based Routing (TanStack Router)

Routes are defined by files in `src/routes/`:

- `__root.tsx` - Root layout wrapping all pages
- `index.tsx` - Route for `/`
- `api.*.ts` - Server API endpoints (e.g., `api.resume-chat.ts` → `/api/resume-chat`)

### Component Architecture

**UI Primitives** (`src/components/ui/`):
- Radix UI-based, Tailwind-styled
- Card, Badge, Checkbox, Separator, HoverCard

**Feature Components** (`src/components/`):
- Header, HeaderNav, ResumeAssistant

## Configuration Files

| File | Purpose |
|------|---------|
| `vite.config.ts` | Vite plugins: TanStack Start, Netlify, Tailwind, Content Collections |
| `tsconfig.json` | TypeScript config with `@/*` path alias for `src/*` |
| `netlify.toml` | Build command, output directory, dev server settings |
| `content-collections.ts` | Zod schemas for jobs and education frontmatter |
| `styles.css` | Tailwind imports + CSS custom properties (oklch colors) |

## Development Commands

```bash
npm run dev      # Start dev server
npm run build    # Production build
npm run preview  # Preview production build
```

## Conventions

### Naming
- Components: PascalCase
- Utilities/hooks: camelCase
- Routes: kebab-case files

### Styling
- Tailwind CSS utility classes
- `cn()` helper for conditional class merging
- CSS variables for theme tokens in `styles.css`

### TypeScript
- Strict mode enabled
- Import paths use `@/` alias
- Zod for runtime validation
- Type-only imports with `type` keyword

### State Management
- React hooks for local state
- Zustand if you need it for global state
### Calculator Component

iOS-style calculator built with React `useReducer` for state management.

**State pattern:** `display`, `previousValue`, `operation`, `overwrite`

**Actions:** ADD_DIGIT, CHOOSE_OPERATION, EVALUATE, CLEAR, DELETE_DIGIT, PERCENT, TOGGLE_SIGN

No special dependencies beyond base TanStack Start. Pure React + Tailwind CSS.

## Application Name

This starter uses "Application Name" as a placeholder throughout the UI and metadata. Replace it with the user's desired application name in the following locations:

### UI Components
- `src/components/Header.tsx` — app name displayed in the header
- `src/components/HeaderNav.tsx` — app name in the mobile navigation header

### SEO Metadata
- `src/routes/__root.tsx` — the `title` field in the `head()` configuration

Search for all occurrences of "Application Name" in the `src/` directory and replace with the user's application name.
