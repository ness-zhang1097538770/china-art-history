import type { CenterType, LogicType } from './types'

/** 画派四色（PRD 5.3） */
export const TYPE_COLORS: Record<CenterType, string> = {
  宫廷: '#a8322d',
  文人: '#3a6b8c',
  宗教: '#9c6b3f',
  市民: '#5c7f5e',
}

/** 画派四类定义（PRD 5.3），用于图例与详情 */
export const TYPE_DEFINITIONS: Record<CenterType, string> = {
  宫廷: '由朝廷/画院制度供养，服务于政治与礼制',
  文人: '士人业余创作，强调写心与笔墨趣味',
  宗教: '服务于寺观石窟的壁画与造像',
  市民: '由商业市场与市民/盐商赞助驱动',
}

export const TYPE_ORDER: CenterType[] = ['宫廷', '文人', '宗教', '市民']

/** 主线三逻辑（PRD 2.2），配色与对应画派类型一致：政治=宫廷、经济=市民、文化=文人 */
export const LOGIC_COLORS: Record<LogicType, string> = {
  政治: TYPE_COLORS.宫廷,
  经济: TYPE_COLORS.市民,
  文化: TYPE_COLORS.文人,
}

export const LOGIC_DEFINITIONS: Record<LogicType, string> = {
  政治: '艺术中心 = 首都，由宫廷财力与画院制度决定',
  经济: '艺术中心 = 富庶商业城市，由市场与收藏家决定',
  文化: '艺术中心 = 文人聚集地，由士人网络与师承决定',
}

export const LOGIC_ORDER: LogicType[] = ['政治', '经济', '文化']
