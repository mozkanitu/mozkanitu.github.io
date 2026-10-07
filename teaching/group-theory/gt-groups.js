/* ======================================================================
   Finite groups for the FZT 203E simulations, shared by the pages and by
   the test script (_tests/group-theory.test.js).

   Conventions of the course:
   - Polygon positions 1, ..., n counterclockwise; r = counterclockwise
     turn by 2*pi/n; s = reflection in the axis through position 1.
   - Products read right to left: mul(a,b) is ab, and b acts first.
   - Elements of D_n are r^k s^f, listed e, r, ..., r^(n-1), s, rs, ...,
     r^(n-1)s (the order of the Week 1 multiplication-table builder).
   - A symmetry is a permutation of positions: perm[i] = j when the vertex
     at position i+1 moves to position j+1 (0-indexed arrays).
     For the triangle r = (123), s = (23), rs = (12), sr = r^2 s = (13).
   - Z_n = {0, ..., n-1} under addition mod n, written additively.
   Nothing here is specific to any homework problem: every group, subgroup
   and coset is computed from the multiplication table.
   ====================================================================== */
(function(root,factory){
  var gt=factory();
  if(typeof module==='object'&&module.exports) module.exports=gt;
  else root.GT=gt;
})(typeof self!=='undefined'?self:this,function(){
  var SUP={2:'²',3:'³',4:'⁴',5:'⁵',6:'⁶',7:'⁷',8:'⁸',9:'⁹'};
  var SUB='₀₁₂₃₄₅₆₇₈₉';
  function subDigits(n){return String(n).replace(/\d/g,function(d){return SUB[d];});}
  function supDigits(n){return String(n).split('').map(function(d){return SUP[d]||({0:'⁰',1:'¹'})[d];}).join('');}

  /* ---------- building groups ---------- */
  function finish(G){
    var N=G.els.length,t=[],i,j;
    for(i=0;i<N;i++){t.push([]);for(j=0;j<N;j++)t[i].push(G.mulRaw(i,j));}
    G.table=t;G.size=N;
    G.mul=function(a,b){return t[a][b];};
    G.e=0;
    return G;
  }
  // Z_n, written additively: element i is the residue i.
  function cyclic(n){
    var els=[];
    for(var k=0;k<n;k++) els.push({name:String(k),html:String(k),val:k});
    return finish({id:'Z'+n,kind:'cyclic',n:n,additive:true,op:'+',
      name:'Z'+subDigits(n),html:'<span class="m">Z</span><sub>'+n+'</sub>',
      els:els,mulRaw:function(a,b){return (a+b)%n;}});
  }
  function rsName(k,f){
    if(!k&&!f) return {name:'e',html:'e'};
    var r=k?'r'+(k>1?(SUP[k]||'^'+k):''):'', rh=k?'r'+(k>1?'<sup>'+k+'</sup>':''):'';
    return {name:r+(f?'s':''),html:rh+(f?'s':'')};
  }
  // D_n: element index k + f*n is r^k s^f.
  function dihedral(n){
    var els=[];
    for(var f=0;f<2;f++)for(var k=0;k<n;k++){
      var nm=rsName(k,f),perm=[];
      for(var i=0;i<n;i++) perm.push((((f?-i:i)+k)%n+n)%n);
      els.push({name:nm.name,html:nm.html,k:k,f:f,perm:perm});
    }
    return finish({id:'D'+n,kind:'dihedral',n:n,additive:false,op:'·',
      name:'D'+subDigits(n),html:'<span class="m">D</span><sub>'+n+'</sub>',
      els:els,mulRaw:function(a,b){
        var x=els[a],y=els[b],k=((x.k+(x.f?-y.k:y.k))%n+n)%n,f=x.f^y.f;
        return k+f*n;
      }});
  }
  // The four-element group of half-turns of a box (D_2), as in Week 1:
  // a and b turn it about the horizontal and vertical axes, ab in the plane.
  // Corners 1..4 counterclockwise from the bottom left.
  function cuboid(){
    var spec=[['e',[0,0],[0,1,2,3]],['a',[1,0],[3,2,1,0]],['b',[0,1],[1,0,3,2]],['ab',[1,1],[2,3,0,1]]];
    var els=spec.map(function(s){return {name:s[0],html:s[0],bits:s[1],perm:s[2]};});
    return finish({id:'D2',kind:'cuboid',n:4,additive:false,op:'·',
      name:'the cuboid group',html:'the cuboid group',
      els:els,mulRaw:function(a,b){
        var x=els[a].bits,y=els[b].bits,c=[x[0]^y[0],x[1]^y[1]];
        for(var i=0;i<4;i++) if(els[i].bits[0]===c[0]&&els[i].bits[1]===c[1]) return i;
        return -1;
      }});
  }
  function byId(id){
    var m=/^([ZD])(\d+)$/.exec(id);
    if(id==='D2') return cuboid();
    if(!m) throw new Error('Unknown group '+id);
    return m[1]==='Z'?cyclic(+m[2]):dihedral(+m[2]);
  }

  /* ---------- basic facts ---------- */
  function identity(G){
    for(var e=0;e<G.size;e++){var ok=true;for(var x=0;x<G.size;x++)if(G.mul(e,x)!==x||G.mul(x,e)!==x){ok=false;break;}if(ok)return e;}
    return -1;
  }
  function inverse(G,a){for(var b=0;b<G.size;b++)if(G.mul(a,b)===G.e&&G.mul(b,a)===G.e)return b;return -1;}
  function order(G,a){var p=a,n=1;while(p!==G.e){p=G.mul(a,p);n++;if(n>G.size+1)return -1;}return n;}
  function isAbelian(G){for(var a=0;a<G.size;a++)for(var b=a+1;b<G.size;b++)if(G.mul(a,b)!==G.mul(b,a))return false;return true;}
  function checkAxioms(G){
    var N=G.size,err=[],a,b,c;
    for(a=0;a<N;a++)for(b=0;b<N;b++){var v=G.mul(a,b);if(!(v>=0&&v<N))err.push('not closed: '+a+'·'+b);}
    for(a=0;a<N;a++)for(b=0;b<N;b++)for(c=0;c<N;c++)
      if(G.mul(G.mul(a,b),c)!==G.mul(a,G.mul(b,c))){err.push('not associative at '+[a,b,c]);a=b=c=N;}
    var e=identity(G);
    if(e!==0) err.push('identity is not element 0 (found '+e+')');
    for(a=0;a<N;a++) if(inverse(G,a)<0) err.push('no inverse for '+a);
    for(a=0;a<N;a++){var row={};for(b=0;b<N;b++)row[G.mul(a,b)]=1;if(Object.keys(row).length!==N)err.push('row '+a+' repeats');}
    return {ok:!err.length,errors:err};
  }

  /* ---------- subgroups ---------- */
  function sortNum(a){return a.slice().sort(function(x,y){return x-y;});}
  function keyOf(set){return sortNum(set).join(',');}
  // The subgroup generated by gens, built up the way a student would: start
  // from the generators and keep multiplying on the left by a generator until
  // nothing new appears. steps lists every product tried, in order.
  function generate(G,gens){
    var uniq=[],seen={},i;
    gens.forEach(function(g){if(!seen[g]){seen[g]=1;uniq.push(g);}});
    if(!uniq.length) uniq=[G.e];
    var set=uniq.slice(),inSet={},steps=[];
    set.forEach(function(x){inSet[x]=1;});
    for(i=0;i<set.length;i++){
      var x=set[i];
      for(var j=0;j<uniq.length;j++){
        var g=uniq[j],y=G.mul(g,x),isNew=!inSet[y];
        steps.push({left:g,right:x,result:y,isNew:isNew});
        if(isNew){inSet[y]=1;set.push(y);}
      }
    }
    return {elements:sortNum(set),order:set,steps:steps,generators:uniq};
  }
  function isSubgroup(G,set){
    var inS={};set.forEach(function(x){inS[x]=1;});
    if(!inS[G.e]) return false;
    for(var i=0;i<set.length;i++){
      if(!inS[inverse(G,set[i])]) return false;
      for(var j=0;j<set.length;j++) if(!inS[G.mul(set[i],set[j])]) return false;
    }
    return true;
  }
  // Every subgroup of a finite group is generated by some of its elements;
  // start from the cyclic ones and keep joining pairs until nothing is new.
  function subgroups(G){
    var list=[],seen={};
    function add(set){var k=keyOf(set);if(!seen[k]){seen[k]=1;list.push(sortNum(set));return true;}return false;}
    for(var g=0;g<G.size;g++) add(generate(G,[g]).elements);
    var grew=true;
    while(grew){
      grew=false;
      var cur=list.slice();
      for(var a=0;a<cur.length;a++)for(var b=a+1;b<cur.length;b++)
        if(add(generate(G,cur[a].concat(cur[b])).elements)) grew=true;
    }
    list.sort(function(x,y){return x.length-y.length||(x.join(',')<y.join(',')?-1:1);});
    return list;
  }
  function contains(big,small){var s={};big.forEach(function(x){s[x]=1;});return small.every(function(x){return s[x];});}
  // Hasse diagram: edges [i,j] (indices into subs) with subs[i] directly below subs[j].
  function lattice(subs){
    var edges=[],n=subs.length;
    for(var i=0;i<n;i++)for(var j=0;j<n;j++){
      if(subs[i].length>=subs[j].length||!contains(subs[j],subs[i])) continue;
      var between=false;
      for(var k=0;k<n&&!between;k++)
        if(k!==i&&k!==j&&subs[k].length>subs[i].length&&subs[k].length<subs[j].length&&contains(subs[k],subs[i])&&contains(subs[j],subs[k])) between=true;
      if(!between) edges.push([i,j]);
    }
    return edges;
  }
  // Level of a subgroup in the drawn lattice: number of prime factors of |H|.
  function level(order){var n=order,c=0;for(var p=2;n>1;p++)while(n%p===0){n/=p;c++;}return c;}
  // A short name: {e} or {0}, the whole group, <g> or <a, b>.
  function label(G,H){
    var plain,html;
    if(H.length===1) return {name:G.additive?'{0}':'{e}',html:G.additive?'{0}':'{<span class="m">e</span>}'};
    if(H.length===G.size) return {name:G.name,html:G.html};
    var k=keyOf(H),i,j;
    for(i=0;i<H.length;i++) if(keyOf(generate(G,[H[i]]).elements)===k){
      plain='⟨'+G.els[H[i]].name+'⟩';html='⟨'+elHTML(G,H[i])+'⟩';return {name:plain,html:html,gens:[H[i]]};
    }
    for(i=0;i<H.length;i++)for(j=i+1;j<H.length;j++) if(keyOf(generate(G,[H[i],H[j]]).elements)===k){
      return {name:'⟨'+G.els[H[i]].name+', '+G.els[H[j]].name+'⟩',html:'⟨'+elHTML(G,H[i])+', '+elHTML(G,H[j])+'⟩',gens:[H[i],H[j]]};
    }
    return {name:'{'+H.map(function(x){return G.els[x].name;}).join(', ')+'}',html:'{'+H.map(function(x){return elHTML(G,x);}).join(', ')+'}'};
  }
  function elHTML(G,i){return G.additive?G.els[i].html:'<span class="m">'+G.els[i].html+'</span>';}

  /* ---------- cosets ---------- */
  // Blocks in the order their first element appears in G; each block is
  // listed as g h for h in H (left) or h g (right), sorted.
  function cosets(G,H,side){
    var blocks=[],seen={};
    for(var g=0;g<G.size;g++){
      if(seen[g]) continue;
      var block=sortNum(H.map(function(h){return side==='right'?G.mul(h,g):G.mul(g,h);}));
      block.forEach(function(x){seen[x]=1;});
      blocks.push({rep:g,elements:block});
    }
    return blocks;
  }
  function leftCosets(G,H){return cosets(G,H,'left');}
  function rightCosets(G,H){return cosets(G,H,'right');}
  function sameCosets(G,H){
    var L=leftCosets(G,H).map(function(b){return keyOf(b.elements);}).sort(),R=rightCosets(G,H).map(function(b){return keyOf(b.elements);}).sort();
    return L.join('|')===R.join('|');
  }
  // First g with gH != Hg, or -1.
  function cosetWitness(G,H){
    for(var g=0;g<G.size;g++){
      var l=keyOf(H.map(function(h){return G.mul(g,h);})),r=keyOf(H.map(function(h){return G.mul(h,g);}));
      if(l!==r) return g;
    }
    return -1;
  }
  function isPartition(G,blocks){
    var count={};blocks.forEach(function(b){b.elements.forEach(function(x){count[x]=(count[x]||0)+1;});});
    for(var g=0;g<G.size;g++) if(count[g]!==1) return false;
    return Object.keys(count).length===G.size;
  }

  /* ---------- homomorphisms ---------- */
  // The candidate map Z_m -> Z_n, k -> k a mod n.
  function homZ(m,n,a){
    var images=[],kernel=[],imageSet={},k;
    for(k=0;k<m;k++){var v=(k*a)%n;images.push(v);imageSet[v]=1;}
    var clash=(m*a)%n,ok=clash===0;
    if(ok) for(k=0;k<m;k++) if(images[k]===0) kernel.push(k);
    var image=Object.keys(imageSet).map(Number).sort(function(x,y){return x-y;});
    return {m:m,n:n,a:a,images:images,wellDefined:ok,clash:clash,kernel:ok?kernel:null,image:ok?image:null};
  }
  // Checks phi(x+y) = phi(x)+phi(y) for every pair; used by the tests.
  function isHomZ(m,n,a){
    for(var x=0;x<m;x++)for(var y=0;y<m;y++) if(((x+y)%m*a)%n!==((x*a)%n+(y*a)%n)%n) return false;
    return true;
  }
  // The sign map D_n -> {+1, -1}: rotations go to +1, reflections to -1.
  function sign(G,i){return G.els[i].f?-1:1;}

  /* ---------- permutations ---------- */
  // Cycle notation, cycles starting at their smallest entry, fixed points
  // left out, e for the identity. Labels are 1-based.
  function cycles(p){
    var seen=[],out=[],sep=p.length>9?' ':'';
    for(var i=0;i<p.length;i++){
      if(seen[i]||p[i]===i){seen[i]=true;continue;}
      var c=[],j=i;
      while(!seen[j]){seen[j]=true;c.push(j+1);j=p[j];}
      out.push('('+c.join(sep)+')');
    }
    return out.length?out.join(''):'e';
  }
  function compose(p,q){return q.map(function(x){return p[x];});} // p after q: q acts first
  // Cayley: with the elements labelled 1..|G| in table order, left
  // multiplication by g sends label i+1 to the label of g * (element i).
  function cayleyPerm(G,g){var p=[];for(var i=0;i<G.size;i++)p.push(G.mul(g,i));return p;}

  return {
    cyclic:cyclic,dihedral:dihedral,cuboid:cuboid,byId:byId,
    identity:identity,inverse:inverse,order:order,isAbelian:isAbelian,checkAxioms:checkAxioms,
    generate:generate,isSubgroup:isSubgroup,subgroups:subgroups,lattice:lattice,level:level,label:label,elHTML:elHTML,contains:contains,keyOf:keyOf,
    leftCosets:leftCosets,rightCosets:rightCosets,sameCosets:sameCosets,cosetWitness:cosetWitness,isPartition:isPartition,
    homZ:homZ,isHomZ:isHomZ,sign:sign,
    cycles:cycles,compose:compose,cayleyPerm:cayleyPerm,
    subDigits:subDigits,supDigits:supDigits
  };
});
