import { useState } from 'react'
import type { Dynasty } from '../types'
import { LOGIC_COLORS, LOGIC_DEFINITIONS, LOGIC_ORDER } from '../constants'

interface Props {
  dynasty: Dynasty
}

/** 主线导读（F 增强）：讲清「为什么中心一路往南」的三条逻辑，并标注当前朝代属于哪条。 */
export function GuidePanel({ dynasty }: Props) {
  const [open, setOpen] = useState(false)

  return (
    <section className="rounded-lg border border-ink-faint/40 border-t-2 border-t-literati bg-white/60 backdrop-blur-sm">
      <button
        type="button"
        className="flex w-full items-center justify-between px-3 py-2 text-left"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="guide-body"
      >
        <span className="flex items-center gap-2">
          <span
            className="inline-block h-2.5 w-2.5 rounded-full"
            style={{ background: LOGIC_COLORS[dynasty.logic] }}
            aria-hidden="true"
          />
          <span className="text-sm font-semibold text-ink">
            {dynasty.name} · {dynasty.logic}逻辑
          </span>
        </span>
        <span className="text-xs text-ink-muted">{open ? '收起' : '为什么一路往南'}</span>
      </button>

      {open && (
        <div id="guide-body" className="border-t border-ink-faint/40 px-3 py-3">
          <p className="mb-2 text-sm leading-relaxed text-ink">
            艺术中心随三条逻辑一路南移：先是跟着首都走（政治），后来跟着文人走（文化），最后跟着市场走（经济）。
          </p>
          <ul className="flex flex-col gap-1.5">
            {LOGIC_ORDER.map((l) => {
              const active = l === dynasty.logic
              return (
                <li
                  key={l}
                  className={`flex items-start gap-2 rounded-md px-2 py-1.5 text-sm ${
                    active ? 'bg-ink/5' : ''
                  }`}
                >
                  <span
                    className="mt-1 inline-block h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{ background: LOGIC_COLORS[l] }}
                    aria-hidden="true"
                  />
                  <span>
                    <span className="font-semibold text-ink">{l}逻辑</span>
                    <span className="text-ink-muted"> · {LOGIC_DEFINITIONS[l]}</span>
                    {active && (
                      <span className="mt-0.5 block text-xs text-ink-faint">
                        {dynasty.name}：{dynasty.logicNote}
                      </span>
                    )}
                  </span>
                </li>
              )
            })}
          </ul>
        </div>
      )}
    </section>
  )
}
