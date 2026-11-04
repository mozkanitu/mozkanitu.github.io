/* Typesets the math of a quiz fragment before it is encrypted, with the
   site's own KaTeX, so the quiz page needs only assets/katex/katex.min.css:
     node _tools/quiz-katex.js /outside/quizN-src.html /outside/quizN.html
   $...$ is inline math, \[...\] display math. Macros: \R, \C, \Z, \tr, \diag.
   Both files must stay outside the repository (or in the gitignored _private/
   folder): they hold the quiz in plain text. See CLAUDE.md, "Quizzes". */
'use strict';
const fs=require('fs'),path=require('path');
const [src,dest]=process.argv.slice(2);
if(!src||!dest){console.error('usage: node _tools/quiz-katex.js SOURCE_FILE OUTPUT_FILE');process.exit(1);}
const repo=path.resolve(__dirname,'..');
for(const f of [src,dest]){
  const p=path.resolve(f);
  if(p.startsWith(repo+path.sep)&&!p.startsWith(path.join(repo,'_private')+path.sep)){
    console.error('Refusing: keep the plaintext outside the repository (or in the gitignored _private/ folder).');process.exit(1);}
}
const katex=require(path.join(repo,'assets','katex','katex.min.js'));
const macros={'\\R':'\\mathbb{R}','\\C':'\\mathbb{C}','\\Z':'\\mathbb{Z}','\\tr':'\\operatorname{tr}','\\diag':'\\operatorname{diag}'};
const tex=(t,display)=>katex.renderToString(t,{displayMode:display,macros:Object.assign({},macros),throwOnError:true});
let h=fs.readFileSync(src,'utf8');
h=h.replace(/\\\[([\s\S]+?)\\\]/g,(_,t)=>tex(t.trim(),true));
h=h.replace(/\$([^$]+?)\$/g,(_,t)=>tex(t,false));
fs.writeFileSync(dest,h);
console.log('wrote '+dest);
