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
  hitboxes: THREE.Mesh[];
}

const HOVER_SCALE = 1.03;
const HOVER_OVEREXTEND_SCALE = 1.05;
const DRAWER_SLIDE_DISTANCE = 100; // Distance to slide drawer outward

/**
 * Hook for managing hover and click interactions with 3D objects
 */
export function useObjectInteractions({intersects, clickActions, enabled = true, hitboxes}: UseObjectInteractionsOptions): void {
  const intersectsRef = React.useRef<THREE.Intersection[]>([]);
  const hoveredHitboxRef = React.useRef<THREE.Mesh | null>(null);

  type HoverMetadata = {
    originalObject: THREE.Object3D;
    initialScale: THREE.Vector3;
    initialPosition: THREE.Vector3;
    interactionType: "hoverable" | "clickable" | "none";
  };

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
      const metadata = clickedMesh.userData.metadata as HoverMetadata | undefined;

      if (!metadata || metadata.interactionType !== "clickable") return;

      const objectName = metadata.originalObject.name;

      // Handle external links
      if (objectName.includes("disk_linkedin")) {
        window.open("https://www.linkedin.com/in/vincent-xian/", "_blank");
        return;
      }
      if (objectName.includes("disk_github")) {
        window.open("https://github.com/pwazta", "_blank");
        return;
      }

      // Handle modal actions
      const actionName = getClickActionName(objectName);
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
    (originalObject: THREE.Object3D, initialScale: THREE.Vector3, initialPosition: THREE.Vector3, isHovering: boolean) => {
      const isDrawer = originalObject.name.includes("cabinet_drawer_");
      const isPCube = originalObject.name.includes("pCube");

      if (isDrawer) {
        // Drawer animation: slide outward instead of scaling
        gsap.killTweensOf(originalObject.position);
        gsap.killTweensOf(originalObject.scale);

        if (isHovering) {
          // Slide drawer outward - try Z direction first (forward), fallback to X if needed
          const slideDirection = new THREE.Vector3(0, 0, DRAWER_SLIDE_DISTANCE);
          const targetPosition = initialPosition.clone().add(slideDirection);
          
          gsap.to(originalObject.position, {
            x: targetPosition.x,
            y: targetPosition.y,
            z: targetPosition.z,
            duration: 0.3,
            ease: "back.out(1.5)",
          });
        } else {
          // Restore drawer position
          gsap.to(originalObject.position, {
            x: initialPosition.x,
            y: initialPosition.y,
            z: initialPosition.z,
            duration: 0.25,
            ease: "power2.out",
          });
        }
      } else if (isPCube) {
        // pCube animation: translate up by 0.5, no scaling
        gsap.killTweensOf(originalObject.position);
        gsap.killTweensOf(originalObject.scale);
        applyAccentColor(originalObject);
        if (isHovering) {
          // Translate up by 0.5
          const targetPosition = initialPosition.clone().add(new THREE.Vector3(0, -3.3, 0));
          
          gsap.to(originalObject.position, {
            x: targetPosition.x,
            y: targetPosition.y,
            z: targetPosition.z,
            duration: 0.2,
            ease: "back.out(1.5)",
          });
        } else {
          // Restore original position
          gsap.to(originalObject.position, {
            x: initialPosition.x,
            y: initialPosition.y,
            z: initialPosition.z,
            duration: 0.2,
            ease: "power2.out",
          });
        }
      } else {
        // Regular scale animation for non-drawer objects
        gsap.killTweensOf(originalObject.scale);

        if (isHovering) {
          // Bounce animation: overshoot to 1.05, then settle to 1.03
          const tl = gsap.timeline();
          tl.to(originalObject.scale, {
            x: initialScale.x * HOVER_OVEREXTEND_SCALE,
            y: initialScale.y * HOVER_OVEREXTEND_SCALE,
            z: initialScale.z * HOVER_OVEREXTEND_SCALE,
            duration: 0.1,
            ease: "power2.out",
          }).to(originalObject.scale, {
            x: initialScale.x * HOVER_SCALE,
            y: initialScale.y * HOVER_SCALE,
            z: initialScale.z * HOVER_SCALE,
            duration: 0.15,
            ease: "back.out(1.5)",
          });
        } else {
          // Simple restore animation
          gsap.to(originalObject.scale, {
            x: initialScale.x,
            y: initialScale.y,
            z: initialScale.z,
            duration: 0.25,
            ease: "power2.out",
          });
        }
      }
    },
    []
  );

  const getGroupMetas = React.useCallback((meta: HoverMetadata | undefined): HoverMetadata[] => {
    if (!meta) return [];
    const name = meta.originalObject.name;

    // Helper to find all objects matching a pattern
    const findGroup = (pattern: string): HoverMetadata[] => {
      const group: HoverMetadata[] = [];
      for (const hb of hitboxes) {
        const m = hb.userData.metadata as HoverMetadata | undefined;
        if (m?.originalObject.name.includes(pattern)) group.push(m);
      }
      return group;
    };

    // Group all computer_* parts together, and group phone_base with phone_device (one-way: only when phone_base is hovered) 
    if (name.includes("computer_")) return findGroup("computer_");
    if (name.includes("phone_base")) return findGroup("phone_");

    // Default: just this object (phone_device hovered alone, or any other object)
    return [meta];
  }, [hitboxes]);

  // Animate hover effects (scale only) and manage hover state in a single render loop
  useFrame(() => {
    if (!enabled) return;

    const currentIntersects = intersectsRef.current;
    const hitbox = currentIntersects.length > 0 && currentIntersects[0] ? (currentIntersects[0].object as THREE.Mesh) : null;
    const prevHitbox = hoveredHitboxRef.current;
    const metadata = hitbox?.userData.metadata as HoverMetadata | undefined;

    // If hover target changed, reset previous and apply hover to new
    if (hitbox !== prevHitbox) {
      // Clear previous hover (using previous hitbox's metadata)
      if (prevHitbox) {
        const prevMeta = prevHitbox.userData.metadata as HoverMetadata | undefined;
        const prevGroup = getGroupMetas(prevMeta);
        for (const m of prevGroup) {
          playHoverAnimation(m.originalObject, m.initialScale, m.initialPosition, false);
          restoreOriginalColors(m.originalObject);
        }
      }

      // Apply hover to new target
      if (hitbox && metadata) {
        const group = getGroupMetas(metadata);
        for (const m of group) {
          playHoverAnimation(m.originalObject, m.initialScale, m.initialPosition, true);
        }
        if (metadata.interactionType === "clickable") applyAccentColor(metadata.originalObject);
      }

      hoveredHitboxRef.current = hitbox;
    }

    // Update cursor based on current hover metadata
    if (metadata?.interactionType === "clickable") document.body.style.cursor = "pointer";
    else document.body.style.cursor = "default";
  });
}
