// 每日挑战系统

import type { Position, DailyChallengeRecord } from './types'
import { GRID_WIDTH, GRID_HEIGHT } from './types'

const DAILY_STORAGE_KEY = 'snake_retro_daily'

// 基于日期的伪随机数生成器
function seededRandom(seed: number): () => number {
  return () => {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff
    return seed / 0x7fffffff
  }
}

// 获取今天的日期字符串
export function getTodayString(): string {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
}

// 根据日期生成种子
function dateSeed(dateStr: string): number {
  let hash = 0
  for (let i = 0; i < dateStr.length; i++) {
    const char = dateStr.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  return Math.abs(hash)
}

// 生成每日挑战地图的障碍物
export function generateDailyWalls(dateStr: string = getTodayString()): Position[] {
  const seed = dateSeed(dateStr)
  const random = seededRandom(seed)
  const walls: Position[] = []

  // 根据随机数决定障碍物类型和数量
  const obstacleCount = Math.floor(random() * 15) + 10  // 10-25个障碍物
  const pattern = Math.floor(random() * 4)  // 0-3种模式

  const safeZone = {
    minX: Math.floor(GRID_WIDTH / 2) - 4,
    maxX: Math.floor(GRID_WIDTH / 2) + 4,
    minY: Math.floor(GRID_HEIGHT / 2) - 3,
    maxY: Math.floor(GRID_HEIGHT / 2) + 3,
  }

  const isInSafeZone = (x: number, y: number) =>
    x >= safeZone.minX && x <= safeZone.maxX &&
    y >= safeZone.minY && y <= safeZone.maxY

  switch (pattern) {
    case 0: // 随机散点
      for (let i = 0; i < obstacleCount; i++) {
        const x = Math.floor(random() * (GRID_WIDTH - 4)) + 2
        const y = Math.floor(random() * (GRID_HEIGHT - 4)) + 2
        if (!isInSafeZone(x, y)) {
          walls.push({ x, y })
        }
      }
      break

    case 1: // 横向条纹
      const stripeCount = Math.floor(random() * 3) + 2
      for (let s = 0; s < stripeCount; s++) {
        const y = Math.floor(random() * (GRID_HEIGHT - 6)) + 3
        const startX = Math.floor(random() * 5) + 2
        const length = Math.floor(random() * 10) + 5
        for (let x = startX; x < startX + length && x < GRID_WIDTH - 2; x++) {
          if (!isInSafeZone(x, y)) {
            walls.push({ x, y })
          }
        }
      }
      break

    case 2: // 方块群
      const blockCount = Math.floor(random() * 4) + 2
      for (let b = 0; b < blockCount; b++) {
        const bx = Math.floor(random() * (GRID_WIDTH - 8)) + 3
        const by = Math.floor(random() * (GRID_HEIGHT - 6)) + 3
        const size = Math.floor(random() * 2) + 2
        for (let dx = 0; dx < size; dx++) {
          for (let dy = 0; dy < size; dy++) {
            if (!isInSafeZone(bx + dx, by + dy)) {
              walls.push({ x: bx + dx, y: by + dy })
            }
          }
        }
      }
      break

    case 3: // L形障碍
      const lCount = Math.floor(random() * 3) + 2
      for (let l = 0; l < lCount; l++) {
        const lx = Math.floor(random() * (GRID_WIDTH - 8)) + 3
        const ly = Math.floor(random() * (GRID_HEIGHT - 6)) + 3
        const armLength = Math.floor(random() * 4) + 3
        const direction = Math.floor(random() * 4)

        // 垂直臂
        for (let i = 0; i < armLength; i++) {
          const nx = lx
          const ny = direction < 2 ? ly + i : ly - i
          if (ny > 1 && ny < GRID_HEIGHT - 2 && !isInSafeZone(nx, ny)) {
            walls.push({ x: nx, y: ny })
          }
        }
        // 水平臂
        for (let i = 0; i < armLength; i++) {
          const nx = direction % 2 === 0 ? lx + i : lx - i
          const ny = ly
          if (nx > 1 && nx < GRID_WIDTH - 2 && !isInSafeZone(nx, ny)) {
            walls.push({ x: nx, y: ny })
          }
        }
      }
      break
  }

  // 去重
  const unique = new Map<string, Position>()
  walls.forEach(w => unique.set(`${w.x},${w.y}`, w))
  return Array.from(unique.values())
}

// 获取每日挑战记录
export function getDailyRecord(): DailyChallengeRecord | null {
  try {
    const stored = localStorage.getItem(DAILY_STORAGE_KEY)
    if (stored) {
      const record = JSON.parse(stored) as DailyChallengeRecord
      if (record.date === getTodayString()) {
        return record
      }
    }
  } catch {
    // ignore
  }
  return null
}

// 保存每日挑战记录
export function saveDailyRecord(score: number, level: number): DailyChallengeRecord {
  const today = getTodayString()
  const existing = getDailyRecord()

  const record: DailyChallengeRecord = {
    date: today,
    score: existing ? Math.max(existing.score, score) : score,
    level: existing ? Math.max(existing.level, level) : level,
    attempts: existing ? existing.attempts + 1 : 1,
  }

  try {
    localStorage.setItem(DAILY_STORAGE_KEY, JSON.stringify(record))
  } catch {
    // ignore
  }

  return record
}

// 获取每日挑战难度描述
export function getDailyDifficulty(dateStr: string = getTodayString()): string {
  const seed = dateSeed(dateStr)
  const random = seededRandom(seed)
  const difficulty = Math.floor(random() * 5) + 1
  return '⭐'.repeat(difficulty)
}
