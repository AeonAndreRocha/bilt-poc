# Project Guidelines

## Overview

BILT PoC — a browser-based 3D step-by-step assembly instruction viewer built with **Babylon.js 7**, **React 19**, **TypeScript 5.7**, and **Vite 6**.

## Build and Test

```bash
npm install        # Install dependencies
npm run dev        # Dev server at http://localhost:5173
npm run build      # Type-check + production build
npm run preview    # Serve production build
```

No test runner is configured.

## Architecture

Each product follows a 4-file pattern:

| Layer | File | Exports |
|-------|------|---------|
| Geometry | `src/scene/{product}Parts.ts` | `{Product}Parts` interface, `create{Product}Parts()`, `getAssembledPositions()`, `setExplodedPositions()` |
| Animation | `src/animations/{product}Steps.ts` | `{product}Steps[]` array, `jumpTo{Product}Step()` |
| Viewer | `src/components/{Product}Viewer.tsx` | `{Product}Viewer` component |
| Routing | `src/App.tsx` + `src/components/Sidebar.tsx` | Conditional render + catalog entry |

Shared infrastructure (no product-specific code):
- `src/hooks/useBabylonEngine.ts` — Babylon Engine/Scene lifecycle
- `src/scene/createScene.ts` — Camera, lights, shadows
- `src/components/BabylonScene.tsx` — Canvas wrapper
- `src/components/StepControls.tsx` — Generic step UI (accepts `steps[]` and `productName`)

## Conventions

- **Units**: All dimensions in meters (real-world scale)
- **Origin**: Center-bottom of assembled product (y=0 at base)
- **Coordinates**: x=left/right, y=up/down, z=front/back
- **Step 0**: Always "Overview" with exploded view; last step always "Complete!"
- **Fastener steps**: Separate from part placement (e.g. insert dowels, then attach board)
- **Animation**: `CubicEase` with `EASEINOUT`, 60 FPS, ~60 frames per move
- **Visibility**: Fasteners (dowels/screws) start hidden, made visible in their step via `isVisible = true`
- **Materials**: Use `makeMaterial()` factory; each product defines its own colors
- **Shadows**: Every mesh gets `shadowGen.addShadowCaster(mesh)` and `receiveShadows = true`

## Adding a New Product

1. Create `src/scene/{product}Parts.ts` — define dimensions, parts interface, geometry, assembled/exploded positions
2. Create `src/animations/{product}Steps.ts` — define step array with `animate()` (async) and `setup()` (sync) per step
3. Create `src/components/{Product}Viewer.tsx` — copy an existing viewer, swap imports and `productName`
4. Add entry to `catalog` array in `src/components/Sidebar.tsx`
5. Add conditional render in `src/App.tsx` with a unique `key` prop (forces remount on switch)

## Pitfalls

- **React StrictMode**: The `useBabylonEngine` hook uses `useRef` for the callback to handle double-mount safely — do not convert to plain `useEffect` dependencies
- **Fastener indices are hardcoded** in step files (e.g. `[0, 1, 2, 3]`) — update if part counts change
- **Camera adjustment**: Taller products need `camera.radius` and `camera.target.y` overrides in their viewer's `handleSceneReady`
- **Component `key` prop** on viewers in App.tsx ensures full scene teardown when switching products
