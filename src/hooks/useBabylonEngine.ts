import { useEffect, useRef } from 'react';
import { Engine, Scene } from '@babylonjs/core';

export function useBabylonEngine(
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  onSceneReady?: (scene: Scene) => void
) {
  const onSceneReadyRef = useRef(onSceneReady);
  onSceneReadyRef.current = onSceneReady;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const engine = new Engine(canvas, true, { preserveDrawingBuffer: true, stencil: true });
    const scene = new Scene(engine);

    // Let the consumer set up camera/lights/meshes BEFORE the render loop starts
    onSceneReadyRef.current?.(scene);

    engine.runRenderLoop(() => {
      scene.render();
    });

    const handleResize = () => engine.resize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      engine.stopRenderLoop();
      scene.dispose();
      engine.dispose();
    };
  }, [canvasRef]);
}
