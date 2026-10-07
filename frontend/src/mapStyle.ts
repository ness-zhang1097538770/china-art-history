/** 百度地图个性化底图样式（F02）：隐藏 POI 冗余标注、弱化路网、绢帛/水墨底色 */
export const MAP_STYLE_JSON = [
  { featureType: 'poi', elementType: 'all', stylers: { visibility: 'off' } },
  { featureType: 'road', elementType: 'labels', stylers: { visibility: 'off' } },
  { featureType: 'road', elementType: 'geometry', stylers: { color: '#e2d8c0' } },
  { featureType: 'highway', elementType: 'geometry', stylers: { color: '#ddd2b8' } },
  { featureType: 'water', elementType: 'all', stylers: { color: '#dfe8e2' } },
  { featureType: 'land', elementType: 'all', stylers: { color: '#f1e9d7' } },
  { featureType: 'boundary', elementType: 'all', stylers: { color: '#c3b493' } },
  { featureType: 'subway', elementType: 'all', stylers: { visibility: 'off' } },
]
