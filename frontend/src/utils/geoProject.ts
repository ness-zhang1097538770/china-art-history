import chinaJson from '../data/china.json'

interface ChinaFeature {
  type: 'Feature'
  properties: { name: string }
  geometry: {
    type: string
    coordinates: number[][][] | number[][][][]
  }
}

const features = (chinaJson as { features: ChinaFeature[] }).features.filter(
  (f) => Boolean(f.properties.name),
)

/** 把 Polygon / MultiPolygon 统一成「多个多边形、每个多边形多个环」的结构。 */
function polygonsOf(f: ChinaFeature): number[][][][] {
  return f.geometry.type === 'MultiPolygon'
    ? (f.geometry.coordinates as number[][][][])
    : [f.geometry.coordinates as number[][][]]
}

/** 计算全国经纬度边界框 */
let minLng = Infinity
let maxLng = -Infinity
let minLat = Infinity
let maxLat = -Infinity
for (const f of features) {
  for (const poly of polygonsOf(f)) {
    for (const ring of poly) {
      for (const [lng, lat] of ring) {
        if (lng < minLng) minLng = lng
        if (lng > maxLng) maxLng = lng
        if (lat < minLat) minLat = lat
        if (lat > maxLat) maxLat = lat
      }
    }
  }
}

const W = 640
const midLatRad = ((minLat + maxLat) / 2) * (Math.PI / 180)
const lngSpan = maxLng - minLng
const latSpan = maxLat - minLat
/** 按中纬度 cos 修正长宽比，保证地图不变形 */
const H = Math.round((W * latSpan) / (lngSpan * Math.cos(midLatRad)))

export const CHINA_VIEWBOX = { width: W, height: H }

/** 经纬度 → SVG 画布坐标（等距圆柱投影，配合上面的长宽比即近似正形）。 */
export function projectLngLat(lng: number, lat: number): { x: number; y: number } {
  const x = ((lng - minLng) / lngSpan) * W
  const y = ((maxLat - lat) / latSpan) * H
  return { x, y }
}

function ringToPath(ring: number[][]): string {
  const pts = ring
    .map(([lng, lat]) => {
      const { x, y } = projectLngLat(lng, lat)
      return `${x.toFixed(1)},${y.toFixed(1)}`
    })
    .join(' ')
  return `M${pts}Z`
}

export interface ProvinceShape {
  name: string
  d: string
}

/** 省界形状（已投影为 SVG path），供离线地图兜底渲染。 */
export const provinceShapes: ProvinceShape[] = features.map((f) => {
  const d = polygonsOf(f)
    .map((poly) => poly.map((ring) => ringToPath(ring)).join(' '))
    .join(' ')
  return { name: f.properties.name, d }
})
