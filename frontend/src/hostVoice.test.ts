import { describe, expect, it } from 'vitest'
import { DYNASTY_IDS } from './data/load'
import {
  DYNASTY_LINES,
  LOGIC_LINES,
  SCENARIO_LINES,
  audioUrl,
  cityCue,
  dynastyCue,
  firstSentence,
} from './hostVoice'

// 真实存在于 public/audio/host 下的 mp3（改文案忘合成时这里会飘红）
const AUDIO_FILES: Record<string, string> = import.meta.glob('/public/audio/host/*.mp3', {
  query: '?url',
  import: 'default',
  eager: true,
})

function hasAudio(key: string): boolean {
  return `/public/audio/host/${key}.mp3` in AUDIO_FILES
}

describe('阿素台词', () => {
  it('七个朝代都有讲解台词，且都不超过 40 字', () => {
    for (const id of DYNASTY_IDS) {
      const line = DYNASTY_LINES[id]
      expect(line, `${id} 缺台词`).toBeTruthy()
      expect(line.length, `${id} 台词过长`).toBeLessThanOrEqual(40)
    }
  })

  it('三条主线逻辑都有台词', () => {
    expect(LOGIC_LINES['政治']).toBeTruthy()
    expect(LOGIC_LINES['文化']).toBeTruthy()
    expect(LOGIC_LINES['经济']).toBeTruthy()
  })

  it('场景台词齐全且简短', () => {
    for (const [key, line] of Object.entries(SCENARIO_LINES)) {
      expect(line.length, `${key} 台词过长`).toBeLessThanOrEqual(40)
    }
  })

  it('改了文案但忘了重新合成音频时，测试会拦住', () => {
    for (const id of DYNASTY_IDS) {
      expect(hasAudio(`dyn-${id}`), `缺少音频 dyn-${id}.mp3`).toBe(true)
    }
    for (const key of Object.keys(SCENARIO_LINES)) {
      expect(hasAudio(key), `缺少音频 ${key}.mp3`).toBe(true)
    }
    expect(hasAudio('guide-politics')).toBe(true)
    expect(hasAudio('guide-culture')).toBe(true)
    expect(hasAudio('guide-economy')).toBe(true)
  })
})

describe('台词组装', () => {
  it('切换朝代时是「朝代台词 + 逻辑台词」两句', () => {
    const cues = dynastyCue({ id: 'yuan', logic: '文化' })
    expect(cues).toHaveLength(2)
    expect(cues[0].audioKey).toBe('dyn-yuan')
    expect(cues[1].audioKey).toBe('guide-culture')
  })

  it('firstSentence 只取第一句', () => {
    expect(firstSentence('长安是一座城。审美跟着首都走。')).toBe('长安是一座城。')
  })

  it('城市台词取「城市名：介绍首句」，并预留阿素音频位', () => {
    const cue = cityCue('suzhou', 'ming', '苏州', '吴门画派以商养艺。市场与赞助人重塑审美。')
    expect(cue.text).toBe('苏州：吴门画派以商养艺。')
    expect(cue.audioKey).toBe('city-suzhou-ming')
  })

  it('audioUrl 指向静态资源目录', () => {
    expect(audioUrl('open')).toBe('/audio/host/open.mp3')
  })
})
