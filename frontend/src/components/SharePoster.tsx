import { useEffect, useRef } from 'react'
import type { Center, Dynasty } from '../types'
import { drawPoster, posterToDataUrl } from '../utils/sharePoster'

interface Props {
  dynasty: Dynasty
  cityName: string
  center: Center
  onClose: () => void
}

/** 分享海报（F 增强）：生成「我在某朝代的某城」卡片，支持保存图片 / 系统分享。 */
export function SharePoster({ dynasty, cityName, center, onClose }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (canvasRef.current) drawPoster(canvasRef.current, { dynasty, cityName, center })
  }, [dynasty, cityName, center])

  const download = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const a = document.createElement('a')
    a.href = posterToDataUrl(canvas)
    a.download = `中国艺术史-${dynasty.name}-${cityName}.png`
    a.click()
  }

  const handleShare = async () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const dataUrl = posterToDataUrl(canvas)
    const nav = navigator as Navigator & {
      canShare?: (data?: ShareData) => boolean
    }
    try {
      if (typeof navigator.share === 'function') {
        const blob = await (await fetch(dataUrl)).blob()
        const file = new File([blob], `中国艺术史-${dynasty.name}-${cityName}.png`, {
          type: 'image/png',
        })
        if (!nav.canShare || nav.canShare({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: '中国艺术史时空地图',
            text: `我在${dynasty.name}的${cityName}`,
          })
          return
        }
      }
    } catch {
      // 系统分享失败/取消时回退到保存图片
    }
    download()
  }

  return (
    <div className="fixed inset-0 z-30" role="dialog" aria-modal="true" aria-label="分享海报">
      <button type="button" className="absolute inset-0 bg-ink/40" aria-label="关闭" onClick={onClose} />
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="flex max-h-full flex-col items-center gap-3 overflow-y-auto">
          <canvas ref={canvasRef} className="w-[min(76vw,420px)] rounded-lg shadow-xl" />
          <div className="flex gap-2">
            <button
              type="button"
              className="rounded-md bg-ink px-5 py-2 text-sm text-silk"
              onClick={download}
            >
              保存图片
            </button>
            <button
              type="button"
              className="rounded-md border border-ink-faint px-5 py-2 text-sm text-ink"
              onClick={handleShare}
            >
              分享
            </button>
            <button
              type="button"
              className="rounded-md px-3 py-2 text-sm text-ink-muted"
              onClick={onClose}
            >
              关闭
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
