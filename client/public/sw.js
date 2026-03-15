// public/sw.js

// This listens for the push event from your backend
self.addEventListener('push', function(event) {
  const data = event.data.json();
  
  const options = {
    body: data.body,
    icon: '/icon-192.png', // This will use your PWA logo!
    vibrate: [200, 100, 200]
  };

  // Tell the browser to pop up the notification
  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});