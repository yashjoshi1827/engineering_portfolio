import {build} from 'esbuild';
import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
const root=path.resolve(import.meta.dirname,'..');
const url=process.env.PUBLIC_SUPABASE_URL||'';
const key=process.env.PUBLIC_SUPABASE_KEY||'';
if(Boolean(url)!==Boolean(key))throw new Error('Set both PUBLIC_SUPABASE_URL and PUBLIC_SUPABASE_KEY.');
if(url&&!/^https:\/\/[a-z0-9-]+\.supabase\.co$/.test(url))throw new Error('Use your Supabase project URL without a trailing slash.');
if(key){let safe=key.startsWith('sb_publishable_');try{safe ||= JSON.parse(Buffer.from(key.split('.')[1],'base64url').toString()).role==='anon';}catch{}if(!safe)throw new Error('Only a publishable or legacy anon key may be used. Never use a secret/service_role key.');}
fs.writeFileSync(path.join(root,'dist/cloud-config.js'),'export const cloudConfig = '+JSON.stringify({url,key})+';\n');
await build({stdin:{contents:"export {createClient} from '@supabase/supabase-js';",resolveDir:root,sourcefile:'vendor-entry.js'},bundle:true,format:'esm',platform:'browser',target:['es2022'],outfile:path.join(root,'dist/vendor/supabase.js'),minify:true,legalComments:'eof'});
const required=['index.html','style.css','vibrant.css','app.js','data.js','motion.js','github.js','config.js','cloud-config.js','cloud.js','sync-core.js','vendor/supabase.js','sw.js','manifest.webmanifest','published-content.json','icon.svg','icon-192.png','icon-512.png'];
for(const name of required){const file=path.join(root,'dist',name);if(!fs.existsSync(file))throw new Error('Missing required asset: '+name);if(name.endsWith('.js')){const r=spawnSync(process.execPath,['--check',file],{stdio:'inherit'});if(r.status!==0)process.exit(r.status||1);}}
for(const name of ['manifest.webmanifest','published-content.json'])JSON.parse(fs.readFileSync(path.join(root,'dist',name),'utf8'));
const pkg=JSON.parse(fs.readFileSync(path.join(root,'package.json'),'utf8'));
console.log(`Build verified: ${pkg.name} ${pkg.version}. Deploy the dist directory. Supabase client bundled locally.`);
