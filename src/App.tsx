import { Canvas, useFrame } from "@react-three/fiber";
import { useEffect, useMemo } from "react";
import Mind from "./classes/Mind";
import Mental from "./classes/Mental";
import BadMental from "./classes/bad/BadMental";
import MeritMental from "./classes/good/MeritMental";
import { OrbitControls } from "./components/OrbitControls";
import "./App.css";

function MindSphere() {
  const mind = useMemo(() => {
    const mindInstance = new Mind({ 
      name: "My Mind", 
      detail: "This is a detailed description",
      position: [0, 0, 0],
      scale: 1.5,
      transparent: true,
      opacity: 0.15,
      color: 0x3cdd8c
    });

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

    const greedy1 = new BadMental({ 
      name: "Greedy Thought 1",
      position: [0.3, 0.2, 0.1],
      scale: 0.1,
      color: 0xff0000,
      attractionStrength: 0.001,
      attractionRange: 0.5
    });

    const greedy2 = new BadMental({ 
      name: "Greedy Thought 2",
      position: [-0.3, -0.2, 0.1],
      scale: 0.1,
      color: 0xff0000
    });

    const merit = new MeritMental({
      name: "Merit Thought",
      position: [0.2, 0.1, -0.1],
      scale: 0.12,
      color: 0x80ccff,
      directionChangeInterval: 90
    });


    mindInstance.addMental(thought1);
    mindInstance.addMental(thought2);
    mindInstance.addMental(thought3);
    mindInstance.addMental(greedy1);
    mindInstance.addMental(greedy2);
    mindInstance.addMental(merit);

    return mindInstance;
  }, []);

  useFrame((_state, delta) => {
    mind.updatePhysics(delta);
  });

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
        color={0xffffff} 
        metalness={0.1}
        roughness={0.5}
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
      style={{ background: '#ffffff' }}
    >
      <color attach="background" args={['#ffffff']} />
      
      <OrbitControls 
        enableDamping={true}
        dampingFactor={0.05}
        enableZoom={true}
        enablePan={true}
        minDistance={2}
        maxDistance={10}
        target={[0, 0, 0]}
      />
      
      <ambientLight intensity={1.0} />
      
      <directionalLight 
        position={[5, 8, 5]} 
        intensity={2.0}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={50}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
      />
      
      <directionalLight 
        position={[-5, 3, -5]} 
        intensity={1.5}
      />
      
      <pointLight 
        position={[0, 6, 0]} 
        intensity={2.0}
        distance={15}
        decay={2}
      />
      
      <pointLight 
        position={[0, 0, 5]} 
        intensity={1.5}
        distance={15}
        decay={2}
      />
      
      <GroundPlane />
      
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
