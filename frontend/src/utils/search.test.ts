import { describe, expect, it } from 'vitest'
import { primaryDynastyOfPlace, searchAll } from './search'

describe('全局搜索', () => {
  it('按画家名搜索，返回画家与其朝代城市', () => {
    const r = searchAll('马远')
    const fig = r.find((x) => x.kind === 'figure')
    expect(fig).toBeTruthy()
    expect(fig?.label).toBe('马远')
    expect(fig?.sub).toContain('南宋')
    expect(fig?.sub).toContain('杭州')
  })

  it('按城市名搜索，返回该城市出现的朝代', () => {
    const r = searchAll('苏州')
    const place = r.find((x) => x.kind === 'place')
    expect(place).toBeTruthy()
    expect(place?.sub).toContain('艺术中心')
  })

  it('按画派类型搜索，返回类型结果', () => {
    const r = searchAll('文人')
    const t = r.find((x) => x.kind === 'type')
    expect(t?.centerType).toBe('文人')
  })

  it('空查询返回空数组', () => {
    expect(searchAll('')).toEqual([])
  })

  it('城市活跃度最高朝代为南宋杭州', () => {
    expect(primaryDynastyOfPlace('hangzhou')).toBe('song_s')
  })
})
