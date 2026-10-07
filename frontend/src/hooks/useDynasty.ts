import { useMemo, useState } from 'react'
import type { Dynasty, DynastyId } from '../types'
import { centers, dynasties, figures, places } from '../data/load'

/** 迁移轨迹主中心顺序（PRD 附录 A）：西安 → 南京 → 开封 → 杭州 → 苏州 → 北京 */
export const ROUTE: { place: string; dynasty: DynastyId }[] = [
  { place: 'xian', dynasty: 'tang' },
  { place: 'nanjing', dynasty: 'wudai' },
  { place: 'kaifeng', dynasty: 'song_n' },
  { place: 'hangzhou', dynasty: 'song_s' },
  { place: 'suzhou', dynasty: 'yuan' },
  { place: 'beijing', dynasty: 'qing' },
]

/** 每个朝代对应的轨迹截止索引（明与元同以苏州为主中心） */
const ROUTE_INDEX: Record<DynastyId, number> = {
  tang: 0,
  wudai: 1,
  song_n: 2,
  song_s: 3,
  yuan: 4,
  ming: 4,
  qing: 5,
}

export function routeForDynasty(dynasty: DynastyId): { place: string; dynasty: DynastyId }[] {
  const end = ROUTE_INDEX[dynasty]
  return ROUTE.slice(0, end + 1)
}

export function useDynasty(initial: DynastyId = 'tang') {
  const [currentDynasty, setCurrentDynasty] = useState<DynastyId>(initial)

  const dynasty = useMemo<Dynasty>(
    () => dynasties.find((d) => d.id === currentDynasty) ?? dynasties[0],
    [currentDynasty],
  )

  const dynastyCenters = useMemo(
    () => centers.filter((c) => c.dynasty === currentDynasty),
    [currentDynasty],
  )

  const dynastyFigures = useMemo(
    () => figures.filter((f) => f.dynasty === currentDynasty),
    [currentDynasty],
  )

  const placeMap = useMemo(() => new Map(places.map((p) => [p.id, p])), [])

  const route = useMemo(() => routeForDynasty(currentDynasty), [currentDynasty])

  return {
    currentDynasty,
    setCurrentDynasty,
    dynasty,
    dynastyCenters,
    dynastyFigures,
    placeMap,
    route,
  }
}
