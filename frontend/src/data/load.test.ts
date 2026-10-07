import { describe, expect, it } from 'vitest'
import { dynasties, centers, validateData } from './load'

describe('静态数据校验', () => {
  it('全部数据通过 schema 校验', () => {
    expect(validateData()).toEqual([])
  })

  it('7 个朝代的主导逻辑符合「中心南移」叙事：政治→文化→经济', () => {
    expect(dynasties.map((d) => d.logic)).toEqual([
      '政治',
      '政治',
      '政治',
      '政治',
      '文化',
      '经济',
      '经济',
    ])
  })

  it('每个艺术中心都有独立的介绍文案', () => {
    for (const c of centers) {
      expect(c.description.trim().length).toBeGreaterThanOrEqual(20)
    }
  })
})
