"use client";

import { useEffect, useState } from "react";

const SCENES = [
  "/hero-salon-1.svg",
  "/hero-salon-2.svg",
  "/hero-salon-3.svg",
  "/hero-salon-4.svg",
] as const;

const INTERVAL_MS = 7000;

export function HeroSalonBackdrop() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => {
      setIndex((current) => (current + 1) % SCENES.length);
    }, INTERVAL_MS);
    return () => window.clearInterval(id);
  }, []);

  return (
    <div className="hero__visual" aria-hidden>
      {SCENES.map((src, i) => (
        <div
          key={src}
          className={
            i === index
              ? "hero__scene is-active"
              : "hero__scene"
          }
          style={{ backgroundImage: `url("${src}")` }}
        />
      ))}
    </div>
  );
}
