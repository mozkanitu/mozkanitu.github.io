/* ======================================================================
   HOMEWORK LOCK for the FZT 203E simulations.

   Everything that would show an answer to Problem Set 1 stays hidden
   until the deadline below, then opens by itself. This is the only
   place the restrictions are defined; the pages ask GT_LOCK and never
   hard-code a date or a group.

   Deadline: Problem Set 1, due Wednesday 14 October 2026, 18:00
   Istanbul time (UTC+3, no daylight saving), i.e. 15:00 UTC.
   ====================================================================== */
(function(root,factory){
  var lock=factory();
  if(typeof module==='object'&&module.exports) module.exports=lock;
  else root.GT_LOCK=lock;
})(typeof self!=='undefined'?self:this,function(){
  var UNTIL=Date.UTC(2026,9,14,15,0,0);       // 2026-10-14T18:00:00+03:00

  // What stays hidden until UNTIL. Keys are what the pages ask for.
  var ITEMS={
    'group:D4':  'the dihedral group of the square (Subgroups and cosets)',
    'group:Z12': 'the cyclic group of order 12 (Subgroups and cosets)',
    'hom:4-6':   'homomorphisms from Z4 to Z6 (Homomorphism builder)',
    'hom:6-4':   'homomorphisms from Z6 to Z4 (Homomorphism builder)',
    'cayley:D2': 'Cayley permutations of the cuboid group (Multiplication-table builder)',
    'cayley:D4': 'Cayley permutations of the square group (Multiplication-table builder)'
  };

  function now(){return Date.now();}
  function isOpen(t){return (t===undefined?now():t)>=UNTIL;}
  function isLocked(key,t){return Object.prototype.hasOwnProperty.call(ITEMS,key)&&!isOpen(t);}
  // Calls fn once the lock lifts while the page is open (only when that is
  // less than 24 days away, the longest delay setTimeout can handle).
  function onOpen(fn){
    var wait=UNTIL-now();
    if(wait<=0||wait>2147483000) return;
    setTimeout(fn,wait+500);
  }
  return {
    until:UNTIL,
    when:'Wednesday 14 October at 18:00',
    reason:'Problem Set 1',
    message:'This opens after Problem Set 1 is due, on Wednesday 14 October at 18:00.',
    items:ITEMS,
    isOpen:isOpen,
    isLocked:isLocked,
    onOpen:onOpen
  };
});
