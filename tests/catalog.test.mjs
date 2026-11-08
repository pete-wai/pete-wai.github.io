import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';import {validate,sorted,escape} from '../scripts/catalog.mjs';
import {successfulPublication} from '../scripts/deployments.mjs';
const projects=JSON.parse(readFileSync('data/catalog.json'));
test('publication ordering uses exact timestamps, then title, without mutating input',()=>{const values=[{title:'Z',publishedAt:'2026-01-01T00:00:00Z'},{title:'B',publishedAt:'2026-02-01T00:00:00Z'},{title:'A',publishedAt:'2026-02-01T00:00:00Z'}];assert.deepEqual(sorted(values).map(p=>p.title),['A','B','Z']);assert.equal(values[0].title,'Z');});
test('reject duplicate repository identities and stale screenshot revisions',()=>{const copy=structuredClone(projects);copy[1].repositoryId=copy[0].repositoryId;assert.throws(()=>validate(copy),/Duplicate/);const stale=structuredClone(projects);stale[0].screenshot.deployedRevision='0'.repeat(40);assert.throws(()=>validate(stale),/stale/);});
test('reject invalid dates and off-domain project URLs',()=>{for(const value of ['invalid','2999-01-01T00:00:00Z']){const copy=structuredClone(projects);copy[0].publishedAt=value;assert.throws(()=>validate(copy));}const copy=structuredClone(projects);copy[0].url='https://example.com/';assert.throws(()=>validate(copy));});
test('escape authored text rather than treating it as HTML',()=>assert.equal(escape('<a "x">&\''),'&lt;a &quot;x&quot;&gt;&amp;&#39;'));
test('failed and pending deployments cannot advance publication; later inactive statuses preserve real publication time',()=>{
 const d={id:1,sha:'a'.repeat(40)};
 assert.equal(successfulPublication(d,[{state:'failure',created_at:'2026-11-08T17:00:00Z'},{state:'pending',created_at:'2026-11-08T16:00:00Z'}]),null);
 assert.equal(successfulPublication(d,[{state:'inactive',created_at:'2026-11-08T18:00:00Z'},{state:'success',created_at:'2026-11-08T16:00:00Z'}]).publishedAt,'2026-11-08T16:00:00Z');
});
