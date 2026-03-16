import {
  Color3,
  Mesh,
  MeshBuilder,
  Scene,
  ShadowGenerator,
  StandardMaterial,
  Vector3,
} from '@babylonjs/core';

// ─── KALLAX 2×2 dimensions (meters) ────────────────────────
// Finished standing: 77 cm wide × 77 cm tall × 39 cm deep
const T = 0.015;                // panel thickness  (1.5 cm)
const W = 0.77;                 // outer width = outer height (square)
const D = 0.39;                 // depth
const CELL = (W - 3 * T) / 2;  // each cube opening
const INNER = W - 2 * T;       // inner span between two outer panels

const DOWEL_R = 0.004;
const DOWEL_H = 0.026;

/**
 * KALLAX 2×2 — 7 board pieces + dowels
 *
 *  Front view (standing upright):
 *  ┌──────────┬──────────┐
 *  │          │          │  ← top
 *  │  leftW   │ vDivTop  │  rightW
 *  ├──────────┼──────────┤  ← hShelf
 *  │          │vDivBot   │
 *  │          │          │
 *  └──────────┴──────────┘  ← bottom
 */
export interface KallaxParts {
  bottom: Mesh;       // horizontal bottom panel  (full width W)
  top: Mesh;          // horizontal top panel     (full width W)
  leftWall: Mesh;     // vertical left side wall  (height = INNER)
  rightWall: Mesh;    // vertical right side wall (height = INNER)
  hShelf: Mesh;       // horizontal middle shelf  (width = INNER)
  vDivBottom: Mesh;   // short vertical divider — bottom row (height = CELL)
  vDivTop: Mesh;      // short vertical divider — top row    (height = CELL)
  dowels: Mesh[];
}

function makeMaterial(name: string, color: Color3, scene: Scene) {
  const mat = new StandardMaterial(name, scene);
  mat.diffuseColor = color;
  mat.specularColor = new Color3(0.15, 0.15, 0.15);
  return mat;
}

export function createKallaxParts(scene: Scene, shadowGen: ShadowGenerator): KallaxParts {
  const woodColor = new Color3(0.87, 0.72, 0.53);
  const woodMat = makeMaterial('wood', woodColor, scene);
  const dowelColor = new Color3(0.76, 0.60, 0.42);
  const dowelMat = makeMaterial('dowel', dowelColor, scene);

  const panel = (name: string, w: number, h: number, d: number) => {
    const m = MeshBuilder.CreateBox(name, { width: w, height: h, depth: d }, scene);
    m.material = woodMat;
    m.receiveShadows = true;
    shadowGen.addShadowCaster(m);
    return m;
  };

  // 2 horizontal outer panels — full width
  const bottom = panel('bottom', W, T, D);
  const top    = panel('top',    W, T, D);

  // 2 vertical side walls — fit between top & bottom panels
  const leftWall  = panel('leftWall',  T, INNER, D);
  const rightWall = panel('rightWall', T, INNER, D);

  // Horizontal middle shelf — spans between the two side walls
  const hShelf = panel('hShelf', INNER, T, D);

  // 2 short vertical center dividers — one per row
  const vDivBottom = panel('vDivBottom', T, CELL, D);
  const vDivTop    = panel('vDivTop',    T, CELL, D);

  // Dowels (simplified set)
  const dowels: Mesh[] = [];
  for (let i = 0; i < 14; i++) {
    const dw = MeshBuilder.CreateCylinder(`dowel${i}`, {
      diameter: DOWEL_R * 2,
      height: DOWEL_H,
    }, scene);
    dw.material = dowelMat;
    shadowGen.addShadowCaster(dw);
    dowels.push(dw);
  }

  const parts: KallaxParts = { bottom, top, leftWall, rightWall, hShelf, vDivBottom, vDivTop, dowels };
  setExplodedPositions(parts);
  return parts;
}

// ─── Assembled positions (standing upright, origin = centre-bottom) ───
export function getAssembledPositions() {
  const hw = W / 2;           // half-width
  const midY = W / 2;         // vertical center of the unit

  return {
    bottom:     new Vector3(0, T / 2, 0),
    top:        new Vector3(0, W - T / 2, 0),
    leftWall:   new Vector3(-hw + T / 2, midY, 0),
    rightWall:  new Vector3( hw - T / 2, midY, 0),
    hShelf:     new Vector3(0, midY, 0),                         // same Y as walls' center
    vDivBottom: new Vector3(0, T + CELL / 2, 0),
    vDivTop:    new Vector3(0, T + CELL + T + CELL / 2, 0),
    dowels:     dowelAssembledPositions(),
  };
}

function dowelAssembledPositions(): Vector3[] {
  const hw = W / 2;
  const p: Vector3[] = [];

  // 0-1: bottom panel ↔ vDivBottom
  p.push(new Vector3(0, T + DOWEL_H / 2, -D / 4));
  p.push(new Vector3(0, T + DOWEL_H / 2,  D / 4));

  // 2-3: bottom panel ↔ leftWall
  p.push(new Vector3(-hw + T / 2, T + DOWEL_H / 2, -D / 4));
  p.push(new Vector3(-hw + T / 2, T + DOWEL_H / 2,  D / 4));

  // 4-5: bottom panel ↔ rightWall
  p.push(new Vector3(hw - T / 2, T + DOWEL_H / 2, -D / 4));
  p.push(new Vector3(hw - T / 2, T + DOWEL_H / 2,  D / 4));

  // 6-7: vDivBottom top ↔ hShelf
  p.push(new Vector3(0, T + CELL - DOWEL_H / 2, -D / 4));
  p.push(new Vector3(0, T + CELL - DOWEL_H / 2,  D / 4));

  // 8-9: hShelf ↔ vDivTop bottom
  p.push(new Vector3(0, T + CELL + T + DOWEL_H / 2, -D / 4));
  p.push(new Vector3(0, T + CELL + T + DOWEL_H / 2,  D / 4));

  // 10-11: vDivTop top ↔ top panel
  p.push(new Vector3(0, W - T - DOWEL_H / 2, -D / 4));
  p.push(new Vector3(0, W - T - DOWEL_H / 2,  D / 4));

  // 12: top panel ↔ leftWall
  p.push(new Vector3(-hw + T / 2, W - T - DOWEL_H / 2, 0));

  // 13: top panel ↔ rightWall
  p.push(new Vector3(hw - T / 2, W - T - DOWEL_H / 2, 0));

  return p;
}

/** Spread parts out for the overview "exploded" view */
export function setExplodedPositions(parts: KallaxParts) {
  const a = getAssembledPositions();

  // Bottom panel stays in place (foundation)
  parts.bottom.position = a.bottom.clone();

  // Top panel — raised above
  parts.top.position = a.top.add(new Vector3(0, 0.55, 0));

  // Side walls — pushed outward left/right
  parts.leftWall.position  = a.leftWall.add(new Vector3(-0.45, 0.15, 0));
  parts.rightWall.position = a.rightWall.add(new Vector3( 0.45, 0.15, 0));

  // Horizontal shelf — offset backward
  parts.hShelf.position = a.hShelf.add(new Vector3(0, 0.15, 0.55));

  // Vertical dividers — offset forward
  parts.vDivBottom.position = a.vDivBottom.add(new Vector3(-0.25, 0.1, -0.45));
  parts.vDivTop.position    = a.vDivTop.add(new Vector3( 0.25, 0.3, -0.45));

  // Dowels hidden
  parts.dowels.forEach((d, i) => {
    d.position = a.dowels[i].add(new Vector3(0, 0.8, 0));
    d.isVisible = false;
  });
}

export { W, D, T, CELL };
