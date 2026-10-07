import type { DynastyId, LogicType } from './types'

/**
 * 阿素的台词与语音。
 *
 * 约定：这里的文案 = 屏幕显示的文字 = 音频里念出来的一字一句，
 * 改动后必须重跑 tools/gen_audio.py 重新合成对应的 mp3。
 */

/** 场景台词（key 即音频文件名） */
export type ScenarioKey = 'open' | 'play' | 'idle' | 'end' | 'share'

export const SCENARIO_LINES: Record<ScenarioKey, string> = {
  open: '客官请看，这里是长安。中心往哪走，阿素陪你走一遍。',
  play: '坐稳了。从长安到上海，一站两息半。',
  idle: '想看哪座城？图上星落珠盘，点开便是名都。',
  end: '一千年走完了。回头再看一遍，你会发现南移不是偶然。',
  share: '这一站看完了，要不要捎一张海报给朋友？',
}

/** 七个朝代的讲解台词（key 对应音频文件 dyn-< DynastyId >.mp3） */
export const DYNASTY_LINES: Record<DynastyId, string> = {
  tang: '长安是天下的大都会，宫廷和敦煌画工共用一套粉本。审美，跟着首都走。',
  wudai: '天下一分，画院跟着政权散到金陵、成都。中心头一回往南挪。',
  song_n: '汴京把画师收进翰林图画院，山水画，成了完整的宇宙图式。',
  song_s: '临安偏安，构图从全景缩成「一角半边」。留白里，全是政治。',
  yuan: '画院没了。苏州、杭州的文人拿起笔，中心头一回离开首都。',
  ming: '吴门以商养艺，苏州成了头一个靠市场撑起来的艺术中心。',
  qing: '宫廷、盐商、口岸，三路并进。扬州盐商一句话，就能改画风。',
}

/** 三条主线逻辑的一句话版本，紧跟朝代台词播放 */
export const LOGIC_LINES: Record<LogicType, string> = {
  政治: '跟首都走：朝廷出钱，画院定标准。',
  文化: '跟文人走：笔在谁手里，中心就在谁那儿。',
  经济: '跟市场走：谁买画，画家去谁家。',
}

/** 一条待播放的语音 */
export interface HostCue {
  /** 屏幕上显示的文字，同时也是朗读内容 */
  text: string
  /** 已预生成音频的文件名（不含扩展名）；缺省则走浏览器朗读兜底 */
  audioKey?: string
}

const AUDIO_BASE = '/audio/host'

export function audioUrl(key: string): string {
  return `${AUDIO_BASE}/${key}.mp3`
}

export function dynastyCue(dynasty: { id: DynastyId; logic: LogicType }): HostCue[] {
  return [
    { text: DYNASTY_LINES[dynasty.id], audioKey: `dyn-${dynasty.id}` },
    { text: LOGIC_LINES[dynasty.logic], audioKey: LOGIC_LINES_KEY[dynasty.logic] },
  ]
}

const LOGIC_LINES_KEY: Record<LogicType, string> = {
  政治: 'guide-politics',
  文化: 'guide-culture',
  经济: 'guide-economy',
}

/** 取第一句话，避免把整段介绍塞进一句语音里 */
export function firstSentence(text: string): string {
  const idx = text.indexOf('。')
  return idx >= 0 ? text.slice(0, idx + 1) : text
}

/** 点击某个艺术中心时的台词（动态文案，优先用预生成 mp3，缺失时回落浏览器朗读） */
export function cityCue(
  placeId: string,
  dynastyId: DynastyId,
  cityName: string,
  description: string,
): HostCue {
  const summary = firstSentence(description)
  return { text: `${cityName}：${summary}`, audioKey: `city-${placeId}-${dynastyId}` }
}

export function scenarioCue(key: ScenarioKey): HostCue {
  return { text: SCENARIO_LINES[key], audioKey: key }
}
