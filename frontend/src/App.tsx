import { useMemo, useState } from 'react'
import type { CenterType, DynastyId } from './types'
import { useDynasty } from './hooks/useDynasty'
import { useHostVoice } from './hooks/useHostVoice'
import { CENTER_TYPES, figures as allFigures, validateData } from './data/load'
import { MapCanvas } from './components/MapCanvas'
import { Timeline } from './components/Timeline'
import { InfoPanel } from './components/InfoPanel'
import { DetailDrawer } from './components/DetailDrawer'
import { Legend } from './components/Legend'
import { GuidePanel } from './components/GuidePanel'
import { SharePoster } from './components/SharePoster'
import { SearchBar } from './components/SearchBar'
import { HostBar } from './components/HostBar'
import { AboutModal } from './components/AboutModal'
import { primaryDynastyOfPlace, type SearchResult } from './utils/search'

export default function App() {
  const {
    currentDynasty,
    setCurrentDynasty,
    dynasty,
    dynastyCenters,
    placeMap,
    route,
  } = useDynasty('tang')

  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null)
  const [shareOpen, setShareOpen] = useState(false)
  const [aboutOpen, setAboutOpen] = useState(false)
  const [hiddenTypes, setHiddenTypes] = useState<Set<CenterType>>(new Set())
  const voice = useHostVoice()

  const dataErrors = useMemo(() => validateData(), [])

  // 画派筛选后的中心（气泡/侧栏用；轨迹线与分享仍用完整数据）
  const visibleCenters = useMemo(
    () => dynastyCenters.filter((c) => !hiddenTypes.has(c.type)),
    [dynastyCenters, hiddenTypes],
  )

  const toggleType = (t: CenterType) => {
    setHiddenTypes((prev) => {
      const next = new Set(prev)
      if (next.has(t)) next.delete(t)
      else next.add(t)
      return next
    })
  }

  const showOnlyType = (t: CenterType) => {
    setHiddenTypes(new Set(CENTER_TYPES.filter((x) => x !== t)))
  }

  const resetFilter = () => setHiddenTypes(new Set())

  const handleSearchPick = (r: SearchResult) => {
    if (r.kind === 'figure' && r.figure) {
      setCurrentDynasty(r.figure.dynasty)
      setSelectedPlaceId(r.figure.place)
    } else if (r.kind === 'place' && r.place) {
      setCurrentDynasty(primaryDynastyOfPlace(r.place.id) as DynastyId)
      setSelectedPlaceId(r.place.id)
    } else if (r.kind === 'type' && r.centerType) {
      showOnlyType(r.centerType)
    }
  }

  // 自动播放已移除：朝代语音改为 HostBar 里的手动点播

  const handleDynastyChange = (id: DynastyId) => {
    setCurrentDynasty(id)
    setSelectedPlaceId(null)
  }

  const selectedPlace = selectedPlaceId ? placeMap.get(selectedPlaceId) : undefined
  const selectedCenter = dynastyCenters.find((c) => c.place === selectedPlaceId) ?? null
  const selectedFigures = useMemo(
    () =>
      selectedPlaceId
        ? allFigures.filter((f) => f.place === selectedPlaceId && f.dynasty === currentDynasty)
        : [],
    [selectedPlaceId, currentDynasty],
  )

  const mainCenter = [...dynastyCenters].sort((a, b) => b.weight - a.weight)[0]
  const mainPlaceName = mainCenter ? (placeMap.get(mainCenter.place)?.name ?? '') : ''

  return (
    <div className="flex h-full flex-col">
      <header className="flex flex-col gap-2 px-4 pt-3 pb-2">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-baseline gap-3">
            <h1 className="text-lg font-bold text-ink">中国艺术史时空地图</h1>
            <span className="hidden text-xs text-ink-faint sm:inline">
              一张会随时间变化的地图 · 可走的艺术史
            </span>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={() => setAboutOpen(true)}
              className="rounded-md border border-ink-faint/60 px-3 py-1 text-sm text-ink hover:bg-ink/5"
            >
              关于
            </button>
            {mainCenter && (
              <button
                type="button"
                onClick={() => setShareOpen(true)}
                className="shrink-0 rounded-md border border-ink-faint/60 px-3 py-1 text-sm text-ink hover:bg-ink/5"
              >
                分享
              </button>
            )}
          </div>
        </div>
        <SearchBar onPick={handleSearchPick} />
      </header>

      {dataErrors.length > 0 && (
        <div className="mx-4 mb-2 rounded-md border border-court bg-court/10 px-3 py-2 text-xs text-court">
          数据校验失败：{dataErrors.join('；')}
        </div>
      )}

      <div className="flex min-h-0 flex-1 flex-col gap-2 px-4 pb-2 sm:flex-row">
        <div className="relative min-h-[45vh] flex-1 overflow-hidden rounded-lg border border-ink-faint/40 sm:min-h-0">
          <MapCanvas
            dynastyId={currentDynasty}
            dynastyCenters={visibleCenters}
            route={route}
            placeMap={placeMap}
            onSelectCenter={setSelectedPlaceId}
          />
          <div className="absolute left-2 top-2 z-10 hidden sm:block">
            <Legend hiddenTypes={hiddenTypes} onToggleType={toggleType} onReset={resetFilter} />
          </div>
        </div>

        <div className="flex min-h-0 flex-1 flex-col gap-2 sm:w-[320px] sm:flex-none">
          <HostBar
            dynasty={dynasty}
            selectedPlace={selectedPlace}
            selectedCenter={selectedCenter}
            shareOpen={shareOpen}
            voice={voice}
          />
          <GuidePanel dynasty={dynasty} />
          <div className="min-h-0 flex-1">
            <InfoPanel
              dynasty={dynasty}
              dynastyCenters={visibleCenters}
              placeMap={placeMap}
              onSelectCenter={setSelectedPlaceId}
            />
          </div>
        </div>
      </div>

      {/* 移动端图例 */}
      <div className="relative z-10 px-4 pb-2 sm:hidden">
        <Legend hiddenTypes={hiddenTypes} onToggleType={toggleType} onReset={resetFilter} />
      </div>

      <div className="px-4 pb-3">
        <Timeline current={currentDynasty} onChange={handleDynastyChange} />
      </div>

      {selectedPlace && (
        <DetailDrawer
          place={selectedPlace}
          dynasty={dynasty}
          center={selectedCenter}
          figures={selectedFigures}
          onClose={() => setSelectedPlaceId(null)}
        />
      )}

      {shareOpen && mainCenter && (
        <SharePoster
          dynasty={dynasty}
          cityName={mainPlaceName}
          center={mainCenter}
          onClose={() => setShareOpen(false)}
        />
      )}

      {aboutOpen && <AboutModal onClose={() => setAboutOpen(false)} />}
    </div>
  )
}
