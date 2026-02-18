// Canvas 渲染器

import { useRef, useEffect, useState } from 'react'
import type { GameState, Position } from '../../game'
import {
  GRID_WIDTH,
  GRID_HEIGHT,
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
  cellSize: number,
  color: string,
  glow: boolean = false
) {
  if (glow) {
    ctx.shadowColor = color
    ctx.shadowBlur = 8
  }
  ctx.fillStyle = color
  ctx.fillRect(x * cellSize + 1, y * cellSize + 1, cellSize - 2, cellSize - 2)
  if (glow) {
    ctx.shadowBlur = 0
  }
}

function drawFogOfWar(ctx: CanvasRenderingContext2D, head: Position, radius: number, cellSize: number) {
  const canvasWidth = GRID_WIDTH * cellSize
  const canvasHeight = GRID_HEIGHT * cellSize
  const centerX = head.x * cellSize + cellSize / 2
  const centerY = head.y * cellSize + cellSize / 2
  const pixelRadius = radius * cellSize

  ctx.save()
  ctx.beginPath()
  ctx.rect(0, 0, canvasWidth, canvasHeight)
  ctx.arc(centerX, centerY, pixelRadius, 0, Math.PI * 2, true)
  ctx.closePath()
  ctx.fillStyle = 'rgba(0, 0, 0, 0.85)'
  ctx.fill()

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
  const containerRef = useRef<HTMLDivElement>(null)
  const [cellSize, setCellSize] = useState(20)
  const now = Date.now()
  const isDarkMode = state.gameMode === 'dark'
  const head = state.snake[0]

  // 计算合适的 cell size 以填满容器
  useEffect(() => {
    const updateSize = () => {
      const container = containerRef.current
      if (!container) return

      const rect = container.getBoundingClientRect()
      const availableWidth = rect.width
      const availableHeight = rect.height

      // 计算能填满屏幕的 cell size
      const cellByWidth = Math.floor(availableWidth / GRID_WIDTH)
      const cellByHeight = Math.floor(availableHeight / GRID_HEIGHT)
      const newCellSize = Math.max(Math.min(cellByWidth, cellByHeight), 10)

      setCellSize(newCellSize)
    }

    updateSize()
    window.addEventListener('resize', updateSize)
    return () => window.removeEventListener('resize', updateSize)
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.imageSmoothingEnabled = false

    ctx.fillStyle = COLORS.background
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    ctx.strokeStyle = isDarkMode ? '#0f0f1a' : COLORS.grid
    ctx.lineWidth = 0.5
    for (let x = 0; x <= GRID_WIDTH; x++) {
      ctx.beginPath()
      ctx.moveTo(x * cellSize, 0)
      ctx.lineTo(x * cellSize, GRID_HEIGHT * cellSize)
      ctx.stroke()
    }
    for (let y = 0; y <= GRID_HEIGHT; y++) {
      ctx.beginPath()
      ctx.moveTo(0, y * cellSize)
      ctx.lineTo(GRID_WIDTH * cellSize, y * cellSize)
      ctx.stroke()
    }

    const map = getMapById(state.selectedMapId)
    map.walls.forEach(wall => {
      drawPixelRect(ctx, wall.x, wall.y, cellSize, COLORS.wall)
    })

    state.powerUps.forEach(powerUp => {
      const alpha = 0.6 + 0.4 * Math.sin(Date.now() / 200)
      ctx.globalAlpha = alpha
      drawPixelRect(ctx, powerUp.position.x, powerUp.position.y, cellSize, powerUp.type.color, true)
      ctx.globalAlpha = 1
    })

    drawPixelRect(ctx, state.food.x, state.food.y, cellSize, COLORS.food, true)

    const isGhost = hasEffect(state, 'ghost', now)
    state.snake.forEach((segment, index) => {
      const isHead = index === 0
      let color = isHead ? COLORS.snakeHead : COLORS.snake

      if (isGhost) {
        ctx.globalAlpha = 0.6
        color = '#c44dff'
      }

      drawPixelRect(ctx, segment.x, segment.y, cellSize, color, isHead)

      if (isGhost) {
        ctx.globalAlpha = 1
      }
    })

    if (isDarkMode && state.status === 'playing') {
      drawFogOfWar(ctx, head, DARK_MODE_VISION_RADIUS, cellSize)
    }
  }, [state, now, isDarkMode, head, cellSize])

  return (
    <div ref={containerRef} className={styles.container}>
      <canvas
        ref={canvasRef}
        width={GRID_WIDTH * cellSize}
        height={GRID_HEIGHT * cellSize}
        className={styles.canvas}
      />
    </div>
  )
}
