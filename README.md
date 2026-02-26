<div align="center">

![拼豆图纸生成器](https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6)

# 拼豆图纸生成器

**Perler Beads Pattern Generator**

一个基于 React + TypeScript 的拼豆图纸设计工具，支持图片转换与 AI 生成

[功能特性](#-功能特性) • [快速开始](#-快速开始) • [使用说明](#-使用说明) • [技术架构](#-技术架构)

</div>

---

## 📖 项目简介

拼豆图纸生成器是一款专为拼豆爱好者设计的工具，可以将任意图片或使用 AI 生成的创意图片转换为拼豆图纸，自动计算所需珠子数量和颜色搭配。

## ✨ 功能特性

### 🖼️ 图片上传与转换
- 支持上传本地图片文件
- 自动转换为拼豆图纸
- 支持 39 种标准 Perler 珠子颜色
- 保持原始图片宽高比例

### 🎨 AI 图片生成
- 集成阿里云通义万相 `qwen-image-plus` 模型
- 输入文字描述即可生成卡通/动漫风格图片
- 自动优化为适合拼豆的图案风格
- 生成的图片本地持久化存储

### ⚙️ 自定义设置
| 选项 | 说明 |
|------|------|
| 拼豆板宽度 | 5-200 颗粒可调，自动计算高度比例 |
| 显示网格 | 开启/关闭网格辅助线 |
| 色彩抖动 | Floyd-Steinberg 抖动算法，颜色过渡更自然 |
| 边缘平滑 | 控制图像缩放时的插值算法，适合像素画原图 |
| 优化材料 | 自动合并使用量<1% 的颜色，减少材料种类 |

### 📋 材料清单
- 自动统计每种颜色的珠子数量
- 显示 Mard 色号对照
- 实时计算总珠子数

### 🖼️ 图片画廊
- IndexedDB + 本地文件系统双重存储
- 历史记录持久化，刷新页面不丢失
- 支持单张删除和批量清空
- 显示生成时间和提示词

### 📤 图纸导出
- 支持 PNG 格式下载
- 保留网格线设置
- 自动命名包含尺寸信息

## 🚀 快速开始

### 前置要求

- **Node.js** >= 18.0
- **Python** >= 3.8（仅 AI 生成功能需要）
- **npm** 或 **pnpm**

### 1. 克隆项目

```bash
git clone <repository-url>
cd Pindou
```

### 2. 安装依赖

```bash
npm install
```

### 3. 配置 API 密钥（AI 生成功能可选）

编辑 `.env` 文件：

```bash
VITE_DASHSCOPE_API_KEY="your_api_key_here"
```

> 获取 API Key: https://dashscope.console.aliyun.com/apiKey

### 4. 启动代理服务器（AI 生成功能必需）

```bash
node proxy-server.js
```

### 5. 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:3000/

### 生产构建

```bash
npm run build
npm run preview
```

## 📋 使用说明

### 上传转换图片
1. 点击左侧"上传图片"区域
2. 选择本地图片文件
3. 调整拼豆板宽度滑块
4. 根据需要开启/关闭各项设置
5. 系统自动生成图纸和材料清单

### AI 生成图片
1. 在"AI 图片生成"区域输入描述
2. 点击"生成图片"按钮
3. 等待 AI 生成并自动保存到画廊
4. 点击图片即可生成图纸

### 使用历史图片
1. 滚动到页面底部画廊
2. 点击任意历史图片
3. 自动加载并生成图纸

## 🏗️ 技术架构

### 技术栈

| 层级 | 技术 |
|------|------|
| 前端框架 | React 19 + TypeScript |
| 构建工具 | Vite 6 |
| 样式方案 | Tailwind CSS 4 |
| 图标库 | Lucide React |
| 动画库 | Motion |
| AI 服务 | 阿里云百炼 (DashScope) |
| 代理服务器 | Express (Node.js) |
| 图片处理 | Python DashScope SDK |
| 数据存储 | IndexedDB + 本地文件系统 |

### 项目结构

```
Pindou/
├── src/
│   ├── App.tsx                 # 主应用组件
│   ├── main.tsx                # 入口文件
│   ├── components/
│   │   ├── ImageUploader.tsx   # 图片上传组件
│   │   ├── PixelCanvas.tsx     # 图纸画布组件
│   │   ├── MaterialsList.tsx   # 材料清单组件
│   │   └── Gallery.tsx         # 图片画廊组件
│   └── utils/
│       ├── imageProcessing.ts  # 图片处理算法
│       └── imageCache.ts       # 图片缓存工具
├── public/
│   └── gallery/                # AI 生成图片存储目录
├── proxy-server.js             # API 代理服务器
├── package.json
└── README.md
```

### 核心算法

**颜色匹配算法**
- 使用加权欧几里得距离公式
- 考虑人眼对不同颜色敏感度差异
- 支持 Floyd-Steinberg 抖动算法

**颜色优化算法**
- 自动识别使用量 <1% 的次要颜色
- 合并到最接近的主要颜色
- 减少材料采购种类

## ⚠️ 注意事项

1. **AI 生成功能**必须启动代理服务器 (`node proxy-server.js`)
2. **代理服务器**依赖 Python DashScope SDK
3. **图片存储**位于 `public/gallery` 目录
4. **浏览器存储**受 IndexedDB 容量限制（通常 50MB-1GB）
5. **拼豆板宽度**默认 50 颗粒，范围 5-200

## 📦 构建与部署

### 本地预览生产构建

```bash
npm run build
npm run preview
```

### 部署到服务器

1. 执行 `npm run build` 生成 `dist/` 目录
2. 将 `dist/` 和 `proxy-server.js`、`public/` 上传到服务器
3. 配置 Nginx 或 Apache 指向 `dist/` 目录
4. 使用 PM2 等工具管理 `proxy-server.js` 进程

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License

## 🔗 相关链接

- [阿里云百炼控制台](https://dashscope.console.aliyun.com/apiKey)
- [React 官方文档](https://react.dev/)
- [Tailwind CSS 文档](https://tailwindcss.com/)
- [通义万相 API 文档](https://help.aliyun.com/zh/dashscope/)

---

<div align="center">

**拼豆图纸生成器** © 2024

Made with ❤️ for Perler Beads Artists

</div>
