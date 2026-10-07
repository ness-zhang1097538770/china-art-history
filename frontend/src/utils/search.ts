import type { CenterType, Figure, Place } from '../types'
import { centers, dynasties, figures, places } from '../data/load'
import { TYPE_DEFINITIONS } from '../constants'

export interface SearchResult {
  kind: 'figure' | 'place' | 'type'
  label: string
  sub: string
  figure?: Figure
  place?: Place
  centerType?: CenterType
}

const TYPE_LABELS: Record<CenterType, string> = {
  宫廷: '宫廷画派',
  文人: '文人画派',
  宗教: '宗教画派',
  市民: '市民画派',
}

/** 全局搜索：画家名 / 城市名 / 画派类型。 */
export function searchAll(query: string): SearchResult[] {
  const q = query.trim()
  if (!q) return []
  const results: SearchResult[] = []

  // 画家
  for (const f of figures) {
    if (f.name.includes(q)) {
      const dynasty = dynasties.find((d) => d.id === f.dynasty)
      const place = places.find((p) => p.id === f.place)
      results.push({
        kind: 'figure',
        label: f.name,
        sub: `${dynasty?.name ?? ''} · ${place?.name ?? ''}`,
        figure: f,
      })
    }
  }

  // 城市（该城市作为艺术中心出现的朝代）
  for (const p of places) {
    if (p.name.includes(q)) {
      const cs = centers.filter((c) => c.place === p.id)
      if (cs.length > 0) {
        const names = [...new Set(cs.map((c) => dynasties.find((d) => d.id === c.dynasty)?.name ?? ''))]
        results.push({
          kind: 'place',
          label: p.name,
          sub: `艺术中心 · ${names.join(' / ')}`,
          place: p,
        })
      }
    }
  }

  // 画派类型
  for (const t of ['宫廷', '文人', '宗教', '市民'] as CenterType[]) {
    if (TYPE_LABELS[t].includes(q) || t.includes(q) || q.includes('画派')) {
      results.push({
        kind: 'type',
        label: TYPE_LABELS[t],
        sub: TYPE_DEFINITIONS[t],
        centerType: t,
      })
    }
  }

  return results.slice(0, 12)
}

/** 城市作为艺术中心时，活跃度最高的朝代（用于搜索跳转）。 */
export function primaryDynastyOfPlace(placeId: string): string {
  const cs = centers.filter((c) => c.place === placeId)
  cs.sort((a, b) => b.weight - a.weight)
  return cs[0]?.dynasty ?? 'tang'
}
