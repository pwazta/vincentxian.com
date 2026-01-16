/**
 * Video screen component for the computer model
 * Handles video texture loading, playback, and fade transitions between videos
 */
"use client";

import * as React from "react";
import { useFrame } from "@react-three/fiber";
import { useVideoTexture } from "@react-three/drei";
import * as THREE from "three";

/** Video metadata with artist credits */
export type VideoCredit = {
  src: string;
  artist?: string;
  artistUrl?: string;
};

/** Video sources for computer screen - add more videos here */
const SCREEN_VIDEOS: VideoCredit[] = [
  { src: "/Sad Get Well GIF.mp4" },
  { src: "/Coffee Break.mp4", artist: "PixelJeff", artistUrl: "https://www.deviantart.com/pixeljeff" },
  { src: "/Citypunk 2011 and Love Punch.mp4", artist: "PixelJeff", artistUrl: "https://www.deviantart.com/pixeljeff" },
  { src: "/Almost There.mp4", artist: "PixelJeff", artistUrl: "https://www.deviantart.com/pixeljeff" },
];

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

type VideoScreenProps = {
  computerScene: THREE.Group;
  currentVideoIndex: number;
};

/** Applies video texture to computer screen mesh, cycling through videos on click */
export function VideoScreen({ computerScene, currentVideoIndex }: VideoScreenProps) {
  const [activeTexture, setActiveTexture] = React.useState<THREE.VideoTexture | null>(null);
  const [pendingTexture, setPendingTexture] = React.useState<THREE.VideoTexture | null>(null);
  const materialRef = React.useRef<THREE.MeshStandardMaterial | null>(null);
  const fadeState = React.useRef<"idle" | "fading-out" | "fading-in">("idle");
  const fadeBrightness = React.useRef(1);
  const prevVideoIndex = React.useRef(currentVideoIndex);

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

    materialRef.current = new THREE.MeshStandardMaterial({
      toneMapped: false,
      color: new THREE.Color(1, 1, 1),
    });
    screenMesh.material = materialRef.current;
  }, [computerScene]);

  // Handle fade transition when video index changes
  React.useEffect(() => {
    if (prevVideoIndex.current !== currentVideoIndex && activeTexture) {
      fadeState.current = "fading-out";
      prevVideoIndex.current = currentVideoIndex;
    }
  }, [currentVideoIndex, activeTexture]);

  // Animate fade using useFrame - fades to black instead of transparent
  useFrame((_, delta) => {
    if (!materialRef.current) return;
    const fadeSpeed = 8; // Higher = faster fade

    if (fadeState.current === "fading-out") {
      fadeBrightness.current -= delta * fadeSpeed;
      if (fadeBrightness.current <= 0) {
        fadeBrightness.current = 0;
        // Swap texture at the midpoint (screen is black)
        if (pendingTexture) {
          materialRef.current.map = pendingTexture;
          materialRef.current.needsUpdate = true;
          setActiveTexture(pendingTexture);
          setPendingTexture(null);
        }
        fadeState.current = "fading-in";
      }
      materialRef.current.color.setRGB(fadeBrightness.current, fadeBrightness.current, fadeBrightness.current);
    } else if (fadeState.current === "fading-in") {
      fadeBrightness.current += delta * fadeSpeed;
      if (fadeBrightness.current >= 1) {
        fadeBrightness.current = 1;
        fadeState.current = "idle";
      }
      materialRef.current.color.setRGB(fadeBrightness.current, fadeBrightness.current, fadeBrightness.current);
    }
  });

  // Update texture when active video changes
  React.useEffect(() => {
    if (materialRef.current && activeTexture && fadeState.current === "idle") {
      materialRef.current.map = activeTexture;
      materialRef.current.needsUpdate = true;
    }
  }, [activeTexture]);

  const handleTextureReady = React.useCallback((texture: THREE.VideoTexture) => {
    if (fadeState.current === "idle" && !activeTexture) {
      // First texture load - set directly
      setActiveTexture(texture);
    } else {
      // Subsequent textures - queue for fade transition
      setPendingTexture(texture);
    }
  }, [activeTexture]);

  return (
    <>
      {SCREEN_VIDEOS.map((video, index) => (
        <VideoTextureLoader key={video.src} src={video.src} isActive={index === currentVideoIndex} onTextureReady={handleTextureReady} />
      ))}
    </>
  );
}

/** Number of videos available */
export const VIDEO_COUNT = SCREEN_VIDEOS.length;

/** Get credit info for a video by index */
export function getVideoCredit(index: number): VideoCredit | null {
  return SCREEN_VIDEOS[index] ?? null;
}
