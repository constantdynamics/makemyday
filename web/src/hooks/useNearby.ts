import { useCallback, useEffect, useRef, useState } from 'react';
import { getCurrentPosition, type LatLng } from '../lib/geo';
import { fetchNearbyPois, type Poi } from '../lib/overpass';
import type { Category } from '../types/db';
import { useAuth } from '../contexts/AuthContext';

type Status = 'idle' | 'locating' | 'loading' | 'ready' | 'denied' | 'error';

/**
 * Resolves the user's location (live, or their saved home) and fetches nearby
 * OpenStreetMap POIs for the given categories + radius.
 */
export function useNearby(categories: Category[], radius: number, categoryId: string | 'all') {
  const { profile } = useAuth();
  const [origin, setOrigin] = useState<LatLng | null>(null);
  const [pois, setPois] = useState<Poi[]>([]);
  const [status, setStatus] = useState<Status>('idle');
  const abortRef = useRef<AbortController | null>(null);

  const requestLocation = useCallback(async () => {
    setStatus('locating');
    try {
      const pos = await getCurrentPosition();
      setOrigin(pos);
    } catch (err) {
      // Fall back to a saved home location if available.
      if (profile?.home_lat != null && profile?.home_lng != null) {
        setOrigin({ lat: profile.home_lat, lng: profile.home_lng });
        return;
      }
      const denied = (err as GeolocationPositionError)?.code === 1;
      setStatus(denied ? 'denied' : 'error');
    }
  }, [profile]);

  // Auto-use saved home on first mount (no prompt) so guests see something.
  useEffect(() => {
    if (origin) return;
    if (profile?.home_lat != null && profile?.home_lng != null) {
      setOrigin({ lat: profile.home_lat, lng: profile.home_lng });
    }
  }, [profile, origin]);

  useEffect(() => {
    if (!origin || categories.length === 0) return;
    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    setStatus('loading');

    const active =
      categoryId === 'all' ? categories : categories.filter((c) => c.id === categoryId);
    const filters = active.map((c) => ({ categoryId: c.id, osm: c.osm_filters }));

    fetchNearbyPois(origin, radius, filters, ctrl.signal)
      .then((res) => {
        setPois(res);
        setStatus('ready');
      })
      .catch((e) => {
        if (ctrl.signal.aborted) return;
        console.warn('overpass error', e);
        setStatus('error');
      });

    return () => ctrl.abort();
  }, [origin, radius, categoryId, categories]);

  return { origin, pois, status, requestLocation, setOrigin };
}
