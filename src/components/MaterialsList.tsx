import React from 'react';
import { ProcessResult } from '../utils/imageProcessing';

interface MaterialsListProps {
  result: ProcessResult;
}

export default function MaterialsList({ result }: MaterialsListProps) {
  const materials = Object.values(result.colorCounts).sort((a, b) => b.count - a.count);
  const totalBeads = materials.reduce((sum, item) => sum + item.count, 0);

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
        <h3 className="font-medium text-gray-800">材料清单</h3>
        <span className="text-sm text-gray-500">总计: {totalBeads} 颗</span>
      </div>
      <ul className="divide-y divide-gray-100 max-h-[400px] overflow-y-auto">
        {materials.map(({ color, count }) => (
          <li key={color.hex} className="px-4 py-3 flex items-center justify-between hover:bg-gray-50">
            <div className="flex items-center gap-3">
              <div
                className="w-6 h-6 rounded-full border border-gray-200 shadow-sm shrink-0"
                style={{ backgroundColor: color.hex }}
              />
              <div className="flex flex-col">
                <span className="text-sm font-medium text-gray-700">{color.name}</span>
                <span className="text-xs text-gray-500">Mard 色号: {color.code}</span>
              </div>
            </div>
            <span className="text-sm font-semibold text-gray-900">{count} 颗</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
