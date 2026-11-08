import assert from 'node:assert/strict';
export const disclaimer='All sites in this collection are entirely AI-generated personal experiments, prototypes, or research projects. They are unofficial and do not represent any organization or government agency. Verify information against original sources.';
export const types=['Research','Prototype','Experiment'];
export function sorted(projects){return [...projects].sort((a,b)=>Date.parse(b.publishedAt)-Date.parse(a.publishedAt)||a.title.localeCompare(b.title,'en'));}
export function validate(projects){
 assert(projects.length>0,'Catalog is empty');
 for(const field of ['repositoryId','slug','url'])assert.equal(new Set(projects.map(p=>p[field])).size,projects.length,`Duplicate ${field}`);
 for(const p of projects){
  assert(Number.isSafeInteger(p.repositoryId));assert(/^[a-z0-9-]+$/.test(p.slug));
  assert.equal(new URL(p.url).origin,'https://pwai.dev');assert.notEqual(new URL(p.url).pathname,'/');
  assert.equal(p.repository,`pete-wai/${p.slug}`);assert(types.includes(p.type));
  for(const field of ['title','description'])assert(typeof p[field]==='string'&&p[field].trim().length>0);
  assert(Number.isFinite(Date.parse(p.publishedAt))&&Date.parse(p.publishedAt)<=Date.now());
  assert(/^[0-9a-f]{40}$/.test(p.deployedRevision));assert(Number.isSafeInteger(p.deploymentId));
  assert.equal(p.screenshot.deployedRevision,p.deployedRevision,'Screenshot is stale');
  assert.equal(p.screenshot.url,p.url);assert(Date.parse(p.screenshot.capturedAt)>=Date.parse(p.publishedAt));
  assert.equal(p.screenshot.width,1280);assert.equal(p.screenshot.height,800);
  assert.equal(p.screenshot.reviewed,true,'Screenshot needs visual review');
  assert.equal(p.screenshot.colorScheme,'light');assert.equal(p.screenshot.scrollY,0);
  assert.equal(p.screenshot.deviceScaleFactor,1);
  assert(Date.parse(p.screenshot.capturedAt)<=Date.now(),'Capture date is in the future');
  assert.equal(p.evidenceUrl,`https://api.github.com/repos/${p.repository}/deployments/${p.deploymentId}/statuses`);
  assert.equal(p.illustration,`sources/illustrations/${p.slug}.png`);
  assert.equal(p.screenshot.path,`sources/screenshots/${p.slug}.jpg`);
 }
}
export const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
