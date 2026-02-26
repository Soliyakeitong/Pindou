import React, { useState, useEffect } from 'react';
import { Settings, Image as ImageIcon, Palette } from 'lucide-react';
import ImageUploader from './components/ImageUploader';
import PixelCanvas from './components/PixelCanvas';
import MaterialsList from './components/MaterialsList';
import { processImage, ProcessResult } from './utils/imageProcessing';

export default function App() {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [boardSize, setBoardSize] = useState<number>(29);
  const [result, setResult] = useState<ProcessResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showGrid, setShowGrid] = useState(true);
  const [useDithering, setUseDithering] = useState(false);
  const [useSmoothing, setUseSmoothing] = useState(false);

  useEffect(() => {
    if (imageUrl) {
      setIsProcessing(true);
      processImage(imageUrl, boardSize, useDithering, useSmoothing)
        .then(setResult)
        .catch(console.error)
        .finally(() => setIsProcessing(false));
    }
  }, [imageUrl, boardSize, useDithering, useSmoothing]);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Palette className="w-6 h-6 text-indigo-600" />
            <h1 className="text-xl font-bold tracking-tight text-gray-900">拼豆图纸生成器</h1>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-gray-500" />
                上传图片
              </h2>
              <ImageUploader onImageSelected={setImageUrl} />
              
              {imageUrl && (
                <div className="mt-4">
                  <p className="text-sm text-gray-500 mb-2">原图预览</p>
                  <img src={imageUrl} alt="Original" className="w-full h-auto rounded-lg border border-gray-200" />
                </div>
              )}
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Settings className="w-5 h-5 text-gray-500" />
                设置
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    拼豆板宽度 (颗粒数)
                  </label>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    value={boardSize}
                    onChange={(e) => setBoardSize(Number(e.target.value))}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>10</span>
                    <span className="font-medium text-indigo-600">{boardSize} 颗</span>
                    <span>100</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <label className="text-sm font-medium text-gray-700">显示网格</label>
                  <button
                    onClick={() => setShowGrid(!showGrid)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${showGrid ? 'bg-indigo-600' : 'bg-gray-200'}`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${showGrid ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <div>
                    <label className="text-sm font-medium text-gray-700 block">色彩抖动 (Dithering)</label>
                    <span className="text-xs text-gray-500">开启后颜色过渡更自然，但可能产生杂色</span>
                  </div>
                  <button
                    onClick={() => setUseDithering(!useDithering)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${useDithering ? 'bg-indigo-600' : 'bg-gray-200'}`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${useDithering ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <div>
                    <label className="text-sm font-medium text-gray-700 block">边缘平滑 (Smoothing)</label>
                    <span className="text-xs text-gray-500">关闭可保持边缘锐利，适合像素画原图</span>
                  </div>
                  <button
                    onClick={() => setUseSmoothing(!useSmoothing)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${useSmoothing ? 'bg-indigo-600' : 'bg-gray-200'}`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${useSmoothing ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-8 space-y-6">
            {isProcessing ? (
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-12 flex flex-col items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-100 border-t-indigo-600 mb-4"></div>
                <p className="text-gray-500">正在生成图纸...</p>
              </div>
            ) : result ? (
              <>
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold">生成图纸</h2>
                    <span className="text-sm text-gray-500">尺寸: {result.width} x {result.height}</span>
                  </div>
                  <PixelCanvas result={result} showGrid={showGrid} />
                </div>
                
                <MaterialsList result={result} />
              </>
            ) : (
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-12 flex flex-col items-center justify-center min-h-[400px] text-center">
                <Palette className="w-16 h-16 text-gray-200 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-1">暂无图纸</h3>
                <p className="text-gray-500">请先在左侧上传一张图片</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
