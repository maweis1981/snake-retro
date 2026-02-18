// 移动端触摸控制 - 底部虚拟按键

import { useEffect, useState, useCallback } from 'react'
import type { Direction } from '../../game'
import styles from './TouchControls.module.css'

interface TouchControlsProps {
  onDirection: (dir: Direction) => void
  onPause: () => void
}

export function TouchControls({ onDirection, onPause }: TouchControlsProps) {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      const hasTouchScreen = 'ontouchstart' in window || navigator.maxTouchPoints > 0
      const isSmallScreen = window.innerWidth <= 1024
      setIsMobile(hasTouchScreen || isSmallScreen)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const handleDirection = useCallback((dir: Direction) => (e: React.TouchEvent) => {
    e.preventDefault()
    e.stopPropagation()
    onDirection(dir)
  }, [onDirection])

  if (!isMobile) return null

  return (
    <div className={styles.container}>
      {/* 左侧：上下按钮 */}
      <div className={styles.leftPad}>
        <button
          className={styles.dirBtn}
          onTouchStart={handleDirection('UP')}
        >
          ▲
        </button>
        <button
          className={styles.dirBtn}
          onTouchStart={handleDirection('DOWN')}
        >
          ▼
        </button>
      </div>

      {/* 中间：暂停按钮 */}
      <button
        className={styles.pauseBtn}
        onTouchStart={(e) => { e.preventDefault(); e.stopPropagation(); onPause() }}
      >
        ⏸
      </button>

      {/* 右侧：左右按钮 */}
      <div className={styles.rightPad}>
        <button
          className={styles.dirBtn}
          onTouchStart={handleDirection('LEFT')}
        >
          ◀
        </button>
        <button
          className={styles.dirBtn}
          onTouchStart={handleDirection('RIGHT')}
        >
          ▶
        </button>
      </div>
    </div>
  )
}
