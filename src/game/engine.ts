// 游戏引擎 - 核心逻辑

import type {
  GameState,
  Position,
  Direction,
  PowerUp,
  GameMode,
} from './types'
import {
  GRID_WIDTH,
  GRID_HEIGHT,
  BASE_TICK_MS,
  COMBO_WINDOW_MS,
  POWERUP_LIFETIME_MS,
  MAX_POWERUPS,
  FOOD_PER_LEVEL,
  TIMED_MODE_DURATION,
} from './types'
import { getMapById } from './maps'
import { getRandomPowerUpType } from './powerups'

// 创建初始游戏状态
export function createInitialState(mapId: string = 'classic', gameMode: GameMode = 'classic'): GameState {
  const startX = Math.floor(GRID_WIDTH / 2)
  const startY = Math.floor(GRID_HEIGHT / 2)

  const state: GameState = {
    snake: [
      { x: startX, y: startY },
      { x: startX - 1, y: startY },
      { x: startX - 2, y: startY },
    ],
    direction: 'RIGHT',
    nextDirection: 'RIGHT',
    food: { x: 0, y: 0 },
    powerUps: [],
    activeEffects: [],
    score: 0,
    level: 1,
    foodEaten: 0,
    combo: 0,
    lastFoodTime: 0,
    status: 'menu',
    selectedMapId: mapId,
    gameMode: gameMode,
    tickInterval: BASE_TICK_MS,
    timeRemaining: gameMode === 'timed' ? TIMED_MODE_DURATION : undefined,
  }

  state.food = spawnFood(state)
  return state
}

// 获取所有被占用的格子
function getOccupiedPositions(state: GameState): Set<string> {
  const occupied = new Set<string>()
  const map = getMapById(state.selectedMapId)

  // 蛇身
  state.snake.forEach(p => occupied.add(`${p.x},${p.y}`))
  // 墙壁
  map.walls.forEach(p => occupied.add(`${p.x},${p.y}`))
  // 食物
  occupied.add(`${state.food.x},${state.food.y}`)
  // 道具
  state.powerUps.forEach(p => occupied.add(`${p.position.x},${p.position.y}`))

  return occupied
}

// 生成食物
export function spawnFood(state: GameState): Position {
  const occupied = getOccupiedPositions(state)

  let pos: Position
  let attempts = 0
  do {
    pos = {
      x: Math.floor(Math.random() * GRID_WIDTH),
      y: Math.floor(Math.random() * GRID_HEIGHT),
    }
    attempts++
  } while (occupied.has(`${pos.x},${pos.y}`) && attempts < 1000)

  return pos
}

// 生成道具
export function spawnPowerUp(state: GameState, now: number): PowerUp | null {
  if (state.powerUps.length >= MAX_POWERUPS) return null

  const occupied = getOccupiedPositions(state)

  let pos: Position
  let attempts = 0
  do {
    pos = {
      x: Math.floor(Math.random() * GRID_WIDTH),
      y: Math.floor(Math.random() * GRID_HEIGHT),
    }
    attempts++
  } while (occupied.has(`${pos.x},${pos.y}`) && attempts < 100)

  if (attempts >= 100) return null

  return {
    type: getRandomPowerUpType(),
    position: pos,
    spawnTime: now,
  }
}

// 检查是否有活跃效果
export function hasEffect(state: GameState, effectId: string, now: number): boolean {
  return state.activeEffects.some(e => e.id === effectId && e.endTime > now)
}

// 计算当前tick间隔
export function calculateTickInterval(state: GameState, now: number): number {
  let interval = BASE_TICK_MS - (state.level - 1) * 10
  interval = Math.max(interval, 50) // 最小50ms

  if (hasEffect(state, 'speed', now)) {
    interval = Math.floor(interval / 1.5)
  }
  if (hasEffect(state, 'slow', now)) {
    interval = Math.floor(interval / 0.6)
  }

  return interval
}

// 方向是否相反
function isOppositeDirection(d1: Direction, d2: Direction): boolean {
  return (
    (d1 === 'UP' && d2 === 'DOWN') ||
    (d1 === 'DOWN' && d2 === 'UP') ||
    (d1 === 'LEFT' && d2 === 'RIGHT') ||
    (d1 === 'RIGHT' && d2 === 'LEFT')
  )
}

// 设置方向
export function setDirection(state: GameState, dir: Direction): GameState {
  if (isOppositeDirection(dir, state.direction)) {
    return state
  }
  return { ...state, nextDirection: dir }
}

// 移动蛇
function moveSnake(state: GameState, now: number): Position {
  const head = state.snake[0]
  const dir = state.nextDirection
  let newHead: Position

  switch (dir) {
    case 'UP':
      newHead = { x: head.x, y: head.y - 1 }
      break
    case 'DOWN':
      newHead = { x: head.x, y: head.y + 1 }
      break
    case 'LEFT':
      newHead = { x: head.x - 1, y: head.y }
      break
    case 'RIGHT':
      newHead = { x: head.x + 1, y: head.y }
      break
  }

  // 穿墙效果
  if (hasEffect(state, 'ghost', now)) {
    if (newHead.x < 0) newHead.x = GRID_WIDTH - 1
    if (newHead.x >= GRID_WIDTH) newHead.x = 0
    if (newHead.y < 0) newHead.y = GRID_HEIGHT - 1
    if (newHead.y >= GRID_HEIGHT) newHead.y = 0
  }

  return newHead
}

// 检查碰撞
function checkCollision(state: GameState, head: Position, now: number): boolean {
  const isGhost = hasEffect(state, 'ghost', now)

  // 边界碰撞
  if (!isGhost) {
    if (head.x < 0 || head.x >= GRID_WIDTH || head.y < 0 || head.y >= GRID_HEIGHT) {
      return true
    }
  }

  // 自身碰撞（排除尾巴，因为尾巴会移动）
  for (let i = 0; i < state.snake.length - 1; i++) {
    if (state.snake[i].x === head.x && state.snake[i].y === head.y) {
      return true
    }
  }

  // 墙壁碰撞
  if (!isGhost) {
    const map = getMapById(state.selectedMapId)
    for (const wall of map.walls) {
      if (wall.x === head.x && wall.y === head.y) {
        return true
      }
    }
  }

  return false
}

// 应用道具效果
function applyPowerUp(state: GameState, powerUp: PowerUp, now: number): GameState {
  const newState = { ...state }
  const type = powerUp.type

  switch (type.id) {
    case 'speed':
    case 'slow':
    case 'ghost':
    case 'double':
      // 持续效果
      newState.activeEffects = [
        ...state.activeEffects.filter(e => e.id !== type.id),
        { id: type.id, endTime: now + (type.duration || 0) },
      ]
      break

    case 'bomb':
    case 'shrink':
      // 即时效果：缩短蛇身
      if (state.snake.length > 4) {
        newState.snake = state.snake.slice(0, -3)
      }
      if (type.id === 'shrink') {
        newState.score = state.score + 5
      }
      break
  }

  // 移除已吃的道具
  newState.powerUps = state.powerUps.filter(p => p !== powerUp)

  return newState
}

// 计算得分
function calculateScore(state: GameState, now: number): { score: number; combo: number } {
  let baseScore = 10
  let newCombo = 1

  // 连击判定
  if (now - state.lastFoodTime < COMBO_WINDOW_MS) {
    newCombo = Math.min(state.combo + 1, 8)
    baseScore = 10 * newCombo
  }

  // 双倍效果
  if (hasEffect(state, 'double', now)) {
    baseScore *= 2
  }

  return { score: state.score + baseScore, combo: newCombo }
}

// 游戏主循环 tick
export function tick(state: GameState, now: number): GameState {
  if (state.status !== 'playing') return state

  let newState = { ...state }

  // 清理过期效果
  newState.activeEffects = state.activeEffects.filter(e => e.endTime > now)

  // 清理过期道具
  newState.powerUps = state.powerUps.filter(
    p => now - p.spawnTime < POWERUP_LIFETIME_MS
  )

  // 移动蛇
  const newHead = moveSnake(newState, now)

  // 检查碰撞
  if (checkCollision(newState, newHead, now)) {
    return { ...newState, status: 'gameover' }
  }

  // 更新方向
  newState.direction = newState.nextDirection

  // 检查是否吃到食物
  const ateFood = newHead.x === state.food.x && newHead.y === state.food.y

  // 更新蛇身
  newState.snake = [newHead, ...state.snake]
  if (!ateFood) {
    newState.snake = newState.snake.slice(0, -1)
  }

  // 吃到食物
  if (ateFood) {
    const { score, combo } = calculateScore(newState, now)
    newState.score = score
    newState.combo = combo
    newState.lastFoodTime = now
    newState.foodEaten = state.foodEaten + 1

    // 升级
    if (newState.foodEaten % FOOD_PER_LEVEL === 0) {
      newState.level = state.level + 1
    }

    // 生成新食物
    newState.food = spawnFood(newState)

    // 随机生成道具（20%概率）
    if (Math.random() < 0.2) {
      const newPowerUp = spawnPowerUp(newState, now)
      if (newPowerUp) {
        newState.powerUps = [...newState.powerUps, newPowerUp]
      }
    }
  }

  // 检查是否吃到道具
  for (const powerUp of newState.powerUps) {
    if (powerUp.position.x === newHead.x && powerUp.position.y === newHead.y) {
      newState = applyPowerUp(newState, powerUp, now)
      break
    }
  }

  // 更新tick间隔
  newState.tickInterval = calculateTickInterval(newState, now)

  return newState
}

// 开始游戏
export function startGame(state: GameState): GameState {
  const newState = createInitialState(state.selectedMapId, state.gameMode)
  return { ...newState, status: 'playing' }
}

// 选择游戏模式
export function selectGameMode(state: GameState, mode: GameMode): GameState {
  return { ...state, gameMode: mode }
}

// 暂停/继续
export function togglePause(state: GameState): GameState {
  if (state.status === 'playing') {
    return { ...state, status: 'paused' }
  }
  if (state.status === 'paused') {
    return { ...state, status: 'playing' }
  }
  return state
}

// 选择地图
export function selectMap(state: GameState, mapId: string): GameState {
  return { ...state, selectedMapId: mapId }
}
