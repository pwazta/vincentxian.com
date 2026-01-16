/**
 * Grass field component using instanced grass meshes on terrain surface
 * Used in: PortfolioScene for rendering animated grass field
 *
 * Adapted from "How to Make the Fluffiest Grass with Three.js" by Ebenezer
 * https://tympanus.net/codrops/2025/02/04/how-to-make-the-fluffiest-grass-with-three-js/
 * Original code: MIT License - Copyright (c) 2023 Ebenezer
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
	isDarkMode?: boolean;
};

export function GrassField({ grassCount = 1000, terrainScale = 2, terrainHeightScale = 0.8, grassScale = 5, grassHeightScale = 0.4, isDarkMode = false }: GrassFieldProps) {
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

	/** Loads grass alpha texture with error handling */
	const grassAlphaTexture = React.useMemo(() => {
		const loader = new THREE.TextureLoader();
		const texture = loader.load("/models/grass.jpeg", undefined, undefined, (error) => {
			console.error("Failed to load grass alpha texture:", error);
		});
		texture.generateMipmaps = true;
		texture.minFilter = THREE.LinearMipmapLinearFilter;
		texture.magFilter = THREE.LinearFilter;
		texturesRef.current.grassAlpha = texture;
		return texture;
	}, []);

	/** Loads noise texture with error handling */
	const noiseTexture = React.useMemo(() => {
		const loader = new THREE.TextureLoader();
		const texture = loader.load("/models/perlinnoise.webp", undefined, undefined, (error) => {
			console.error("Failed to load noise texture:", error);
		});
		texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
		texture.generateMipmaps = true;
		texture.minFilter = THREE.LinearMipmapLinearFilter;
		texture.magFilter = THREE.LinearFilter;
		texturesRef.current.noise = texture;
		return texture;
	}, []);

	/** Initialize grass material when textures are ready */
	React.useEffect(() => {
		if (!grassAlphaTexture || !noiseTexture) return;
		
		const material = new GrassMaterial();
		material.setupTextures(grassAlphaTexture, noiseTexture);
		materialRef.current = material;
		setGrassMaterial(material);
		
		return () => {
			if (materialRef.current?.material) {
				materialRef.current.material.dispose();
				materialRef.current = null;
			}
		};
	}, [grassAlphaTexture, noiseTexture]);

	/** Update grass colors based on dark mode */
	React.useEffect(() => {
		if (grassMaterial) {
			grassMaterial.setDarkMode(isDarkMode);
		}
	}, [grassMaterial, isDarkMode]);

	/** Cleanup all resources on unmount in correct order */
	React.useEffect(() => {
		isMountedRef.current = true;
		const texturesRefSnapshot = texturesRef.current;
		
		return () => {
			isMountedRef.current = false;
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

	/** Setup terrain and grass after models load - clones geometry before scaling to prevent mutation */
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

		const terrainColor = isDarkMode ? "#2a3d2a" : "#5e875e";
		const terrainMaterial = new THREE.MeshPhongMaterial({ color: terrainColor });

		let terrainMesh: THREE.Mesh | null = null;
		let terrainGeometry: THREE.BufferGeometry | null = null;
		
		// Only clone terrain geometry if scale params changed
		if (scaleParamsChanged || !terrainGeometryRef.current) {
			islandModel.scene.traverse((child) => {
				if (child instanceof THREE.Mesh && child.geometry instanceof THREE.BufferGeometry) {
					if (terrainGeometryRef.current) terrainGeometryRef.current.dispose();
					
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
		if (scaleParamsChanged || !grassGeometryRef.current) {
			grassLODsModel.scene.traverse((child) => {
				if (child instanceof THREE.Mesh && child.name.includes("LOD00") && child.geometry instanceof THREE.BufferGeometry) {
					if (grassGeometryRef.current) grassGeometryRef.current.dispose();

					grassGeometry = child.geometry.clone();
					grassGeometry.scale(grassScale, grassScale * grassHeightScale, grassScale);
					grassGeometryRef.current = grassGeometry;
				}
			});
		} else {
			grassGeometry = grassGeometryRef.current;
		}

		if (!grassGeometry) {
			console.warn("Grass geometry (LOD00) not found in grassLODs model");
			return;
		}
		
		// Update scale params cache
		lastScaleParamsRef.current = currentScaleParams;

		const sampler = new MeshSurfaceSampler(terrainMesh).build();
		const instancedMesh = new THREE.InstancedMesh(grassGeometry, grassMaterial.material, grassCount);
		instancedMesh.receiveShadow = true;

		const position = new THREE.Vector3();
		const quaternion = new THREE.Quaternion();
		const thicknessMultiplier = 1.2;
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

		return () => {
			if (!isMountedRef.current) return;
			instancedMesh.dispose();
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
		isDarkMode,
	]);

	/** Update grass animation */
	useFrame((state, delta) => {
		if (grassMaterial) {
			timeRef.current += delta;
			grassMaterial.update(timeRef.current);
		}
	});

	return (
		<>
			{islandModel.scene && <primitive object={islandModel.scene} receiveShadow />}
			{grassInstancedMesh && <primitive object={grassInstancedMesh} receiveShadow />}
		</>
	);
}

useGLTF.preload("/models/island.glb");
useGLTF.preload("/models/grassLODs.glb");
