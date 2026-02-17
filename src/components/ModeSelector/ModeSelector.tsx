// 游戏模式选择器

import type { GameMode } from '../../game'
import { GAME_MODES } from '../../game'
import styles from './ModeSelector.module.css'

interface ModeSelectorProps {
  selectedMode: GameMode
  onSelect: (mode: GameMode) => void
}

export function ModeSelector({ selectedMode, onSelect }: ModeSelectorProps) {
  return (
    <div className={styles.container}>
      <h3 className={styles.title}>游戏模式</h3>
      <div className={styles.modes}>
        {GAME_MODES.map(mode => (
          <button
            key={mode.id}
            className={`${styles.modeCard} ${selectedMode === mode.id ? styles.selected : ''}`}
            onClick={() => onSelect(mode.id)}
          >
            <span className={styles.icon}>{mode.icon}</span>
            <div className={styles.info}>
              <span className={styles.name}>{mode.name}</span>
              <span className={styles.desc}>{mode.description}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
