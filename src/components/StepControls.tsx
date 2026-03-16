interface StepInfo {
  id: number;
  title: string;
  description: string;
}

interface StepControlsProps {
  currentStep: number;
  totalSteps: number;
  isAnimating: boolean;
  onPrev: () => void;
  onNext: () => void;
  onReset: () => void;
  steps: StepInfo[];
  productName: string;
}

export function StepControls({
  currentStep,
  totalSteps,
  isAnimating,
  onPrev,
  onNext,
  onReset,
  steps,
  productName,
}: StepControlsProps) {
  const step = steps[currentStep];

  return (
    <div className="step-panel">
      <div className="step-header">
        <h1>{productName}</h1>
        <p className="subtitle">Assembly Guide</p>
      </div>

      <div className="step-progress">
        {steps.map((s) => (
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
