import './Header.css';

import { Link } from '@tanstack/react-router';
import {
  Columns,
  Grid2x2,
  Grid3x3,
  Image,
  LayoutGrid,
  MapIcon,
  PanelRightClose,
  PanelRightOpen,
  Sparkles,
  Trash2,
  Video,
} from 'lucide-react';

import { STATES } from '../lib/cameras';
import { useTraffic } from '../lib/TrafficContext';

interface HeaderProps {
  sidebarOpen: boolean;
  onSidebarToggle: () => void;
}

export function Header({ sidebarOpen, onSidebarToggle }: HeaderProps) {
  const {
    stateId,
    mode,
    view,
    cardSize,
    selectedCameras,
    stateConfig,
    setState,
    setMode,
    setGrid,
    setView,
    clearAll,
    triggerLayout,
  } = useTraffic();

  return (
    <header className="header-bar">
      <div className="header-bar-left">
        <h1 className="header-bar-title">
          <Link to="/">Roadie</Link>
        </h1>
        <select className="state-select" value={stateId} onChange={(e) => setState(e.target.value)}>
          <option value="all">All States ({STATES.reduce((sum, s) => sum + s.cameraCount, 0).toLocaleString()})</option>
          {STATES.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name} ({s.cameraCount})
            </option>
          ))}
        </select>
        <span className="header-bar-count">{selectedCameras.length} selected</span>
      </div>
      <div className="header-bar-actions">
        {stateConfig.supportsVideo && (
          <div className="btn-group">
            <button
              className={`btn-icon ${mode === 'video' ? 'btn-active' : ''}`}
              onClick={() => setMode(undefined)}
              disabled={selectedCameras.length === 0}
              title="Video"
            >
              <Video size={16} />
            </button>
            <button
              className={`btn-icon ${mode === 'image' ? 'btn-active' : ''}`}
              onClick={() => setMode('image')}
              disabled={selectedCameras.length === 0}
              title="Images"
            >
              <Image size={16} />
            </button>
          </div>
        )}
        <div className="header-bar-divider" />
        <div className="btn-group hidden-mobile">
          <button
            className={`btn-icon ${cardSize === 'sm' ? 'btn-active' : ''}`}
            onClick={() => setGrid('sm')}
            disabled={selectedCameras.length === 0}
            title="Small"
          >
            <LayoutGrid size={16} />
          </button>
          <button
            className={`btn-icon ${cardSize === 'md' ? 'btn-active' : ''}`}
            onClick={() => setGrid(undefined)}
            disabled={selectedCameras.length === 0}
            title="Medium"
          >
            <Grid3x3 size={16} />
          </button>
          <button
            className={`btn-icon ${cardSize === 'lg' ? 'btn-active' : ''}`}
            onClick={() => setGrid('lg')}
            disabled={selectedCameras.length === 0}
            title="Large"
          >
            <Grid2x2 size={16} />
          </button>
        </div>
        <div className="header-bar-divider" />
        <div className="btn-group">
          <button
            className={`btn-icon ${view === 'split' ? 'btn-active' : ''}`}
            onClick={() => setView('split')}
            title="Split view"
          >
            <Columns size={16} />
          </button>
          <button
            className={`btn-icon ${view === 'map' ? 'btn-active' : ''}`}
            onClick={() => setView('map')}
            title="Map view"
          >
            <MapIcon size={16} />
          </button>
          <button
            className={`btn-icon ${view === 'list' ? 'btn-active' : ''}`}
            onClick={() => setView(undefined)}
            title="List view"
          >
            <LayoutGrid size={16} />
          </button>
        </div>
        {view === 'map' && (
          <button className="btn-icon" onClick={triggerLayout} disabled={selectedCameras.length < 2} title="Auto-layout">
            <Sparkles size={16} />
          </button>
        )}
        <button className="btn-icon" onClick={clearAll} disabled={selectedCameras.length === 0} title="Clear all">
          <Trash2 size={16} />
        </button>
        <button className="btn-icon" onClick={onSidebarToggle} title="Toggle panel">
          {sidebarOpen ? <PanelRightClose size={16} /> : <PanelRightOpen size={16} />}
        </button>
      </div>
    </header>
  );
}
