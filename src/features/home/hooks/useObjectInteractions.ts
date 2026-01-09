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
  interactiveMeshes: THREE.Mesh[];
}

const HOVER_SCALE = 1.08;
const HOVER_OVEREXTEND_SCALE = 1.15;
const DRAWER_SLIDE_DISTANCE = 100; // Distance to slide drawer outward

/**
 * Hook for managing hover and click interactions with 3D objects
 */
const HOVER_UNHOVER_DELAY_MS = 100; // Delay before unhovering to prevent jittering

export function useObjectInteractions({intersects, clickActions, enabled = true, interactiveMeshes}: UseObjectInteractionsOptions): void {
  const intersectsRef = React.useRef<THREE.Intersection[]>([]);
  const hoveredMeshRef = React.useRef<THREE.Mesh | null>(null);
  const unhoverTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

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
        // Scale around the mesh's local bounding box center to prevent scaling from world origin
        gsap.killTweensOf(originalObject.scale);
        gsap.killTweensOf(originalObject.position);

        if (isHovering) {
          // Calculate world-space bounding box center for accurate scaling pivot
          if (originalObject instanceof THREE.Mesh && originalObject.geometry) {
            // Store original world position if not already stored
            if (!originalObject.userData.originalWorldPosition) {
              originalObject.updateMatrixWorld(true);
              originalObject.userData.originalWorldPosition = originalObject.getWorldPosition(new THREE.Vector3()).clone();
            }
            
            // Get bounding box center in local space
            originalObject.geometry.computeBoundingBox();
            const boundingBox = originalObject.geometry.boundingBox;
            
            if (boundingBox) {
              const localCenter = new THREE.Vector3();
              boundingBox.getCenter(localCenter);
              
              // Calculate offset from initial position to bounding box center
              const offsetFromInitial = localCenter.clone().sub(initialPosition);
              
              // When scaling, we need to adjust position so the center stays fixed
              // New position = initialPosition - (offset * (scaleFactor - 1))
              const scaleFactor = HOVER_SCALE;
              const overextendFactor = HOVER_OVEREXTEND_SCALE;
              
              const offsetAdjustment = offsetFromInitial.clone().multiplyScalar(scaleFactor - 1);
              const newPosition = initialPosition.clone().sub(offsetAdjustment);
              
              // Bounce animation: overshoot to 1.05, then settle to 1.03
              const tl = gsap.timeline();
              
              // Overshoot phase
              const overextendOffsetAdjustment = offsetFromInitial.clone().multiplyScalar(overextendFactor - 1);
              const overextendPosition = initialPosition.clone().sub(overextendOffsetAdjustment);
              
              tl.to(originalObject.scale, {
                x: initialScale.x * HOVER_OVEREXTEND_SCALE,
                y: initialScale.y * HOVER_OVEREXTEND_SCALE,
                z: initialScale.z * HOVER_OVEREXTEND_SCALE,
                duration: 0.1,
                ease: "power2.out",
              })
              .to(originalObject.position, {
                x: overextendPosition.x,
                y: overextendPosition.y,
                z: overextendPosition.z,
                duration: 0.1,
                ease: "power2.out",
              }, 0)
              // Settle phase
              .to(originalObject.scale, {
                x: initialScale.x * HOVER_SCALE,
                y: initialScale.y * HOVER_SCALE,
                z: initialScale.z * HOVER_SCALE,
                duration: 0.15,
                ease: "back.out(1.5)",
              })
              .to(originalObject.position, {
                x: newPosition.x,
                y: newPosition.y,
                z: newPosition.z,
                duration: 0.15,
                ease: "back.out(1.5)",
              }, "-=0.15");
            } else {
              // Fallback to simple scaling if bounding box unavailable
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
            }
          } else {
            // Fallback for non-mesh objects
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
          
          // Clean up any stored world position
          if (originalObject.userData.originalWorldPosition) {
            delete originalObject.userData.originalWorldPosition;
          }
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
      for (const mesh of interactiveMeshes) {
        const m = mesh.userData.metadata as HoverMetadata | undefined;
        if (m && mesh.name.includes(pattern)) group.push(m);
      }
      return group;
    };

    // Group all computer_* parts together, and group phone_base with phone_device (one-way: only when phone_base is hovered) 
    if (name.includes("computer_")) return findGroup("computer_");
    if (name.includes("phone_base")) return findGroup("phone_");

    // Default: just this object (phone_device hovered alone, or any other object)
    return [meta];
  }, [interactiveMeshes]);

  // Animate hover effects with hysteresis to prevent jittering
  useFrame(() => {
    if (!enabled) return;

    const currentIntersects = intersectsRef.current;
    const hoveredMesh = currentIntersects.length > 0 && currentIntersects[0] ? (currentIntersects[0].object as THREE.Mesh) : null;
    const prevMesh = hoveredMeshRef.current;
    const metadata = hoveredMesh?.userData.metadata as HoverMetadata | undefined;

    // If nothing changed, keep current hover state (avoid re-scheduling unhover)
    if (hoveredMesh === prevMesh) {
      document.body.style.cursor = metadata?.interactionType === "clickable" ? "pointer" : "default";
      return;
    }

    // Hover target changed
    // If a new mesh is hovered, cancel any pending unhover of the previous one
    if (hoveredMesh && unhoverTimeoutRef.current) {
      clearTimeout(unhoverTimeoutRef.current);
      unhoverTimeoutRef.current = null;
    }

    if (hoveredMesh && metadata) {
      // Clear previous hover immediately
      if (prevMesh) {
        const prevMeta = prevMesh.userData.metadata as HoverMetadata | undefined;
        const prevGroup = getGroupMetas(prevMeta);
        for (const m of prevGroup) {
          playHoverAnimation(m.originalObject, m.initialScale, m.initialPosition, false);
          restoreOriginalColors(m.originalObject);
        }
      }

      // Apply hover to new target
      const group = getGroupMetas(metadata);
      for (const m of group) {
        playHoverAnimation(m.originalObject, m.initialScale, m.initialPosition, true);
      }
      if (metadata.interactionType === "clickable") applyAccentColor(metadata.originalObject);

      hoveredMeshRef.current = hoveredMesh;
      document.body.style.cursor = metadata.interactionType === "clickable" ? "pointer" : "default";
      return;
    }

    // No mesh currently hovered, schedule delayed unhover if not already scheduled
    if (!hoveredMesh && prevMesh) {
      if (!unhoverTimeoutRef.current) {
        unhoverTimeoutRef.current = setTimeout(() => {
          const stillPrevMesh = hoveredMeshRef.current;
          if (stillPrevMesh && stillPrevMesh === prevMesh) {
            const prevMeta = stillPrevMesh.userData.metadata as HoverMetadata | undefined;
            const prevGroup = getGroupMetas(prevMeta);
            for (const m of prevGroup) {
              playHoverAnimation(m.originalObject, m.initialScale, m.initialPosition, false);
              restoreOriginalColors(m.originalObject);
            }
            hoveredMeshRef.current = null;
            document.body.style.cursor = "default";
          }
          unhoverTimeoutRef.current = null;
        }, HOVER_UNHOVER_DELAY_MS);
      }

      // Keep pointer cursor during unhover delay for clickables
      const prevMeta = prevMesh.userData.metadata as HoverMetadata | undefined;
      if (prevMeta?.interactionType === "clickable") document.body.style.cursor = "pointer";
      else document.body.style.cursor = "default";
      return;
    }

    // Fallback: default cursor
    document.body.style.cursor = "default";
  });

  // Cleanup timeout on unmount
  React.useEffect(() => {
    return () => {
      if (unhoverTimeoutRef.current) {
        clearTimeout(unhoverTimeoutRef.current);
      }
    };
  }, []);
}
