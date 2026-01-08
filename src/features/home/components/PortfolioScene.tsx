/**
 * 3D portfolio scene component using React Three Fiber
 * Used in: Home page 3D scene
 */
"use client";

import * as React from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { GrassField } from "./GrassField";
import { setupInteractiveObjects } from "../utils/sceneObjectSetup";
import { useSceneRaycaster } from "../hooks/useSceneRaycaster";
import { useObjectInteractions } from "../hooks/useObjectInteractions";
import { storeOriginalColors } from "../utils/materialUtils";
import type { ClickActions } from "./sceneInteractions";

/**
 * Configures renderer settings for grass shadows and rendering
 */
function RendererConfig() {
	const { gl } = useThree();
	React.useEffect(() => {
		gl.shadowMap.enabled = true;
		gl.shadowMap.type = THREE.PCFSoftShadowMap;
		gl.outputColorSpace = THREE.SRGBColorSpace;
		gl.toneMapping = THREE.ACESFilmicToneMapping;
	}, [gl]);
	return null;
}

function SceneContent({
  onSoftwareClick,
  onArtsClick,
  onAboutClick,
  onContactClick,
}: {
  onSoftwareClick: () => void;
  onArtsClick: () => void;
  onAboutClick: () => void;
  onContactClick: () => void;
}) {
  const { scene } = useThree();
  const [hitboxes, setHitboxes] = React.useState<THREE.Mesh[]>([]);

  // Scene setup
  React.useEffect(() => {
    scene.fog = new THREE.FogExp2("#eeeeee", 0.02);
    scene.background = new THREE.Color("#eeeeee");
  }, [scene]);

  // Load GLB models
  const computerModel = useGLTF("/models/computer.glb");
  const cabinetModel = useGLTF("/models/cabinet.glb");
  const phoneModel = useGLTF("/models/phone.glb");

  // Setup interactive objects after models load
  React.useEffect(() => {
    // Wait for models to be fully loaded
    const timer = setTimeout(() => {
      const newHitboxes = setupInteractiveObjects(scene);
      
      // Store original colors for all interactive objects
      for (const hitbox of newHitboxes) {
        const metadata = hitbox.userData.metadata;
        if (metadata) {
          storeOriginalColors(metadata.originalObject);
        }
      }
      
      setHitboxes(newHitboxes);
    }, 100);

    return () => clearTimeout(timer);
  }, [scene, computerModel.scene, cabinetModel.scene, phoneModel.scene]);

  // Raycaster for intersection detection
  const { intersects } = useSceneRaycaster({
    hitboxes,
    enabled: hitboxes.length > 0,
  });

  // Click actions mapping
  const clickActions: ClickActions = React.useMemo(
    () => ({
      onPhoneClick: onContactClick,
      onComputerClick: onSoftwareClick,
      onDiskLinkedInClick: () => {},
      onDiskGithubClick: () => {},
      onDrawerAboutClick: onAboutClick,
      onDrawerSoftwareClick: onSoftwareClick,
      onDrawerArtsClick: onArtsClick,
    }),
    [onSoftwareClick, onArtsClick, onAboutClick, onContactClick]
  );

  // Handle interactions
  useObjectInteractions({
    intersects,
    clickActions,
    enabled: hitboxes.length > 0,
    hitboxes,
  });

  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight
        position={[100, 100, 100]}
        intensity={2}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={200}
        shadow-camera-left={-50}
        shadow-camera-right={50}
        shadow-camera-top={50}
        shadow-camera-bottom={-50}
      />

      {/* Grass field with terrain */}
      <GrassField
        grassCount={3500}
        terrainScale={2}
        terrainHeightScale={0.5}
        grassScale={5}
        grassHeightScale={0.4}
      />

      {/* GLB Models - scaled from cm to meters and positioned in a T layout */}
      <group position={[0, 1, 0]} scale={1}>
        {/* Center: computer, facing camera */}
        <group>
          <primitive object={computerModel.scene} />
        </group>

        {/* Left: phone, 45° rotated toward center/camera */}
        <group position={[0, 0, 0]}>
          <primitive object={phoneModel.scene} />
        </group>

        {/* Right: cabinet, 45° rotated toward center/camera */}
        <group>
          <primitive object={cabinetModel.scene} />
        </group>
      </group>
    </>
  );
}

type PortfolioSceneProps = {
  onSoftwareClick: () => void;
  onArtsClick: () => void;
  onAboutClick: () => void;
  onContactClick: () => void;
};

export function PortfolioScene({
  onSoftwareClick,
  onArtsClick,
  onAboutClick,
  onContactClick,
}: PortfolioSceneProps) {
  return (
    <div className="h-full w-full">
      <Canvas
        camera={{ position: [-14, 8, -10], fov: 75}}
        gl={{ antialias: true }}
      >
        <RendererConfig />
        <SceneContent onSoftwareClick={onSoftwareClick} onArtsClick={onArtsClick} onAboutClick={onAboutClick} onContactClick={onContactClick} />
        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={5}
          maxDistance={15}
        />
      </Canvas>
    </div>
  );
}

// Preload models for better performance
useGLTF.preload("/models/computer.glb");
useGLTF.preload("/models/cabinet.glb");
useGLTF.preload("/models/phone.glb");
