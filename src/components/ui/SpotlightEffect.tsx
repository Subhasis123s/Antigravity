"use client";

import React, { useEffect, useState } from "react";

export const SpotlightEffect: React.FC = () => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState(0);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
      setOpacity(1);
    };

    const handleMouseLeave = () => {
      setOpacity(0);
    };

    window.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  return (
    <div
      className="pointer-events-none fixed inset-0 z-30 transition-opacity duration-500"
      style={{ opacity }}
    >
      <div
        className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl transition-transform duration-75 ease-out"
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          width: "600px",
          height: "600px",
          background:
            "radial-gradient(circle, rgba(110, 86, 207, 0.12) 0%, rgba(139, 92, 246, 0.04) 45%, transparent 70%)",
        }}
      />
    </div>
  );
};
