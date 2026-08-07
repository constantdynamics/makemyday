export interface LatLng {
  lat: number;
  lng: number;
}

/** Promisified geolocation with sane defaults. */
export function getCurrentPosition(): Promise<LatLng> {
  return new Promise((resolve, reject) => {
    if (!('geolocation' in navigator)) {
      reject(new Error('geolocation-unsupported'));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      (err) => reject(err),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  });
}

/** Great-circle distance in metres. */
export function distanceMeters(a: LatLng, b: LatLng): number {
  const R = 6371000;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

export function formatDistance(meters: number, lang: 'nl' | 'en'): string {
  if (meters < 1000) return `${Math.round(meters)} m`;
  const km = meters / 1000;
  const value = km < 10 ? km.toFixed(1) : Math.round(km).toString();
  return `${value.replace('.', lang === 'nl' ? ',' : '.')} km`;
}

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

/** Initial great-circle bearing from `a` to `b`, in degrees clockwise from north. */
export function bearing(a: LatLng, b: LatLng): number {
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const dLng = toRad(b.lng - a.lng);
  const y = Math.sin(dLng) * Math.cos(lat2);
  const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);
  return ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;
}

const POINTS_NL = ['N', 'NO', 'O', 'ZO', 'Z', 'ZW', 'W', 'NW'];
const POINTS_EN = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];

/** Compass point abbreviation for a bearing — Dutch uses O/Z, English E/S. */
export function compassPoint(deg: number, lang: 'nl' | 'en'): string {
  const i = Math.round((((deg % 360) + 360) % 360) / 45) % 8;
  return (lang === 'nl' ? POINTS_NL : POINTS_EN)[i];
}

/** A friendly directions URL that works on any device. */
export function directionsUrl(to: LatLng, label?: string): string {
  const q = label ? encodeURIComponent(label) : `${to.lat},${to.lng}`;
  return `https://www.google.com/maps/dir/?api=1&destination=${to.lat},${to.lng}&destination_place_id=&query=${q}`;
}
