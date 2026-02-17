// 道具图例

import { POWERUP_TYPES } from '../../game'
import styles from './PowerUpLegend.module.css'

export function PowerUpLegend() {
  return (
    <div className={styles.legend}>
      <h3 className={styles.title}>道具</h3>
      <div className={styles.items}>
        {POWERUP_TYPES.map(type => (
          <div key={type.id} className={styles.item}>
            <div
              className={styles.color}
              style={{ backgroundColor: type.color, boxShadow: `0 0 8px ${type.color}` }}
            />
            <div className={styles.info}>
              <span className={styles.name}>{type.name}</span>
              <span className={styles.desc}>{type.description}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
