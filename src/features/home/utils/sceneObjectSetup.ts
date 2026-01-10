/**
 * Scene traversal and interactive mesh setup utilities
 * Used in: PortfolioScene for setting up raycaster targets
 */

import * as THREE from "three";
import { classifyObject, type HitboxMetadata } from "./sceneInteractions";

/**
 * Recursively traverses a scene to find all mesh objects
 */
function traverseSceneObjects(object: THREE.Object3D): THREE.Mesh<THREE.BufferGeometry, THREE.Material>[] {
  const meshes: THREE.Mesh<THREE.BufferGeometry, THREE.Material>[] = [];

  object.traverse((child) => {
    if (child instanceof THREE.Mesh && child.name) {
      meshes.push(child as THREE.Mesh<THREE.BufferGeometry, THREE.Material>);
      child.castShadow = true;
      child.receiveShadow = true;
    }
  });

  return meshes;
}

/**
 * Sets up interactive objects in a scene by marking meshes as interactive
 * Stores metadata directly on the original meshes for accurate raycasting
 * Uses hover hysteresis to prevent jittering when meshes animate
 */
export function setupInteractiveObjects(scene: THREE.Scene): THREE.Mesh[] {
  const interactiveMeshes: THREE.Mesh[] = [];

  // Traverse scene to find all meshes
  const meshes = traverseSceneObjects(scene);

  // Mark interactive meshes and store metadata directly on them
  for (const mesh of meshes) {
    const interactionType = classifyObject(mesh.name);

    if (interactionType !== "none") {
      // Store metadata directly on the mesh
      const metadata: HitboxMetadata = {
        originalObject: mesh,
        interactionType,
        initialScale: mesh.scale.clone(),
        initialPosition: mesh.position.clone(),
      };

      mesh.userData.metadata = metadata;
      interactiveMeshes.push(mesh);
    }
  }

  return interactiveMeshes;
}
