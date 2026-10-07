export type DynastyId =
  | 'tang'
  | 'wudai'
  | 'song_n'
  | 'song_s'
  | 'yuan'
  | 'ming'
  | 'qing'

export type CenterType = '宫廷' | '文人' | '宗教' | '市民'

/** 主线逻辑（PRD 2.2）：中心为什么南移的三条驱动逻辑 */
export type LogicType = '政治' | '经济' | '文化'

export interface Dynasty {
  id: DynastyId
  name: string
  start: number
  end: number
  narrative: string
  /** 该朝代艺术中心的主导逻辑 */
  logic: LogicType
  /** 一句解释：为什么这个逻辑在该朝代起主导作用 */
  logicNote: string
}

export interface Museum {
  name: string
  /** 一句话说明这里能看什么（与艺术史的关系） */
  note: string
  /** 百度坐标系 BD-09 经度（导航用） */
  lng: number
  /** 百度坐标系 BD-09 纬度（导航用） */
  lat: number
}

export interface Place {
  id: string
  name: string
  lng: number
  lat: number
  /** 百度坐标系 BD-09（入库前已从 WGS-84 转换） */
  coordSystem: 'BD09'
  /** 现在仍可参观的相关博物馆/机构 */
  museums: Museum[]
}

export interface Center {
  dynasty: DynastyId
  place: string
  /** 活跃度权重 0–1，决定气泡半径与透明度 */
  weight: number
  type: CenterType
  note: string
  /** 该城市在这个朝代的画派/艺术生态介绍（详情面板用） */
  description: string
}

export interface Work {
  title: string
  collection: string
}

export interface Figure {
  name: string
  birth: number
  death: number
  place: string
  dynasty: DynastyId
  works: Work[]
}
