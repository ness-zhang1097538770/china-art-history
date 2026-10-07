import type { CenterType } from '../types'
import { TYPE_COLORS, TYPE_DEFINITIONS, TYPE_ORDER } from '../constants'

interface Props {
  hiddenTypes: Set<CenterType>
  onToggleType: (t: CenterType) => void
  onReset: () => void
}

/** 画派类型图例（可点击筛选：点某类隐藏/显示对应气泡）。 */
export function Legend({ hiddenTypes, onToggleType, onReset }: Props) {
  return (
    <div
      className="rounded-lg border border-ink-faint/40 border-t-2 border-t-civic bg-white/70 p-3 backdrop-blur-sm"
      role="list"
      aria-label="画派类型图例"
    >
      <div className="mb-1.5 flex items-center justify-between">
        <span className="text-xs font-semibold text-ink-muted">画派类型（点击筛选）</span>
        {hiddenTypes.size > 0 && (
          <button
            type="button"
            className="text-xs text-court hover:underline"
            onClick={onReset}
            aria-label="重置筛选"
          >
            重置
          </button>
        )}
      </div>
      <ul className="flex flex-wrap gap-x-4 gap-y-1.5">
        {TYPE_ORDER.map((t) => {
          const hidden = hiddenTypes.has(t)
          return (
            <li key={t} className="flex items-center gap-1.5 text-xs text-ink" role="listitem">
              <button
                type="button"
                onClick={() => onToggleType(t)}
                className={`flex items-center gap-1.5 rounded px-0.5 transition-opacity ${
                  hidden ? 'opacity-35' : ''
                }`}
                aria-pressed={!hidden}
                aria-label={`${hidden ? '显示' : '隐藏'}${t}画派`}
              >
                <span
                  className="inline-block h-3 w-3 rounded-full"
                  style={{ background: TYPE_COLORS[t] }}
                  aria-hidden="true"
                />
                <span className="font-semibold">{t}</span>
                <span className="text-ink-faint">· {TYPE_DEFINITIONS[t]}</span>
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
