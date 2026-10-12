/* Publishes a quiz passphrase as teaching/group-theory/quizzes/<id>.key.
   Called by .github/workflows/quiz-release.yml.
   - workflow_dispatch: releases the quiz named in the input right away.
   - schedule: finds the next unreleased quiz in .github/quizzes.json whose
     release time is at most WINDOW_MIN minutes away, sleeps until the release
     time minus lead_seconds (the measured Pages deploy time), then publishes.
   The passphrase comes from the quiz's GitHub Actions secret and is checked
   against the encrypted file before anything is committed. */
'use strict';
const fs=require('fs'),path=require('path'),cp=require('child_process');
const cfg=JSON.parse(fs.readFileSync('.github/quizzes.json','utf8'));
const LEAD=(cfg.lead_seconds||150)*1000,WINDOW_MIN=80,LATE_MAX_H=6;
const event=process.env.EVENT,input=(process.env.QUIZ||'').trim();
const keyPath=id=>path.join('teaching','group-theory','quizzes',id+'.key');
const sh=(c,o)=>cp.execSync(c,Object.assign({stdio:'inherit'},o||{}));
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const norm=s=>s.trim().toLowerCase().replace(/[\s\-_.,]+/g,' ');

function pick(){
  if(event==='workflow_dispatch'){
    const q=cfg.quizzes.find(x=>x.id===input);
    if(!q){console.error('No quiz "'+input+'" in .github/quizzes.json');process.exit(1);}
    return {q,at:Date.now()};
  }
  const now=Date.now();
  const due=cfg.quizzes.filter(q=>!q.test&&!fs.existsSync(keyPath(q.id))).map(q=>({q,t:Date.parse(q.release)}))
    .filter(x=>x.t-now<=WINDOW_MIN*60000&&now-x.t<LATE_MAX_H*3600000).sort((a,b)=>a.t-b.t);
  if(!due.length){console.log('Nothing to release in the next '+WINDOW_MIN+' minutes.');process.exit(0);}
  return {q:due[0].q,at:due[0].t-LEAD};
}

(async()=>{
  const {q,at}=pick();
  let pass=process.env[q.secret]||'';
  if(!pass&&q.test&&process.env.TEST_PASSPHRASE) pass=process.env.TEST_PASSPHRASE;   // only for quizzes marked "test"
  if(!pass){console.error('The secret '+q.secret+' is not set. Add it under Settings > Secrets and variables > Actions.');process.exit(1);}
  try{cp.execFileSync('node',['_tools/quiz-check.js',q.id,pass],{stdio:'inherit'});}
  catch(e){console.error('Not releasing: the secret does not open '+q.id+'.enc.json');process.exit(1);}
  const wait=at-Date.now();
  if(wait>0){console.log('Releasing '+q.id+' at '+new Date(at).toISOString()+' (in '+Math.round(wait/1000)+' s)');await sleep(wait);}
  sh('git pull -q --rebase origin '+process.env.BRANCH);
  if(fs.existsSync(keyPath(q.id))){console.log(q.id+' is already released.');return;}
  fs.writeFileSync(keyPath(q.id),norm(pass)+'\n');
  sh('git config user.name "github-actions[bot]" && git config user.email "41898282+github-actions[bot]@users.noreply.github.com"');
  sh('git add '+keyPath(q.id)+' && git commit -q -m "Release '+q.id+'"');
  for(let i=0;i<4;i++){try{sh('git push -q origin HEAD:'+process.env.BRANCH);break;}catch(e){if(i===3)throw e;sh('git pull -q --rebase origin '+process.env.BRANCH);}}
  console.log('Released '+q.id+' at '+new Date().toISOString());
  // Ask Pages to build now, in case a push by the workflow token does not start one.
  try{sh('curl -fsS -X POST -H "Authorization: Bearer $GH_TOKEN" -H "Accept: application/vnd.github+json" https://api.github.com/repos/'+process.env.REPO+'/pages/builds >/dev/null');}catch(e){console.log('(Pages build request not accepted; the push itself starts a build.)');}
})().catch(e=>{console.error(e);process.exit(1);});
