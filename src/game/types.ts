// 游戏核心类型定义

export interface Position {
  x: number
  y: number
}

export type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT'

export type GameMode = 'classic' | 'dark' | 'timed' | 'survival'

export interface GameModeConfig {
  id: GameMode
  name: string
  description: string
  icon: string
}

export interface MapConfig {
  id: string
  name: string
  description: string
  difficulty: 1 | 2 | 3 | 4 | 5
  walls: Position[]
  bgColor?: string
}

export interface PowerUpType {
  id: string
  name: string
  color: string
  type: 'instant' | 'duration'
  duration?: number
  description: string
}

export interface PowerUp {
  type: PowerUpType
  position: Position
  spawnTime: number
}

export interface ActiveEffect {
  id: string
  endTime: number
}

export interface GameState {
  snake: Position[]
  direction: Direction
  nextDirection: Direction
  food: Position
  powerUps: PowerUp[]
  activeEffects: ActiveEffect[]
  score: number
  level: number
  foodEaten: number
  combo: number
  lastFoodTime: number
  status: 'menu' | 'playing' | 'paused' | 'gameover'
  selectedMapId: string
  gameMode: GameMode
  tickInterval: number
  timeRemaining?: number  // 限时模式用
}

export interface HighscoreEntry {
  name: string
  score: number
  level: number
  mapId: string
  date: string
}

// 游戏常量
export const GRID_WIDTH = 30
export const GRID_HEIGHT = 20
export const CELL_SIZE = 20
export const BASE_TICK_MS = 150
export const COMBO_WINDOW_MS = 2000
export const POWERUP_LIFETIME_MS = 12000
export const MAX_POWERUPS = 3
export const FOOD_PER_LEVEL = 5
export const DARK_MODE_VISION_RADIUS = 6  // 黑暗模式可视范围（增大）
export const TIMED_MODE_DURATION = 60000  // 限时模式60秒

// 游戏模式配置
export const GAME_MODES: GameModeConfig[] = [
  { id: 'classic', name: '经典', description: '传统贪吃蛇玩法', icon: '🎮' },
  { id: 'dark', name: '黑暗', description: '只能看到蛇头周围', icon: '🌑' },
  { id: 'timed', name: '限时', description: '60秒内尽可能得分', icon: '⏱️' },
  { id: 'survival', name: '生存', description: '蛇会自动变长', icon: '💀' },
]
