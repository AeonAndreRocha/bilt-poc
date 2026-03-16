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
 * Assembly order with separate dowel steps:
 *
 *  0.  Overview — exploded view
 *  1.  Lay bottom panel flat
 *  2.  Insert dowels into bottom panel (for side walls)
 *  3.  Attach side walls
 *  4.  Insert dowels into bottom panel (for center divider)
 *  5.  Place bottom-row divider
 *  6.  Insert dowels on top of divider (for shelf)
 *  7.  Slide in horizontal shelf
 *  8.  Insert dowels on shelf (for top divider)
 *  9.  Place top-row divider
 *  10. Insert dowels for top panel
 *  11. Attach top panel
 *  12. Complete!
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

  // ── Step 2: Dowels for side walls ─────────────────────────────────
  {
    id: 2,
    title: 'Insert Dowels for Side Walls',
    description:
      'Push 4 wooden dowels into the pre-drilled holes near the left and right edges of the bottom panel.',
    animate: async (scene, parts) => {
      showDowels(parts.dowels, [2, 3, 4, 5]);
      await animateAll(scene, [2, 3, 4, 5].map(i => ({ mesh: parts.dowels[i], target: a.dowels[i] })), 45);
    },
    setup: (parts) => {
      showDowels(parts.dowels, [2, 3, 4, 5]);
      [2, 3, 4, 5].forEach(i => { parts.dowels[i].position = a.dowels[i].clone(); });
    },
  },

  // ── Step 3: Attach side walls ─────────────────────────────────────
  {
    id: 3,
    title: 'Attach Side Walls',
    description:
      'Lower the left and right side walls onto the dowels. Press firmly until flush with the bottom panel.',
    animate: async (scene, parts) => {
      await animateAll(scene, [
        { mesh: parts.leftWall,  target: a.leftWall },
        { mesh: parts.rightWall, target: a.rightWall },
      ]);
    },
    setup: (parts) => {
      parts.leftWall.position  = a.leftWall.clone();
      parts.rightWall.position = a.rightWall.clone();
    },
  },

  // ── Step 4: Dowels for center divider ─────────────────────────────
  {
    id: 4,
    title: 'Insert Dowels for Divider',
    description:
      'Push 2 dowels into the center of the bottom panel. These will hold the bottom-row vertical divider.',
    animate: async (scene, parts) => {
      showDowels(parts.dowels, [0, 1]);
      await animateAll(scene, [0, 1].map(i => ({ mesh: parts.dowels[i], target: a.dowels[i] })), 45);
    },
    setup: (parts) => {
      showDowels(parts.dowels, [0, 1]);
      [0, 1].forEach(i => { parts.dowels[i].position = a.dowels[i].clone(); });
    },
  },

  // ── Step 5: Bottom-row divider ────────────────────────────────────
  {
    id: 5,
    title: 'Place Bottom-Row Divider',
    description:
      'Lower the short vertical divider onto the dowels between the side walls. This splits the bottom row into two cubes.',
    animate: async (scene, parts) => {
      await animatePosition(scene, parts.vDivBottom, a.vDivBottom, 50);
    },
    setup: (parts) => {
      parts.vDivBottom.position = a.vDivBottom.clone();
    },
  },

  // ── Step 6: Dowels on top of divider (for shelf) ──────────────────
  {
    id: 6,
    title: 'Insert Dowels on Divider',
    description:
      'Push 2 dowels into the top of the divider. These will secure the horizontal shelf.',
    animate: async (scene, parts) => {
      showDowels(parts.dowels, [6, 7]);
      await animateAll(scene, [6, 7].map(i => ({ mesh: parts.dowels[i], target: a.dowels[i] })), 45);
    },
    setup: (parts) => {
      showDowels(parts.dowels, [6, 7]);
      [6, 7].forEach(i => { parts.dowels[i].position = a.dowels[i].clone(); });
    },
  },

  // ── Step 7: Horizontal shelf ──────────────────────────────────────
  {
    id: 7,
    title: 'Insert Horizontal Shelf',
    description:
      'Slide the horizontal shelf into position. It rests on the divider and side walls, creating two rows.',
    animate: async (scene, parts) => {
      await animatePosition(scene, parts.hShelf, a.hShelf, 55);
    },
    setup: (parts) => {
      parts.hShelf.position = a.hShelf.clone();
    },
  },

  // ── Step 8: Dowels on shelf (for top divider) ─────────────────────
  {
    id: 8,
    title: 'Insert Dowels on Shelf',
    description:
      'Push 2 dowels into the top of the horizontal shelf. These will hold the top-row divider.',
    animate: async (scene, parts) => {
      showDowels(parts.dowels, [8, 9]);
      await animateAll(scene, [8, 9].map(i => ({ mesh: parts.dowels[i], target: a.dowels[i] })), 45);
    },
    setup: (parts) => {
      showDowels(parts.dowels, [8, 9]);
      [8, 9].forEach(i => { parts.dowels[i].position = a.dowels[i].clone(); });
    },
  },

  // ── Step 9: Top-row divider ───────────────────────────────────────
  {
    id: 9,
    title: 'Place Top-Row Divider',
    description:
      'Lower the second short vertical divider onto the dowels above the shelf. This splits the top row into two cubes.',
    animate: async (scene, parts) => {
      await animatePosition(scene, parts.vDivTop, a.vDivTop, 50);
    },
    setup: (parts) => {
      parts.vDivTop.position = a.vDivTop.clone();
    },
  },

  // ── Step 10: Dowels for top panel ─────────────────────────────────
  {
    id: 10,
    title: 'Insert Dowels for Top',
    description:
      'Push dowels into the top of the divider and the tops of both side walls. These will secure the top panel.',
    animate: async (scene, parts) => {
      showDowels(parts.dowels, [10, 11, 12, 13]);
      await animateAll(scene, [10, 11, 12, 13].map(i => ({ mesh: parts.dowels[i], target: a.dowels[i] })), 45);
    },
    setup: (parts) => {
      showDowels(parts.dowels, [10, 11, 12, 13]);
      [10, 11, 12, 13].forEach(i => { parts.dowels[i].position = a.dowels[i].clone(); });
    },
  },

  // ── Step 11: Top panel ────────────────────────────────────────────
  {
    id: 11,
    title: 'Attach Top Panel',
    description:
      'Lower the top panel onto all the dowels. Press firmly until flush. The frame is complete!',
    animate: async (scene, parts) => {
      await animatePosition(scene, parts.top, a.top);
    },
    setup: (parts) => {
      parts.top.position = a.top.clone();
    },
  },

  // ── Step 12: Complete ─────────────────────────────────────────────
  {
    id: 12,
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
