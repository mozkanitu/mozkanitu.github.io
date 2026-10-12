/* Checks that a passphrase opens a quiz: node _tools/quiz-check.js quiz1 "passphrase"
   Exit code 0 if it decrypts. Used by the release workflow before it publishes a key. */
'use strict';
const crypto=require('crypto'),fs=require('fs'),path=require('path');
const [id,pass]=process.argv.slice(2);
const d=JSON.parse(fs.readFileSync(path.join(__dirname,'..','teaching','group-theory','quizzes',id+'.enc.json'),'utf8'));
const norm=s=>s.trim().toLowerCase().replace(/[\s\-_.,]+/g,' ');
try{
  const key=crypto.pbkdf2Sync(norm(pass||''),Buffer.from(d.salt,'base64'),d.iter,32,'sha256');
  const ct=Buffer.from(d.ct,'base64'),tag=ct.subarray(ct.length-16),body=ct.subarray(0,ct.length-16);
  const dc=crypto.createDecipheriv('aes-256-gcm',key,Buffer.from(d.iv,'base64'));dc.setAuthTag(tag);
  Buffer.concat([dc.update(body),dc.final()]);
  console.log(id+': passphrase opens the quiz');
}catch(e){console.error(id+': this passphrase does NOT open the quiz');process.exit(1);}
