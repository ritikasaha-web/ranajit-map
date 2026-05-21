# Ditto — Tower Digital Twin Viewer

A Next.js application that connects to an Eclipse Ditto backend to display, filter, and manage telecom tower digital twins on an interactive map. The project supports two flows: a standalone direct API mode (`main`) and a Citadel/PHP embedded integration mode (`ditto-for-php`).

---

## Branches

| Branch          | Purpose                                                                                                                                                                                                              |
| --------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `main`          | Base branch. Talks directly to the Ditto API via axios from the Next.js client. Not optimised for large datasets.                                                                                                    |
| `ditto-for-php` | **Active production branch.** Built specifically for embedding into the Citadel PHP codebase. Holds the live production Ditto API, supports ~10k sites without lag, and contains all Citadel-specific modifications. |

### Why does `ditto-for-php` exist?

The goal of this branch is to embed the Ditto tower viewer **directly inside the Citadel PHP application** — not as an iframe, but as a proper bundle included in the page.

The integration works like this:

1. Run `npx vite build` on the `ditto-for-php` branch.
2. Vite produces a single JS file, a single CSS file, and any accompanying assets inside a `dist/` folder.
3. Those output files are dropped into the Citadel codebase and included via standard `<script>` and `<link>` tags — the app renders as part of the Citadel page.

This branch also carries performance modifications not present in `main`:

- The local Docker-based Ditto instance holds ~10k tower sites.
- The `ditto-for-php` branch is specifically tuned to handle that volume without UI lag. `main` has none of these optimisations.

> Do not merge `ditto-for-php` into `main` without carefully reconciling both sides — the two branches have diverged significantly.

---

## Architecture

```
page.tsx  (root entry)
│
├── FilterBar          shared/filterTower.tsx       — search/filter input for towers
├── SitePhotos         common/SitePhotos.tsx         — site photo gallery modal
├── ExpandTowerPreview common/expandTowerPreview.tsx — fullscreen tower preview panel
│
└── TowerView (lazy)   common/towerView.tsx
        │
        ├── towerMap.tsx          — Leaflet map, renders all tower markers
        │       ├── TowerTooltip  shared/TowerTooltip.tsx   — hover tooltip on marker
        │       ├── TowerPreview  shared/towerPreview.tsx   — sidebar card for selected tower
        │       └── MapLegend     shared/mapLegend.tsx      — map legend overlay
        │
        └── tower/[id]/page.tsx   — full tower detail view (attributes + features)
                └── EditTwin      common/editTwin.tsx       — inline edit for attributes/features
```

---

## Folder Structure

```
app/
├── page.tsx                     Root page — composes map + overlays, hash-based routing
├── layout.tsx                   Next.js root layout, wraps providers
├── providers.tsx                React Query provider setup
├── globals.css                  Global styles
│
├── ditto/                       Eclipse Ditto API layer
│   ├── client.ts                Axios instance pointed at the Ditto endpoint
│   ├── twins.ts                 getTwins, getTwinsWithFilter, getTwinById, updateThing*
│   └── endpoints.ts             Re-exports from twins.ts
│
├── api/                         Next.js route handlers (server-side)
│   ├── client.ts                Axios instance using NEXT_PUBLIC_API_BASE_URL
│   ├── endpoints.ts             Site image helpers (getMappedSiteImages, uploadSiteImages, etc.)
│   ├── get_images_names/        GET  — list images for a site
│   ├── upload_image/            POST — upload site photos to /public/uploads/
│   ├── set_default_image/       POST — mark an image as the default
│   └── delete_site_image/       POST — delete a site image
│
├── hooks/
│   └── getTowers.tsx            React Query hooks: useTowers (all), useTower (by id)
│
├── store/
│   └── useTowerStore.ts         Zustand stores:
│                                  useTowerStore        — selectedTowerId
│                                  useExpandTowerStore  — fullscreen panel open state
│                                  useSitePhotosStore   — photo gallery open state
│                                  useUploadStore       — upload modal open state
│
├── constants/
│   └── component_names.ts       Component sets per tower type (fourPoled, monopole, tripole,
│                                guyedMast), label maps, image generation helpers
│
├── components/
│   ├── common/                  Heavy/feature components
│   │   ├── towerMap.tsx         Leaflet map with marker clustering and glify overlay
│   │   ├── towerView.tsx        Wrapper that renders the map
│   │   ├── expandTowerPreview.tsx  Fullscreen tower preview
│   │   ├── SitePhotos.tsx       Site photo gallery viewer
│   │   ├── SiteUploadPhotos.tsx Photo upload modal
│   │   ├── Twins.tsx            Twin list component
│   │   └── editTwin.tsx         Attribute/feature edit form
│   │
│   └── shared/                  Lightweight/reusable components
│       ├── towerPreview.tsx      Sidebar card — tower SVG + stats + actions
│       ├── TowerTooltip.tsx      Map hover tooltip
│       ├── filterTower.tsx       Filter/search bar
│       ├── mapLegend.tsx         Map legend
│       ├── componentLabels.tsx   Label and anchor maps for tower components
│       ├── attributes.tsx        Attribute display
│       ├── attributeEdit.tsx     Attribute edit fields
│       ├── features.tsx          Feature display
│       ├── featureEdit.tsx       Feature edit fields
│       └── navBar.tsx            Navigation bar
│
├── tower/
│   ├── page.tsx                 Tower list page (currently unused route)
│   └── [id]/page.tsx            Tower detail page — full attributes + features tree
│
├── types/
│   ├── leaflet-pixi-overlay.d.ts
│   └── leaflet.glify.d.ts
│
└── other/                       Unused / experimental files
    ├── Globe.tsx                 Cesium globe experiment
    ├── offlineCesiumGlobe.jsx
    ├── tower_map.tsx             Old map implementation
    ├── towerView.jsx             Old tower view
    ├── attributes.jsx            Old attributes component
    ├── features.jsx              Old features component
    ├── showtower/page.tsx        Unused route
    ├── antennaMini.tsx
    ├── baseTowerSvg.tsx
    ├── countBadge.tsx
    ├── microwaveMini.tsx
    ├── towerAntena.tsx
    └── towerMicrowave.tsx

public/
└── uploads/site_image/<siteId>/ — Uploaded site photos stored here

components/
└── ui/                          shadcn/ui primitives (button, toast, etc.)
```

---

## Data Flow

```
Eclipse Ditto (ditto/client.ts)
        │
        ▼
ditto/twins.ts          — paginated fetch with cursor, streaming chunks via onChunkReceived
        │
        ▼
hooks/getTowers.tsx     — React Query cache; useTowers streams into cache as chunks arrive
        │
        ▼
towerMap.tsx            — reads cache, renders markers; on click sets selectedTowerId in store
        │
        ▼
towerPreview.tsx        — reads selectedTowerId from store, shows tower card + SVG

Site images go through Next.js API routes → /public/uploads/site_image/<siteId>/
```

---

## Key Configuration

| Config                        | Value                                                                 |
| ----------------------------- | --------------------------------------------------------------------- |
| Ditto endpoint (DNS)          | `codez-ditto.duckdns.org:8443` — hardcoded in `app/ditto/client.ts`   |
| Ditto endpoint (hosted)       | `138.201.137.244:3000`                                                |
| Ditto endpoint (production)   | `138.201.137.244:5500`                                                |
| Ditto endpoint (local Docker) | `localhost:8080` — start the Docker container first; holds ~10k sites |
| Image API base URL            | `NEXT_PUBLIC_API_BASE_URL` env var, used in `app/api/client.ts`       |
| Auth                          | Basic auth `ditto:ditto` (base64 encoded in both clients)             |
| API collection                | Saved in Postman                                                      |

### Production Server Access

The production server runs at `138.201.137.244`. Access credentials and the process for SSHing into the server are not stored in this repository — **contact the team** to get onboarded with server access.

---

## Citadel / PHP Integration (`ditto-for-php` branch)

### How It Works

The Ditto viewer is embedded into Citadel **as a bundle** — not via an iframe. The React app is compiled by Vite into a self-contained JS + CSS output that Citadel loads directly on the page, giving a seamless embedded experience.

### Build Steps

```bash
# From the ditto-for-php branch root
npx vite build
```

This outputs a `dist/` folder with:

- One compiled JS file
- One compiled CSS file
- Any referenced static assets

Copy these files into the appropriate locations in the Citadel codebase and include them with standard `<script>` and `<link>` tags.

### Caveats to Keep in Mind

- **Vite builds React, not Next.js.** `npx vite build` only bundles the React layer. Next.js-specific features (server components, API routes, middleware) are not included in the output.
- **Next.js API routes are excluded.** Features that depend on the `app/api/` route handlers (image upload, image listing, etc.) will not work inside the Citadel bundle unless those APIs are hosted and called separately.
- **Only the React-side works end-to-end** in the Citadel integration. This is sufficient for the current integration scope.

---

## Image Path Handling (`ditto-for-php` branch)

The `ditto-for-php` branch includes custom image path handling required for the Citadel integration:

- Some path changes are directly active in code; older/reference paths may still appear as commented-out lines for deployment and debugging purposes.
- Two `uploads` folders exist in this branch: one **inside** `public/` and one **outside** `public/`. This is intentional — it reflects how Next.js API-served images vs. statically served images are handled in the integrated setup.

---

## Unused / Experimental Code

The `other/` directory holds files that are no longer part of the active application — old map implementations, Cesium globe experiments, legacy JSX component versions, and unused routes. Kept for reference only. And the `iframe/` is also unused for few testing purposes, can safely remove that or keep it for reference.
