/**
 * Best-effort "is it open right now?" check for OpenStreetMap `opening_hours`
 * tags. The full opening_hours spec is famously gnarly, so we deliberately only
 * handle the common shapes (day ranges + time ranges, `24/7`) and return `null`
 * — meaning "unknown, don't penalise it" — for anything we can't confidently
 * parse. Callers should treat `null` as "assume open".
 */

const DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']; // JS getDay() index 0..6

function dayIndex(token: string): number {
  return DAYS.indexOf(token);
}

/** Expand a day spec like "Mo-Fr" or "Sa" into a set of JS weekday indexes. */
function parseDays(spec: string): Set<number> | null {
  const out = new Set<number>();
  for (const part of spec.split(',')) {
    const range = part.trim().split('-');
    if (range.length === 1) {
      const d = dayIndex(range[0]);
      if (d < 0) return null;
      out.add(d);
    } else if (range.length === 2) {
      const a = dayIndex(range[0]);
      const b = dayIndex(range[1]);
      if (a < 0 || b < 0) return null;
      for (let i = a; ; i = (i + 1) % 7) {
        out.add(i);
        if (i === b) break;
      }
    } else {
      return null;
    }
  }
  return out;
}

function toMinutes(hhmm: string): number | null {
  const m = /^(\d{1,2}):(\d{2})$/.exec(hhmm.trim());
  if (!m) return null;
  return parseInt(m[1], 10) * 60 + parseInt(m[2], 10);
}

/**
 * @returns `true` (open now), `false` (closed now), or `null` (couldn't parse).
 */
export function isOpenNow(spec: string | undefined, now: Date = new Date()): boolean | null {
  if (!spec) return null;
  const value = spec.trim();
  if (value === '24/7') return true;

  const today = now.getDay();
  const minutes = now.getHours() * 60 + now.getMinutes();
  let matchedAnyRule = false;

  for (const rawRule of value.split(';')) {
    const rule = rawRule.trim();
    if (!rule) continue;
    // Pull every HH:MM-HH:MM range out of the rule. Rules with no time range
    // (e.g. "PH off") simply contribute nothing.
    const timeRanges = [...rule.matchAll(/(\d{1,2}:\d{2})\s*-\s*(\d{1,2}:\d{2})/g)];
    if (!timeRanges.length) continue;

    // The day portion is everything before the first time token (may be empty).
    const dayPart = rule.slice(0, rule.indexOf(timeRanges[0][1])).trim();
    let days: Set<number> | null;
    if (!dayPart || /^(mo-su|24\/7)$/i.test(dayPart)) {
      days = new Set([0, 1, 2, 3, 4, 5, 6]);
    } else {
      days = parseDays(dayPart);
    }
    if (!days) return null; // unparseable day spec → give up rather than guess
    matchedAnyRule = true;
    if (!days.has(today)) continue;

    for (const [, from, to] of timeRanges) {
      const start = toMinutes(from);
      let end = toMinutes(to);
      if (start == null || end == null) return null;
      if (end <= start) end += 24 * 60; // crosses midnight
      const cur = minutes < start ? minutes + 24 * 60 : minutes;
      if (cur >= start && cur < end) return true;
    }
  }

  return matchedAnyRule ? false : null;
}

export function openLabel(state: boolean | null, lang: 'nl' | 'en'): string | null {
  if (state === null) return null;
  if (lang === 'nl') return state ? 'Nu open' : 'Nu gesloten';
  return state ? 'Open now' : 'Closed now';
}
