/* Checks for the FZT 203E simulations. Run from the repository root:
     node _tests/group-theory.test.js
   Folders starting with _ are not published by GitHub Pages. */
'use strict';
var assert=require('assert');
var GT=require('../teaching/group-theory/gt-groups.js');
var LOCK=require('../teaching/group-theory/gt-lock.js');

var passed=0,failed=0;
function test(name,fn){
  try{fn();passed++;console.log('  ok    '+name);}
  catch(e){failed++;console.log('  FAIL  '+name+'\n        '+e.message);}
}
function names(G,set){return set.map(function(i){return G.els[i].name;});}
function find(G,name){var i=G.els.findIndex(function(x){return x.name===name;});assert(i>=0,'no element '+name+' in '+G.name);return i;}
function sub(G,list){return list.map(function(n){return find(G,n);}).sort(function(a,b){return a-b;});}

var ALL=['Z2','Z3','Z4','Z5','Z6','Z7','Z8','Z12','D3','D4','D5','D6','D2'];

console.log('Group axioms');
ALL.forEach(function(id){
  test('axioms hold for '+id,function(){
    var G=GT.byId(id),r=GT.checkAxioms(G);
    assert(r.ok,r.errors.join('; '));
    assert.strictEqual(GT.identity(G),0);
  });
});
test('D_n products match composing position permutations (b acts first)',function(){
  [3,4,5,6].forEach(function(n){
    var G=GT.dihedral(n);
    for(var a=0;a<G.size;a++)for(var b=0;b<G.size;b++)
      assert.deepStrictEqual(G.els[G.mul(a,b)].perm,GT.compose(G.els[a].perm,G.els[b].perm),'D'+n+' '+G.els[a].name+'·'+G.els[b].name);
  });
});
test('cuboid products match composing corner permutations',function(){
  var G=GT.cuboid();
  for(var a=0;a<4;a++)for(var b=0;b<4;b++) assert.deepStrictEqual(G.els[G.mul(a,b)].perm,GT.compose(G.els[a].perm,G.els[b].perm));
  for(var x=0;x<4;x++) assert.strictEqual(G.mul(x,x),0,'every element squares to e');
});
test('D_n relations: r^n = s^2 = e and srs = r^-1',function(){
  [3,4,5,6].forEach(function(n){
    var G=GT.dihedral(n),r=1,s=n,p=0;
    for(var i=0;i<n;i++)p=G.mul(r,p);
    assert.strictEqual(p,0);assert.strictEqual(G.mul(s,s),0);
    assert.strictEqual(G.mul(s,G.mul(r,s)),GT.inverse(G,r));
  });
});

console.log('\nThe triangle (course conventions)');
test('D3 permutations: r=(123), s=(23), rs=(12), sr=r²s=(13)',function(){
  var G=GT.dihedral(3),r=find(G,'r'),s=find(G,'s');
  assert.strictEqual(GT.cycles(G.els[r].perm),'(123)');
  assert.strictEqual(GT.cycles(G.els[s].perm),'(23)');
  assert.strictEqual(GT.cycles(G.els[G.mul(r,s)].perm),'(12)');
  assert.strictEqual(G.els[G.mul(r,s)].name,'rs');
  assert.strictEqual(G.els[G.mul(s,r)].name,'r²s');
  assert.strictEqual(GT.cycles(G.els[G.mul(s,r)].perm),'(13)');
  assert.strictEqual(GT.cycles(G.els[find(G,'r²')].perm),'(132)');
  assert.strictEqual(GT.cycles(G.els[0].perm),'e');
});
test('D3 element order is e, r, r², s, rs, r²s',function(){
  assert.deepStrictEqual(GT.dihedral(3).els.map(function(x){return x.name;}),['e','r','r²','s','rs','r²s']);
});
test('Z_n is written additively: 4 + 5 = 3 in Z6',function(){
  var G=GT.cyclic(6);assert.strictEqual(G.op,'+');assert.strictEqual(G.els[G.mul(4,5)].name,'3');
});

console.log('\nSubgroups');
var COUNTS={D3:6,Z6:4,Z8:4,D4:10,Z12:6};
Object.keys(COUNTS).forEach(function(id){
  test(id+' has '+COUNTS[id]+' subgroups',function(){
    var G=GT.byId(id),S=GT.subgroups(G);
    assert.strictEqual(S.length,COUNTS[id],'found '+S.map(function(H){return '{'+names(G,H)+'}';}).join(' '));
    S.forEach(function(H){assert(GT.isSubgroup(G,H),'not a subgroup: '+names(G,H));});
  });
});
test('subgroup list is complete for small groups (brute force over all subsets)',function(){
  ['Z6','Z8','D3','D4','D2','Z4'].forEach(function(id){
    var G=GT.byId(id),N=G.size,count=0;
    for(var mask=1;mask<(1<<N);mask++){
      var set=[];for(var i=0;i<N;i++)if(mask&(1<<i))set.push(i);
      if(GT.isSubgroup(G,set))count++;
    }
    assert.strictEqual(GT.subgroups(G).length,count,id);
  });
});
test('Lagrange: every subgroup order divides the group order',function(){
  ALL.forEach(function(id){var G=GT.byId(id);GT.subgroups(G).forEach(function(H){assert.strictEqual(G.size%H.length,0,id);});});
});
test('generate builds the subgroup step by step, ending closed',function(){
  var G=GT.dihedral(3),r=find(G,'r'),s=find(G,'s'),r2=find(G,'r²');
  var g=GT.generate(G,[r]);assert.deepStrictEqual(names(G,g.elements),['e','r','r²']);
  g=GT.generate(G,[s]);assert.deepStrictEqual(names(G,g.elements),['e','s']);
  g=GT.generate(G,[r2,s]);assert.strictEqual(g.elements.length,6);
  assert(g.steps.length>0&&g.steps.some(function(x){return x.isNew;}));
  g.steps.forEach(function(x){assert.strictEqual(x.result,G.mul(x.left,x.right));});
  assert(GT.isSubgroup(G,g.elements));
  assert.deepStrictEqual(GT.generate(G,[]).elements,[0]);
  var Z=GT.cyclic(6);assert.deepStrictEqual(names(Z,GT.generate(Z,[4]).elements),['0','2','4']);
});
test('no subgroup of D3 has 4 elements',function(){
  assert(!GT.subgroups(GT.dihedral(3)).some(function(H){return H.length===4;}));
});
test('lattice of D3: {e} below the three reflections and <r>, all below D3',function(){
  var G=GT.dihedral(3),S=GT.subgroups(G),E=GT.lattice(S);
  assert.strictEqual(E.length,8);
  E.forEach(function(e){assert(GT.contains(S[e[1]],S[e[0]])&&S[e[1]].length>S[e[0]].length);});
});
test('lattice edges are covering relations in every group',function(){
  ALL.forEach(function(id){
    var G=GT.byId(id),S=GT.subgroups(G),E=GT.lattice(S);
    E.forEach(function(e){
      var lo=S[e[0]],hi=S[e[1]];
      assert(GT.contains(hi,lo)&&hi.length>lo.length,id);
      S.forEach(function(M){assert(!(M.length>lo.length&&M.length<hi.length&&GT.contains(M,lo)&&GT.contains(hi,M)),id+' edge skips a subgroup');});
    });
  });
});
test('labels: <r>, <s>, {e}, D₃, and <r², s> generates all of D₃',function(){
  var G=GT.dihedral(3);
  assert.strictEqual(GT.label(G,sub(G,['e','r','r²'])).name,'⟨r⟩');
  assert.strictEqual(GT.label(G,sub(G,['e','s'])).name,'⟨s⟩');
  assert.strictEqual(GT.label(G,[0]).name,'{e}');
  assert.strictEqual(GT.label(G,GT.generate(G,[find(G,'r²'),find(G,'s')]).elements).name,'D₃');
  assert.strictEqual(GT.label(GT.cyclic(6),[0]).name,'{0}');
});

console.log('\nCosets');
test('left and right cosets partition G into |G|/|H| blocks of size |H|',function(){
  ALL.forEach(function(id){
    var G=GT.byId(id);
    GT.subgroups(G).forEach(function(H){
      ['leftCosets','rightCosets'].forEach(function(fn){
        var B=GT[fn](G,H);
        assert(GT.isPartition(G,B),id+' '+fn+' not a partition');
        assert.strictEqual(B.length,G.size/H.length,id+' '+fn+' block count');
        B.forEach(function(b){assert.strictEqual(b.elements.length,H.length);});
      });
    });
  });
});
test('in D3, left and right cosets agree exactly for {e}, <r> and D3',function(){
  var G=GT.dihedral(3),agree=GT.subgroups(G).filter(function(H){return GT.sameCosets(G,H);}).map(function(H){return GT.label(G,H).name;}).sort();
  assert.deepStrictEqual(agree,['D₃','{e}','⟨r⟩'].sort());
  var H=sub(G,['e','s']),w=GT.cosetWitness(G,H);
  assert(w>=0,'<s> should have a left coset that is not a right coset');
  assert.strictEqual(GT.cosetWitness(G,sub(G,['e','r','r²'])),-1);
});
test('in an Abelian group left and right cosets always agree',function(){
  ['Z6','Z8','Z12','D2'].forEach(function(id){var G=GT.byId(id);GT.subgroups(G).forEach(function(H){assert(GT.sameCosets(G,H),id);});});
});

console.log('\nHomomorphisms');
test('k -> ka mod n is well defined exactly when ma = 0 mod n (m, n from 2 to 8)',function(){
  for(var m=2;m<=8;m++)for(var n=2;n<=8;n++)for(var a=0;a<n;a++){
    var h=GT.homZ(m,n,a);
    assert.strictEqual(h.wellDefined,(m*a)%n===0,m+','+n+','+a);
    assert.strictEqual(h.wellDefined,GT.isHomZ(m,n,a),'brute-force check '+m+','+n+','+a);
    if(h.wellDefined){
      assert.strictEqual(h.kernel.length*h.image.length,m,'|ker|·|im| = m for '+m+','+n+','+a);
      assert.strictEqual(h.kernel[0],0);
    } else {
      assert.notStrictEqual(h.clash,0);assert.strictEqual(h.kernel,null);
    }
  }
});
test('the lecture example Z6 -> Z3, 1 -> 1: kernel {0, 3}, image Z3',function(){
  var h=GT.homZ(6,3,1);assert(h.wellDefined);assert.deepStrictEqual(h.kernel,[0,3]);assert.deepStrictEqual(h.image,[0,1,2]);
});
test('Z6 -> Z4 with 1 -> 1 is not well defined (6 · 1 = 2 ≠ 0 in Z4)',function(){
  var h=GT.homZ(6,4,1);assert(!h.wellDefined);assert.strictEqual(h.clash,2);
});
test('sign map D3 -> {+1, -1} is a homomorphism with kernel <r>',function(){
  var G=GT.dihedral(3),ker=[];
  for(var g=0;g<6;g++){for(var h=0;h<6;h++)assert.strictEqual(GT.sign(G,G.mul(g,h)),GT.sign(G,g)*GT.sign(G,h));if(GT.sign(G,g)===1)ker.push(g);}
  assert.deepStrictEqual(names(G,ker),['e','r','r²']);
});

console.log('\nCayley permutations and cycle notation');
test('cycle notation: (123)(456), fixed points left out, e for the identity',function(){
  assert.strictEqual(GT.cycles([1,2,0,4,5,3]),'(123)(456)');
  assert.strictEqual(GT.cycles([0,2,1]),'(23)');
  assert.strictEqual(GT.cycles([0,1,2]),'e');
});
test('Cayley permutations in D3 (labels 1..6 = e, r, r², s, rs, r²s)',function(){
  var G=GT.dihedral(3);
  assert.strictEqual(GT.cycles(GT.cayleyPerm(G,0)),'e');
  assert.strictEqual(GT.cycles(GT.cayleyPerm(G,find(G,'r'))),'(123)(456)');
  assert.strictEqual(GT.cycles(GT.cayleyPerm(G,find(G,'s'))),'(14)(26)(35)');
});
test('Cayley permutations compose like the group: perm(gh) = perm(g) after perm(h)',function(){
  ['D3','D4','D2','Z4','Z3'].forEach(function(id){
    var G=GT.byId(id);
    for(var g=0;g<G.size;g++)for(var h=0;h<G.size;h++)
      assert.deepStrictEqual(GT.cayleyPerm(G,G.mul(g,h)),GT.compose(GT.cayleyPerm(G,g),GT.cayleyPerm(G,h)),id);
  });
});

console.log('\nHomework lock');
test('the lock lifts on Wednesday 14 October 2026 at 18:00 Istanbul time (15:00 UTC)',function(){
  assert.strictEqual(new Date(LOCK.until).toISOString(),'2026-10-14T15:00:00.000Z');
  assert.strictEqual(LOCK.until,Date.parse('2026-10-14T18:00:00+03:00'));
});
test('locked items are locked before the deadline and open after it',function(){
  var before=Date.parse('2026-10-14T17:59:59+03:00'),after=Date.parse('2026-10-14T18:00:00+03:00');
  ['group:D4','group:Z12','hom:4-6','hom:6-4','cayley:D2','cayley:D4'].forEach(function(k){
    assert(LOCK.isLocked(k,before),k+' should be locked');
    assert(!LOCK.isLocked(k,after),k+' should be open');
  });
  assert(!LOCK.isLocked('group:D3',before)&&!LOCK.isLocked('hom:6-3',before));
});

console.log('\n'+passed+' passed, '+failed+' failed');
process.exit(failed?1:0);
