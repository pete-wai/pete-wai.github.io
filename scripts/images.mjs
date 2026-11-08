import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import sharp from 'sharp';
import {validate} from './catalog.mjs';
const projects=JSON.parse(await readFile('data/catalog.json'));validate(projects);
const manifest={};const pending=[];
for(const p of projects){manifest[p.slug]={};for(const [kind,path,widths] of [['cover',p.illustration,[480,720,800,1200]],['screen',p.screenshot.path,[320,640]]]){
 const original=await readFile(path);const meta=await sharp(original).metadata();
 if(kind==='screen'&&(meta.width!==1280||meta.height!==800))throw Error(`Invalid screenshot size: ${path}`);
 const hash=createHash('sha256').update(original).update('webp-q52-m6-v2').digest('hex').slice(0,12);
 manifest[p.slug][kind]=[];
 for(const width of widths){const height=kind==='cover'?Math.round(width*2/3):Math.round(width*800/1280);const output=`assets/images/${p.slug}-${kind}-${hash}-${width}.webp`;
 const bytes=await sharp(original).resize(width,height,{fit:'cover',position:'centre'}).webp({quality:52,effort:6}).toBuffer();
 if(width<=800&&bytes.length>80000)throw Error(`${output} exceeds 80 KB: ${bytes.length}`);
 manifest[p.slug][kind].push({path:output,width,height,bytes:bytes.length});pending.push([output,bytes]);
 }}}
await mkdir('assets/images',{recursive:true});for(const [path,bytes] of pending)await writeFile(path,bytes);
await writeFile('data/images.json',JSON.stringify(manifest,null,2)+'\n');console.log(`Prepared ${pending.length} WebP assets`);
