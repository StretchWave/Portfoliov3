"use client";

function Pillar({ position }: { position: readonly [number, number, number] }) {
  return (
    <mesh castShadow receiveShadow position={position}>
      <boxGeometry args={[0.45, 4.5, 0.45]} />
      <meshStandardMaterial color="#112841" metalness={0.55} roughness={0.43} />
    </mesh>
  );
}

export function HubArchitecture() {
  return (
    <group>
      <Pillar position={[-8, 2.25, -8]} />
      <Pillar position={[8, 2.25, -8]} />
      <Pillar position={[-8, 2.25, 5]} />
      <Pillar position={[8, 2.25, 5]} />
      <mesh position={[0, 3.7, -8]}>
        <boxGeometry args={[15.5, 0.18, 0.3]} />
        <meshStandardMaterial color="#1e466d" emissive="#11304c" />
      </mesh>
      <mesh position={[0, 0.08, -2.6]} rotation-x={-Math.PI / 2} receiveShadow>
        <circleGeometry args={[7.2, 64]} />
        <meshStandardMaterial color="#0c2137" metalness={0.45} roughness={0.5} />
      </mesh>
    </group>
  );
}
