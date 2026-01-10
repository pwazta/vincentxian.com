/**
 * Interaction effects hook for hover animations and click actions
 * Used in: PortfolioScene for handling object interactions
 */

import * as React from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import gsap from "gsap";
import { applyAccentColor, restoreOriginalColors } from "../utils/materialUtils";
import { getClickActionName, type ClickActions } from "../utils/sceneInteractions";

const HOVER_SCALE = 1.08;
const HOVER_OVEREXTEND_SCALE = 1.15;
const DRAWER_SLIDE_DISTANCE = 100;
const HOVER_UNHOVER_DELAY_MS = 100;

interface UseObjectInteractionsOptions {
  intersects: THREE.Intersection[];
  clickActions: ClickActions;
  enabled?: boolean;
}

type HoverMetadata = {
  originalObject: THREE.Object3D;
  initialScale: THREE.Vector3;
  initialPosition: THREE.Vector3;
  interactionType: "hoverable" | "clickable" | "none";
};

export function useObjectInteractions({ intersects, clickActions, enabled = true }: UseObjectInteractionsOptions): void {
  const intersectsRef = React.useRef<THREE.Intersection[]>([]);
  const hoveredMeshRef = React.useRef<THREE.Mesh | null>(null);
  const unhoverTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);
  const reenableCooldownRef = React.useRef<number | null>(null);

  // Handle click events
  React.useEffect(() => {
    if (!enabled) return;

    const handleClick = () => {
      const currentIntersects = intersectsRef.current;
      if (!currentIntersects[0]) return;

      const clickedMesh = currentIntersects[0].object as THREE.Mesh;
      const metadata = clickedMesh.userData.metadata as HoverMetadata | undefined;

      if (!metadata || metadata.interactionType !== "clickable") return;

      const objectName = clickedMesh.name;

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

  const playHoverAnimation = React.useCallback((originalObject: THREE.Object3D, initialScale: THREE.Vector3, initialPosition: THREE.Vector3, isHovering: boolean) => {
      const isDrawer = originalObject.name.includes("cabinet_drawer_");
      const isPCube = originalObject.name.includes("pCube");

      const translationConfig = (() => {
        if (isDrawer) {
          return {
            offset: new THREE.Vector3(0, 0, DRAWER_SLIDE_DISTANCE),
            hoverDuration: 0.3,
            restoreDuration: 0.25,
            accent: false,
          };
        }
        if (isPCube) {
          return {
            offset: new THREE.Vector3(0, -3.3, 0),
            hoverDuration: 0.2,
            restoreDuration: 0.2,
            accent: true,
          };
        }
        return null;
      })();

      if (translationConfig) {
        gsap.killTweensOf(originalObject.position);
        gsap.killTweensOf(originalObject.scale);
        if (translationConfig.accent) applyAccentColor(originalObject);

        if (isHovering) {
          const targetPosition = initialPosition.clone().add(translationConfig.offset);
          gsap.to(originalObject.position, {
            x: targetPosition.x,
            y: targetPosition.y,
            z: targetPosition.z,
            duration: translationConfig.hoverDuration,
            ease: "back.out(1.5)",
          });
        } else {
          gsap.to(originalObject.position, {
            x: initialPosition.x,
            y: initialPosition.y,
            z: initialPosition.z,
            duration: translationConfig.restoreDuration,
            ease: "power2.out",
          });
        }
      } else {
        // Regular scale animation for non-drawer objects
        // Scale around the mesh's local bounding box center to prevent scaling from world origin
        gsap.killTweensOf(originalObject.scale);
        gsap.killTweensOf(originalObject.position);

        if (isHovering) {
          const mesh = originalObject as THREE.Mesh;
          mesh.geometry.computeBoundingBox();
          const boundingBox = mesh.geometry.boundingBox;
          
          if (boundingBox) {
            const localCenter = new THREE.Vector3();
            boundingBox.getCenter(localCenter);
            const offsetFromInitial = localCenter.clone().sub(initialPosition);
            const offsetAdjustment = offsetFromInitial.clone().multiplyScalar(HOVER_SCALE - 1);
            const newPosition = initialPosition.clone().sub(offsetAdjustment);
            const tl = gsap.timeline();
            const overextendOffsetAdjustment = offsetFromInitial.clone().multiplyScalar(HOVER_OVEREXTEND_SCALE - 1);
            const overextendPosition = initialPosition.clone().sub(overextendOffsetAdjustment);
            
            tl.to(mesh.scale, {
              x: initialScale.x * HOVER_OVEREXTEND_SCALE,
              y: initialScale.y * HOVER_OVEREXTEND_SCALE,
              z: initialScale.z * HOVER_OVEREXTEND_SCALE,
              duration: 0.1,
              ease: "power2.out",
            })
            .to(mesh.position, {
              x: overextendPosition.x,
              y: overextendPosition.y,
              z: overextendPosition.z,
              duration: 0.1,
              ease: "power2.out",
            }, 0)
            .to(mesh.scale, {
              x: initialScale.x * HOVER_SCALE,
              y: initialScale.y * HOVER_SCALE,
              z: initialScale.z * HOVER_SCALE,
              duration: 0.15,
              ease: "back.out(1.5)",
            })
            .to(mesh.position, {
              x: newPosition.x,
              y: newPosition.y,
              z: newPosition.z,
              duration: 0.15,
              ease: "back.out(1.5)",
            }, "-=0.15");
          } else {
            const tl = gsap.timeline();
            tl.to(mesh.scale, {
              x: initialScale.x * HOVER_OVEREXTEND_SCALE,
              y: initialScale.y * HOVER_OVEREXTEND_SCALE,
              z: initialScale.z * HOVER_OVEREXTEND_SCALE,
              duration: 0.1,
              ease: "power2.out",
            }).to(mesh.scale, {
              x: initialScale.x * HOVER_SCALE,
              y: initialScale.y * HOVER_SCALE,
              z: initialScale.z * HOVER_SCALE,
              duration: 0.15,
              ease: "back.out(1.5)",
            });
          }
        } else {
          // Restore original scale and position using initialPosition from metadata
          gsap.to(originalObject.scale, {
            x: initialScale.x,
            y: initialScale.y,
            z: initialScale.z,
            duration: 0.25,
            ease: "power2.out",
          });
          gsap.to(originalObject.position, {
            x: initialPosition.x,
            y: initialPosition.y,
            z: initialPosition.z,
            duration: 0.25,
            ease: "power2.out",
          });
        }
      }
    }, []
  );

  React.useEffect(() => {
    if (!enabled) {
      document.body.style.cursor = "default";
      if (reenableCooldownRef.current !== null) {
        window.cancelAnimationFrame(reenableCooldownRef.current);
        reenableCooldownRef.current = null;
      }
    } else {
      if (hoveredMeshRef.current) {
        const prevMeta = hoveredMeshRef.current.userData.metadata as HoverMetadata | undefined;
        if (prevMeta) {
          playHoverAnimation(prevMeta.originalObject, prevMeta.initialScale, prevMeta.initialPosition, false);
          restoreOriginalColors(prevMeta.originalObject);
        }
        hoveredMeshRef.current = null;
      }
      if (unhoverTimeoutRef.current) {
        clearTimeout(unhoverTimeoutRef.current);
        unhoverTimeoutRef.current = null;
      }
      reenableCooldownRef.current = window.requestAnimationFrame(() => {
        reenableCooldownRef.current = window.requestAnimationFrame(() => {
          reenableCooldownRef.current = null;
        });
      });
    }
  }, [enabled, playHoverAnimation]);

  useFrame(() => {
    intersectsRef.current = intersects;

    if (!enabled || reenableCooldownRef.current !== null) return;

    const hoveredMesh = intersects[0] ? (intersects[0].object as THREE.Mesh) : null;
    const prevMesh = hoveredMeshRef.current;
    const metadata = hoveredMesh?.userData.metadata as HoverMetadata | undefined;

    const updateCursor = (meta: HoverMetadata | undefined) => {
      document.body.style.cursor = meta?.interactionType === "clickable" ? "pointer" : "default";
    };

    if (hoveredMesh === prevMesh) {
      updateCursor(metadata);
      return;
    }

    // Hover target changed: If a new mesh is hovered, cancel any pending unhover of the previous one
    if (hoveredMesh && unhoverTimeoutRef.current) {
      clearTimeout(unhoverTimeoutRef.current);
      unhoverTimeoutRef.current = null;
    }

    if (hoveredMesh && metadata) {
      // Clear previous hover immediately
      if (prevMesh) {
        const prevMeta = prevMesh.userData.metadata as HoverMetadata | undefined;
        if (prevMeta) {
          playHoverAnimation(prevMeta.originalObject, prevMeta.initialScale, prevMeta.initialPosition, false);
          restoreOriginalColors(prevMeta.originalObject);
        }
      }

      // Apply hover to new target
      playHoverAnimation(metadata.originalObject, metadata.initialScale, metadata.initialPosition, true);
      if (metadata.interactionType === "clickable") applyAccentColor(metadata.originalObject);

      hoveredMeshRef.current = hoveredMesh;
      updateCursor(metadata);
      return;
    }

    // No mesh currently hovered, schedule delayed unhover if not already scheduled
    if (!hoveredMesh && prevMesh) {
      // The if check is necessary to avoid overwriting an existing timeout
      // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
      if (!unhoverTimeoutRef.current) {
        unhoverTimeoutRef.current = setTimeout(() => {
          const stillPrevMesh = hoveredMeshRef.current;
          if (stillPrevMesh && stillPrevMesh === prevMesh) {
            const prevMeta = stillPrevMesh.userData.metadata as HoverMetadata | undefined;
            if (prevMeta) {
              playHoverAnimation(prevMeta.originalObject, prevMeta.initialScale, prevMeta.initialPosition, false);
              restoreOriginalColors(prevMeta.originalObject);
            }
            hoveredMeshRef.current = null;
            document.body.style.cursor = "default";
          }
          unhoverTimeoutRef.current = null;
        }, HOVER_UNHOVER_DELAY_MS);
      }

      const prevMeta = prevMesh.userData.metadata as HoverMetadata | undefined;
      updateCursor(prevMeta);
      return;
    }

    document.body.style.cursor = "default";
  });

  // Cleanup timeout and cooldown on unmount
  React.useEffect(() => {
    return () => {
      if (unhoverTimeoutRef.current) clearTimeout(unhoverTimeoutRef.current);
      if (reenableCooldownRef.current !== null) window.cancelAnimationFrame(reenableCooldownRef.current);
    };
  }, []);
}
