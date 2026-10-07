import { useMemo, useRef, useState } from 'react'
import { searchAll, type SearchResult } from '../utils/search'
import { TYPE_COLORS } from '../constants'

interface Props {
  onPick: (r: SearchResult) => void
}

/** 全局搜索框：画家 / 城市 / 画派，点结果跳转。 */
export function SearchBar({ onPick }: Props) {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const results = useMemo(() => searchAll(query), [query])

  const pick = (r: SearchResult) => {
    onPick(r)
    setQuery('')
    setOpen(false)
    inputRef.current?.blur()
  }

  return (
    <div className="relative">
      <div className="flex items-center gap-2 rounded-md border border-ink-faint/50 bg-white/70 px-2.5 py-1.5 backdrop-blur-sm">
        <span className="text-sm text-ink-faint" aria-hidden="true">
          🔍
        </span>
        <input
          ref={inputRef}
          type="text"
          value={query}
          placeholder="搜索画家 / 城市 / 画派"
          className="w-full bg-transparent text-sm text-ink outline-none placeholder:text-ink-faint"
          onChange={(e) => {
            setQuery(e.target.value)
            setOpen(true)
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          aria-label="全局搜索"
        />
      </div>

      {open && results.length > 0 && (
        <ul className="absolute left-0 right-0 top-full z-30 mt-1 max-h-72 overflow-y-auto rounded-md border border-ink-faint/40 bg-silk py-1 shadow-lg">
          {results.map((r, i) => (
            <li key={`${r.kind}-${r.label}-${i}`}>
              <button
                type="button"
                className="flex w-full items-center gap-2 px-3 py-2 text-left hover:bg-ink/5"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => pick(r)}
              >
                <span
                  className="inline-block h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{
                    background:
                      r.kind === 'type' && r.centerType
                        ? TYPE_COLORS[r.centerType]
                        : r.kind === 'place'
                          ? '#9a9183'
                          : '#2b2620',
                  }}
                  aria-hidden="true"
                />
                <span className="min-w-0">
                  <span className="block truncate text-sm font-semibold text-ink">{r.label}</span>
                  <span className="block truncate text-xs text-ink-muted">{r.sub}</span>
                </span>
                <span className="ml-auto shrink-0 text-xs text-ink-faint">
                  {r.kind === 'figure' ? '画家' : r.kind === 'place' ? '城市' : '画派'}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}

      {open && query && results.length === 0 && (
        <div className="absolute left-0 right-0 top-full z-30 mt-1 rounded-md border border-ink-faint/40 bg-silk px-3 py-2 text-sm text-ink-muted shadow-lg">
          没有找到「{query}」
        </div>
      )}
    </div>
  )
}
