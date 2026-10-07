import { useState } from 'react'
import type { Center, Dynasty, Figure, Place } from '../types'
import { TYPE_COLORS } from '../constants'
import { baiduNavUrl, collectionNavUrl } from '../utils/baiduNav'
import { explain, ttsAudioUrl, type ExplainInstruction } from '../utils/aiExplain'

interface Props {
  place: Place
  dynasty: Dynasty
  center: Center | null
  figures: Figure[]
  onClose: () => void
}

export function DetailDrawer({ place, dynasty, center, figures, onClose }: Props) {
  const [expanded, setExpanded] = useState(false)
  const shownFigures = expanded ? figures : figures.slice(0, 3)

  // AI 讲解（F13）
  const [aiInstruction, setAiInstruction] = useState<ExplainInstruction>('常规')
  const [aiText, setAiText] = useState<string | null>(null)
  const [aiLoading, setAiLoading] = useState(false)
  const [aiError, setAiError] = useState<string | null>(null)

  const generateExplain = async (inst: ExplainInstruction) => {
    if (!center) return
    setAiInstruction(inst)
    setAiLoading(true)
    setAiError(null)
    setAiText(null)
    try {
      const text = await explain({
        city: place.name,
        dynasty: `${dynasty.name}（${dynasty.start}-${dynasty.end}）`,
        type: center.type,
        description: center.description,
        painters: figures.map((f) => f.name).join('、'),
        instruction: inst,
      })
      setAiText(text)
    } catch {
      setAiError('AI 讲解需后端服务，当前演示环境暂未开启')
    } finally {
      setAiLoading(false)
    }
  }

  const readAloud = async () => {
    if (!aiText) return
    try {
      const url = await ttsAudioUrl(aiText)
      const audio = new Audio(url)
      void audio.play().catch(() => {})
    } catch {
      setAiError('朗读失败')
    }
  }

  return (
    <div className="fixed inset-0 z-20" role="dialog" aria-modal="true" aria-label={`${place.name}详情`}>
      <button
        type="button"
        className="absolute inset-0 bg-ink/20"
        aria-label="关闭详情"
        onClick={onClose}
      />
      <div
        className="absolute inset-x-0 bottom-0 max-h-[70vh] overflow-y-auto rounded-t-xl bg-silk p-5 shadow-xl sm:inset-y-0 sm:left-auto sm:right-0 sm:h-full sm:max-h-none sm:w-[380px] sm:rounded-none"
        style={{ borderTop: `3px solid ${center ? TYPE_COLORS[center.type] : '#2b2620'}` }}
      >
        <header className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-ink">{place.name}</h2>
            <p className="text-sm text-ink-muted">
              {dynasty.name} · {dynasty.start}–{dynasty.end}
            </p>
          </div>
          <button
            type="button"
            className="rounded-md px-2 py-1 text-sm text-ink-muted hover:bg-ink/5"
            onClick={onClose}
            aria-label="关闭"
          >
            关闭
          </button>
        </header>

        {center && (
          <div className="mb-4 flex items-center gap-2">
            <span
              className="inline-block h-3 w-3 rounded-full"
              style={{ background: TYPE_COLORS[center.type] }}
              aria-hidden="true"
            />
            <span className="font-semibold text-ink">{center.type}画派</span>
            <span className="text-sm text-ink-muted">{center.note}</span>
          </div>
        )}

        {center && (
          <p className="mb-4 rounded-md border border-ink-faint/40 bg-white/60 p-3 text-sm leading-relaxed text-ink">
            {center.description}
          </p>
        )}

        <p className="mb-4 rounded-md border border-ink-faint/40 bg-white/60 p-3 text-sm leading-relaxed text-ink">
          {dynasty.narrative}
        </p>

        <section className="mb-4">
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-muted">
            今日可看 · 博物馆（建议按序号参观）
          </h3>
          <ul className="flex flex-col gap-1.5">
            {place.museums.map((m, i) => (
              <li
                key={m.name}
                className="flex items-center justify-between gap-2 rounded-md border border-ink-faint/30 bg-white/50 px-2.5 py-1.5"
              >
                <span className="flex min-w-0 items-center gap-2">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-court/10 text-xs font-bold text-court">
                    {i + 1}
                  </span>
                  <span className="min-w-0">
                    <span className="block font-semibold text-ink">{m.name}</span>
                    <span className="block text-xs text-ink-muted">{m.note}</span>
                  </span>
                </span>
                <a
                  href={baiduNavUrl(m.name, m.lng, m.lat)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 rounded-md border border-court/60 px-2 py-1 text-xs font-semibold text-court hover:bg-court/10"
                >
                  导航
                </a>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-muted">
            代表画家
          </h3>
          {figures.length === 0 ? (
            <p className="text-sm text-ink-faint">本阶段暂未收录该地画家</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {shownFigures.map((f) => (
                <li key={f.name} className="rounded-md border border-ink-faint/30 bg-white/50 p-2.5">
                  <div className="flex items-baseline justify-between">
                    <span className="font-semibold text-ink">{f.name}</span>
                    <span className="text-xs text-ink-muted">
                      {f.birth}–{f.death}
                    </span>
                  </div>
                  <ul className="mt-1 flex flex-col gap-0.5">
                    {f.works.map((w) => {
                      const nav = collectionNavUrl(w.collection)
                      return (
                        <li key={w.title} className="text-xs text-ink-muted">
                          《{w.title}》 ·{' '}
                          {nav ? (
                            <a
                              href={nav}
                              target="_blank"
                              rel="noopener noreferrer"
                              title="点此导航到该馆看真迹"
                              className="text-literati underline decoration-dotted underline-offset-2 hover:text-literati/70"
                            >
                              {w.collection}
                            </a>
                          ) : (
                            w.collection
                          )}
                        </li>
                      )
                    })}
                  </ul>
                </li>
              ))}
            </ul>
          )}
          {figures.length > 3 && (
            <button
              type="button"
              className="mt-2 w-full rounded-md border border-ink-faint/40 py-1.5 text-sm text-ink-muted hover:bg-ink/5"
              onClick={() => setExpanded((v) => !v)}
            >
              {expanded ? '收起' : `展开全部 ${figures.length} 位画家`}
            </button>
          )}
        </section>

        {center && (
          <section className="mt-4">
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-muted">
              AI 讲解 · 阿素为你讲
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {(['常规', '细一点', '给孩子听'] as ExplainInstruction[]).map((inst) => (
                <button
                  key={inst}
                  type="button"
                  onClick={() => void generateExplain(inst)}
                  className={`rounded-full px-2.5 py-1 text-xs transition-colors ${
                    aiInstruction === inst
                      ? 'bg-court text-silk'
                      : 'border border-ink-faint/50 text-ink hover:bg-ink/5'
                  }`}
                >
                  {inst}
                </button>
              ))}
            </div>

            {aiLoading && <p className="mt-2 text-xs text-ink-muted">阿素正在想……</p>}
            {aiError && <p className="mt-2 text-xs text-court">{aiError}</p>}

            {aiText && !aiLoading && (
              <div className="mt-2 rounded-md border border-court/30 bg-court/5 p-3">
                <p className="text-sm leading-relaxed text-ink">{aiText}</p>
                <button
                  type="button"
                  onClick={() => void readAloud()}
                  className="mt-2 rounded-md border border-court/60 px-3 py-1 text-xs font-semibold text-court hover:bg-court/10"
                >
                  朗读
                </button>
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  )
}
