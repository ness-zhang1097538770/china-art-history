import type { Center, Dynasty, Place } from '../types'
import { TYPE_COLORS } from '../constants'

interface Props {
  dynasty: Dynasty
  dynastyCenters: Center[]
  placeMap: Map<string, Place>
  onSelectCenter: (placeId: string) => void
}

export function InfoPanel({ dynasty, dynastyCenters, placeMap, onSelectCenter }: Props) {
  const sorted = [...dynastyCenters].sort((a, b) => b.weight - a.weight)

  return (
    <aside
      className="flex h-full flex-col gap-4 overflow-y-auto rounded-lg border border-ink-faint/40 border-t-2 border-t-religion bg-white/70 p-4 backdrop-blur-sm"
      aria-label={`${dynasty.name}信息区`}
    >
      <header>
        <h2 className="text-xl font-bold text-ink">{dynasty.name}</h2>
        <p className="mt-0.5 text-sm text-ink-muted">
          {dynasty.start}–{dynasty.end} 年
        </p>
      </header>

      <p className="text-sm leading-relaxed text-ink">{dynasty.narrative}</p>

      <section>
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-muted">
          艺术中心（按活跃度）
        </h3>
        <ul className="flex flex-col gap-1.5">
          {sorted.map((c) => {
            const place = placeMap.get(c.place)
            return (
              <li key={c.place}>
                <button
                  type="button"
                  onClick={() => onSelectCenter(c.place)}
                  className="group w-full rounded-md px-2 py-1.5 text-left transition-colors hover:bg-ink/10"
                >
                  <span className="flex items-center gap-2">
                    <span
                      className="inline-block h-2.5 w-2.5 shrink-0 rounded-full"
                      style={{ background: TYPE_COLORS[c.type] }}
                      aria-hidden="true"
                    />
                    <span className="font-semibold text-ink">{place?.name ?? c.place}</span>
                    <span className="text-xs text-ink-faint">{c.type}</span>
                    <span className="ml-auto flex items-center gap-1 text-xs text-ink-muted">
                      活跃 {Math.round(c.weight * 100)}%
                      <span className="text-ink-faint transition-transform group-hover:translate-x-0.5">›</span>
                    </span>
                  </span>
                  <span className="mt-1 flex items-center gap-2">
                    <span className="h-1 flex-1 overflow-hidden rounded-full bg-ink/10">
                      <span
                        className="block h-1 rounded-full"
                        style={{ width: `${c.weight * 100}%`, background: TYPE_COLORS[c.type] }}
                      />
                    </span>
                    <span className="shrink-0 text-[10px] text-ink-faint">{c.note}</span>
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
      </section>
    </aside>
  )
}
