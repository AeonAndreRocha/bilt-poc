import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { useHotspotData } from '../hooks/useHotspotData';
import { HotspotPopup } from './HotspotPopup';

interface HotspotMarkerProps {
  id: string;
  position: [number, number, number];
  isActive: boolean;
  onSelect: (id: string) => void;
  onClose: () => void;
}

export function HotspotMarker({ id, position, isActive, onSelect, onClose }: HotspotMarkerProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  const { data, loading } = useHotspotData(isActive ? id : null);

  // Pulsing animation for the indicator dot
  useFrame(({ clock }) => {
    if (meshRef.current) {
      const s = 1 + 0.15 * Math.sin(clock.elapsedTime * 3);
      meshRef.current.scale.setScalar(s);
    }
    if (ringRef.current) {
      const s = 1 + 0.3 * Math.sin(clock.elapsedTime * 2);
      ringRef.current.scale.setScalar(s);
      (ringRef.current.material as THREE.MeshBasicMaterial).opacity =
        0.3 + 0.2 * Math.sin(clock.elapsedTime * 2);
    }
  });

  return (
    <group position={position}>
      {/* Outer pulsing ring */}
      <mesh ref={ringRef} rotation-x={-Math.PI / 2}>
        <ringGeometry args={[0.04, 0.065, 32]} />
        <meshBasicMaterial color="#00aaff" transparent opacity={0.4} side={THREE.DoubleSide} />
      </mesh>

      {/* Inner dot */}
      <mesh
        ref={meshRef}
        onClick={(e) => {
          e.stopPropagation();
          onSelect(id);
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={() => {
          document.body.style.cursor = 'auto';
        }}
      >
        <sphereGeometry args={[0.03, 16, 16]} />
        <meshStandardMaterial
          color={isActive ? '#ff6600' : '#00aaff'}
          emissive={isActive ? '#ff6600' : '#00aaff'}
          emissiveIntensity={0.8}
          toneMapped={false}
        />
      </mesh>

      {/* Rich popup via HTML overlay */}
      {isActive && data && (
        <Html
          distanceFactor={4}
          position={[0, 0.1, 0]}
          center
          style={{ pointerEvents: 'auto' }}
          occlude={false}
        >
          <HotspotPopup data={data} loading={loading} onClose={onClose} />
        </Html>
      )}
    </group>
  );
}
