/**
 * Interaction configuration constants and type definitions for 3D scene objects
 * Used in: PortfolioScene and interaction hooks for determining hoverable/clickable objects
 */

import type * as THREE from "three";

/** Name patterns that identify hoverable objects */
export const HOVERABLE_PATTERNS = [
  "computer",
  "disk",
  "phone",
  "button",
  "pCube",
  "cabinet_drawer",
] as const;

/** Name patterns that identify clickable objects */
export const CLICKABLE_PATTERNS = [
  "phone",
  "disk_linkedin",
  "disk_github",
  "computer",
  "cabinet_drawer_about",
  "cabinet_drawer_software",
  "cabinet_drawer_arts",
] as const;

/** Interaction type for scene objects */
export type InteractionType = "hoverable" | "clickable" | "none";

/** Metadata stored on hitbox objects */
export interface HitboxMetadata {
  originalObject: THREE.Object3D;
  interactionType: InteractionType;
  initialScale: THREE.Vector3;
  initialPosition: THREE.Vector3;
}

/** Click action callbacks for different object types */
export interface ClickActions {
  onPhoneClick: () => void;
  onComputerClick: () => void;
  onScreenClick: () => void;
  onDiskLinkedInClick: () => void;
  onDiskGithubClick: () => void;
  onDrawerAboutClick: () => void;
  onDrawerSoftwareClick: () => void;
  onDrawerArtsClick: () => void;
}

/** Determines if an object name matches hoverable patterns */
export function isHoverable(name: string): boolean {
  return HOVERABLE_PATTERNS.some((pattern) => name.includes(pattern));
}

/** Determines if an object name matches clickable patterns */
export function isClickable(name: string): boolean {
  return CLICKABLE_PATTERNS.some((pattern) => name.includes(pattern));
}

/** Classifies an object's interaction type based on its name */
export function classifyObject(name: string): InteractionType {
  if (isClickable(name)) return "clickable";
  if (isHoverable(name)) return "hoverable";
  return "none";
}

/** Gets the click action callback name for a given object name */
export function getClickActionName(name: string): keyof ClickActions | null {
  if (name.includes("phone")) return "onPhoneClick";
  if (name.includes("disk_linkedin")) return "onDiskLinkedInClick";
  if (name.includes("disk_github")) return "onDiskGithubClick";
  if (name.includes("computer_screen")) return "onScreenClick";
  if (name.includes("computer")) return "onComputerClick";
  if (name.includes("cabinet_drawer_about")) return "onDrawerAboutClick";
  if (name.includes("cabinet_drawer_software")) return "onDrawerSoftwareClick";
  if (name.includes("cabinet_drawer_arts")) return "onDrawerArtsClick";
  return null;
}
