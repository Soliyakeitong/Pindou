import React, { useEffect, useRef, useState, useCallback } from 'react';
import { ZoomIn, ZoomOut, Maximize, Download } from 'lucide-react';
import { ProcessResult } from '../utils/imageProcessing';

interface PixelCanvasProps {
  result: ProcessResult;
  showGrid?: boolean;
}

const BASE_SCALE = 20;

export default function PixelCanvas({ result, showGrid = true }: PixelCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);

  // 绘制 Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = result.width * BASE_SCALE;
    canvas.height = result.height * BASE_SCALE;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    result.pixels.forEach(pixel => {
      if (pixel.color) {
        // 绘制拼豆底色
        ctx.fillStyle = pixel.color.hex;
        ctx.beginPath();
        ctx.arc(
          pixel.x * BASE_SCALE + BASE_SCALE / 2,
          pixel.y * BASE_SCALE + BASE_SCALE / 2,
          BASE_SCALE / 2 - 1,
          0,
          Math.PI * 2
        );
        ctx.fill();
        
        // 绘制拼豆中间的孔洞
        ctx.fillStyle = 'rgba(0,0,0,0.2)';
        ctx.beginPath();
        ctx.arc(
          pixel.x * BASE_SCALE + BASE_SCALE / 2,
          pixel.y * BASE_SCALE + BASE_SCALE / 2,
          BASE_SCALE / 6,
          0,
          Math.PI * 2
        );
        ctx.fill();
      }
    });

    // 绘制网格
    if (showGrid) {
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
      ctx.lineWidth = 1;
      for (let x = 0; x <= result.width; x++) {
        ctx.beginPath();
        ctx.moveTo(x * BASE_SCALE, 0);
        ctx.lineTo(x * BASE_SCALE, canvas.height);
        ctx.stroke();
      }
      for (let y = 0; y <= result.height; y++) {
        ctx.beginPath();
        ctx.moveTo(0, y * BASE_SCALE);
        ctx.lineTo(canvas.width, y * BASE_SCALE);
        ctx.stroke();
      }
    }
  }, [result, showGrid]);

  // 适应视图大小
  const handleFit = useCallback(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const padding = 48; // 预留边距
    const availableWidth = container.clientWidth - padding;
    const availableHeight = container.clientHeight - padding;
    
    const canvasBaseWidth = result.width * BASE_SCALE;
    const canvasBaseHeight = result.height * BASE_SCALE;
    
    const scaleX = availableWidth / canvasBaseWidth;
    const scaleY = availableHeight / canvasBaseHeight;
    
    // 取最小缩放比例，最大不超过 100%
    const newZoom = Math.min(scaleX, scaleY, 1);
    setZoom(newZoom);
  }, [result.width, result.height]);

  // 结果变化时自动适应视图
  useEffect(() => {
    handleFit();
  }, [handleFit]);

  // 下载图纸
  const handleDownload = () => {
    if (!canvasRef.current) return;
    const url = canvasRef.current.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = `perler-pattern-${result.width}x${result.height}.png`;
    a.click();
  };

  return (
    <div className="flex flex-col gap-3">
      {/* 工具栏 */}
      <div className="flex flex-wrap items-center justify-between gap-2 bg-gray-50 p-2 rounded-lg border border-gray-200">
        <div className="flex items-center gap-1">
          <button 
            onClick={() => setZoom(z => Math.max(0.1, z - 0.1))}
            className="p-1.5 text-gray-600 hover:bg-gray-200 rounded-md transition-colors"
            title="缩小"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="text-sm font-medium w-12 text-center text-gray-700">
            {Math.round(zoom * 100)}%
          </span>
          <button 
            onClick={() => setZoom(z => Math.min(3, z + 0.1))}
            className="p-1.5 text-gray-600 hover:bg-gray-200 rounded-md transition-colors"
            title="放大"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <div className="w-px h-4 bg-gray-300 mx-1" />
          <button 
            onClick={handleFit}
            className="flex items-center gap-1.5 px-2 py-1.5 text-sm text-gray-600 hover:bg-gray-200 rounded-md transition-colors"
          >
            <Maximize className="w-4 h-4" />
            <span>适应视图</span>
          </button>
        </div>
        
        <button 
          onClick={handleDownload}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md transition-colors shadow-sm"
        >
          <Download className="w-4 h-4" />
          <span>下载图纸</span>
        </button>
      </div>

      {/* 画布区域 */}
      <div 
        ref={containerRef} 
        className="overflow-auto border border-gray-200 rounded-lg bg-gray-100 h-[500px]"
      >
        <div className="w-fit h-fit min-w-full min-h-full flex items-center justify-center p-6">
          <canvas 
            ref={canvasRef} 
            className="shadow-md bg-white transition-all duration-200"
            style={{ 
              width: result.width * BASE_SCALE * zoom, 
              height: result.height * BASE_SCALE * zoom 
            }} 
          />
        </div>
      </div>
    </div>
  );
}
