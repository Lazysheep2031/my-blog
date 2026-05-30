# my-blog

Lazysheep 的个人博客与课程笔记仓库，部署在 **<https://www.lazysheep2031.top/>**。

基于 [Fuwari](https://github.com/saicaca/fuwari) 模板（Astro + Svelte + Tailwind），通过 push 到 `main` 自动触发 Vercel 构建上线。

## 内容

博客内容全部位于 `src/content/posts/`，按课程或主题分文件夹组织。当前包含：

- 课程笔记：`AI_fundamention/`、`CA/`、`CS106L/`、`DS/`、`MicroE/`、`ODE/`、`oop/`、`German/`
- 科研 / 其他：`Medical_AI/`、`Paper/`、`Server_Note/`

About 页内容在 `src/content/spec/about.md`，站点配置（标题、导航、头像、license）在 `src/config.ts`。

## 本地开发

需要 **Node.js ≥ 20** 与 **pnpm ≥ 9**（仓库通过 `preinstall` 钩子强制使用 pnpm）。

```bash
pnpm install
pnpm dev               # http://localhost:4321
pnpm build             # 生产构建到 dist/，并由 pagefind 建立搜索索引
pnpm preview           # 预览生产构建
pnpm check             # astro check
pnpm format            # biome 格式化
pnpm new-post <path>   # 在 src/content/posts/<path>.md 创建新笔记
```

## 写新笔记

直接在 `src/content/posts/<分类>/` 下新建 `.md`，或用 `pnpm new-post <分类>/<标题>` 生成骨架，frontmatter 模板：

```yaml
---
title: 标题
published: 2025-05-01
description: 一句话描述
image: ''
tags: [Tag1, Tag2]
category: 课程名 / 科研 / ...
draft: false
lang: ''
---
```

导航栏的「课程笔记」与「科研」分别按 `category=课程笔记 / 科研` 筛选 archive，新增笔记时请保证 `category` 正确，否则不会出现在对应入口。

## 部署

`main` 分支 push 后由 Vercel 自动构建并发布；站点域名 `lazysheep2031.top`。

## 致谢与许可

- 主题：[Fuwari](https://github.com/saicaca/fuwari) by @saicaca，MIT 协议，许可证文件保留在 [`LICENSE`](./LICENSE)。
- 笔记内容采用 [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/)。
