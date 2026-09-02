# CalSense — Web App (Frontend)

The companion web app for the CalSense pressure-sensing insole: an aesthetic,
interpretable view of foot-health metrics for everyday users, with a clinician
view planned later.

**This repository is frontend only.** Every number on screen comes from a
local simulated data layer. There is no backend yet — see
[Wiring up a backend](#wiring-up-a-backend).

## Stack

| Concern | Choice |
| --- | --- |
| Build | Vite 6 + React 19 + TypeScript |
| Styling | Tailwind CSS v4 (tokens in `src/index.css`) |
| Routing | React Router 7 |
| Charts / foot maps | Hand-rolled SVG + Canvas (no chart library) |
| Fonts | Fraunces (display), IBM Plex Sans (body), IBM Plex Mono (data) |

## Getting started

```bash
npm install
npm run dev      # http://localhost:5273
```

```bash
npm run build    # type-check + production build to dist/
npm run preview  # serve the built app
```

> **OneDrive note:** if you clone this into a OneDrive-synced folder, exclude
> `node_modules` from sync (right-click → *Always keep on this device* off, or
> move the project outside OneDrive) to avoid constant sync churn.

## What's in it

| Route | Screen | Notes |
| --- | --- | --- |
| `/` | **Today** | Foot Health Score, drivers, pressure map, activity, balance & load |
| `/live` | **Live view** | Real-time dual-foot pressure + centre-of-pressure gait line (simulated stream) |
| `/trends` | **Trends** | Hand-rolled line/area chart with a "typical range" band, 14/30/90-day windows |
| `/insights` | **Insights** | Plain-language cards: *what we saw · what it means · what to try* |
| `/zones` | **Watch zones** | Regions carrying more load than usual, with 21-day history |
| `/assessments` | **Assessments** | Guided balance/walk test history + recorded sessions |
| `/device` | **Device** | Battery, wear time, calibration |
| `/profile` | **Profile & data** | Details, consents, export/delete (stubbed) |

Light and dark themes are both first-class (toggle in the top bar, persisted to
`localStorage`).

## Architecture

```
src/
  lib/              types, formatting, pressure colour ramps + foot geometry
  data/
    DataSource.ts   the interface every screen depends on
    DataContext.tsx React provider + hooks (useToday, useHistory, useLive, …)
    simulated/      the current implementation
      gait.ts         plantar-pressure model of one gait cycle
      history.ts      deterministic 90-day history, insights, zones, sessions
      liveEngine.ts   requestAnimationFrame sensor-stream simulation
  components/
    foot/           FootField (canvas pressure renderer), FootMap, PressureLegend
    ui/             Card, ScoreRing, Sparkline, TrendChart, Meter, primitives
    layout/         AppShell, Sidebar, Topbar
  screens/          one file per route
```

### Data model

Types in [`src/lib/types.ts`](src/lib/types.ts) mirror what a backend is
expected to return: `DaySummary`, `RegionLoad`, `Insight`, `WatchZone`,
`SessionSummary`, `LiveFrame`, `DeviceStatus`, `Profile`.

Plantar regions are kept lay-friendly: `big_toe`, `toes`, `ball_inner`,
`ball_outer`, `arch`, `heel`.

## Wiring up a backend

Every screen talks to the `DataSource` interface — never to the simulated data
directly. To go live:

1. Implement `DataSource` against your API (e.g. `ApiDataSource`).
2. Swap the instance in [`src/data/DataContext.tsx`](src/data/DataContext.tsx).
3. For the live view, implement `LiveHandle` over a WebSocket instead of the
   `requestAnimationFrame` engine.

No screen or component changes required.

## Known stubs

- "Record session", "Start test", calibration, export, delete, edit profile,
  invite clinician — all show a toast; they need the backend.
- The simulated user has a mild left-forefoot overpronation pattern baked in so
  the Watch Zones and Insights screens have something meaningful to show.
