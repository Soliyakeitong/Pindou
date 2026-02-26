export interface Color {
  name: string;
  hex: string;
  rgb: [number, number, number];
  code: string;
}

export const PERLER_COLORS: Color[] = [
  { name: '黑色 (Black)', hex: '#2B2B2B', rgb: [43, 43, 43], code: 'M01' },
  { name: '白色 (White)', hex: '#FFFFFF', rgb: [255, 255, 255], code: 'M02' },
  { name: '红色 (Red)', hex: '#C51111', rgb: [197, 17, 17], code: 'M03' },
  { name: '橙色 (Orange)', hex: '#FF5A00', rgb: [255, 90, 0], code: 'M04' },
  { name: '黄色 (Yellow)', hex: '#F6D806', rgb: [246, 216, 6], code: 'M05' },
  { name: '绿色 (Green)', hex: '#2B6D2D', rgb: [43, 109, 45], code: 'M06' },
  { name: '蓝色 (Blue)', hex: '#1A28A7', rgb: [26, 40, 167], code: 'M07' },
  { name: '紫色 (Purple)', hex: '#4E289C', rgb: [78, 40, 156], code: 'M08' },
  { name: '粉色 (Pink)', hex: '#F05D93', rgb: [240, 93, 147], code: 'M09' },
  { name: '棕色 (Brown)', hex: '#4E2817', rgb: [78, 40, 23], code: 'M10' },
  { name: '灰色 (Grey)', hex: '#838A8F', rgb: [131, 138, 143], code: 'M11' },
  { name: '浅蓝 (Light Blue)', hex: '#4390E2', rgb: [67, 144, 226], code: 'M12' },
  { name: '浅绿 (Light Green)', hex: '#53E06C', rgb: [83, 224, 108], code: 'M13' },
  { name: '深蓝 (Dark Blue)', hex: '#161B40', rgb: [22, 27, 64], code: 'M14' },
  { name: '深绿 (Dark Green)', hex: '#1A4024', rgb: [26, 64, 36], code: 'M15' },
  { name: '沙色 (Sand)', hex: '#DDBB99', rgb: [221, 187, 153], code: 'M16' },
  { name: '肉色 (Tan)', hex: '#C2875B', rgb: [194, 135, 91], code: 'M17' },
  { name: '紫红 (Plum)', hex: '#9E2A6B', rgb: [158, 42, 107], code: 'M18' },
  { name: '车打黄 (Cheddar)', hex: '#F29913', rgb: [242, 153, 19], code: 'M19' },
  { name: '牙膏蓝 (Toothpaste)', hex: '#80C6D6', rgb: [128, 198, 214], code: 'M20' },
  { name: '淡紫 (Pastel Lavender)', hex: '#9B81BA', rgb: [155, 129, 186], code: 'M21' },
  { name: '淡黄 (Pastel Yellow)', hex: '#F5E67A', rgb: [245, 230, 122], code: 'M22' },
  { name: '淡绿 (Pastel Green)', hex: '#7BE899', rgb: [123, 232, 153], code: 'M23' },
  { name: '腮红粉 (Blush)', hex: '#F2A0B6', rgb: [242, 160, 182], code: 'M24' },
  { name: '深灰 (Dark Grey)', hex: '#4A4A4A', rgb: [74, 74, 74], code: 'M25' },
  { name: '浅灰 (Light Grey)', hex: '#C1C1C1', rgb: [193, 193, 193], code: 'M26' },
  { name: '桃红 (Peach)', hex: '#F4AFB4', rgb: [244, 175, 180], code: 'M27' },
  { name: '洋红 (Magenta)', hex: '#E51A6B', rgb: [229, 26, 107], code: 'M28' },
  { name: '樱桃红 (Cherry)', hex: '#9E1A35', rgb: [158, 26, 53], code: 'M29' },
  { name: '铁锈红 (Rust)', hex: '#8A3324', rgb: [138, 51, 36], code: 'M30' },
  { name: '浅棕 (Light Brown)', hex: '#9E6A4B', rgb: [158, 106, 75], code: 'M31' },
  { name: '卡其 (Khaki)', hex: '#9E8A5B', rgb: [158, 138, 91], code: 'M32' },
  { name: '奶油 (Cream)', hex: '#EFE5B0', rgb: [239, 229, 176], code: 'M33' },
  { name: '荧光绿 (Neon Green)', hex: '#A8E530', rgb: [168, 229, 48], code: 'M34' },
  { name: '薄荷绿 (Mint)', hex: '#42C19A', rgb: [66, 193, 154], code: 'M35' },
  { name: '青色 (Cyan)', hex: '#1A9EBA', rgb: [26, 158, 186], code: 'M36' },
  { name: '天蓝 (Sky Blue)', hex: '#5B9ECA', rgb: [91, 158, 202], code: 'M37' },
  { name: '深紫 (Dark Purple)', hex: '#351A5B', rgb: [53, 26, 91], code: 'M38' },
  { name: '薰衣草 (Lavender)', hex: '#A88ACA', rgb: [168, 138, 202], code: 'M39' }
];

function colorDistance(rgb1: [number, number, number], rgb2: [number, number, number]) {
  let rmean = (rgb1[0] + rgb2[0]) / 2;
  let r = rgb1[0] - rgb2[0];
  let g = rgb1[1] - rgb2[1];
  let b = rgb1[2] - rgb2[2];
  return Math.sqrt((((512+rmean)*r*r)>>8) + 4*g*g + (((767-rmean)*b*b)>>8));
}

export function findNearestColor(r: number, g: number, b: number): Color {
  let minDistance = Infinity;
  let nearestColor = PERLER_COLORS[0];
  
  for (const color of PERLER_COLORS) {
    const dist = colorDistance([r, g, b], color.rgb);
    if (dist < minDistance) {
      minDistance = dist;
      nearestColor = color;
    }
  }
  
  return nearestColor;
}

export interface PixelData {
  x: number;
  y: number;
  color: Color | null;
}

export interface ProcessResult {
  pixels: PixelData[];
  width: number;
  height: number;
  colorCounts: Record<string, { color: Color; count: number }>;
}

export async function processImage(
  imageUrl: string, 
  targetWidth: number,
  useDithering: boolean = true,
  useSmoothing: boolean = false
): Promise<ProcessResult> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }

      const targetHeight = Math.max(1, Math.round((img.height / img.width) * targetWidth));
      
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      
      ctx.imageSmoothingEnabled = useSmoothing;
      ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
      
      const imageData = ctx.getImageData(0, 0, targetWidth, targetHeight);
      const data = imageData.data;
      
      const pixels: PixelData[] = [];
      const colorCounts: Record<string, { color: Color; count: number }> = {};
      
      const floatData = new Float32Array(data);
      
      for (let y = 0; y < targetHeight; y++) {
        for (let x = 0; x < targetWidth; x++) {
          const i = (y * targetWidth + x) * 4;
          const r = floatData[i];
          const g = floatData[i + 1];
          const b = floatData[i + 2];
          const a = floatData[i + 3];
          
          if (a < 128) {
            pixels.push({ x, y, color: null });
            continue;
          }
          
          const clampedR = Math.min(255, Math.max(0, r));
          const clampedG = Math.min(255, Math.max(0, g));
          const clampedB = Math.min(255, Math.max(0, b));
          
          const nearest = findNearestColor(clampedR, clampedG, clampedB);
          pixels.push({ x, y, color: nearest });
          
          if (!colorCounts[nearest.hex]) {
            colorCounts[nearest.hex] = { color: nearest, count: 0 };
          }
          colorCounts[nearest.hex].count++;

          if (useDithering) {
            const errR = clampedR - nearest.rgb[0];
            const errG = clampedG - nearest.rgb[1];
            const errB = clampedB - nearest.rgb[2];

            const distributeError = (dx: number, dy: number, factor: number) => {
              const nx = x + dx;
              const ny = y + dy;
              if (nx >= 0 && nx < targetWidth && ny >= 0 && ny < targetHeight) {
                const ni = (ny * targetWidth + nx) * 4;
                floatData[ni] += errR * factor;
                floatData[ni + 1] += errG * factor;
                floatData[ni + 2] += errB * factor;
              }
            };

            distributeError(1, 0, 7 / 16);
            distributeError(-1, 1, 3 / 16);
            distributeError(0, 1, 5 / 16);
            distributeError(1, 1, 1 / 16);
          }
        }
      }
      
      resolve({
        pixels,
        width: targetWidth,
        height: targetHeight,
        colorCounts
      });
    };
    img.onerror = reject;
    img.src = imageUrl;
  });
}
