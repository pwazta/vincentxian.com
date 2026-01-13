/**
 * 3D portfolio scene component using React Three Fiber
 * Used in: Home page 3D scene
 */
"use client";

import * as React from "react";
import { Canvas, useThree, useFrame } from "@react-three/fiber";
import { OrbitControls, useGLTF, Grid } from "@react-three/drei";
import * as THREE from "three";
import { GrassField } from "./GrassField";
import { SceneLoader } from "./SceneLoader";
import { setupInteractiveObjects } from "../utils/sceneObjectSetup";
import { useSceneRaycaster } from "../hooks/useSceneRaycaster";
import { useObjectInteractions } from "../hooks/useObjectInteractions";
import { storeOriginalColors } from "../utils/materialUtils";
import type { ClickActions } from "../utils/sceneInteractions";

/** Configures renderer settings for grass shadows and rendering */
function RendererConfig() {
	const { gl } = useThree();
	const [contextLost, setContextLost] = React.useState(false);
	
	React.useEffect(() => {
		gl.shadowMap.enabled = true;
		gl.shadowMap.type = THREE.PCFSoftShadowMap;
		gl.outputColorSpace = THREE.SRGBColorSpace;
		gl.toneMapping = THREE.ACESFilmicToneMapping;
		
		const canvas = gl.domElement;
		const handleContextLost = (event: Event) => {
			event.preventDefault();
			setContextLost(true);
		};
		
		const handleContextRestored = () => {
			setContextLost(false);
			// Reinitialize renderer settings after context restoration
			gl.shadowMap.enabled = true;
			gl.shadowMap.type = THREE.PCFSoftShadowMap;
			gl.outputColorSpace = THREE.SRGBColorSpace;
			gl.toneMapping = THREE.ACESFilmicToneMapping;
		};
		
		canvas.addEventListener("webglcontextlost", handleContextLost);
		canvas.addEventListener("webglcontextrestored", handleContextRestored);
		
		return () => {
			canvas.removeEventListener("webglcontextlost", handleContextLost);
			canvas.removeEventListener("webglcontextrestored", handleContextRestored);
		};
	}, [gl]);
	return null;
}

/** Animates camera movement to a target position */
function CameraMove({ start, to, speed = 0.8, onComplete }: { 
  start: boolean; to: [number, number, number]; speed?: number; onComplete?: () => void 
}) {
	const { camera } = useThree();
	const hasAnimated = React.useRef(false);
	const animationProgress = React.useRef(0);
	const startPosition = React.useRef<THREE.Vector3 | null>(null);
	const targetPosition = React.useMemo(() => new THREE.Vector3(...to), [to]);

	useFrame((_, delta) => {
		if (start && !hasAnimated.current) {
			// Capture current camera position on first frame of animation
			if (!startPosition.current) {
				startPosition.current = camera.position.clone();
			}

			animationProgress.current += delta * speed;
			const t = Math.min(animationProgress.current, 1);
			// Smooth easing (ease-out cubic)
			const eased = 1 - Math.pow(1 - t, 3);

			camera.position.lerpVectors(startPosition.current, targetPosition, eased);

			if (t >= 1) {
				hasAnimated.current = true;
				onComplete?.();
			}
		}
	});

	return null;
}

/** OrbitControls with pan limits - clamps target instead of camera to prevent rotation issues */
function LimitedOrbitControls({ limitMaxDistance }: { limitMaxDistance: boolean }) {
	const { controls, camera } = useThree();
	const ISLAND_FLOOR_Y = 1.5; // Hard limit - no camera below this
	const targetInitialized = React.useRef(false);

	useFrame(() => {
		if (!controls || !('target' in controls)) return;
		const target = (controls as { target: THREE.Vector3 }).target;

		// Only apply target and limits after zoom animation is complete
			if (!targetInitialized.current) {
				target.set(0.5, 3, 0);
				targetInitialized.current = true;
			}

			target.x = Math.max(-5, Math.min(8, target.x));
			target.y = Math.max(ISLAND_FLOOR_Y, Math.min(5, target.y));
			target.z = Math.max(-5, Math.min(5, target.z));
			camera.position.y = Math.max(ISLAND_FLOOR_Y, camera.position.y);
	});

	// Disable distance limits during intro animation
	const maxDist = limitMaxDistance ? 12 : 100;

	return <OrbitControls makeDefault enablePan={true} enableZoom={true} enableRotate={true} minDistance={2} maxDistance={maxDist} />;
}

type PortfolioSceneProps = {
  onSoftwareClick: () => void;
  onArtsClick: () => void;
  onAboutClick: () => void;
  onContactClick: () => void;
  isDialogOpen: boolean;
};

type SceneContentProps = PortfolioSceneProps & {
  isLoaderActive: boolean;
};

function SceneContent({ onSoftwareClick, onArtsClick, onAboutClick, onContactClick, isDialogOpen, isLoaderActive }: SceneContentProps) {
  const { scene } = useThree();
  const [interactiveMeshes, setInteractiveMeshes] = React.useState<THREE.Mesh[]>([]);
  const [primaryColor, setPrimaryColor] = React.useState<string>("#7c9082");
  const [resourcesReady, setResourcesReady] = React.useState(false);

  /** Get primary color from CSS variables and watch for theme changes */
  React.useEffect(() => {
    const getPrimaryColor = () => {
      if (typeof window === "undefined") return "#7c9082";
      const root = document.documentElement;
      const color = getComputedStyle(root).getPropertyValue("--primary").trim();
      return color || "#7c9082";
    };

    setPrimaryColor(getPrimaryColor());
    const observer = new MutationObserver(() => {
      setPrimaryColor(getPrimaryColor());
    });

    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  /** Scene setup */
  React.useEffect(() => {
    scene.fog = new THREE.FogExp2("#eeeeee", 0.02);
    scene.background = new THREE.Color("#eeeeee");
  }, [scene]);
  const computerModel = useGLTF("/models/computer.glb");
  const cabinetModel = useGLTF("/models/cabinet.glb");
  const phoneModel = useGLTF("/models/phone.glb");

  /** Wait for main models before rendering heavy content. SceneLoader handles global loading, but this ensures models are ready */
  React.useEffect(() => {
    const allModelsLoaded = 
      computerModel.scene && 
      cabinetModel.scene && 
      phoneModel.scene;

    if (allModelsLoaded && !resourcesReady) { // Small delay to ensure WebGL context is stable
      const timer = setTimeout(() => { setResourcesReady(true); }, 200);
      return () => clearTimeout(timer);
    }
  }, [computerModel.scene, cabinetModel.scene, phoneModel.scene, resourcesReady]);

  /** Setup interactive objects after models load */
  React.useEffect(() => {
    if (!resourcesReady) return;
    
    const timer = setTimeout(() => {
      const meshes = setupInteractiveObjects(scene);
      for (const mesh of meshes) {
        storeOriginalColors(mesh);
      }
      setInteractiveMeshes(meshes);
    }, 100);
  
    return () => clearTimeout(timer);
  }, [scene, resourcesReady]);

  const interactionsEnabled = interactiveMeshes.length > 0 && !isDialogOpen && !isLoaderActive;
  const { intersects } = useSceneRaycaster({ interactiveMeshes, enabled: interactionsEnabled });

  // Click actions mapping
  const clickActions: ClickActions = React.useMemo(() => ({
      onPhoneClick: onContactClick,
      onComputerClick: onSoftwareClick,
      onDiskLinkedInClick: () => { /* External link handled in useObjectInteractions */ },
      onDiskGithubClick: () => { /* External link handled in useObjectInteractions */ },
      onDrawerAboutClick: onAboutClick,
      onDrawerSoftwareClick: onSoftwareClick,
      onDrawerArtsClick: onArtsClick,
    }), [onSoftwareClick, onArtsClick, onAboutClick, onContactClick]
  );

  useObjectInteractions({ intersects, clickActions, enabled: interactionsEnabled });

  // Don't render heavy content until resources are ready
  if (!resourcesReady) {
    return (
      <>
        <ambientLight intensity={0.4} />
        <directionalLight position={[3, 6, 8]} intensity={1} />
      </>
    );
  }

  return (
    <>
      {/* Ambient light for overall scene illumination - reduces harsh shadows */}
      <ambientLight intensity={0.4} />

      <directionalLight
        position={[3, 6, 8]}
        intensity={1}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={20}
        shadow-camera-left={-9}
        shadow-camera-right={10}
        shadow-camera-top={7}
        shadow-camera-bottom={-3}
        shadow-bias={-0.001}
        shadow-normalBias={0.03}
      />

      {/* Grid */}
      <Grid
        scale={2}
        args={[45, 45]}
        cellColor={primaryColor}
        sectionColor={primaryColor}
        cellThickness={0.8}
        sectionThickness={1.3}
        fadeDistance={40}
        fadeStrength={1}
        position={[0, 0, 0]}
      />

      {/* Grass field with terrain */}
      <GrassField
        grassCount={1500}
        terrainScale={2}
        terrainHeightScale={0.5}
        grassScale={8}
        grassHeightScale={0.4}
      />

      {/* GLB Models */}
      <group position={[0, 1, 0]}>
        <primitive object={computerModel.scene} />
        <primitive object={phoneModel.scene} />
        <primitive object={cabinetModel.scene} />
      </group>
    </>
  );
}

export function PortfolioScene({ onSoftwareClick, onArtsClick, onAboutClick, onContactClick, isDialogOpen }: PortfolioSceneProps) {
  const [showLoader, setShowLoader] = React.useState(true);
  const [isZooming, setIsZooming] = React.useState(false);

  return (
    <div className="relative h-full w-full" style={{ pointerEvents: isDialogOpen ? "none" : "auto" }}>
      {showLoader && <SceneLoader onLoaded={() => setShowLoader(false)} onEnterClick={() => setIsZooming(true)} />}
      <Canvas
        shadows
        dpr={[1, 1.5]}
        camera={{ position: [-12, 18, 18], fov: 70 }} // CameraMove function will move it to 0.5, 7, 7
        gl={{
          antialias: true,
          powerPreference: "default",
          preserveDrawingBuffer: false,
          failIfMajorPerformanceCaveat: false,
        }}
      >
        <RendererConfig />
        <CameraMove start={isZooming} to={[0.5, 7, 7]} onComplete={() => setIsZooming(false)} />
        <SceneContent onSoftwareClick={onSoftwareClick} onArtsClick={onArtsClick} onAboutClick={onAboutClick} onContactClick={onContactClick} isDialogOpen={isDialogOpen} isLoaderActive={showLoader} />
        <LimitedOrbitControls limitMaxDistance={!isZooming && !showLoader} />
      </Canvas>
    </div>
  );
}

useGLTF.preload("/models/computer.glb");
useGLTF.preload("/models/cabinet.glb");
useGLTF.preload("/models/phone.glb");
