import {
  Color3,
  Mesh,
  MeshBuilder,
  Scene,
  ShadowGenerator,
  StandardMaterial,
  Vector3,
} from '@babylonjs/core';

// ─── LUNDTOFT adjustable side table dimensions (meters) ────────
// From JYSK assembly manual
const BASE_W = 0.590;   // base foot width
const BASE_D = 0.410;   // base foot depth
const BASE_H = 0.027;   // base foot height

const COL_W = 0.100;    // column width (face)
const COL_D = 0.045;    // column depth
const COL_H = 0.605;    // column height

const BRACKET_W = 0.343; // mounting bracket width
const BRACKET_D = 0.118; // mounting bracket depth
const BRACKET_H = 0.057; // mounting bracket height

const TOP_W = 0.700;    // table top width
const TOP_D = 0.400;    // table top depth
const TOP_H = 0.018;    // table top height

const SCREW_R = 0.003;
const SCREW_H = 0.011;  // M6×11mm

export interface LundtoftParts {
  base: Mesh;
  column: Mesh;
  bracket: Mesh;
  top: Mesh;
  screws: Mesh[];
}

function makeMaterial(name: string, color: Color3, scene: Scene) {
  const mat = new StandardMaterial(name, scene);
  mat.diffuseColor = color;
  mat.specularColor = new Color3(0.15, 0.15, 0.15);
  return mat;
}

export function createLundtoftParts(scene: Scene, shadowGen: ShadowGenerator): LundtoftParts {
  const metalColor = new Color3(0.35, 0.35, 0.38);   // dark steel
  const topColor   = new Color3(0.88, 0.85, 0.80);   // light laminate
  const screwColor = new Color3(0.55, 0.55, 0.58);

  const metalMat = makeMaterial('metal', metalColor, scene);
  const topMat   = makeMaterial('topMat', topColor, scene);
  const screwMat = makeMaterial('screw', screwColor, scene);

  const box = (name: string, w: number, h: number, d: number, mat: StandardMaterial) => {
    const m = MeshBuilder.CreateBox(name, { width: w, height: h, depth: d }, scene);
    m.material = mat;
    m.receiveShadows = true;
    shadowGen.addShadowCaster(m);
    return m;
  };

  const base    = box('base',    BASE_W,    BASE_H,    BASE_D,    metalMat);
  const column  = box('column',  COL_W,     COL_H,     COL_D,     metalMat);
  const bracket = box('bracket', BRACKET_W, BRACKET_H, BRACKET_D, metalMat);
  const top     = box('top',     TOP_W,     TOP_H,     TOP_D,     topMat);

  // Screws: 4 for base→column, 6 for column→bracket, 4 for bracket→top = 14 total
  const screws: Mesh[] = [];
  for (let i = 0; i < 14; i++) {
    const s = MeshBuilder.CreateCylinder(`screw${i}`, {
      diameter: SCREW_R * 2,
      height: SCREW_H,
    }, scene);
    s.material = screwMat;
    shadowGen.addShadowCaster(s);
    screws.push(s);
  }

  const parts: LundtoftParts = { base, column, bracket, top, screws };
  setExplodedPositions(parts);
  return parts;
}

// ─── Assembled positions (origin = centre-bottom of base) ───────
export function getAssembledPositions() {
  const baseY    = BASE_H / 2;
  const colY     = BASE_H + COL_H / 2;
  const bracketY = BASE_H + COL_H + BRACKET_H / 2;
  const topY     = BASE_H + COL_H + BRACKET_H + TOP_H / 2;

  return {
    base:    new Vector3(0, baseY,    0),
    column:  new Vector3(0, colY,     0),
    bracket: new Vector3(0, bracketY, 0),
    top:     new Vector3(0, topY,     0),
    screws:  screwAssembledPositions(),
  };
}

function screwAssembledPositions(): Vector3[] {
  const p: Vector3[] = [];
  const jointBaseCol = BASE_H;

  // 0-3: 4 screws base → column (in a rectangle around bottom of column)
  const sx = COL_W * 0.3;
  const sz = COL_D * 0.3;
  p.push(new Vector3(-sx, jointBaseCol, -sz));
  p.push(new Vector3( sx, jointBaseCol, -sz));
  p.push(new Vector3(-sx, jointBaseCol,  sz));
  p.push(new Vector3( sx, jointBaseCol,  sz));

  // 4-9: 6 screws column → bracket (3 on each side of bracket bottom)
  const jointColBracket = BASE_H + COL_H;
  const bx = BRACKET_W * 0.3;
  const bz = BRACKET_D * 0.25;
  p.push(new Vector3(-bx, jointColBracket, -bz));
  p.push(new Vector3(  0, jointColBracket, -bz));
  p.push(new Vector3( bx, jointColBracket, -bz));
  p.push(new Vector3(-bx, jointColBracket,  bz));
  p.push(new Vector3(  0, jointColBracket,  bz));
  p.push(new Vector3( bx, jointColBracket,  bz));

  // 10-13: 4 screws bracket → top (corners of bracket, through into tabletop)
  const jointBracketTop = BASE_H + COL_H + BRACKET_H;
  const tx = BRACKET_W * 0.35;
  const tz = BRACKET_D * 0.3;
  p.push(new Vector3(-tx, jointBracketTop, -tz));
  p.push(new Vector3( tx, jointBracketTop, -tz));
  p.push(new Vector3(-tx, jointBracketTop,  tz));
  p.push(new Vector3( tx, jointBracketTop,  tz));

  return p;
}

/** Spread parts out for overview exploded view */
export function setExplodedPositions(parts: LundtoftParts) {
  const a = getAssembledPositions();

  // Base stays in place (foundation)
  parts.base.position = a.base.clone();

  // Column — raised up
  parts.column.position = a.column.add(new Vector3(0.35, 0.15, 0));

  // Bracket — raised further and offset
  parts.bracket.position = a.bracket.add(new Vector3(-0.35, 0.25, 0));

  // Table top — raised high
  parts.top.position = a.top.add(new Vector3(0, 0.45, 0));

  // Screws hidden
  parts.screws.forEach((s, i) => {
    s.position = a.screws[i].add(new Vector3(0, 0.9, 0));
    s.isVisible = false;
  });
}

export { BASE_H, COL_H, BRACKET_H, TOP_H };
