/**
 * Raycaster hook for pointer tracking and intersection detection in 3D scenes
 * Used in: PortfolioScene for detecting hover/click interactions
 */

import * as React from "react";
import { useThree, useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface UseSceneRaycasterOptions {
  hitboxes: THREE.Mesh[];
  enabled?: boolean;
}

interface RaycasterResult {
  intersects: THREE.Intersection[];
  pointer: THREE.Vector2;
}

/**
 * Hook for raycaster-based pointer tracking and intersection detection
 */
export function useSceneRaycaster({
  hitboxes,
  enabled = true,
}: UseSceneRaycasterOptions): RaycasterResult {
  const { camera, size } = useThree();
  const raycaster = React.useRef(new THREE.Raycaster());
  const pointer = React.useRef(new THREE.Vector2());
  const [intersects, setIntersects] = React.useState<THREE.Intersection[]>([]);

  // Update pointer on mouse/touch move
  React.useEffect(() => {
    if (!enabled) return;

    const updatePointer = (clientX: number, clientY: number) => {
      pointer.current.x = (clientX / size.width) * 2 - 1;
      pointer.current.y = -(clientY / size.height) * 2 + 1;
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

  // Perform raycaster intersection tests in animation loop
  useFrame(() => {
    if (!enabled || hitboxes.length === 0) {
      setIntersects([]);
      return;
    }

    raycaster.current.setFromCamera(pointer.current, camera);
    const intersections = raycaster.current.intersectObjects(hitboxes, false);
    setIntersects(intersections);
  });

  return {
    intersects,
    pointer: pointer.current,
  };
}

