import assert from 'node:assert/strict';
import {extractPublicContent} from '../scripts/publish-content.mjs';
const x=extractPublicContent({format:'yash-journal-text-v1',records:{logs:[{id:'x',title:'SECRET draft',project:'private-new-project',secret:'secret',published:{title:'Approved title',project:'micromouse',objective:'Approved objective',at:'2026-10-13T00:00:00Z',extra:'private'}}],notes:[{id:'n',title:'Private note',markdown:'Private',published:null}],goals:[{title:'Private goal'}],files:[{name:'marksheet.pdf',published:true}],announcements:[{id:'a',body:'private revised announcement',published:{title:'Approved announcement',body:'Approved public body',at:'2026-10-13T00:00:00Z'}}]}});
const text=JSON.stringify(x);
for(const secret of ['SECRET','secret','private-new-project','Private note','Private goal','marksheet','private revised','extra'])assert.ok(!text.includes(secret),secret+' must not leak');
assert.equal(x.logs[0].project,'micromouse');assert.equal(x.logs[0].published.title,'Approved title');assert.equal(x.notes.length,0);assert.equal(x.announcements[0].published.body,'Approved public body');
assert.throws(()=>extractPublicContent({format:'wrong'}));
console.log('Passed: static publication exports only explicitly approved snapshots and excludes private fields.');
