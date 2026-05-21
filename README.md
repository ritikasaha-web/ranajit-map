# Ditto — Tower Digital Twin Viewer

A Next.js app that connects to an Eclipse Ditto backend to display, filter, and manage telecom tower digital twins on an interactive map.

---

## Branches

| Branch          | Purpose                                                                                                                                                  |
| --------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `main`          | Production. Talks directly to the Ditto API via axios from the Next.js client.                                                                           |
| `ditto-for-php` | In-progress. Integrating a PHP middleware layer between the frontend and Ditto. Vast divergence from main — do not merge without reconciling both sides. |

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

## Key Config

- **Ditto endpoint:** hardcoded in `app/ditto/client.ts` (`codez-ditto.duckdns.org:8443`)
- **Ditto endpoint:** hosted ip is 138.201.137.244:3000 and production ip is 138.201.137.244:5500
  locally running on localhost:8080(run the docker container locally first, apis saved on postman collection)

- **Image API base URL:** `NEXT_PUBLIC_API_BASE_URL` env var, used in `app/api/client.ts`
- **Auth:** Basic auth `ditto:ditto` (base64 encoded in both clients)
