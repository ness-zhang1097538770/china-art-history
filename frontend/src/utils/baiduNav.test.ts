import { describe, expect, it } from 'vitest'
import { baiduNavUrl, collectionNavUrl } from './baiduNav'

describe('百度地图定位链接', () => {
  it('按博物馆名 + BD-09 坐标生成标注定位链接', () => {
    const url = baiduNavUrl('故宫博物院', 116.40961, 39.92374)
    expect(url).toContain('api.map.baidu.com/marker')
    expect(url).toContain('location=39.92374,116.40961')
    expect(url).toContain('%E6%95%85%E5%AE%AB') // 「故宫」的 URL 编码
  })

  it('已收录的收藏机构能生成导航链接，未知机构返回 null', () => {
    expect(collectionNavUrl('故宫博物院')).toContain('api.map.baidu.com/marker')
    expect(collectionNavUrl('上海博物馆')).toContain('api.map.baidu.com/marker')
    expect(collectionNavUrl('辽宁省博物馆')).toContain('api.map.baidu.com/marker')
    expect(collectionNavUrl('天津博物馆')).toContain('api.map.baidu.com/marker')
    expect(collectionNavUrl('中国美术馆')).toContain('api.map.baidu.com/marker')
    expect(collectionNavUrl('台北故宫博物院')).toContain('api.map.baidu.com/marker')
    expect(collectionNavUrl('传世摹本')).toBeNull()
    expect(collectionNavUrl('波士顿美术博物馆')).toBeNull()
    expect(collectionNavUrl('大阪市立美术馆')).toBeNull()
  })
})
