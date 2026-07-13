# Traqspera · Hour Rules

A time-tracking **compliance** application built with the **Trimble Modus Component Platform** (Modus Web Components + React wrappers). It demonstrates net-to-the-minute labor rules across three role-based interfaces.

> **Net-to-the-minute:** every duration is computed as the exact whole-minute
> difference between two timestamps. Nothing is rounded to the nearest quarter
> hour or any other increment. See `src/lib/timeRules.ts`.

## Interfaces

### 1. Field Employee (mobile-first) — `/field`
- Simple **Clock In / Clock Out** button.
- **Switch Craft** dropdown for mid-shift trade changes (splits the time entry to the minute).
- **Modal Freeze:** clocking back in before an unrounded **30 minutes** requires a reason code — *Working Lunch*, *Operational Flow*, or *Personal Choice*.
- **End-of-day attestation** checklist for rest breaks. Selecting **Injury** reveals a mandatory multi-line comments field.

### 2. Foreman / Supervisor Dashboard (desktop) — `/foreman`
- **Compliance list:** active crew, live status, and net-to-the-minute meal-break countdowns with alerts for approaching violations (5-hour meal rule).
- **Hybrid view:** toggle between the list and a **Heat Map**. Color coding — Green = Active, Amber = Lunch, Gray = Shift End, Red = meal-violation risk. Clicking a *hot* zone drills down into the list filtered to those workers.

### 3. Admin — Management by Exception — `/admin`
- **Exception lanes:** split view of **Clean** vs **Flagged** timecards.
- **Bulk actions:** multi-select rows to update Union / Phase codes.
- **Signature logic:** digital signatures are **preserved** unless the **Union Code** itself changes (a union change invalidates the signature).

## Tech stack
- React 18 + TypeScript + Vite
- `@trimble-oss/moduswebcomponents` + `@trimble-oss/moduswebcomponents-react`
- `react-router-dom` (HashRouter for GitHub Pages)

## Getting started

```bash
npm install
npm run dev      # start the dev server
npm run build    # type-check + production build to dist/
npm run preview  # preview the production build
```

## Deployment (GitHub Pages)

- `vite.config.ts` sets `base: '/traqspera-hour-rules/'` so assets resolve under the Pages path.
- Pushing to `main` triggers `.github/workflows/deploy.yml`, which builds and publishes `dist/` via GitHub Pages.

## Project structure

```
src/
  components/   Layout (navbar + side nav), Modal, HeatMap
  pages/        FieldEmployee, ForemanDashboard, AdminDashboard
  hooks/        useClock (freeze state machine), useNow
  lib/          timeRules (net-to-the-minute logic), events helpers
  data/         mock crew + timecards
```
