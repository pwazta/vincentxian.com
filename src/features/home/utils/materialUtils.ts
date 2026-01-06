/**
 * Material color management utilities for applying accent colors to 3D objects
 * Used in: Interaction hooks for click effects
 */

import * as THREE from "three";

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
 * Stores original material colors in object userData
 */
export function storeOriginalColors(object: THREE.Object3D): void {
  if (!(object instanceof THREE.Mesh) || !object.material) return;

  const materials = Array.isArray(object.material)
    ? object.material
    : [object.material];

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
 * Applies accent color to object materials
 */
export function applyAccentColor(object: THREE.Object3D): void {
  if (!(object instanceof THREE.Mesh) || !object.material) return;

  const materials = Array.isArray(object.material)
    ? object.material
    : [object.material];

  const accentColor = getAccentColor();

  for (const material of materials) {
    if (material instanceof THREE.MeshStandardMaterial) {
      // Store original color if not already stored
      if (!object.userData.originalColors) {
        storeOriginalColors(object);
      }
      material.color.set(accentColor);
    }
  }
}

/**
 * Restores original material colors from userData
 */
export function restoreOriginalColors(object: THREE.Object3D): void {
  if (!(object instanceof THREE.Mesh) || !object.material) return;

  const originalColors = object.userData.originalColors as
    | string[]
    | undefined;

  if (!originalColors) return;

  const materials = Array.isArray(object.material)
    ? object.material
    : [object.material];

  for (let i = 0; i < materials.length; i++) {
    const material = materials[i];
    const originalColor = originalColors[i];
    if (
      material instanceof THREE.MeshStandardMaterial &&
      originalColor
    ) {
      material.color.setHex(parseInt(originalColor, 16));
    }
  }
}

