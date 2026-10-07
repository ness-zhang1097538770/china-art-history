interface Props {
  onClose: () => void
}

/** 关于 / 数据来源：说明产品定位、核心观点与数据依据（PRD 第 9 节可信度要求）。 */
export function AboutModal({ onClose }: Props) {
  return (
    <div className="fixed inset-0 z-30" role="dialog" aria-modal="true" aria-label="关于本产品">
      <button type="button" className="absolute inset-0 bg-ink/40" aria-label="关闭" onClick={onClose} />
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="max-h-full w-[min(92vw,480px)] overflow-y-auto rounded-lg bg-silk p-6 shadow-xl">
          <header className="mb-4 flex items-start justify-between">
            <h2 className="text-lg font-bold text-ink">关于 · 可走的艺术史</h2>
            <button
              type="button"
              onClick={onClose}
              className="rounded-md px-2 py-1 text-sm text-ink-muted hover:bg-ink/5"
              aria-label="关闭"
            >
              关闭
            </button>
          </header>

          <div className="flex flex-col gap-4 text-sm leading-relaxed text-ink">
            <section>
              <h3 className="mb-1 font-semibold text-ink">一句话定位</h3>
              <p className="text-ink-muted">一张会随时间变化的地图，让人三分钟看懂「中国美术的中心为什么一路往南走」。</p>
            </section>

            <section>
              <h3 className="mb-1 font-semibold text-ink">核心观点</h3>
              <p className="text-ink-muted">
                艺术中心沿三条逻辑南移：先是跟着首都走（政治），后来跟着文人走（文化），最后跟着市场走（经济）。
                主线：长安 → 南京 → 开封 → 杭州 → 苏州 → 北京。
              </p>
            </section>

            <section>
              <h3 className="mb-1 font-semibold text-ink">数据说明</h3>
              <p className="text-ink-muted">
                各艺术中心的「活跃度」为主观赋值（依据艺术史通识），气泡大小与深浅仅表示相对活跃度，非绝对量化；画派四色（宫廷/文人/宗教/市民）为分类示意。
              </p>
            </section>

            <section>
              <h3 className="mb-1 font-semibold text-ink">版权说明</h3>
              <p className="text-ink-muted">
                本作品采用纯文字与色块示意，不包含文物高清图，规避图片版权风险；后续如需图片，优先采用故宫 Open Data、国博开放数据等已授权来源。
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}
