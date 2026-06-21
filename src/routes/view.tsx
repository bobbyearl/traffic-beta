/* eslint-disable react-refresh/only-export-components */
import './view.css';

import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';

import { CameraFeed } from '../components/CameraFeed';
import { CameraMap } from '../components/CameraMap';
import { DetailModal } from '../components/DetailModal';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { Footer } from '../components/Footer';
import { Header } from '../components/Header';
import { Sidebar } from '../components/Sidebar';
import { SplitView } from '../components/SplitView';
import { TrafficProvider, useTraffic } from '../lib/TrafficContext';
import { type ViewSearchParams } from '../lib/types';

export const Route = createFileRoute('/view')({
  component: () => (
    <ErrorBoundary>
      <TrafficProvider>
        <Home />
      </TrafficProvider>
    </ErrorBoundary>
  ),
  validateSearch: (search: Record<string, unknown>): ViewSearchParams => ({
    state: (search.state as string) || undefined,
    mode: search.mode === 'image' ? 'image' : undefined,
    selected: (search.selected as string) || undefined,
    view: ['map', 'split'].includes(search.view as string) ? (search.view as string) : undefined,
    grid: ['sm', 'lg'].includes(search.grid as string) ? (search.grid as string) : undefined,
    detail: (search.detail as string) || undefined,
    tab: search.tab === 'regions' ? 'regions' : undefined,
    sw: search.sw ? String(search.sw) : undefined,
  }),
});

function Home() {
  const { isLoading, stateId, selectedCameras, mode, view, cardSize, toggleCamera, setDetailCam } = useTraffic();
  const [sidebarOpen, setSidebarOpen] = useState(() => window.innerWidth >= 768);

  if (isLoading) {
    return <div className="loading">Loading cameras...</div>;
  }

  return (
    <div className="layout">
      <div className="main">
        <Header sidebarOpen={sidebarOpen} onSidebarToggle={() => setSidebarOpen(!sidebarOpen)} />

        <div className={`viewer-area ${view === 'split' ? 'viewer-area-split' : ''}`}>
          {view === 'map' ? (
            <CameraMap key={stateId} stateId={stateId} />
          ) : view === 'split' ? (
            <SplitView stateId={stateId} />
          ) : selectedCameras.length === 0 ? (
            <div className="empty-state">
              <p className="empty-title">Select cameras to view</p>
              <p className="empty-desc">Use the panel on the right to browse and select cameras by region</p>
            </div>
          ) : (
            <div className={`viewer-grid viewer-grid-${cardSize}`}>
              {selectedCameras.map((cam) => (
                <CameraFeed
                  key={cam.id}
                  camera={cam}
                  mode={mode}
                  onRemove={() => toggleCamera(cam.id)}
                  setDetailCam={setDetailCam}
                />
              ))}
            </div>
          )}
        </div>
        <Footer />
      </div>

      {sidebarOpen && (
        <>
          <div className="sidebar-backdrop" onClick={() => setSidebarOpen(false)} />
          <Sidebar />
        </>
      )}
      <DetailModal />
    </div>
  );
}
