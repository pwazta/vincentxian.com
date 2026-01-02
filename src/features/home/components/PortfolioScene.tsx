/**
 * 3D portfolio scene component using React Three Fiber
 * Used in: Home page 3D scene
 */
"use client";

import * as React from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";

type ClickableBoxProps = {
  position: [number, number, number];
  size: [number, number, number];
  color: string;
  onClick: () => void;
};

function ClickableBox({ position, size, color, onClick }: ClickableBoxProps) {
  const [hovered, setHovered] = React.useState(false);

  return (
    <mesh
      position={position}
      onClick={onClick}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
      scale={hovered ? 1.1 : 1}
    >
      <boxGeometry args={size} />
      <meshStandardMaterial
        color={hovered ? "#bfc9bb" : color}
        metalness={0.1}
        roughness={0.5}
      />
    </mesh>
  );
}

function SceneContent({
  onCodingClick,
  onArtsClick,
  onAboutClick,
  onContactClick,
}: {
  onCodingClick: () => void;
  onArtsClick: () => void;
  onAboutClick: () => void;
  onContactClick: () => void;
}) {
  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 5, 5]} intensity={0.8} />
      <directionalLight position={[-5, 5, -5]} intensity={0.4} />

      {/* Ground plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#e8e6e1" />
      </mesh>

      {/* Desk base */}
      <mesh position={[0, 0.3, 0]}>
        <boxGeometry args={[4, 0.6, 2]} />
        <meshStandardMaterial color="#d4a574" />
      </mesh>

      {/* Computer monitor (bottom box - Coding) */}
      <ClickableBox
        position={[-0.8, 1.2, 0]}
        size={[1.2, 0.8, 0.1]}
        color="#2a2a2a"
        onClick={onCodingClick}
      />

      {/* Computer monitor (top box - Arts) */}
      <ClickableBox
        position={[-0.8, 2.1, 0]}
        size={[1.2, 0.8, 0.1]}
        color="#2a2a2a"
        onClick={onArtsClick}
      />

      {/* About box */}
      <ClickableBox
        position={[1.2, 0.8, 0.5]}
        size={[0.6, 0.6, 0.6]}
        color="#7c9082"
        onClick={onAboutClick}
      />

      {/* Contact box */}
      <ClickableBox
        position={[1.2, 0.8, -0.5]}
        size={[0.6, 0.6, 0.6]}
        color="#7c9082"
        onClick={onContactClick}
      />
    </>
  );
}

type PortfolioSceneProps = {
  onCodingClick: () => void;
  onArtsClick: () => void;
  onAboutClick: () => void;
  onContactClick: () => void;
};

export function PortfolioScene({
  onCodingClick,
  onArtsClick,
  onAboutClick,
  onContactClick,
}: PortfolioSceneProps) {
  return (
    <div className="h-full w-full">
      <Canvas
        camera={{ position: [5, 5, 5], fov: 50 }}
        gl={{ antialias: true }}
      >
        <SceneContent
          onCodingClick={onCodingClick}
          onArtsClick={onArtsClick}
          onAboutClick={onAboutClick}
          onContactClick={onContactClick}
        />
        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={3}
          maxDistance={15}
        />
      </Canvas>
    </div>
  );
}

