# Petdex-CC 手动测试计划

## Context

petdex-cc 是一个 Claude Code 桌面宠物伴侣应用。本计划按模块组织，覆盖 CLI 命令、事件管道、渲染器行为等。

---

## 前置条件

- Node.js >= 18
- Claude Code 已安装并配置（`~/.claude` 目录存在）
- 网络连接正常（Petdex API、Anthropic API）
- Windows 11 环境

---

## 1. 安装流程 (`petdex-cc install <slug>`)

| # | 测试项 | 预期结果 | 通过 |
|---|--------|----------|------|
| 1.1 | 运行 `node dist/bin/cli.js install` 不带参数 | 提示缺少 slug 参数或显示帮助信息 | |
| 1.2 | 运行 `node dist/bin/cli.js install clawd-2` | 下载宠物资源、注册 hooks、启动 Electron 窗口 | ✅ |
| 1.3 | 检查 `~/.petdex-cc/pets/clawd-2/` | 包含 spritesheet.webp 和 pet.json | ✅ |
| 1.4 | 检查 `~/.petdex-cc/hooks/` | 包含 bridge.sh 和 bridge.ps1 | ✅ |
| 1.5 | 检查 `~/.claude/settings.json` | hooks 中包含 petdex-cc-bridge 标记的条目（8个） | ✅ |
| 1.6 | 重复安装同一个 slug | 不报错，hooks 不重复注册 | |
| 1.7 | 网络断开时安装 | 显示友好的错误信息，不崩溃 | |

## 2. 宠物列表 (`petdex-cc list`)

| # | 测试项 | 预期结果 | 通过 |
|---|--------|----------|------|
| 2.1 | 运行 `node dist/bin/cli.js list` | 显示宠物表格（slug、名称、类型） | ✅ |
| 2.2 | 网络断开时运行 | 显示连接错误信息 | |

## 3. 启动/停止 (`petdex-cc start` / `petdex-cc stop`)

| # | 测试项 | 预期结果 | 通过 |
|---|--------|----------|------|
| 3.1 | 运行 `node dist/bin/cli.js start` | 宠物窗口出现，pid.lock 生成 | ✅ |
| 3.2 | 运行 `node dist/bin/cli.js stop` | 宠物窗口关闭，pid.lock 被清除 | ✅ |
| 3.3 | 重复 start（未 stop） | 提示 "Pet is already running." | ✅ |
| 3.4 | 未启动时运行 stop | 提示 "Pet is not running." | ✅ |
| 3.5 | 手动删除 pid.lock 后 stop | 不崩溃，提示进程不存在 | ✅ |

## 4. 宠物切换 (`petdex-cc switch <slug>`)

| # | 测试项 | 预期结果 | 通过 |
|---|--------|----------|------|
| 4.1 | 运行 `node dist/bin/cli.js switch aurelion-sol` | 宠物精灵图立即更换 | ✅ |
| 4.2 | 切换到未下载的 nezuko | 自动下载后切换 | ✅ |
| 4.3 | 未启动时切换 | 提示 "Pet is not running." | ✅ |
| 4.4 | 切换到无效 slug | 显示 "not found" 错误信息 | ✅ |

## 5. 状态查询 (`petdex-cc status`)

| # | 测试项 | 预期结果 | 通过 |
|---|--------|----------|------|
| 5.1 | 宠物运行时查询 | 显示 slug、等级、事件数、运行状态 | ✅ |
| 5.2 | 宠物未运行时查询 | 显示保存的状态，运行状态为 false | ✅ |

## 6. 配置 (`petdex-cc config`)

| # | 测试项 | 预期结果 | 通过 |
|---|--------|----------|------|
| 6.1 | 设置 API Key | `config.json` 写入 apiKey | ✅ |
| 6.2 | 设置 cooldown | `config.json` 写入 cooldownMinutes | ✅ |
| 6.3 | 无参数运行 config | 显示当前配置或帮助信息 | ✅ |

## 7. 卸载 (`petdex-cc uninstall`)

| # | 测试项 | 预期结果 | 通过 |
|---|--------|----------|------|
| 7.1 | 运行 `node dist/bin/cli.js uninstall` | 停止宠物、清除 hooks、删除 `~/.petdex-cc/` | ✅ |
| 7.2 | 检查 `~/.claude/settings.json` | petdex-cc 相关 hooks 已移除 | ✅ |

## 8. 事件管道（核心功能）

> 需要先启动宠物，然后在 Claude Code 中执行操作

| # | 测试项 | 触发方式 | 预期结果 | 通过 |
|---|--------|----------|----------|------|
| 8.1 | 会话开始 | curl POST hook_event_name=SessionStart | 挥手动画 + "Let's get to work!" | ✅ |
| 8.2 | 读取文件 | curl POST PostToolUse Read | review 状态 + "Reading config.ts" | ✅ |
| 8.3 | 编辑文件 | curl POST PostToolUse Edit | idle 状态 + "Edited fix.ts" | ✅ |
| 8.4 | 执行命令 | curl POST PostToolUse Bash | running 状态 + "Running command..." | ✅ |
| 8.5 | 搜索操作 | curl POST PostToolUse Glob | waiting 状态 + "Searching..." | ✅ |
| 8.6 | 任务完成 | curl POST Stop | 跳跃 + "Task complete!" | ✅ |
| 8.7 | 命令失败 | curl POST PostToolUseFailure | failed 状态 + "Oops, something went wrong" | ✅ |
| 8.8 | 会话结束 | curl POST SessionEnd | 挥手 + "See you next time!" | ✅ |
| 8.9 | 通知/空闲 | curl POST Notification idle_prompt | waiting 状态 + "Waiting for you..." | ✅ |

## 9. 渲染器行为

| # | 测试项 | 预期结果 | 通过 |
|---|--------|----------|------|
| 9.1 | 精灵动画 | 宠物持续播放帧动画，无卡顿 | ✅ |
| 9.2 | 气泡显示 | 事件触发后显示文字气泡，3秒后自动消失 | ✅ |
| 9.3 | AI 语音气泡 | AI 生成的气泡停留约 8 秒 | ✅ |
| 9.4 | 拖拽 | 鼠标拖拽宠物可自由移动窗口，松手停在当前位置 | ✅ |
| 9.5 | 初始位置 | 宠物启动时定位在屏幕右下角 | ✅ |
| 9.6 | 点击穿透 | 点击宠物透明区域时，点击传递到下方窗口 | ✅ |
| 9.7 | 宠物可交互 | 点击宠物精灵图本身时可以拖拽 | ✅ |
| 9.8 | 窗口始终置顶 | 宠物窗口始终显示在其他窗口之上 | ✅ |

## 10. 等级系统

| # | 测试项 | 预期结果 | 通过 |
|---|--------|----------|------|
| 10.1 | 等级提升 | 事件数达到阈值时，显示升级气泡 | ✅ |
| 10.2 | Lv2+ 发光效果 | 等级 >= 2 时宠物周围出现发光效果 | ✅ |
| 10.3 | Lv3+ 光环效果 | 等级 >= 3 时出现 aura 效果 | ✅ |
| 10.4 | Lv5+ 粒子效果 | 等级 >= 5 时出现粒子特效 | ✅ |
| 10.5 | Lv8 光环 | 等级 8 时出现 halo 效果 | ✅ |
| 10.6 | 状态持久化 | 重启宠物后等级和事件数保持 | ✅ |

## 11. AI 语音生成

| # | 测试项 | 预期结果 | 通过 |
|---|--------|----------|------|
| 11.1 | 有 API Key 时 | 事件触发后显示 AI 生成的中文短句 | ✅ |
| 11.2 | 无 API Key 时 | 使用预设台词（PRESET_LINES） | ✅ |
| 11.3 | 冷却时间 | 连续事件间 AI 调用有 2 分钟冷却 | ✅ |
| 11.4 | 升级时跳过冷却 | 升级时立即触发 AI 语音，不受冷却限制 | ✅ |
| 11.5 | API 超时 | API 响应超过 5 秒时回退到预设台词 | ✅ |

## 12. 系统托盘

| # | 测试项 | 预期结果 | 通过 |
|---|--------|----------|------|
| 12.1 | 托盘图标 | 系统托盘显示宠物图标 | ✅ |
| 12.2 | 显示/隐藏 | 点击 Show/Hide 可切换宠物可见性 | ✅ |
| 12.3 | 关于 | 点击 About 显示版本信息 | ✅ |
| 12.4 | 退出 | 点击 Quit 关闭宠物进程 | ✅ |

## 13. 时间问候

| # | 测试项 | 预期结果 | 通过 |
|---|--------|----------|------|
| 13.1 | 空闲问候 | 空闲 10+ 分钟后，每 30 分钟显示时段问候 | ✅ |
| 13.2 | 中文问候 | 问候语为中文（早上好/午安/晚安等） | ✅ |

## 14. 状态防篡改

| # | 测试项 | 预期结果 | 通过 |
|---|--------|----------|------|
| 14.1 | 手动修改 state.json | 修改后重启宠物，HMAC 校验失败，状态重置为默认 | |

---

## 已修复的 Bug 记录

| # | 问题 | 修复 |
|---|------|------|
| B1 | `node-machine-id` ESM 不兼容 | 改为默认导入 + 解构 |
| B2 | Petdex API 返回 `{ pets: [] }` 而非纯数组 | `data.pets ?? data` |
| B3 | `__dirname` 在 ESM 中不可用 | 改用 `fileURLToPath` |
| B4 | `require()` 在 ESM 中不可用 | `createRequire` / 直接 import |
| B5 | index.html 未复制到 dist | build 脚本加 `build-copy.mjs` |
| B6 | CSP 阻止 renderer.js 加载 | 移除 CSP |
| B7 | renderer.js 使用 ESM import 但浏览器不支持 | esbuild 打包为 IIFE |
| B8 | `BrowserWindow` 不能跨 IPC 传输 | 安装 `@electron/remote` |
| B9 | `@electron/remote/main` ESM 路径 | 加 `/index.js` 后缀 |
| B10 | `file://` URL 路径中 `\` 未转换 | `.replace(/\\/g, "/")` |
| B11 | tray-icon.png 不存在导致进程崩溃 | 容错处理 |
| B12 | install 未保存 petSlug 到 state | 安装前调用 `saveState` |
| B13 | `electron.screen` renderer 不可用 | 通过 `@electron/remote` 获取 |
| B14 | 漫游边界检测卡顿闪烁 | 改为固定位置 + 可拖拽 |
| B15 | install 不停掉旧宠物导致两个宠物 | install 前先 taskkill 所有 electron 进程 |

---

## 执行建议

1. **先执行 1-7**（CLI 命令），确认基础功能可用
2. **再执行 8-11**（事件管道 + AI），需要同时运行 Claude Code 和宠物
3. **最后执行 12-14**（托盘、问候、安全）
4. 等级系统（10）需要大量事件才能自然触发，可以考虑临时降低阈值或手动编辑测试
