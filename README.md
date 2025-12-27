<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# ScriptAI - Persona Agent

一个智能视频脚本写作代理，通过分析文本和图片来管理用户角色，并基于角色风格生成针对不同平台（TikTok、YouTube、小红书等）的优化视频脚本。

## ✨ 功能特性

- **角色管理（Persona Manager）**
  - 创建和管理多个用户角色
  - 通过文本样本和图片分析角色风格
  - 提取语言特征和视觉特征
  - 角色数据本地持久化存储

- **脚本生成（Script Generator）**
  - 基于角色风格生成平台特定的视频脚本
  - 支持多平台：TikTok、YouTube、小红书（RedNote）、Bilibili 等
  - 智能优化：Hook、CTA、结构化内容
  - 提供视觉/表演建议、标题选项、标签推荐

## 🛠️ 技术栈

- **前端框架**: React 19.2.3
- **构建工具**: Vite 6.2.0
- **语言**: TypeScript 5.8.2
- **AI 服务**: Google Gemini API (@google/genai)
- **UI 组件**: Tailwind CSS（CDN）
- **图标**: Lucide React
- **Markdown 渲染**: React Markdown

## 📋 前置要求

- Node.js 18+ （推荐 20+）
- npm 或 yarn 或 pnpm
- Google Gemini API Key

## 🚀 快速开始

### 1. 克隆项目

```bash
git clone <repository-url>
cd ScriptAI
```

### 2. 安装依赖

```bash
npm install
```

### 3. 配置环境变量

在项目根目录创建 `.env.local` 文件：

```env
GEMINI_API_KEY=your_gemini_api_key_here
```

> **注意**: `.env.local` 文件已添加到 `.gitignore`，不会被提交到版本控制。

### 4. 启动开发服务器

```bash
npm run dev
```

应用将在 `http://localhost:3000` 启动。

### 5. 构建生产版本

```bash
npm run build
```

构建产物将输出到 `dist` 目录。

### 6. 预览生产构建

```bash
npm run preview
```

## 📜 可用脚本

- `npm run dev` - 启动开发服务器
- `npm run build` - 构建生产版本
- `npm run preview` - 预览生产构建
- `npm run lint` - 运行 ESLint 代码检查
- `npm run type-check` - TypeScript 类型检查（不生成文件）

## 🚀 部署指南

本项目支持通过 GitHub Actions 自动部署到多个平台。

### 方式一：部署到 GitHub Pages

#### 1. 启用 GitHub Pages

1. 进入仓库的 Settings → Pages
2. 在 "Source" 中选择 "GitHub Actions"
3. 保存设置

#### 2. 配置 Secrets

在仓库的 Settings → Secrets and variables → Actions 中添加：

- `GEMINI_API_KEY`: 你的 Gemini API Key

#### 3. 触发部署

推送代码到 `main` 或 `master` 分支，GitHub Actions 会自动构建并部署。

部署工作流文件：`.github/workflows/deploy.yml`

#### 4. 访问应用

部署完成后，应用将在 `https://<username>.github.io/<repository-name>` 可用。

### 方式二：部署到 Vercel

#### 1. 安装 Vercel CLI（本地）

```bash
npm install -g vercel
```

#### 2. 登录 Vercel

```bash
vercel login
```

#### 3. 配置 Secrets

在仓库的 Settings → Secrets and variables → Actions 中添加：

- `VERCEL_TOKEN`: 你的 Vercel Token（在 Vercel Dashboard → Settings → Tokens 创建）
- `GEMINI_API_KEY`: 你的 Gemini API Key

#### 4. 触发部署

推送代码到 `main` 或 `master` 分支，GitHub Actions 会自动部署到 Vercel。

部署工作流文件：`.github/workflows/deploy-vercel.yml`

#### 5. 在 Vercel 中配置环境变量

在 Vercel 项目设置中添加环境变量 `GEMINI_API_KEY`。

### 手动部署到其他平台

#### Netlify

1. 在 Netlify 中导入项目
2. 构建命令：`npm run build`
3. 发布目录：`dist`
4. 添加环境变量 `GEMINI_API_KEY`

#### Vercel（通过 Dashboard）

1. 在 Vercel Dashboard 中导入项目
2. Framework Preset：Vite
3. 添加环境变量 `GEMINI_API_KEY`
4. 部署

## 📁 项目结构

```
ScriptAI/
├── .github/
│   └── workflows/          # GitHub Actions 工作流
│       ├── deploy.yml      # GitHub Pages 部署
│       └── deploy-vercel.yml  # Vercel 部署
├── components/             # React 组件
│   ├── Layout.tsx         # 布局组件
│   ├── PersonaManager.tsx # 角色管理组件
│   └── ScriptGenerator.tsx # 脚本生成组件
├── services/               # 服务层
│   └── geminiService.ts   # Gemini API 服务
├── App.tsx                # 主应用组件
├── index.tsx              # 入口文件
├── index.html             # HTML 模板
├── types.ts               # TypeScript 类型定义
├── vite.config.ts         # Vite 配置
├── tsconfig.json          # TypeScript 配置
├── package.json           # 项目依赖和脚本
├── .gitignore            # Git 忽略文件
└── README.md             # 项目文档
```

## 🔧 配置说明

### Vite 配置

项目使用 Vite 作为构建工具，配置了：

- React 插件
- 路径别名 `@` 指向项目根目录
- 环境变量注入
- 开发服务器端口：3000

### TypeScript 配置

- 目标：ES2022
- JSX：react-jsx
- 模块解析：bundler
- 路径别名支持

## 🔒 安全注意事项

1. **API Key 保护**
   - 永远不要将 API Key 提交到版本控制
   - 使用环境变量管理敏感信息
   - `.env.local` 已添加到 `.gitignore`

2. **环境变量**
   - 开发环境：使用 `.env.local`
   - 生产环境：在部署平台配置环境变量

## 📝 开发说明

### 代码规范

项目配置了 ESLint 进行代码检查：

```bash
npm run lint
```

### 类型检查

运行 TypeScript 类型检查：

```bash
npm run type-check
```

## 🐛 故障排除

### 构建失败

1. 确保 Node.js 版本 >= 18
2. 删除 `node_modules` 和 `package-lock.json`，重新安装：
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

### API 调用失败

1. 检查 `GEMINI_API_KEY` 是否正确配置
2. 确认 API Key 有效且有足够的配额
3. 检查网络连接

### 环境变量未生效

1. 确保 `.env.local` 文件在项目根目录
2. 重启开发服务器
3. 检查变量名是否正确（应为 `GEMINI_API_KEY`）

## 📄 许可证

本项目为私有项目。

## 🔗 相关链接

- [Google Gemini API 文档](https://ai.google.dev/)
- [React 文档](https://react.dev/)
- [Vite 文档](https://vitejs.dev/)
- [TypeScript 文档](https://www.typescriptlang.org/)

---

**注意**: 首次部署前，请确保：

1. ✅ 已安装所有依赖 (`npm install`)
2. ✅ 已配置环境变量（`.env.local` 或平台环境变量）
3. ✅ 已配置 GitHub Secrets（如使用 GitHub Actions）
4. ✅ 已测试本地构建 (`npm run build`)
