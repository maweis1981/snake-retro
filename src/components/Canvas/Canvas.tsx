// Canvas 渲染器

import { useRef, useEffect } from 'react'
import type { GameState, Position } from '../../game'
import {
  GRID_WIDTH,
  GRID_HEIGHT,
  CELL_SIZE,
  DARK_MODE_VISION_RADIUS,
  getMapById,
  hasEffect,
} from '../../game'
import styles from './Canvas.module.css'

interface CanvasProps {
  state: GameState
}

const COLORS = {
  background: '#0a0a12',
  grid: '#1a1a2e',
  snake: '#00ff41',
  snakeHead: '#00ff88',
  food: '#ff3a3a',
  wall: '#4a4a6a',
  ghost: 'rgba(196, 77, 255, 0.3)',
  fog: '#000000',
}

function drawPixelRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  color: string,
  glow: boolean = false
) {
  if (glow) {
    ctx.shadowColor = color
    ctx.shadowBlur = 8
  }
  ctx.fillStyle = color
  ctx.fillRect(x * size + 1, y * size + 1, size - 2, size - 2)
  if (glow) {
    ctx.shadowBlur = 0
  }
}

// 计算两点之间的距离
function getDistance(p1: Position, p2: Position): number {
  return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2))
}

// 检查位置是否在可视范围内
function isVisible(pos: Position, head: Position, radius: number): boolean {
  return getDistance(pos, head) <= radius
}

// 绘制黑暗模式的迷雾
function drawFogOfWar(ctx: CanvasRenderingContext2D, head: Position, radius: number) {
  const canvasWidth = GRID_WIDTH * CELL_SIZE
  const canvasHeight = GRID_HEIGHT * CELL_SIZE
  const centerX = head.x * CELL_SIZE + CELL_SIZE / 2
  const centerY = head.y * CELL_SIZE + CELL_SIZE / 2
  const pixelRadius = radius * CELL_SIZE

  // 创建径向渐变遮罩
  const gradient = ctx.createRadialGradient(
    centerX, centerY, pixelRadius * 0.3,
    centerX, centerY, pixelRadius
  )
  gradient.addColorStop(0, 'rgba(0, 0, 0, 0)')
  gradient.addColorStop(0.7, 'rgba(0, 0, 0, 0.3)')
  gradient.addColorStop(1, 'rgba(0, 0, 0, 0.95)')

  // 绘制四个角落的完全黑暗区域
  ctx.fillStyle = COLORS.fog
  ctx.fillRect(0, 0, canvasWidth, canvasHeight)

  // 用渐变"擦除"可视区域
  ctx.globalCompositeOperation = 'destination-out'
  ctx.beginPath()
  ctx.arc(centerX, centerY, pixelRadius, 0, Math.PI * 2)
  ctx.fill()
  ctx.globalCompositeOperation = 'source-over'

  // 添加边缘渐变效果
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, canvasWidth, canvasHeight)
}

export function Canvas({ state }: CanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const now = Date.now()
  const isDarkMode = state.gameMode === 'dark'
  const head = state.snake[0]

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.imageSmoothingEnabled = false

    // 清空画布
    ctx.fillStyle = COLORS.background
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // 绘制网格（黑暗模式下减淡）
    ctx.strokeStyle = isDarkMode ? '#0f0f1a' : COLORS.grid
    ctx.lineWidth = 0.5
    for (let x = 0; x <= GRID_WIDTH; x++) {
      ctx.beginPath()
      ctx.moveTo(x * CELL_SIZE, 0)
      ctx.lineTo(x * CELL_SIZE, GRID_HEIGHT * CELL_SIZE)
      ctx.stroke()
    }
    for (let y = 0; y <= GRID_HEIGHT; y++) {
      ctx.beginPath()
      ctx.moveTo(0, y * CELL_SIZE)
      ctx.lineTo(GRID_WIDTH * CELL_SIZE, y * CELL_SIZE)
      ctx.stroke()
    }

    // 绘制墙壁
    const map = getMapById(state.selectedMapId)
    map.walls.forEach(wall => {
      if (!isDarkMode || isVisible(wall, head, DARK_MODE_VISION_RADIUS + 1)) {
        drawPixelRect(ctx, wall.x, wall.y, CELL_SIZE, COLORS.wall)
      }
    })

    // 绘制道具（黑暗模式下远处的道具微弱发光）
    state.powerUps.forEach(powerUp => {
      const distance = getDistance(powerUp.position, head)
      const inRange = distance <= DARK_MODE_VISION_RADIUS

      if (!isDarkMode || inRange) {
        const alpha = 0.6 + 0.4 * Math.sin(Date.now() / 200)
        ctx.globalAlpha = alpha
        drawPixelRect(ctx, powerUp.position.x, powerUp.position.y, CELL_SIZE, powerUp.type.color, true)
        ctx.globalAlpha = 1
      } else if (isDarkMode && distance <= DARK_MODE_VISION_RADIUS + 3) {
        // 远处道具微弱闪烁提示
        const alpha = 0.1 + 0.1 * Math.sin(Date.now() / 300)
        ctx.globalAlpha = alpha
        drawPixelRect(ctx, powerUp.position.x, powerUp.position.y, CELL_SIZE, powerUp.type.color, true)
        ctx.globalAlpha = 1
      }
    })

    // 绘制食物（黑暗模式下远处微弱发光）
    const foodDistance = getDistance(state.food, head)
    if (!isDarkMode || foodDistance <= DARK_MODE_VISION_RADIUS) {
      drawPixelRect(ctx, state.food.x, state.food.y, CELL_SIZE, COLORS.food, true)
    } else if (isDarkMode && foodDistance <= DARK_MODE_VISION_RADIUS + 4) {
      // 远处食物微弱发光提示
      const alpha = 0.15 + 0.1 * Math.sin(Date.now() / 400)
      ctx.globalAlpha = alpha
      drawPixelRect(ctx, state.food.x, state.food.y, CELL_SIZE, COLORS.food, true)
      ctx.globalAlpha = 1
    }

    // 绘制蛇
    const isGhost = hasEffect(state, 'ghost', now)
    state.snake.forEach((segment, index) => {
      const isHead = index === 0
      let color = isHead ? COLORS.snakeHead : COLORS.snake

      if (isGhost) {
        ctx.globalAlpha = 0.6
        color = '#c44dff'
      }

      drawPixelRect(ctx, segment.x, segment.y, CELL_SIZE, color, isHead)

      if (isGhost) {
        ctx.globalAlpha = 1
      }
    })

    // 黑暗模式：绘制迷雾
    if (isDarkMode && state.status === 'playing') {
      drawFogOfWar(ctx, head, DARK_MODE_VISION_RADIUS)
    }
  }, [state, now, isDarkMode, head])

  return (
    <canvas
      ref={canvasRef}
      width={GRID_WIDTH * CELL_SIZE}
      height={GRID_HEIGHT * CELL_SIZE}
      className={styles.canvas}
    />
  )
}
