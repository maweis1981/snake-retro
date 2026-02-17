// Canvas 渲染器

import { useRef, useEffect } from 'react'
import type { GameState } from '../../game'
import {
  GRID_WIDTH,
  GRID_HEIGHT,
  CELL_SIZE,
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

export function Canvas({ state }: CanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const now = Date.now()

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
    ctx.strokeStyle = COLORS.grid
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
  }, [state, now])

  return (
    <canvas
      ref={canvasRef}
      width={GRID_WIDTH * CELL_SIZE}
      height={GRID_HEIGHT * CELL_SIZE}
      className={styles.canvas}
    />
  )
}
