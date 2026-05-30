# CLAUDE.md

本仓库是 Lazysheep 的个人博客 + 课程笔记仓库，基于 [Fuwari](https://github.com/saicaca/fuwari) 模板（Astro + Svelte + Tailwind），通过 Vercel 部署到 `https://www.lazysheep2031.top/`。

默认使用中文与用户交流。

## 项目结构

- `src/content/posts/` — 所有博客/笔记 Markdown，一个子目录对应一门课程或一个主题：
  - `AI_fundamention/`、`CA/`、`CS106L/`、`DS/`、`German/`、`Medical_AI/`、`MicroE/`、`ODE/`、`Paper/`、`Server_Note/`、`oop/`
  - 顶层 `draft.md` 是草稿样例。
- `src/content/spec/about.md` — About 页内容。
- `src/content/config.ts` — Astro Content Collections schema。
- `src/config.ts` — 站点配置（标题、导航栏、头像、license 等）。
- `src/pages/` — Astro 路由（首页、archive、courses、about、posts、rss、robots）。
- `src/components/`、`src/layouts/`、`src/styles/`、`src/utils/`、`src/plugins/`、`src/i18n/`、`src/constants/`、`src/types/` — 主题代码，**通常不需要改**。
- `src/assets/images/` — 头像与 banner 图。当前用到的是 `avatar.jpg`、`banner3.jpg`、`banner4.png`。
- `public/favicon/` — favicon 资源。
- `public/demos/` — `victim-abab/`、`victim-mix/` 是 CA 课某次汇报用的交互 demo，被 `src/content/posts/CA/presentation-demo.md` 引用。
- `scripts/new-post.js` — `pnpm new-post <filename>` 调用，生成新笔记骨架。
- `astro.config.mjs` — Astro 构建配置（remark/rehype 插件、expressive-code、sitemap 等）。
- `vercel.json` — Vercel 部署配置（当前为空）。
- `.github/workflows/` — `biome.yml`（lint）+ `build.yml`（Astro check & build）CI。

## 本地写笔记 / 调试 / 部署

包管理器固定使用 **pnpm**（`preinstall` 钩子用 `only-allow pnpm` 拦截了 npm/yarn）。

| 命令 | 作用 |
| --- | --- |
| `pnpm install` | 安装依赖 |
| `pnpm dev` | 本地开发服务器 `localhost:4321` |
| `pnpm build` | 生产构建到 `dist/` 并跑 `pagefind` 建索引 |
| `pnpm preview` | 本地预览生产构建 |
| `pnpm check` | `astro check`，类型与诊断 |
| `pnpm format` / `pnpm lint` | Biome 格式化 / 检查 |
| `pnpm new-post <path>` | 在 `src/content/posts/<path>.md` 新建带 frontmatter 的笔记 |

部署：push 到 `main` → Vercel 自动构建并发布到 `lazysheep2031.top`。

## 笔记 frontmatter 规范

```yaml
---
title: 标题
published: 2025-05-01
description: 一句话描述
image: ''            # 可选封面，相对 .md 所在目录
tags: [Tag1, Tag2]
category: 课程名 / 科研 / ...
draft: false
lang: ''             # 仅当语言与站点 zh_CN 不同才填
---
```

导航栏的「课程笔记」`/courses/` 和「科研」`/archive/?category=科研` 都是按 `category` 做的筛选，新增笔记要保证 category 正确。

## 写作 / 协作约定

- **默认中文**回复与文档。
- 课程笔记目标：精炼、覆盖全部知识点、保留 LaTeX 公式与代码示例；不编造内容。
- 编辑现有文件前，先说明改动并征求确认；不要顺手「优化」无关代码或注释。
- 不要主动修改：`.git/`、`.github/`、`pnpm-lock.yaml`、`vercel.json`、`astro.config.mjs`、`tailwind.config.cjs`、主题组件（`src/components`、`src/layouts`、`src/styles`、`src/plugins`），除非用户明确要求。
- 不要主动执行部署相关命令（push、`vercel deploy` 等），除非用户明确要求。
- 删除文件前必须先列出清单并等用户确认。

## 本地非追踪文件

`.gitignore` 显式排除（仅本地使用）：
- `note_requests/` — 笔记生成请求模板与素材。
- `AGENTS.md` — 给 Hermes/Codex 之类 agent 的工作规则。

这些文件**不会进入 git 历史**，写脚本/工具时不要假设它们存在于线上仓库。

## 已知遗留

- 仓库源自 Fuwari 模板，因此 `LICENSE`、`src/components/Footer.astro` 中保留了对 saicaca/fuwari 的署名 — 这是模板的 MIT 要求，**不要删除**。
- 仓库中的笔记内容采用 `src/config.ts` 里设置的 `CC BY-NC-SA 4.0`。
