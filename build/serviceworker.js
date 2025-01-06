//  set up a cacheName variable here
const cacheName = "v1";

//  Set up a list of files to cache here.
const filesToCache = ["index.html", "offline.html"];

const self = this;

//  Add an install event listener here
self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(cacheName).then((cache) => {
      console.log("Opened Cache");
      return cache.addAll(filesToCache);
    })
  );
});

//  Add an activate event listener here
self.addEventListener("activate", (e) => {
    const cacheWhitelist = [];
    cacheWhitelist.push(cacheName);
  e.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((thisCacheName) => {
          if (!cacheWhitelist.includes(thisCacheName)) {
            return caches.delete(thisCacheName);
          }
          return null;
        })
      );
    })
  );
});

//  Add a fetch event listener here
self.addEventListener("fetch", (e) => {
  e.respondWith(
    caches.match(e.request).then(() => {
      return fetch(e.request);
    })
    .catch(() => caches.match("offline.html"))
  );
});
