import { useRef } from 'react';
import { Scene } from '@babylonjs/core';
import { useBabylonEngine } from '../hooks/useBabylonEngine';

interface BabylonSceneProps {
  onSceneReady: (scene: Scene) => void;
}

export function BabylonScene({ onSceneReady }: BabylonSceneProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useBabylonEngine(canvasRef, onSceneReady);

  return <canvas ref={canvasRef} className="render-canvas" />;
}
