---
title: 服务器使用笔记：tmux 与 Git 基础工作流
published: 2026-01-22
description: 我在服务器上的日常：登录、数据存储规范、tmux 、Git 远程绑定与常用操作。
tags: [服务器, 工具]
image: ./Lazysheep3.jpg
category: 科研
draft: false
---

这篇笔记主要是给自己看的随手查，用于记录一些零散的简单操作

---

## 核心原则

最重要的规则只有一条：

> **所有需要长期保留的数据，只放在 `/root` 和 `/share`。**

因为这两个目录是容器里**唯二**挂载到宿主机数据盘的位置；其它目录不能保证持久性，重建容器时至少会丢失。

---

## 关于宿主机菜单与重建容器

宿主机对普通用户屏蔽了 shell，登录后只看到菜单选项。
其中“重建私⼈容器”非常危险：重建后 **`/root`、`/share` 之外内容会重置，所有非系统进程会终止**。

---

## tmux

> 目标：SSH 断开/电脑合盖/网络波动，都不影响训练继续跑。

### 安装

```bash
apt-get update && apt-get install -y tmux
```

### 会话操作

```bash
tmux new -s work          # 新建会话 work
tmux ls                   # 列出会话
tmux attach -t work       # 进入会话
tmux detach               # 脱离会话
tmux kill-session -t work # 结束会话
```

### 快捷键

* `Ctrl+b d`：detach（离开会话，任务继续跑）
* `Ctrl+b c`：新建窗口（window）
* `Ctrl+b n / p`：下一个/上一个窗口
* `Ctrl+b ,`：重命名窗口
* `Ctrl+b %`：左右分屏（pane）
* `Ctrl+b "`：上下分屏
* `Ctrl+b o`：在 pane 间切换
* `Ctrl+b x`：关闭当前 pane
* `Ctrl+b [`：进入复制/滚动模式（看历史输出），按 `q` 退出

> [!TIP]
> 我常用的组合：`tmux new -s proj` → 一个窗口跑训练，一个窗口看日志（`tail -f`），一个窗口做 git/小改动。

---

## Git：远程绑定与基础操作

这一部分目标是：
**在服务器上 clone / 修改 / 提交 / 推送 / 同步别人更新** 都能无脑操作。

---

### 1）远程绑定（remote add / set-url）

先看当前远程：

```bash
git remote -v
```

#### 情况 A：本地已有代码，想推到远程（新仓库）

```bash
git init
git add -A
git commit -m "init"

git remote add origin <REMOTE_URL>
git branch -M main
git push -u origin main
```

#### 情况 B：已经有 origin，但要换远程地址

```bash
git remote set-url origin <NEW_REMOTE_URL>
git remote -v
```

---

### 2）最常用命令清单

#### 查看状态/差异

```bash
git status
git diff
git diff --staged
git log --oneline --decorate -n 20
```

#### 提交

```bash
git add -A
git commit -m "your message"
```

#### 新建分支并推送

```bash
git checkout -b feat-xxx
git push -u origin feat-xxx
```

#### 拉取远程更新

```bash
git fetch origin
git pull --rebase
```

---

### 3）同步某个分支的更新

假设你本地在 `train-time-implement`，有人也在这个分支更新了：

```bash
git checkout train-time-implement
git fetch origin
git pull --rebase origin train-time-implement
```

如果你在别的分支，但想把对方分支的更新合并进来：

```bash
git fetch origin
git merge origin/train-time-implement
# 或者：
# git rebase origin/train-time-implement
```

