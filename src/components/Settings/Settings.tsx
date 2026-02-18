// 设置面板组件

import { useState } from 'react'
import { POWERUP_TYPES } from '../../game'
import styles from './Settings.module.css'

interface SettingsProps {
  isMuted: boolean
  onToggleMute: () => void
}

export function Settings({ isMuted, onToggleMute }: SettingsProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <button
        className={styles.settingsBtn}
        onClick={() => setIsOpen(true)}
        aria-label="设置"
      >
        ⚙️
      </button>

      {isOpen && (
        <div className={styles.overlay} onClick={() => setIsOpen(false)}>
          <div className={styles.panel} onClick={e => e.stopPropagation()}>
            <div className={styles.header}>
              <h2>设置</h2>
              <button className={styles.closeBtn} onClick={() => setIsOpen(false)}>
                ✕
              </button>
            </div>

            <div className={styles.section}>
              <h3>音效</h3>
              <button className={styles.toggleBtn} onClick={onToggleMute}>
                {isMuted ? '🔇 音乐已关闭' : '🔊 音乐已开启'}
              </button>
            </div>

            <div className={styles.section}>
              <h3>道具说明</h3>
              <div className={styles.powerupList}>
                {POWERUP_TYPES.map(p => (
                  <div key={p.id} className={styles.powerupItem}>
                    <span
                      className={styles.powerupIcon}
                      style={{ backgroundColor: p.color }}
                    />
                    <div className={styles.powerupInfo}>
                      <span className={styles.powerupName}>{p.name}</span>
                      <span className={styles.powerupDesc}>{p.description}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
