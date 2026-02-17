// 道具系统

import type { PowerUpType } from './types'

export const POWERUP_TYPES: PowerUpType[] = [
  {
    id: 'speed',
    name: '加速',
    color: '#3af0ff',
    type: 'duration',
    duration: 5000,
    description: '移动速度 ×1.5',
  },
  {
    id: 'slow',
    name: '减速',
    color: '#ffe135',
    type: 'duration',
    duration: 6000,
    description: '移动速度 ×0.6',
  },
  {
    id: 'ghost',
    name: '穿墙',
    color: '#c44dff',
    type: 'duration',
    duration: 7000,
    description: '可穿越边界和障碍物',
  },
  {
    id: 'bomb',
    name: '炸弹',
    color: '#ff3a3a',
    type: 'instant',
    description: '消除蛇身末尾 3 节',
  },
  {
    id: 'shrink',
    name: '缩短',
    color: '#ff8c00',
    type: 'instant',
    description: '消除蛇身末尾 3 节 + 得 5 分',
  },
  {
    id: 'double',
    name: '双倍',
    color: '#00ff88',
    type: 'duration',
    duration: 8000,
    description: '得分 ×2',
  },
]

export function getRandomPowerUpType(): PowerUpType {
  return POWERUP_TYPES[Math.floor(Math.random() * POWERUP_TYPES.length)]
}

export function getPowerUpById(id: string): PowerUpType | undefined {
  return POWERUP_TYPES.find(p => p.id === id)
}
