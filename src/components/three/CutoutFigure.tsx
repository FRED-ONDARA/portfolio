"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";
import { pointer } from "@/lib/store";
import { ACCENT } from "./palette";
import { ContactBlob } from "./Scene";

// Extra room around the photo so the outline and soft shadow aren't clipped.
const PAD = 0.06;

const vertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

// mode 0: photo + alpha-edge dilation outline. mode 1: blurred silhouette used as a drop shadow.
const fragmentShader = /* glsl */ `
  uniform sampler2D map;
  uniform vec2 uThick;
  uniform vec3 uOutline;
  uniform float uOpacity;
  uniform float uOutlineOn;
  uniform int uMode;
  varying vec2 vUv;

  float alphaAt(vec2 uv) {
    if (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0) return 0.0;
    return texture2D(map, uv).a;
  }

  void main() {
    vec2 uv = (vUv - 0.5) * (1.0 + 2.0 * ${PAD.toFixed(3)}) + 0.5;
    if (uMode == 1) {
      float s = 0.0;
      for (int i = 0; i < 12; i++) {
        float a = float(i) * 0.5235988;
        vec2 d = vec2(cos(a), sin(a));
        s += alphaAt(uv + d * uThick * 2.0) + alphaAt(uv + d * uThick * 5.0);
      }
      gl_FragColor = vec4(0.0, 0.0, 0.0, (s / 24.0) * uOpacity);
    } else {
      bool inside = uv.x >= 0.0 && uv.x <= 1.0 && uv.y >= 0.0 && uv.y <= 1.0;
      vec4 tex = inside ? texture2D(map, uv) : vec4(0.0);
      float edge = 0.0;
      if (uOutlineOn > 0.5) {
        for (int i = 0; i < 16; i++) {
          float a = float(i) * 0.3926991;
          vec2 d = vec2(cos(a), sin(a));
          edge = max(edge, alphaAt(uv + d * uThick));
          edge = max(edge, alphaAt(uv + d * uThick * 0.5));
        }
      }
      vec3 col = mix(uOutline, tex.rgb, tex.a);
      gl_FragColor = vec4(col, max(tex.a, edge) * uOpacity);
      #include <colorspace_fragment>
    }
  }
`;

function makeMaterial(map: THREE.Texture, mode: 0 | 1) {
  return new THREE.ShaderMaterial({
    uniforms: {
      map: { value: map },
      uThick: { value: new THREE.Vector2(0.004, 0.004) },
      uOutline: { value: new THREE.Color("#ffffff") },
      uOpacity: { value: mode === 1 ? 0.22 : 1 },
      uOutlineOn: { value: 1 },
      uMode: { value: mode },
    },
    vertexShader,
    fragmentShader,
    transparent: true,
    depthWrite: false,
    toneMapped: false,
  });
}

export type FigureState = { hovered: boolean };

type Props = {
  src: string;
  /** World-space height. Every figure is normalized by height so the set looks balanced. */
  height?: number;
  position?: [number, number, number];
  state: FigureState;
  reduced: boolean;
  quality: "high" | "low";
  /** 0..1, used by the focus tabs to cross-fade figures. */
  visibility?: { current: number };
  shadowStrength?: number;
  outlineWorld?: number;
};

export function CutoutFigure({
  src,
  height = 3.6,
  position = [0, 0, 0],
  state,
  reduced,
  quality,
  visibility,
  shadowStrength = 0.22,
  outlineWorld = 0.022,
}: Props) {
  const texture = useTexture(src, (t) => {
    const tex = Array.isArray(t) ? t[0] : t;
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 4;
    tex.generateMipmaps = true;
    tex.minFilter = THREE.LinearMipmapLinearFilter;
  });

  const image = texture.image as { width: number; height: number };
  const aspect = image.width / image.height;
  const width = height * aspect;
  const padScale = 1 + 2 * PAD;

  const [figureMat, shadowMat] = useMemo(() => [makeMaterial(texture, 0), makeMaterial(texture, 1)], [texture]);

  const root = useRef<THREE.Group>(null);
  const tilt = useRef<THREE.Group>(null);
  const shadowMesh = useRef<THREE.Mesh>(null);
  const accent = useMemo(() => new THREE.Color(ACCENT), []);
  const white = useMemo(() => new THREE.Color("#ffffff"), []);

  useFrame((frame, dt) => {
    const t = frame.clock.elapsedTime;
    const vis = visibility ? visibility.current : 1;
    const g = root.current;
    const tg = tilt.current;
    if (!g || !tg) return;

    g.visible = vis > 0.01;
    const hover = state.hovered && vis > 0.5;

    // Pointer tilt (or slow idle sway on touch / no pointer).
    const px = pointer.active ? pointer.x : Math.sin(t * 0.3) * 0.5;
    const py = pointer.active ? pointer.y : Math.sin(t * 0.21) * 0.3;
    const motion = reduced ? 0 : 1;
    tg.rotation.y = THREE.MathUtils.damp(tg.rotation.y, px * 0.28 * motion, 4, dt);
    tg.rotation.x = THREE.MathUtils.damp(tg.rotation.x, -py * 0.1 * motion, 4, dt);
    tg.rotation.z = Math.sin(t * 0.5) * 0.012 * motion;

    const bob = Math.sin(t * 0.8) * 0.055 * motion;
    tg.position.y = bob;
    tg.position.x = THREE.MathUtils.damp(tg.position.x, px * 0.06 * motion, 3, dt);

    const targetScale = (hover ? 1.04 : 1) * (0.94 + 0.06 * vis);
    const s = THREE.MathUtils.damp(tg.scale.x, targetScale, 6, dt);
    tg.scale.setScalar(s);

    const outlinePx = quality === "high" ? 1 : 0;
    figureMat.uniforms.uOutlineOn.value = outlinePx;
    figureMat.uniforms.uThick.value.set(outlineWorld / width, outlineWorld / height);
    (figureMat.uniforms.uOutline.value as THREE.Color).lerp(hover ? accent : white, 1 - Math.exp(-8 * dt));
    figureMat.uniforms.uOpacity.value = vis;

    shadowMat.uniforms.uThick.value.set(outlineWorld / width, outlineWorld / height);
    shadowMat.uniforms.uOpacity.value = shadowStrength * vis;
    if (shadowMesh.current) shadowMesh.current.visible = quality === "high";
  });

  return (
    <group ref={root} position={position}>
      <group ref={tilt}>
        {/* Subtle drop shadow behind the figure */}
        <mesh
          ref={shadowMesh}
          position={[0.09, -0.07, -0.06]}
          scale={[width * padScale, height * padScale, 1]}
          renderOrder={-1}
        >
          <planeGeometry />
          <primitive object={shadowMat} attach="material" />
        </mesh>
        <mesh scale={[width * padScale, height * padScale, 1]} renderOrder={1}>
          <planeGeometry />
          <primitive object={figureMat} attach="material" />
        </mesh>
      </group>
      <ContactBlob
        position={[0, -height / 2 - 0.04, 0.05]}
        width={Math.min(width, 1.6) * 1.1}
        depth={0.38}
        opacity={0.24}
      />
    </group>
  );
}
