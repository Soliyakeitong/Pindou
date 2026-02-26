import React, { useState, useEffect } from 'react';
import { Settings, Image as ImageIcon, Palette, Wand2, Download } from 'lucide-react';
import ImageUploader from './components/ImageUploader';
import PixelCanvas from './components/PixelCanvas';
import MaterialsList from './components/MaterialsList';
import Gallery from './components/Gallery';
import { processImage, ProcessResult } from './utils/imageProcessing';
import { fetchAndCacheImage, getCachedImageList, deleteCachedImage, clearAllCache, addGalleryImage } from './utils/imageCache';

export default function App() {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [boardSize, setBoardSize] = useState<number>(50);
  const [result, setResult] = useState<ProcessResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showGrid, setShowGrid] = useState(true);
  const [useDithering, setUseDithering] = useState(false);
  const [useSmoothing, setUseSmoothing] = useState(true);
  const [optimizeColors, setOptimizeColors] = useState(true);

  // AI 图片生成相关状态
  const [aiPrompt, setAiPrompt] = useState<string>('');
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  // 缓存图片列表
  const [cachedImages, setCachedImages] = useState<Array<{ url: string; filename: string; timestamp: number; prompt?: string }>>([]);

  // 处理滑块变化
  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBoardSize(Number(e.target.value));
  };

  // AI 图片生成函数
  const generateAIImage = async () => {
    if (!aiPrompt.trim()) {
      setAiError('请输入图片描述');
      return;
    }

    setIsGeneratingAI(true);
    setAiError(null);

    try {
      // 动态获取 API 地址（支持局域网访问）
      const apiHost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
        ? 'http://localhost:3001'
        : `http://${window.location.hostname}:3001`;

      // 使用本地代理服务器调用通义万相 API（使用 Python SDK）
      const response = await fetch(`${apiHost}/api/tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'qwen-image-plus',
          input: {
            prompt: `可爱的卡通动漫风格，${aiPrompt}，简洁线条，明亮色彩，适合拼豆图案`
          },
          parameters: {
            size: '1024*1024'
          }
        })
      });

      const data = await response.json();

      if (!response.ok || data.status_code !== 200) {
        throw new Error(data.message || data.error || 'AI 图片生成失败');
      }

      // Python SDK 同步调用，直接获取结果
      // 代理服务器已经自动保存图片到本地，返回的是本地路径
      if (data.output && data.output.results && data.output.results[0].url) {
        const generatedImageUrl = data.output.results[0].url;

        // 设置为当前图片
        setImageUrl(generatedImageUrl);
        setAiPrompt('');

        // 刷新缓存列表
        await loadCachedImages();
      } else {
        throw new Error('未获取到图片 URL');
      }
    } catch (err) {
      setAiError(err instanceof Error ? err.message : 'AI 图片生成失败，请检查网络或 API 配置');
    } finally {
      setIsGeneratingAI(false);
    }
  };

  // 加载缓存图片列表
  const loadCachedImages = async () => {
    const list = await getCachedImageList();
    setCachedImages(list);
  };

  // 选择缓存图片
  const selectCachedImage = (url: string) => {
    setImageUrl(url);
    // 滚动到顶部
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 删除缓存图片
  const handleDeleteCache = async (filename: string) => {
    await deleteCachedImage(filename);
    await loadCachedImages();
  };

  // 清除所有缓存
  const handleClearAllCache = async () => {
    if (confirm('确定要清除所有缓存的图片吗？')) {
      await clearAllCache();
      await loadCachedImages();
    }
  };

  useEffect(() => {
    if (imageUrl) {
      setIsProcessing(true);
      processImage(imageUrl, boardSize, useDithering, useSmoothing, optimizeColors)
        .then(setResult)
        .catch(console.error)
        .finally(() => setIsProcessing(false));
    }
  }, [imageUrl, boardSize, useDithering, useSmoothing, optimizeColors]);

  // 加载缓存图片列表
  useEffect(() => {
    loadCachedImages();
  }, []);

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
                <Wand2 className="w-5 h-5 text-purple-500" />
                AI 图片生成
              </h2>
              <div className="space-y-3">
                <textarea
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder="描述你想生成的图片，例如：一只可爱的小猫、樱花树下的女孩..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500 resize-none text-sm"
                  rows={3}
                />
                {aiError && (
                  <p className="text-sm text-red-600">{aiError}</p>
                )}
                <button
                  onClick={generateAIImage}
                  disabled={isGeneratingAI}
                  className="w-full py-2 px-4 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                >
                  {isGeneratingAI ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      正在生成...
                    </>
                  ) : (
                    <>
                      <Wand2 className="w-4 h-4" />
                      生成图片
                    </>
                  )}
                </button>
                <p className="text-xs text-gray-500">
                  💡 生成的图片会自动保存到画廊，刷新页面不会丢失
                </p>
              </div>
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
                    min="5"
                    max="200"
                    value={boardSize}
                    onChange={handleSliderChange}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>5</span>
                    <span className="font-medium text-indigo-600">{boardSize} 颗</span>
                    <span>200</span>
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

                <div className="flex items-center justify-between pt-2">
                  <div>
                    <label className="text-sm font-medium text-gray-700 block">优化材料种类</label>
                    <span className="text-xs text-gray-500">自动合并极少使用的颜色，减少购买材料的种类</span>
                  </div>
                  <button
                    onClick={() => setOptimizeColors(!optimizeColors)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${optimizeColors ? 'bg-indigo-600' : 'bg-gray-200'}`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${optimizeColors ? 'translate-x-6' : 'translate-x-1'}`} />
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
                <p className="text-gray-500">请先在左侧上传一张图片或从画廊选择</p>
              </div>
            )}

            {/* 图片画廊 */}
            <Gallery
              images={cachedImages}
              onSelect={selectCachedImage}
              onDelete={handleDeleteCache}
              onClearAll={handleClearAllCache}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
