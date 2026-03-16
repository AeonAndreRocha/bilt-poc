import { useCallback, useRef, useState } from 'react';
import { Scene } from '@babylonjs/core';
import { BabylonScene } from './BabylonScene';
import { StepControls } from './StepControls';
import { setupScene } from '../scene/createScene';
import { createKallaxParts, KallaxParts } from '../scene/kallaxParts';
import { assemblySteps, jumpToStep } from '../animations/assemblySteps';

export function AssemblyViewer() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const partsRef = useRef<KallaxParts | null>(null);
  const sceneRef = useRef<Scene | null>(null);

  const handleSceneReady = useCallback((scene: Scene) => {
    sceneRef.current = scene;
    const { shadowGen } = setupScene(scene);
    partsRef.current = createKallaxParts(scene, shadowGen);
  }, []);

  const handleNext = useCallback(async () => {
    const scene = sceneRef.current;
    const parts = partsRef.current;
    if (!scene || !parts || isAnimating) return;

    const nextStep = currentStep + 1;
    if (nextStep >= assemblySteps.length) return;

    setIsAnimating(true);
    setCurrentStep(nextStep);

    try {
      await assemblySteps[nextStep].animate(scene, parts);
    } finally {
      setIsAnimating(false);
    }
  }, [currentStep, isAnimating]);

  const handlePrev = useCallback(() => {
    const parts = partsRef.current;
    if (!parts || isAnimating) return;

    const prevStep = currentStep - 1;
    if (prevStep < 0) return;

    setCurrentStep(prevStep);
    jumpToStep(parts, prevStep);
  }, [currentStep, isAnimating]);

  const handleReset = useCallback(() => {
    const parts = partsRef.current;
    if (!parts || isAnimating) return;

    setCurrentStep(0);
    jumpToStep(parts, 0);
  }, [isAnimating]);

  return (
    <div className="assembly-viewer">
      <div className="scene-container">
        <BabylonScene onSceneReady={handleSceneReady} />
      </div>
      <StepControls
        currentStep={currentStep}
        totalSteps={assemblySteps.length}
        isAnimating={isAnimating}
        onPrev={handlePrev}
        onNext={handleNext}
        onReset={handleReset}
      />
    </div>
  );
}
