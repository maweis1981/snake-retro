// 移动端触摸控制组件

import { useEffect, useRef, useCallback } from 'react'
import type { Direction } from '../../game'
import styles from './TouchControls.module.css'

interface TouchControlsProps {
  onDirection: (dir: Direction) => void
  onPause: () => void
}

export function TouchControls({ onDirection, onPause }: TouchControlsProps) {
  const touchStartRef = useRef<{ x: number; y: number } | null>(null)

  // 滑动手势检测
  const handleTouchStart = useCallback((e: TouchEvent) => {
    const touch = e.touches[0]
    touchStartRef.current = { x: touch.clientX, y: touch.clientY }
  }, [])

  const handleTouchEnd = useCallback((e: TouchEvent) => {
    if (!touchStartRef.current) return

    const touch = e.changedTouches[0]
    const deltaX = touch.clientX - touchStartRef.current.x
    const deltaY = touch.clientY - touchStartRef.current.y
    const minSwipeDistance = 30

    // 判断滑动方向
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      if (Math.abs(deltaX) > minSwipeDistance) {
        onDirection(deltaX > 0 ? 'RIGHT' : 'LEFT')
      }
    } else {
      if (Math.abs(deltaY) > minSwipeDistance) {
        onDirection(deltaY > 0 ? 'DOWN' : 'UP')
      }
    }

    touchStartRef.current = null
  }, [onDirection])

  useEffect(() => {
    // 只在移动端启用滑动手势
    if ('ontouchstart' in window) {
      document.addEventListener('touchstart', handleTouchStart, { passive: true })
      document.addEventListener('touchend', handleTouchEnd, { passive: true })

      return () => {
        document.removeEventListener('touchstart', handleTouchStart)
        document.removeEventListener('touchend', handleTouchEnd)
      }
    }
  }, [handleTouchStart, handleTouchEnd])

  // 检测是否为移动设备
  const isMobile = 'ontouchstart' in window || navigator.maxTouchPoints > 0

  if (!isMobile) return null

  return (
    <div className={styles.container}>
      {/* 虚拟方向键 */}
      <div className={styles.dpad}>
        <button
          className={`${styles.btn} ${styles.up}`}
          onTouchStart={(e) => { e.preventDefault(); onDirection('UP') }}
        >
          ▲
        </button>
        <button
          className={`${styles.btn} ${styles.left}`}
          onTouchStart={(e) => { e.preventDefault(); onDirection('LEFT') }}
        >
          ◀
        </button>
        <button
          className={`${styles.btn} ${styles.right}`}
          onTouchStart={(e) => { e.preventDefault(); onDirection('RIGHT') }}
        >
          ▶
        </button>
        <button
          className={`${styles.btn} ${styles.down}`}
          onTouchStart={(e) => { e.preventDefault(); onDirection('DOWN') }}
        >
          ▼
        </button>
      </div>

      {/* 暂停按钮 */}
      <button
        className={styles.pauseBtn}
        onTouchStart={(e) => { e.preventDefault(); onPause() }}
      >
        ⏸
      </button>
    </div>
  )
}
