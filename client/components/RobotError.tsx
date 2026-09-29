"use client";

import Link from "next/link";
import { Bot, House, RotateCcw } from "lucide-react";
import { useEffect, useRef } from "react";

function RobotScene() {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    let cancelled = false;
    let renderer: import("three").WebGLRenderer | undefined;
    let observer: ResizeObserver | undefined;
    let scene: import("three").Scene | undefined;

    void import("three").then((THREE) => {
      if (cancelled || !host) return;

      try {
        scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100);
        camera.position.set(0, 0.35, 6.2);

        renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.setClearColor(0x000000, 0);
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        host.appendChild(renderer.domElement);

        scene.add(new THREE.HemisphereLight(0xdffbf5, 0x29213b, 2.1));
        const keyLight = new THREE.DirectionalLight(0xffffff, 3.4);
        keyLight.position.set(-3, 5, 5);
        scene.add(keyLight);
        const rimLight = new THREE.PointLight(0xff5c8a, 24, 12);
        rimLight.position.set(3, 1, -1);
        scene.add(rimLight);

        const robot = new THREE.Group();
        scene.add(robot);

        const shell = new THREE.MeshStandardMaterial({
          color: 0x20d3a0,
          roughness: 0.32,
          metalness: 0.24,
        });
        const shellLight = new THREE.MeshStandardMaterial({
          color: 0x9bf4df,
          roughness: 0.27,
          metalness: 0.16,
        });
        const dark = new THREE.MeshStandardMaterial({
          color: 0x171527,
          roughness: 0.38,
          metalness: 0.12,
        });
        const gold = new THREE.MeshStandardMaterial({
          color: 0xffc93c,
          emissive: 0x8a5010,
          emissiveIntensity: 0.6,
          roughness: 0.25,
        });
        const pink = new THREE.MeshStandardMaterial({
          color: 0xff5c8a,
          roughness: 0.38,
          metalness: 0.12,
        });

        const torso = new THREE.Mesh(
          new THREE.CapsuleGeometry(0.48, 0.48, 8, 20),
          shell,
        );
        torso.position.y = -0.46;
        robot.add(torso);

        const head = new THREE.Mesh(
          new THREE.SphereGeometry(0.72, 36, 28),
          shellLight,
        );
        head.scale.set(1.08, 0.86, 0.78);
        head.position.y = 0.65;
        robot.add(head);

        const face = new THREE.Mesh(
          new THREE.BoxGeometry(0.88, 0.42, 0.12),
          dark,
        );
        face.position.set(0, 0.61, 0.54);
        robot.add(face);

        for (const x of [-0.22, 0.22]) {
          const eye = new THREE.Mesh(
            new THREE.SphereGeometry(0.075, 20, 16),
            gold,
          );
          eye.position.set(x, 0.64, 0.62);
          robot.add(eye);
        }

        const mouth = new THREE.Mesh(
          new THREE.BoxGeometry(0.2, 0.035, 0.025),
          shellLight,
        );
        mouth.position.set(0, 0.48, 0.625);
        robot.add(mouth);

        const antenna = new THREE.Mesh(
          new THREE.CylinderGeometry(0.035, 0.035, 0.27, 12),
          pink,
        );
        antenna.position.set(0.1, 1.38, 0);
        robot.add(antenna);
        const antennaTip = new THREE.Mesh(
          new THREE.SphereGeometry(0.1, 18, 14),
          gold,
        );
        antennaTip.position.set(0.1, 1.55, 0);
        robot.add(antennaTip);

        for (const side of [-1, 1]) {
          const arm = new THREE.Mesh(
            new THREE.CapsuleGeometry(0.12, 0.34, 5, 12),
            shell,
          );
          arm.position.set(side * 0.62, -0.35, 0.02);
          arm.rotation.z = side * -0.32;
          robot.add(arm);
          const hand = new THREE.Mesh(
            new THREE.SphereGeometry(0.14, 18, 14),
            pink,
          );
          hand.position.set(side * 0.72, -0.67, 0.02);
          robot.add(hand);
        }

        const orbit = new THREE.Mesh(
          new THREE.TorusGeometry(1.35, 0.018, 8, 100),
          pink,
        );
        orbit.position.set(0, 0.12, -0.38);
        orbit.rotation.x = 0.34;
        robot.add(orbit);

        const resize = () => {
          if (!renderer || !host) return;
          const width = host.clientWidth;
          const height = host.clientHeight;
          if (width === 0 || height === 0) return;
          renderer.setSize(width, height, false);
          camera.aspect = width / height;
          camera.updateProjectionMatrix();
          renderer.render(scene!, camera);
        };

        observer = new ResizeObserver(resize);
        observer.observe(host);
        resize();

        if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
          renderer.setAnimationLoop((time) => {
            robot.position.y = Math.sin(time * 0.0015) * 0.08;
            robot.rotation.y = Math.sin(time * 0.0007) * 0.12;
            orbit.rotation.z = time * 0.00025;
            renderer?.render(scene!, camera);
          });
        }
      } catch {
        renderer?.dispose();
        renderer = undefined;
      }
    });

    return () => {
      cancelled = true;
      observer?.disconnect();
      renderer?.setAnimationLoop(null);
      scene?.traverse((object) => {
        if (object instanceof Object && "geometry" in object) {
          (object as import("three").Mesh).geometry?.dispose();
          const material = (object as import("three").Mesh).material;
          if (Array.isArray(material))
            material.forEach((item) => item.dispose());
          else material?.dispose();
        }
      });
      renderer?.dispose();
    };
  }, []);

  return (
    <div
      ref={hostRef}
      aria-hidden="true"
      className="relative mx-auto h-[230px] w-full max-w-sm"
    >
      <Bot
        className="absolute left-1/2 top-1/2 h-20 w-20 -translate-x-1/2 -translate-y-1/2 text-mint"
        strokeWidth={1.2}
      />
      <canvas className="absolute inset-0 h-full w-full" />
    </div>
  );
}

export function RobotError({
  message,
  onRetry,
  digest,
  fullScreen = false,
}: {
  message: string;
  onRetry?: () => void;
  digest?: string;
  fullScreen?: boolean;
}) {
  return (
    <section
      aria-labelledby="loopin-error-title"
      className={`relative isolate flex flex-col items-center justify-center overflow-hidden px-5 py-8 text-center ${
        fullScreen
          ? "min-h-[72vh]"
          : "min-h-[420px] rounded-[26px] border border-line bg-card"
      }`}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_50%_38%,color-mix(in_srgb,var(--mint)_12%,transparent),transparent_55%)]"
      />
      <RobotScene />
      <div className="-mt-2 max-w-lg">
        <p className="mb-2 text-xs font-bold uppercase tracking-[0.16em] text-pink">
          A little loop in the system
        </p>
        <h2
          id="loopin-error-title"
          className="font-display text-2xl font-bold text-ink"
        >
          We hit a snag
        </h2>
        <p
          role="alert"
          className="mx-auto mt-3 max-w-md text-sm leading-6 text-ink-soft"
        >
          {message}
        </p>
        {digest && (
          <p className="mt-3 font-mono text-xs text-ink-soft">
            Reference: {digest}
          </p>
        )}
      </div>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="btn-press inline-flex min-h-11 items-center gap-2 rounded-full bg-violet px-5 text-sm font-bold text-white"
          >
            <RotateCcw size={16} aria-hidden="true" />
            Try again
          </button>
        )}
        <Link
          href="/"
          className="btn-press inline-flex min-h-11 items-center gap-2 rounded-full border border-line bg-card px-5 text-sm font-bold text-ink hover:border-mint"
        >
          <House size={16} aria-hidden="true" />
          Back to Loopin
        </Link>
      </div>
    </section>
  );
}
