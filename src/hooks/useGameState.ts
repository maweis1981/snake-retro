// 游戏状态管理 Hook

import { useReducer, useCallback, useEffect, useRef } from 'react'
import type { GameState, Direction } from '../game'
import {
  createInitialState,
  tick as gameTick,
  setDirection,
  startGame,
  togglePause,
  selectMap,
} from '../game'

type GameAction =
  | { type: 'TICK'; now: number }
  | { type: 'SET_DIRECTION'; direction: Direction }
  | { type: 'START_GAME' }
  | { type: 'TOGGLE_PAUSE' }
  | { type: 'SELECT_MAP'; mapId: string }
  | { type: 'RESET' }

function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'TICK':
      return gameTick(state, action.now)
    case 'SET_DIRECTION':
      return setDirection(state, action.direction)
    case 'START_GAME':
      return startGame(state)
    case 'TOGGLE_PAUSE':
      return togglePause(state)
    case 'SELECT_MAP':
      return selectMap(state, action.mapId)
    case 'RESET':
      return createInitialState(state.selectedMapId)
    default:
      return state
  }
}

export function useGameState() {
  const [state, dispatch] = useReducer(gameReducer, 'classic', createInitialState)
  const lastTickRef = useRef<number>(0)
  const animationFrameRef = useRef<number>(0)

  const tick = useCallback(() => {
    const now = Date.now()
    if (now - lastTickRef.current >= state.tickInterval) {
      dispatch({ type: 'TICK', now })
      lastTickRef.current = now
    }
    animationFrameRef.current = requestAnimationFrame(tick)
  }, [state.tickInterval])

  useEffect(() => {
    if (state.status === 'playing') {
      lastTickRef.current = Date.now()
      animationFrameRef.current = requestAnimationFrame(tick)
    }
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [state.status, tick])

  const actions = {
    setDirection: (dir: Direction) => dispatch({ type: 'SET_DIRECTION', direction: dir }),
    startGame: () => dispatch({ type: 'START_GAME' }),
    togglePause: () => dispatch({ type: 'TOGGLE_PAUSE' }),
    selectMap: (mapId: string) => dispatch({ type: 'SELECT_MAP', mapId }),
    reset: () => dispatch({ type: 'RESET' }),
  }

  return { state, actions }
}
