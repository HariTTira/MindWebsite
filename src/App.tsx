import { Canvas, useFrame } from "@react-three/fiber";
import { useEffect, useMemo } from "react";
import Mind from "./classes/Mind";
import Mental from "./classes/Mental";
import { OrbitControls } from "./components/OrbitControls";
import "./App.css";

function MindSphere() {
  const mind = useMemo(() => {
    // Create the Mind sphere - make it transparent so Mental spheres are visible inside
    const mindInstance = new Mind({ 
      name: "My Mind", 
      detail: "This is a detailed description",
      position: [0, 0, 0],
      scale: 1.5,
      transparent: true,
      opacity: 0.15, // Transparent to see inside
      color: 0x3cdd8c
    });

    // Create and add Mental spheres inside the Mind
    const thought1 = new Mental({ 
      name: "Thought 1", 
      detail: "First mental sphere",
      position: [0.3, 0.2, 0.1],
      scale: 0.1,
      color: 0xff6b9d
    });

    const thought2 = new Mental({ 
      name: "Thought 2", 
      detail: "Second mental sphere",
      position: [-0.3, -0.2, 0.1],
      scale: 0.1,
      color: 0x4ecdc4
    });

    const thought3 = new Mental({ 
      name: "Thought 3", 
      detail: "Third mental sphere",
      position: [0, 0.3, -0.2],
      scale: 0.1,
      color: 0xffe66d
    });

    const thought4 = new Mental({ 
      name: "Thought 4", 
      detail: "Fourth mental sphere",
      position: [0.2, -0.2, 0.3],
      scale: 0.1,
      color: 0xff9ff3
    });

    const thought5 = new Mental({ 
      name: "Thought 5", 
      detail: "Fifth mental sphere",
      position: [-0.2, 0.1, -0.1],
      scale: 0.08,
      color: 0x95e1d3
    });

    // Add mentals to the mind (positions will be constrained automatically)
    mindInstance.addMental(thought1);
    mindInstance.addMental(thought2);
    mindInstance.addMental(thought3);
    mindInstance.addMental(thought4);
    mindInstance.addMental(thought5);

    return mindInstance;
  }, []);

  // Animation loop - update physics every frame
  useFrame((_state, delta) => {
    mind.updatePhysics(delta);
  });

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      mind.dispose();
    };
  }, [mind]);

  const mindMesh = mind.getMesh();
  if (!mindMesh) return null;

  return (
    <primitive object={mindMesh} />
  );
}

function GroundPlane() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]} receiveShadow>
      <planeGeometry args={[20, 20]} />
      <meshStandardMaterial 
        color={0x1a1a1a} 
        metalness={0.3}
        roughness={0.8}
      />
    </mesh>
  );
}

function ThreeScene() {
  return (
    <Canvas
      camera={{ position: [0, 0, 5], fov: 75 }}
      shadows
      gl={{ antialias: true, toneMappingExposure: 1.2 }}
    >
      <OrbitControls 
        enableDamping={true}
        dampingFactor={0.05}
        enableZoom={true}
        enablePan={true}
        minDistance={2}
        maxDistance={10}
        target={[0, 0, 0]}
      />
      
      {/* Ambient light - reduced for better contrast */}
      <ambientLight intensity={0.2} />
      
      {/* Main directional light from top-right - increased intensity */}
      <directionalLight 
        position={[5, 8, 5]} 
        intensity={1.5}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={50}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
      />
      
      {/* Fill light from opposite side - reduced for contrast */}
      <directionalLight 
        position={[-5, 3, -5]} 
        intensity={0.3}
      />
      
      {/* Point light for additional depth and contrast */}
      <pointLight 
        position={[0, 6, 0]} 
        intensity={1.2}
        distance={15}
        decay={2}
      />
      
      {/* Ground plane */}
      <GroundPlane />
      
      {/* Mind sphere */}
      <MindSphere />
    </Canvas>
  );
}

function App() {
  return (
    <div className="App h-screen">
      <ThreeScene />
    </div>
  );
}

export default App;