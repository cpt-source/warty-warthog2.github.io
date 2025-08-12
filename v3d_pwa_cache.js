const CACHE_PREFIX = 'v3d-app-cache';
const CACHE_HASH = '0a29170ce9';
const CACHE_VERSION = 'v2';

const ASSETS = [
    /*'basis_transcoder.js',
    'basis_transcoder.wasm',
    'pvs14.bin',
    'pvs14.css',
    'pvs14.gltf',
    'pvs14.html',
    'pvs14.js',
    'v3d.js',
    'visual_logic.js',*/
];

const cacheName = () => {
    return `${CACHE_PREFIX}-${CACHE_HASH}-${CACHE_VERSION}`;
}

self.addEventListener('install', (event) => {
    event.waitUntil(caches.open(cacheName()).then(cache => {
        return cache.addAll(ASSETS);
    }));
});

const deleteCache = async (key) => {
    await caches.delete(key);
};

const deleteOldCaches = async () => {
    const cacheKeepList = [cacheName()];
    const keyList = await caches.keys();
    const cachesToDelete = keyList.filter((key) => {
        return (key.includes(CACHE_HASH) && !cacheKeepList.includes(key));
    });
    await Promise.all(cachesToDelete.map(deleteCache));
};

self.addEventListener('activate', (event) => {
    event.waitUntil(deleteOldCaches());
});

const handleCached = async (request) => {
    const responseFromCache = await caches.match(request);
    if (responseFromCache)
        return responseFromCache;
    return fetch(request);
};

self.addEventListener('fetch', (event) => {
    event.respondWith(handleCached(event.request));
});
