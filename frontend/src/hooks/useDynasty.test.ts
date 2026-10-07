import { describe, expect, it } from 'vitest'
import { ROUTE, routeForDynasty } from './useDynasty'

describe('迁移轨迹（F06）', () => {
  it('唐只显示起点西安，不绘制轨迹', () => {
    const r = routeForDynasty('tang')
    expect(r).toHaveLength(1)
    expect(r[0].place).toBe('xian')
  })

  it('清为终点，完整轨迹含 6 个主中心', () => {
    const r = routeForDynasty('qing')
    expect(r).toHaveLength(6)
    expect(r.map((x) => x.place)).toEqual([
      'xian',
      'nanjing',
      'kaifeng',
      'hangzhou',
      'suzhou',
      'beijing',
    ])
  })

  it('轨迹主中心顺序与 PRD 附录 A 一致', () => {
    expect(ROUTE.map((x) => x.place)).toEqual([
      'xian',
      'nanjing',
      'kaifeng',
      'hangzhou',
      'suzhou',
      'beijing',
    ])
  })
})
