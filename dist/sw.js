const CACHE='yash-review-v2';
const ASSETS=['./','./index.html','./style.css','./app.js','./data.js','./motion.js','./github.js','./config.js','./vibrant.css','./published-content.json','./icon.svg','./icon-192.png','./icon-512.png','./manifest.webmanifest'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)));});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('yash-review-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',e=>{const u=new URL(e.request.url);if(e.request.method!=='GET'||u.origin!==self.location.origin||!ASSETS.some(p=>new URL(p,self.location).pathname===u.pathname))return;e.respondWith(fetch(e.request).then(r=>{if(r.ok&&r.type!=='opaqueredirect'){const copy=r.clone();caches.open(CACHE).then(c=>c.put(e.request,copy));}return r;}).catch(()=>caches.match(e.request)));});
