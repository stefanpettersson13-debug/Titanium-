/* Progressive enhancement: search first, reference information on demand. */
(()=>{'use strict';
function init(){
 const panel=document.querySelector('#fittings .pb37-atlas');
 if(!panel||panel.dataset.compactReady)return;
 const search=panel.querySelector('.pb41-search');
 const note=panel.querySelector(':scope > .note');
 const guide=panel.querySelector(':scope > .pb37-feature');
 if(!search)return;
 panel.dataset.compactReady='true';
 const heading=panel.querySelector(':scope > h2');
 if(heading)heading.insertAdjacentElement('afterend',search);
 if(note||guide){
  const details=document.createElement('details');details.className='pb-fitting-help';
  const summary=document.createElement('summary');summary.textContent='Guide: välj rätt Parker/Ermeto-koppling';
  const body=document.createElement('div');body.className='pb-fitting-help-body';
  if(note)body.append(note);
  if(guide)body.append(guide);
  details.append(summary,body);
  search.insertAdjacentElement('afterend',details);
 }
 const callout=panel.querySelector(':scope > .pb42-callout');if(callout)callout.remove();
 const builder=document.querySelector('#fittings .pb38-builder');
 if(builder&&!builder.closest('details')){
  const details=document.createElement('details');details.className='pb-fitting-help pb-fitting-builder';
  const summary=document.createElement('summary');summary.textContent='Bygg en koppling';
  builder.before(details);details.append(summary,builder);
 }
 const field=document.getElementById('pb37-search');
 if(field){
 field.placeholder='Sök GE, T-koppling, skärring…';
 const clear=document.createElement('button');clear.type='button';clear.className='pb-fitting-clear';clear.textContent='Rensa sökning';clear.hidden=!field.value;
 clear.addEventListener('click',()=>{field.value='';field.dispatchEvent(new Event('input',{bubbles:true}));field.focus()});
 field.addEventListener('input',()=>{clear.hidden=!field.value});
 field.after(clear);
 }
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();