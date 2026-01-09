import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";

function Model({ url }: { url: string }) {
  const { scene } = useGLTF(url);
  return <primitive object={scene} />;
}

export default function GLBViewer() {
  return (
    <div className="relative w-[400px] h-[450px] flex-shrink-0">
      <Canvas
        camera={{
          position: [0, 0.9, 1.2], // much closer
          fov: 50, // normal perspective
        }}
        style={{ width: "100%", height: "100%" }}
      >
        <ambientLight intensity={0.8} />
        <directionalLight position={[5, 10, 5]} />
        <Model url="/models/tower-model2.glb" />
        <OrbitControls />
      </Canvas>
    </div>
  );
}
