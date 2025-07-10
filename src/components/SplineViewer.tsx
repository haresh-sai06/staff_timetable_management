"use client";

import { useEffect, useRef } from "react";
import { Application } from "@splinetool/runtime";

export default function SplineViewer() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const app = new Application(canvas);
    app.load("https://prod.spline.design/lCdYpF6pmPf5ji5f/scene.splinecode");
  }, []);

  return (
    <div className="w-full h-full relative rounded-lg overflow-hidden bg-gradient-to-br from-gray-800 to-gray-900 spline-container">
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{
          background: "transparent",
        }}
      />
      {/* Hide Spline watermark */}
      <style>{`
        .spline-container canvas + div {
          display: none !important;
        }
      `}</style>
    </div>
  );
}