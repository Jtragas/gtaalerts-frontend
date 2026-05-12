// Firebase Cloud Messaging Service Worker
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

// Initialize Firebase in the service worker
firebase.initializeApp({
  apiKey: "AIzaSyBCu9Ko3LtHkKALYenQQdb4F_RB-T3xOyw",
  authDomain: "gta-alerts.firebaseapp.com",
  projectId: "gta-alerts",
  storageBucket: "gta-alerts.firebasestorage.app",
  messagingSenderId: "809439099134",
  appId: "1:809439099134:web:23e3ee7d4fa9a383c1cdaf"
});

const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('Received background message:', payload);

  const notificationTitle = payload.notification?.title || 'GTA Alerts';
  const notificationOptions = {
    body: payload.notification?.body || 'New alert',
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    tag: 'gta-alert',
    requireInteraction: true,
    data: {
      url: payload.data?.url || 'https://gtaalerts.com'
    }
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  const urlToOpen = event.notification.data?.url || 'https://gtaalerts.com';
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Check if there's already a window open
      for (let client of clientList) {
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }
      // Open new window if none exists
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});
