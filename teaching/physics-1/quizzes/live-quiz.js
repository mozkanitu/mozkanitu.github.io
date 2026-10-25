/* Live quiz for Physics I. The questions, answers and records live in a
   Google Apps Script web app in the instructor's Google account (endpoint in
   data-endpoint); this page holds no questions. Students enter their student
   number, get 10 minutes from their own Start and answer the parts in order:
   tapping a choice only selects it; Submit and then "Yes, submit" send it, and
   only then does the page show whether it was right, the correct answer and
   the solution. A choice selected but not submitted at 0:00 does not count. The page sends one request at a time and keeps trying a busy or
   unreachable server for up to 2 minutes (Google runs at most 30 requests of
   the script at once). Countdown and timer follow the server's clock, not the
   device's. See CLAUDE.md, "Physics I live quizzes". */
(function(){
  var box=document.getElementById('lq'),EP=box.getAttribute('data-endpoint'),KEY='lq-'+box.getAttribute('data-id');
  var opens=Date.parse(box.getAttribute('data-opens')),at=box.getAttribute('data-opens-label');
  var closes=Date.parse(box.getAttribute('data-closes')||''),closeAt=box.getAttribute('data-closes-label'),name=box.getAttribute('data-name')||'The quiz';
  var $=function(id){return document.getElementById(id);};
  var pre=$('lq-pre'),cd=$('lq-count'),form=$('lq-form'),sidIn=$('lq-sid'),msg=$('lq-msg'),conf=$('lq-confirm'),quiz=$('lq-quiz');
  var offset=0,rtt=Infinity,state=null,tick=null,inflight=false,starting=false,ended=false,unsent=false,picked=null;   // picked: {part, choice} selected, not yet submitted
  var TRY_FOR=120000,START_GRACE=120000;   // START_GRACE: the server still takes a Start this long after data-closes
  function now(){return Date.now()+offset;}
  function two(n){return (n<10?'0':'')+n;}
  function mmss(ms){var s=Math.max(0,Math.ceil(ms/1000));return Math.floor(s/60)+':'+two(s%60);}
  function wait(ms){return new Promise(function(r){setTimeout(r,ms);});}
  function setMsg(t,bad){msg.textContent=t||'';msg.className='lq-msg'+(bad?' bad':'');}
  // The server's clock, from the quickest round trip so far.
  function clock(t0,t1,res){if(res&&res.now&&t1-t0<rtt){rtt=t1-t0;offset=res.now-(t0+t1)/2;}}
  /* One request. Resolves with the server's reply, or with null when another
     try is worth it: no connection, no reply within 30 s, a reply that is not
     JSON (Google's error pages are HTML), or the server saying it is busy. */
  function post(body){
    var t0=Date.now(),ctl=window.AbortController?new AbortController():null,tm=null,opt={method:'POST',body:JSON.stringify(body)};
    if(ctl){opt.signal=ctl.signal;tm=setTimeout(function(){ctl.abort();},30000);}
    return fetch(EP,opt).then(function(r){return r.text();}).then(function(t){
      var res=JSON.parse(t);clock(t0,Date.now(),res);
      return res&&res.code!=='busy'&&res.code!=='error'?res:null;
    }).catch(function(){return null;}).then(function(res){clearTimeout(tm);return res;});
  }
  /* Sends body, and while the server is busy or out of reach tries again with
     exponential backoff and full random jitter (a random wait of up to 1, 2, 4,
     8, then 10 s) for up to 2 minutes, calling note() every second meanwhile.
     One request at a time: returns null, sending nothing, while one is under way. */
  function call(body,note){
    if(inflight) return null;
    inflight=true;
    var t0=Date.now(),k=0,iv=null;
    function say(){if(note)note('The server is busy, still trying… '+Math.ceil((Date.now()-t0)/1000)+' s');}
    function attempt(){
      return post(body).then(function(res){
        var spent=Date.now()-t0;
        if(res) return res;
        if(spent>=TRY_FOR) return {ok:false,code:'net',message:'The quiz server did not answer for 2 minutes (busy, or no internet connection). Please try again.'};
        if(!iv){say();iv=setInterval(say,1000);}
        return wait(Math.min(TRY_FOR-spent,Math.random()*Math.min(10000,1000*Math.pow(2,k++)))).then(attempt);
      });
    }
    return attempt().then(function(res){inflight=false;clearInterval(iv);return res;});
  }
  // One quick request for the server's clock when the page opens (no retries).
  function getClock(){var t0=Date.now();fetch(EP).then(function(r){return r.json();}).then(function(r){clock(t0,Date.now(),r);countdown();}).catch(function(){});}
  /* ---------- before the start ---------- */
  function countdown(){
    if(state) return;
    var left=opens-now(),head=$('lq-opens');
    if(left>0){if(head)head.textContent=name+' opens at '+at;cd.textContent='Opens in '+mmss(left);return;}
    // Closed: only once the server's clock is known (a device clock can be hours
    // off) and the server no longer takes a Start; it answers a late Start itself.
    if(closes&&rtt<Infinity&&now()>=closes+START_GRACE&&!starting){if(head)head.textContent=name+' has closed';cd.textContent='It could be started until '+closeAt+'.';form.closest('.lq-box').hidden=true;return;}
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
    var sid=$('lq-confirm-sid').textContent,b=this,ch=$('lq-change');
    var p=call({action:'start',sid:sid},function(t){setMsg(t);});
    if(!p) return;                                   // already trying: a second click does nothing
    b.disabled=ch.disabled=starting=true;setMsg('Starting…');
    p.then(function(res){
      b.disabled=ch.disabled=starting=false;
      if(!res.ok){conf.hidden=true;form.hidden=false;setMsg(res.message||'Could not start.',true);countdown();return;}
      try{localStorage.setItem(KEY,sid);}catch(x){}
      show(res);
    });
  });
  /* ---------- the quiz ---------- */
  function answered(s){var k=0;s.parts.forEach(function(p){if(p.chosen!==undefined)k++;});return k;}
  function total(s){return s.n||s.parts.length;}
  function timeUp(s){return s.done||s.deadline-now()<=0;}
  function show(res){
    state=res;pre.hidden=true;quiz.hidden=false;
    $('lq-who').textContent='Student number '+res.sid+(res.test?' (test)':'');
    $('lq-intro').innerHTML=res.intro;
    if(!$('lq-other')){                              // a shared device: let the next student start
      var o=document.createElement('p');o.className='lq-note';o.id='lq-other';
      o.innerHTML='Not student <span></span>? <button type="button" class="lq-link">Use another student number</button>';
      o.querySelector('button').addEventListener('click',function(){try{localStorage.removeItem(KEY);}catch(x){}location.reload();});
      quiz.appendChild(o);
    }
    $('lq-other').querySelector('span').textContent=res.sid;
    render();
    if(!tick) tick=setInterval(timer,500);
  }
  // Every 500 ms. At 0:00 the page stops taking answers and shows the result it
  // has; an answer still on its way is waited for (the server takes answers
  // tapped before the end for a while longer).
  function timer(){
    if(!state) return;
    var s=state,t=$('lq-time'),left=s.deadline-now();
    if(answered(s)===total(s)){t.textContent='Finished';t.className='lq-time';return;}
    if(timeUp(s)){t.textContent='Time is up';t.className='lq-time low';if(!ended&&!inflight)render();return;}
    t.textContent='Time left '+mmss(left);
    t.className='lq-time'+(left<60000?' low':'');
    var w=document.querySelector('.lq-part.current .lq-warn');   // last minute: a choice is selected but not submitted
    if(w) w.hidden=!(left<60000&&picked&&!inflight);
  }
  function render(){
    var s=state,k=answered(s),n=total(s),over=k===n||timeUp(s),h='';
    $('lq-score').textContent='Score '+s.score+' / '+s.max;
    s.parts.forEach(function(p,i){
      var done=p.chosen!==undefined,current=!done&&i===k&&!over;
      if(!done&&!current) return;
      var pk=current&&picked&&picked.part===i?picked.choice:-1;
      h+='<section class="lq-part'+(current?' current':'')+'" data-part="'+i+'"><h2><span class="lq-label">('+'abcdefghij'[i]+')</span> '+p.q+' <span class="pts">'+p.points+' points</span></h2><div class="lq-choices">';
      p.choices.forEach(function(c,j){
        var cls='lq-choice';
        if(done){if(j===p.answer)cls+=' right';else if(j===p.chosen)cls+=' wrong';if(j===p.chosen)cls+=' chosen';}
        if(j===pk)cls+=' picked';
        h+='<button type="button" class="'+cls+'" data-choice="'+j+'"'+(current?' aria-pressed="'+(j===pk)+'"':'')+(done||over?' disabled':'')+'>'+c+'</button>';
      });
      h+='</div>';
      if(current){
        h+='<div class="lq-act"><button type="button" class="lq-btn lq-submit"'+(pk<0?' disabled':'')+'>Submit answer</button>'+
           '<span class="lq-hint">'+(pk<0?'Tap a choice, then submit it.':'You can change your choice until you submit it.')+'</span></div>'+
           '<div class="lq-ask" hidden></div><p class="lq-warn" hidden>You have a selected answer that is not submitted.</p>';
      }
      if(done){
        h+='<p class="lq-verdict '+(p.correct?'good':'bad')+'">'+(p.correct?'Correct: +'+p.points+' points.':'Not correct: 0 points.')+'</p>'+
           '<p class="lq-answer">The correct answer is <strong>'+p.choices[p.answer]+'</strong>.</p>'+
           '<div class="lq-sol"><p class="lq-sol-h">Solution</p><p>'+p.solution+'</p></div>';
      }
      h+='</section>';
    });
    ended=over;
    if(over){
      h+='<section class="lq-end"><p class="lq-final">'+(k===n?'Finished.':'Time is up.')+' Your score: <strong>'+s.score+' / '+s.max+'</strong></p>'+
         (unsent&&k<n?'<p class="lq-msg bad">Your last answer could not be sent, so it does not count.</p>':'')+
         (!unsent&&picked&&picked.part===k&&k<n?'<p class="lq-msg bad">Your selected answer to ('+'abcdefghij'[k]+') was not submitted, so it does not count.</p>':'')+
         '<p>Your answers have been recorded'+(s.test?' (test number: this run is not counted)':'')+'.</p></section>';
    }
    $('lq-parts').innerHTML=h;
    timer();
  }
  /* Answering a part: a tap only selects a choice (it can be changed); Submit
     asks "Submit … as your answer?"; only "Yes, submit" sends it. */
  function els(card){return {choices:card.querySelectorAll('.lq-choice'),act:card.querySelector('.lq-act'),sub:card.querySelector('.lq-submit'),
    hint:card.querySelector('.lq-hint'),ask:card.querySelector('.lq-ask'),warn:card.querySelector('.lq-warn')};}
  function pick(card,j){
    var e=els(card);picked={part:+card.getAttribute('data-part'),choice:j};
    [].forEach.call(e.choices,function(x){var on=+x.getAttribute('data-choice')===j;x.classList.toggle('picked',on);x.setAttribute('aria-pressed',on);});
    e.sub.disabled=false;e.hint.textContent='You can change your choice until you submit it.';
    back(card);timer();
  }
  function back(card){var e=els(card);e.ask.hidden=true;e.ask.innerHTML='';e.act.hidden=false;}
  function ask(card){
    var e=els(card),ch=card.querySelector('.lq-choice.picked');if(!ch)return;
    e.ask.innerHTML='<p>Submit <strong>'+ch.innerHTML+'</strong> as your answer to ('+'abcdefghij'[picked.part]+')? You cannot change it afterwards.</p>'+
      '<div class="lq-row"><button type="button" class="lq-btn lq-yes">Yes, submit</button><button type="button" class="lq-btn quiet lq-back">Go back</button></div><p class="lq-verdict lq-sending" hidden></p>';
    e.act.hidden=true;e.ask.hidden=false;e.ask.querySelector('.lq-yes').focus();
  }
  function send(card){
    var e=els(card),ch=card.querySelector('.lq-choice.picked'),yes=e.ask.querySelector('.lq-yes'),no=e.ask.querySelector('.lq-back'),note=e.ask.querySelector('.lq-sending');
    if(!ch)return;
    var p=call({action:'answer',sid:state.sid,part:picked.part,choice:picked.choice},function(t){note.textContent=t;});
    if(!p)return;                                    // one request at a time
    [].forEach.call(e.choices,function(x){x.disabled=true;});yes.disabled=no.disabled=true;e.warn.hidden=true;
    ch.classList.add('chosen');note.hidden=false;note.className='lq-verdict lq-sending';note.textContent='Checking…';
    p.then(function(res){
      if(res.ok){state=res;picked=null;unsent=false;render();var c=document.querySelectorAll('.lq-part');var last=c[c.length-1];if(last&&last.previousElementSibling)last.previousElementSibling.querySelector('.lq-verdict').scrollIntoView({block:'start',behavior:'smooth'});}
      else if(timeUp(state)){unsent=true;render();}
      else{note.textContent=(res.message||'Could not send your answer.')+' Press "Yes, submit" to try again.';note.className='lq-verdict lq-sending bad';
        [].forEach.call(e.choices,function(x){x.disabled=false;});ch.classList.remove('chosen');yes.disabled=no.disabled=false;}
    });
  }
  $('lq-parts').addEventListener('click',function(e){
    var t=e.target,card=t.closest('.lq-part.current');if(!card||!state||inflight)return;
    if(timeUp(state)){timer();return;}               // 0:00: no more answers
    var b=t.closest('.lq-choice');
    if(b){if(!b.disabled)pick(card,+b.getAttribute('data-choice'));return;}
    if(t.closest('.lq-submit')){if(picked&&picked.part===+card.getAttribute('data-part'))ask(card);return;}
    if(t.closest('.lq-back')){back(card);card.querySelector('.lq-submit').focus();return;}
    if(t.closest('.lq-yes'))send(card);
  });
  /* ---------- start up ---------- */
  if(!EP){cd.textContent='This quiz is not ready yet.';form.hidden=true;return;}
  var saved=null;try{saved=localStorage.getItem(KEY);}catch(x){}       // started on this device: resume
  if(saved){sidIn.value=saved;call({action:'status',sid:saved},function(t){setMsg(t);}).then(function(res){
    if(res.ok){setMsg('');show(res);}else setMsg(res.code==='nostart'?'':res.message,res.code!=='nostart');});}
  else setTimeout(getClock,Math.random()*3000);       // spread over 3 s: many pages open at once
  countdown();setInterval(countdown,1000);
})();
