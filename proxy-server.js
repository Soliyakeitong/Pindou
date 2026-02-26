// 通义万相图片生成 API 代理服务器 - 使用 Python SDK 方式
import express from 'express';
import cors from 'cors';
import { spawn } from 'child_process';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import https from 'https';
import http from 'http';
import os from 'os';

dotenv.config();

const app = express();
const PORT = 3001;
const HOST = '0.0.0.0'; // 监听所有网络接口，支持局域网访问

// 获取本机 IP 地址
function getLocalIP() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost';
}

// 获取 __dirname（ES module 中需要手动获取）
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 画廊图片存储目录
const GALLERY_DIR = path.join(__dirname, 'public', 'gallery');

// 确保画廊目录存在
if (!fs.existsSync(GALLERY_DIR)) {
  fs.mkdirSync(GALLERY_DIR, { recursive: true });
}

app.use(cors());
app.use(express.json());

// 下载并保存图片
function downloadImage(url, destPath) {
  return new Promise((resolve, reject) => {
    // 选择 http 或 https 模块
    const client = url.startsWith('https') ? https : http;

    const file = fs.createWriteStream(destPath);

    client.get(url, (response) => {
      if (response.statusCode === 302 || response.statusCode === 301) {
        // 处理重定向
        downloadImage(response.headers.location, destPath)
          .then(resolve)
          .catch(reject);
        return;
      }

      if (response.statusCode !== 200) {
        reject(new Error(`请求失败：${response.statusCode}`));
        return;
      }

      response.pipe(file);

      file.on('finish', () => {
        file.close();
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(destPath, () => {}); // 删除失败的文件
      reject(err);
    });
  });
}

// 保存图片到本地并返回本地路径
app.post('/api/save-image', async (req, res) => {
  try {
    const { url, prompt } = req.body;

    if (!url) {
      return res.status(400).json({ error: '缺少图片 URL' });
    }

    // 生成唯一文件名
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(7);
    const ext = url.split('.').pop() || 'jpg';
    const filename = `image_${timestamp}_${randomStr}.${ext}`;
    const filepath = path.join(GALLERY_DIR, filename);

    // 下载并保存图片
    await downloadImage(url, filepath);

    // 返回完整的访问 URL（支持局域网）
    const serverUrl = `http://${getLocalIP()}:${PORT}`;
    const localUrl = `${serverUrl}/gallery/${filename}`;

    res.json({
      success: true,
      localUrl,
      filename
    });
  } catch (error) {
    console.error('保存图片失败:', error);
    res.status(500).json({ error: '保存图片失败' });
  }
});

// 获取所有画廊图片
app.get('/api/gallery-images', async (req, res) => {
  try {
    if (!fs.existsSync(GALLERY_DIR)) {
      return res.json([]);
    }

    const serverUrl = `http://${getLocalIP()}:${PORT}`;
    const files = fs.readdirSync(GALLERY_DIR)
      .filter(file => /\.(jpg|jpeg|png|gif|webp)$/.test(file))
      .map(file => {
        const filepath = path.join(GALLERY_DIR, file);
        const stats = fs.statSync(filepath);
        return {
          filename: file,
          url: `${serverUrl}/gallery/${file}`,
          timestamp: stats.mtimeMs,
          size: stats.size
        };
      })
      .sort((a, b) => b.timestamp - a.timestamp);

    res.json(files);
  } catch (error) {
    console.error('获取画廊图片失败:', error);
    res.status(500).json({ error: '获取画廊图片失败' });
  }
});

// 删除画廊图片
app.delete('/api/gallery-images/:filename', async (req, res) => {
  try {
    const { filename } = req.params;
    const filepath = path.join(GALLERY_DIR, filename);

    if (fs.existsSync(filepath)) {
      fs.unlinkSync(filepath);
      res.json({ success: true });
    } else {
      res.status(404).json({ error: '文件不存在' });
    }
  } catch (error) {
    console.error('删除图片失败:', error);
    res.status(500).json({ error: '删除图片失败' });
  }
});

// 清空画廊
app.delete('/api/gallery-all', async (req, res) => {
  try {
    if (fs.existsSync(GALLERY_DIR)) {
      const files = fs.readdirSync(GALLERY_DIR);
      files.forEach(file => {
        const filepath = path.join(GALLERY_DIR, file);
        if (fs.statSync(filepath).isFile()) {
          fs.unlinkSync(filepath);
        }
      });
      res.json({ success: true });
    } else {
      res.json({ success: true });
    }
  } catch (error) {
    console.error('清空画廊失败:', error);
    res.status(500).json({ error: '清空画廊失败' });
  }
});

// 创建任务接口 - 使用 Python SDK
app.post('/api/tasks', async (req, res) => {
  try {
    const { model, input, parameters, task = 'text2image' } = req.body;
    const apiKey = process.env.VITE_DASHSCOPE_API_KEY || '';

    if (!apiKey) {
      return res.status(500).json({ error: 'API Key 未配置' });
    }

    // 使用 Python SDK 调用
    const pythonCode = `
import dashscope
from dashscope import ImageSynthesis
import json

dashscope.api_key = '${apiKey}'

rsp = ImageSynthesis.call(
    model='${model}',
    prompt='${input.prompt}',
    size='${parameters.size}',
    n=1
)

result = {
    'status_code': rsp.status_code,
    'request_id': rsp.request_id,
    'output': {
        'task_id': rsp.output.get('task_id') if rsp.output else None,
        'task_status': rsp.output.get('task_status') if rsp.output else None,
        'results': [{'url': r.url} for r in rsp.output.get('results', [])] if rsp.output and rsp.output.get('results') else []
    }
}
print(json.dumps(result))
`;

    const python = spawn('python3', ['-c', pythonCode]);

    let output = '';
    python.stdout.on('data', (data) => {
      output += data.toString();
    });

    python.stderr.on('data', (data) => {
      console.error('Python error:', data.toString());
    });

    python.on('close', async (code) => {
      if (code === 0) {
        try {
          const result = JSON.parse(output.trim());

          // 如果图片生成成功，下载并保存到本地
          if (result.status_code === 200 && result.output?.results?.[0]?.url) {
            const imageUrl = result.output.results[0].url;

            // 下载并保存图片到本地
            try {
              const timestamp = Date.now();
              const randomStr = Math.random().toString(36).substring(7);
              const filename = `image_${timestamp}_${randomStr}.png`;
              const filepath = path.join(GALLERY_DIR, filename);

              await downloadImage(imageUrl, filepath);
              // 返回完整的服务器 URL（支持局域网访问）
              const serverUrl = `http://${getLocalIP()}:${PORT}`;
              const localUrl = `${serverUrl}/gallery/${filename}`;
              result.output.results[0].url = localUrl;
              result.output.results[0].localPath = localUrl;
              result.output.results[0].filename = filename;
            } catch (downloadError) {
              console.error('下载图片失败:', downloadError);
              // 下载失败，保留原始 URL
            }
          }

          res.json(result);
        } catch (e) {
          res.status(500).json({ error: 'Failed to parse Python output' });
        }
      } else {
        res.status(500).json({ error: `Python process exited with code ${code}` });
      }
    });

  } catch (error) {
    res.status(500).json({ error: '服务器错误' });
  }
});

// 提供画廊图片的静态访问
app.use('/gallery', express.static(GALLERY_DIR));

// 轮询任务状态接口 - 简化版本，直接返回缓存的结果
app.get('/api/tasks/:taskId', async (req, res) => {
  // 由于使用 Python SDK 同步调用，不需要轮询
  res.json({ output: { task_status: 'SUCCEEDED' } });
});

app.listen(PORT, HOST, () => {
  const localIP = getLocalIP();
  const serverUrl = `http://${localIP}:${PORT}`;

  console.log(`AI 代理服务器运行在 http://localhost:${PORT}`);
  console.log(`局域网访问地址：http://${localIP}:${PORT}`);
  console.log(`创建设备：POST /api/tasks`);
  console.log(`查询状态：GET /api/tasks/:taskId`);
  console.log(`画廊图片：GET /gallery/:filename`);

  // 将服务器地址存储到全局变量，供 API 接口使用
  app.set('serverUrl', serverUrl);
});
