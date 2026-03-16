import {
  Animation,
  CubicEase,
  EasingFunction,
  Mesh,
  Scene,
  Vector3,
} from '@babylonjs/core';
import { LundtoftParts, getAssembledPositions, setExplodedPositions } from '../scene/lundtoftParts';

export interface LundtoftStep {
  id: number;
  title: string;
  description: string;
  animate: (scene: Scene, parts: LundtoftParts) => Promise<void>;
  setup: (parts: LundtoftParts) => void;
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

function showScrews(screws: Mesh[], indices: number[]) {
  indices.forEach((i) => { screws[i].isVisible = true; });
}

const a = getAssembledPositions();

/*
 * LUNDTOFT assembly order (from JYSK manual):
 *
 *  0.  Overview — exploded view
 *  1.  Place base foot
 *  2.  Insert screws for column (4× M6×11mm)
 *  3.  Attach column to base
 *  4.  Insert screws for bracket (6× M6×11mm)
 *  5.  Attach mounting bracket to column
 *  6.  Insert screws for table top (4× M6×30mm + washers)
 *  7.  Attach table top
 *  8.  Complete!
 */

export const lundtoftSteps: LundtoftStep[] = [
  // ── Step 0: Overview ──────────────────────────────────────────────
  {
    id: 0,
    title: 'Overview — All Parts',
    description:
      'Here are the 4 parts: base foot, column, mounting bracket, and table top. Plus 14 screws. Let\'s assemble!',
    animate: async (_scene, parts) => { setExplodedPositions(parts); },
    setup:   (parts) => { setExplodedPositions(parts); },
  },

  // ── Step 1: Base foot ─────────────────────────────────────────────
  {
    id: 1,
    title: 'Place Base Foot',
    description:
      'Place the base foot (④) upside-down on a clean, flat surface.',
    animate: async (scene, parts) => {
      await animatePosition(scene, parts.base, a.base);
    },
    setup: (parts) => {
      parts.base.position = a.base.clone();
    },
  },

  // ── Step 2: Screws for column ─────────────────────────────────────
  {
    id: 2,
    title: 'Insert Screws for Column',
    description:
      'Insert 4× M6×11mm screws (A) into the pre-drilled holes in the base for the column attachment.',
    animate: async (scene, parts) => {
      showScrews(parts.screws, [0, 1, 2, 3]);
      await animateAll(scene, [0, 1, 2, 3].map(i => ({ mesh: parts.screws[i], target: a.screws[i] })), 45);
    },
    setup: (parts) => {
      showScrews(parts.screws, [0, 1, 2, 3]);
      [0, 1, 2, 3].forEach(i => { parts.screws[i].position = a.screws[i].clone(); });
    },
  },

  // ── Step 3: Attach column ─────────────────────────────────────────
  {
    id: 3,
    title: 'Attach Column to Base',
    description:
      'Lower the column (①) onto the base foot and tighten with the allen key (D). The column slots into the center of the base.',
    animate: async (scene, parts) => {
      await animatePosition(scene, parts.column, a.column);
    },
    setup: (parts) => {
      parts.column.position = a.column.clone();
    },
  },

  // ── Step 4: Screws for bracket ────────────────────────────────────
  {
    id: 4,
    title: 'Insert Screws for Bracket',
    description:
      'Insert 6× M6×11mm screws (A) into the top of the column to attach the mounting bracket.',
    animate: async (scene, parts) => {
      showScrews(parts.screws, [4, 5, 6, 7, 8, 9]);
      await animateAll(scene, [4, 5, 6, 7, 8, 9].map(i => ({ mesh: parts.screws[i], target: a.screws[i] })), 45);
    },
    setup: (parts) => {
      showScrews(parts.screws, [4, 5, 6, 7, 8, 9]);
      [4, 5, 6, 7, 8, 9].forEach(i => { parts.screws[i].position = a.screws[i].clone(); });
    },
  },

  // ── Step 5: Attach bracket ────────────────────────────────────────
  {
    id: 5,
    title: 'Attach Mounting Bracket',
    description:
      'Place the mounting bracket (②) on top of the column and tighten with the allen key. This bracket will hold the table top.',
    animate: async (scene, parts) => {
      await animatePosition(scene, parts.bracket, a.bracket, 50);
    },
    setup: (parts) => {
      parts.bracket.position = a.bracket.clone();
    },
  },

  // ── Step 6: Screws for top ────────────────────────────────────────
  {
    id: 6,
    title: 'Insert Screws for Table Top',
    description:
      'Insert 4× M6×30mm screws (B) with washers (C) through the bracket holes. These will secure the table top.',
    animate: async (scene, parts) => {
      showScrews(parts.screws, [10, 11, 12, 13]);
      await animateAll(scene, [10, 11, 12, 13].map(i => ({ mesh: parts.screws[i], target: a.screws[i] })), 45);
    },
    setup: (parts) => {
      showScrews(parts.screws, [10, 11, 12, 13]);
      [10, 11, 12, 13].forEach(i => { parts.screws[i].position = a.screws[i].clone(); });
    },
  },

  // ── Step 7: Attach table top ──────────────────────────────────────
  {
    id: 7,
    title: 'Attach Table Top',
    description:
      'Lower the table top (③) onto the mounting bracket and tighten the screws with the allen key (D).',
    animate: async (scene, parts) => {
      await animatePosition(scene, parts.top, a.top);
    },
    setup: (parts) => {
      parts.top.position = a.top.clone();
    },
  },

  // ── Step 8: Complete ──────────────────────────────────────────────
  {
    id: 8,
    title: 'Complete!',
    description:
      'Your LUNDTOFT side table is fully assembled! Flip it upright. Max load: 5 kg. Adjust height by loosening the column lock.',
    animate: async () => {},
    setup:   () => {},
  },
];

export function jumpToLundtoftStep(parts: LundtoftParts, stepIndex: number) {
  setExplodedPositions(parts);
  for (let i = 1; i <= stepIndex; i++) {
    lundtoftSteps[i].setup(parts);
  }
}
