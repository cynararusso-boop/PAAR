# GUARDA-CHUVA – PAAR/PSU Digital

A responsive hospital triage web application for sensory screening of neurodivergent patients at **Santa Casa de Misericórdia de Itu – PSI**.

## Overview

GUARDA-CHUVA implements the **PAAR V2** (Protocolo de Avaliação e Acolhimento em Risco) screening tool for use by multidisciplinary healthcare teams (Enfermagem, TO, Psicologia, Coordenação). It calculates a real-time risk score and displays color-coded triage levels with clinical management guidelines.

## Key Technologies

- **TanStack Start** (React 19) – SSR-capable full-stack React framework
- **Tailwind CSS v4** – utility-first styling
- **TypeScript** – full type safety
- **Netlify** – hosting and deployment

## Running Locally

```bash
npm install
npm run dev
```

The app runs at http://localhost:3000.

## Risk Score Levels

| Score | Level | Color |
|-------|-------|-------|
| 0 | Awaiting Triage | Gray |
| 1–5 | Low Risk | Green |
| 6–12 | Moderate Prevention | Yellow |
| 13–20 | High Escalation Risk | Orange |
| ≥21 | Critical Alert | Red (pulsing) |
