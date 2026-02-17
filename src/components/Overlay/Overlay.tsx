// 游戏覆盖层 - 菜单、暂停、游戏结束

import type { GameState, HighscoreEntry, GameMode, DailyChallengeRecord } from '../../game'
import { GAME_MODES, getDailyDifficulty, getTodayString } from '../../game'
import { MapSelector } from '../MapSelector'
import { ModeSelector } from '../ModeSelector'
import styles from './Overlay.module.css'

interface OverlayProps {
  state: GameState
  highscores: HighscoreEntry[]
  dailyRecord: DailyChallengeRecord | null
  onStart: () => void
  onSelectMap: (mapId: string) => void
  onSelectMode: (mode: GameMode) => void
}

export function Overlay({ state, highscores, dailyRecord, onStart, onSelectMap, onSelectMode }: OverlayProps) {
  if (state.status === 'playing') return null

  const currentMode = GAME_MODES.find(m => m.id === state.gameMode)
  const isDaily = state.gameMode === 'daily'

  return (
    <div className={styles.overlay}>
      <div className={styles.content}>
        {state.status === 'menu' && (
          <>
            <h1 className={styles.title}>SNAKE RETRO</h1>
            <ModeSelector selectedMode={state.gameMode} onSelect={onSelectMode} />

            {isDaily ? (
              <div className={styles.dailyInfo}>
                <div className={styles.dailyDate}>📅 {getTodayString()}</div>
                <div className={styles.dailyDifficulty}>难度: {getDailyDifficulty()}</div>
                {dailyRecord && (
                  <div className={styles.dailyBest}>
                    今日最佳: {dailyRecord.score} 分 (第 {dailyRecord.attempts} 次)
                  </div>
                )}
              </div>
            ) : (
              <MapSelector selectedMapId={state.selectedMapId} onSelect={onSelectMap} />
            )}

            <button className={styles.startButton} onClick={onStart}>
              {isDaily ? '开始挑战' : '开始游戏'}
            </button>
            <div className={styles.controls}>
              <p>方向键 / WASD 移动</p>
              <p>空格键 暂停</p>
            </div>
          </>
        )}

        {state.status === 'paused' && (
          <>
            <h2 className={styles.pauseTitle}>暂停</h2>
            <p className={styles.hint}>按空格继续</p>
          </>
        )}

        {state.status === 'gameover' && (
          <>
            <h2 className={styles.gameoverTitle}>游戏结束</h2>
            <div className={styles.modeTag}>
              {currentMode?.icon} {currentMode?.name}模式
            </div>
            <div className={styles.finalScore}>
              <span>最终得分</span>
              <span className={styles.scoreValue}>{state.score}</span>
            </div>
            <div className={styles.finalLevel}>
              <span>等级</span>
              <span>{state.level}</span>
            </div>

            {isDaily && dailyRecord && (
              <div className={styles.dailyResult}>
                <div>今日最佳: {dailyRecord.score} 分</div>
                <div>挑战次数: {dailyRecord.attempts}</div>
              </div>
            )}

            <button className={styles.startButton} onClick={onStart}>
              再来一局
            </button>
            {!isDaily && highscores.length > 0 && (
              <div className={styles.highscores}>
                <h3>排行榜</h3>
                <ol>
                  {highscores.slice(0, 5).map((entry, i) => (
                    <li key={i}>
                      {entry.score} - Lv.{entry.level}
                    </li>
                  ))}
                </ol>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
