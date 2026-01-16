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
import { useThemeSync } from "../hooks/useThemeSync";
import { storeOriginalColors } from "../utils/materialUtils";
import { VideoScreen, VIDEO_COUNT, getVideoCredit } from "./VideoScreen";
import type { ClickActions } from "../utils/sceneInteractions";

/** Configures renderer settings for grass shadows and rendering */
function RendererConfig() {
	const { gl } = useThree();

	React.useEffect(() => {
		gl.shadowMap.enabled = true;
		gl.shadowMap.type = THREE.PCFSoftShadowMap;
		gl.outputColorSpace = THREE.SRGBColorSpace;
		gl.toneMapping = THREE.ACESFilmicToneMapping;

		const canvas = gl.domElement;
		const handleContextLost = (event: Event) => {
			event.preventDefault();
		};

		const handleContextRestored = () => {
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
			startPosition.current ??= camera.position.clone();

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
  onScreenHoverChange: (isHovered: boolean) => void;
  currentVideoIndex: number;
  onVideoIndexChange: () => void;
};

/** Inner scene component - renders all 3D content inside Canvas (lights, models, grass) */
function SceneContent({ onSoftwareClick, onArtsClick, onAboutClick, onContactClick, isDialogOpen, isLoaderActive, onScreenHoverChange, currentVideoIndex, onVideoIndexChange }: SceneContentProps) {
  const { scene } = useThree();
  const [interactiveMeshes, setInteractiveMeshes] = React.useState<THREE.Mesh[]>([]);
  const [resourcesReady, setResourcesReady] = React.useState(false);

  const { primaryColor, isDarkMode } = useThemeSync();

  /** Scene setup - update background and fog based on theme */
  React.useEffect(() => {
    const bgColor = isDarkMode ? "#0a0a0a" : "#eeeeee";
    scene.fog = new THREE.FogExp2(bgColor, 0.02);
    scene.background = new THREE.Color(bgColor);
  }, [scene, isDarkMode]);
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
      onComputerFrameClick: onAboutClick,
      onScreenClick: onVideoIndexChange,
      onDiskLinkedInClick: () => { /* External link handled in useObjectInteractions */ },
      onDiskGithubClick: () => { /* External link handled in useObjectInteractions */ },
      onDrawerAboutClick: onAboutClick,
      onDrawerSoftwareClick: onSoftwareClick,
      onDrawerArtsClick: onArtsClick,
    }), [onSoftwareClick, onArtsClick, onAboutClick, onContactClick, onVideoIndexChange]
  );

  useObjectInteractions({ intersects, clickActions, enabled: interactionsEnabled, onScreenHoverChange });

  // Don't render heavy content until resources are ready
  if (!resourcesReady) {
    return (
      <>
        <ambientLight intensity={isDarkMode ? 0.2 : 0.4} />
        {isDarkMode ? (
          <spotLight position={[0, 20, 0]} angle={Math.PI / 1.5} intensity={3} distance={50} />
        ) : (
          <directionalLight position={[3, 6, 8]} intensity={1} />
        )}
      </>
    );
  }

  return (
    <>
      {/* Ambient light for overall scene illumination - reduces harsh shadows */}
      <ambientLight intensity={ 0.3 } />

      {isDarkMode ? (
        // Dark mode: Spotlight for dramatic moonlight effect
        <>
          <spotLight
            position={[-1, 8, 2]}
            angle={Math.PI / 1.5}
            penumbra={0.8}
            color={"#FFF"}
            intensity={25}
            distance={25}
            castShadow
            shadow-mapSize-width={2048}
            shadow-mapSize-height={2048}
            shadow-camera-far={40}
            shadow-bias={-0.001}
            shadow-normalBias={0.03}
          />
          <directionalLight
            position={[-2, 6, -1]}
            intensity={0.8}
            castShadow={false}
          />
        </>
      ) : (
        // Light mode: Directional light for natural sunlight
        <>
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
        <directionalLight
          position={[2, 5, -5]}
          intensity={0.4}
          castShadow={false}
        />
        </>
      )}

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
        isDarkMode={isDarkMode}
      />

      {/* GLB Models */}
      <group position={[0, 1, 0]}>
        <primitive object={computerModel.scene} />
        <VideoScreen computerScene={computerModel.scene} currentVideoIndex={currentVideoIndex} />
        <primitive object={phoneModel.scene} />
        <primitive object={cabinetModel.scene} />
      </group>
    </>
  );
}

/** Credit toast that appears when hovering the computer screen */
function CreditToast({ isVisible, artist, artistUrl, onMouseEnter, onMouseLeave }: { isVisible: boolean; artist?: string; artistUrl?: string; onMouseEnter: () => void; onMouseLeave: () => void }) {
  if (!artist) return null;

  return (
    <div
      className={`absolute bottom-4 right-4 z-10 transition-opacity duration-200 ${isVisible ? "opacity-70 hover:opacity-100" : "opacity-0 pointer-events-none"}`}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div className="border border-foreground bg-background">
        <div className="bg-primary px-2 py-0.5 flex items-center justify-between gap-2">
          <span className="text-[10px] text-white font-medium">Credit</span>
          <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div className="px-2 py-1.5">
          {artistUrl ? (
            <a
              href={artistUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-mono text-foreground hover:text-primary hover:underline transition-colors flex items-center gap-1"
            >
              Art by @{artist}
              <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          ) : (
            <span className="text-xs font-mono text-foreground">Art by @{artist}</span>
          )}
        </div>
      </div>
    </div>
  );
}

/** Main exported component - sets up Canvas, loader, and camera animation */
export function PortfolioScene({ onSoftwareClick, onArtsClick, onAboutClick, onContactClick, isDialogOpen }: PortfolioSceneProps) {
  const [showLoader, setShowLoader] = React.useState(true);
  const [isZooming, setIsZooming] = React.useState(false);
  const [currentVideoIndex, setCurrentVideoIndex] = React.useState(0);
  const [, setIsScreenHovered] = React.useState(false);
  const [isCreditHovered, setIsCreditHovered] = React.useState(false);
  const [showCredit, setShowCredit] = React.useState(false);
  const hoverDelayRef = React.useRef<NodeJS.Timeout | null>(null);
  const hideDelayRef = React.useRef<NodeJS.Timeout | null>(null);

  const handleVideoIndexChange = React.useCallback(() => {
    setCurrentVideoIndex((prev) => (prev + 1) % VIDEO_COUNT);
  }, []);

  const handleScreenHoverChange = React.useCallback((isHovered: boolean) => {
    setIsScreenHovered(isHovered);

    if (hoverDelayRef.current) {
      clearTimeout(hoverDelayRef.current);
      hoverDelayRef.current = null;
    }
    if (hideDelayRef.current) {
      clearTimeout(hideDelayRef.current);
      hideDelayRef.current = null;
    }

    if (isHovered) {
      hoverDelayRef.current = setTimeout(() => {
        setShowCredit(true);
      }, 600);
    } else {
      // Delay hiding to allow moving to the credit toast
      hideDelayRef.current = setTimeout(() => {
        if (!isCreditHovered) {
          setShowCredit(false);
        }
      }, 500);
    }
  }, [isCreditHovered]);

  const handleCreditMouseEnter = React.useCallback(() => {
    setIsCreditHovered(true);
    if (hideDelayRef.current) {
      clearTimeout(hideDelayRef.current);
      hideDelayRef.current = null;
    }
  }, []);

  const handleCreditMouseLeave = React.useCallback(() => {
    setIsCreditHovered(false);
    setShowCredit(false);
  }, []);

  // Cleanup timeout on unmount
  React.useEffect(() => {
    return () => {
      if (hoverDelayRef.current) clearTimeout(hoverDelayRef.current);
      if (hideDelayRef.current) clearTimeout(hideDelayRef.current);
    };
  }, []);

  const currentCredit = getVideoCredit(currentVideoIndex);

  return (
    <div className="relative h-full w-full" style={{ pointerEvents: isDialogOpen ? "none" : "auto" }}>
      {showLoader && <SceneLoader onLoaded={() => setShowLoader(false)} onEnterClick={() => setIsZooming(true)} />}
      <CreditToast isVisible={showCredit || isCreditHovered} artist={currentCredit?.artist} artistUrl={currentCredit?.artistUrl} onMouseEnter={handleCreditMouseEnter} onMouseLeave={handleCreditMouseLeave} />
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
        <SceneContent
          onSoftwareClick={onSoftwareClick}
          onArtsClick={onArtsClick}
          onAboutClick={onAboutClick}
          onContactClick={onContactClick}
          isDialogOpen={isDialogOpen}
          isLoaderActive={showLoader}
          onScreenHoverChange={handleScreenHoverChange}
          currentVideoIndex={currentVideoIndex}
          onVideoIndexChange={handleVideoIndexChange}
        />
        <LimitedOrbitControls limitMaxDistance={!isZooming && !showLoader} />
      </Canvas>
    </div>
  );
}

useGLTF.preload("/models/computer.glb");
useGLTF.preload("/models/cabinet.glb");
useGLTF.preload("/models/phone.glb");
