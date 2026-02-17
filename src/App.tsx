// 主应用组件

import { useEffect, useState, useRef } from 'react'
import { useGameState, useInput, useHighscores } from './hooks'
import { Canvas, HUD, Overlay, PowerUpLegend, TouchControls } from './components'
import { audioSystem } from './game'
import './styles/global.css'
import styles from './App.module.css'

function App() {
  const { state, actions } = useGameState()
  const { highscores, addHighscore, isHighscore } = useHighscores()
  const [isMuted, setIsMuted] = useState(false)
  const prevLevelRef = useRef(state.level)
  const prevScoreRef = useRef(state.score)

  useInput({
    onDirection: actions.setDirection,
    onPause: actions.togglePause,
    onStart: () => {
      if (state.status === 'menu' || state.status === 'gameover') {
        actions.startGame()
      }
    },
    enabled: true,
  })

  // 音乐控制
  useEffect(() => {
    if (state.status === 'playing') {
      audioSystem.start()
    } else if (state.status === 'gameover') {
      audioSystem.stop()
      audioSystem.playSound('gameover')
    } else if (state.status === 'paused' || state.status === 'menu') {
      audioSystem.stop()
    }
  }, [state.status])

  // 音效：吃食物、升级
  useEffect(() => {
    if (state.status !== 'playing') return

    if (state.level > prevLevelRef.current) {
      audioSystem.playSound('levelup')
    } else if (state.score > prevScoreRef.current) {
      audioSystem.playSound('eat')
    }

    prevLevelRef.current = state.level
    prevScoreRef.current = state.score
  }, [state.score, state.level, state.status])

  // 游戏结束时保存高分
  useEffect(() => {
    if (state.status === 'gameover' && state.score > 0) {
      if (isHighscore(state.score)) {
        addHighscore({
          name: 'Player',
          score: state.score,
          level: state.level,
          mapId: state.selectedMapId,
        })
      }
    }
  }, [state.status])

  const handleToggleMute = () => {
    const muted = audioSystem.toggleMute()
    setIsMuted(muted)
  }

  return (
    <div className={styles.app}>
      <div className={styles.gameContainer}>
        <HUD state={state} />
        <div className={styles.canvasWrapper}>
          <Canvas state={state} />
          <Overlay
            state={state}
            highscores={highscores}
            onStart={actions.startGame}
            onSelectMap={actions.selectMap}
            onSelectMode={actions.selectMode}
          />
        </div>
      </div>
      <aside className={styles.sidebar}>
        <PowerUpLegend />
        <button className={styles.muteButton} onClick={handleToggleMute}>
          {isMuted ? '🔇 音乐关' : '🔊 音乐开'}
        </button>
      </aside>
      <TouchControls onDirection={actions.setDirection} onPause={actions.togglePause} />
      <div className="crt-overlay" />
    </div>
  )
}

export default App
