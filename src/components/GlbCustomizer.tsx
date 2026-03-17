import { useState } from 'react';
import type { ModelMetadata } from './GlbScene';

interface GlbCustomizerProps {
  filename: string;
  metadata: ModelMetadata | null;
  wireframe: boolean;
  showBoundingBox: boolean;
  visibilityMap: Record<string, boolean>;
  colorMap: Record<string, string>;
  ambientIntensity: number;
  directionalIntensity: number;
  activeAnimation: string | null;
  animationPlaying: boolean;
  onToggleWireframe: () => void;
  onToggleBoundingBox: () => void;
  onToggleVisibility: (uuid: string) => void;
  onChangeColor: (uuid: string, color: string) => void;
  onResetColor: (uuid: string) => void;
  onSetAmbient: (v: number) => void;
  onSetDirectional: (v: number) => void;
  onSelectAnimation: (name: string | null) => void;
  onToggleAnimation: () => void;
  onStopAnimation: () => void;
  onExport: () => void;
  onLoadNew: () => void;
}

function Section({ title, children, defaultOpen = true }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="glb-section">
      <button className="glb-section-toggle" onClick={() => setOpen(!open)}>
        <span>{open ? '▾' : '▸'}</span> {title}
      </button>
      {open && <div className="glb-section-body">{children}</div>}
    </div>
  );
}

export function GlbCustomizer({
  filename,
  metadata,
  wireframe,
  showBoundingBox,
  visibilityMap,
  colorMap,
  ambientIntensity,
  directionalIntensity,
  activeAnimation,
  animationPlaying,
  onToggleWireframe,
  onToggleBoundingBox,
  onToggleVisibility,
  onChangeColor,
  onResetColor,
  onSetAmbient,
  onSetDirectional,
  onSelectAnimation,
  onToggleAnimation,
  onStopAnimation,
  onExport,
  onLoadNew,
}: GlbCustomizerProps) {
  return (
    <div className="step-panel glb-customizer">
      <div className="step-header">
        <h1>GLB Viewer</h1>
        <p className="subtitle" title={filename}>{filename}</p>
      </div>

      {/* ── Display ──────────────────────────────────────────── */}
      <Section title="Display">
        <label className="glb-checkbox-row">
          <input type="checkbox" checked={wireframe} onChange={onToggleWireframe} />
          Wireframe
        </label>
        <label className="glb-checkbox-row">
          <input type="checkbox" checked={showBoundingBox} onChange={onToggleBoundingBox} />
          Bounding Box
        </label>
      </Section>

      {/* ── Meshes ───────────────────────────────────────────── */}
      {metadata && metadata.meshes.length > 0 && (
        <Section title={`Meshes (${metadata.meshes.length})`}>
          <div className="glb-mesh-tree">
            {metadata.meshes.map((m) => (
              <label key={m.uuid} className="glb-checkbox-row">
                <input
                  type="checkbox"
                  checked={visibilityMap[m.uuid] !== false}
                  onChange={() => onToggleVisibility(m.uuid)}
                />
                {m.name}
              </label>
            ))}
          </div>
        </Section>
      )}

      {/* ── Materials ────────────────────────────────────────── */}
      {metadata && metadata.materials.length > 0 && (
        <Section title={`Materials (${metadata.materials.length})`}>
          {metadata.materials.map((mat) => (
            <div key={mat.uuid} className="glb-color-row">
              <input
                type="color"
                value={colorMap[mat.uuid] ?? mat.originalColor}
                onChange={(e) => onChangeColor(mat.uuid, e.target.value)}
              />
              <span className="glb-color-label">{mat.name}</span>
              {colorMap[mat.uuid] && (
                <button className="glb-inline-btn" onClick={() => onResetColor(mat.uuid)}>
                  Reset
                </button>
              )}
            </div>
          ))}
        </Section>
      )}

      {/* ── Lighting ─────────────────────────────────────────── */}
      <Section title="Lighting">
        <div className="glb-slider-row">
          <label>Ambient</label>
          <input
            type="range"
            min={0}
            max={3}
            step={0.05}
            value={ambientIntensity}
            onChange={(e) => onSetAmbient(Number(e.target.value))}
          />
          <span>{ambientIntensity.toFixed(2)}</span>
        </div>
        <div className="glb-slider-row">
          <label>Directional</label>
          <input
            type="range"
            min={0}
            max={5}
            step={0.05}
            value={directionalIntensity}
            onChange={(e) => onSetDirectional(Number(e.target.value))}
          />
          <span>{directionalIntensity.toFixed(2)}</span>
        </div>
      </Section>

      {/* ── Animations ───────────────────────────────────────── */}
      {metadata && metadata.animations.length > 0 && (
        <Section title={`Animations (${metadata.animations.length})`}>
          <select
            className="glb-select"
            value={activeAnimation ?? ''}
            onChange={(e) => onSelectAnimation(e.target.value || null)}
          >
            <option value="">-- None --</option>
            {metadata.animations.map((a) => (
              <option key={a.index} value={a.name}>
                {a.name}
              </option>
            ))}
          </select>
          <div className="step-buttons" style={{ marginTop: 8 }}>
            <button
              className="btn btn-primary"
              disabled={!activeAnimation}
              onClick={onToggleAnimation}
            >
              {animationPlaying ? 'Pause' : 'Play'}
            </button>
            <button
              className="btn btn-secondary"
              disabled={!activeAnimation}
              onClick={onStopAnimation}
            >
              Stop
            </button>
          </div>
        </Section>
      )}

      {/* ── Actions ──────────────────────────────────────────── */}
      <div className="glb-actions">
        <button className="btn btn-primary" onClick={onExport} style={{ width: '100%' }}>
          Download GLB
        </button>
        <button className="btn-reset" onClick={onLoadNew} style={{ width: '100%', marginTop: 8 }}>
          Load Different Model
        </button>
      </div>
    </div>
  );
}
