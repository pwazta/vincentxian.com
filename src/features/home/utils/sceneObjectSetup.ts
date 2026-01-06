/**
 * Scene traversal and hitbox creation utilities for interactive 3D objects
 * Used in: PortfolioScene for setting up raycaster hitboxes
 */

import * as THREE from "three";
import {
  classifyObject,
  type HitboxMetadata,
  type InteractionType,
} from "../components/sceneInteractions";

/**
 * Recursively traverses a scene to find all mesh objects
 */
export function traverseSceneObjects(
  object: THREE.Object3D,
  meshes: THREE.Mesh[] = []
): THREE.Mesh[] {
  if (object instanceof THREE.Mesh && object.name) {
    meshes.push(object);
  }

  for (const child of object.children) {
    traverseSceneObjects(child, meshes);
  }

  return meshes;
}

/**
 * Creates an invisible hitbox mesh from an object's bounding box
 */
export function createHitbox(
  object: THREE.Object3D,
  interactionType: InteractionType
): THREE.Mesh | null {
  if (interactionType === "none") return null;

  // Calculate bounding box in world space
  const worldBox = new THREE.Box3().setFromObject(object);
  if (worldBox.isEmpty()) return null;

  // Get bounding box size and center in world space
  const worldSize = worldBox.getSize(new THREE.Vector3());
  const worldCenter = worldBox.getCenter(new THREE.Vector3());

  // Get world rotation for accurate hitbox orientation
  const worldQuat = new THREE.Quaternion();
  object.getWorldQuaternion(worldQuat);

  // Create invisible hitbox geometry using world-aligned size
  const geometry = new THREE.BoxGeometry(worldSize.x, worldSize.y, worldSize.z);
  const material = new THREE.MeshBasicMaterial({
    visible: false,
    transparent: true,
    opacity: 0,
  });

  const hitbox = new THREE.Mesh(geometry, material);
  hitbox.name = `hitbox_${object.name}`;

  // Place hitbox in world space with correct orientation
  hitbox.position.copy(worldCenter);
  hitbox.quaternion.copy(worldQuat);
  hitbox.updateMatrixWorld(true);

  // Store metadata with exact initial transforms
  const metadata: HitboxMetadata = {
    originalObject: object,
    interactionType,
    initialScale: object.scale.clone(),
    initialWorldCenter: worldCenter.clone(),
  };

  hitbox.userData.metadata = metadata;

  return hitbox;
}

/**
 * Sets up interactive objects in a scene by creating hitboxes
 */
export function setupInteractiveObjects(
  scene: THREE.Scene
): THREE.Mesh[] {
  const hitboxes: THREE.Mesh[] = [];

  // Traverse scene to find all meshes
  const meshes = traverseSceneObjects(scene);

  // Create hitboxes for interactive objects
  for (const mesh of meshes) {
    const interactionType = classifyObject(mesh.name);
    const hitbox = createHitbox(mesh, interactionType);

    if (hitbox) {
      // Add hitbox to scene root to avoid inheriting parent transforms
      scene.add(hitbox);
      hitboxes.push(hitbox);
    }
  }

  return hitboxes;
}
