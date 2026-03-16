import { assemblySteps } from '../animations/assemblySteps';

interface StepControlsProps {
  currentStep: number;
  totalSteps: number;
  isAnimating: boolean;
  onPrev: () => void;
  onNext: () => void;
  onReset: () => void;
}

export function StepControls({
  currentStep,
  totalSteps,
  isAnimating,
  onPrev,
  onNext,
  onReset,
}: StepControlsProps) {
  const step = assemblySteps[currentStep];

  return (
    <div className="step-panel">
      <div className="step-header">
        <h1>KALLAX 2×2</h1>
        <p className="subtitle">Assembly Guide</p>
      </div>

      <div className="step-progress">
        {assemblySteps.map((s) => (
          <div
            key={s.id}
            className={`step-dot ${s.id === currentStep ? 'active' : ''} ${
              s.id < currentStep ? 'done' : ''
            }`}
          />
        ))}
      </div>

      <div className="step-info">
        <h2>
          {currentStep > 0 ? `Step ${currentStep} of ${totalSteps - 1}` : 'Overview'}
        </h2>
        <h3>{step.title}</h3>
        <p>{step.description}</p>
      </div>

      <div className="step-buttons">
        <button
          onClick={onPrev}
          disabled={currentStep === 0 || isAnimating}
          className="btn btn-secondary"
        >
          ← Previous
        </button>
        <button
          onClick={onNext}
          disabled={currentStep === totalSteps - 1 || isAnimating}
          className="btn btn-primary"
        >
          Next →
        </button>
      </div>

      <button
        onClick={onReset}
        disabled={currentStep === 0 || isAnimating}
        className="btn btn-reset"
      >
        Reset
      </button>

      {isAnimating && <div className="animating-indicator">Animating…</div>}
    </div>
  );
}
