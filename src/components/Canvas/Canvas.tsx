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

// 绘制黑暗模式的迷雾遮罩
function drawFogOfWar(ctx: CanvasRenderingContext2D, head: Position, radius: number) {
  const canvasWidth = GRID_WIDTH * CELL_SIZE
  const canvasHeight = GRID_HEIGHT * CELL_SIZE
  const centerX = head.x * CELL_SIZE + CELL_SIZE / 2
  const centerY = head.y * CELL_SIZE + CELL_SIZE / 2
  const pixelRadius = radius * CELL_SIZE

  ctx.save()

  // 创建一个覆盖整个画布的路径，中间挖一个圆形
  ctx.beginPath()
  ctx.rect(0, 0, canvasWidth, canvasHeight)
  ctx.arc(centerX, centerY, pixelRadius, 0, Math.PI * 2, true)
  ctx.closePath()

  // 填充半透明黑色（圆形区域外）- 降低不透明度让边缘更可见
  ctx.fillStyle = 'rgba(0, 0, 0, 0.85)'
  ctx.fill()

  // 绘制更柔和的边缘渐变
  const gradient = ctx.createRadialGradient(
    centerX, centerY, pixelRadius * 0.7,
    centerX, centerY, pixelRadius
  )
  gradient.addColorStop(0, 'rgba(0, 0, 0, 0)')
  gradient.addColorStop(1, 'rgba(0, 0, 0, 0.5)')

  ctx.beginPath()
  ctx.arc(centerX, centerY, pixelRadius, 0, Math.PI * 2)
  ctx.fillStyle = gradient
  ctx.fill()

  ctx.restore()
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

    // 绘制网格
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
      drawPixelRect(ctx, wall.x, wall.y, CELL_SIZE, COLORS.wall)
    })

    // 绘制道具
    state.powerUps.forEach(powerUp => {
      const alpha = 0.6 + 0.4 * Math.sin(Date.now() / 200)
      ctx.globalAlpha = alpha
      drawPixelRect(ctx, powerUp.position.x, powerUp.position.y, CELL_SIZE, powerUp.type.color, true)
      ctx.globalAlpha = 1
    })

    // 绘制食物
    drawPixelRect(ctx, state.food.x, state.food.y, CELL_SIZE, COLORS.food, true)

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

    // 黑暗模式：最后绘制迷雾遮罩
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
