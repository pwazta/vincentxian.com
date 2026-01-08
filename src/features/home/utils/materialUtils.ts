/**
 * Material color management utilities for applying accent colors to 3D objects
 * Used in: Interaction hooks for click effects
 */

import * as THREE from "three";
import gsap from "gsap";

/** Accent colors from CSS variables (light/dark mode) */
const ACCENT_COLOR_LIGHT = "#ffffff";
const ACCENT_COLOR_DARK = "#ffffff";

/**
 * Gets the current accent color based on theme
 */
function getAccentColor(): string {
  if (typeof window === "undefined") return ACCENT_COLOR_LIGHT;

  const isDark = document.body.classList.contains("dark");
  return isDark ? ACCENT_COLOR_DARK : ACCENT_COLOR_LIGHT;
}

/**
 * Clones materials for objects that share materials (like keyboard keys)
 * This ensures each object has its own material instance
 */
function cloneMaterialsIfNeeded(object: THREE.Mesh): void {
  if (!object.material) return;

  const isPCube = object.name.includes("pCube");
  if (!isPCube) return; // Only clone for pCube objects

  const materials = Array.isArray(object.material) ? object.material : [object.material];
  const clonedMaterials: THREE.Material[] = [];

  for (const material of materials) {
    if (material instanceof THREE.MeshStandardMaterial) {
      // Clone the material so each key has its own instance
      const cloned = material.clone();
      clonedMaterials.push(cloned);
    } else {
      clonedMaterials.push(material);
    }
  }

  // Replace the shared material with cloned materials
  if (clonedMaterials.length === 0) return; // Safety check
  
  if (clonedMaterials.length === 1) {
    object.material = clonedMaterials[0]!;
  } else {
    object.material = clonedMaterials;
  }
}

/**
 * Stores original material colors in object userData
 */
export function storeOriginalColors(object: THREE.Object3D): void {
  if (!(object instanceof THREE.Mesh) || !object.material) return;

  // Clone materials for pCube objects to avoid shared material issues
  cloneMaterialsIfNeeded(object);

  const materials = Array.isArray(object.material) ? object.material : [object.material];

  const originalColors: string[] = [];

  for (const material of materials) {
    if (material instanceof THREE.MeshStandardMaterial) {
      originalColors.push(material.color.getHexString());
    } else {
      originalColors.push("");
    }
  }

  object.userData.originalColors = originalColors;
}

/**
 * Applies accent color to object materials with smooth animation
 */
export function applyAccentColor(object: THREE.Object3D, animated = true): void {
  if (!(object instanceof THREE.Mesh) || !object.material) return;

  const materials = Array.isArray(object.material) ? object.material : [object.material];

  const accentColor = getAccentColor();
  const accentColorObj = new THREE.Color(accentColor);

  for (const material of materials) {
    if (material instanceof THREE.MeshStandardMaterial) {
      // Store original color if not already stored
      if (!object.userData.originalColors) {
        storeOriginalColors(object);
      }

      if (animated) {
        // Animate color transition with GSAP
        gsap.killTweensOf(material.color);
        gsap.to(material.color, {
          r: accentColorObj.r,
          g: accentColorObj.g,
          b: accentColorObj.b,
          duration: 0.15,
          ease: "power2.out",
        });
      } else {
        material.color.set(accentColor);
      }
    }
  }
}

/**
 * Restores original material colors from userData with smooth animation
 */
export function restoreOriginalColors(object: THREE.Object3D, animated = true): void {
  if (!(object instanceof THREE.Mesh) || !object.material) return;

  const originalColors = object.userData.originalColors as string[] | undefined;

  if (!originalColors) return;

  const materials: THREE.Material[] = Array.isArray(object.material) ? object.material : [object.material];

  for (let i = 0; i < materials.length; i++) {
    const material = materials[i];
    const originalColor = originalColors[i];
    if (material instanceof THREE.MeshStandardMaterial && typeof originalColor === "string" && originalColor) {
      const originalColorObj = new THREE.Color(parseInt(originalColor, 16));
      
      if (animated) {
        // Animate color transition back with GSAP
        gsap.killTweensOf(material.color);
        gsap.to(material.color, {
          r: originalColorObj.r,
          g: originalColorObj.g,
          b: originalColorObj.b,
          duration: 0.15,
          ease: "power2.out",
        });
      } else {
        material.color.setHex(parseInt(originalColor, 16));
      }
    }
  }
}

