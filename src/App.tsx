// 主应用组件

import { useEffect, useState, useRef } from 'react'
import { useGameState, useInput, useHighscores } from './hooks'
import { Canvas, HUD, Overlay, Settings, TouchControls } from './components'
import { audioSystem, getDailyRecord, saveDailyRecord } from './game'
import type { DailyChallengeRecord } from './game'
import './styles/global.css'
import styles from './App.module.css'

function App() {
  const { state, actions } = useGameState()
  const { highscores, addHighscore, isHighscore } = useHighscores()
  const [isMuted, setIsMuted] = useState(false)
  const [dailyRecord, setDailyRecord] = useState<DailyChallengeRecord | null>(null)
  const prevLevelRef = useRef(state.level)
  const prevScoreRef = useRef(state.score)

  useEffect(() => {
    setDailyRecord(getDailyRecord())
  }, [])

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

  useEffect(() => {
    if (state.status === 'playing') {
      audioSystem.start()
    } else {
      audioSystem.stop()
    }
  }, [state.status])

  useEffect(() => {
    if (state.level > prevLevelRef.current) {
      audioSystem.playSound('levelup')
    }
    prevLevelRef.current = state.level
  }, [state.level])

  useEffect(() => {
    if (state.score > prevScoreRef.current) {
      audioSystem.playSound('eat')
    }
    prevScoreRef.current = state.score
  }, [state.score])

  useEffect(() => {
    if (state.status === 'gameover') {
      audioSystem.playSound('gameover')
    }
  }, [state.status])

  useEffect(() => {
    if (state.status === 'gameover' && state.score > 0) {
      if (state.gameMode === 'daily') {
        const record = saveDailyRecord(state.score, state.level)
        setDailyRecord(record)
      } else if (isHighscore(state.score)) {
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
      <HUD state={state} />
      <div className={styles.gameArea}>
        <Canvas state={state} />
        <Overlay
          state={state}
          highscores={highscores}
          dailyRecord={dailyRecord}
          onStart={actions.startGame}
          onSelectMap={actions.selectMap}
          onSelectMode={actions.selectMode}
        />
      </div>
      <Settings isMuted={isMuted} onToggleMute={handleToggleMute} />
      <TouchControls onDirection={actions.setDirection} onPause={actions.togglePause} />
      <div className="crt-overlay" />
    </div>
  )
}

export default App
