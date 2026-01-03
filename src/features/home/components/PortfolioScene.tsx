/**
 * 3D portfolio scene component using React Three Fiber
 * Used in: Home page 3D scene
 */
"use client";

import * as React from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";

const HoverContext = React.createContext<boolean>(false);

type ClickableMeshProps = {
  position: [number, number, number];
  onClick: () => void;
  children: React.ReactNode;
  scale?: number | [number, number, number];
};

/**
 * Reusable clickable mesh wrapper - can wrap any geometry or 3D model
 * Used in: PortfolioScene for interactive elements
 * 
 * Provides hover state via context so children can react to hover
 * Example with complex model:
 * ```tsx
 * const { scene } = useGLTF('/models/desk.glb');
 * <ClickableMesh position={[0, 0, 0]} onClick={handleClick}>
 *   <primitive object={scene} />
 * </ClickableMesh>
 * ```
 */
function ClickableMesh({
  position,
  onClick,
  children,
  scale = 1,
}: ClickableMeshProps) {
  const [hovered, setHovered] = React.useState(false);
  const hoverScale: number | [number, number, number] =
    typeof scale === "number"
      ? scale * 1.1
      : ([scale[0] * 1.1, scale[1] * 1.1, scale[2] * 1.1] as [number, number, number]);

  const handlePointerOver = (e: { stopPropagation: () => void }) => {
    e.stopPropagation();
    setHovered(true);
  };

  const handlePointerOut = (e: { stopPropagation: () => void }) => {
    e.stopPropagation();
    setHovered(false);
  };

  const handleClick = (e: { stopPropagation: () => void }) => {
    e.stopPropagation();
    onClick();
  };

  return (
    <HoverContext.Provider value={hovered}>
      <group
        position={position}
        onClick={handleClick}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
        scale={hovered ? hoverScale : scale}
      >
        {children}
      </group>
    </HoverContext.Provider>
  );
}

type ClickableBoxProps = {
  position: [number, number, number];
  size: [number, number, number];
  color: string;
  onClick: () => void;
};

/**
 * Inner box mesh component that reacts to hover state
 */
function BoxMesh({ size, color }: { size: [number, number, number]; color: string }) {
  const hovered = React.useContext(HoverContext);

  return (
    <mesh>
      <boxGeometry args={size} />
      <meshStandardMaterial
        color={hovered ? "#bfc9bb" : color}
        metalness={0.1}
        roughness={0.5}
      />
    </mesh>
  );
}

/**
 * Simple box primitive - can be replaced with complex meshes later
 * Used in: PortfolioScene as placeholder geometry
 */
function ClickableBox({ position, size, color, onClick }: ClickableBoxProps) {
  return (
    <ClickableMesh position={position} onClick={onClick}>
      <BoxMesh size={size} color={color} />
    </ClickableMesh>
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

