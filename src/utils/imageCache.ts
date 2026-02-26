// 图片缓存工具 - 使用本地文件系统存储（通过代理服务器）

// 自动检测 API 地址：如果是局域网访问，使用当前 host；否则使用 localhost
function getApiBase(): string {
  // 在浏览器环境中，检查当前页面的 host
  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    // 如果是 localhost，则代理服务器也在 localhost
    if (host === 'localhost' || host === '127.0.0.1') {
      return 'http://localhost:3001';
    }
    // 否则使用当前 host（局域网 IP）
    return `http://${host}:3001`;
  }
  return 'http://localhost:3001';
}

const API_BASE = getApiBase();

// 图片缓存元数据接口
export interface CachedImage {
  url: string;
  filename: string;
  timestamp: number;
  prompt?: string;
}

// 获取所有缓存的图片列表
export async function getCachedImageList(): Promise<CachedImage[]> {
  try {
    const response = await fetch(`${API_BASE}/api/gallery-images`);
    if (!response.ok) {
      return [];
    }
    const data = await response.json();
    return data.map((item: any) => ({
      url: item.url,
      filename: item.filename,
      timestamp: item.timestamp,
      prompt: item.prompt
    }));
  } catch (error) {
    console.error('获取画廊图片失败:', error);
    return [];
  }
}

// 删除缓存图片
export async function deleteCachedImage(filename: string): Promise<void> {
  try {
    const response = await fetch(`${API_BASE}/api/gallery-images/${filename}`, {
      method: 'DELETE'
    });
    if (!response.ok) {
      throw new Error('删除失败');
    }
  } catch (error) {
    console.error('删除缓存图片失败:', error);
  }
}

// 清除所有缓存
export async function clearAllCache(): Promise<void> {
  try {
    const response = await fetch(`${API_BASE}/api/gallery-all`, {
      method: 'DELETE'
    });
    if (!response.ok) {
      throw new Error('清除失败');
    }
  } catch (error) {
    console.error('清除缓存失败:', error);
  }
}

// 保存生成的图片到本地画廊
export async function saveGeneratedImage(url: string, prompt?: string): Promise<string> {
  try {
    const response = await fetch(`${API_BASE}/api/save-image`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ url, prompt })
    });

    if (!response.ok) {
      throw new Error('保存图片失败');
    }

    const data = await response.json();
    return data.localUrl;
  } catch (error) {
    console.error('保存图片失败:', error);
    return url;
  }
}

// 兼容旧代码的函数
export async function fetchAndCacheImage(url: string, prompt?: string): Promise<string> {
  return url;
}

export async function addGalleryImage(url: string, prompt?: string): Promise<string> {
  return saveGeneratedImage(url, prompt);
}

export async function isImageCached(url: string): Promise<boolean> {
  return false;
}

export async function getCachedImage(url: string): Promise<string | null> {
  return null;
}
