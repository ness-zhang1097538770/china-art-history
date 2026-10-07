import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { Center, DynastyId, Place } from '../types'
import { TYPE_COLORS } from '../constants'
import { waitForBMap } from '../utils/loadBaiduMap'
import { SvgChinaMap } from './SvgChinaMap'

interface Bubble {
  placeId: string
  name: string
  x: number
  y: number
  weight: number
  type: Center['type']
}

interface Pixel {
  x: number
  y: number
}

interface Props {
  dynastyId: DynastyId
  dynastyCenters: Center[]
  route: { place: string; dynasty: DynastyId }[]
  placeMap: Map<string, Place>
  onSelectCenter: (placeId: string) => void
}

type Status = 'loading' | 'ready' | 'error'

/** 自定义瓦片层：2D API 默认瓦片域名不可用，改用 maponline 域名（已验证返回 200）。 */
function createMapTileLayer(ak: string): BMapTileLayer {
  const tileLayer = new window.BMap!.TileLayer()
  tileLayer.getTilesUrl = (tileCoord: BMapTileCoord, zoom: number) => {
    const x = tileCoord.x
    const y = tileCoord.y
    return (
      'https://maponline0.bdimg.com/tile/?qt=vtile&x=' +
      x +
      '&y=' +
      y +
      '&z=' +
      zoom +
      '&styles=pl&scaler=1&udt=20260923&v=1.0&ak=' +
      ak
    )
  }
  return tileLayer
}

export function MapCanvas({ dynastyId, dynastyCenters, route, placeMap, onSelectCenter }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<BMapMap | null>(null)
  const ak = import.meta.env.VITE_BAIDU_AK as string | undefined
  const [status, setStatus] = useState<Status>(() => (ak ? 'loading' : 'error'))
  const [bubbles, setBubbles] = useState<Bubble[]>([])
  const [routePixels, setRoutePixels] = useState<Pixel[]>([])

  // 当前朝代的主中心（权重最高），用于切换时地图聚焦
  const mainCenter = useMemo(
    () => [...dynastyCenters].sort((a, b) => b.weight - a.weight)[0] ?? null,
    [dynastyCenters],
  )

  const recompute = useCallback(() => {
    const map = mapRef.current
    const BMap = window.BMap
    if (!map || !BMap) return

    const nextBubbles: Bubble[] = dynastyCenters
      .map((c) => {
        const place = placeMap.get(c.place)
        if (!place) return null
        const px = map.pointToPixel(new BMap.Point(place.lng, place.lat))
        return {
          placeId: c.place,
          name: place.name,
          x: px.x,
          y: px.y,
          weight: c.weight,
          type: c.type,
        }
      })
      .filter((b): b is Bubble => b !== null)

    const nextRoute: Pixel[] = route.map((r) => {
      const place = placeMap.get(r.place)
      const px = place ? map.pointToPixel(new BMap.Point(place.lng, place.lat)) : { x: 0, y: 0 }
      return { x: px.x, y: px.y }
    })

    setBubbles(nextBubbles)
    setRoutePixels(nextRoute)
  }, [dynastyCenters, route, placeMap])

  // 用 ref 让地图事件始终调用最新的 recompute
  const recomputeRef = useRef(recompute)
  useEffect(() => {
    recomputeRef.current = recompute
  }, [recompute])

  useEffect(() => {
    if (!ak) return

    let cancelled = false

    const ensureMap = async () => {
      if (mapRef.current) return
      try {
        await waitForBMap()
        if (cancelled || !containerRef.current) return
        const BMap = window.BMap
        if (!BMap) throw new Error('百度地图 API 不可用')

        const container = containerRef.current
        const map = new BMap.Map(container)
        map.centerAndZoom(new BMap.Point(104.0, 35.0), 5)
        map.enableScrollWheelZoom(true)
        map.addTileLayer(createMapTileLayer(ak))
        map.addEventListener('moveend', () => recomputeRef.current())
        map.addEventListener('zoomend', () => recomputeRef.current())
        mapRef.current = map
        setStatus('ready')
        recomputeRef.current()
      } catch {
        if (!cancelled) {
          setStatus('error')
        }
      }
    }

    void ensureMap()

    return () => {
      cancelled = true
    }
  }, [ak])

  // 朝代数据变化时重算（地图已就绪时）。这里同步的是外部地图系统的像素状态，setState 是有意为之。
  // oxlint-disable-next-line react/set-state-in-effect
  useEffect(() => {
    if (status === 'ready') recompute()
  }, [status, recompute])

  // 朝代切换时，地图平移聚焦到当前主中心（保持全国视角 zoom 5，仅移动注意力）
  useEffect(() => {
    const map = mapRef.current
    const BMap = window.BMap
    if (status !== 'ready' || !map || !BMap || !mainCenter) return
    const place = placeMap.get(mainCenter.place)
    if (!place) return
    map.centerAndZoom(new BMap.Point(place.lng, place.lat), 5)
  }, [status, mainCenter, placeMap])

  const routePoints = routePixels.map((p) => `${p.x},${p.y}`).join(' ')

  return (
    <div className="relative h-full w-full overflow-hidden bg-silk-dark">
      {/* SVG 省界底图：始终显示，作为百度地图未渲染时的兜底 */}
      <div className="absolute inset-0">
        <SvgChinaMap
          dynastyId={dynastyId}
          dynastyCenters={status === 'ready' ? [] : dynastyCenters}
          route={status === 'ready' ? [] : route}
          placeMap={placeMap}
          onSelectCenter={onSelectCenter}
        />
      </div>

      {/* 百度地图容器（2D 瓦片渲染后覆盖 SVG 底图） */}
      <div ref={containerRef} className="absolute inset-0" />

      {/* 迁移轨迹线（F06）：虚线底图 + 每次切换朝代重新描边生长 */}
      {status === 'ready' && routePixels.length > 1 && (
        <svg
          className="pointer-events-none absolute inset-0 h-full w-full"
          aria-hidden="true"
        >
          <polyline points={routePoints} className="route-dashed" />
          <polyline key={dynastyId} points={routePoints} pathLength={1} className="route-draw" />
        </svg>
      )}

      {/* 艺术中心气泡（F04/F05） */}
      {status === 'ready' &&
        bubbles.map((b) => {
          const radius = 7 + b.weight * 20
          const opacity = 0.28 + b.weight * 0.42
          return (
            <div key={b.placeId} className="pointer-events-none absolute inset-0 z-10">
              <button
                type="button"
                aria-label={`${b.name}（${b.type}画派）`}
                className="map-overlay-bubble block border border-white/70 shadow-md"
                style={{
                  left: b.x,
                  top: b.y,
                  width: radius * 2,
                  height: radius * 2,
                  opacity,
                  background: TYPE_COLORS[b.type],
                }}
                onClick={() => onSelectCenter(b.placeId)}
              />
              <span
                className="pointer-events-none absolute whitespace-nowrap text-xs font-semibold text-ink"
                style={{
                  left: b.x,
                  top: b.y + radius + 6,
                  transform: 'translate(-50%, 0)',
                  textShadow: '0 1px 0 rgba(255,255,255,0.8)',
                }}
              >
                {b.name}
              </span>
            </div>
          )
        })}

      {/* 加载中 */}
      {status === 'loading' && (
        <div className="absolute inset-0 flex items-center justify-center text-ink-muted">
          地图加载中…
        </div>
      )}

      {/* 失败时用离线 SVG 中国地图兜底，保证地图始终可见 */}
      {status === 'error' && (
        <div className="absolute left-2 top-2 z-10 max-w-[72%] rounded-md bg-white/85 px-2 py-1 text-xs text-ink-muted backdrop-blur-sm">
          百度地图不可用 · 已切换离线地图
        </div>
      )}
    </div>
  )
}
