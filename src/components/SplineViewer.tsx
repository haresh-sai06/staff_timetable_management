"use client";

import { useEffect, useRef } from "react";

export default function SplineViewer() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Load Spline runtime
    const script = document.createElement("script");
    script.type = "module";
    script.src = "https://unpkg.com/@splinetool/runtime@1.9.28/build/runtime.js";
    
    script.onload = () => {
      // @ts-ignore
      const { Application } = window.SPLINE;
      const app = new Application(canvas);
      app.load("https://prod.spline.design/lCdYpF6pmPf5ji5f/scene.splinecode");
    };

    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  return (
    <div className="w-full h-full relative rounded-lg overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-100 spline-container">
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
