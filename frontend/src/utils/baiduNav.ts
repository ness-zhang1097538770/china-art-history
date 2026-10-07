import { places } from '../data/load'

/** 生成百度地图「定位到博物馆」的链接（BD-09 坐标，直接标注位置，不请求定位权限）。 */
export function baiduNavUrl(name: string, lng: number, lat: number): string {
  const title = encodeURIComponent(name)
  return `https://api.map.baidu.com/marker?location=${lat},${lng}&title=${title}&output=html&src=artmap`
}

const MUSEUM_COORDS = new Map<string, { lng: number; lat: number }>()
for (const p of places) {
  for (const m of p.museums) {
    MUSEUM_COORDS.set(m.name, { lng: m.lng, lat: m.lat })
  }
}

// 额外的收藏机构坐标（不属于 13 个艺术中心城市的馆藏，BD-09）
const EXTRA_MUSEUMS: Record<string, { lng: number; lat: number }> = {
  辽宁省博物馆: { lng: 123.4477, lat: 41.80826 },
  天津博物馆: { lng: 117.21082, lat: 39.0929 },
  中国美术馆: { lng: 116.41763, lat: 39.92769 },
  台北故宫博物院: { lng: 121.55826, lat: 25.10544 },
}
for (const [name, coord] of Object.entries(EXTRA_MUSEUMS)) {
  MUSEUM_COORDS.set(name, coord)
}

/** 收藏机构如果是已收录的博物馆，返回导航链接；否则返回 null（如传世摹本、海外馆藏）。 */
export function collectionNavUrl(collection: string): string | null {
  const coord = MUSEUM_COORDS.get(collection)
  if (!coord) return null
  return baiduNavUrl(collection, coord.lng, coord.lat)
}
