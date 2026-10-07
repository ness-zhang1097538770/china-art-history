import { describe, expect, it } from 'vitest'
import { wgs84ToBd09 } from './coord'
import { places } from '../data/load'

describe('坐标转换 WGS-84 → BD-09', () => {
  it('西安 WGS-84 转 BD-09 与入库坐标一致（误差 < 1e-4）', () => {
    const [lng, lat] = wgs84ToBd09(108.94, 34.34)
    const xian = places.find((p) => p.id === 'xian')!
    expect(Math.abs(lng - xian.lng)).toBeLessThan(1e-4)
    expect(Math.abs(lat - xian.lat)).toBeLessThan(1e-4)
  })

  it('上海 WGS-84 转 BD-09 与入库坐标一致（误差 < 1e-4）', () => {
    const [lng, lat] = wgs84ToBd09(121.47, 31.23)
    const shanghai = places.find((p) => p.id === 'shanghai')!
    expect(Math.abs(lng - shanghai.lng)).toBeLessThan(1e-4)
    expect(Math.abs(lat - shanghai.lat)).toBeLessThan(1e-4)
  })

  it('转换结果落在中国陆地范围内', () => {
    const [lng, lat] = wgs84ToBd09(116.41, 39.9)
    expect(lng).toBeGreaterThan(73)
    expect(lng).toBeLessThan(135)
    expect(lat).toBeGreaterThan(18)
    expect(lat).toBeLessThan(54)
  })
})
