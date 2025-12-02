/*
 * Simple no-op service worker so navigator.serviceWorker.register('/sw.js')
 * does not hit the Nuxt router and crash the dev error overlay.
 */
self.addEventListener('install', () => self.skipWaiting())
self.addEventListener('activate', () => self.clients.claim())
