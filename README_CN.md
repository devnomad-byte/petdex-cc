<p align="center">
  <img src="https://img.shields.io/badge/version-0.1.0-8b5cf6?style=flat-square" />
  <img src="https://img.shields.io/badge/platform-Windows%20%7C%20macOS%20%7C%20Linux-0ea5e9?style=flat-square" />
  <img src="https://img.shields.io/badge/node-%3E%3D18-22c55e?style=flat-square" />
  <img src="https://img.shields.io/badge/license-MIT-f59e0b?style=flat-square" />
  <img src="https://img.shields.io/badge/pets-1569%20%E6%AC%BE-ec4899?style=flat-square" />
</p>

<h1 align="center">
  <br />
  <code>petdex-cc</code>
  <br />
  <sub><b>Claude Code 桌面宠物伴侣</b></sub>
  <br />
  <sub><i>实时响应你编码行为的动画宠物</i></sub>
</h1>

<p align="center">
  <a href="./README.md">English</a>
</p>

---

<br />

> 从 [**petdex.crafter.run**](https://petdex.crafter.run/) 挑选你的伙伴 — 1,569 款宠物任你选。
> 一条命令安装，宠物立刻出现在你的桌面上。

<br />

## 它能做什么

你的桌面宠物住在一个透明、始终置顶的窗口中，**实时响应你在 Claude Code 中的每一次操作**：

| Claude Code 中发生的事 | 你的宠物在做什么 |
|---|---|
| 你读取文件 | 宠物陪你一起看代码 |
| 你编辑或写入文件 | 宠物关注你的修改 |
| 你运行终端命令 | 宠物跟你一起跑起来 |
| 任务完成 | 宠物开心跳跃庆祝 |
| 出现错误 | 宠物送上鼓励和安慰 |
| 你离开太久 | 宠物挥手并问候（早上好/午安/晚安） |
| 你升级了 | 宠物发光、闪烁、庆祝 |

<br />

## 快速开始

### 环境要求

- [Node.js](https://nodejs.org/) >= 18
- 已安装 [Claude Code](https://docs.anthropic.com/en/docs/claude-code)（存在 `~/.claude/` 目录）

### 安装宠物

```bash
# 浏览宠物 → https://petdex.crafter.run/
# 看中哪个，用它的 slug 安装：

npx petdex-cc install boba
```

就这样。宠物立刻出现在桌面上。

> **热门宠物：** `boba`（水獭） · `doraemon`（哆啦A梦） · `noir-webling`（蜘蛛侦探） · `ikun-hoops`（篮球小鸡） · `星星人`（星星头）

<br />

## 命令一览

```
petdex-cc install <slug>   安装宠物并配置 hooks
petdex-cc start            启动桌面宠物
petdex-cc stop             停止桌面宠物
petdex-cc list             浏览 Petdex 上的可用宠物
petdex-cc switch <slug>    切换到另一只宠物
petdex-cc status           查看当前宠物状态和等级
petdex-cc uninstall        移除 hooks 和宠物数据
petdex-cc config           配置 API Key 和设置
```

<br />

## 等级系统

你的宠物随你的编码而成长。每次 Claude Code 操作都算作一次事件。

| 等级 | 名称 | 所需事件数 | 视觉效果 |
|:---:|---|---:|---|
| 1 | **Byte** | 0 | 基础宠物 |
| 2 | **Process** | 50 | 柔和呼吸发光 |
| 3 | **Thread** | 200 | 旋转光环 |
| 4 | **Module** | 500 | 效果增强 |
| 5 | **Kernel** | 1,000 | 漂浮光点粒子 |
| 6 | **Neural** | 2,000 | 粉色粒子风暴 |
| 7 | **Quantum** | 5,000 | 青色能量场 |
| 8 | **Singularity** | 10,000 | 金色光环 + 全部特效 |

<br />

## AI 语音

当你配置了 Anthropic API Key（通过 `petdex-cc config` 或 Claude Code 设置），宠物会生成**上下文感知的中文语音气泡**：

- 任务完成 → AI 生成的鼓励语
- 出现错误 → 安慰的话语
- 空闲太久 → 时段问候
- 升级 → 庆祝语

没有 API Key？内置预设台词也很好用。

<br />

## 开发者安装

```bash
# 克隆仓库
git clone https://github.com/devnomad-byte/petdex-cc.git
cd petdex-cc

# 安装依赖
npm install

# 构建
npm run build

# 启动宠物（开发模式）
npx electron .

# 或者全局安装以使用 CLI
npm link
petdex-cc install boba
```

### 项目结构

```
petdex-cc/
├── bin/cli.ts              CLI 入口
├── src/
│   ├── main/               Electron 主进程
│   │   ├── index.ts        窗口 & 事件循环
│   │   ├── server.ts       HTTP 事件接收器（hooks → 宠物）
│   │   ├── ai-speech.ts    AI 语音生成
│   │   ├── storage.ts      状态持久化（HMAC 签名）
│   │   ├── tray.ts         系统托盘菜单
│   │   └── event-mapper.ts Hook 事件 → 宠物动作
│   ├── renderer/           Electron 渲染进程（宠物 UI）
│   │   ├── index.html      透明窗口 HTML/CSS
│   │   ├── renderer.ts     主渲染逻辑
│   │   ├── pet-sprite.ts   精灵图动画引擎
│   │   ├── bubble.ts       语音气泡系统
│   │   ├── click-through.ts 点击穿透
│   │   └── drag.ts         可拖拽宠物
│   ├── cli/                CLI 命令
│   ├── hooks/              Claude Code hooks 注册
│   └── petdex-api/         Petdex API 客户端 & 下载
```

### 构建命令

| 命令 | 说明 |
|---|---|
| `npm run build` | TypeScript 编译 + 打包渲染器 |
| `npm run check` | 仅类型检查 |
| `npx electron .` | 从编译输出启动宠物 |

<br />

## 工作原理

```
Claude Code ──hooks──▶ ~/.claude/settings.json
                            │
                            ▼
                    bridge.ps1 / bridge.sh
                            │
                            ▼
                    HTTP POST /event (localhost)
                            │
                            ▼
                    ┌───────────────┐
                    │   petdex-cc   │
                    │  (Electron)   │
                    │               │
                    │  event-mapper │──▶ 宠物动作 + 语音气泡
                    │  storage      │──▶ 升级检测
                    │  ai-speech    │──▶ AI 生成的回复
                    └───────────────┘
                            │
                            ▼
                    桌面宠物窗口
```

<br />

## 配置

### API Key（可选，用于 AI 语音）

```bash
# 通过 config 命令设置
petdex-cc config --api-key <your-key> --api-base-url <url>

# 或者自动从 Claude Code 设置中读取（~/.claude/settings.json）
```

### Hook 事件

petdex-cc 自动注册以下 Claude Code hooks：

| Hook 事件 | 触发时机 |
|---|---|
| `PostToolUse` | Read、Edit、Write、Bash、Glob、Grep 之后 |
| `PostToolUseFailure` | 工具执行失败时 |
| `Stop` | Claude 完成响应时 |
| `StopFailure` | Claude 停止并报错时 |
| `Notification` | 空闲通知 |
| `SessionStart` | Claude Code 启动或恢复时 |
| `SessionEnd` | Claude Code 会话结束时 |
| `TaskCompleted` | 任务标记完成时 |

<br />

## 挑选你的宠物

访问 [**petdex.crafter.run**](https://petdex.crafter.run/) 浏览全部 1,569+ 款社区宠物。每只宠物都有唯一的 slug，用它来安装：

```bash
# 找到喜欢的宠物，复制它的 slug，然后：
petdex-cc install <slug>
```

<br />

## 许可证

MIT — 详见 [LICENSE](./LICENSE)。

<br />

---

<p align="center">
  <sub>为 Claude Code 社区用心打造</sub><br />
  <sub>宠物来自 <a href="https://petdex.crafter.run/">Petdex</a></sub>
</p>
