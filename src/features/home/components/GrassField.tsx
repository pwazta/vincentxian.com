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
	grassCount = 3500,
	terrainScale = 2,
	terrainHeightScale = 0.8,
	grassScale = 5,
	grassHeightScale = 0.4,
}: GrassFieldProps) {
	const [grassInstancedMesh, setGrassInstancedMesh] = React.useState<THREE.InstancedMesh | null>(null);
	const [grassMaterial, setGrassMaterial] = React.useState<GrassMaterial | null>(null);
	const timeRef = React.useRef(0);

	// Load terrain model
	const islandModel = useGLTF("/models/island.glb");
	const grassLODsModel = useGLTF("/models/grassLODs.glb");

	// Load textures with proper cleanup
	const grassAlphaTexture = React.useMemo(() => {
		const loader = new THREE.TextureLoader();
		const texture = loader.load("/models/grass.jpeg");
		texture.generateMipmaps = true;
		texture.minFilter = THREE.LinearMipmapLinearFilter;
		texture.magFilter = THREE.LinearFilter;
		return texture;
	}, []);

	const noiseTexture = React.useMemo(() => {
		const loader = new THREE.TextureLoader();
		const texture = loader.load("/models/perlinnoise.webp");
		texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
		texture.generateMipmaps = true;
		texture.minFilter = THREE.LinearMipmapLinearFilter;
		texture.magFilter = THREE.LinearFilter;
		return texture;
	}, []);

	// Cleanup textures on unmount
	React.useEffect(() => {
		return () => {
			grassAlphaTexture.dispose();
			noiseTexture.dispose();
		};
	}, [grassAlphaTexture, noiseTexture]);

	// Initialize grass material
	React.useEffect(() => {
		const material = new GrassMaterial();
		material.setupTextures(grassAlphaTexture, noiseTexture);
		setGrassMaterial(material);
		
		return () => {
			// Cleanup material
			if (material.material) {
				material.material.dispose();
			}
		};
	}, [grassAlphaTexture, noiseTexture]);

	// Setup terrain and grass after models load
	React.useEffect(() => {
		if (!islandModel.scene || !grassLODsModel.scene || !grassMaterial) return;

		// Create terrain material with darker green color
		const terrainMaterial = new THREE.MeshPhongMaterial({
			color: "#5e875e", // Lighter green
		});

		// Find terrain mesh from island model
		let terrainMesh: THREE.Mesh | null = null;
		islandModel.scene.traverse((child) => {
			if (child instanceof THREE.Mesh && child.geometry instanceof THREE.BufferGeometry) {
				child.material = terrainMaterial;
				child.receiveShadow = true;
				child.geometry.scale(terrainScale, terrainScale * terrainHeightScale, terrainScale);
				terrainMesh = child;
			}
		});

		if (!terrainMesh) return;

		// Find grass geometry from LODs model
		let grassGeometry: THREE.BufferGeometry | null = null;
		grassLODsModel.scene.traverse((child) => {
			if (child instanceof THREE.Mesh && child.name.includes("LOD00") && child.geometry instanceof THREE.BufferGeometry) {
				// Scale width/depth uniformly, but height separately
				child.geometry.scale(
					grassScale,
					grassScale * grassHeightScale,
					grassScale
				);
				grassGeometry = child.geometry;
			}
		});

		if (!grassGeometry) return;

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
		const scale = new THREE.Vector3(1, grassHeightScale, 1);
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

		// Cleanup
		return () => {
			instancedMesh.dispose();
			grassGeometry.dispose();
			if (terrainMaterial) terrainMaterial.dispose();
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

