import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
const root=path.resolve(import.meta.dirname,'..');
const required=['index.html','style.css','vibrant.css','app.js','data.js','motion.js','github.js','config.js','sw.js','manifest.webmanifest','published-content.json','icon.svg','icon-192.png','icon-512.png'];
for(const name of required){const file=path.join(root,'dist',name);if(!fs.existsSync(file))throw new Error('Missing required asset: '+name);if(name.endsWith('.js')){const r=spawnSync(process.execPath,['--check',file],{stdio:'inherit'});if(r.status!==0)process.exit(r.status||1);}}
for(const name of ['manifest.webmanifest','published-content.json'])JSON.parse(fs.readFileSync(path.join(root,'dist',name),'utf8'));
const pkg=JSON.parse(fs.readFileSync(path.join(root,'package.json'),'utf8'));
console.log(`Build verified: ${pkg.name} ${pkg.version}. Deploy the dist directory. No bundler or runtime dependencies.`);
