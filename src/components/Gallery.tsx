import React, { useState } from 'react';
import { Trash2, Eye, Download, AlertTriangle } from 'lucide-react';

export interface CachedImage {
  url: string;
  filename: string;
  timestamp: number;
  prompt?: string;
}

interface GalleryProps {
  images: CachedImage[];
  onSelect: (imageUrl: string) => void;
  onDelete: (filename: string) => void;
  onClearAll: () => void;
}

export default function Gallery({ images, onSelect, onDelete, onClearAll }: GalleryProps) {
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const handleDeleteClick = (filename: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeleteConfirm(filename);
  };

  const confirmDelete = (filename: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(filename);
    setDeleteConfirm(null);
  };

  if (images.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-400">
          <Eye className="w-5 h-5" />
          图片画廊
        </h2>
        <p className="text-gray-500 text-center py-8">暂无缓存图片，先生成一些图片吧</p>
      </div>
    );
  }

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return '刚刚';
    if (minutes < 60) return `${minutes}分钟前`;
    if (hours < 24) return `${hours}小时前`;
    if (days < 7) return `${days}天前`;
    return date.toLocaleDateString('zh-CN');
  };

  const copyImageUrl = (url: string) => {
    navigator.clipboard.writeText(url);
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Eye className="w-5 h-5 text-indigo-500" />
          图片画廊
          <span className="text-sm text-gray-500">({images.length})</span>
        </h2>
        <button
          onClick={() => setShowClearConfirm(true)}
          className="text-sm text-red-600 hover:text-red-700 flex items-center gap-1"
        >
          <Trash2 className="w-4 h-4" />
          清空全部
        </button>
      </div>

      {/* 清空全部确认对话框 */}
      {showClearConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowClearConfirm(false)}>
          <div className="bg-white rounded-lg p-6 max-w-sm mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="w-6 h-6 text-yellow-500" />
              <h3 className="text-lg font-semibold text-gray-900">确认清空全部</h3>
            </div>
            <p className="text-gray-600 mb-6">
              确定要删除画廊中的所有 {images.length} 张图片吗？此操作无法撤销。
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
              >
                取消
              </button>
              <button
                onClick={() => {
                  onClearAll();
                  setShowClearConfirm(false);
                }}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
              >
                清空
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {images.map((img) => (
          <div
            key={img.filename}
            className="group relative aspect-square bg-gray-100 rounded-lg overflow-hidden cursor-pointer hover:ring-2 hover:ring-indigo-500 transition-all"
            onClick={() => onSelect(img.url)}
          >
            <img
              src={img.url}
              alt={img.prompt || `Gallery ${img.filename}`}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
              loading="lazy"
            />

            {/* 悬停操作按钮 */}
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onSelect(img.url);
                }}
                className="p-2 bg-white rounded-full hover:bg-indigo-500 hover:text-white transition-colors z-10"
                title="生成图纸"
              >
                <Eye className="w-4 h-4" />
              </button>
              {deleteConfirm === img.filename ? (
                <div className="absolute inset-0 bg-black bg-opacity-90 flex flex-col items-center justify-center gap-3 z-20" onClick={(e) => e.stopPropagation()}>
                  <AlertTriangle className="w-8 h-8 text-yellow-500" />
                  <p className="text-sm text-white font-medium">确认删除？</p>
                  <div className="flex gap-2">
                    <button
                      onClick={(e) => confirmDelete(img.filename, e)}
                      className="px-4 py-1.5 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors font-medium"
                    >
                      删除
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); setDeleteConfirm(null); }}
                      className="px-4 py-1.5 bg-gray-600 text-white text-sm rounded hover:bg-gray-700 transition-colors font-medium"
                    >
                      取消
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={(e) => handleDeleteClick(img.filename, e)}
                  className="p-2 bg-white rounded-full hover:bg-red-500 hover:text-white transition-colors z-10"
                  title="删除"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* 时间标签 */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
              <p className="text-xs text-white truncate">
                {img.prompt || `图片`}
              </p>
              <p className="text-xs text-gray-300">{formatDate(img.timestamp)}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
