// 键盘输入 Hook

import { useEffect, useCallback } from 'react'
import type { Direction } from '../game'

interface UseInputOptions {
  onDirection: (dir: Direction) => void
  onPause: () => void
  onStart: () => void
  enabled: boolean
}

const KEY_MAP: Record<string, Direction> = {
  ArrowUp: 'UP',
  ArrowDown: 'DOWN',
  ArrowLeft: 'LEFT',
  ArrowRight: 'RIGHT',
  KeyW: 'UP',
  KeyS: 'DOWN',
  KeyA: 'LEFT',
  KeyD: 'RIGHT',
}

export function useInput({ onDirection, onPause, onStart, enabled }: UseInputOptions) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!enabled) return

      const direction = KEY_MAP[e.code]
      if (direction) {
        e.preventDefault()
        onDirection(direction)
        return
      }

      if (e.code === 'Space') {
        e.preventDefault()
        onPause()
        return
      }

      if (e.code === 'Enter') {
        e.preventDefault()
        onStart()
        return
      }
    },
    [enabled, onDirection, onPause, onStart]
  )

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])
}
