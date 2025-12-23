self.addEventListener('push', function(event) {
  let payload = event.data?.json();
  event.waitUntil(
    self.registration.showNotification(payload?.title, {
      body: payload?.body,
      icon: payload?.icon,
      badge: payload?.icon,
      timestamp: payload?.time,
    })
  );
});
