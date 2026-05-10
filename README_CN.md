<div align="center">

# petdex-cc

**Claude Code 桌面宠物伴侣**

*住在屏幕上的动画宠物，实时响应你的每一次编码操作*

[![npm version](https://img.shields.io/badge/version-0.1.1-8b5cf6?style=flat-square)](https://www.npmjs.com/package/petdex-cc)
[![platform](https://img.shields.io/badge/platform-Windows%20%7C%20macOS%20%7C%20Linux-0ea5e9?style=flat-square)]()
[![node](https://img.shields.io/badge/node-%3E%3D18-22c55e?style=flat-square)]()
[![license](https://img.shields.io/badge/license-MIT-f59e0b?style=flat-square)]()
[![pets](https://img.shields.io/badge/pets-1%2C569%20%E6%AC%BE-ec4899?style=flat-square)](https://petdex.crafter.run/zh)

[English](./README.md) · [中文文档](./README_CN.md)

</div>

---

## petdex-cc 是什么？

petdex-cc 为你的 Claude Code 工作流带来**动画桌面宠物**。从 [Petdex 宠物库](https://petdex.crafter.run/zh)（1,569+ 款社区宠物）挑选一只，一条命令安装，宠物立刻出现在桌面上 —— 陪你读代码、庆祝任务完成、在你遇到错误时加油打气，随你的编码而成长。

> **和 `npx petdex install` 有什么区别？**
> 原始的 `petdex` 命令提供基础宠物展示。`petdex-cc` 额外增加了**深度 Claude Code 集成** —— 通过 hooks 接入你的编码流程，包含等级成长系统、AI 生成语音、时段问候、互动特效。你的宠物不只是一个装饰，它*参与*你的编码过程。

> **目前仅支持 Claude Code，后续将扩展到 Cursor、Windsurf、Copilot 等 AI 编码工具。**

### 功能一览

- **实时反应** —— 你读文件、编辑代码、运行命令、完成任务、遇到错误时，宠物同步改变动画
- **8 级成长体系** —— Byte → Process → Thread → Module → Kernel → Neural → Quantum → Singularity，逐级解锁视觉特效
- **AI 语音气泡** —— 基于 Claude 生成的上下文感知中文对话（无 API Key 时使用内置台词）
- **时段问候** —— 早上好、午安、下午茶、下班、晚安、凌晨问候
- **互动体验** —— 拖拽宠物、右键菜单、快速点击彩蛋
- **系统托盘** —— 任务栏图标，可显示/隐藏、查看关于、退出
- **状态持久化** —— 等级和事件数重启不丢失（HMAC 签名防篡改）
- **1,569+ 款宠物** —— 浏览 [petdex.crafter.run/zh](https://petdex.crafter.run/zh)，安装任意社区宠物

---

## 快速开始

### 环境要求

- [Node.js](https://nodejs.org/) >= 18
- 已安装 [Claude Code](https://docs.anthropic.com/en/docs/claude-code)

### 安装

```bash
# 1. 浏览宠物 → https://petdex.crafter.run/zh
# 2. 看中哪只，记下它的 slug（比如 "boba"）
# 3. 安装：

npx petdex-cc install boba
```

宠物立刻出现在桌面上，开始响应你的 Claude Code 操作。

### 热门宠物

| Slug | 名称 | 描述 |
|---|---|---|
| `boba` | Boba | 喝着珍珠奶茶的小水獭 |
| `doraemon` | 哆啦A梦 | 来自未来的蓝色机器猫 |
| `noir-webling` | Noir Webling | 戴礼帽的单色蜘蛛侦探 |
| `ikun-hoops` | IKUN Hoops | 穿卫衣拿篮球的小鸡 |
| `ddo-zvzo` | ddo-zvzo | 会戴墨镜的紫色吉祥物 |
| `mochi` | Mochi | 橘白色可爱小猫 |

> 浏览全部 1,569+ 款宠物 → [**petdex.crafter.run/zh**](https://petdex.crafter.run/zh)

---

## 你的宠物会做什么

Claude Code 的每一次操作都会触发宠物反应：

| Claude Code 事件 | 宠物动画 | 语音气泡 |
|---|---|---|
| 会话开始 | 挥手 | "Let's get to work!" |
| 读取文件 | 审视 | "Reading 文件名..." |
| 编辑文件 | 待机 | "Edited 文件名" |
| 运行命令 | 奔跑 | "Running command..." |
| 搜索文件 | 等待 | "Searching..." |
| 工具失败 | 垂头 | "Oops, something went wrong" + AI 鼓励 |
| 任务完成 | 跳跃 | "Task complete!" + AI 庆祝 |
| Claude 停止 | 跳跃 | "Task complete!"（60% 概率触发 AI） |
| Claude 报错 | 垂头 | 错误信息 + AI 安慰 |
| 空闲 10+ 分钟 | 挥手 | 时段问候（中文） |
| 等级提升 | 当前状态 | "Level up! Kernel!" + 特效激活 |

### 互动操作

- **拖拽** —— 点击拖动宠物到屏幕任意位置
- **右键** —— 上下文菜单：显示/隐藏、关于、退出
- **系统托盘** —— 右下角任务栏图标
- **彩蛋** —— 快速连续点击宠物，触发递进式反应（2 → 4 → 6 → 9 → 12 → 15 次）

---

## 等级系统

你的宠物随你的编码而成长。每次 Claude Code 操作算一次事件，累积升级：

| 等级 | 名称 | 所需事件数 | 颜色 | 视觉效果 |
|:---:|---|---:|---|---|
| 1 | **Byte** | 0 | 银色 | 基础宠物 |
| 2 | **Process** | 50 | 绿色 | 呼吸式发光 |
| 3 | **Thread** | 200 | 蓝色 | 旋转光环 |
| 4 | **Module** | 500 | 紫色 | 增强光环 |
| 5 | **Kernel** | 1,000 | 琥珀 | 漂浮光点粒子 |
| 6 | **Neural** | 2,000 | 粉色 | 粒子风暴 |
| 7 | **Quantum** | 5,000 | 青色 | 能量场 |
| 8 | **Singularity** | 10,000 | 金色 | 金色光环 + 全部特效 |

---

## AI 语音

当 Anthropic API Key 可用时（自动从 Claude Code 设置读取，或通过 `petdex-cc config` 配置），宠物会生成**上下文感知的中文语音**：

| 场景 | 触发时机 | AI 生成示例 |
|---|---|---|
| `task_complete` | 任务完成 | "做得好！继续加油！" |
| `error` | 工具失败 | "别担心，bugs难免的~" |
| `idle` | 空闲超过 10 分钟 | "还在吗？" |
| `level_up` | 等级跨越阈值 | "升级啦！太厉害了！" |

- **2 分钟冷却** —— 连续 AI 调用间隔（升级时自动跳过冷却）
- **5 秒超时** —— API 响应超过 5 秒自动回退到预设台词
- **没有 API Key？** 内置预设台词完全够用 —— 7 条任务、5 条错误、5 条空闲、4 条升级

---

## 命令参考

```bash
petdex-cc install <slug>    # 下载宠物、配置 hooks、启动
petdex-cc start             # 启动桌面宠物
petdex-cc stop              # 优雅停止宠物
petdex-cc list              # 浏览 Petdex 宠物库
petdex-cc switch <slug>     # 运行时切换宠物（自动下载）
petdex-cc status            # 查看宠物名称、等级、事件数、运行状态
petdex-cc uninstall         # 移除 hooks、停止宠物、删除所有数据
petdex-cc config [选项]     # 配置设置
```

### 配置选项

```bash
petdex-cc config --api-key <key>             # Anthropic API Key（用于 AI 语音）
petdex-cc config --api-base-url <url>         # API 基础 URL
petdex-cc config --cooldown <分钟>             # AI 调用冷却时间（默认 2 分钟）
```

> API 凭据会自动从 `~/.claude/settings.json` 读取，大多数用户无需手动配置。

---

## 架构设计

```
 ┌─────────────────────────────────────────────────┐
 │                   Claude Code                    │
 │    （工具调用、任务完成、错误、空闲等事件）          │
 └──────────────────────┬──────────────────────────┘
                        │ hooks（写入 settings.json）
                        ▼
              ┌──────────────────┐
              │  bridge.ps1/.sh  │  异步，10 秒超时
              └────────┬─────────┘
                       │ HTTP POST /event
                       ▼
 ┌─────────────────────────────────────────────────┐
 │             petdex-cc（Electron 主进程）           │
 │                                                   │
 │  ┌──────────────┐  ┌──────────┐  ┌────────────┐ │
 │  │ event-mapper  │  │  storage  │  │  ai-speech  │ │
 │  │ 事件 → 动作   │  │ 等级、XP  │  │ Claude Haiku│ │
 │  └──────┬───────┘  └─────┬────┘  └─────┬──────┘ │
 │         │                 │              │         │
 │         └─────────┬───────┘              │         │
 │                   ▼                      │         │
 │         ┌─────────────────┐              │         │
 │         │  IPC → 渲染窗口  │◀─────────────┘         │
 │         └────────┬────────┘                        │
 └──────────────────┼──────────────────────────────────┘
                    ▼
          ┌──────────────────┐
          │  宠物窗口（HTML）  │  透明、始终置顶
          │                    │
          │  ┌─── sprite ───┐ │  9 种动画状态
          │  │   气泡        │ │  3s / 8s 自动消失
          │  │   等级徽章     │ │  等级标签 + 颜色
          │  │   特效        │ │  光晕/光环/粒子/光环
          │  └──────────────┘ │
          └──────────────────┘
```

---

## 开发者安装

```bash
git clone https://github.com/devnomad-byte/petdex-cc.git
cd petdex-cc
npm install
npm run build

# 开发模式启动
npx electron .

# 全局安装使用 CLI
npm link
petdex-cc install boba
```

### 项目结构

```
petdex-cc/
├── bin/cli.ts                CLI 入口（8 个命令）
├── src/
│   ├── main/                 Electron 主进程
│   │   ├── index.ts          窗口创建、事件循环、IPC
│   │   ├── server.ts         HTTP 服务器（hooks → 宠物，端口 17321）
│   │   ├── ai-speech.ts      AI 语音（Anthropic Messages API）
│   │   ├── storage.ts        HMAC 签名状态持久化
│   │   ├── tray.ts           系统托盘（像素猫脸图标）
│   │   └── event-mapper.ts   8 种 hook 事件 → 宠物动作
│   ├── renderer/             Electron 渲染进程（宠物 UI）
│   │   ├── index.html        透明窗口 + CSS 特效
│   │   ├── renderer.ts       IPC 协调 + 等级特效
│   │   ├── pet-sprite.ts     9 状态精灵图引擎
│   │   ├── bubble.ts         语音气泡系统
│   │   ├── click-through.ts  透明点击穿透
│   │   ├── drag.ts           拖拽 + 点击彩蛋
│   │   └── context-menu.ts   右键菜单
│   ├── cli/                  CLI 命令实现
│   ├── hooks/                Claude Code hooks 注册
│   │   ├── register.ts       写入 ~/.claude/settings.json
│   │   ├── write-scripts.ts  跨平台 bridge 脚本
│   │   ├── bridge.ps1        Windows PowerShell bridge
│   │   └── bridge.sh         Unix bash bridge
│   ├── petdex-api/           Petdex 注册中心客户端
│   │   ├── client.ts         清单获取 + slug 查询
│   │   └── download.ts       流式下载 + 进度回调
│   └── shared/               共享类型和常量
```

---

## 配置参考

### 自动检测

petdex-cc 自动从 `~/.claude/settings.json` 读取以下配置：

| 配置项 | 用途 |
|---|---|
| `ANTHROPIC_AUTH_TOKEN` | AI 语音的 API Key |
| `ANTHROPIC_BASE_URL` | AI 语音的 API 端点 |

### 手动配置

存储在 `~/.petdex-cc/config.json`：

```bash
petdex-cc config --api-key <key> --api-base-url <url> --cooldown 2
```

### 数据目录

| 路径 | 内容 |
|---|---|
| `~/.petdex-cc/pets/<slug>/` | 下载的精灵图 + pet.json |
| `~/.petdex-cc/data/state.json` | 等级、事件数、宠物 slug（HMAC 签名） |
| `~/.petdex-cc/data/state.sig` | HMAC-SHA256 签名 |
| `~/.petdex-cc/hooks/` | Bridge 脚本 |
| `~/.petdex-cc/config.json` | 用户配置（API Key、冷却时间） |

---

## Hooks 参考

petdex-cc 在 `~/.claude/settings.json` 中注册以下 hooks：

| Hook | 匹配器 | 触发时机 |
|---|---|---|
| `PostToolUse` | `Read\|Edit\|Write\|Bash\|Glob\|Grep` | 工具调用之后 |
| `PostToolUseFailure` | — | 工具调用失败时 |
| `Stop` | — | Claude 完成响应时 |
| `StopFailure` | — | Claude 停止并报错时 |
| `Notification` | `idle_prompt` | 空闲通知 |
| `SessionStart` | `startup\|resume` | Claude Code 启动或恢复时 |
| `SessionEnd` | — | Claude Code 会话结束时 |
| `TaskCompleted` | — | 任务标记完成时 |

---

## 后续计划

- [ ] 支持 Cursor
- [ ] 支持 Windsurf
- [ ] 支持 GitHub Copilot
- [ ] 更多宠物互动动作
- [ ] 宠物换装系统

---

## 许可证

[MIT](./LICENSE)

---

<div align="center">
  <sub>为 <a href="https://docs.anthropic.com/en/docs/claude-code">Claude Code</a> 社区用心打造</sub><br />
  <sub>宠物来自 <a href="https://petdex.crafter.run/zh">Petdex</a></sub>
</div>
