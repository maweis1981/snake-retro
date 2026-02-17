# Snake Retro — 项目定义文档 (PRD)

> 版本: v1.0 | 技术栈: React + Vite + TypeScript | 目标: 可发布的 Web 游戏产品

---

## 1. 产品概述

### 1.1 产品愿景

一款像素复古风格的贪吃蛇游戏，具备多地图、道具系统和现代化的用户体验，可直接通过浏览器访问，无需安装。

### 1.2 目标用户

- 喜欢经典小游戏的休闲玩家
- 对复古像素美学有偏好的用户
- 碎片时间娱乐需求（1-10分钟游戏时长）

### 1.3 核心差异点

| 普通贪吃蛇 | Snake Retro |
|-----------|-------------|
| 单一地图 | 4 张风格各异的地图 |
| 无道具 | 6 种改变游戏规则的道具 |
| 静态难度 | 等级系统 + 动态加速 |
| 简单计分 | 连击 Combo 加分机制 |
| 单调视觉 | CRT 扫描线 + Glow 像素美学 |

---

## 2. 功能规格

### 2.1 核心游戏循环

```
开始游戏 → 选择地图 → 控制蛇移动 → 吃食物得分 → 等级提升/死亡
                                    ↓
                              吃道具触发效果
```

**游戏规则：**
- 蛇撞到边界或自身则游戏结束
- 每吃 1 个食物，蛇身增加 1 节
- 每吃 5 个食物升 1 级，速度增加
- 撞到地图障碍物则死亡（穿墙道具激活时除外）

### 2.2 地图系统

每张地图有独立的障碍配置和视觉主题。

| ID | 名称 | 难度 | 障碍描述 |
|----|------|------|---------|
| `classic` | 经典 | ⭐ | 无障碍，边界即死亡 |
| `maze` | 迷宫 | ⭐⭐⭐ | 十字内墙将场地分为四区 |
| `cave` | 洞窟 | ⭐⭐⭐⭐ | 同心矩形 + 十字通道，极窄空间 |
| `arena` | 竞技场 | ⭐⭐⭐⭐⭐ | 双层同心障碍圈，混沌空间 |

**地图数据结构：**
```typescript
interface MapConfig {
  id: string
  name: string
  description: string
  difficulty: 1 | 2 | 3 | 4 | 5
  walls: Position[]          // 障碍格坐标列表
  bgColor?: string           // 可选自定义背景色
}
```

### 2.3 道具系统

道具随机出现在地图空白格，最多同时存在 3 个，12 秒后自动消失。

| ID | 名称 | 颜色 | 类型 | 效果 | 持续时间 |
|----|------|------|------|------|---------|
| `speed` | 加速 | 青色 `#3af0ff` | 持续 | 移动速度 ×1.5 | 5s |
| `slow` | 减速 | 黄色 `#ffe135` | 持续 | 移动速度 ×0.6 | 6s |
| `ghost` | 穿墙 | 紫色 `#c44dff` | 持续 | 可穿越边界和障碍物 | 7s |
| `bomb` | 炸弹 | 红色 `#ff3a3a` | 即时 | 消除蛇身末尾 3 节 | — |
| `shrink` | 缩短 | 橙色 `#ff8c00` | 即时 | 消除蛇身末尾 3 节 + 得 5 分 | — |
| `double` | 双倍 | 绿色 `#39ff14` | 持续 | 食物得分 ×2 | 8s |

**道具数据结构：**
```typescript
interface PowerUpType {
  id: string
  color: string
  label: string
  duration: number           // 0 = 即时效果
}

interface PowerUp {
  position: Position
  type: PowerUpType
  spawnedAt: number          // timestamp，用于计算过期
}
```

### 2.4 分数系统

```
基础得分 = 10 + (当前等级 - 1) × 2

连击加分 = (combo - 1) × 5   // 3秒内连续吃食物触发

双倍模式 = 最终得分 × 2

升级条件 = 每 5 个食物升 1 级
```

### 2.5 等级与速度

| 等级 | 移动间隔 | 描述 |
|------|---------|------|
| 1 | 200ms | 新手节奏 |
| 5 | 140ms | 中等挑战 |
| 10 | 80ms | 极速（上限）|

速度公式：`Math.max(80, 200 - (level - 1) * 15)`

---

## 3. 技术架构

### 3.1 技术栈

| 层次 | 技术选型 | 理由 |
|------|---------|------|
| 框架 | React 18 + TypeScript | 组件化，类型安全 |
| 构建 | Vite | 快速 HMR，零配置 |
| 渲染 | HTML5 Canvas API | 像素级控制，高性能 |
| 样式 | CSS Modules + CSS Variables | 主题化，无样式冲突 |
| 字体 | Google Fonts (Press Start 2P + VT323) | 像素风格必需 |
| 部署 | GitHub Pages / Vercel | 静态托管，零成本 |
| 测试 | Vitest + React Testing Library | 与 Vite 生态一致 |

### 3.2 目录结构

```
snake-retro/
├── public/
│   └── favicon.ico
├── src/
│   ├── components/          # React UI 组件
│   │   ├── GameCanvas/      # Canvas 渲染层
│   │   │   ├── GameCanvas.tsx
│   │   │   ├── GameCanvas.module.css
│   │   │   └── renderer.ts  # 纯绘图逻辑（无 React 依赖）
│   │   ├── HUD/             # 得分/等级/效果显示
│   │   ├── MapSelector/     # 地图选择 UI
│   │   ├── Overlay/         # 开始/结束覆盖层
│   │   ├── PowerUpLegend/   # 道具图例
│   │   └── EffectsPanel/    # 当前激活效果
│   ├── game/                # 纯游戏逻辑（无 React）
│   │   ├── engine.ts        # 游戏主循环（tick）
│   │   ├── maps.ts          # 地图配置数据
│   │   ├── powerups.ts      # 道具配置 + 效果逻辑
│   │   ├── scoring.ts       # 分数计算
│   │   └── types.ts         # 所有 TypeScript 类型定义
│   ├── hooks/
│   │   ├── useGameState.ts  # 游戏状态管理（useReducer）
│   │   ├── useInput.ts      # 键盘/触摸输入处理
│   │   └── useHighscores.ts # localStorage 排行榜
│   ├── styles/
│   │   ├── global.css       # 全局样式 + CSS 变量
│   │   └── fonts.css        # 字体引入
│   ├── App.tsx
│   └── main.tsx
├── CLAUDE.md                # Claude Code 开发指南
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

### 3.3 状态管理

使用 `useReducer` 管理游戏状态，避免复杂的全局状态库依赖。

```typescript
// src/game/types.ts

type GamePhase = 'idle' | 'playing' | 'paused' | 'gameover'

interface GameState {
  phase: GamePhase
  snake: Position[]
  direction: Direction
  nextDirection: Direction
  food: Position
  powerUps: PowerUp[]
  activeEffects: ActiveEffect[]
  score: number
  bestScore: number
  level: number
  combo: number
  mapId: string
}

type GameAction =
  | { type: 'START_GAME'; mapId: string }
  | { type: 'TICK' }
  | { type: 'CHANGE_DIRECTION'; direction: Direction }
  | { type: 'PAUSE' }
  | { type: 'RESUME' }
  | { type: 'GAME_OVER' }
  | { type: 'EXPIRE_EFFECT'; effectId: string }
```

### 3.4 渲染架构

Canvas 渲染与 React 状态分离：

```
useGameState (状态)
    ↓
useEffect → renderer.ts (纯函数渲染)
    ↓
<canvas> DOM 元素
```

渲染器设计为纯函数，输入状态，输出画面，便于测试和优化：

```typescript
// src/components/GameCanvas/renderer.ts
export function renderGame(ctx: CanvasRenderingContext2D, state: GameState): void
export function renderSnake(ctx: CanvasRenderingContext2D, snake: Position[], effects: ActiveEffect[]): void
export function renderFood(ctx: CanvasRenderingContext2D, food: Position, tick: number): void
export function renderPowerUps(ctx: CanvasRenderingContext2D, powerUps: PowerUp[]): void
export function renderWalls(ctx: CanvasRenderingContext2D, walls: Position[]): void
```

---

## 4. UI/UX 设计规范

### 4.1 视觉风格

**主题：CRT 复古像素风**

- 深色背景模拟 CRT 显示器
- 扫描线叠加效果（CSS `repeating-linear-gradient`）
- Glow 发光效果（`text-shadow` + `box-shadow` + Canvas `shadowBlur`）
- 像素字体强制无抗锯齿（`image-rendering: pixelated`）

### 4.2 颜色系统

```css
:root {
  /* 背景层 */
  --color-bg:        #0a0a0f;
  --color-panel:     #12121a;
  --color-border:    #2a2a3a;

  /* 主色 */
  --color-green:     #39ff14;   /* 主绿 / 蛇身 */
  --color-green-dim: #1a7a09;   /* 暗绿 / 辅助 */

  /* 道具色 */
  --color-speed:     #3af0ff;   /* 加速 - 青 */
  --color-slow:      #ffe135;   /* 减速 - 黄 */
  --color-ghost:     #c44dff;   /* 穿墙 - 紫 */
  --color-bomb:      #ff3a3a;   /* 炸弹 - 红 */
  --color-shrink:    #ff8c00;   /* 缩短 - 橙 */
  --color-double:    #39ff14;   /* 双倍 - 绿 */

  /* 文字 */
  --color-text:      #e8e8f0;
  --color-muted:     #555566;
  --color-accent:    #ffe135;   /* 高亮数字 */
}
```

### 4.3 字体

```css
/* 标题 / 标签 / 按钮 */
font-family: 'Press Start 2P', monospace;  /* 8px-14px */

/* 数值 / 说明文字 */
font-family: 'VT323', monospace;           /* 16px-24px */
```

### 4.4 布局

```
┌─────────────────────────────────────────┐
│              SNAKE.EXE  ▓▓▓▓            │  ← Header
├──────────┬──────────────┬───────────────┤
│  STATS   │              │   MAP INFO    │
│  得分     │   CANVAS     │   HIGHSCORES  │
│  最高     │   400×400    │               │
│  长度     │              │   TIPS        │
│  等级     ├──────────────┤               │
│          │   OVERLAY    │               │
│ POWER-UPS│   (开始/结束) │               │
│          │              │               │
│ EFFECTS  │              │               │
└──────────┴──────────────┴───────────────┘
│         操作提示 (WASD / 方向键)          │
└─────────────────────────────────────────┘
```

### 4.5 交互响应

| 操作 | 效果 |
|------|------|
| 吃食物 | 消息闪烁 `+分数` |
| 连击 | 消息显示 `COMBO x3! +分数` |
| 吃道具 | 消息显示道具名称 + 效果栏出现进度条 |
| 升级 | 消息显示 `LEVEL N!` |
| 死亡 | 红色闪烁 + 覆盖层出现 |
| 炸弹道具 | 红色闪烁 6 帧 |

---

## 5. 数据持久化

### 5.1 本地存储 (localStorage)

```typescript
// Key 定义
const STORAGE_KEYS = {
  highscores: 'snake-retro:highscores',   // HighscoreEntry[]
  settings: 'snake-retro:settings',       // UserSettings
}

interface HighscoreEntry {
  score: number
  level: number
  mapId: string
  date: string    // ISO 8601
}

interface UserSettings {
  lastMapId: string
  soundEnabled: boolean   // 预留
  sfxVolume: number       // 预留
}
```

排行榜保存前 10 名，按分数降序排列。

---

## 6. 非功能需求

### 6.1 性能

- 目标帧率：60fps（Canvas 渲染）
- 游戏逻辑 tick 与渲染帧分离（`setInterval` for logic，`requestAnimationFrame` for render）
- 首屏加载 < 2s（Vite 代码分割 + 字体预加载）

### 6.2 兼容性

- 浏览器：Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- 设备：桌面端优先，移动端触摸滑动支持
- 屏幕：最小宽度 800px（桌面），移动端自适应缩放

### 6.3 可访问性

- 键盘完全可操作（WASD + 方向键 + P暂停 + R重开）
- 颜色对比度满足 WCAG AA 标准
- 提供 `aria-label` 给 Canvas 区域

---

## 7. 开发里程碑

### Phase 1 — 核心可玩（MVP）

- [ ] Vite + React + TypeScript 项目初始化
- [ ] 游戏引擎：蛇移动、碰撞检测、食物生成
- [ ] Canvas 基础渲染：网格、蛇、食物
- [ ] 键盘输入处理
- [ ] 经典地图（无障碍）
- [ ] 基础计分系统
- [ ] 开始/结束覆盖层

### Phase 2 — 内容完整

- [ ] 像素复古视觉：扫描线、Glow、像素字体
- [ ] 其余 3 张地图 + 地图选择 UI
- [ ] 完整道具系统（6 种道具）
- [ ] 激活效果面板（进度条）
- [ ] 连击 Combo 系统
- [ ] 等级 + 动态速度
- [ ] 消息闪烁反馈

### Phase 3 — 产品打磨

- [ ] localStorage 排行榜（前 10 名）
- [ ] 移动端触摸支持
- [ ] 动画细节优化（蛇头眼睛、食物跳动、道具弹跳）
- [ ] 暂停功能完善
- [ ] README + 截图
- [ ] GitHub Pages 部署配置

### Phase 4 — 可选扩展（Future）

- [ ] Web Audio API 8-bit 音效
- [ ] 双人模式（同键盘）
- [ ] 蛇皮肤选择
- [ ] 动态障碍物（移动的墙）
- [ ] 时间限制模式
- [ ] 道具组合特效

---

## 8. CLAUDE.md 约定（给 Claude Code 用）

> 以下内容应原样复制到项目根目录的 `CLAUDE.md` 文件。

---

### 项目背景

像素复古贪吃蛇游戏，React + Vite + TypeScript，单页 Web 应用，无后端。

### 开发命令

```bash
npm install          # 安装依赖
npm run dev          # 启动开发服务器 (localhost:5173)
npm run build        # 构建生产版本
npm run preview      # 预览生产构建
npm run test         # 运行测试
npm run typecheck    # TypeScript 类型检查
```

### 代码约定

**游戏坐标系：**
- 网格大小：`GRID_SIZE = 20`（20×20 格子）
- 格子像素：`CELL_SIZE = 20`（每格 20px，画布 400×400）
- 坐标原点：左上角 `(0, 0)`

**核心类型：**
```typescript
type Position = { x: number; y: number }
type Direction = { x: -1 | 0 | 1; y: -1 | 0 | 1 }
```

**分层原则：**
- `src/game/` — 纯 TypeScript，无任何 React/DOM 依赖，可独立测试
- `src/components/` — React 组件，只负责渲染和用户交互
- `src/hooks/` — 连接游戏逻辑与 React 的桥梁

**渲染规则（Canvas）：**
- `ctx.imageSmoothingEnabled = false`（必须，保持像素风）
- 所有绘制坐标：`px = pos.x * CELL_SIZE`
- Glow 效果：用完后必须重置 `ctx.shadowBlur = 0`
- 透明度：用完后必须重置 `ctx.globalAlpha = 1`

**禁止事项：**
- 不引入 Redux / Zustand 等状态库（用 useReducer）
- 不用 styled-components（用 CSS Modules）
- 不直接在组件内写游戏逻辑（分离到 `src/game/`）

### 新增地图步骤

1. 在 `src/game/maps.ts` 的 `MAPS` 数组新增一个 `MapConfig` 对象
2. 在 `src/components/MapSelector/` 更新 UI（会自动读取 `MAPS` 数组，通常无需改动）

### 新增道具步骤

1. 在 `src/game/powerups.ts` 的 `POWERUP_TYPES` 数组新增配置
2. 在 `src/game/engine.ts` 的 `applyPowerUp()` 函数添加 `case`
3. 在 `src/components/PowerUpLegend/` 检查是否需要更新图例（通常自动渲染）

### 待实现功能（可直接接任务）

- [ ] P1: Web Audio API 8-bit 音效（吃食物 / 升级 / 死亡）
- [ ] P1: 完整单元测试覆盖 `src/game/` 目录
- [ ] P2: 移动端虚拟方向键 UI
- [ ] P2: 双人对战模式（蛇2用 IJKL 控制）
- [ ] P3: 蛇皮肤选择（颜色主题）
- [ ] P3: 动态障碍物（周期移动）
