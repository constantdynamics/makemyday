import { useEffect, useState } from 'react';
import { fetchWeather, type Weather } from '../lib/weather';
import type { LatLng } from '../lib/geo';

/** Fetches current conditions once per location; silent on failure. */
export function useWeather(origin: LatLng | null): Weather | null {
  const [weather, setWeather] = useState<Weather | null>(null);

  useEffect(() => {
    if (!origin) {
      setWeather(null);
      return;
    }
    const ctrl = new AbortController();
    fetchWeather(origin, ctrl.signal)
      .then(setWeather)
      .catch(() => {
        /* weather is a nice-to-have; never block the dashboard on it */
      });
    return () => ctrl.abort();
    // Re-fetch only when the rounded location changes, not on every GPS jitter.
  }, [origin?.lat.toFixed(2), origin?.lng.toFixed(2)]); // eslint-disable-line react-hooks/exhaustive-deps

  return weather;
}
