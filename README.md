# 个人网站（纯静态版）

一个纯静态的个人网站，完全托管在 GitHub Pages。支持标签分类、站内搜索和 AI 助手。

## 功能

- **欢迎页**：全屏进入页，标题/副标题/描述/按钮文字可编辑
- **个人简介**：左侧头像、名字、简介、链接，可编辑
- **标签导航**：内容按标签展示，标签可增删
- **文章 / 作品 / 分析**：Markdown 写作，支持代码块、图片、引用
- **站内搜索**：右上角搜索框，纯前端全文检索（Fuse.js）
- **AI 助手**：右下角助手，可自定义头像（透明底图原样显示）与人格；本地检索站内内容 + Cloudflare Worker 代理 DeepSeek，支持联网搜索（可选，未配置则降级为站内问答）
- **本地图形管理**：浏览器里编辑内容，保存成文件，`git push` 即上线

## 技术栈

- React + Vite + TypeScript
- Fuse.js（全文搜索）
- gray-matter（Markdown frontmatter 解析）
- Cloudflare Worker（可选，AI 代理）

## 目录结构

```
personal-site/
├── content/               # 网站内容（你主要编辑这里）
│   ├── config.json        # 欢迎页 / 简介 / 标签
│   └── posts/             # 文章，每篇一个 .md 文件
├── frontend/              # 站点源码
│   ├── src/               # 页面、组件、数据
│   └── scripts/           # 构建脚本 + 本地管理工具
├── worker/                # Cloudflare Worker（AI 代理，可选）
├── .github/workflows/     # 自动部署到 GitHub Pages
└── README.md
```

## 快速开始（本地预览）

```bash
cd frontend
npm install
npm run dev        # http://localhost:5173
```

## 本地管理工具（改内容）

```bash
cd frontend
npm run admin      # 打开 http://localhost:3456
```

在浏览器里编辑欢迎页、简介、标签、内容，点「保存」后，改动写入 `content/` 目录。之后回到项目根目录：

```bash
git add . && git commit -m "更新内容" && git push
```

推送到 GitHub 后，Actions 会自动重新构建并发布。

## 部署到 GitHub Pages

1. 在 GitHub 新建一个仓库，把本项目推上去：

```bash
git init
git add .
git commit -m "init"
git branch -M main
git remote add origin https://github.com/你的用户名/仓库名.git
git push -u origin main
```

2. 打开仓库 **Settings → Pages**，把 **Source** 选为 **GitHub Actions**。

3. 之后每次 push 到 `main`，`.github/workflows/deploy.yml` 会自动构建并发布。站点地址为：

```
https://你的用户名.github.io/仓库名/
```

> 站点使用 HashRouter，地址形如 `https://用户名.github.io/仓库名/#/home`，刷新不会 404，无需额外配置。

## AI 助手配置（可选）

不配置也能用——助手会降级为「站内问答」（本地全文检索，告诉你相关文章）。要接入真实 AI 对话，需要两步：

**1. 部署 Cloudflare Worker**

```bash
cd worker
npm install -g wrangler        # 首次需登录：wrangler login
wrangler deploy                # 得到类似 https://xxx.workers.dev 的地址
wrangler secret put DEEPSEEK_API_KEY   # 粘贴你的 DeepSeek Key
wrangler secret put TAVILY_API_KEY      # 可选：粘贴 Tavily Key，开启联网搜索
```

> 联网搜索用 [Tavily](https://tavily.com)（专为 AI 设计的搜索 API，有免费额度）。不配 `TAVILY_API_KEY` 也能用，只是助手不会联网搜索。

**2. 把 Worker 地址告诉前端**

在 GitHub 仓库 **Settings → Secrets and variables → Actions** 里新增一个 secret：

- 名称：`VITE_ASSISTANT_URL`
- 值：`https://xxx.workers.dev`（你的 Worker 地址）

保存后重新触发一次部署即可。

## 内容格式

### config.json

```json
{
  "welcome": { "title": "…", "subtitle": "…", "description": "…", "button_text": "进入" },
  "profile": { "name": "…", "bio": "…", "avatar": "", "links": [{ "label": "GitHub", "url": "…" }] },
  "tags": ["文章", "作品", "分析"],
  "assistant": { "name": "小助手", "image": "", "persona": "助手的人格设定……" }
}
```

### 文章（content/posts/xxx.md）

```markdown
---
type: article          # article / project / analysis
title: 标题
summary: 摘要
cover: ""              # 封面图 URL，可留空
tags:
  - 文章
published: true        # false 表示草稿，不会出现在站点
date: 2026-09-02
---

正文（Markdown）……
```
