import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useState, useRef } from "react";
import * as THREE from "three";
import Mind from "./classes/Mind";
import Mental from "./classes/Mental";
import BadMental from "./classes/bad/BadMental";
import MeritMental from "./classes/good/MeritMental";
import { OrbitControls, orbitControlsHandle } from "./components/OrbitControls";
import { Environment} from '@react-three/drei'
import violinUrl from "./assets/violin.glb?url";
import "./App.css";

const VIOLIN_MENTAL_NAME = "Thought 1";

type InspectSelection = {
  name: string;
  detail: string;
  type: string;
  labelNumber: number;
};

function MindSphere(props: {
  mind: Mind;
  selectedMentalName: string | null;
  focusTargetRef: React.MutableRefObject<THREE.Vector3 | null>;
}) {
  const { mind, selectedMentalName, focusTargetRef } = props;
  const { camera } = useThree();

  useEffect(() => {
    return () => {
      mind.dispose();
    };
  }, [mind]);

  useFrame((_state, delta) => {
    mind.updatePhysics(delta);

    if (selectedMentalName && focusTargetRef.current) {
      const target = focusTargetRef.current;
      const desiredDistance = 0.8;
      const desiredPos = target.clone().add(new THREE.Vector3(0, 0, desiredDistance));
      camera.position.lerp(desiredPos, 0.08);
      camera.lookAt(target);
      if (orbitControlsHandle.controls) {
        orbitControlsHandle.controls.target.copy(target);
        orbitControlsHandle.controls.update();
      }
    }
  });

  const mindMesh = mind.getMesh();
  if (!mindMesh) return null;

  return (
    <primitive object={mindMesh} />
  );
}

function MentalsLayer(props: {
  mind: Mind;
  mentals: Mental[];
  selectedMentalName: string | null;
  onSelectMental: (info: InspectSelection) => void;
  focusTargetRef: React.MutableRefObject<THREE.Vector3 | null>;
}) {
  const { mind, mentals, selectedMentalName, onSelectMental, focusTargetRef } = props;
  const { gl, camera } = useThree();
  const raycaster = useMemo(() => new THREE.Raycaster(), []);
  const pointer = useMemo(() => new THREE.Vector2(), []);
  const frozenMental = useRef<Mental | null>(null);

  // Attach mentals once.
  useEffect(() => {
    mentals.forEach((mental) => mind.addMental(mental));
  }, [mentals, mind]);

  // Disable labels (clear any numbers).
  useEffect(() => {
    mind.getMentals().forEach((mental) => mental.setLabelText(''));
  }, [mind]);

  // Load any models attached to mentals so they move with their spheres.
  useEffect(() => {
    const basisPath = "https://unpkg.com/three@0.160.0/examples/jsm/libs/basis/";
    const list = mind.getMentals();

    list.forEach((mental) => {
      mental.loadModel(gl, { basisPath }).catch((err) => {
        console.error("Failed to load mental model", err);
      });
    });

    return () => {
      list.forEach((mental) => mental.detachModel());
    };
  }, [gl, mind]);

  // Handle click selection
  useEffect(() => {
    const canvas = gl.domElement;

    const handlePointer = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(pointer, camera);

      const list = mind.getMentals();
      const targets: THREE.Object3D[] = [];
      list.forEach((mental) => {
        const mesh = mental.getMesh();
        if (mesh) targets.push(mesh);
        const label = mental.getLabelObject();
        if (label) targets.push(label);
      });

      const hits = raycaster.intersectObjects(targets, true);
      if (!hits.length) return;

      const hit = hits[0].object;
      const found = list.find((mental) => {
        const mesh = mental.getMesh();
        if (mesh) {
          let node: THREE.Object3D | null = hit;
          while (node) {
            if (node === mesh) return true;
            node = node.parent;
          }
        }
        const label = mental.getLabelObject();
        return label ? hit === label : false;
      });

      if (found) {
        if (frozenMental.current && frozenMental.current !== found) {
          frozenMental.current.setFrozen(false);
        }
        found.setFrozen(true);
        frozenMental.current = found;
        const worldPos = new THREE.Vector3();
        found.getMesh()?.getWorldPosition(worldPos);
        focusTargetRef.current = worldPos;

        const idx = list.indexOf(found);
        onSelectMental({
          name: found.getName(),
          detail: found.getDetail(),
          type: found.getType(),
          labelNumber: idx + 1,
        });
      }
    };

    canvas.addEventListener("pointerdown", handlePointer);
    return () => {
      canvas.removeEventListener("pointerdown", handlePointer);
    };
  }, [camera, gl, mind, onSelectMental, pointer, raycaster]);

  // Unfreeze when selection cleared
  useEffect(() => {
    if (!selectedMentalName && frozenMental.current) {
      frozenMental.current.setFrozen(false);
      frozenMental.current = null;
      focusTargetRef.current = null;
    }
  }, [selectedMentalName, focusTargetRef]);

  return null;
}

function GroundPlane() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]} receiveShadow>
      <planeGeometry args={[20, 20]} />
      <meshStandardMaterial 
        color={0x808080} 
        metalness={0.1}
        roughness={0.5}
      />
    </mesh>
  );
}

function ThreeScene(props: {
  mind: Mind;
  mentals: Mental[];
  selectedMentalName: string | null;
  onSelectMental: (info: InspectSelection) => void;
}) {
  const { mind, mentals, selectedMentalName, onSelectMental } = props;
  const focusTargetRef = useRef<THREE.Vector3 | null>(null);
  return (
    <Canvas
      camera={{ position: [0, 0, 5], fov: 75 }}
      shadows
      gl={{ antialias: true, toneMappingExposure: 1.2 }}
      style={{ background: '#ffffff' }}
    >
      <Environment preset="dawn" background blur={1} />
      
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
      <MindSphere
        mind={mind}
        selectedMentalName={selectedMentalName}
        focusTargetRef={focusTargetRef}
      />
      <MentalsLayer
        mind={mind}
        mentals={mentals}
        selectedMentalName={selectedMentalName}
        onSelectMental={onSelectMental}
        focusTargetRef={focusTargetRef}
      />
    </Canvas>
  );
}

function App() {
  const [selected, setSelected] = useState<InspectSelection | null>(null);

  const mind = useMemo(() => {
    return new Mind({ 
      name: "My Mind", 
      detail: "This is a detailed description",
      position: [0, 0, 0],
      scale: 1.5,
      transparent: true,
      opacity: 0.3,
      color: 0xffffff
    });
  }, []);

  const mentals = useMemo(() => {
    const thought1 = new Mental({ 
      name: VIOLIN_MENTAL_NAME, 
      detail: "First mental sphere",
      position: [0.3, 0.2, 0.1],
      scale: 0.1,
      color: 0xff6b9d,
      modelPath: violinUrl,
      modelTargetWorldSize: 0.23,
      modelOffset: { x: -0.2, y: 0, z: 0.22 }
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

    return [thought1, thought2, thought3, greedy1, greedy2, merit];
  }, []);

  const handleSelect = (info: InspectSelection) => {
    setSelected(info);
  };

  const handleClosePanel = () => {
    setSelected(null);
  };

  return (
    <div className="App h-screen relative">
      {selected && (
        <div className="absolute top-4 right-4 z-10 max-w-xs p-4 bg-white shadow-lg rounded border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <div className="font-semibold">Mental #{selected.labelNumber}</div>
            <button onClick={handleClosePanel} className="text-sm text-blue-600">Close</button>
          </div>
          <div className="text-sm text-gray-800">
            <div className="font-semibold">{selected.name}</div>
            <div className="mt-1 text-gray-600">{selected.detail || "No detail provided."}</div>
            <div className="mt-1 text-gray-500 text-xs">Type: {selected.type || "n/a"}</div>
          </div>
        </div>
      )}

      <ThreeScene
        mind={mind}
        mentals={mentals}
        selectedMentalName={selected?.name ?? null}
        onSelectMental={handleSelect}
      />
    </div>
  );
}

export default App;
