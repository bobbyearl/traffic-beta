import { useEffect, useMemo, useRef, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { APIProvider, Map as GoogleMap, AdvancedMarker, useMap } from '@vis.gl/react-google-maps'
import { type Camera, type CameraGeoJSON, parseCameras } from '../lib/cameras'
import { CURATED_ROUTES } from '../lib/routes'
import { Image, Video, X, Search, ChevronDown, ChevronRight, Trash2, PanelRightClose, PanelRightOpen, Grid2x2, Grid3x3, LayoutGrid, MapIcon, GripVertical } from 'lucide-react'

type SearchParams = {
  mode?: string
  selected?: string
  view?: string
  grid?: string
  detail?: string
}

export const Route = createFileRoute('/')({
  component: Home,
  validateSearch: (search: Record<string, unknown>): SearchParams => ({
    mode: search.mode === 'image' ? 'image' : undefined,
    selected: (search.selected as string) || undefined,
    view: search.view === 'map' ? 'map' : undefined,
    grid: ['sm', 'lg'].includes(search.grid as string) ? (search.grid as string) : undefined,
    detail: (search.detail as string) || undefined,
  }),
})

function useCameras() {
  return useQuery({
    queryKey: ['cameras'],
    queryFn: async () => {
      const res = await fetch(import.meta.env.BASE_URL + 'data/cameras.geojson')
      const geojson: CameraGeoJSON = await res.json()
      return parseCameras(geojson)
    },
    staleTime: Infinity,
  })
}

function Home() {
  const params = Route.useSearch()
  const navigate = useNavigate({ from: '/' })
  const { data: cameras = [], isLoading } = useCameras()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [searchText, setSearchText] = useState('')
  const [expandedRegions, setExpandedRegions] = useState<Set<string>>(new Set())
  const [sidebarTab, setSidebarTab] = useState<'routes' | 'regions'>('routes')

  const mode = params.mode ?? 'video'
  const view = params.view ?? 'feeds'
  const cardSize = params.grid ?? 'md'
  const selectedIds = useMemo(() => new Set(params.selected?.split(',').filter(Boolean) ?? []), [params.selected])

  const setSelected = (ids: Set<string>) => {
    const val = ids.size ? [...ids].join(',') : undefined
    navigate({ search: { ...params, selected: val } })
  }

  const toggleCamera = (id: string) => {
    const next = new Set(selectedIds)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setSelected(next)
  }

  const clearAll = () => setSelected(new Set())

  const selectRoute = (ids: string[]) => setSelected(new Set(ids))

  const activeRouteName = useMemo(() => {
    const joined = [...selectedIds].sort().join(',')
    return CURATED_ROUTES.find((r) => [...r.ids].sort().join(',') === joined)?.name
  }, [selectedIds])

  const toggleRegion = (region: string) => {
    const next = new Set(expandedRegions)
    if (next.has(region)) next.delete(region)
    else next.add(region)
    setExpandedRegions(next)
  }

  const regionGroups = useMemo(() => {
    const map = new Map<string, Camera[]>()
    for (const c of cameras) {
      const r = c.jurisdiction.trim()
      if (!map.has(r)) map.set(r, [])
      map.get(r)!.push(c)
    }
    return [...map.entries()].sort((a, b) => a[0].localeCompare(b[0]))
  }, [cameras])

  const filteredRegionGroups = useMemo(() => {
    if (!searchText) return regionGroups
    const q = searchText.toLowerCase()
    return regionGroups
      .map(([region, cams]) => [region, cams.filter((c) => c.description.toLowerCase().includes(q))] as [string, Camera[]])
      .filter(([, cams]) => cams.length > 0)
  }, [regionGroups, searchText])

  const selectedCameras = useMemo(
    () => cameras.filter((c) => selectedIds.has(c.id)),
    [cameras, selectedIds],
  )

  const detailCam = useMemo(() => params.detail ? cameras.find((c) => c.id === params.detail) ?? null : null, [cameras, params.detail])
  const setDetailCam = (cam: Camera | null) => navigate({ search: { ...params, detail: cam?.id || undefined } })

  if (isLoading) {
    return <div className="loading">Loading cameras...</div>
  }

  return (
    <div className="layout">
      {/* Main content */}
      <div className="main">
        <header className="topbar">
          <div className="topbar-left">
            <h1 className="topbar-title">Bobby Earl Traffic</h1>
            {selectedCameras.length > 0 && (
              <span className="topbar-count">{selectedCameras.length} cameras selected</span>
            )}
          </div>
          <div className="topbar-actions">
            {selectedCameras.length > 0 && (
              <>
                <div className="btn-group">
                  <button
                    className={`btn-icon ${mode === 'video' ? 'btn-active' : ''}`}
                    onClick={() => navigate({ search: { ...params, mode: undefined } })}
                    title="Video"
                  >
                    <Video size={16} />
                  </button>
                  <button
                    className={`btn-icon ${mode === 'image' ? 'btn-active' : ''}`}
                    onClick={() => navigate({ search: { ...params, mode: 'image' } })}
                    title="Images"
                  >
                    <Image size={16} />
                  </button>
                </div>
                <div className="topbar-divider" />
                <div className="btn-group">
                  <button
                    className={`btn-icon ${cardSize === 'sm' ? 'btn-active' : ''}`}
                    onClick={() => navigate({ search: { ...params, grid: 'sm' } })}
                    title="Small"
                  >
                    <LayoutGrid size={16} />
                  </button>
                  <button
                    className={`btn-icon ${cardSize === 'md' ? 'btn-active' : ''}`}
                    onClick={() => navigate({ search: { ...params, grid: undefined } })}
                    title="Medium"
                  >
                    <Grid3x3 size={16} />
                  </button>
                  <button
                    className={`btn-icon ${cardSize === 'lg' ? 'btn-active' : ''}`}
                    onClick={() => navigate({ search: { ...params, grid: 'lg' } })}
                    title="Large"
                  >
                    <Grid2x2 size={16} />
                  </button>
                </div>
                <div className="topbar-divider" />
              </>
            )}
            <button
              className={`btn-icon ${view === 'map' ? 'btn-active' : ''}`}
              onClick={() => navigate({ search: { ...params, view: view === 'map' ? undefined : 'map' } })}
              title="Map view"
            >
              <MapIcon size={16} />
            </button>
            {selectedCameras.length > 0 && (
              <button className="btn-icon" onClick={clearAll} title="Clear all cameras">
                <Trash2 size={16} />
              </button>
            )}
            <button className="btn-icon" onClick={() => setSidebarOpen(!sidebarOpen)} title="Toggle panel">
              {sidebarOpen ? <PanelRightClose size={16} /> : <PanelRightOpen size={16} />}
            </button>
          </div>
        </header>

        {/* Viewer area */}
        <div className="viewer-area">
          {view === 'map' ? (
            <CameraMap cameras={cameras} selectedIds={selectedIds} onToggle={toggleCamera} cardSize={cardSize} setDetailCam={setDetailCam} />
          ) : selectedCameras.length === 0 ? (
            <div className="empty-state">
              <p className="empty-title">Select cameras to view</p>
              <p className="empty-desc">Use the panel on the right to browse and select cameras by region</p>
            </div>
          ) : (
            <div className={`viewer-grid viewer-grid-${cardSize}`}>
              {selectedCameras.map((cam) => (
                <CameraFeed key={cam.id} camera={cam} mode={mode} onRemove={() => toggleCamera(cam.id)} setDetailCam={setDetailCam} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right sidebar: camera selector */}
      {sidebarOpen && (
        <aside className="sidebar">
          <div className="sidebar-tabs">
            <button className={`sidebar-tab ${sidebarTab === 'routes' ? 'sidebar-tab-active' : ''}`} onClick={() => setSidebarTab('routes')}>
              Routes
            </button>
            <button className={`sidebar-tab ${sidebarTab === 'regions' ? 'sidebar-tab-active' : ''}`} onClick={() => setSidebarTab('regions')}>
              Regions
            </button>
          </div>

          {sidebarTab === 'routes' && (
            <div className="sidebar-list">
              {CURATED_ROUTES.map((route) => (
                <button
                  key={route.name}
                  className={`route-item ${activeRouteName === route.name ? 'route-item-active' : ''}`}
                  onClick={() => selectRoute(route.ids)}
                >
                  <span className="route-item-name">{route.name}</span>
                  <span className="route-item-count">{route.ids.length}</span>
                </button>
              ))}
            </div>
          )}

          {sidebarTab === 'regions' && (
            <>
              <div className="sidebar-search">
                <Search size={14} />
                <input
                  type="text"
                  placeholder="Find in this list"
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                />
              </div>
              <div className="sidebar-list">
                {filteredRegionGroups.map(([region, cams]) => {
                  const selectedInRegion = cams.filter((c) => selectedIds.has(c.id)).length
                  const expanded = expandedRegions.has(region)
                  return (
                    <div key={region} className="region-section">
                      <button className="region-header" onClick={() => toggleRegion(region)}>
                        {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                        <span className="region-label">{region}</span>
                        <span className="region-counter">{selectedInRegion}/{cams.length}</span>
                      </button>
                      {expanded && (
                        <div className="region-cameras">
                          {cams.map((cam) => (
                            <label key={cam.id} className="camera-row">
                              <input
                                type="checkbox"
                                checked={selectedIds.has(cam.id)}
                                onChange={() => toggleCamera(cam.id)}
                              />
                              <span className="camera-row-label">{cam.description}</span>
                            </label>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </>
          )}
        </aside>
      )}

      {/* Detail modal */}
      {detailCam && (
        <div className="modal-overlay" onClick={() => setDetailCam(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">{detailCam.description}</h2>
              <button className="btn-icon-sm" onClick={() => setDetailCam(null)}><X size={16} /></button>
            </div>
            <div className="modal-body">
              {mode === 'video' ? (
                <video src={detailCam.video_url} autoPlay muted playsInline controls className="modal-media" />
              ) : (
                <img src={detailCam.image_url} alt={detailCam.description} className="modal-media" />
              )}
              <dl className="modal-details">
                <dt>Route</dt><dd>{detailCam.route}</dd>
                <dt>Direction</dt><dd>{detailCam.direction || 'N/A'}</dd>
                <dt>Region</dt><dd>{detailCam.jurisdiction}</dd>
                <dt>Coordinates</dt><dd>{detailCam.lat.toFixed(6)}, {detailCam.lng.toFixed(6)}</dd>
                <dt>Camera ID</dt><dd>{detailCam.name}</dd>
                <dt>Image URL</dt><dd><a href={detailCam.image_url} target="_blank" rel="noopener">{detailCam.image_url}</a></dd>
                <dt>Video URL</dt><dd><a href={detailCam.video_url} target="_blank" rel="noopener">{detailCam.video_url}</a></dd>
              </dl>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function CameraFeed({ camera, mode, onRemove, setDetailCam }: { camera: Camera; mode: string; onRemove: () => void; setDetailCam: (c: Camera) => void }) {
  const [error, setError] = useState(false)
  const [stalled, setStalled] = useState(false)
  const [retryCount, setRetryCount] = useState(0)
  const [videoKey, setVideoKey] = useState(0)
  const videoRef = useRef<HTMLVideoElement>(null)
  const checkInterval = useRef<ReturnType<typeof setInterval> | null>(null)
  const retryTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const lastTimeRef = useRef(-1)

  useEffect(() => {
    if (mode !== 'video' || error) return
    lastTimeRef.current = -1
    checkInterval.current = setInterval(() => {
      const video = videoRef.current
      if (!video) { console.log(`[${camera.id}] no video ref`); return }
      console.log(`[${camera.id}] check: currentTime=${video.currentTime}, lastTime=${lastTimeRef.current}, networkState=${video.networkState}, readyState=${video.readyState}`)
      if ((video.currentTime === lastTimeRef.current && video.currentTime > 0) || (video.currentTime === 0 && lastTimeRef.current === -1)) {
        console.warn(`[${camera.id}] stalled at ${video.currentTime}s, networkState=${video.networkState}, readyState=${video.readyState}, retry=${retryCount}`)
        setStalled(true)
        // Auto-retry with exponential backoff (max 3 retries)
        if (retryCount < 3) {
          const delay = Math.pow(2, retryCount) * 2000
          retryTimer.current = setTimeout(() => {
            setStalled(false)
            setRetryCount((c) => c + 1)
            lastTimeRef.current = 0
            if (videoRef.current) {
              videoRef.current.load()
              videoRef.current.play()
            }
          }, delay)
        }
      } else {
        if (video.currentTime > 0) {
          setStalled(false)
        } else if (lastTimeRef.current === -1) {
          // First check, video at 0 - give it one more cycle
          lastTimeRef.current = -1
        }
      }
      lastTimeRef.current = video.currentTime === 0 && lastTimeRef.current === -1 ? -1 : video.currentTime
    }, 5000)
    return () => {
      if (checkInterval.current) clearInterval(checkInterval.current)
      if (retryTimer.current) clearTimeout(retryTimer.current)
    }
  }, [mode, error, retryCount])

  const retry = () => { setError(false); setStalled(false); setRetryCount(0); setVideoKey((k) => k + 1); lastTimeRef.current = -1 }

  const handleError = () => {
    console.warn(`[${camera.id}] video onError fired, retryCount=${retryCount}`)
    if (retryCount < 3) {
      setStalled(true)
      const delay = Math.pow(2, retryCount) * 2000
      retryTimer.current = setTimeout(() => {
        setStalled(false)
        setRetryCount((c) => c + 1)
        setVideoKey((k) => k + 1)
        lastTimeRef.current = -1
      }, delay)
    } else {
      setError(true)
    }
  }

  return (
    <div className="feed-item">
      <div className="feed-header">
        <span className="feed-title">{camera.description}</span>
      </div>
      <div className="feed-media">
        {error ? (
          <div className="feed-error">
            <p className="feed-error-text">SCDOT feed unavailable</p>
            <button className="feed-error-retry" onClick={retry}>Retry</button>
          </div>
        ) : mode === 'video' ? (
          <>
            <video key={videoKey} ref={videoRef} src={camera.video_url} autoPlay muted playsInline controls onError={handleError} />
            {stalled && (
              <div className="feed-stalled-overlay">
                <span className="feed-stalled">unstable feed{retryCount > 0 ? ` (retry ${retryCount}/3)` : ''}</span>
              </div>
            )}
          </>
        ) : (
          <img src={camera.image_url} alt={camera.description} onError={() => setError(true)} />
        )}
      </div>
      <div className="feed-footer">
        <button className="feed-footer-btn" onClick={() => setDetailCam(camera)}>Detail</button>
        <button className="feed-footer-btn" onClick={onRemove}>Remove</button>
      </div>
    </div>
  )
}

function CameraMap({ cameras, selectedIds, onToggle, cardSize, setDetailCam }: { cameras: Camera[]; selectedIds: Set<string>; onToggle: (id: string) => void; cardSize: string; setDetailCam: (c: Camera) => void }) {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY
  const mapId = import.meta.env.VITE_GOOGLE_MAPS_MAP_ID || ''
  const mode = Route.useSearch().mode ?? 'video'

  if (!apiKey) {
    return (
      <div className="empty-state">
        <p className="empty-title">Map view requires a Google Maps API key</p>
        <p className="empty-desc">Add VITE_GOOGLE_MAPS_API_KEY to your .env file</p>
      </div>
    )
  }

  return (
    <APIProvider apiKey={apiKey}>
      <MapInner cameras={cameras} selectedIds={selectedIds} onToggle={onToggle} mode={mode} mapId={mapId} cardSize={cardSize} setDetailCam={setDetailCam} />
    </APIProvider>
  )
}

// Find the closest point on a rectangle's edge to a given point
function clampToRect(px: number, py: number, rectX: number, rectY: number, rectW: number, rectH: number) {
  // Clamp the point to the rectangle bounds
  return {
    x: Math.max(rectX, Math.min(px, rectX + rectW)),
    y: Math.max(rectY, Math.min(py, rectY + rectH)),
  }
}

function MapInner({ cameras, selectedIds, onToggle, mode, mapId, cardSize, setDetailCam }: { cameras: Camera[]; selectedIds: Set<string>; onToggle: (id: string) => void; mode: string; mapId: string; cardSize: string; setDetailCam: (c: Camera) => void }) {
  const map = useMap()
  const [offsets, setOffsets] = useState<Map<string, { x: number; y: number }>>(new Map())
  const [dragging, setDragging] = useState<{ id: string; startX: number; startY: number; ox: number; oy: number } | null>(null)
  const didDragRef = useRef(false)
  const prevSelectedRef = useRef<Set<string>>(new Set())

  const cardWidthPx = cardSize === 'sm' ? 200 : cardSize === 'lg' ? 500 : 340

  // Auto-layout + zoom-to-fit when multiple cameras are selected at once
  useEffect(() => {
    const newIds = [...selectedIds].filter((id) => !prevSelectedRef.current.has(id))
    prevSelectedRef.current = new Set(selectedIds)
    if (newIds.length <= 1) return

    const newCams = newIds.map((id) => cameras.find((c) => c.id === id)).filter(Boolean) as Camera[]
    if (!map || newCams.length === 0) return

    const cardW = cardWidthPx
    const cardH = cardWidthPx * 0.75 + 50

    // 1. Zoom to fit all markers with padding for cards
    const bounds = new google.maps.LatLngBounds()
    for (const cam of newCams) bounds.extend({ lat: cam.lat, lng: cam.lng })
    map.fitBounds(bounds, { top: cardH + 80, bottom: 80, left: cardW / 2 + 40, right: cardW / 2 + 40 })

    // 2. Wait for map to settle, then compute pixel-based layout
    setTimeout(() => {
      const projection = map.getProjection()
      if (!projection) return

      const zoom = map.getZoom() ?? 10
      const scale = Math.pow(2, zoom)
      const mapBounds = map.getBounds()
      if (!mapBounds) return

      // Convert lat/lng to pixel position relative to map container
      const nw = projection.fromLatLngToPoint(mapBounds.getNorthEast())!
      const sw = projection.fromLatLngToPoint(mapBounds.getSouthWest())!
      const topLeft = projection.fromLatLngToPoint(new google.maps.LatLng(mapBounds.getNorthEast().lat(), mapBounds.getSouthWest().lng()))!

      const toPixel = (lat: number, lng: number) => {
        const worldPoint = projection.fromLatLngToPoint(new google.maps.LatLng(lat, lng))!
        return {
          x: (worldPoint.x - topLeft.x) * scale,
          y: (worldPoint.y - topLeft.y) * scale,
        }
      }

      // Get pixel positions for each camera
      const camPixels = newCams.map((cam) => ({ cam, pixel: toPixel(cam.lat, cam.lng) }))

      // Sort by geographic angle from centroid (still helps with line crossings)
      const centroidX = camPixels.reduce((s, c) => s + c.pixel.x, 0) / camPixels.length
      const centroidY = camPixels.reduce((s, c) => s + c.pixel.y, 0) / camPixels.length
      camPixels.sort((a, b) => {
        const angleA = Math.atan2(a.pixel.y - centroidY, a.pixel.x - centroidX)
        const angleB = Math.atan2(b.pixel.y - centroidY, b.pixel.x - centroidX)
        return angleA - angleB
      })

      // Greedy placement: for each camera, try positions in expanding spiral until no overlap
      // Include all marker positions as obstacles (16x16 each)
      const placed: Array<{ x: number; y: number; w: number; h: number }> = []
      for (const { pixel } of camPixels) {
        placed.push({ x: pixel.x - 8, y: pixel.y - 8, w: 16, h: 16 })
      }

      const overlaps = (x: number, y: number) => {
        for (const p of placed) {
          if (x < p.x + p.w + 8 && x + cardW + 8 > p.x && y < p.y + p.h + 8 && y + cardH + 8 > p.y) return true
        }
        return false
      }

      const newOffsets = new Map<string, { x: number; y: number }>()

      for (const { cam, pixel } of camPixels) {
        // Try positions in a spiral: increasing distance, multiple angles
        let bestX = 0, bestY = -(cardH + 20)
        let found = false

        for (let dist = cardH * 0.6; dist < cardH * 8 && !found; dist += cardH * 0.3) {
          for (let a = 0; a < 16; a++) {
            const angle = (Math.PI * 2 * a) / 16 - Math.PI / 2
            const candidateX = Math.cos(angle) * dist
            const candidateY = Math.sin(angle) * dist
            const absX = pixel.x + candidateX
            const absY = pixel.y + candidateY

            if (!overlaps(absX, absY)) {
              bestX = candidateX
              bestY = candidateY
              found = true
              break
            }
          }
        }

        placed.push({ x: pixel.x + bestX, y: pixel.y + bestY, w: cardW, h: cardH })
        newOffsets.set(cam.id, { x: bestX, y: bestY })
      }

      setOffsets((prev) => {
        const next = new Map(prev)
        for (const [id, offset] of newOffsets) next.set(id, offset)
        return next
      })
    }, 500) // Wait for fitBounds to settle
  }, [selectedIds, map, cameras, cardWidthPx])

  const onPointerDown = (e: React.PointerEvent, id: string) => {
    e.preventDefault()
    e.stopPropagation()
    const existing = offsets.get(id) ?? { x: 0, y: 0 }
    setDragging({ id, startX: e.clientX, startY: e.clientY, ox: existing.x, oy: existing.y })
    ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
  }

  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragging) return
    e.stopPropagation()
    didDragRef.current = true
    const dx = e.clientX - dragging.startX
    const dy = e.clientY - dragging.startY
    setOffsets((prev) => {
      const next = new Map(prev)
      next.set(dragging.id, { x: dragging.ox + dx, y: dragging.oy + dy })
      return next
    })
  }

  const onPointerUp = (e: React.PointerEvent) => {
    if (!dragging) return
    e.stopPropagation()
    setDragging(null)
    // Reset didDrag after a tick so the click handler can check it
    setTimeout(() => { didDragRef.current = false }, 0)
  }

  const handleMarkerClick = (id: string) => {
    if (didDragRef.current) return
    onToggle(id)
  }

  return (
    <GoogleMap
      defaultCenter={{ lat: 33.0, lng: -80.0 }}
      defaultZoom={8}
      mapId={mapId}
      className="map-container"
    >
      {cameras.map((cam) => {
        const isSelected = selectedIds.has(cam.id)
        const offset = offsets.get(cam.id)
        return (
          <AdvancedMarker
            key={cam.id}
            position={{ lat: cam.lat, lng: cam.lng }}
            onClick={() => handleMarkerClick(cam.id)}
            zIndex={isSelected ? 100 : 1}
          >
            {isSelected ? (
              <div className="map-feed-anchor" onClick={(e) => e.stopPropagation()}>
                <div className="map-pin-active" />
                {(() => {
                  const ex = offset?.x ?? cardWidthPx * 0.15
                  const ey = offset?.y ?? -(cardWidthPx * 0.7 + 20)
                  return (
                    <svg style={{ position: 'absolute', top: 0, left: 0, overflow: 'visible', pointerEvents: 'none' }}>
                      <line x1="8" y1="8" x2={clampToRect(8, 8, ex, ey, cardWidthPx, cardWidthPx * 0.6).x} y2={clampToRect(8, 8, ex, ey, cardWidthPx, cardWidthPx * 0.6).y} stroke="var(--color-accent-marker)" strokeWidth="2" strokeDasharray="4 3" />
                    </svg>
                  )
                })()}
                <div
                  className="map-feed"
                  style={{ width: `${cardWidthPx}px`, position: 'absolute', left: offset?.x ?? cardWidthPx * 0.15, top: offset?.y ?? -(cardWidthPx * 0.7 + 20) }}
                  onPointerMove={onPointerMove}
                  onPointerUp={onPointerUp}
                >
                  <div className="map-feed-header">
                    <div
                      className="map-feed-drag"
                      onPointerDown={(e) => onPointerDown(e, cam.id)}
                    >
                      <GripVertical size={12} />
                    </div>
                    <span className="map-feed-title">{cam.description}</span>
                    <button className="btn-icon-sm" onClick={(e) => { e.stopPropagation(); onToggle(cam.id) }}>
                      <X size={12} />
                    </button>
                  </div>
                  {mode === 'video' ? (
                    <video src={cam.video_url} autoPlay muted playsInline controls />
                  ) : (
                    <img src={cam.image_url} alt={cam.description} />
                  )}
                  <div className="feed-footer">
                    <button className="feed-footer-btn" onClick={(e) => { e.stopPropagation(); setDetailCam(cam) }}>Detail</button>
                    <button className="feed-footer-btn" onClick={(e) => { e.stopPropagation(); onToggle(cam.id) }}>Remove</button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="map-pin" />
            )}
          </AdvancedMarker>
        )
      })}
    </GoogleMap>
  )
}
