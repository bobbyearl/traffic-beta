import { useTraffic } from '../lib/TrafficContext';

interface PrefsPopoverProps {
  onClose: () => void;
}

export function PrefsPopover({ onClose }: PrefsPopoverProps) {
  const { mode, showMap, showList, cardSize, density, stateConfig, setMode, setGrid, setDensity, setViewMode, resetAll } = useTraffic();
  const viewMode = showMap && showList ? 'both' : showMap ? 'map' : 'list';

  return (
    <>
      <div className="prefs-backdrop" onClick={onClose} />
      <div className="prefs-popover">
        <div className="prefs-row">
          <span className="prefs-label">View</span>
          <div className="prefs-options">
            <label><input type="radio" name="view" checked={viewMode === 'map'} onChange={() => setViewMode('map')} /> Map</label>
            <label><input type="radio" name="view" checked={viewMode === 'list'} onChange={() => setViewMode('list')} /> List</label>
            <label><input type="radio" name="view" checked={viewMode === 'both'} onChange={() => setViewMode('both')} /> Both</label>
          </div>
        </div>
        {stateConfig.supportsVideo && (
          <div className="prefs-row">
            <span className="prefs-label">Format (varies by state)</span>
            <div className="prefs-options">
              <label><input type="radio" name="format" checked={mode === 'image'} onChange={() => setMode('image')} /> Images</label>
              <label><input type="radio" name="format" checked={mode === 'video'} onChange={() => setMode(undefined)} /> Video</label>
            </div>
          </div>
        )}
        <div className="prefs-row">
          <span className="prefs-label">Size</span>
          <div className="prefs-options">
            <label><input type="radio" name="size" checked={cardSize === 'sm'} onChange={() => setGrid('sm')} /> Small</label>
            <label><input type="radio" name="size" checked={cardSize === 'md'} onChange={() => setGrid('md')} /> Medium</label>
            <label><input type="radio" name="size" checked={cardSize === 'lg'} onChange={() => setGrid(undefined)} /> Large</label>
          </div>
        </div>
        <div className="prefs-row">
          <span className="prefs-label">Density</span>
          <div className="prefs-options">
            <label><input type="radio" name="density" checked={density === 'compact'} onChange={() => setDensity('compact')} /> City Streets</label>
            <label><input type="radio" name="density" checked={density === 'open'} onChange={() => setDensity(undefined)} /> Open Road</label>
          </div>
        </div>
        <div className="prefs-footer">
          <button className="prefs-reset" onClick={() => { resetAll(); }}>Reset to Defaults</button>
          <button className="prefs-close" onClick={onClose}>Close</button>
        </div>
      </div>
    </>
  );
}
