import { useCallback, useRef, useState } from 'react';
import { GlbDropZone } from './GlbDropZone';
import { GlbScene, type LightingConfig, type ModelMetadata } from './GlbScene';
import { GlbCustomizer } from './GlbCustomizer';

export function GlbViewer() {
  // File state
  const [glbData, setGlbData] = useState<ArrayBuffer | null>(null);
  const [filename, setFilename] = useState('');

  // Model metadata (populated after scene parses the GLB)
  const [metadata, setMetadata] = useState<ModelMetadata | null>(null);

  // Customization state
  const [wireframe, setWireframe] = useState(false);
  const [showBoundingBox, setShowBoundingBox] = useState(false);
  const [visibilityMap, setVisibilityMap] = useState<Record<string, boolean>>({});
  const [colorMap, setColorMap] = useState<Record<string, string>>({});
  const [lighting, setLighting] = useState<LightingConfig>({
    ambientIntensity: 0.5,
    directionalIntensity: 1.0,
  });

  // Animation state
  const [activeAnimation, setActiveAnimation] = useState<string | null>(null);
  const [animationPlaying, setAnimationPlaying] = useState(false);

  // Export function ref (provided by GlbScene)
  const exportRef = useRef<(() => void) | null>(null);

  // ── Handlers ─────────────────────────────────────────────────

  const handleFileLoaded = useCallback((buffer: ArrayBuffer, name: string) => {
    setGlbData(buffer);
    setFilename(name);
    // Reset all customization
    setMetadata(null);
    setWireframe(false);
    setShowBoundingBox(false);
    setVisibilityMap({});
    setColorMap({});
    setLighting({ ambientIntensity: 0.5, directionalIntensity: 1.0 });
    setActiveAnimation(null);
    setAnimationPlaying(false);
    exportRef.current = null;
  }, []);

  const handleMetadataReady = useCallback((meta: ModelMetadata) => {
    setMetadata(meta);
    // Initialize visibility map — all visible
    const vis: Record<string, boolean> = {};
    for (const m of meta.meshes) vis[m.uuid] = true;
    setVisibilityMap(vis);
  }, []);

  const handleExportReady = useCallback((fn: () => void) => {
    exportRef.current = fn;
  }, []);

  const handleLoadNew = useCallback(() => {
    setGlbData(null);
    setFilename('');
    setMetadata(null);
  }, []);

  const handleToggleVisibility = useCallback((uuid: string) => {
    setVisibilityMap((prev) => ({ ...prev, [uuid]: !prev[uuid] }));
  }, []);

  const handleChangeColor = useCallback((uuid: string, color: string) => {
    setColorMap((prev) => ({ ...prev, [uuid]: color }));
  }, []);

  const handleResetColor = useCallback((uuid: string) => {
    setColorMap((prev) => {
      const next = { ...prev };
      delete next[uuid];
      return next;
    });
  }, []);

  const handleToggleAnimation = useCallback(() => {
    setAnimationPlaying((prev) => !prev);
  }, []);

  const handleStopAnimation = useCallback(() => {
    setAnimationPlaying(false);
    setActiveAnimation(null);
  }, []);

  // ── Render ───────────────────────────────────────────────────

  if (!glbData) {
    return (
      <div className="assembly-viewer">
        <GlbDropZone onFileLoaded={handleFileLoaded} />
      </div>
    );
  }

  return (
    <div className="assembly-viewer">
      <div className="scene-container">
        <GlbScene
          glbData={glbData}
          wireframe={wireframe}
          showBoundingBox={showBoundingBox}
          visibilityMap={visibilityMap}
          colorMap={colorMap}
          lighting={lighting}
          activeAnimation={activeAnimation}
          animationPlaying={animationPlaying}
          onMetadataReady={handleMetadataReady}
          onExportReady={handleExportReady}
        />
      </div>
      <GlbCustomizer
        filename={filename}
        metadata={metadata}
        wireframe={wireframe}
        showBoundingBox={showBoundingBox}
        visibilityMap={visibilityMap}
        colorMap={colorMap}
        ambientIntensity={lighting.ambientIntensity}
        directionalIntensity={lighting.directionalIntensity}
        activeAnimation={activeAnimation}
        animationPlaying={animationPlaying}
        onToggleWireframe={() => setWireframe((p) => !p)}
        onToggleBoundingBox={() => setShowBoundingBox((p) => !p)}
        onToggleVisibility={handleToggleVisibility}
        onChangeColor={handleChangeColor}
        onResetColor={handleResetColor}
        onSetAmbient={(v) => setLighting((l) => ({ ...l, ambientIntensity: v }))}
        onSetDirectional={(v) => setLighting((l) => ({ ...l, directionalIntensity: v }))}
        onSelectAnimation={setActiveAnimation}
        onToggleAnimation={handleToggleAnimation}
        onStopAnimation={handleStopAnimation}
        onExport={() => exportRef.current?.()}
        onLoadNew={handleLoadNew}
      />
    </div>
  );
}
