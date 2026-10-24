/* SKF reference blade: offline content shared with My. */
(()=>{'use strict';
const section=document.getElementById('skf');
const library=window.PassbitMyKnowledge;
if(!section||!library)return;
const $=id=>section.querySelector('#'+id);
const normalized=s=>s.toLocaleLowerCase('sv-SE').normalize('NFD').replace(/[\u0300-\u036f]/g,'');
const typeList=$('skf-types'),suffixList=$('skf-suffixes'),search=$('skf-search'),count=$('skf-count');
function render(){
 const q=normalized(search.value.trim());typeList.replaceChildren();suffixList.replaceChildren();
 let total=0;
 for(const [terms,title,body] of library.types){
  if(q&&!normalized(title+' '+body+' '+terms).includes(q))continue;
  const card=document.createElement('details');card.className='skf-card';
  const summary=document.createElement('summary');summary.textContent=title;
  const text=document.createElement('p');text.textContent=body;
  card.append(summary,text);typeList.append(card);total++;
 }
 for(const [title,body] of library.suffix){
  if(q&&!normalized(title+' '+body).includes(q))continue;
  const card=document.createElement('div');card.className='skf-suffix';
  const name=document.createElement('strong'),text=document.createElement('p');
  name.textContent=title;text.textContent=body;card.append(name,text);suffixList.append(card);
 }
 count.textContent=total+' lagertyper'+(q?' matchar sökningen':' i biblioteket');
 if(!total){const p=document.createElement('p');p.textContent='Ingen lagertyp hittades. Prova CRB, SRB, TRB eller kullager.';typeList.append(p)}
 if(!suffixList.children.length){const p=document.createElement('p');p.textContent='Ingen beteckning hittades. Prova C3, 2Z eller W33.';suffixList.append(p)}
}
search.addEventListener('input',render);
$('skf-clear').addEventListener('click',()=>{search.value='';render();search.focus()});
section.querySelectorAll('[data-skf-tab]').forEach(button=>button.addEventListener('click',()=>{
 const target=button.dataset.skfTab;
 section.querySelectorAll('[data-skf-tab]').forEach(b=>{b.setAttribute('aria-selected',String(b===button));b.tabIndex=b===button?0:-1});
 section.querySelectorAll('[data-skf-pane]').forEach(p=>p.hidden=p.dataset.skfPane!==target);
}));
const tabs=[...section.querySelectorAll('[data-skf-tab]')];
tabs.forEach((tab,index)=>{
 tab.tabIndex=index===0?0:-1;
 tab.addEventListener('keydown',e=>{
  if(!['ArrowLeft','ArrowRight','Home','End'].includes(e.key))return;
  e.preventDefault();
  const next=e.key==='Home'?0:e.key==='End'?tabs.length-1:(index+(e.key==='ArrowRight'?1:-1)+tabs.length)%tabs.length;
  tabs[next].click();tabs[next].focus();
 });
});
$('skf-l10').addEventListener('click',()=>document.querySelector('.dashboard [data-go="mechbearing"]')?.click());
$('skf-my').addEventListener('click',()=>{window.passbitMy?.open();window.passbitMy?.ask('Skillnad CRB SRB TRB')});
render();
})();