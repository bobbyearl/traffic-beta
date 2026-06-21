# Roadie

Multi-state traffic camera viewer. View 7,600+ live cameras across South Carolina, North Carolina, Virginia, and Georgia.

**Live:** [bobbyearl.com/roadie](https://bobbyearl.com/roadie)

## Features

- Multi-camera viewing (select and watch multiple feeds side by side)
- Interactive map with draggable camera feeds
- Curated routes for Charleston, SC commuters
- Multi-state support (SC, NC, VA, GA)
- Live video (SC, VA) and static images (NC, GA)
- Dark mode with system preference detection
- All state saved in the URL (shareable, bookmarkable)
- Auto-retry on unstable feeds with exponential backoff

## Stack

- React 19, TypeScript, Vite
- TanStack Router (file-based, URL state)
- TanStack Query (async data loading)
- Google Maps (Advanced Markers, draggable feeds, auto-layout)
- Tailwind CSS v4 with co-located component styles
- shadcn/ui patterns (no library, just the approach)
- GitHub Pages via Actions

## Development

```bash
npm install
npm run dev        # http://localhost:5173/roadie/
npm run build      # Production build
npm run lint       # ESLint
npm run format     # Prettier
```

## Environment Variables

Create a `.env` file:

```
VITE_GOOGLE_MAPS_API_KEY=your-key
VITE_GOOGLE_MAPS_MAP_ID=your-map-id
```

## Data Sources

Camera data is stored locally (no runtime API calls to DOT sites):

| State | Source | Cameras | Video |
|-------|--------|---------|-------|
| SC | sc.cdn.iteris-atis.com | 760 | Live HLS |
| NC | drivenc.gov | 1,112 | Images only |
| VA | 511.vdot.virginia.gov | 1,692 | Live HLS |
| GA | 511ga.org | 4,043 | Images only |

## History

Previously "Bobby Earl Traffic" (2016-2024), an Angular/SKY UX app for SC-only cameras. Rebuilt in 2026 as Roadie with multi-state support and modern stack.

### Legacy Changelog

- **2019-06-23** - Switched to vertical nav, map location in URL state
- **2018-09-10** - Website reborn (SKY UX)
- **2017-09-09** - Revamped with SKY UX Builder
- **2017-04-01** - Better mobile video player
- **2016-12-19** - Removed Hurricane Matthew info
