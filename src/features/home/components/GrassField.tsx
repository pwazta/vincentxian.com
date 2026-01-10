/**
 * Grass field component using instanced grass meshes on terrain surface
 * Used in: PortfolioScene for rendering animated grass field
 * 
 * MIT License - Copyright (c) 2023 Ebenezer
 * Original article: https://tympanus.net/codrops/2025/02/04/how-to-make-the-fluffiest-grass-with-three-js/
 */
"use client";

import * as React from "react";
import * as THREE from "three";
import { useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { MeshSurfaceSampler } from "three/addons/math/MeshSurfaceSampler.js";
import { GrassMaterial } from "./grassMaterial";

type GrassFieldProps = {
	grassCount?: number;
	terrainScale?: number;
	terrainHeightScale?: number;
	grassScale?: number;
	grassHeightScale?: number;
};

export function GrassField({
	grassCount = 1000,
	terrainScale = 2,
	terrainHeightScale = 0.8,
	grassScale = 5,
	grassHeightScale = 0.4,
}: GrassFieldProps) {
	const [grassInstancedMesh, setGrassInstancedMesh] = React.useState<THREE.InstancedMesh | null>(null);
	const [grassMaterial, setGrassMaterial] = React.useState<GrassMaterial | null>(null);
	const timeRef = React.useRef(0);
	
	// Use refs to track resources for proper cleanup order
	const texturesRef = React.useRef<{ grassAlpha?: THREE.Texture; noise?: THREE.Texture }>({});
	const materialRef = React.useRef<GrassMaterial | null>(null);
	const isMountedRef = React.useRef(true);
	
	// Cache cloned geometries to avoid re-cloning on every render
	const grassGeometryRef = React.useRef<THREE.BufferGeometry | null>(null);
	const terrainGeometryRef = React.useRef<THREE.BufferGeometry | null>(null);
	const lastScaleParamsRef = React.useRef<{
		terrainScale: number;
		terrainHeightScale: number;
		grassScale: number;
		grassHeightScale: number;
	} | null>(null);

	// Load terrain model
	const islandModel = useGLTF("/models/island.glb");
	const grassLODsModel = useGLTF("/models/grassLODs.glb");

	/**
	 * Loads grass alpha texture with error handling
	 * Prevents WebGL context loss from failed texture loads
	 */
	const grassAlphaTexture = React.useMemo(() => {
		const loader = new THREE.TextureLoader();
		const texture = loader.load(
			"/models/grass.jpeg",
			() => {
				// Success callback - texture loaded
			},
			undefined,
			(error) => {
				console.error("Failed to load grass alpha texture:", error);
			}
		);
		texture.generateMipmaps = true;
		texture.minFilter = THREE.LinearMipmapLinearFilter;
		texture.magFilter = THREE.LinearFilter;
		texturesRef.current.grassAlpha = texture;
		return texture;
	}, []);

	/**
	 * Loads noise texture with error handling
	 * Prevents WebGL context loss from failed texture loads
	 */
	const noiseTexture = React.useMemo(() => {
		const loader = new THREE.TextureLoader();
		const texture = loader.load(
			"/models/perlinnoise.webp",
			() => {
				// Success callback - texture loaded
			},
			undefined,
			(error) => {
				console.error("Failed to load noise texture:", error);
			}
		);
		texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
		texture.generateMipmaps = true;
		texture.minFilter = THREE.LinearMipmapLinearFilter;
		texture.magFilter = THREE.LinearFilter;
		texturesRef.current.noise = texture;
		return texture;
	}, []);

	// Initialize grass material - only when textures are ready
	React.useEffect(() => {
		if (!grassAlphaTexture || !noiseTexture) return;
		
		const material = new GrassMaterial();
		material.setupTextures(grassAlphaTexture, noiseTexture);
		materialRef.current = material;
		setGrassMaterial(material);
		
		return () => {
			// Cleanup material first, before textures
			if (materialRef.current?.material) {
				materialRef.current.material.dispose();
				materialRef.current = null;
			}
		};
	}, [grassAlphaTexture, noiseTexture]);

	// Cleanup all resources on unmount - in correct order
	React.useEffect(() => {
		isMountedRef.current = true;
		// Capture refs at effect start to avoid lint warning about ref mutation during cleanup
		const texturesRefSnapshot = texturesRef.current;
		
		return () => {
			isMountedRef.current = false;

			// Snapshot refs to avoid lint warning about ref mutation during cleanup
			const material = materialRef.current?.material ?? null;
			const grassTexture = texturesRefSnapshot.grassAlpha;
			const noiseTex = texturesRefSnapshot.noise;
			const grassGeom = grassGeometryRef.current;
			const terrainGeom = terrainGeometryRef.current;

			// Cleanup order: material first, then textures, then geometries
			if (material) {
				material.dispose();
				materialRef.current = null;
			}

			if (grassTexture) {
				grassTexture.dispose();
				texturesRefSnapshot.grassAlpha = undefined;
			}
			if (noiseTex) {
				noiseTex.dispose();
				texturesRefSnapshot.noise = undefined;
			}

			if (grassGeom) {
				grassGeom.dispose();
				grassGeometryRef.current = null;
			}
			if (terrainGeom) {
				terrainGeom.dispose();
				terrainGeometryRef.current = null;
			}
		};
	}, []);

	/**
	 * Setup terrain and grass after models load
	 * Clones geometry before scaling to prevent mutation of original GLTF geometry
	 * Uses memoization to avoid re-cloning when scale params haven't changed
	 */
	React.useEffect(() => {
		if (!islandModel.scene || !grassLODsModel.scene || !grassMaterial) return;

		// Check if scale params changed - only clone if necessary
		const currentScaleParams = {
			terrainScale,
			terrainHeightScale,
			grassScale,
			grassHeightScale,
		};
		const scaleParamsChanged = !lastScaleParamsRef.current ||
			lastScaleParamsRef.current.terrainScale !== terrainScale ||
			lastScaleParamsRef.current.terrainHeightScale !== terrainHeightScale ||
			lastScaleParamsRef.current.grassScale !== grassScale ||
			lastScaleParamsRef.current.grassHeightScale !== grassHeightScale;

		// Create terrain material with darker green color
		const terrainMaterial = new THREE.MeshPhongMaterial({
			color: "#5e875e", // Lighter green
		});

		// Find terrain mesh from island model
		let terrainMesh: THREE.Mesh | null = null;
		let terrainGeometry: THREE.BufferGeometry | null = null;
		
		// Only clone terrain geometry if scale params changed
		if (scaleParamsChanged || !terrainGeometryRef.current) {
			islandModel.scene.traverse((child) => {
				if (child instanceof THREE.Mesh && child.geometry instanceof THREE.BufferGeometry) {
					// Dispose old geometry if it exists
					if (terrainGeometryRef.current) {
						terrainGeometryRef.current.dispose();
					}
					// Clone geometry before scaling to prevent mutation
					terrainGeometry = child.geometry.clone();
					terrainGeometry.scale(terrainScale, terrainScale * terrainHeightScale, terrainScale);
					terrainGeometryRef.current = terrainGeometry;
					child.geometry = terrainGeometry;
					child.material = terrainMaterial;
					child.receiveShadow = true;
					terrainMesh = child;
				}
			});
		} else {
			// Reuse existing geometry, just update material
			islandModel.scene.traverse((child) => {
				if (child instanceof THREE.Mesh && child.geometry instanceof THREE.BufferGeometry) {
					child.material = terrainMaterial;
					child.receiveShadow = true;
					terrainMesh = child;
					terrainGeometry = terrainGeometryRef.current;
				}
			});
		}

		if (!terrainMesh || !terrainGeometry) {
			console.warn("Terrain mesh not found in island model");
			return;
		}

		// Find grass geometry from LODs model and clone before scaling
		let grassGeometry: THREE.BufferGeometry | null = null;
		
		// Only clone grass geometry if scale params changed
		if (scaleParamsChanged || !grassGeometryRef.current) {
			grassLODsModel.scene.traverse((child) => {
				if (child instanceof THREE.Mesh && child.name.includes("LOD00") && child.geometry instanceof THREE.BufferGeometry) {
					// Dispose old geometry if it exists
					if (grassGeometryRef.current) {
						grassGeometryRef.current.dispose();
					}
					// Clone geometry before scaling to prevent mutation of original GLTF geometry
					// This is critical to prevent WebGL context loss
					grassGeometry = child.geometry.clone();
					// Scale width/depth uniformly, but height separately
					grassGeometry.scale(
						grassScale,
						grassScale * grassHeightScale,
						grassScale
					);
					grassGeometryRef.current = grassGeometry;
				}
			});
		} else {
			// Reuse existing geometry
			grassGeometry = grassGeometryRef.current;
		}

		if (!grassGeometry) {
			console.warn("Grass geometry (LOD00) not found in grassLODs model");
			return;
		}
		
		// Update scale params cache
		lastScaleParamsRef.current = currentScaleParams;

		// Create surface sampler - uniform distribution across entire terrain
		const sampler = new MeshSurfaceSampler(terrainMesh).build();

		// Create instanced mesh
		const instancedMesh = new THREE.InstancedMesh(
			grassGeometry,
			grassMaterial.material,
			grassCount
		);
		instancedMesh.receiveShadow = true;

		const position = new THREE.Vector3();
		const quaternion = new THREE.Quaternion();
		// Apply height scale to instance scale as well for additional control
		// Increase width/depth scale to make blades thicker
		const thicknessMultiplier = 1.2; // Makes blades 20% thicker
		const scale = new THREE.Vector3(thicknessMultiplier, grassHeightScale, thicknessMultiplier);
		const normal = new THREE.Vector3();
		const yAxis = new THREE.Vector3(0, 1, 0);
		const matrix = new THREE.Matrix4();

		// Sample randomly from the surface
		for (let i = 0; i < grassCount; i++) {
			sampler.sample(position, normal);

			// Align the instance with the surface normal
			quaternion.setFromUnitVectors(yAxis, normal);
			// Create a random rotation around the y-axis
			const randomRotation = new THREE.Euler(0, Math.random() * Math.PI * 2, 0);
			const randomQuaternion = new THREE.Quaternion().setFromEuler(randomRotation);

			// Combine the alignment with the random rotation
			quaternion.multiply(randomQuaternion);

			// Set the new scale in the matrix
			matrix.compose(position, quaternion, scale);

			instancedMesh.setMatrixAt(i, matrix);
		}

		instancedMesh.instanceMatrix.needsUpdate = true;
		setGrassInstancedMesh(instancedMesh);

		/**
		 * Cleanup function - disposes all created resources
		 * Prevents memory leaks and WebGL context loss
		 * Cleanup order: meshes -> geometries -> materials
		 */
		return () => {
			// Only cleanup if component is still mounted (prevents double cleanup in Strict Mode)
			if (!isMountedRef.current) return;
			
			// Dispose instanced mesh first (also disposes its geometry reference)
			instancedMesh.dispose();
			
			// Dispose materials last
			if (terrainMaterial) {
				terrainMaterial.dispose();
			}
		};
	}, [
		islandModel.scene,
		grassLODsModel.scene,
		grassMaterial,
		grassCount,
		terrainScale,
		terrainHeightScale,
		grassScale,
		grassHeightScale,
	]);

	// Update grass animation
	useFrame((state, delta) => {
		if (grassMaterial) {
			timeRef.current += delta;
			grassMaterial.update(timeRef.current);
		}
	});

	return (
		<>
			{/* Terrain mesh */}
			{islandModel.scene && (
				<primitive
					object={islandModel.scene}
					receiveShadow
				/>
			)}

			{/* Grass instanced mesh */}
			{grassInstancedMesh && (
				<primitive object={grassInstancedMesh} receiveShadow />
			)}
		</>
	);
}

// Preload models
useGLTF.preload("/models/island.glb");
useGLTF.preload("/models/grassLODs.glb");

