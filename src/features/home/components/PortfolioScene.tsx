/**
 * 3D portfolio scene component using React Three Fiber
 * Used in: Home page 3D scene
 */
"use client";

import * as React from "react";
import { Canvas, useThree, useFrame } from "@react-three/fiber";
import { OrbitControls, useGLTF, Grid, Html } from "@react-three/drei";
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

/**
 * OrbitControls with pan limits - clamps target instead of camera to prevent rotation issues
 * Hard limit at y=1.5 to prevent camera from going under the island
 */
function LimitedOrbitControls() {
	const { controls, camera } = useThree();
	const ISLAND_FLOOR_Y = 1.5; // Hard limit - no camera below this

	useFrame(() => {
		if (!controls || !('target' in controls)) return;

		// Clamp the target (pan center) to prevent panning beyond limits
		// This prevents rotation issues that occur when clamping camera position
		const target = (controls as { target: THREE.Vector3 }).target;
		target.x = Math.max(-5, Math.min(8, target.x));
		target.y = Math.max(ISLAND_FLOOR_Y, Math.min(5, target.y));
		target.z = Math.max(-5, Math.min(5, target.z));

		// Also clamp camera position to prevent it from going below island floor
		camera.position.y = Math.max(ISLAND_FLOOR_Y, camera.position.y);
	});

	return (
		<OrbitControls
			makeDefault
			enablePan={true}
			enableZoom={true}
			enableRotate={true}
			minDistance={4}
			maxDistance={12}
		/>
	);
}

/**
 * Grid axis labels component using Html overlays (GPU-friendly, no 3D geometry)
 */
function GridLabels() {
	const labelHeight = 0.05;
	const range = 20; // Reduced range to limit labels
	const step = 10; // Only major intervals to reduce count

	const labels: Array<{ position: [number, number, number]; text: string }> = [];

	// Origin label
	labels.push({ position: [0, labelHeight, 0], text: "0,0" });

	// X-axis labels (only major intervals, limited range)
	for (let x = step; x <= range; x += step) {
		labels.push({ position: [x, labelHeight, 0], text: `${x},0` });
		labels.push({ position: [-x, labelHeight, 0], text: `-${x},0` });
	}

	// Z-axis labels (only major intervals, limited range)
	for (let z = step; z <= range; z += step) {
		labels.push({ position: [0, labelHeight, z], text: `0,${z}` });
		labels.push({ position: [0, labelHeight, -z], text: `0,-${z}` });
	}

	return (
		<>
			{labels.map((label, index) => (
				<Html
					key={index}
					position={label.position}
					center
					style={{
						color: "#666",
						fontSize: "12px",
						fontFamily: "monospace",
						pointerEvents: "none",
						textShadow: "1px 1px 2px rgba(0,0,0,0.8)",
						userSelect: "none",
					}}
				>
					{label.text}
				</Html>
			))}
		</>
	);
}

function SceneContent({
  onSoftwareClick,
  onArtsClick,
  onAboutClick,
  onContactClick,
  showGrid = false,
}: {
  onSoftwareClick: () => void;
  onArtsClick: () => void;
  onAboutClick: () => void;
  onContactClick: () => void;
  showGrid?: boolean;
}) {
  const { scene } = useThree();
  const [hitboxes, setHitboxes] = React.useState<THREE.Mesh[]>([]);
  const [gridVisible, setGridVisible] = React.useState(showGrid);

  // Toggle grid with 'G' key
  React.useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === "g" || e.key === "G") {
        setGridVisible((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, []);

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
        const metadata = hitbox.userData.metadata as { originalObject: THREE.Object3D } | undefined;
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
      onDiskLinkedInClick: () => {
        // External link handled in useObjectInteractions
      },
      onDiskGithubClick: () => {
        // External link handled in useObjectInteractions
      },
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
        position={[10, 50, 50]}
        intensity={1.3}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-far={200}
        shadow-camera-left={-50}
        shadow-camera-right={50}
        shadow-camera-top={50}
        shadow-camera-bottom={-50}
        shadow-bias={-0.0001}
      />

      {/* Debug grid helper - Press 'G' to toggle */}
      {gridVisible && (
        <>
          <Grid
            args={[50, 50]}
            cellColor="#6f6f6f"
            sectionColor="#9d4b4b"
            cellThickness={0.5}
            sectionThickness={1}
            fadeDistance={30}
            fadeStrength={1}
            position={[0, 0, 0]}
          />
          {/* Grid axis labels */}
          <GridLabels />
        </>
      )}

      {/* Grass field with terrain */}
      <GrassField
        grassCount={2000}
        terrainScale={2}
        terrainHeightScale={0.5}
        grassScale={8}
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
  showGrid?: boolean;
};

export function PortfolioScene({
  onSoftwareClick,
  onArtsClick,
  onAboutClick,
  onContactClick,
  showGrid = false,
}: PortfolioSceneProps) {
  return (
    <div className="h-full w-full">
      <Canvas
        camera={{ position: [0, 10, 8], fov: 70 }}
        gl={{ 
          antialias: true,
          powerPreference: "high-performance",
          preserveDrawingBuffer: false,
        }}
        onCreated={({ gl }) => {
          // Handle WebGL context loss
          gl.domElement.addEventListener("webglcontextlost", (e) => {
            e.preventDefault();
            console.warn("WebGL context lost - attempting to restore");
          });
          gl.domElement.addEventListener("webglcontextrestored", () => {
            console.log("WebGL context restored");
          });
        }}
      >
        <RendererConfig />
        <SceneContent 
          onSoftwareClick={onSoftwareClick} 
          onArtsClick={onArtsClick} 
          onAboutClick={onAboutClick} 
          onContactClick={onContactClick}
          showGrid={showGrid}
        />
        <LimitedOrbitControls />
      </Canvas>
    </div>
  );
}

// Preload models for better performance
useGLTF.preload("/models/computer.glb");
useGLTF.preload("/models/cabinet.glb");
useGLTF.preload("/models/phone.glb");
