// 地图选择器

import { MAPS } from '../../game'
import styles from './MapSelector.module.css'

interface MapSelectorProps {
  selectedMapId: string
  onSelect: (mapId: string) => void
}

export function MapSelector({ selectedMapId, onSelect }: MapSelectorProps) {
  return (
    <div className={styles.container}>
      <h3 className={styles.title}>选择地图</h3>
      <div className={styles.maps}>
        {MAPS.map(map => (
          <button
            key={map.id}
            className={`${styles.mapCard} ${selectedMapId === map.id ? styles.selected : ''}`}
            onClick={() => onSelect(map.id)}
          >
            <div className={styles.mapName}>{map.name}</div>
            <div className={styles.difficulty}>
              {'⭐'.repeat(map.difficulty)}
            </div>
            <div className={styles.description}>{map.description}</div>
          </button>
        ))}
      </div>
    </div>
  )
}
