---
title: Presentation demo
published: 2026-04-19
description: Victim cache presentation demos
tags: [计算机体系结构]
category: 笔记
draft: false
---

这篇文章收集了 Victim Cache 汇报里用到的两个交互 demo，便于在 PPT 中通过超链接直接跳转。

## Demo Links

1. [Victim Cache 简单 ABAB 冲突演示](/demos/victim-abab/)
2. [Victim Cache / Direct-Mapped / 2-Way 综合交互演示](/demos/victim-mix/)

## 使用说明

- 第一个 demo 适合展示最小冲突例子：`A, B, A, B` 在同一 index 上如何 thrash。
- 第二个 demo 适合展示 `Direct-mapped`、`Direct-mapped + Victim Cache`、`2-way set associative` 的行为差异，以及 workload 对比与 VC 大小扫描。
