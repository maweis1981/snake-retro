// HUD 组件 - 显示分数、等级、连击

import type { GameState } from '../../game'
import styles from './HUD.module.css'

interface HUDProps {
  state: GameState
}

export function HUD({ state }: HUDProps) {
  const now = Date.now()
  const activeEffects = state.activeEffects.filter(e => e.endTime > now)

  return (
    <div className={styles.hud}>
      <div className={styles.stat}>
        <span className={styles.label}>分数</span>
        <span className={styles.value}>{state.score}</span>
      </div>
      <div className={styles.stat}>
        <span className={styles.label}>等级</span>
        <span className={styles.value}>{state.level}</span>
      </div>
      {state.combo > 1 && (
        <div className={styles.combo}>
          <span className={styles.comboValue}>×{state.combo}</span>
          <span className={styles.comboLabel}>COMBO</span>
        </div>
      )}
      {activeEffects.length > 0 && (
        <div className={styles.effects}>
          {activeEffects.map(effect => {
            const remaining = Math.ceil((effect.endTime - now) / 1000)
            return (
              <div key={effect.id} className={styles.effect}>
                {effect.id} ({remaining}s)
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
