(function(){
  /* ---------- papers (single source for home, research and publications) ---------- */
  var PAPERS=[
    {"y": 2026, "t": "A Twisted Origin for Magnetic Carroll Supersymmetry", "a": "I. Bulunur, O. Ergec, O. Kasikci, M. Ozkan and M. S. Zog", "j": "", "x": "2603.28269", "k": "carroll", "s": 1},
    {"y": 2026, "t": "Chern–Simons-Like Formulation of 3D MMG-Like Massive Gravity Models", "a": "B. Dedeoğlu, M. Ozkan and Ö. Sarıoğlu", "j": "Eur. Phys. J. C 86 (2026) 600", "x": "2601.03936", "k": "3d", "s": 1},
    {"y": 2025, "t": "Supersymmetric Carroll Galileons in Three Dimensions", "a": "U. Zorba, I. Bulunur, O. Kasikci, M. Ozkan, Y. Pang and M. S. Zog", "j": "Phys. Rev. D 111 (2025) 085008", "x": "2409.15428", "k": "carroll", "s": 1},
    {"y": 2024, "t": "Chern–Simons-Like Formulation of Exotic Massive 3D Gravity Models", "a": "B. Dedeoğlu, M. Ozkan and Ö. Sarıoğlu", "j": "Eur. Phys. J. C 84 (2024) 1225", "x": "2407.16799", "k": "3d", "s": 1},
    {"y": 2024, "t": "Higher Derivative Supergravities in Diverse Dimensions", "a": "M. Ozkan, Y. Pang and E. Sezgin", "j": "Phys. Rept. 1086 (2024) 1–95", "x": "2401.08945", "k": "sugra", "s": 1},
    {"y": 2024, "t": "Carrollian Supersymmetry and SYK-like Models", "a": "O. Kasikci, M. Ozkan, Y. Pang and U. Zorba", "j": "Phys. Rev. D 110 (2024) L021702", "x": "2311.00039", "k": "carroll", "s": 1},
    {"y": 2023, "t": "All Gauged Curvature Squared Supergravities in Five Dimensions", "a": "G. Gold, J. Hutomo, S. Khandelwal, M. Ozkan, Y. Pang and G. Tartaglino-Mazzucchelli", "j": "Phys. Rev. Lett. 131 (2023) 251603", "x": "2309.07637", "k": "sugra", "s": 1},
    {"y": 2023, "t": "Carrollian Origin of Spacetime Subsystem Symmetry", "a": "O. Kasikci, M. Ozkan and Y. Pang", "j": "Phys. Rev. D 108 (2023) 045020", "x": "2304.11331", "k": "carroll", "s": 1},
    {"y": 2022, "t": "Non-Relativistic and Ultra-Relativistic Scaling Limits of Multimetric Gravity", "a": "E. Ekiz, O. Kasikci, M. Ozkan, C. B. Senisik and U. Zorba", "j": "JHEP 10 (2022) 151", "x": "2207.07882", "k": "carroll", "s": 1},
    {"y": 2022, "t": "Lie Algebra Expansions, Non-Relativistic Matter Multiplets and Actions", "a": "O. Kasikci and M. Ozkan", "j": "JHEP 01 (2022) 081", "x": "2111.14568", "k": "nr", "s": 0},
    {"y": 2022, "t": "The Holographic c-Theorem and Infinite-Dimensional Lie Algebras", "a": "E. A. Bergshoeff, M. Ozkan and M. S. Zog", "j": "JHEP 01 (2022) 010", "x": "2110.09542", "k": "other", "s": 0},
    {"y": 2020, "t": "Off-Shell N=(1,0) Linear Multiplets in Six Dimensions", "a": "U. Atli, O. Guleryuz and M. Ozkan", "j": "Eur. Phys. J. C 80 (2020) 1199", "x": "2010.14655", "k": "sugra", "s": 0},
    {"y": 2020, "t": "Three-Dimensional Higher-Order Schrödinger Algebras and Lie Algebra Expansions", "a": "O. Kasikci, N. Ozdemir, M. Ozkan and U. Zorba", "j": "JHEP 04 (2020) 067", "x": "2002.03558", "k": "3d", "s": 0},
    {"y": 2020, "t": "Superconformal Generalizations of Auxiliary Vector Modified Polynomial f(R) Theories", "a": "S. Boran, E. O. Kahya, N. Ozdemir, M. Ozkan and U. Zorba", "j": "JCAP 04 (2020) 005", "x": "1912.01919", "k": "cosmo", "s": 0},
    {"y": 2019, "t": "Three-Dimensional Extended Lifshitz, Schrödinger and Newton–Hooke Supergravity", "a": "N. Ozdemir, M. Ozkan and U. Zorba", "j": "JHEP 11 (2019) 052", "x": "1909.10745", "k": "3d", "s": 0},
    {"y": 2019, "t": "A Unitary Extension of Exotic Massive 3D Gravity from Bigravity", "a": "M. Ozkan, Y. Pang and U. Zorba", "j": "Phys. Rev. Lett. 123 (2019) 031303", "x": "1905.00438", "k": "3d", "s": 1},
    {"y": 2019, "t": "Three-Dimensional Extended Newtonian (Super)Gravity", "a": "N. Ozdemir, M. Ozkan, O. Tunca and U. Zorba", "j": "JHEP 05 (2019) 130", "x": "1903.09377", "k": "3d", "s": 1},
    {"y": 2019, "t": "Curvature Squared Invariants in Six-Dimensional N=(1,0) Supergravity", "a": "D. Butter, J. Novak, M. Ozkan, Y. Pang and G. Tartaglino-Mazzucchelli", "j": "JHEP 04 (2019) 013", "x": "1808.00459", "k": "sugra", "s": 1},
    {"y": 2018, "t": "Exotic Massive 3D Gravity", "a": "M. Ozkan, Y. Pang and P. K. Townsend", "j": "JHEP 08 (2018) 035", "x": "1806.04179", "k": "3d", "s": 1},
    {"y": 2018, "t": "Scale Invariance in Newton–Cartan and Hořava–Lifshitz Gravity", "a": "D. O. Devecioglu, N. Ozdemir, M. Ozkan and U. Zorba", "j": "Class. Quant. Grav. 35 (2018) 115016", "x": "1801.08726", "k": "nr", "s": 0},
    {"y": 2017, "t": "Gauss–Bonnet Supergravity in Six Dimensions", "a": "J. Novak, M. Ozkan, Y. Pang and G. Tartaglino-Mazzucchelli", "j": "Phys. Rev. Lett. 119 (2017) 111602", "x": "1706.09330", "k": "sugra", "s": 1},
    {"y": 2017, "t": "Broken Scale Invariance, α-Attractors and Vector Impurity", "a": "O. Akarsu, S. Boran, E. O. Kahya, N. Ozdemir and M. Ozkan", "j": "Eur. Phys. J. C 77 (2017) 306", "x": "1606.05308", "k": "cosmo", "s": 0},
    {"y": 2016, "t": "Off-Shell N=2 Linear Multiplets in Five Dimensions", "a": "M. Ozkan", "j": "JHEP 11 (2016) 157", "x": "1608.00349", "k": "sugra", "s": 0},
    {"y": 2016, "t": "Galileons as the Scalar Analogue of General Relativity", "a": "R. Klein, M. Ozkan and D. Roest", "j": "Phys. Rev. D 93 (2016) 044053", "x": "1510.08864", "k": "cosmo", "s": 0},
    {"y": 2015, "t": "Supersymmetric Backgrounds and Black Holes in N=(1,1) Cosmological New Massive Supergravity", "a": "G. Alkaç, L. Basanisi, E. A. Bergshoeff, D. O. Devecioglu and M. Ozkan", "j": "JHEP 10 (2015) 141", "x": "1507.06928", "k": "3d", "s": 0},
    {"y": 2015, "t": "Universality Classes of Scale Invariant Inflation", "a": "M. Ozkan and D. Roest", "j": "", "x": "1507.03603", "k": "cosmo", "s": 0},
    {"y": 2015, "t": "Planck Constraints on Inflation in Auxiliary Vector Modified f(R) Theories", "a": "M. Ozkan, Y. Pang and S. Tsujikawa", "j": "Phys. Rev. D 92 (2015) 023530", "x": "1502.06341", "k": "cosmo", "s": 0},
    {"y": 2015, "t": "Massive N=2 Supergravity in Three Dimensions", "a": "G. Alkaç, L. Basanisi, E. A. Bergshoeff, M. Ozkan and E. Sezgin", "j": "JHEP 02 (2015) 125", "x": "1412.3118", "k": "3d", "s": 0},
    {"y": 2014, "t": "3D Born–Infeld Gravity and Supersymmetry", "a": "E. A. Bergshoeff and M. Ozkan", "j": "JHEP 08 (2014) 149", "x": "1405.6212", "k": "3d", "s": 0},
    {"y": 2014, "t": "Rⁿ Extension of the Starobinsky Model in Old Minimal Supergravity", "a": "M. Ozkan and Y. Pang", "j": "Class. Quant. Grav. 31 (2014) 205004", "x": "1402.5427", "k": "cosmo", "s": 0},
    {"y": 2013, "t": "All Off-Shell R² Invariants in Five Dimensional N=2 Supergravity", "a": "M. Ozkan and Y. Pang", "j": "JHEP 08 (2013) 042", "x": "1306.1540", "k": "sugra", "s": 1},
    {"y": 2013, "t": "Supersymmetric Completion of Gauss–Bonnet Combination in Five Dimensions", "a": "M. Ozkan and Y. Pang", "j": "JHEP 03 (2013) 158", "x": "1301.6622", "k": "sugra", "s": 0},
    {"y": 2013, "t": "An Off-Shell Formulation for Internally Gauged D=5, N=2 Supergravity from Superconformal Methods", "a": "F. Coomans and M. Ozkan", "j": "JHEP 01 (2013) 099", "x": "1210.4704", "k": "sugra", "s": 0}
  ];
  function esc(s){return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/"/g,'&quot;');}
  function url(p){return p.x?'https://arxiv.org/abs/'+p.x:'https://inspirehep.net/literature?q='+encodeURIComponent('t "'+p.t+'"');}
  function ref(p){
    var parts=[];
    if(p.j) parts.push('<em>'+esc(p.j.split(/ (?=\d)/)[0])+'</em> '+esc(p.j.slice(p.j.split(/ (?=\d)/)[0].length+1)));
    if(p.x) parts.push('<a href="https://arxiv.org/abs/'+p.x+'">arXiv:'+p.x+'</a>');
    return parts.join(', ');
  }
  function item(p,cont){
    return '<li'+(cont?' class="cont"':'')+'><span class="year">'+p.y+'</span><div>'+
      '<a class="p-title" href="'+url(p)+'">'+esc(p.t)+'</a>'+
      '<p class="authors">'+esc(p.a).replace('M. Ozkan','<span class="me">M. Ozkan</span>')+'</p>'+
      (ref(p)?'<p class="ref">'+ref(p)+'</p>':'')+'</div></li>';
  }
  var home=document.getElementById('home-papers');
  if(home) home.innerHTML=PAPERS.slice(0,3).map(function(p){return item(p,false);}).join('');
  var all=document.getElementById('all-papers');
  if(all) all.innerHTML=PAPERS.map(function(p,i){return item(p,i>0&&PAPERS[i-1].y===p.y);}).join('');
  [].forEach.call(document.querySelectorAll('[data-papers]'),function(ul){
    var k=ul.getAttribute('data-papers');
    ul.innerHTML=PAPERS.filter(function(p){return p.k===k&&p.s;}).map(function(p){
      return '<li><a href="'+url(p)+'">'+esc(p.t)+'</a><span class="sel-ref">'+(p.j?esc(p.j):'arXiv:'+p.x+' ('+p.y+')')+'</span></li>';
    }).join('');
  });


  /* ---------- teaching ---------- */
  var ICON={
    notes:'<path d="M4 1.5h5.5l3 3v10H4Z"/><path d="M9.5 1.5v3h3M6 8h4.5M6 10.5h4.5"/>',
    reading:'<path d="M8 4C6.5 2.7 4.5 2.2 2 2.5v10c2.5-.3 4.5.2 6 1.5 1.5-1.3 3.5-1.8 6-1.5v-10c-2.5-.3-4.5.2-6 1.5Z"/><path d="M8 4v10"/>',
    homework:'<path d="M2.5 13.5l.7-3 7.3-7.3 2.3 2.3-7.3 7.3Z"/><path d="M9.2 4.5l2.3 2.3"/>',
    quiz:'<circle cx="8" cy="8" r="6"/><path d="M5.3 8.2l1.8 1.8 3.6-3.8"/>',
    solutions:'<circle cx="5.5" cy="8" r="3"/><path d="M8.5 8h6M12.5 8v2.5M14.5 8v2"/>',
    video:'<rect x="1.5" y="3" width="13" height="10" rx="2"/><path d="M6.5 6v4l3.5-2Z"/>',
    simulation:'<path d="M3 2.5h10M8 2.5l3 8"/><circle cx="11.5" cy="12" r="1.8"/>',
    exam:'<path d="M3 1.5h10v13H3Z"/><path d="M5.5 5h5M5.5 8h5M5.5 11h3"/>'
  };
  function chip(c){
    var ic='<svg viewBox="0 0 16 16" aria-hidden="true">'+(ICON[c.t]||'')+'</svg>';
    var cls='chip'+(c.t==='exam'?' event':'');
    if(c.url) return '<a class="'+cls+'" data-t="'+c.t+'" href="'+c.url+'"'+(c.ext?' target="_blank" rel="noopener"':'')+'>'+ic+esc(c.label)+'</a>';
    if(c.soon) return '<span class="'+cls+' soon" data-t="'+c.t+'" title="Not posted yet">'+ic+esc(c.label)+' <span class="soon-t">soon</span></span>';
    return '<span class="'+cls+'" data-t="'+c.t+'">'+ic+esc(c.label)+'</span>';
  }
  var MON=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  function addDays(d,n){var x=new Date(d.getTime());x.setDate(x.getDate()+n);return x;}
  function fmt(a,b){return a.getMonth()===b.getMonth()? a.getDate()+'–'+b.getDate()+' '+MON[a.getMonth()] : a.getDate()+' '+MON[a.getMonth()]+' – '+b.getDate()+' '+MON[b.getMonth()];}
  var TERM_START=new Date(2026,8,28), BREAK_AFTER=7; // Fall 2026 starts Monday 28 September; mid-term break 16–20 November
  function weekStart(n){return addDays(TERM_START,7*(n-1)+(n>BREAK_AFTER?7:0));}
  var today=new Date(); today.setHours(0,0,0,0);
  function isNow(a){return today>=a && today<addDays(a,7);}

  var GT=[
    {n:1,title:"Symmetry and groups",lec:"Symmetry as the motivation. Group axioms, order, Abelian and non-Abelian groups. Zₙ, Dₙ, S₃.",read:"Zee I.1, Bünemann Ch. 2",notes:"notes/GT_W1.pdf",sims:[["Symmetry explorer","symmetry-explorer.html"],["Multiplication-table builder","table-builder.html"],["Same group, different clothes","same-group.html"]]},
    {n:2,title:"Subgroups, homomorphisms and cosets",lec:"Subgroups, cyclic groups, generators. Homomorphisms, isomorphisms, kernels. Direct products. Cosets and Lagrange's theorem.",read:"Zee I.1–I.2, Bünemann Ch. 2",notes:"notes/GT_W2.pdf",quiz:1,quizWhen:"Wednesday 7 Oct"},
    {n:3,title:"Normal subgroups and the symmetric group",lec:"Normal subgroups, quotient groups. Conjugacy classes. Sₙ: cycle notation, parity, Aₙ.",read:"Zee I.2, Bünemann Ch. 2"},
    {n:4,title:"The linear algebra bridge",lec:"Matrices as linear maps, eigenvectors, diagonalization, trace and determinant under change of basis, unitary and orthogonal matrices, O(n), U(n) and SU(n) as groups, invariant subspaces.",read:"Zee II.1, Bünemann Ch. 4",quiz:2},
    {n:5,title:"Schur's lemmas and characters",lec:"Unitarity of finite-group representations. Schur's lemmas. The great orthogonality theorem. Characters as class functions.",read:"Zee II.2–II.3, Bünemann Ch. 4–5"},
    {n:6,title:"Character tables in practice",lec:"Character tables of D₄ and Z₂ × Z₂. Decomposing reducible representations with characters. Product representations.",read:"Zee IV.i1, III.2 (molecule example), Bünemann Ch. 5",quiz:3},
    {n:7,title:"Point groups",lec:"Schoenflies notation and the 32 point groups. Subgroup restriction and crystal-field splitting.",read:"Zee II.i1, IV.i2, Bünemann Ch. 3, 7",noHW:1},
    {n:8,title:"Continuous groups: SO(3) and its Lie algebra",lec:"SO(2) and SO(3) as matrices; one-parameter subgroups, generators, the exponential map. The Lie algebra so(3) and its commutators.",read:"Zee I.3, IV.1"},
    {n:9,title:"SU(2) and the double cover",lec:"Pauli matrices, su(2) ≅ so(3) as algebras. The two-to-one map SU(2) → SO(3). SU(2) as a 3-sphere.",read:"Zee IV.5, IV.4",quiz:4},
    {n:10,title:"Irreducible representations of su(2)",lec:"Finite-dimensional irreps from the algebra: Casimir, J₃, ladder operators, highest weight, dimension 2j + 1. Integer and half-integer j and the double cover.",read:"Zee IV.2"},
    {n:11,title:"Tensor products and Clebsch–Gordan",lec:"Tensor products of su(2) irreps. The Clebsch–Gordan decomposition j₁ ⊗ j₂ via characters and weights; ½ ⊗ ½ = 0 ⊕ 1 in detail.",read:"Zee IV.3, ★ Bünemann Ch. 10",quiz:5},
    {n:12,title:"Lie algebras and SU(3)",lec:"Structure constants, the Jacobi identity, Cartan generators, weights. SU(3): Gell-Mann matrices, T₃ and T₈, weight diagrams of 3, 3̄ and 8. The Eightfold Way as a picture.",read:"Zee V.2, selected VI.1, lecture notes"},
    {n:13,title:"Noether and the Lorentz algebra",lec:"Rotations and angular momentum, translations and momentum. The Lorentz algebra: [J, J], [J, K], [K, K]; A = (J + iK)/2 and B = (J − iK)/2 give su(2) ⊕ su(2). Synthesis.",read:"Zee III.3, selected VII.2, lecture notes",quiz:6}
  ];
  var hwN=0;
  GT.forEach(function(w){
    var r=[w.notes?{t:'notes',label:'Lecture notes (PDF)',url:w.notes,ext:1}:{t:'notes',label:'Lecture notes',soon:1},{t:'reading',label:w.read}];
    (w.sims||[]).forEach(function(x){r.push({t:'simulation',label:x[0],url:x[1],ext:1});});
    if(!w.noHW){hwN++; r.push({t:'homework',label:'Problem set '+hwN,soon:1});}
    if(w.quiz) r.push({t:'quiz',label:'Quiz '+w.quiz+(w.quizWhen?', '+w.quizWhen:''),soon:1});
    if(!w.noHW||w.quiz) r.push({t:'solutions',label:'Solutions',soon:1});
    w.res=r;
  });
  function wkRow(w,start){
    var cur=start&&isNow(start);
    return '<article class="wk'+(cur?' current':'')+'"><div><span class="wk-n">'+w.label+'</span>'+
      (start?'<span class="wk-d">'+fmt(start,addDays(start,4))+'</span>':'')+(cur?'<span class="now-tag">This week</span>':'')+'</div>'+
      '<div><h3>'+esc(w.title)+'</h3>'+(w.lec?'<p class="lec">'+esc(w.lec)+'</p>':'')+
      '<div class="chips">'+w.res.map(chip).join('')+'</div></div></article>';
  }
  var gtEl=document.getElementById('gt-sched');
  if(gtEl){
    var h='<p class="part-h">Part I. Finite groups and their representations</p>';
    GT.forEach(function(w){
      w.label='Week '+w.n;
      if(w.n===8){
        var bs=addDays(TERM_START,49), cur=isNow(bs);
        h+='<div class="brk'+(cur?' current':'')+'"><div><span class="wk-n">Fall break</span><span class="wk-d">'+fmt(bs,addDays(bs,4))+'</span></div><p class="lec">No classes. The midterm will be held just before or just after the break; the date will be announced.</p></div>';
        h+='<p class="part-h">Part II. Continuous groups</p>';
      }
      h+=wkRow(w,weekStart(w.n));
    });
    h+='<article class="wk"><div><span class="wk-n">Final exam</span><span class="wk-d">2–17 Jan 2027</span></div><div><h3>Whole course, weighted toward Weeks 8–13</h3><p class="lec">The exact date is set by the Registrar\u2019s Office.</p></div></article>';
    gtEl.innerHTML=h;
  }
  var gtNow=document.getElementById('gt-now');
  if(gtNow){
    GT.forEach(function(w){ if(isNow(weekStart(w.n))){ gtNow.textContent='This week: Week '+w.n+', '+w.title; gtNow.hidden=false; } });
  }

  var PHET='https://phet.colorado.edu/en/simulations/';
  var PHYS=[
    {title:"Units, physical quantities and vectors",read:"Young & Freedman, Ch. 1",noQuiz:1,
      videos:[["Powers of Ten (Eames, 1977)","https://www.youtube.com/watch?v=0fKBhvDjuy0"],["Feathers and a bowling ball in a vacuum chamber","https://www.youtube.com/watch?v=E43-CfukEgs"]],sims:[["PhET: Vector Addition","vector-addition"]]},
    {title:"Kinematics: motion in one, two and three dimensions",read:"Young & Freedman, Ch. 2–3",videos:[],sims:[]},
    {title:"Newton's laws of motion",read:"Young & Freedman, Ch. 4",videos:[],sims:[]},
    {title:"Applying Newton's laws",read:"Young & Freedman, Ch. 5",videos:[],sims:[]},
    {title:"Work and kinetic energy",read:"Young & Freedman, Ch. 6",videos:[],sims:[]},
    {title:"Potential energy and energy conservation",read:"Young & Freedman, Ch. 7",videos:[],sims:[]},
    {title:"Momentum, impulse and collisions",read:"Young & Freedman, Ch. 8",videos:[],sims:[]},
    {title:"Rotation of rigid bodies",read:"Young & Freedman, Ch. 9",videos:[],sims:[]},
    {title:"Dynamics of rotational motion",read:"Young & Freedman, Ch. 10",videos:[],sims:[]},
    {title:"Gravitation",read:"Young & Freedman, Ch. 13",videos:[],sims:[]},
    {title:"Periodic motion",read:"Young & Freedman, Ch. 14",videos:[],sims:[]}
  ];
  var phEl=document.getElementById('phys-sched');
  if(phEl){
    phEl.innerHTML=PHYS.map(function(p,i){
      p.label='Topic '+(i+1);
      var r=[{t:'reading',label:p.read}];
      p.videos.forEach(function(v){r.push({t:'video',label:v[0],url:v[1],ext:1});});
      p.sims.forEach(function(v){r.push({t:'simulation',label:v[0],url:PHET+v[1],ext:1});});
      if(!p.noQuiz) r.push({t:'quiz',label:'Quiz',soon:1},{t:'solutions',label:'Solutions',soon:1});
      p.res=r;
      return wkRow(p,null);
    }).join('');
  }

  var FILTERS={'gt-sched':[['','All'],['notes','Lecture notes'],['reading','Readings'],['simulation','Simulations'],['homework','Problem sets'],['quiz','Quizzes'],['solutions','Solutions']],
               'phys-sched':[['','All'],['reading','Readings'],['video','Videos'],['simulation','Simulations'],['quiz','Quizzes'],['solutions','Solutions']]};
  [].forEach.call(document.querySelectorAll('.filters[data-for]'),function(bar){
    var id=bar.getAttribute('data-for'), sched=document.getElementById(id);
    bar.innerHTML=FILTERS[id].map(function(f,i){return '<button type="button" data-f="'+f[0]+'" aria-pressed="'+(i===0)+'">'+f[1]+'</button>';}).join('');
    bar.addEventListener('click',function(e){
      var btn=e.target.closest('button'); if(!btn) return;
      var f=btn.getAttribute('data-f');
      [].forEach.call(bar.querySelectorAll('button'),function(b){b.setAttribute('aria-pressed',String(b===btn));});
      if(f) sched.setAttribute('data-show',f); else sched.removeAttribute('data-show');
      [].forEach.call(sched.querySelectorAll('.chip'),function(c){c.classList.toggle('match',c.getAttribute('data-t')===f);});
      [].forEach.call(sched.querySelectorAll('.wk'),function(w){w.classList.toggle('nomatch',!!f && !w.querySelector('.chip[data-t="'+f+'"]'));});
    });
  });


  /* ---------- email, assembled only when clicked so it never sits in the page source ---------- */
  var MP=['itu','edu','tr'], MU=['ozkan','mehm'];
  [].forEach.call(document.querySelectorAll('.mail-btn'),function(btn){
    btn.addEventListener('click',function(){
      var addr=MU.join('')+String.fromCharCode(64)+MP.join('.');
      btn.textContent=addr;
      window.location.href='mai'+'lto:'+addr;
    });
  });

  /* ---------- placeholder links stay put ---------- */
  document.addEventListener('click',function(e){
    var a=e.target.closest&&e.target.closest('a[href="#"]');
    if(a) e.preventDefault();
  });

  /* ---------- Penrose diagram (built the first time home is shown) ---------- */
  var diagramReady=false;
  function initDiagram(){
    if(diagramReady) return; diagramReady=true;
    var svg=document.getElementById('penrose'); if(!svg) return;
    var NS='http://www.w3.org/2000/svg', S=70, X0=44, TOP=28, PI=Math.PI, H=PI/2, Y0=TOP+PI*S;
    var reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var canAnimate=!reduce && typeof Element.prototype.animate==='function';
    function P(R,T){return [X0+S*R, Y0-S*T];}
    function TR(t,r){var U=Math.atan(t-r),V=Math.atan(t+r);return P(V-U,U+V);}
    function D(pts){return 'M'+pts.map(function(p){return p[0].toFixed(2)+' '+p[1].toFixed(2);}).join(' L');}
    function mk(tag,a,parent){var e=document.createElementNS(NS,tag);for(var k in a)e.setAttribute(k,a[k]);parent.appendChild(e);return e;}
    var grid=svg.querySelector('#grid'), edges=svg.querySelector('#edges'), rays=svg.querySelector('#rays'), marks=svg.querySelector('#marks');
    var N=160, eps=1e-4, i, pts;
    [0.35,1,2.2,5].forEach(function(r){pts=[];for(i=0;i<=N;i++){pts.push(TR(Math.tan(-H+eps+i*(PI-2*eps)/N),r));}mk('path',{d:D(pts)},grid);});
    [-2.4,-0.9,-0.3,0.3,0.9,2.4].forEach(function(t){pts=[];for(i=0;i<=N;i++){pts.push(TR(t,Math.tan(i*(H-eps)/N)));}mk('path',{d:D(pts)},grid);});
    function draw(path,delay){
      if(!canAnimate) return Promise.resolve();
      var len=path.getTotalLength();
      path.style.strokeDasharray=len; path.style.strokeDashoffset=len;
      var an=path.animate([{strokeDashoffset:len},{strokeDashoffset:0}],{duration:len*4.4,delay:delay||0,easing:'linear',fill:'forwards'});
      return an.finished.then(function(){path.style.strokeDasharray='';path.style.strokeDashoffset='';an.cancel();},function(){});
    }
    function flash(p){
      if(!canAnimate) return;
      var c=mk('circle',{cx:p[0],cy:p[1],r:3.2,'class':'flash'},marks);
      c.animate([{transform:'scale(1)',opacity:1},{transform:'scale(3.6)',opacity:0}],{duration:950,easing:'ease-out',fill:'forwards'}).finished.then(function(){c.remove();},function(){c.remove();});
    }
    var iP=P(0,PI), iM=P(0,-PI), i0=P(PI,0);
    [mk('path',{d:D([iM,iP]),'class':'edge'},edges),mk('path',{d:D([iM,i0]),'class':'edge'},edges),mk('path',{d:D([i0,iP]),'class':'edge scri'},edges)].forEach(function(e){draw(e,0);});
    function signal(R,T,delay,fromPastNull){
      var U=(T-R)/2, V=(T+R)/2, g=mk('g',{},rays);
      var inPts=[P(R,T),P(0,2*V),P(H-V,H+V)];
      draw(mk('path',{d:D(inPts),'class':'ray'},g),delay).then(function(){flash(inPts[2]);});
      if(!fromPastNull){
        var outPts=[P(R,T),P(H-U,H+U)];
        draw(mk('path',{d:D(outPts),'class':'ray'},g),delay).then(function(){flash(outPts[1]);});
        var o=P(R,T); mk('circle',{cx:o[0],cy:o[1],r:2.8,'class':'emit'},marks);
        while(marks.querySelectorAll('.emit').length>6) marks.querySelector('.emit').remove();
      }
      while(rays.children.length>9) rays.firstElementChild.remove();
    }
    [-0.95,-0.22,0.52].forEach(function(v,k){signal(v+H,v-H,1300+k*650,true);});
    svg.addEventListener('click',function(e){
      var pt=svg.createSVGPoint(); pt.x=e.clientX; pt.y=e.clientY;
      var p=pt.matrixTransform(svg.getScreenCTM().inverse());
      var R=(p.x-X0)/S, T=(Y0-p.y)/S;
      if(R<0 && R>-0.12) R=0;
      if(R<0 || R+Math.abs(T)>=PI-0.03) return;
      signal(R,T,0,false);
    });
    document.getElementById('send').addEventListener('click',function(){
      var R=0.15+Math.random()*1.5, T=(Math.random()*2-1)*(PI-R-0.35)*0.85;
      signal(R,T,0,false);
    });
  }

  /* ---------- page start-up ---------- */
  if(document.body.getAttribute('data-page')==='home') initDiagram();
})();
