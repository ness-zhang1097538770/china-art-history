import type { Center, CenterType, Dynasty, DynastyId, Figure, LogicType, Place } from '../types'
import dynastiesJson from './dynasties.json'
import placesJson from './places.json'
import centersJson from './centers.json'
import figuresJson from './figures.json'

export const DYNASTY_IDS = ['tang', 'wudai', 'song_n', 'song_s', 'yuan', 'ming', 'qing'] as const
export const CENTER_TYPES = ['宫廷', '文人', '宗教', '市民'] as const
export const LOGIC_TYPES = ['政治', '经济', '文化'] as const

export const dynasties = dynastiesJson as Dynasty[]
export const places = placesJson as Place[]
export const centers = centersJson as Center[]
export const figures = figuresJson as Figure[]

const isDynastyId = (v: unknown): v is DynastyId =>
  typeof v === 'string' && (DYNASTY_IDS as readonly string[]).includes(v)

const isCenterType = (v: unknown): v is CenterType =>
  typeof v === 'string' && (CENTER_TYPES as readonly string[]).includes(v)

const isLogicType = (v: unknown): v is LogicType =>
  typeof v === 'string' && (LOGIC_TYPES as readonly string[]).includes(v)

/** 校验静态数据，返回错误描述数组（空数组 = 通过）。测试与启动时都会调用。 */
export function validateData(): string[] {
  const errors: string[] = []

  if (dynasties.length !== 7) {
    errors.push(`朝代应恰好 7 个，实际 ${dynasties.length} 个`)
  }
  const dynastyIds = new Set<string>()
  for (const d of dynasties) {
    if (!isDynastyId(d.id)) errors.push(`朝代 id 非法：${d.id}`)
    if (dynastyIds.has(d.id)) errors.push(`朝代 id 重复：${d.id}`)
    dynastyIds.add(d.id)
    if (!d.name) errors.push(`朝代 ${d.id} 缺少 name`)
    if (!(d.start < d.end)) errors.push(`朝代 ${d.id} 起止年份非法`)
    if (!d.narrative || d.narrative.length < 80 || d.narrative.length > 120) {
      errors.push(`朝代 ${d.id} 叙事文案应在 80–120 字，实际 ${d.narrative?.length ?? 0} 字`)
    }
    if (!isLogicType(d.logic)) errors.push(`朝代 ${d.id} 主线逻辑非法：${d.logic}`)
    if (!d.logicNote) errors.push(`朝代 ${d.id} 缺少 logicNote`)
  }

  const placeIds = new Set<string>()
  for (const p of places) {
    if (placeIds.has(p.id)) errors.push(`城市 id 重复：${p.id}`)
    placeIds.add(p.id)
    if (p.coordSystem !== 'BD09') errors.push(`城市 ${p.id} 坐标系统不是 BD09`)
    if (!(typeof p.lng === 'number' && p.lng >= 73 && p.lng <= 135)) {
      errors.push(`城市 ${p.id} 经度越界：${p.lng}`)
    }
    if (!(typeof p.lat === 'number' && p.lat >= 18 && p.lat <= 54)) {
      errors.push(`城市 ${p.id} 纬度越界：${p.lat}`)
    }
    if (!Array.isArray(p.museums) || p.museums.length === 0) {
      errors.push(`城市 ${p.id} 缺少博物馆数据`)
    } else {
      for (const m of p.museums) {
        if (!m.name) errors.push(`城市 ${p.id} 存在缺少名称的博物馆`)
        if (!(typeof m.lng === 'number' && m.lng >= 73 && m.lng <= 135)) {
          errors.push(`博物馆 ${m.name} 经度越界：${m.lng}`)
        }
        if (!(typeof m.lat === 'number' && m.lat >= 18 && m.lat <= 54)) {
          errors.push(`博物馆 ${m.name} 纬度越界：${m.lat}`)
        }
      }
    }
  }

  for (const c of centers) {
    if (!isDynastyId(c.dynasty)) errors.push(`中心 ${c.place} 朝代非法：${c.dynasty}`)
    if (!placeIds.has(c.place)) errors.push(`中心引用了不存在的城市：${c.place}`)
    if (!(typeof c.weight === 'number' && c.weight >= 0 && c.weight <= 1)) {
      errors.push(`中心 ${c.dynasty}/${c.place} 权重越界：${c.weight}`)
    }
    if (!isCenterType(c.type)) errors.push(`中心 ${c.dynasty}/${c.place} 类型非法：${c.type}`)
    if (!c.description || c.description.trim().length < 20) {
      errors.push(`中心 ${c.dynasty}/${c.place} 缺少介绍文案`)
    }
  }

  for (const f of figures) {
    if (!isDynastyId(f.dynasty)) errors.push(`画家 ${f.name} 朝代非法：${f.dynasty}`)
    if (!placeIds.has(f.place)) errors.push(`画家 ${f.name} 引用了不存在的城市：${f.place}`)
    if (!(f.birth < f.death)) errors.push(`画家 ${f.name} 生卒年非法`)
    if (!Array.isArray(f.works) || f.works.length === 0) {
      errors.push(`画家 ${f.name} 缺少代表作`)
    }
  }

  return errors
}
