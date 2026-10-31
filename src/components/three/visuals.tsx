"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Line, RoundedBox, useTexture } from "@react-three/drei";
import * as THREE from "three";
import { optimizedImage } from "@/lib/image-url";
import { pointer } from "@/lib/store";
import { ACCENT, type ScenePalette } from "./palette";
import { Earth } from "./cosmos";
import { ContactBlob, getBlobTexture } from "./Scene";

type VisualProps = { palette: ScenePalette; reduced: boolean };

// Gentle pointer-follow + float shared by every project visual.
function useFloat(reduced: boolean, amount = 0.25) {
  const ref = useRef<THREE.Group>(null);
  useFrame((state, dt) => {
    const g = ref.current;
    if (!g || reduced) return;
    const t = state.clock.elapsedTime;
    g.rotation.y = THREE.MathUtils.damp(g.rotation.y, pointer.x * amount, 3, dt);
    g.rotation.x = THREE.MathUtils.damp(g.rotation.x, -pointer.y * amount * 0.4, 3, dt);
    g.position.y = Math.sin(t * 0.8) * 0.05;
  });
  return ref;
}

/* ---------- Globyx: realistic Earth, orbiting dots, connection arcs ---------- */

function latLng(lat: number, lng: number, r: number) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  return new THREE.Vector3(
    -r * Math.sin(phi) * Math.cos(theta),
    r * Math.cos(phi),
    r * Math.sin(phi) * Math.sin(theta),
  );
}

export function Globe({ palette, reduced }: VisualProps) {
  const float = useFloat(reduced);
  const spin = useRef<THREE.Group>(null);
  const orbit = useRef<THREE.Group>(null);
  const arcs = useRef<{ material: { dashOffset: number } }[]>([]);
  const R = 1.15;

  const arcPoints = useMemo(() => {
    // Abstract connections between points on the sphere (not real routes).
    const pairs: [number, number, number, number][] = [
      [-1.3, 36.8, 51.5, -0.1],
      [-1.3, 36.8, 40.7, -74],
      [-1.3, 36.8, 1.35, 103.8],
      [-1.3, 36.8, -33.9, 18.4],
      [51.5, -0.1, 35.7, 139.7],
    ];
    return pairs.map(([a, b, c, d]) => {
      const p0 = latLng(a, b, R);
      const p2 = latLng(c, d, R);
      const mid = p0.clone().add(p2).multiplyScalar(0.5);
      const lift = 1 + p0.distanceTo(p2) * 0.35;
      mid.normalize().multiplyScalar(R * lift);
      return new THREE.QuadraticBezierCurve3(p0, mid, p2).getPoints(48);
    });
  }, []);

  useFrame((_, dt) => {
    if (reduced) return;
    if (spin.current) spin.current.rotation.y += dt * 0.12;
    if (orbit.current) orbit.current.rotation.y -= dt * 0.35;
    arcs.current.forEach((l) => {
      if (l) l.material.dashOffset -= dt * 0.5;
    });
  });

  return (
    <group ref={float}>
      <group rotation={[0.35, 0, -0.2]}>
        <group ref={spin}>
          {/* Earth turns with the arcs, so it doesn't spin on its own here. */}
          <group scale={(R * 0.99) / 0.9}>
            <Earth radius={0.9} reduced textureSize={384} />
          </group>
          {arcPoints.map((pts, i) => (
            <group key={i}>
              <Line points={pts} color={ACCENT} lineWidth={1} transparent opacity={0.25} toneMapped={false} />
              <Line
                ref={(l) => {
                  if (l)
                    arcs.current[i] = l as unknown as {
                      material: { dashOffset: number };
                    };
                }}
                points={pts}
                color={ACCENT}
                lineWidth={2.2}
                dashed
                dashSize={0.25}
                gapSize={1.6}
                toneMapped={false}
              />
            </group>
          ))}
          <mesh position={latLng(-1.3, 36.8, R)}>
            <sphereGeometry args={[0.045, 16, 16]} />
            <meshBasicMaterial color={ACCENT} toneMapped={false} />
          </mesh>
        </group>
        <group ref={orbit} rotation={[0.5, 0, 0.3]}>
          {[0, 1, 2, 3].map((i) => {
            const a = (i / 4) * Math.PI * 2;
            return (
              <mesh key={i} position={[Math.cos(a) * 1.55, 0, Math.sin(a) * 1.55]}>
                <sphereGeometry args={[i === 0 ? 0.06 : 0.04, 16, 16]} />
                <meshStandardMaterial color={i === 0 ? ACCENT : palette.ink} />
              </mesh>
            );
          })}
          <Line
            points={Array.from({ length: 97 }, (_, i) => {
              const a = (i / 96) * Math.PI * 2;
              return new THREE.Vector3(Math.cos(a) * 1.55, 0, Math.sin(a) * 1.55);
            })}
            color={palette.line}
            lineWidth={1}
            transparent
            opacity={0.5}
          />
        </group>
      </group>
      <ContactBlob position={[0, -1.75, 0]} width={2} depth={0.5} opacity={0.18} />
    </group>
  );
}

/* ---------- MATLAB-CoppeliaSim: wheeled robot following a glowing path ---------- */

export function Rover({ palette, reduced }: VisualProps) {
  const float = useFloat(reduced, 0.15);
  const bot = useRef<THREE.Group>(null);
  const wheels = useRef<THREE.Mesh[]>([]);
  const curve = useMemo(
    () =>
      new THREE.CatmullRomCurve3(
        [
          [-1.5, 0, 0.2],
          [-0.6, 0, -0.9],
          [0.7, 0, -0.5],
          [1.5, 0, 0.4],
          [0.5, 0, 1.0],
          [-0.7, 0, 0.8],
        ].map((p) => new THREE.Vector3(...(p as [number, number, number]))),
        true,
        "catmullrom",
        0.5,
      ),
    [],
  );
  const points = useMemo(() => curve.getPoints(160), [curve]);
  const progress = useRef(0.1);
  const tangent = useMemo(() => new THREE.Vector3(), []);

  useFrame((_, dt) => {
    if (!reduced) progress.current = (progress.current + dt * 0.045) % 1;
    const b = bot.current;
    if (!b) return;
    const p = curve.getPointAt(progress.current);
    curve.getTangentAt(progress.current, tangent);
    b.position.set(p.x, 0.17, p.z);
    b.rotation.y = Math.atan2(tangent.x, tangent.z);
    if (!reduced) wheels.current.forEach((w) => w && (w.rotation.x += dt * 4));
  });

  return (
    <group ref={float}>
      <group rotation={[0.62, -0.35, 0]} position={[0, -0.15, 0]}>
        <mesh rotation-x={-Math.PI / 2} position={[0, -0.01, 0]}>
          <circleGeometry args={[2.1, 64]} />
          <meshStandardMaterial color={palette.solid} roughness={1} transparent opacity={0.5} />
        </mesh>
        <Line points={points} color={ACCENT} lineWidth={2.5} toneMapped={false} />
        <Line points={points} color={ACCENT} lineWidth={8} transparent opacity={0.12} toneMapped={false} />
        <group ref={bot}>
          <RoundedBox args={[0.42, 0.18, 0.55]} radius={0.06} smoothness={4}>
            <meshStandardMaterial color={palette.ink} roughness={0.5} />
          </RoundedBox>
          <RoundedBox args={[0.3, 0.06, 0.3]} radius={0.02} smoothness={2} position={[0, 0.12, -0.04]}>
            <meshStandardMaterial color={ACCENT} roughness={0.4} />
          </RoundedBox>
          <mesh position={[0, 0.2, 0.16]}>
            <sphereGeometry args={[0.035, 16, 16]} />
            <meshBasicMaterial color={ACCENT} toneMapped={false} />
          </mesh>
          {[-1, 1].map((side, i) => (
            <mesh
              key={side}
              ref={(m) => {
                if (m) wheels.current[i] = m;
              }}
              position={[side * 0.25, -0.03, 0.05]}
              rotation-z={Math.PI / 2}
            >
              <cylinderGeometry args={[0.11, 0.11, 0.06, 24]} />
              <meshStandardMaterial color={palette.soft} roughness={0.7} />
            </mesh>
          ))}
        </group>
      </group>
    </group>
  );
}

/* ---------- Hiwonder: articulated arm from primitives ---------- */

export function RobotArm({
  palette,
  reduced,
  scale = 1,
  float = true,
}: VisualProps & { scale?: number; float?: boolean }) {
  const floatRef = useFloat(reduced || !float, 0.2);
  const base = useRef<THREE.Group>(null);
  const shoulder = useRef<THREE.Group>(null);
  const elbow = useRef<THREE.Group>(null);
  const wrist = useRef<THREE.Group>(null);
  const fingers = useRef<THREE.Mesh[]>([]);

  useFrame((state) => {
    const t = reduced ? 1.2 : state.clock.elapsedTime;
    if (base.current) base.current.rotation.y = Math.sin(t * 0.4) * 0.7;
    if (shoulder.current) shoulder.current.rotation.z = -0.35 + Math.sin(t * 0.6) * 0.25;
    if (elbow.current) elbow.current.rotation.z = 1.0 + Math.sin(t * 0.6 + 1) * 0.35;
    if (wrist.current) wrist.current.rotation.z = 0.5 + Math.sin(t * 0.9) * 0.3;
    const grip = 0.06 + (Math.sin(t * 1.2) * 0.5 + 0.5) * 0.05;
    fingers.current.forEach((f, i) => f && (f.position.x = (i ? 1 : -1) * grip));
  });

  const joint = (
    <mesh>
      <sphereGeometry args={[0.1, 24, 24]} />
      <meshStandardMaterial color={palette.soft} roughness={0.5} />
    </mesh>
  );

  return (
    <group ref={floatRef}>
      <group scale={scale} position={[0, -1.35 * scale, 0]}>
        <mesh position={[0, 0.06, 0]}>
          <cylinderGeometry args={[0.42, 0.48, 0.12, 48]} />
          <meshStandardMaterial color={palette.ink} roughness={0.55} />
        </mesh>
        <group ref={base} position={[0, 0.12, 0]}>
          <mesh position={[0, 0.12, 0]}>
            <cylinderGeometry args={[0.16, 0.2, 0.24, 32]} />
            <meshStandardMaterial color={palette.solid} roughness={0.6} />
          </mesh>
          <group ref={shoulder} position={[0, 0.3, 0]}>
            {joint}
            <RoundedBox args={[0.14, 0.9, 0.14]} radius={0.05} smoothness={4} position={[0, 0.45, 0]}>
              <meshStandardMaterial color={palette.solid} roughness={0.6} />
            </RoundedBox>
            <group ref={elbow} position={[0, 0.9, 0]}>
              <mesh>
                <sphereGeometry args={[0.1, 24, 24]} />
                <meshStandardMaterial color={ACCENT} roughness={0.4} />
              </mesh>
              <RoundedBox args={[0.12, 0.75, 0.12]} radius={0.045} smoothness={4} position={[0, 0.375, 0]}>
                <meshStandardMaterial color={palette.solid} roughness={0.6} />
              </RoundedBox>
              <group ref={wrist} position={[0, 0.75, 0]}>
                {joint}
                <RoundedBox args={[0.26, 0.08, 0.12]} radius={0.03} smoothness={2} position={[0, 0.1, 0]}>
                  <meshStandardMaterial color={palette.ink} roughness={0.5} />
                </RoundedBox>
                {[0, 1].map((i) => (
                  <mesh
                    key={i}
                    ref={(m) => {
                      if (m) fingers.current[i] = m;
                    }}
                    position={[0, 0.24, 0]}
                  >
                    <boxGeometry args={[0.035, 0.2, 0.08]} />
                    <meshStandardMaterial color={palette.ink} roughness={0.5} />
                  </mesh>
                ))}
              </group>
            </group>
          </group>
        </group>
        <ContactBlob position={[0, 0, 0]} width={1.4} depth={0.7} opacity={0.2} />
      </group>
    </group>
  );
}

/* ---------- Canvas-texture windows: terminal (Terminal-Bench) and code (Web & AI) ---------- */

function useCanvasTexture(width: number, height: number) {
  return useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = 4;
    return { canvas, texture, ctx: canvas.getContext("2d")! };
  }, [width, height]);
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
}

const TERMINAL_LINES = [
  { text: "$ terminal-bench run", color: "#f5f3ef" },
  { text: "agent  claude-fable-5.1", color: "#9a9aa0" },
  { text: "› reading task", color: "#9a9aa0" },
  { text: "› running shell commands", color: "#9a9aa0" },
  { text: "› checking output", color: "#9a9aa0" },
];

function SoftShadow({ width, height }: { width: number; height: number }) {
  const texture = useMemo(() => getBlobTexture(), []);
  return (
    <mesh position={[0.12, -0.16, -0.08]} scale={[width * 1.35, height * 1.5, 1]}>
      <planeGeometry />
      <meshBasicMaterial map={texture} transparent opacity={0.2} depthWrite={false} toneMapped={false} />
    </mesh>
  );
}

function WindowPlane({
  texture,
  width,
  height,
  reduced,
}: {
  texture: THREE.Texture;
  width: number;
  height: number;
  reduced: boolean;
}) {
  const float = useFloat(reduced, 0.3);
  return (
    <group ref={float}>
      <SoftShadow width={width} height={height} />
      <mesh>
        <planeGeometry args={[width, height]} />
        <meshBasicMaterial map={texture} transparent toneMapped={false} />
      </mesh>
      <ContactBlob position={[0, -height / 2 - 0.35, 0.3]} width={width * 0.8} depth={0.4} opacity={0.16} />
    </group>
  );
}

export function TerminalWindow({ reduced }: VisualProps) {
  const W = 1024;
  const H = 680;
  const { ctx, texture } = useCanvasTexture(W, H);
  const clock = useRef(0);

  useEffect(() => () => texture.dispose(), [texture]);

  useFrame((_, dt) => {
    clock.current += reduced ? 0 : dt;
    const total = TERMINAL_LINES.reduce((n, l) => n + l.text.length, 0);
    const typed = reduced ? total : Math.floor((clock.current * 18) % (total + 40));
    const cursorOn = reduced || Math.floor(clock.current * 2) % 2 === 0;

    ctx.clearRect(0, 0, W, H);
    roundRect(ctx, 0, 0, W, H, 36);
    ctx.fillStyle = "#151517";
    ctx.fill();
    ctx.fillStyle = "#232326";
    roundRect(ctx, 0, 0, W, 72, 36);
    ctx.fill();
    ctx.fillRect(0, 40, W, 32);
    ["#ff5710", "#3a3a40", "#3a3a40"].forEach((c, i) => {
      ctx.fillStyle = c;
      ctx.beginPath();
      ctx.arc(46 + i * 34, 36, 10, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.font = "500 34px 'JetBrains Mono', ui-monospace, monospace";
    let left = typed;
    let y = 150;
    let cx = 60;
    let cy = y;
    for (const line of TERMINAL_LINES) {
      if (left <= 0) break;
      const shown = line.text.slice(0, left);
      left -= line.text.length;
      ctx.fillStyle = line.color;
      ctx.fillText(shown, 60, y);
      cx = 60 + ctx.measureText(shown).width + 6;
      cy = y;
      y += 70;
    }
    if (cursorOn) {
      ctx.fillStyle = "#ff5710";
      ctx.fillRect(cx, cy - 30, 18, 38);
    }
    texture.needsUpdate = true;
  });

  return <WindowPlane texture={texture} width={2.6} height={2.6 * (H / W)} reduced={reduced} />;
}

const CODE_LINES: { tokens: [string, string][]; indent: number }[] = [
  {
    indent: 0,
    tokens: [
      ["export ", "k"],
      ["function ", "k"],
      ["Portfolio", "f"],
      ["() {", "p"],
    ],
  },
  {
    indent: 1,
    tokens: [
      ["return ", "k"],
      ["(", "p"],
    ],
  },
  {
    indent: 2,
    tokens: [
      ["<Scene ", "t"],
      ["accent", "a"],
      ["=", "p"],
      ['"#FF5710"', "s"],
      [">", "t"],
    ],
  },
  {
    indent: 3,
    tokens: [
      ["<Cutout ", "t"],
      ["src", "a"],
      ["=", "p"],
      ['"hero.png"', "s"],
      [" />", "t"],
    ],
  },
  {
    indent: 3,
    tokens: [
      ["<Aura ", "t"],
      ["/>", "t"],
    ],
  },
  { indent: 2, tokens: [["</Scene>", "t"]] },
  { indent: 1, tokens: [[");", "p"]] },
  { indent: 0, tokens: [["}", "p"]] },
];

export function CodeWindow({ reduced, theme }: VisualProps & { theme: "light" | "dark" }) {
  const W = 1024;
  const H = 720;
  const { ctx, texture } = useCanvasTexture(W, H);

  useEffect(() => {
    const dark = theme === "dark";
    const colors: Record<string, string> = {
      k: "#ff5710",
      f: dark ? "#f5f3ef" : "#0c0c0d",
      p: dark ? "#9a9aa0" : "#6b6b70",
      t: dark ? "#f5f3ef" : "#0c0c0d",
      a: dark ? "#c9c5be" : "#55555a",
      s: "#ff5710",
    };
    ctx.clearRect(0, 0, W, H);
    roundRect(ctx, 0, 0, W, H, 36);
    ctx.fillStyle = dark ? "#1c1c1f" : "#ffffff";
    ctx.fill();
    ctx.strokeStyle = dark ? "#2e2e33" : "#e4e0d9";
    ctx.lineWidth = 3;
    ctx.stroke();
    [0, 1, 2].forEach((i) => {
      ctx.fillStyle = i === 0 ? "#ff5710" : dark ? "#3a3a40" : "#dcd8d1";
      ctx.beginPath();
      ctx.arc(46 + i * 34, 40, 10, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.font = "500 32px 'JetBrains Mono', ui-monospace, monospace";
    CODE_LINES.forEach((line, i) => {
      let x = 60 + line.indent * 40;
      const y = 140 + i * 66;
      ctx.fillStyle = dark ? "#4a4a50" : "#c9c5be";
      ctx.fillText(String(i + 1).padStart(2, " "), 0 + 4, y);
      for (const [text, kind] of line.tokens) {
        ctx.fillStyle = colors[kind];
        ctx.fillText(text, x, y);
        x += ctx.measureText(text).width;
      }
    });
    texture.needsUpdate = true;
  }, [ctx, texture, theme]);

  useEffect(() => () => texture.dispose(), [texture]);

  return <WindowPlane texture={texture} width={2.4} height={2.4 * (H / W)} reduced={reduced} />;
}

/* ---------- A real screenshot on a floating plane ---------- */

export function ScreenshotPlane({ src, reduced }: { src: string; reduced: boolean }) {
  const texture = useTexture(optimizedImage(src, 1200), (t) => {
    const tex = Array.isArray(t) ? t[0] : t;
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 4;
  });
  const image = texture.image as { width: number; height: number };
  const width = 2.8;
  const height = width * (image.height / image.width);
  return <WindowPlane texture={texture} width={width} height={height} reduced={reduced} />;
}
