/**
 * Live weather for the user's location via Open-Meteo (no API key, CORS-open).
 * We only need a coarse read: is it wet or cold enough that we should steer the
 * wheel toward indoor adventures?
 */
import type { LatLng } from './geo';

export interface Weather {
  tempC: number;
  /** WMO weather interpretation code. */
  code: number;
  isWet: boolean;
  isCold: boolean;
  /** Nudge suggestions indoors when the weather is genuinely unpleasant. */
  preferIndoor: boolean;
}

// WMO codes ≥ 51 are drizzle/rain/snow/showers/thunderstorm; 45/48 are fog.
function wet(code: number): boolean {
  return code >= 51 || code === 45 || code === 48;
}

export async function fetchWeather(origin: LatLng, signal?: AbortSignal): Promise<Weather> {
  const url =
    `https://api.open-meteo.com/v1/forecast?latitude=${origin.lat}` +
    `&longitude=${origin.lng}&current=temperature_2m,weather_code`;
  const res = await fetch(url, { signal });
  if (!res.ok) throw new Error(`open-meteo ${res.status}`);
  const data = await res.json();
  const tempC: number = data?.current?.temperature_2m ?? NaN;
  const code: number = data?.current?.weather_code ?? 0;
  const isWet = wet(code);
  const isCold = Number.isFinite(tempC) && tempC < 4;
  return { tempC, code, isWet, isCold, preferIndoor: isWet || isCold };
}

/** Short human label + icon name for the current conditions. */
export function weatherSummary(w: Weather, lang: 'nl' | 'en'): { label: string; icon: string } {
  const temp = Number.isFinite(w.tempC) ? `${Math.round(w.tempC)}°` : '';
  if (w.isWet)
    return { label: `${lang === 'nl' ? 'Regen' : 'Rain'} ${temp}`.trim(), icon: 'cloud-rain' };
  if (w.isCold)
    return { label: `${lang === 'nl' ? 'Koud' : 'Cold'} ${temp}`.trim(), icon: 'cloud' };
  return { label: temp || (lang === 'nl' ? 'Helder' : 'Clear'), icon: 'sun' };
}
