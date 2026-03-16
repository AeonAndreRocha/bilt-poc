import {
  Animation,
  CubicEase,
  EasingFunction,
  Mesh,
  Scene,
  Vector3,
} from '@babylonjs/core';
import { KallaxParts, getAssembledPositions, setExplodedPositions } from '../scene/kallaxParts';

export interface AssemblyStep {
  id: number;
  title: string;
  description: string;
  animate: (scene: Scene, parts: KallaxParts) => Promise<void>;
  setup: (parts: KallaxParts) => void;
}

const FPS = 60;
const FRAMES = 60;

function easeInOut() {
  const ease = new CubicEase();
  ease.setEasingMode(EasingFunction.EASINGMODE_EASEINOUT);
  return ease;
}

function animatePosition(scene: Scene, mesh: Mesh, target: Vector3, frames = FRAMES): Promise<void> {
  return new Promise((resolve) => {
    const anim = new Animation(
      `${mesh.name}_move`, 'position', FPS,
      Animation.ANIMATIONTYPE_VECTOR3,
      Animation.ANIMATIONLOOPMODE_CONSTANT
    );
    anim.setKeys([
      { frame: 0, value: mesh.position.clone() },
      { frame: frames, value: target.clone() },
    ]);
    anim.setEasingFunction(easeInOut());
    mesh.animations = [anim];
    scene.beginAnimation(mesh, 0, frames, false, 1, () => resolve());
  });
}

function animateAll(scene: Scene, items: { mesh: Mesh; target: Vector3 }[], frames = FRAMES): Promise<void> {
  return Promise.all(items.map(({ mesh, target }) => animatePosition(scene, mesh, target, frames))).then(() => {});
}

function showDowels(dowels: Mesh[], indices: number[]) {
  indices.forEach((i) => { dowels[i].isVisible = true; });
}

const a = getAssembledPositions();

/*
 * Assembly order (IKEA-style, built on its side then stood up):
 *
 *  0. Overview — exploded view of all 7 panels
 *  1. Lay bottom panel flat
 *  2. Attach left & right side walls
 *  3. Insert bottom-row vertical divider
 *  4. Slide in horizontal middle shelf
 *  5. Insert top-row vertical divider
 *  6. Close with top panel
 *  7. Complete!
 */

export const assemblySteps: AssemblyStep[] = [
  // ── Step 0: Overview ──────────────────────────────────────────────
  {
    id: 0,
    title: 'Overview — All Parts',
    description:
      'Here are all 7 panels: top, bottom, left wall, right wall, horizontal shelf, and 2 vertical dividers. Let\'s assemble!',
    animate: async (_scene, parts) => { setExplodedPositions(parts); },
    setup:   (parts) => { setExplodedPositions(parts); },
  },

  // ── Step 1: Bottom panel ──────────────────────────────────────────
  {
    id: 1,
    title: 'Lay Down Bottom Panel',
    description:
      'Lay the bottom panel flat on a clean surface. This is the foundation of your KALLAX.',
    animate: async (scene, parts) => {
      await animatePosition(scene, parts.bottom, a.bottom);
    },
    setup: (parts) => {
      parts.bottom.position = a.bottom.clone();
    },
  },

  // ── Step 2: Side walls ────────────────────────────────────────────
  {
    id: 2,
    title: 'Attach Side Walls',
    description:
      'Insert dowels and attach the left and right side walls to the bottom panel.',
    animate: async (scene, parts) => {
      showDowels(parts.dowels, [2, 3, 4, 5]);
      await animateAll(scene, [
        { mesh: parts.leftWall,  target: a.leftWall },
        { mesh: parts.rightWall, target: a.rightWall },
        ...([2, 3, 4, 5].map(i => ({ mesh: parts.dowels[i], target: a.dowels[i] }))),
      ]);
    },
    setup: (parts) => {
      parts.leftWall.position  = a.leftWall.clone();
      parts.rightWall.position = a.rightWall.clone();
      showDowels(parts.dowels, [2, 3, 4, 5]);
      [2, 3, 4, 5].forEach(i => { parts.dowels[i].position = a.dowels[i].clone(); });
    },
  },

  // ── Step 3: Bottom-row divider ────────────────────────────────────
  {
    id: 3,
    title: 'Place Bottom-Row Divider',
    description:
      'Insert dowels into the short vertical divider and place it between the side walls. This splits the bottom row into two cubes.',
    animate: async (scene, parts) => {
      showDowels(parts.dowels, [0, 1, 6, 7]);
      await animateAll(scene, [
        { mesh: parts.vDivBottom, target: a.vDivBottom },
        ...([0, 1, 6, 7].map(i => ({ mesh: parts.dowels[i], target: a.dowels[i] }))),
      ], 50);
    },
    setup: (parts) => {
      parts.vDivBottom.position = a.vDivBottom.clone();
      showDowels(parts.dowels, [0, 1, 6, 7]);
      [0, 1, 6, 7].forEach(i => { parts.dowels[i].position = a.dowels[i].clone(); });
    },
  },

  // ── Step 4: Horizontal shelf ──────────────────────────────────────
  {
    id: 4,
    title: 'Insert Horizontal Shelf',
    description:
      'Slide the horizontal shelf into position. It sits on the divider and between the side walls, creating two separate rows.',
    animate: async (scene, parts) => {
      await animatePosition(scene, parts.hShelf, a.hShelf, 55);
    },
    setup: (parts) => {
      parts.hShelf.position = a.hShelf.clone();
    },
  },

  // ── Step 5: Top-row divider ───────────────────────────────────────
  {
    id: 5,
    title: 'Place Top-Row Divider',
    description:
      'Insert dowels and place the second short vertical divider above the shelf. This splits the top row into two cubes.',
    animate: async (scene, parts) => {
      showDowels(parts.dowels, [8, 9, 10, 11]);
      await animateAll(scene, [
        { mesh: parts.vDivTop, target: a.vDivTop },
        ...([8, 9, 10, 11].map(i => ({ mesh: parts.dowels[i], target: a.dowels[i] }))),
      ], 50);
    },
    setup: (parts) => {
      parts.vDivTop.position = a.vDivTop.clone();
      showDowels(parts.dowels, [8, 9, 10, 11]);
      [8, 9, 10, 11].forEach(i => { parts.dowels[i].position = a.dowels[i].clone(); });
    },
  },

  // ── Step 6: Top panel ─────────────────────────────────────────────
  {
    id: 6,
    title: 'Attach Top Panel',
    description:
      'Lower the top panel onto the structure. Press firmly and secure with dowels. The frame is complete!',
    animate: async (scene, parts) => {
      showDowels(parts.dowels, [12, 13]);
      await animateAll(scene, [
        { mesh: parts.top, target: a.top },
        ...([12, 13].map(i => ({ mesh: parts.dowels[i], target: a.dowels[i] }))),
      ]);
    },
    setup: (parts) => {
      parts.top.position = a.top.clone();
      showDowels(parts.dowels, [12, 13]);
      [12, 13].forEach(i => { parts.dowels[i].position = a.dowels[i].clone(); });
    },
  },

  // ── Step 7: Complete ──────────────────────────────────────────────
  {
    id: 7,
    title: 'Stand Up & Complete!',
    description:
      'Your KALLAX 2×2 shelf is fully assembled! Stand it upright and enjoy your 4 cubes.',
    animate: async () => {},
    setup:   () => {},
  },
];

export function jumpToStep(parts: KallaxParts, stepIndex: number) {
  setExplodedPositions(parts);
  for (let i = 1; i <= stepIndex; i++) {
    assemblySteps[i].setup(parts);
  }
}
