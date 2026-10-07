import { useCallback, useEffect, useRef, useState } from 'react'
import { audioUrl, type HostCue } from '../hostVoice'

const MUTE_KEY = 'host-muted'

function readMuted(): boolean {
  try {
    return window.localStorage.getItem(MUTE_KEY) === '1'
  } catch {
    return false
  }
}

function supportsAudio(): boolean {
  return typeof window !== 'undefined' && typeof window.Audio !== 'undefined'
}

export interface HostVoice {
  muted: boolean
  speaking: boolean
  /** 当前正在说的一条，用于屏幕上同步显示文字 */
  current: HostCue | null
  speak: (cues: HostCue[]) => void
  stop: () => void
  setMuted: (muted: boolean) => void
}

/**
 * 阿素的语音播放：统一只用预生成的 mp3（阿素的声音）。
 * 某条 mp3 缺失/损坏时直接跳过（屏幕仍显示文字），不再用浏览器朗读，避免声音混搭。
 */
export function useHostVoice(): HostVoice {
  const [muted, setMutedState] = useState<boolean>(readMuted)
  const [speaking, setSpeaking] = useState(false)
  const [current, setCurrent] = useState<HostCue | null>(null)

  const queueRef = useRef<HostCue[]>([])
  const pendingRef = useRef<HostCue | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const busyRef = useRef(false)
  const mutedRef = useRef(muted)
  const armedRef = useRef(false)
  const advanceRef = useRef<() => void>(() => {})

  useEffect(() => {
    mutedRef.current = muted
  }, [muted])

  const stopAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current = null
    }
  }, [])

  const armUnlock = useCallback(() => {
    if (armedRef.current) return
    armedRef.current = true
    const flush = () => {
      armedRef.current = false
      const cue = pendingRef.current
      pendingRef.current = null
      if (cue && !mutedRef.current) advanceRef.current()
    }
    window.addEventListener('pointerdown', flush, { once: true })
    window.addEventListener('keydown', flush, { once: true })
  }, [])

  const advance = useCallback(() => {
    if (mutedRef.current) {
      busyRef.current = false
      setSpeaking(false)
      setCurrent(null)
      return
    }
    const cue = pendingRef.current ?? queueRef.current.shift()
    pendingRef.current = null
    if (!cue) {
      busyRef.current = false
      setSpeaking(false)
      setCurrent(null)
      return
    }
    busyRef.current = true
    setCurrent(cue)
    setSpeaking(true)

    const onDone = () => advanceRef.current()
    const onBlocked = () => {
      // 无人开口：整队清空，等用户第一次交互时只补播被拦的这一条
      pendingRef.current = cue
      queueRef.current = []
      busyRef.current = false
      setSpeaking(false)
      setCurrent(null)
      armUnlock()
    }

    if (cue.audioKey && supportsAudio()) {
      const audio = new Audio(audioUrl(cue.audioKey))
      audioRef.current = audio
      audio.onended = onDone
      // 音频缺失/损坏 → 直接跳过，保持声音统一（不回落浏览器朗读）
      audio.onerror = onDone
      const played = audio.play()
      if (played && typeof played.catch === 'function') {
        played.catch(() => onBlocked())
      }
      return
    }
    // 没有音频的 cue 直接跳过（静音，屏幕仍显示文字）
    onDone()
  }, [armUnlock])

  useEffect(() => {
    advanceRef.current = advance
  }, [advance])

  const stop = useCallback(() => {
    queueRef.current = []
    pendingRef.current = null
    busyRef.current = false
    stopAudio()
    setSpeaking(false)
    setCurrent(null)
  }, [stopAudio])

  /** 新台词打断当前播放：王朝连点、连续切换城市时不至于叠音 */
  const speak = useCallback(
    (cues: HostCue[]) => {
      stopAudio()
      queueRef.current = [...cues]
      pendingRef.current = null
      busyRef.current = false
      advanceRef.current()
    },
    [stopAudio],
  )

  const setMuted = useCallback(
    (next: boolean) => {
      setMutedState(next)
      try {
        window.localStorage.setItem(MUTE_KEY, next ? '1' : '0')
      } catch {
        // 隐私模式下写不进去，忽略即可
      }
      if (next) stop()
    },
    [stop],
  )

  useEffect(() => stopAudio, [stopAudio])

  return { muted, speaking, current, speak, stop, setMuted }
}
