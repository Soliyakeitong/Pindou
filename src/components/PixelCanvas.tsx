import React, { useEffect, useRef } from 'react';
import { ProcessResult } from '../utils/imageProcessing';

interface PixelCanvasProps {
  result: ProcessResult;
  scale?: number;
  showGrid?: boolean;
}

export default function PixelCanvas({ result, scale = 15, showGrid = true }: PixelCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = result.width * scale;
    canvas.height = result.height * scale;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    result.pixels.forEach(pixel => {
      if (pixel.color) {
        ctx.fillStyle = pixel.color.hex;
        ctx.beginPath();
        ctx.arc(
          pixel.x * scale + scale / 2,
          pixel.y * scale + scale / 2,
          scale / 2 - 1,
          0,
          Math.PI * 2
        );
        ctx.fill();
        
        ctx.fillStyle = 'rgba(0,0,0,0.2)';
        ctx.beginPath();
        ctx.arc(
          pixel.x * scale + scale / 2,
          pixel.y * scale + scale / 2,
          scale / 6,
          0,
          Math.PI * 2
        );
        ctx.fill();
      }
    });

    if (showGrid) {
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
      ctx.lineWidth = 1;
      for (let x = 0; x <= result.width; x++) {
        ctx.beginPath();
        ctx.moveTo(x * scale, 0);
        ctx.lineTo(x * scale, canvas.height);
        ctx.stroke();
      }
      for (let y = 0; y <= result.height; y++) {
        ctx.beginPath();
        ctx.moveTo(0, y * scale);
        ctx.lineTo(canvas.width, y * scale);
        ctx.stroke();
      }
    }
  }, [result, scale, showGrid]);

  return (
    <div className="overflow-auto border border-gray-200 rounded-lg bg-gray-50 p-4 flex justify-center items-center min-h-[300px]">
      <canvas ref={canvasRef} className="max-w-none shadow-sm bg-white" />
    </div>
  );
}
