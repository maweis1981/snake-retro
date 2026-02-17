// 8-bit 风格音频系统

type NoteFrequency = number

// 音符频率表
const NOTES: Record<string, NoteFrequency> = {
  C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23,
  G4: 392.00, A4: 440.00, B4: 493.88,
  C5: 523.25, D5: 587.33, E5: 659.25, F5: 698.46,
  G5: 783.99, A5: 880.00, B5: 987.77,
}

// 背景音乐旋律（简单的8-bit风格循环）
const BGM_MELODY: { note: string; duration: number }[] = [
  { note: 'E4', duration: 0.15 },
  { note: 'G4', duration: 0.15 },
  { note: 'A4', duration: 0.15 },
  { note: 'G4', duration: 0.15 },
  { note: 'E4', duration: 0.15 },
  { note: 'G4', duration: 0.15 },
  { note: 'A4', duration: 0.3 },
  { note: 'G4', duration: 0.15 },
  { note: 'A4', duration: 0.15 },
  { note: 'B4', duration: 0.15 },
  { note: 'A4', duration: 0.15 },
  { note: 'G4', duration: 0.15 },
  { note: 'E4', duration: 0.15 },
  { note: 'D4', duration: 0.3 },
  { note: 'E4', duration: 0.15 },
  { note: 'G4', duration: 0.15 },
  { note: 'A4', duration: 0.15 },
  { note: 'G4', duration: 0.15 },
  { note: 'E4', duration: 0.15 },
  { note: 'D4', duration: 0.15 },
  { note: 'C4', duration: 0.3 },
  { note: 'D4', duration: 0.15 },
  { note: 'E4', duration: 0.15 },
  { note: 'G4', duration: 0.15 },
  { note: 'A4', duration: 0.15 },
  { note: 'G4', duration: 0.15 },
  { note: 'E4', duration: 0.15 },
  { note: 'G4', duration: 0.3 },
]

class AudioSystem {
  private audioContext: AudioContext | null = null
  private masterGain: GainNode | null = null
  private isPlaying = false
  private isMuted = false
  private currentNoteIndex = 0
  private nextNoteTime = 0
  private schedulerInterval: number | null = null

  constructor() {
    this.init()
  }

  private init() {
    try {
      this.audioContext = new AudioContext()
      this.masterGain = this.audioContext.createGain()
      this.masterGain.connect(this.audioContext.destination)
      this.masterGain.gain.value = 0.15
    } catch {
      console.warn('Web Audio API not supported')
    }
  }

  private playNote(frequency: number, startTime: number, duration: number) {
    if (!this.audioContext || !this.masterGain) return

    // 方波振荡器（8-bit风格）
    const osc = this.audioContext.createOscillator()
    osc.type = 'square'
    osc.frequency.value = frequency

    // 音量包络
    const gainNode = this.audioContext.createGain()
    gainNode.gain.setValueAtTime(0.3, startTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration * 0.9)

    osc.connect(gainNode)
    gainNode.connect(this.masterGain)

    osc.start(startTime)
    osc.stop(startTime + duration)
  }

  private scheduleNotes() {
    if (!this.audioContext || !this.isPlaying) return

    const scheduleAheadTime = 0.1
    const currentTime = this.audioContext.currentTime

    while (this.nextNoteTime < currentTime + scheduleAheadTime) {
      const note = BGM_MELODY[this.currentNoteIndex]
      const frequency = NOTES[note.note]

      if (frequency && !this.isMuted) {
        this.playNote(frequency, this.nextNoteTime, note.duration)
      }

      this.nextNoteTime += note.duration
      this.currentNoteIndex = (this.currentNoteIndex + 1) % BGM_MELODY.length
    }
  }

  start() {
    if (this.isPlaying || !this.audioContext) return

    // 恢复被暂停的 AudioContext
    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume()
    }

    this.isPlaying = true
    this.nextNoteTime = this.audioContext.currentTime
    this.currentNoteIndex = 0

    this.schedulerInterval = window.setInterval(() => {
      this.scheduleNotes()
    }, 25)
  }

  stop() {
    this.isPlaying = false
    if (this.schedulerInterval) {
      clearInterval(this.schedulerInterval)
      this.schedulerInterval = null
    }
  }

  toggleMute(): boolean {
    this.isMuted = !this.isMuted
    if (this.masterGain) {
      this.masterGain.gain.value = this.isMuted ? 0 : 0.15
    }
    return this.isMuted
  }

  getMuted(): boolean {
    return this.isMuted
  }

  // 播放音效
  playSound(type: 'eat' | 'powerup' | 'levelup' | 'gameover') {
    if (!this.audioContext || !this.masterGain || this.isMuted) return

    const now = this.audioContext.currentTime

    switch (type) {
      case 'eat':
        this.playNote(NOTES.C5, now, 0.05)
        this.playNote(NOTES.E5, now + 0.05, 0.05)
        break
      case 'powerup':
        this.playNote(NOTES.C5, now, 0.1)
        this.playNote(NOTES.E5, now + 0.1, 0.1)
        this.playNote(NOTES.G5, now + 0.2, 0.1)
        break
      case 'levelup':
        this.playNote(NOTES.C5, now, 0.1)
        this.playNote(NOTES.E5, now + 0.1, 0.1)
        this.playNote(NOTES.G5, now + 0.2, 0.1)
        this.playNote(NOTES.C5, now + 0.3, 0.2)
        break
      case 'gameover':
        this.playNote(NOTES.E4, now, 0.2)
        this.playNote(NOTES.D4, now + 0.2, 0.2)
        this.playNote(NOTES.C4, now + 0.4, 0.4)
        break
    }
  }
}

// 单例
export const audioSystem = new AudioSystem()
