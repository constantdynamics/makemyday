import { STORAGE_PREFIX } from './config';

const ONBOARDED_KEY = `${STORAGE_PREFIX}onboarded`;

export function hasOnboarded(): boolean {
  try {
    return localStorage.getItem(ONBOARDED_KEY) === '1';
  } catch {
    return true; // storage unavailable → never trap the user in onboarding
  }
}

export function markOnboarded() {
  try {
    localStorage.setItem(ONBOARDED_KEY, '1');
  } catch {
    /* ignore quota errors */
  }
}
