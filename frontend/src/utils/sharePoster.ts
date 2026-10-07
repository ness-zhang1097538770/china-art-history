import type { Center, CenterType, Dynasty } from '../types'
import { LOGIC_COLORS, TYPE_COLORS } from '../constants'

export interface PosterData {
  dynasty: Dynasty
  cityName: string
  center: Center
}

const W = 750
const H = 1000
const SERIF = '"Songti SC", "Noto Serif CJK SC", "STSong", "SimSun", serif'

/** 按像素宽度把中文文本折行（canvas 2D）。 */
function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const lines: string[] = []
  let line = ''
  for (const ch of text) {
    const test = line + ch
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line)
      line = ch
    } else {
      line = test
    }
  }
  if (line) lines.push(line)
  return lines
}

/** 在 canvas 上绘制分享海报（纯前端，零外部依赖）。 */
export function drawPoster(canvas: HTMLCanvasElement, data: PosterData): void {
  const { dynasty, cityName, center } = data
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  // 绢帛底色
  ctx.fillStyle = '#f3ecdc'
  ctx.fillRect(0, 0, W, H)

  // 顶部装饰横线 + 标签
  ctx.strokeStyle = '#2b2620'
  ctx.lineWidth = 3
  ctx.beginPath()
  ctx.moveTo(48, 72)
  ctx.lineTo(W - 48, 72)
  ctx.stroke()

  ctx.fillStyle = '#6b6357'
  ctx.font = `500 26px ${SERIF}`
  ctx.textBaseline = 'alphabetic'
  ctx.fillText('可走的艺术史 · 中心南移', 48, 110)

  // 主标题
  ctx.fillStyle = '#2b2620'
  ctx.font = `700 44px ${SERIF}`
  ctx.fillText('中国艺术史时空地图', 48, 166)

  // 朝代（大字）
  ctx.fillStyle = '#2b2620'
  ctx.font = `700 96px ${SERIF}`
  ctx.fillText(dynasty.name, 48, 300)

  // 年份
  ctx.fillStyle = '#6b6357'
  ctx.font = `500 34px ${SERIF}`
  ctx.fillText(`${dynasty.start}–${dynasty.end} 年`, 48, 356)

  // 逻辑徽标
  const logic = dynasty.logic
  ctx.fillStyle = LOGIC_COLORS[logic]
  ctx.fillRect(48, 392, 14, 14)
  ctx.fillStyle = '#2b2620'
  ctx.font = `600 30px ${SERIF}`
  ctx.fillText(`${logic}逻辑 · ${dynasty.logicNote}`, 74, 408)

  // 分隔线
  ctx.strokeStyle = '#9a9183'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(48, 452)
  ctx.lineTo(W - 48, 452)
  ctx.stroke()

  // 主中心城市
  ctx.fillStyle = TYPE_COLORS[center.type as CenterType]
  ctx.beginPath()
  ctx.arc(48 + 19, 528 - 19, 19, 0, Math.PI * 2)
  ctx.fill()

  ctx.fillStyle = '#2b2620'
  ctx.font = `700 64px ${SERIF}`
  ctx.fillText(cityName, 92, 540)

  ctx.fillStyle = '#6b6357'
  ctx.font = `500 30px ${SERIF}`
  ctx.fillText(`${center.type}画派 · ${center.note}`, 48, 592)

  // 叙事（折行）
  ctx.fillStyle = '#2b2620'
  ctx.font = `400 28px ${SERIF}`
  const lines = wrapText(ctx, dynasty.narrative, W - 96)
  let y = 652
  for (const line of lines.slice(0, 6)) {
    ctx.fillText(line, 48, y)
    y += 46
  }

  // 底部
  ctx.strokeStyle = '#2b2620'
  ctx.lineWidth = 3
  ctx.beginPath()
  ctx.moveTo(48, H - 72)
  ctx.lineTo(W - 48, H - 72)
  ctx.stroke()

  ctx.fillStyle = '#6b6357'
  ctx.font = `500 24px ${SERIF}`
  ctx.fillText('一张会随时间变化的地图', 48, H - 38)
}

/** 把 canvas 转成可下载/分享的 PNG。 */
export function posterToDataUrl(canvas: HTMLCanvasElement): string {
  return canvas.toDataURL('image/png')
}
