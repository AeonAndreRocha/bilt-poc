import { useEffect, useRef, useCallback } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

/* ── Types ─────────────────────────────────────────────────────── */

export interface MeshInfo {
  name: string;
  uuid: string;
}

export interface MaterialInfo {
  name: string;
  uuid: string;
  originalColor: string;
}

export interface AnimationInfo {
  name: string;
  index: number;
}

export interface ModelMetadata {
  meshes: MeshInfo[];
  materials: MaterialInfo[];
  animations: AnimationInfo[];
}

export interface LightingConfig {
  ambientIntensity: number;
  directionalIntensity: number;
}

interface GlbSceneProps {
  glbData: ArrayBuffer;
  wireframe: boolean;
  showBoundingBox: boolean;
  visibilityMap: Record<string, boolean>;
  colorMap: Record<string, string>;
  lighting: LightingConfig;
  activeAnimation: string | null;
  animationPlaying: boolean;
  onMetadataReady: (meta: ModelMetadata) => void;
  onExportReady: (exportFn: () => void) => void;
}

/* ── Inner component: renders the model inside Canvas ──────────── */

function Model({
  glbData,
  wireframe,
  showBoundingBox,
  visibilityMap,
  colorMap,
  activeAnimation,
  animationPlaying,
  onMetadataReady,
  onExportReady,
}: Omit<GlbSceneProps, 'lighting'>) {
  const { scene: rootScene } = useThree();
  const mixerRef = useRef<THREE.AnimationMixer | null>(null);
  const actionRef = useRef<THREE.AnimationAction | null>(null);
  const modelRef = useRef<THREE.Group | null>(null);
  const clipsRef = useRef<THREE.AnimationClip[]>([]);
  const boxHelperRef = useRef<THREE.BoxHelper | null>(null);
  const originalMaterialsRef = useRef<Map<string, THREE.Material>>(new Map());

  // Parse GLB and mount model
  useEffect(() => {
    let cancelled = false;
    const loader = new GLTFLoader();

    loader.parse(
      glbData.slice(0), // copy so the original stays transferable
      '',
      (gltf) => {
        if (cancelled) return;

        const model = gltf.scene;
        modelRef.current = model;
        clipsRef.current = gltf.animations;

        // Auto-center and scale
        const box = new THREE.Box3().setFromObject(model);
        const size = box.getSize(new THREE.Vector3());
        const center = box.getCenter(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z);
        const scale = 2 / maxDim;
        model.scale.setScalar(scale);
        model.position.set(-center.x * scale, -box.min.y * scale, -center.z * scale);

        rootScene.add(model);

        // Store original materials for reset
        const meshes: MeshInfo[] = [];
        const materialSet = new Map<string, MaterialInfo>();

        model.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            const mesh = child as THREE.Mesh;
            const name = mesh.name || `Mesh_${mesh.uuid.slice(0, 6)}`;
            meshes.push({ name, uuid: mesh.uuid });

            const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
            for (const mat of mats) {
              if (mat && !materialSet.has(mat.uuid)) {
                const stdMat = mat as THREE.MeshStandardMaterial;
                originalMaterialsRef.current.set(mat.uuid, mat.clone());
                materialSet.set(mat.uuid, {
                  name: mat.name || `Material_${mat.uuid.slice(0, 6)}`,
                  uuid: mat.uuid,
                  originalColor: stdMat.color ? '#' + stdMat.color.getHexString() : '#ffffff',
                });
              }
            }
          }
        });

        const animations: AnimationInfo[] = gltf.animations.map((clip, i) => ({
          name: clip.name || `Animation_${i}`,
          index: i,
        }));

        onMetadataReady({ meshes, materials: Array.from(materialSet.values()), animations });

        // Animation mixer
        mixerRef.current = new THREE.AnimationMixer(model);
      },
      (err) => {
        console.error('GLB parse error:', err);
      },
    );

    return () => {
      cancelled = true;
      const model = modelRef.current;
      if (model) rootScene.remove(model);
      mixerRef.current?.stopAllAction();
      mixerRef.current = null;
      if (boxHelperRef.current) {
        rootScene.remove(boxHelperRef.current);
        boxHelperRef.current = null;
      }
      modelRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [glbData]);

  // Wireframe
  useEffect(() => {
    const model = modelRef.current;
    if (!model) return;
    model.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
        for (const mat of mats) {
          (mat as THREE.MeshStandardMaterial).wireframe = wireframe;
        }
      }
    });
  }, [wireframe]);

  // Visibility
  useEffect(() => {
    const model = modelRef.current;
    if (!model) return;
    model.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const vis = visibilityMap[child.uuid];
        if (vis !== undefined) child.visible = vis;
      }
    });
  }, [visibilityMap]);

  // Material colors
  useEffect(() => {
    const model = modelRef.current;
    if (!model) return;
    model.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
        for (const mat of mats) {
          const stdMat = mat as THREE.MeshStandardMaterial;
          const hex = colorMap[mat.uuid];
          if (hex && stdMat.color) {
            stdMat.color.set(hex);
          }
        }
      }
    });
  }, [colorMap]);

  // Bounding box
  useEffect(() => {
    const model = modelRef.current;
    if (!model) return;

    if (showBoundingBox) {
      const helper = new THREE.BoxHelper(model, 0xff8800);
      rootScene.add(helper);
      boxHelperRef.current = helper;
    } else if (boxHelperRef.current) {
      rootScene.remove(boxHelperRef.current);
      boxHelperRef.current = null;
    }
    return () => {
      if (boxHelperRef.current) {
        rootScene.remove(boxHelperRef.current);
        boxHelperRef.current = null;
      }
    };
  }, [showBoundingBox, rootScene]);

  // Animation playback
  useEffect(() => {
    const mixer = mixerRef.current;
    if (!mixer) return;

    // Stop previous
    actionRef.current?.stop();
    actionRef.current = null;

    if (activeAnimation !== null) {
      const clip = clipsRef.current.find((c) => c.name === activeAnimation);
      if (clip) {
        const action = mixer.clipAction(clip);
        actionRef.current = action;
        if (animationPlaying) action.play();
      }
    }
  }, [activeAnimation, animationPlaying]);

  // Animation tick
  useFrame((_, delta) => {
    if (mixerRef.current && animationPlaying) {
      mixerRef.current.update(delta);
    }
    // Update bounding box helper
    boxHelperRef.current?.update();
  });

  // Export function
  const handleExport = useCallback(async () => {
    const model = modelRef.current;
    if (!model) return;

    const { GLTFExporter } = await import('three/examples/jsm/exporters/GLTFExporter.js');
    const exporter = new GLTFExporter();
    exporter.parse(
      model,
      (result) => {
        const blob =
          result instanceof ArrayBuffer
            ? new Blob([result], { type: 'model/gltf-binary' })
            : new Blob([JSON.stringify(result)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'model.glb';
        a.click();
        URL.revokeObjectURL(url);
      },
      (err) => console.error('Export error:', err),
      { binary: true },
    );
  }, []);

  useEffect(() => {
    onExportReady(handleExport);
  }, [handleExport, onExportReady]);

  return null;
}

/* ── Main scene wrapper ────────────────────────────────────────── */

export function GlbScene(props: GlbSceneProps) {
  const { lighting, ...modelProps } = props;

  return (
    <Canvas
      camera={{ position: [3, 2, 3], fov: 50 }}
      style={{ width: '100%', height: '100%' }}
      gl={{ preserveDrawingBuffer: true }}
    >
      <ambientLight intensity={lighting.ambientIntensity} />
      <directionalLight position={[5, 8, 5]} intensity={lighting.directionalIntensity} castShadow />
      <Environment preset="studio" />
      <gridHelper args={[10, 10, '#ccc', '#eee']} />
      <OrbitControls makeDefault />
      <Model {...modelProps} />
    </Canvas>
  );
}
