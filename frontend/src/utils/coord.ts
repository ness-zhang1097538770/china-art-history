// 坐标转换：WGS-84 → GCJ-02 → BD-09
// 依据 PRD 第 9 节：入库前统一转 BD-09，避免城市级可视化肉眼可见的偏移。

const A = 6378245.0
// WGS-84 椭球偏心率平方（行业标准常量，尾部超出 double 有效位数的精度无损于转换结果）
// oxlint-disable-next-line no-loss-of-precision
const EE = 0.00669342162296594323

function transformLat(x: number, y: number): number {
  let ret =
    -100.0 + 2.0 * x + 3.0 * y + 0.2 * y * y + 0.1 * x * y + 0.2 * Math.sqrt(Math.abs(x))
  ret +=
    ((20.0 * Math.sin(6.0 * x * Math.PI) + 20.0 * Math.sin(2.0 * x * Math.PI)) * 2.0) / 3.0
  ret +=
    ((20.0 * Math.sin(y * Math.PI) + 40.0 * Math.sin((y / 3.0) * Math.PI)) * 2.0) / 3.0
  ret +=
    ((160.0 * Math.sin((y / 12.0) * Math.PI) + 320 * Math.sin((y * Math.PI) / 30.0)) * 2.0) /
    3.0
  return ret
}

function transformLng(x: number, y: number): number {
  let ret = 300.0 + x + 2.0 * y + 0.1 * x * x + 0.1 * x * y + 0.1 * Math.sqrt(Math.abs(x))
  ret +=
    ((20.0 * Math.sin(6.0 * x * Math.PI) + 20.0 * Math.sin(2.0 * x * Math.PI)) * 2.0) / 3.0
  ret +=
    ((20.0 * Math.sin(x * Math.PI) + 40.0 * Math.sin((x / 3.0) * Math.PI)) * 2.0) / 3.0
  ret +=
    ((150.0 * Math.sin((x / 12.0) * Math.PI) + 300.0 * Math.sin((x / 30.0) * Math.PI)) * 2.0) /
    3.0
  return ret
}

export function wgs84ToGcj02(lng: number, lat: number): [number, number] {
  const dLat = transformLat(lng - 105.0, lat - 35.0)
  const dLng = transformLng(lng - 105.0, lat - 35.0)
  const radLat = (lat / 180.0) * Math.PI
  let magic = Math.sin(radLat)
  magic = 1 - EE * magic * magic
  const sqrtMagic = Math.sqrt(magic)
  const dLat2 = (dLat * 180.0) / (((A * (1 - EE)) / (magic * sqrtMagic)) * Math.PI)
  const dLng2 = (dLng * 180.0) / ((A / sqrtMagic) * Math.cos(radLat) * Math.PI)
  return [lng + dLng2, lat + dLat2]
}

export function gcj02ToBd09(lng: number, lat: number): [number, number] {
  const x = lng
  const y = lat
  const z = Math.sqrt(x * x + y * y) + 0.00002 * Math.sin((y * 3000 * Math.PI) / 180)
  const theta = Math.atan2(y, x) + 0.000003 * Math.cos((x * 3000 * Math.PI) / 180)
  return [z * Math.cos(theta) + 0.0065, z * Math.sin(theta) + 0.006]
}

export function wgs84ToBd09(lng: number, lat: number): [number, number] {
  const [gLng, gLat] = wgs84ToGcj02(lng, lat)
  return gcj02ToBd09(gLng, gLat)
}
