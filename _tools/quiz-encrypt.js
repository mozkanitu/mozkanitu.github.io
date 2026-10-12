/* Encrypts a quiz for the course site. The plaintext never enters the repo.
     node _tools/quiz-encrypt.js /path/outside/repo/quiz1.html quiz1 "four random lower words"
   writes teaching/group-theory/quizzes/quiz1.enc.json (AES-256-GCM, key from
   PBKDF2-SHA256 with 600,000 iterations and a random salt; the browser's
   WebCrypto decrypts it in teaching/group-theory/quizzes/quiz.js). */
'use strict';
const crypto=require('crypto'),fs=require('fs'),path=require('path');
const [src,id,pass]=process.argv.slice(2);
if(!src||!id||!pass){console.error('usage: node _tools/quiz-encrypt.js PLAINTEXT_FILE QUIZ_ID "PASSPHRASE"');process.exit(1);}
const repo=path.resolve(__dirname,'..');
if(path.resolve(src).startsWith(repo+path.sep)&&!path.resolve(src).startsWith(path.join(repo,'_private')+path.sep)){
  console.error('Refusing: keep the plaintext outside the repository (or in the gitignored _private/ folder).');process.exit(1);}
const norm=s=>s.trim().toLowerCase().replace(/[\s\-_.,]+/g,' ');
const ITER=600000,salt=crypto.randomBytes(16),iv=crypto.randomBytes(12);
const key=crypto.pbkdf2Sync(norm(pass),salt,ITER,32,'sha256');
const c=crypto.createCipheriv('aes-256-gcm',key,iv);
const ct=Buffer.concat([c.update(fs.readFileSync(src)),c.final(),c.getAuthTag()]);
const out={v:1,id:id,kdf:'PBKDF2-SHA256',iter:ITER,cipher:'AES-256-GCM',salt:salt.toString('base64'),iv:iv.toString('base64'),ct:ct.toString('base64')};
const dest=path.join(repo,'teaching','group-theory','quizzes',id+'.enc.json');
fs.writeFileSync(dest,JSON.stringify(out)+'\n');
console.log('wrote '+path.relative(repo,dest));
