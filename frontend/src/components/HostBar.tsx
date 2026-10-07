import { useEffect, useRef } from 'react'
import type { Center, Dynasty, Place } from '../types'
import { LOGIC_COLORS } from '../constants'
import { DYNASTY_LINES, cityCue, dynastyCue, scenarioCue } from '../hostVoice'
import type { HostVoice } from '../hooks/useHostVoice'

interface Props {
  dynasty: Dynasty
  selectedPlace?: Place
  selectedCenter?: Center | null
  shareOpen: boolean
  voice: HostVoice
}

/**
 * 阿素讲解条：朝代语音改为手动点播，切换朝代不再自动播，避免声音乱。
 * 点开城市、打开分享仍是自动配一句。
 */
export function HostBar({ dynasty, selectedPlace, selectedCenter, shareOpen, voice }: Props) {
  const { muted, speaking, current, speak, stop, setMuted } = voice

  const prevPlaceRef = useRef<string | undefined>(selectedPlace?.id)
  const prevShareRef = useRef(shareOpen)

  // 开场白（仅挂载时播一次）
  useEffect(() => {
    speak([scenarioCue('open')])
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // 点开城市 → 城市语音；关闭 → 空闲语音
  useEffect(() => {
    const id = selectedPlace?.id
    if (prevPlaceRef.current === id) return
    const previous = prevPlaceRef.current
    prevPlaceRef.current = id
    if (selectedPlace && selectedCenter) {
      speak([
        cityCue(selectedPlace.id, selectedCenter.dynasty, selectedPlace.name, selectedCenter.description),
      ])
    } else if (previous) {
      speak([scenarioCue('idle')])
    }
  }, [selectedPlace, selectedCenter, speak])

  // 打开分享 → 分享语音
  useEffect(() => {
    if (prevShareRef.current === shareOpen) return
    prevShareRef.current = shareOpen
    if (shareOpen) speak([scenarioCue('share')])
  }, [shareOpen, speak])

  const cues = dynastyCue(dynasty)
  const text = current?.text ?? DYNASTY_LINES[dynasty.id]

  return (
    <section className="rounded-lg border border-ink-faint/40 border-t-2 border-t-court bg-white/70 px-3 py-2 backdrop-blur-sm">
      <div className="flex gap-3">
        <div className="relative shrink-0">
          <div
            className={`h-11 w-11 overflow-hidden rounded-full border border-ink-faint/40 bg-silk ${
              speaking ? 'host-speaking' : ''
            }`}
          >
            <img
              src="/img/host/00-头像-圆窗用.png"
              alt="阿素"
              className="h-full w-full object-cover object-top"
            />
          </div>
          <span
            className="absolute -bottom-0.5 -right-0.5 block h-3 w-3 rounded-full border-2 border-white"
            style={{ background: LOGIC_COLORS[dynasty.logic] }}
            aria-hidden="true"
          />
        </div>

        <div className="min-w-0 flex-1">
          <div className="mb-0.5 flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className="text-xs font-semibold text-ink">阿素</span>
            <span className="text-xs text-ink-faint">
              {dynasty.name} · {dynasty.logic}逻辑
            </span>
            <span className="ml-auto flex shrink-0 items-center gap-2">
              <button
                type="button"
                onClick={() => speak(cues)}
                disabled={muted}
                className="rounded border border-court/60 px-2 py-0.5 text-xs font-semibold text-court hover:bg-court/10 disabled:opacity-40"
              >
                {speaking ? '播放中…' : `▶ 播放语音（${cues.length} 段）`}
              </button>
              <button
                type="button"
                onClick={() => {
                  if (muted) {
                    setMuted(false)
                  } else {
                    setMuted(true)
                    stop()
                  }
                }}
                className="rounded border border-ink-faint/60 px-1.5 py-0.5 text-xs text-ink hover:bg-ink/5"
                aria-pressed={muted}
              >
                {muted ? '开启语音' : '关闭语音'}
              </button>
            </span>
          </div>
          <p aria-live="polite" className="text-sm leading-relaxed break-words text-ink">
            {text}
          </p>
        </div>
      </div>
    </section>
  )
}
