import { useCallback, useRef, useState } from 'react';
import { Scene } from '@babylonjs/core';
import { BabylonScene } from './BabylonScene';
import { StepControls } from './StepControls';
import { setupScene } from '../scene/createScene';
import { createLundtoftParts, LundtoftParts } from '../scene/lundtoftParts';
import { lundtoftSteps, jumpToLundtoftStep } from '../animations/lundtoftSteps';

export function LundtoftViewer() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const partsRef = useRef<LundtoftParts | null>(null);
  const sceneRef = useRef<Scene | null>(null);

  const handleSceneReady = useCallback((scene: Scene) => {
    sceneRef.current = scene;
    const { shadowGen, camera } = setupScene(scene);
    // Adjust camera for taller table
    camera.radius = 2.0;
    camera.target.y = 0.35;
    partsRef.current = createLundtoftParts(scene, shadowGen);
  }, []);

  const handleNext = useCallback(async () => {
    const scene = sceneRef.current;
    const parts = partsRef.current;
    if (!scene || !parts || isAnimating) return;

    const nextStep = currentStep + 1;
    if (nextStep >= lundtoftSteps.length) return;

    setIsAnimating(true);
    setCurrentStep(nextStep);

    try {
      await lundtoftSteps[nextStep].animate(scene, parts);
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
    jumpToLundtoftStep(parts, prevStep);
  }, [currentStep, isAnimating]);

  const handleReset = useCallback(() => {
    const parts = partsRef.current;
    if (!parts || isAnimating) return;

    setCurrentStep(0);
    jumpToLundtoftStep(parts, 0);
  }, [isAnimating]);

  return (
    <div className="assembly-viewer">
      <div className="scene-container">
        <BabylonScene onSceneReady={handleSceneReady} />
      </div>
      <StepControls
        currentStep={currentStep}
        totalSteps={lundtoftSteps.length}
        isAnimating={isAnimating}
        onPrev={handlePrev}
        onNext={handleNext}
        onReset={handleReset}
        steps={lundtoftSteps}
        productName="LUNDTOFT"
      />
    </div>
  );
}
