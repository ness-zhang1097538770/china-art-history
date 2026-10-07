import type { Center, DynastyId, Place } from '../types'
import { TYPE_COLORS } from '../constants'
import { CHINA_VIEWBOX, projectLngLat, provinceShapes } from '../utils/geoProject'

interface Props {
  dynastyId: DynastyId
  dynastyCenters: Center[]
  route: { place: string; dynasty: DynastyId }[]
  placeMap: Map<string, Place>
  onSelectCenter: (placeId: string) => void
}

/** 离线 SVG 中国地图兜底：不依赖百度 AK / 网络，保证地图可视化始终能显示。 */
export function SvgChinaMap({ dynastyId, dynastyCenters, route, placeMap, onSelectCenter }: Props) {
  const { width, height } = CHINA_VIEWBOX

  const routePoints = route
    .map((r) => placeMap.get(r.place))
    .filter((p): p is Place => !!p)
    .map((p) => {
      const { x, y } = projectLngLat(p.lng, p.lat)
      return `${x.toFixed(1)},${y.toFixed(1)}`
    })
    .join(' ')

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="h-full w-full"
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label="中国艺术史时空地图"
    >
      {/* 海洋背景（蓝色水域） */}
      <rect x={0} y={0} width={width} height={height} fill="#cfe3f2" />

      {/* 省界（陆地） */}
      <g>
        {provinceShapes.map((s) => (
          <path
            key={s.name}
            d={s.d}
            fill="#f5efe0"
            stroke="#c3b493"
            strokeWidth={0.9}
            fillRule="evenodd"
          />
        ))}
      </g>

      {/* 迁移轨迹线 */}
      {routePoints.split(' ').length > 1 && (
        <g>
          <polyline points={routePoints} className="route-dashed" />
          <polyline key={dynastyId} points={routePoints} pathLength={1} className="route-draw" />
        </g>
      )}

      {/* 艺术中心气泡 */}
      {dynastyCenters.map((c) => {
        const place = placeMap.get(c.place)
        if (!place) return null
        const { x, y } = projectLngLat(place.lng, place.lat)
        const radius = 7 + c.weight * 20
        const opacity = 0.28 + c.weight * 0.42
        return (
          <g
            key={c.place}
            role="button"
            aria-label={`${place.name}（${c.type}画派）`}
            className="cursor-pointer"
            onClick={() => onSelectCenter(c.place)}
          >
            <circle
              cx={x}
              cy={y}
              r={radius}
              fill={TYPE_COLORS[c.type]}
              opacity={opacity}
              stroke="rgba(255,255,255,0.7)"
              strokeWidth={1}
            />
            <text
              x={x}
              y={y + radius + 13}
              textAnchor="middle"
              fontSize={11}
              fontWeight={600}
              fill="#2b2620"
              stroke="#f5efe0"
              strokeWidth={3}
              paintOrder="stroke"
            >
              {place.name}
            </text>
          </g>
        )
      })}
    </svg>
  )
}
