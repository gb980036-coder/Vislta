self.addEventListener('install', function () { self.skipWaiting(); });
self.addEventListener('activate', function (e) { e.waitUntil(self.clients.claim()); });

self.addEventListener('notificationclick', function (event) {
  event.notification.close();
  var data = event.notification.data || {};
  var target = data.url || (self.location.origin + '/');
  event.waitUntil(clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (list) {
    for (var i = 0; i < list.length; i++) {
      var c = list[i];
      if (c.url.split('#')[0] === target.split('#')[0] && 'focus' in c) {
        return c.focus().then(function () {
          try { c.postMessage({ type: 'notification-click', data: data }); } catch (e) {}
        });
      }
    }
    if (clients.openWindow) return clients.openWindow(target);
  }));
});
