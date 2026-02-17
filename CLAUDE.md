# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

Snake Retro - 像素复古风格贪吃蛇游戏，具备多地图、道具系统和 CRT 视觉效果。

## 常用命令

```bash
npm install      # 安装依赖
npm run dev      # 启动开发服务器
npm run build    # 生产构建
npm run preview  # 预览生产构建
npm run lint     # ESLint 检查
```

## 架构

### 分层设计

- `src/game/` — 纯 TypeScript 游戏逻辑，无 React/DOM 依赖，可独立测试
- `src/components/` — React 组件，只负责渲染和用户交互
- `src/hooks/` — 连接游戏逻辑与 React 的桥梁

### 核心模块

- `src/game/types.ts` — 类型定义和游戏常量
- `src/game/engine.ts` — 游戏引擎（tick、碰撞检测、状态更新）
- `src/game/maps.ts` — 地图配置（经典、迷宫、洞窟、竞技场）
- `src/game/powerups.ts` — 道具系统（加速、减速、穿墙、炸弹、缩短、双倍）

### 状态管理

使用 `useReducer` 管理游戏状态，不使用 Redux/Zustand。

## 开发规范

### Canvas 渲染

- 必须设置 `ctx.imageSmoothingEnabled = false` 保持像素风
- 坐标计算：`px = pos.x * CELL_SIZE`
- Glow 效果用完后重置 `ctx.shadowBlur = 0`
- 透明度用完后重置 `ctx.globalAlpha = 1`

### 扩展指南

新增地图：在 `src/game/maps.ts` 的 `MAPS` 数组添加 `MapConfig` 对象

新增道具：
1. 在 `src/game/powerups.ts` 的 `POWERUP_TYPES` 添加配置
2. 在 `src/game/engine.ts` 的 `applyPowerUp()` 添加 case
