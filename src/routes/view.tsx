import { createFileRoute, Outlet, redirect } from '@tanstack/react-router';

import { ErrorBoundary } from '../components/ErrorBoundary';
import { TrafficProvider } from '../lib/TrafficContext';
import { Home } from './view.$stateId';

export const Route = createFileRoute('/view')({
  beforeLoad: ({ location }) => {
    if (location.pathname === '/view' || location.pathname === '/view/') {
      const lastState = localStorage.getItem('roadie-last-state') || 'sc';
      throw redirect({ to: '/view/$stateId', params: { stateId: lastState } } as never);
    }
  },
  component: () => (
    <ErrorBoundary>
      <TrafficProvider>
        <Home />
        <Outlet />
      </TrafficProvider>
    </ErrorBoundary>
  ),
});
