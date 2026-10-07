import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { SvgChinaMap } from './SvgChinaMap'
import { centers, places } from '../data/load'
import { routeForDynasty } from '../hooks/useDynasty'

describe('离线 SVG 中国地图（SvgChinaMap）', () => {
  const placeMap = new Map(places.map((p) => [p.id, p]))
  const tangCenters = centers.filter((c) => c.dynasty === 'tang')

  it('渲染省界与唐代气泡', () => {
    const { container } = render(
      <SvgChinaMap
        dynastyId="tang"
        dynastyCenters={tangCenters}
        route={routeForDynasty('tang')}
        placeMap={placeMap}
        onSelectCenter={() => {}}
      />,
    )
    const svg = container.querySelector('svg')
    expect(svg).not.toBeNull()
    // 省界 path 应有 34+ 个
    expect(container.querySelectorAll('path').length).toBeGreaterThanOrEqual(34)
    // 4 个唐代气泡
    expect(container.querySelectorAll('circle').length).toBe(4)
    expect(screen.getByText('西安')).toBeTruthy()
    expect(screen.getByText('敦煌')).toBeTruthy()
  })
})
