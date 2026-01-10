/**
 * Raycaster hook for pointer tracking and intersection detection in 3D scenes
 * Used in: PortfolioScene for detecting hover/click interactions
 */

import * as React from "react";
import { useThree, useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface UseSceneRaycasterOptions {
  interactiveMeshes: THREE.Mesh[];
  enabled?: boolean;
}

interface RaycasterResult {
  intersects: THREE.Intersection[];
}

/** Hook for raycaster-based pointer tracking and intersection detection */
export function useSceneRaycaster({ interactiveMeshes, enabled = true }: UseSceneRaycasterOptions): RaycasterResult {
  const { camera, size } = useThree();
  const raycaster = React.useRef(new THREE.Raycaster());
  const pointer = React.useRef(new THREE.Vector2());
  const [intersects, setIntersects] = React.useState<THREE.Intersection[]>([]);
  const lastEnabledStateRef = React.useRef(enabled);
  const requiresMouseMoveRef = React.useRef(false);

  // Track when interactions are re-enabled to require mouse movement before detecting intersections
  React.useEffect(() => {
    if (!lastEnabledStateRef.current && enabled) {
      requiresMouseMoveRef.current = true;
    }
    lastEnabledStateRef.current = enabled;
  }, [enabled]);

  // Update pointer on mouse/touch move
  React.useEffect(() => {
    if (!enabled) return;

    const updatePointer = (clientX: number, clientY: number) => {
      pointer.current.x = (clientX / size.width) * 2 - 1;
      pointer.current.y = -(clientY / size.height) * 2 + 1;
      requiresMouseMoveRef.current = false;
    };

    const handleMouseMove = (e: MouseEvent) => {
      updatePointer(e.clientX, e.clientY);
    };

    const handleTouchMove = (e: TouchEvent) => {
      const touch = e.touches[0];
      if (touch) {
        updatePointer(touch.clientX, touch.clientY);
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("touchmove", handleTouchMove, { passive: true });

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("touchmove", handleTouchMove);
    };
  }, [size.width, size.height, enabled]);

  useFrame(() => {
    if (!enabled || interactiveMeshes.length === 0 || requiresMouseMoveRef.current) {
      setIntersects([]);
      return;
    }

    raycaster.current.setFromCamera(pointer.current, camera);
    const intersections = raycaster.current.intersectObjects(interactiveMeshes, false);
    setIntersects(intersections);
  });

  return { intersects };
}
