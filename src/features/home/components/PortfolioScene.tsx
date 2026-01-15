/**
 * 3D portfolio scene component using React Three Fiber
 * Used in: Home page 3D scene
 */
"use client";

import * as React from "react";
import { Canvas, useThree, useFrame } from "@react-three/fiber";
import { OrbitControls, useGLTF, Grid, useVideoTexture } from "@react-three/drei";
import * as THREE from "three";
import { GrassField } from "./GrassField";
import { SceneLoader } from "./SceneLoader";
import { setupInteractiveObjects } from "../utils/sceneObjectSetup";
import { useSceneRaycaster } from "../hooks/useSceneRaycaster";
import { useObjectInteractions } from "../hooks/useObjectInteractions";
import { storeOriginalColors } from "../utils/materialUtils";
import type { ClickActions } from "../utils/sceneInteractions";

/** Video sources for computer screen - add more videos here */
const SCREEN_VIDEOS = [
  "/Sad Get Well GIF.mp4",
  "/pixel art arcade.mp4",
] as const;

/** Loads a video texture and manages playback based on active state */
function VideoTextureLoader({ src, isActive, onTextureReady }: { src: string; isActive: boolean; onTextureReady: (texture: THREE.VideoTexture) => void }) {
  const texture = useVideoTexture(src, { muted: true, loop: true, start: isActive });

  React.useEffect(() => {
    if (isActive) void texture.image.play().catch(() => { /* Video play failures are expected and safe to ignore */ });
    else texture.image.pause();
  }, [isActive, texture]);

  React.useEffect(() => {
    if (isActive) onTextureReady(texture);
  }, [isActive, texture, onTextureReady]);

  return null;
}

/** Applies video texture to computer screen mesh, cycling through videos on click */
function VideoScreen({ computerScene, currentVideoIndex }: { computerScene: THREE.Group; currentVideoIndex: number }) {
  const [activeTexture, setActiveTexture] = React.useState<THREE.VideoTexture | null>(null);
  const materialRef = React.useRef<THREE.MeshStandardMaterial | null>(null);

  // Find screen mesh and setup material
  React.useEffect(() => {
    const screenMesh = computerScene.getObjectByName("computer_screen") as THREE.Mesh | undefined;
    if (!screenMesh) return;

    const geometry = screenMesh.geometry;
    const uvAttr = geometry.getAttribute("uv");

    // Generate planar UVs if mesh has none
    if (!uvAttr || uvAttr.count === 0) {
      geometry.computeBoundingBox();
      const box = geometry.boundingBox!;
      const size = new THREE.Vector3();
      box.getSize(size);

      const posAttr = geometry.getAttribute("position");
      const uvs = new Float32Array(posAttr.count * 2);
      for (let i = 0; i < posAttr.count; i++) {
        uvs[i * 2] = (posAttr.getX(i) - box.min.x) / size.x;
        uvs[i * 2 + 1] = (posAttr.getY(i) - box.min.y) / size.y;
      }
      geometry.setAttribute("uv", new THREE.BufferAttribute(uvs, 2));
    }

    materialRef.current = new THREE.MeshStandardMaterial({ toneMapped: false, emissiveIntensity: 0.8 });
    screenMesh.material = materialRef.current;
  }, [computerScene]);

  // Update texture when active video changes
  React.useEffect(() => {
    if (materialRef.current && activeTexture) {
      materialRef.current.map = activeTexture;
      materialRef.current.needsUpdate = true;
    }
  }, [activeTexture]);

  const handleTextureReady = React.useCallback((texture: THREE.VideoTexture) => setActiveTexture(texture), []);

  return (
    <>
      {SCREEN_VIDEOS.map((src, index) => (
        <VideoTextureLoader key={src} src={src} isActive={index === currentVideoIndex} onTextureReady={handleTextureReady} />
      ))}
    </>
  );
}

/** Configures renderer settings for grass shadows and rendering */
function RendererConfig() {
	const { gl } = useThree();
	const [, setContextLost] = React.useState(false);
	
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
};

function SceneContent({ onSoftwareClick, onArtsClick, onAboutClick, onContactClick, isDialogOpen, isLoaderActive }: SceneContentProps) {
  const { scene } = useThree();
  const [interactiveMeshes, setInteractiveMeshes] = React.useState<THREE.Mesh[]>([]);
  const [primaryColor, setPrimaryColor] = React.useState<string>("#7c9082");
  const [isDarkMode, setIsDarkMode] = React.useState(false);
  const [resourcesReady, setResourcesReady] = React.useState(false);
  const [currentVideoIndex, setCurrentVideoIndex] = React.useState(0);

  const handleScreenClick = React.useCallback(() => {
    setCurrentVideoIndex((prev) => (prev + 1) % SCREEN_VIDEOS.length);
  }, []);

  /** Get primary color from CSS variables and watch for theme changes */
  React.useEffect(() => {
    const getPrimaryColor = () => {
      if (typeof window === "undefined") return "#7c9082";
      const root = document.documentElement;
      const color = getComputedStyle(root).getPropertyValue("--primary").trim();
      return color || "#7c9082";
    };

    const checkDarkMode = () => {
      return document.documentElement.classList.contains("dark");
    };

    setPrimaryColor(getPrimaryColor());
    setIsDarkMode(checkDarkMode());

    const observer = new MutationObserver(() => {
      setPrimaryColor(getPrimaryColor());
      setIsDarkMode(checkDarkMode());
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

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
      onScreenClick: handleScreenClick,
      onDiskLinkedInClick: () => { /* External link handled in useObjectInteractions */ },
      onDiskGithubClick: () => { /* External link handled in useObjectInteractions */ },
      onDrawerAboutClick: onAboutClick,
      onDrawerSoftwareClick: onSoftwareClick,
      onDrawerArtsClick: onArtsClick,
    }), [onSoftwareClick, onArtsClick, onAboutClick, onContactClick, handleScreenClick]
  );

  useObjectInteractions({ intersects, clickActions, enabled: interactionsEnabled });

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
      <ambientLight intensity={isDarkMode ? 0.4 : 0.4} />

      {isDarkMode ? (
        // Dark mode: Spotlight for dramatic moonlight effect
        <spotLight
          position={[0, 9, 1]}
          angle={Math.PI / 1.5}
          penumbra={0.8}
          intensity={40}
          distance={25}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-camera-far={40}
          shadow-bias={-0.001}
          shadow-normalBias={0.03}
        />
      ) : (
        // Light mode: Directional light for natural sunlight
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
