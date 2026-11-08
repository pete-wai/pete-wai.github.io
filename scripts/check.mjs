import assert from 'node:assert/strict';
import {readFile,stat} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import sharp from 'sharp';
import {createHash} from 'node:crypto';
import {validate,sorted,disclaimer} from './catalog.mjs';
const projects=JSON.parse(await readFile('data/catalog.json'));validate(projects);
const images=JSON.parse(await readFile('data/images.json'));const html=await readFile('index.html','utf8');
assert(html.includes(disclaimer));assert(!/<script\b/i.test(html),'Runtime scripts are prohibited');
assert.equal((html.match(/class="project"/g)||[]).length,projects.length);
assert.deepEqual([...html.matchAll(/data-project="([^"]+)"/g)].map(m=>m[1]),sorted(projects).map(p=>p.slug));
execFileSync(process.execPath,['scripts/build.mjs','--check'],{stdio:'inherit'});
for(const p of projects){for(const kind of ['cover','screen']){
 const source=await readFile(kind==='cover'?p.illustration:p.screenshot.path);
 const expectedHash=createHash('sha256').update(source).update('webp-q52-m6-v2').digest('hex').slice(0,12);
 for(const image of images[p.slug][kind]){assert(image.path.includes(`-${expectedHash}-`),'Optimized image is stale');const meta=await sharp(image.path).metadata();assert.equal(meta.width,image.width);assert.equal(meta.height,image.height);assert.equal((await stat(image.path)).size,image.bytes);assert.equal(meta.format,'webp');if(image.width<=800)assert(image.bytes<80000);}
}}
for(const match of html.matchAll(/(?:href|src)="(\/[^"#]*)"/g)){if(match[1]!=='/')await stat('.'+match[1]);}
// Conservative mobile transfer: HTML + favicon + first three lazy-load-nearby card pairs at 2x DPR.
const nearby=sorted(projects).slice(0,3).reduce((sum,p)=>sum+images[p.slug].cover.find(i=>i.width===800).bytes+images[p.slug].screen.find(i=>i.width===640).bytes,0);
const budget=Buffer.byteLength(html)+(await stat('assets/favicon.svg')).size+nearby;
assert(budget<250000,`Mobile estimated transfer ${budget} exceeds 250 KB`);
if(process.argv.includes('--discovery')){
 const discovered=JSON.parse(await readFile('output/discovery.json'));assert.deepEqual(discovered.issues,[]);
 assert.deepEqual(projects.map(p=>p.repositoryId).sort(),discovered.projects.map(p=>p.repositoryId).sort(),'Published-site coverage differs');
 for(const d of discovered.projects){const p=projects.find(p=>p.repositoryId===d.repositoryId);for(const field of ['url','repository','deployedRevision','publishedAt'])assert.equal(p[field],d[field],`${p.slug}: stale ${field}`);}
}
if(process.argv.includes('--live'))for(const p of projects){const r=await fetch(p.url);assert(r.ok,`${p.url}: ${r.status}`);}
console.log(`PASS: ${projects.length} projects, order, assets, generated HTML; conservative mobile estimate ${(budget/1000).toFixed(1)} KB.`);
