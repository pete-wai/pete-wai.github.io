export function successfulPublication(deployment,statuses){
  const success=statuses.filter(s=>s.state==='success').sort((a,b)=>b.created_at.localeCompare(a.created_at))[0];
  return success?{deploymentId:deployment.id,deployedRevision:deployment.sha,publishedAt:success.created_at}:null;
}
