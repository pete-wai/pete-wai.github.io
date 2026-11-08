import {execFileSync} from 'node:child_process';
import {mkdir,writeFile} from 'node:fs/promises';
import {successfulPublication} from './deployments.mjs';
const api=path=>JSON.parse(execFileSync('gh',['api',path],{encoding:'utf8',stdio:['ignore','pipe','pipe']}));
const paged=path=>{let out=[];for(let page=1;;page++){const rows=api(`${path}${path.includes('?')?'&':'?'}per_page=100&page=${page}`);out.push(...rows);if(rows.length<100)return out;}};
const projects=[],issues=[];
for(const repo of paged('users/pete-wai/repos')) {
 if(!repo.has_pages || repo.name==='pete-wai.github.io')continue;
 try {
  const pages=api(`repos/${repo.full_name}/pages`);
  if(new URL(pages.html_url).origin!=='https://pwai.dev') {issues.push(`${repo.full_name}: Pages uses another domain`);continue;}
  const deployments=paged(`repos/${repo.full_name}/deployments?environment=github-pages`);
  const candidates=[];
  for(const d of deployments){const statuses=paged(`repos/${repo.full_name}/deployments/${d.id}/statuses`);const success=successfulPublication(d,statuses);if(success)candidates.push({...success,evidenceUrl:`https://api.github.com/repos/${repo.full_name}/deployments/${d.id}/statuses`});}
  candidates.sort((a,b)=>b.publishedAt.localeCompare(a.publishedAt));
  if(!candidates.length)throw Error('No successful Pages deployment found');
  const response=await fetch(pages.html_url);if(!response.ok)throw Error(`Live site returned ${response.status}`);
  projects.push({repositoryId:repo.id,repository:repo.full_name,slug:repo.name,url:pages.html_url,...candidates[0]});
 }catch(e){issues.push(`${repo.full_name}: ${e.message}`);}
}
projects.sort((a,b)=>a.slug.localeCompare(b.slug));
await mkdir('output',{recursive:true});await writeFile('output/discovery.json',JSON.stringify({projects,issues},null,2)+'\n');
console.log(JSON.stringify({projects,issues},null,2));if(issues.length)process.exitCode=1;
