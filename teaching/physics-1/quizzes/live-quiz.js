/* Live quiz for Physics I. The questions, answers and records live in a
   Google Apps Script web app in the instructor's Google account (endpoint in
   data-endpoint); this page holds no questions. Students enter their student
   number, get 10 minutes from their own Start, answer the parts in order and
   see after each part whether they were right, the correct answer and the
   solution. See CLAUDE.md, "Physics I live quizzes". */
(function(){
  var box=document.getElementById('lq'),EP=box.getAttribute('data-endpoint'),KEY='lq-'+box.getAttribute('data-id');
  var opens=Date.parse(box.getAttribute('data-opens')),at=box.getAttribute('data-opens-label');
  var closes=Date.parse(box.getAttribute('data-closes')||''),closeAt=box.getAttribute('data-closes-label'),name=box.getAttribute('data-name')||'The quiz';
  var $=function(id){return document.getElementById(id);};
  var pre=$('lq-pre'),cd=$('lq-count'),form=$('lq-form'),sidIn=$('lq-sid'),msg=$('lq-msg'),conf=$('lq-confirm'),quiz=$('lq-quiz');
  var offset=0,state=null,tick=null,busy=false;
  function now(){return Date.now()+offset;}
  function two(n){return (n<10?'0':'')+n;}
  function mmss(ms){var s=Math.max(0,Math.ceil(ms/1000));return Math.floor(s/60)+':'+two(s%60);}
  function wait(ms){return new Promise(function(r){setTimeout(r,ms);});}
  function setMsg(t,bad){msg.textContent=t||'';msg.className='lq-msg'+(bad?' bad':'');}
  function call(body,tries){
    tries=tries||0;
    return fetch(EP,{method:'POST',body:JSON.stringify(body)}).then(function(r){return r.json();})
      .then(function(res){
        if(res&&res.code==='busy'&&tries<5) return wait(1500*(tries+1)).then(function(){return call(body,tries+1);});
        if(res&&res.now) offset=res.now-Date.now();
        return res;
      },function(){
        if(tries<5) return wait(1200*(tries+1)).then(function(){return call(body,tries+1);});
        return {ok:false,code:'net',message:'No connection to the quiz server. Check your internet connection and try again.'};
      });
  }
  /* ---------- before the start ---------- */
  function countdown(){
    if(state) return;
    var left=opens-now(),head=$('lq-opens');
    if(left>0){if(head)head.textContent=name+' opens at '+at;cd.textContent='Opens in '+mmss(left);return;}
    if(closes&&now()>=closes){if(head)head.textContent=name+' has closed';cd.textContent='It could be started until '+closeAt+'.';form.closest('.lq-box').hidden=true;return;}
    if(head)head.textContent=name+' is open';
    cd.textContent='Enter your student number to start'+(closes?' (until '+closeAt+')':'')+'.';
  }
  form.addEventListener('submit',function(e){
    e.preventDefault();
    var sid=sidIn.value.replace(/\s+/g,'');
    if(!/^\d{6,12}$/.test(sid)){setMsg('Please enter your student number, digits only.',true);return;}
    $('lq-confirm-sid').textContent=sid;conf.hidden=false;form.hidden=true;setMsg('');
  });
  $('lq-change').addEventListener('click',function(){conf.hidden=true;form.hidden=false;sidIn.focus();});
  $('lq-go').addEventListener('click',function(){
    var sid=$('lq-confirm-sid').textContent,b=this;b.disabled=true;setMsg('Starting…');
    call({action:'start',sid:sid}).then(function(res){
      b.disabled=false;
      if(!res.ok){conf.hidden=true;form.hidden=false;setMsg(res.message||'Could not start.',true);return;}
      try{localStorage.setItem(KEY,sid);}catch(x){}
      show(res);
    });
  });
  /* ---------- the quiz ---------- */
  function show(res){
    state=res;pre.hidden=true;quiz.hidden=false;
    $('lq-who').textContent='Student number '+res.sid+(res.test?' (test)':'');
    $('lq-intro').innerHTML=res.intro;
    render();
    if(!tick) tick=setInterval(timer,500);
    timer();
  }
  function timer(){
    if(!state) return;
    var t=$('lq-time');
    if(state.done){t.textContent='Finished';return;}
    var left=state.deadline-now();
    t.textContent='Time left '+mmss(left);
    t.className='lq-time'+(left<60000?' low':'');
    if(left<=0&&!busy){busy=true;call({action:'status',sid:state.sid}).then(function(res){busy=false;if(res.ok){state=res;render();}});}
  }
  function render(){
    var s=state,answered=0,h='';
    s.parts.forEach(function(p){if(p.chosen!==undefined)answered++;});
    $('lq-score').textContent='Score '+s.score+' / '+s.max;
    s.parts.forEach(function(p,i){
      var done=p.chosen!==undefined,current=!done&&i===answered&&!s.done;
      if(!done&&!current) return;
      h+='<section class="lq-part'+(current?' current':'')+'"><h2><span class="lq-label">('+'abcde'[i]+')</span> '+p.q+' <span class="pts">'+p.points+' points</span></h2><div class="lq-choices">';
      p.choices.forEach(function(c,k){
        var cls='lq-choice';
        if(done){if(k===p.answer)cls+=' right';else if(k===p.chosen)cls+=' wrong';if(k===p.chosen)cls+=' chosen';}
        h+='<button type="button" class="'+cls+'" data-part="'+i+'" data-choice="'+k+'"'+(done||s.done?' disabled':'')+'>'+c+'</button>';
      });
      h+='</div>';
      if(done){
        h+='<p class="lq-verdict '+(p.correct?'good':'bad')+'">'+(p.correct?'Correct: +'+p.points+' points.':'Not correct: 0 points.')+'</p>'+
           '<p class="lq-answer">The correct answer is <strong>'+p.choices[p.answer]+'</strong>.</p>'+
           '<div class="lq-sol"><p class="lq-sol-h">Solution</p><p>'+p.solution+'</p></div>';
      }
      h+='</section>';
    });
    if(s.done){
      var all=answered===s.parts.length;
      h+='<section class="lq-end"><p class="lq-final">'+(all?'Finished.':'Time is up.')+' Your score: <strong>'+s.score+' / '+s.max+'</strong></p><p>Your answers have been recorded'+(s.test?' (test number: this run is not counted)':'')+'.</p></section>';
    }
    $('lq-parts').innerHTML=h;
    timer();
  }
  $('lq-parts').addEventListener('click',function(e){
    var b=e.target.closest('.lq-choice');if(!b||b.disabled||busy||!state)return;
    var card=b.closest('.lq-part');[].forEach.call(card.querySelectorAll('.lq-choice'),function(x){x.disabled=true;});
    b.classList.add('chosen');busy=true;
    var note=document.createElement('p');note.className='lq-verdict';note.textContent='Checking…';card.appendChild(note);
    call({action:'answer',sid:state.sid,part:+b.getAttribute('data-part'),choice:+b.getAttribute('data-choice')}).then(function(res){
      busy=false;
      if(res.ok){state=res;render();var c=document.querySelectorAll('.lq-part');var last=c[c.length-1];if(last&&last.previousElementSibling)last.previousElementSibling.querySelector('.lq-verdict').scrollIntoView({block:'start',behavior:'smooth'});}
      else{note.textContent=(res.message||'Could not send your answer.')+' Tap your answer again.';note.className='lq-verdict bad';[].forEach.call(card.querySelectorAll('.lq-choice'),function(x){x.disabled=false;x.classList.remove('chosen');});}
    });
  });
  /* ---------- start up ---------- */
  if(!EP){cd.textContent='This quiz is not ready yet.';form.hidden=true;return;}
  fetch(EP).then(function(r){return r.json();}).then(function(r){if(r&&r.now)offset=r.now-Date.now();}).catch(function(){});
  var saved=null;try{saved=localStorage.getItem(KEY);}catch(x){}
  if(saved){sidIn.value=saved;call({action:'status',sid:saved}).then(function(res){if(res.ok)show(res);});}
  countdown();setInterval(countdown,1000);
})();
