import { useEffect, useRef } from 'react'
import type { DynastyId } from '../types'
import { dynasties } from '../data/load'

interface Props {
  current: DynastyId
  onChange: (id: DynastyId) => void
}

export function Timeline({ current, onChange }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const currentIndex = dynasties.findIndex((d) => d.id === current)

  // 键盘 ← → 切换（F03）
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        e.preventDefault()
        const dir = e.key === 'ArrowLeft' ? -1 : 1
        const next = Math.min(dynasties.length - 1, Math.max(0, currentIndex + dir))
        onChange(dynasties[next].id)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [currentIndex, onChange])

  // 触摸滑动切换（F03：移动端横向滑动）
  const touchStartX = useRef<number | null>(null)
  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
  }
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return
    const dx = e.changedTouches[0].clientX - touchStartX.current
    touchStartX.current = null
    if (Math.abs(dx) < 40) return
    const dir = dx < 0 ? 1 : -1
    const next = Math.min(dynasties.length - 1, Math.max(0, currentIndex + dir))
    onChange(dynasties[next].id)
  }

  return (
    <div
      ref={containerRef}
      className="flex items-center gap-1 overflow-x-auto rounded-lg border border-ink-faint/40 bg-white/70 p-2 backdrop-blur-sm"
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      role="tablist"
      aria-label="朝代时间轴"
    >
      {dynasties.map((d, i) => {
        const active = d.id === current
        const isTransition = i < currentIndex
        return (
          <button
            key={d.id}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(d.id)}
            className={`flex min-w-14 flex-col items-center rounded-md px-2 py-1.5 text-center transition-colors ${
              active
                ? 'bg-ink text-silk'
                : isTransition
                  ? 'bg-ink/10 text-ink'
                  : 'text-ink-muted hover:bg-ink/5'
            }`}
          >
            <span className="text-sm font-bold">{d.name}</span>
            <span className={`text-[10px] ${active ? 'text-silk/80' : 'text-ink-faint'}`}>
              {d.start}
            </span>
          </button>
        )
      })}
    </div>
  )
}
