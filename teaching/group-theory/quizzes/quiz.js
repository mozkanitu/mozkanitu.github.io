/* Quiz pages for FZT 203E. The questions are encrypted (quizN.enc.json).
   At release time a workflow publishes the passphrase as quizN.key; this
   script polls for it every 15 s and decrypts in the browser. Students can
   also type the password written on the board. See CLAUDE.md.

   Timed quizzes (Quiz 2 on): data-minutes on #quiz turns on a Start step.
   Once the questions are decrypted the page shows a Start button until
   data-start-until; each student then has data-minutes from their own Start,
   never past data-closes. At 0:00 the questions leave the page and the text
   in data-timeup is shown. The start time and the password are kept in
   localStorage, so a reload resumes the same attempt instead of starting a
   new one. All times follow the server's clock (the Date header of the key
   requests), not the device's. This only shapes what the page shows: the key
   itself stays public after the release. */
(function(){
  var box=document.getElementById('quiz'),id=box.getAttribute('data-id'),opens=Date.parse(box.getAttribute('data-opens'));
  var name=box.getAttribute('data-name'),at=box.getAttribute('data-opens-label');
  var wait=document.getElementById('wait'),count=document.getElementById('count'),out=document.getElementById('questions');
  var form=document.getElementById('pw'),input=document.getElementById('pwin'),msg=document.getElementById('pwmsg'),btn=form.querySelector('button');
  var offset=0,data=null,done=false,keyText=null,busy=false;
  // Timed quizzes only (data-minutes set).
  var mins=parseFloat(box.getAttribute('data-minutes'))||0,timed=mins>0;
  var until=Date.parse(box.getAttribute('data-start-until')||''),untilAt=box.getAttribute('data-start-until-label');
  var closes=Date.parse(box.getAttribute('data-closes')||''),closeAt=box.getAttribute('data-closes-label');
  var clock=false,html=null,pass=null,att=null,view='',SAVE='gt-quiz:'+id;
  function now(){return Date.now()+offset;}
  function b64(s){var b=atob(s),u=new Uint8Array(b.length);for(var i=0;i<b.length;i++)u[i]=b.charCodeAt(i);return u;}
  function norm(p){return String(p).trim().toLowerCase().replace(/[\s\-_.,]+/g,' ');}
  function getData(){
    if(data) return Promise.resolve(data);
    return fetch(id+'.enc.json?t='+Date.now(),{cache:'no-store'}).then(function(r){if(!r.ok)throw new Error('load');return r.json();}).then(function(d){data=d;return d;});
  }
  function decrypt(pass){
    return getData().then(function(d){
      var enc=new TextEncoder();
      return crypto.subtle.importKey('raw',enc.encode(norm(pass)),'PBKDF2',false,['deriveKey']).then(function(k){
        return crypto.subtle.deriveKey({name:'PBKDF2',salt:b64(d.salt),iterations:d.iter,hash:'SHA-256'},k,{name:'AES-GCM',length:256},false,['decrypt']);
      }).then(function(key){return crypto.subtle.decrypt({name:'AES-GCM',iv:b64(d.iv)},key,b64(d.ct));});
    }).then(function(buf){return new TextDecoder().decode(buf);});
  }
  function show(h,p){
    if(done) return; done=true;
    if(timed){html=h;pass=p;step();return;}
    out.innerHTML=h;out.hidden=false;wait.hidden=true;form.hidden=true;
    document.title=name+' – Theory of Groups in Physics';
  }
  function two(n){return (n<10?'0':'')+n;}
  function countdown(){
    var left=opens-now();
    if(left>0){
      var s=Math.ceil(left/1000),h=Math.floor(s/3600),m=Math.floor(s%3600/60);
      count.textContent=(h?h+':'+two(m):m)+':'+two(s%60);
    } else {
      count.textContent=keyText||att?'Opening…':'Waiting for the questions…';
      if(keyText&&!busy) openWithKey();
    }
  }
  function tick(){
    if(timed){step();return;}
    if(done) return;
    countdown();
  }
  function openWithKey(){
    busy=true;
    var k=keyText;
    decrypt(k).then(function(h){show(h,k);},function(){keyText=null;}).then(function(){busy=false;});
  }
  function poll(){
    if(done&&(clock||!timed)) return Promise.resolve();
    return fetch(id+'.key?t='+Date.now(),{cache:'no-store'}).then(function(r){
      var d=r.headers.get('Date');if(d){var t=Date.parse(d);if(!isNaN(t)){offset=t-Date.now();clock=true;}}
      return r.ok?r.text():null;
    }).then(function(t){if(t&&t.trim()){keyText=t.trim();tick();}}).catch(function(){});
  }
  form.addEventListener('submit',function(e){
    e.preventDefault();
    var v=input.value;
    if(!v.trim()){msg.textContent='Type the password first.';return;}
    btn.disabled=true;msg.className='pwmsg';msg.textContent='Checking…';
    decrypt(v).then(function(h){msg.textContent='';show(h,v);},function(){
      msg.className='pwmsg bad';msg.textContent='That password is not right. Check the board and try again: four words, separated by spaces.';
    }).then(function(){btn.disabled=false;});
  });

  /* ---------- timed quizzes ---------- */
  function $(x){return document.getElementById(x);}
  function load(){try{var a=JSON.parse(localStorage.getItem(SAVE));return a&&a.start>0?a:null;}catch(e){return null;}}
  function save(a){try{localStorage.setItem(SAVE,JSON.stringify(a));}catch(e){}}
  function endOf(a){return Math.min(a.start+mins*60000,isNaN(closes)?Infinity:closes);}
  function mmss(ms){var s=Math.max(0,Math.ceil(ms/1000));return Math.floor(s/60)+':'+two(s%60);}
  function hhmm(ms){var d=new Date(ms+3*3600000);return two(d.getUTCHours())+':'+two(d.getUTCMinutes());}   // Istanbul, UTC+3 all year
  // Decisions that lock a student out wait for the server's clock (a device clock can be hours off).
  function step(){
    var t=now(),v,end=0;
    if(att){end=endOf(att);v=t<end?(html?'run':'wait'):'over';}
    else if(clock&&!isNaN(closes)&&t>=closes) v='closed';
    else if(clock&&!isNaN(until)&&t>=until) v='late';
    else v=html?'start':'wait';
    if(v!==view) enter(v);
    if(v==='wait') countdown();
    if(v==='run'){
      var left=end-t;
      $('tleft').textContent='Time left '+mmss(left);
      $('tbar').className='tbar'+(left<60000?' low':'');
      $('tend').textContent='Ends at '+hhmm(end);
    }
  }
  function enter(v){
    view=v;
    wait.hidden=v!=='wait';
    $('rules').hidden=v!=='wait'||!!att;
    form.hidden=v!=='wait'||!!att;
    $('startbox').hidden=v!=='start';
    $('tbar').hidden=out.hidden=v!=='run';
    $('endbox').hidden=!(v==='over'||v==='closed'||v==='late');
    if(v==='run'){if(!out.innerHTML)out.innerHTML=html;document.title=name+' – Theory of Groups in Physics';}
    else if(out.innerHTML) out.innerHTML='';         // the questions leave the page at 0:00
    if(v==='over'){$('endh').textContent='Time is up';$('endp').textContent=box.getAttribute('data-timeup')||'';}
    if(v==='closed'){$('endh').textContent=name+' has closed';$('endp').textContent='It closed at '+closeAt+'.';}
    if(v==='late'){$('endh').textContent=name+' can no longer be started';$('endp').textContent='It could be started until '+untilAt+'.';}
  }
  if(timed){
    $('rules').textContent='You can start between '+at+' and '+untilAt+'. You have '+mins+' minutes from your own start'+(closeAt?'; the quiz closes at '+closeAt:'')+'.';
    $('starth').textContent=name+' is open';
    $('startp').textContent='Your '+mins+' minutes begin when you press Start. You can start until '+untilAt+'.';
    $('startbtn').addEventListener('click',function(){
      if(att||view!=='start') return;
      var b=this;b.disabled=true;
      (clock?Promise.resolve():poll()).then(function(){
        b.disabled=false;
        if(!(clock&&!isNaN(until)&&now()>=until)){att={start:now(),pass:pass};save(att);window.scrollTo(0,0);}
        step();
      });
    });
    att=load();
    if(att&&att.pass) decrypt(att.pass).then(function(h){show(h,att.pass);},function(){});
  }

  if(!window.crypto||!crypto.subtle){msg.className='pwmsg bad';msg.textContent='This browser cannot open the quiz. Please use an up-to-date browser.';}
  wait.querySelector('.opens').textContent=name+' opens at '+at;
  tick();poll();getData().catch(function(){});
  setInterval(tick,timed?500:1000);setInterval(poll,15000);
  document.addEventListener('visibilitychange',function(){if(!document.hidden){poll();tick();}});
})();
