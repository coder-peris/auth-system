"use client";

import { useEffect, useRef } from "react";
import QRCodeLib from "qrcode";

interface QRCodeProps {
  value: string;
  size?: number;
  className?: string;
}

export function QRCode({ value, size = 200, className = "" }: QRCodeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const generateQR = async () => {
      if (!canvasRef.current || !value) return;

      try {
        await QRCodeLib.toCanvas(canvasRef.current, value, {
          width: size,
          margin: 1,
          color: {
            dark: "#000000",
            light: "#FFFFFF",
          },
        });
      } catch (error) {
        console.error("Error generating QR code:", error);
      }
    };

    generateQR();
  }, [value, size]);

  return (
    <div className={`flex justify-center ${className}`}>
      <canvas
        ref={canvasRef}
        style={{ width: size, height: size }}
        className="border border-gray-200 rounded-lg"
      />
    </div>
  );
}
