import { precacheAndRoute } from 'workbox-precaching';
import { clientsClaim } from 'workbox-core';

declare let self: ServiceWorkerGlobalScope;

self.skipWaiting();
clientsClaim();

// Precache all assets
precacheAndRoute(self.__WB_MANIFEST);

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  // Get the notification data containing the URL
  const url = event.notification.data?.url || '/';

  // Handle notification action clicks
  if (event.action === 'open') {
    // Focus on existing window or open new one
    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true })
        .then((windowClients) => {
          // Check if there is already a window/tab open with the target URL
          for (let client of windowClients) {
            if (client.url === url && 'focus' in client) {
              return client.focus();
            }
          }
          // If no window/tab is already open, open a new one
          if (clients.openWindow) {
            return clients.openWindow(url);
          }
        })
    );
  } else {
    // Default click behavior (clicking the notification itself)
    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true })
        .then((windowClients) => {
          // Check if there is already a window/tab open with the target URL
          for (let client of windowClients) {
            if (client.url === url && 'focus' in client) {
              return client.focus();
            }
          }
          // If no window/tab is already open, open a new one
          if (clients.openWindow) {
            return clients.openWindow(url);
          }
        })
    );
  }
});
