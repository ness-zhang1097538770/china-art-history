// 百度地图 JavaScript API 2.0（BMap，2D 图片瓦片版）的最小类型声明

export {}

declare global {
  interface BMapPoint {
    lng: number
    lat: number
  }

  interface BMapTileCoord {
    x: number
    y: number
  }

  interface BMapTileLayerOptions {
    getTilesUrl?: (tileCoord: BMapTileCoord, zoom: number) => string
  }

  interface BMapTileLayer {
    getTilesUrl: (tileCoord: BMapTileCoord, zoom: number) => string
  }
  interface BMapMap {
    centerAndZoom(point: BMapPoint, zoom: number): void
    addTileLayer(layer: BMapTileLayer): void
    pointToPixel(point: BMapPoint): { x: number; y: number }
    addEventListener(event: string, handler: () => void): void
    removeEventListener(event: string, handler: () => void): void
    enableScrollWheelZoom(enable: boolean): void
  }

  interface Window {
    BMap?: {
      Map: new (container: HTMLElement | string) => BMapMap
      Point: new (lng: number, lat: number) => BMapPoint
      TileLayer: new (options?: BMapTileLayerOptions) => BMapTileLayer
    }
  }
}
