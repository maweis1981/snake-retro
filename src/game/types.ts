// 游戏核心类型定义

export interface Position {
  x: number
  y: number
}

export type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT'

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
  tickInterval: number
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
