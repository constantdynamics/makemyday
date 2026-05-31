import type { Lang } from '../i18n';

/** Compact "x minutes ago" style relative time, localized for nl/en. */
export function timeAgo(iso: string, lang: Lang): string {
  const then = new Date(iso).getTime();
  const secs = Math.max(1, Math.round((Date.now() - then) / 1000));
  const units: [number, string, string][] = [
    [60, 'sec', 's'],
    [3600, 'min', 'min'],
    [86400, 'uur', 'h'],
    [604800, 'dag', 'd'],
    [2592000, 'week', 'w'],
  ];
  for (let i = 0; i < units.length; i++) {
    const [limit] = units[i];
    if (secs < limit) {
      const div = i === 0 ? 1 : units[i - 1][0];
      const value = Math.floor(secs / div);
      return lang === 'nl' ? `${value} ${nlUnit(i, value)} geleden` : `${value}${enUnit(i)} ago`;
    }
  }
  const months = Math.floor(secs / 2592000);
  return lang === 'nl' ? `${months} mnd geleden` : `${months}mo ago`;
}

function nlUnit(i: number, v: number): string {
  const labels = ['sec', 'min', 'uur', v === 1 ? 'dag' : 'dagen', v === 1 ? 'week' : 'weken'];
  return labels[i];
}
function enUnit(i: number): string {
  return ['s', 'min', 'h', 'd', 'w'][i];
}

export function formatDuration(minutes: number, lang: Lang): string {
  if (minutes < 60) return lang === 'nl' ? `${minutes} min` : `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  const hUnit = lang === 'nl' ? 'u' : 'h';
  return m ? `${h}${hUnit} ${m}m` : `${h} ${hUnit}`;
}

export function initials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('');
}
