/**
 * Build identity, baked in at compile time (see vite.config.ts `define`).
 * Surfaced in Settings so anyone can confirm *which* build is live: when the
 * version or date changes after a deploy, you know the new code shipped.
 */
export const APP_VERSION = __APP_VERSION__;
export const BUILD_DATE = __BUILD_DATE__;
export const COMMIT = __COMMIT__;

/** e.g. "v2.1.0 · 2026-06-12 · a1b2c3d" */
export const BUILD_LABEL = `v${APP_VERSION} · ${BUILD_DATE}${COMMIT ? ` · ${COMMIT}` : ''}`;
