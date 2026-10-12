/* Quiz pages for FZT 203E. The questions are encrypted (quizN.enc.json).
   At release time a workflow publishes the passphrase as quizN.key; this
   script polls for it every 15 s and decrypts in the browser. Students can
   also type the password written on the board. See CLAUDE.md. */
(function(){
  var box=document.getElementById('quiz'),id=box.getAttribute('data-id'),opens=Date.parse(box.getAttribute('data-opens'));
  var name=box.getAttribute('data-name'),at=box.getAttribute('data-opens-label');
  var wait=document.getElementById('wait'),count=document.getElementById('count'),out=document.getElementById('questions');
  var form=document.getElementById('pw'),input=document.getElementById('pwin'),msg=document.getElementById('pwmsg'),btn=form.querySelector('button');
  var offset=0,data=null,done=false,keyText=null,busy=false;
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
  function show(html){
    if(done) return; done=true;
    out.innerHTML=html;out.hidden=false;wait.hidden=true;form.hidden=true;
    document.title=name+' – Theory of Groups in Physics';
  }
  function two(n){return (n<10?'0':'')+n;}
  function tick(){
    if(done) return;
    var left=opens-now();
    if(left>0){
      var s=Math.ceil(left/1000),h=Math.floor(s/3600),m=Math.floor(s%3600/60);
      count.textContent=(h?h+':'+two(m):m)+':'+two(s%60);
    } else {
      count.textContent=keyText?'Opening…':'Waiting for the questions…';
      if(keyText&&!busy) openWithKey();
    }
  }
  function openWithKey(){
    busy=true;
    decrypt(keyText).then(show,function(){keyText=null;}).then(function(){busy=false;});
  }
  function poll(){
    if(done) return;
    fetch(id+'.key?t='+Date.now(),{cache:'no-store'}).then(function(r){
      var d=r.headers.get('Date');if(d){var t=Date.parse(d);if(!isNaN(t))offset=t-Date.now();}
      return r.ok?r.text():null;
    }).then(function(t){if(t&&t.trim()){keyText=t.trim();tick();}}).catch(function(){});
  }
  form.addEventListener('submit',function(e){
    e.preventDefault();
    if(!input.value.trim()){msg.textContent='Type the password first.';return;}
    btn.disabled=true;msg.className='pwmsg';msg.textContent='Checking…';
    decrypt(input.value).then(function(html){msg.textContent='';show(html);},function(){
      msg.className='pwmsg bad';msg.textContent='That password is not right. Check the board and try again: four words, separated by spaces.';
    }).then(function(){btn.disabled=false;});
  });
  if(!window.crypto||!crypto.subtle){msg.className='pwmsg bad';msg.textContent='This browser cannot open the quiz. Please use an up-to-date browser.';}
  wait.querySelector('.opens').textContent=name+' opens at '+at;
  tick();poll();getData().catch(function(){});
  setInterval(tick,1000);setInterval(poll,15000);
  document.addEventListener('visibilitychange',function(){if(!document.hidden){poll();tick();}});
})();
