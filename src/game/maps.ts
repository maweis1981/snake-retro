// 地图配置

import type { MapConfig, Position } from './types'
import { GRID_WIDTH, GRID_HEIGHT } from './types'
import { generateDailyWalls, getTodayString, getDailyDifficulty } from './daily'

// 生成十字墙
function generateCrossWalls(): Position[] {
  const walls: Position[] = []
  const midX = Math.floor(GRID_WIDTH / 2)
  const midY = Math.floor(GRID_HEIGHT / 2)

  // 水平墙（留出中心通道）
  for (let x = 5; x < GRID_WIDTH - 5; x++) {
    if (Math.abs(x - midX) > 2) {
      walls.push({ x, y: midY })
    }
  }
  // 垂直墙（留出中心通道）
  for (let y = 3; y < GRID_HEIGHT - 3; y++) {
    if (Math.abs(y - midY) > 2) {
      walls.push({ x: midX, y })
    }
  }
  return walls
}

// 生成洞窟墙（同心矩形 + 十字通道）
function generateCaveWalls(): Position[] {
  const walls: Position[] = []
  const midX = Math.floor(GRID_WIDTH / 2)
  const midY = Math.floor(GRID_HEIGHT / 2)

  // 外层矩形
  for (let x = 6; x < GRID_WIDTH - 6; x++) {
    if (Math.abs(x - midX) > 2) {
      walls.push({ x, y: 4 })
      walls.push({ x, y: GRID_HEIGHT - 5 })
    }
  }
  for (let y = 4; y < GRID_HEIGHT - 4; y++) {
    if (Math.abs(y - midY) > 2) {
      walls.push({ x: 6, y })
      walls.push({ x: GRID_WIDTH - 7, y })
    }
  }

  // 内层矩形
  for (let x = 11; x < GRID_WIDTH - 11; x++) {
    if (Math.abs(x - midX) > 1) {
      walls.push({ x, y: 7 })
      walls.push({ x, y: GRID_HEIGHT - 8 })
    }
  }
  for (let y = 7; y < GRID_HEIGHT - 7; y++) {
    if (Math.abs(y - midY) > 1) {
      walls.push({ x: 11, y })
      walls.push({ x: GRID_WIDTH - 12, y })
    }
  }

  return walls
}

// 生成竞技场墙（双层同心障碍圈）
function generateArenaWalls(): Position[] {
  const walls: Position[] = []
  const midX = Math.floor(GRID_WIDTH / 2)
  const midY = Math.floor(GRID_HEIGHT / 2)

  // 外圈散点
  const outerRadius = 8
  for (let angle = 0; angle < 360; angle += 30) {
    const rad = (angle * Math.PI) / 180
    const x = Math.round(midX + outerRadius * Math.cos(rad))
    const y = Math.round(midY + outerRadius * 0.6 * Math.sin(rad))
    if (x > 1 && x < GRID_WIDTH - 2 && y > 1 && y < GRID_HEIGHT - 2) {
      walls.push({ x, y })
    }
  }

  // 内圈散点
  const innerRadius = 4
  for (let angle = 15; angle < 360; angle += 30) {
    const rad = (angle * Math.PI) / 180
    const x = Math.round(midX + innerRadius * Math.cos(rad))
    const y = Math.round(midY + innerRadius * 0.6 * Math.sin(rad))
    if (x > 1 && x < GRID_WIDTH - 2 && y > 1 && y < GRID_HEIGHT - 2) {
      walls.push({ x, y })
    }
  }

  // 四角障碍
  const corners = [
    { x: 3, y: 3 }, { x: 4, y: 3 }, { x: 3, y: 4 },
    { x: GRID_WIDTH - 4, y: 3 }, { x: GRID_WIDTH - 5, y: 3 }, { x: GRID_WIDTH - 4, y: 4 },
    { x: 3, y: GRID_HEIGHT - 4 }, { x: 4, y: GRID_HEIGHT - 4 }, { x: 3, y: GRID_HEIGHT - 5 },
    { x: GRID_WIDTH - 4, y: GRID_HEIGHT - 4 }, { x: GRID_WIDTH - 5, y: GRID_HEIGHT - 4 }, { x: GRID_WIDTH - 4, y: GRID_HEIGHT - 5 },
  ]
  walls.push(...corners)

  return walls
}

export const MAPS: MapConfig[] = [
  {
    id: 'classic',
    name: '经典',
    description: '无障碍，边界即死亡',
    difficulty: 1,
    walls: [],
  },
  {
    id: 'maze',
    name: '迷宫',
    description: '十字内墙将场地分为四区',
    difficulty: 3,
    walls: generateCrossWalls(),
  },
  {
    id: 'cave',
    name: '洞窟',
    description: '同心矩形 + 十字通道，极窄空间',
    difficulty: 4,
    walls: generateCaveWalls(),
  },
  {
    id: 'arena',
    name: '竞技场',
    description: '双层同心障碍圈，混沌空间',
    difficulty: 5,
    walls: generateArenaWalls(),
  },
]

export function getMapById(id: string): MapConfig {
  if (id === 'daily') {
    return getDailyMap()
  }
  return MAPS.find(m => m.id === id) || MAPS[0]
}

// 获取每日挑战地图
export function getDailyMap(): MapConfig {
  const today = getTodayString()
  const difficulty = getDailyDifficulty(today)
  return {
    id: 'daily',
    name: `每日挑战 ${today}`,
    description: `今日难度: ${difficulty}`,
    difficulty: (difficulty.length as 1 | 2 | 3 | 4 | 5),
    walls: generateDailyWalls(today),
  }
}
