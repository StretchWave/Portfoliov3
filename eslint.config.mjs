import nextConfig from "eslint-config-next";

const config = [
  ...nextConfig,
  {
    // Documented Exception: Three.js and React Three Fiber (@react-three/fiber)
    // require imperative per-frame mutation of Three.js camera, mesh, and matrix
    // objects inside `useFrame` animation render loops. React Compiler's
    // experimental `react-hooks/immutability` rule treats Three.js objects as
    // immutable React state. We disable this rule scoped strictly to `src/three/**` and `src/app/studio/**`.
    files: ["src/three/**", "src/app/studio/**"],
    rules: {
      "react-hooks/immutability": "off",
    },
  },
  {
    ignores: [
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
      "node_modules/**",
      ".system_generated/**",
    ],
  },
];

export default config;
