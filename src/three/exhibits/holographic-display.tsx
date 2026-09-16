"use client";

import { Html } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import type { Group } from "three";

interface HolographicDisplayProps {
  label: string;
  category: string;
  accent: string;
  isFocused?: boolean;
}

export function HolographicDisplay({ label, category, accent, isFocused = false }: HolographicDisplayProps) {
  const groupRef = useRef<Group>(null);

  useFrame(({ clock }) => {
    if (groupRef.current) {
      const t = clock.getElapsedTime();
      groupRef.current.position.y = 2.62 + Math.sin(t * 1.8) * 0.04;
    }
  });

  return (
    <group ref={groupRef} position={[0, 2.62, 0]}>
      <Html center distanceFactor={9} sprite>
        <div
          className={`holographic-exhibit-card ${isFocused ? "holographic-exhibit-card--focused" : ""}`}
          style={{ borderColor: accent }}
        >
          <div className="holographic-card__glow" style={{ background: accent }} />
          <span className="holographic-card__eyebrow" style={{ color: accent }}>
            {category.replaceAll("-", " ")}
          </span>
          <strong className="holographic-card__title">{label}</strong>
          {isFocused ? (
            <span className="holographic-card__action" style={{ color: accent }}>
              [ ⬡ TAP / PRESS E ]
            </span>
          ) : null}
        </div>
      </Html>
    </group>
  );
}
