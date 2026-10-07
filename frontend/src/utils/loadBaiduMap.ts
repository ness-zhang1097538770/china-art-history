/**
 * 等待百度地图 JavaScript API 2.0（BMap）就绪。
 * 脚本已在 index.html 中以 <script> 标签同步引入。
 */
export function waitForBMap(timeoutMs = 20000): Promise<boolean> {
  if (window.BMap) return Promise.resolve(true)

  return new Promise<boolean>((resolve, reject) => {
    const startedAt = Date.now()
    const timer = setInterval(() => {
      if (window.BMap) {
        clearInterval(timer)
        resolve(true)
      } else if (Date.now() - startedAt > timeoutMs) {
        clearInterval(timer)
        reject(new Error('百度地图加载超时，请检查 AK 与 Referer 白名单配置'))
      }
    }, 100)
  })
}
