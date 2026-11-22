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

// v33.4：联网优先，装了新文件就取新的；断网时退回缓存
self.addEventListener('fetch', function (event) {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    fetch(event.request).then(function (res) {
      try {
        var copy = res.clone();
        caches.open('vislta-v33').then(function (c) { c.put(event.request, copy); });
      } catch (e) {}
      return res;
    }).catch(function () {
      return caches.match(event.request).then(function (m) {
        return m || caches.match('./');
      });
    })
  );
});
// network-first
