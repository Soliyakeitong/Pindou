import React, { useCallback } from 'react';
import { UploadCloud } from 'lucide-react';

interface ImageUploaderProps {
  onImageSelected: (url: string) => void;
}

export default function ImageUploader({ onImageSelected }: ImageUploaderProps) {
  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file);
      onImageSelected(url);
    }
  }, [onImageSelected]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      onImageSelected(url);
    }
  }, [onImageSelected]);

  return (
    <div
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
      className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:bg-gray-50 transition-colors cursor-pointer relative"
    >
      <input
        type="file"
        accept="image/*"
        onChange={handleChange}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
      />
      <UploadCloud className="w-12 h-12 text-gray-400 mx-auto mb-4" />
      <p className="text-gray-600 font-medium">点击或拖拽图片到此处</p>
      <p className="text-gray-400 text-sm mt-2">支持 JPG, PNG, WEBP</p>
    </div>
  );
}
