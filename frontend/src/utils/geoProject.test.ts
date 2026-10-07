import { describe, expect, it } from 'vitest'
import { CHINA_VIEWBOX, projectLngLat, provinceShapes } from './geoProject'

describe('离线 SVG 中国地图（geoProject）', () => {
  it('省界形状数据齐全（34 省级行政区）', () => {
    expect(provinceShapes.length).toBeGreaterThanOrEqual(34)
    expect(provinceShapes.every((s) => s.name && s.d.startsWith('M'))).toBe(true)
  })

  it('投影落在画布内且 y 轴向下', () => {
    // 西部偏北的点（新疆附近）应靠近左上角
    const nw = projectLngLat(80, 45)
    expect(nw.x).toBeGreaterThanOrEqual(0)
    expect(nw.x).toBeLessThanOrEqual(CHINA_VIEWBOX.width)
    expect(nw.y).toBeGreaterThanOrEqual(0)
    expect(nw.y).toBeLessThanOrEqual(CHINA_VIEWBOX.height)

    // 东部偏南的点（闽台附近）应靠近右下角
    const se = projectLngLat(125, 25)
    expect(se.x).toBeGreaterThan(nw.x)
    expect(se.y).toBeGreaterThan(nw.y)
    expect(se.x).toBeLessThanOrEqual(CHINA_VIEWBOX.width)
    expect(se.y).toBeLessThanOrEqual(CHINA_VIEWBOX.height)
  })

  it('画布长宽比合理（中国地图应更宽）', () => {
    expect(CHINA_VIEWBOX.width).toBeGreaterThan(CHINA_VIEWBOX.height)
  })
})
