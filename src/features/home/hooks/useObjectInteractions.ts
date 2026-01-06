/**
 * Interaction effects hook for hover animations and click actions
 * Used in: PortfolioScene for handling object interactions
 */

import * as React from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import gsap from "gsap";
import { applyAccentColor, restoreOriginalColors } from "../utils/materialUtils";
import { getClickActionName, type ClickActions } from "../components/sceneInteractions";

interface UseObjectInteractionsOptions {
  intersects: THREE.Intersection[];
  clickActions: ClickActions;
  enabled?: boolean;
}

const HOVER_SCALE = 1.03;

/**
 * Hook for managing hover and click interactions with 3D objects
 */
export function useObjectInteractions({
  intersects,
  clickActions,
  enabled = true,
}: UseObjectInteractionsOptions): void {
  const intersectsRef = React.useRef<THREE.Intersection[]>([]);
  const hoveredHitboxRef = React.useRef<THREE.Mesh | null>(null);

  // Update intersects ref for click handler
  React.useEffect(() => {
    intersectsRef.current = intersects;
  }, [intersects]);

  // Handle click events
  React.useEffect(() => {
    if (!enabled) return;

    const handleClick = () => {
      const currentIntersects = intersectsRef.current;
      if (currentIntersects.length === 0 || !currentIntersects[0]) return;

      const clickedMesh = currentIntersects[0].object as THREE.Mesh;
      const metadata = clickedMesh.userData.metadata;

      if (!metadata || metadata.interactionType !== "clickable") return;

      // Get action name and trigger callback
      const actionName = getClickActionName(metadata.originalObject.name);
      
      // Handle external links first
      if (metadata.originalObject.name.includes("disk_linkedin")) {
        window.open("https://linkedin.com", "_blank");
        return;
      }
      if (metadata.originalObject.name.includes("disk_github")) {
        window.open("https://github.com", "_blank");
        return;
      }

      // Handle modal actions
      if (actionName && clickActions[actionName]) {
        clickActions[actionName]();
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      e.preventDefault();
      handleClick();
    };

    window.addEventListener("click", handleClick);
    window.addEventListener("touchend", handleTouchEnd, { passive: false });

    return () => {
      window.removeEventListener("click", handleClick);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, [clickActions, enabled]);

  const playHoverAnimation = React.useCallback(
    (
      originalObject: THREE.Object3D,
      initialScale: THREE.Vector3,
      isHovering: boolean
    ) => {
      // Stop any in-flight tweens on this scale
      gsap.killTweensOf(originalObject.scale);

      const factor = isHovering ? HOVER_SCALE : 1;

      gsap.to(originalObject.scale, {
        x: initialScale.x * factor,
        y: initialScale.y * factor,
        z: initialScale.z * factor,
        duration: isHovering ? 0.3 : 0.25,
        ease: isHovering ? "back.out(2)" : "power2.out",
      });
    },
    []
  );

  // Animate hover effects (scale only) and manage hover state in a single render loop
  useFrame(() => {
    if (!enabled) return;

    const currentIntersects = intersectsRef.current;
    const hitbox = currentIntersects.length > 0 && currentIntersects[0] ? (currentIntersects[0].object as THREE.Mesh) : null;

    const metadata = hitbox?.userData.metadata as
      | {
          originalObject: THREE.Object3D;
          initialScale: THREE.Vector3;
          interactionType: "hoverable" | "clickable" | "none";
        }
      | undefined;

    const prevHitbox = hoveredHitboxRef.current;

    // If hover target changed, reset previous and apply hover to new
    if (hitbox !== prevHitbox) {
      // Clear previous hover (using previous hitbox's metadata)
      if (prevHitbox) {
        const prevMeta = prevHitbox.userData.metadata as
          | {
              originalObject: THREE.Object3D;
              initialScale: THREE.Vector3;
              interactionType: "hoverable" | "clickable" | "none";
            }
          | undefined;
        if (prevMeta) {
          playHoverAnimation(prevMeta.originalObject, prevMeta.initialScale, false);
          restoreOriginalColors(prevMeta.originalObject);
        }
      }

      // Apply hover to new target
      if (hitbox && metadata) {
        playHoverAnimation(metadata.originalObject, metadata.initialScale, true);
        if (metadata.interactionType === "clickable") {
          applyAccentColor(metadata.originalObject);
        }
      }

      hoveredHitboxRef.current = hitbox;
    }

    // Update cursor based on current hover metadata
    if (metadata && metadata.interactionType === "clickable") {
      document.body.style.cursor = "pointer";
    } else {
      document.body.style.cursor = "default";
    }
  });
}

