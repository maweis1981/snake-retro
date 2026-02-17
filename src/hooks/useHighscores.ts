// 高分榜 Hook

import { useState, useEffect, useCallback } from 'react'
import type { HighscoreEntry } from '../game'

const STORAGE_KEY = 'snake_retro_highscores'
const MAX_ENTRIES = 10

export function useHighscores() {
  const [highscores, setHighscores] = useState<HighscoreEntry[]>([])

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        setHighscores(JSON.parse(stored))
      }
    } catch {
      // ignore
    }
  }, [])

  const addHighscore = useCallback((entry: Omit<HighscoreEntry, 'date'>) => {
    const newEntry: HighscoreEntry = {
      ...entry,
      date: new Date().toISOString(),
    }

    setHighscores(prev => {
      const updated = [...prev, newEntry]
        .sort((a, b) => b.score - a.score)
        .slice(0, MAX_ENTRIES)

      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
      } catch {
        // ignore
      }

      return updated
    })
  }, [])

  const clearHighscores = useCallback(() => {
    setHighscores([])
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch {
      // ignore
    }
  }, [])

  const isHighscore = useCallback(
    (score: number) => {
      if (highscores.length < MAX_ENTRIES) return score > 0
      return score > highscores[highscores.length - 1].score
    },
    [highscores]
  )

  return { highscores, addHighscore, clearHighscores, isHighscore }
}
