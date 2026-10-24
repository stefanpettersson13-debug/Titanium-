/* SKF reference blade: offline content shared with My. */
(()=>{'use strict';
const section=document.getElementById('skf');
const library=window.PassbitMyKnowledge;
if(!section||!library)return;
const $=id=>section.querySelector('#'+id);
const normalized=s=>s.toLocaleLowerCase('sv-SE').normalize('NFD').replace(/[\u0300-\u036f]/g,'');
const typeList=$('skf-types'),suffixList=$('skf-suffixes'),search=$('skf-search'),count=$('skf-count');
const pictures=[{"id":"dgbb","title":"Spårkullager","source":"https://www.sevenelectricals.com/product-page/skf-6205-deep-groove-ball-bearing"},{"id":"acbb","title":"Vinkelkontaktkullager","source":"https://compraco.com.br/en/blogs/industria/qual-e-a-sigla-bep-em-rolamentos-skf"},{"id":"selfball","title":"Självinställande kullager","source":"https://www.fg.com.br/rolamento-autocompensador-esfera-1205-ektn9---skf/p"},{"id":"crb","title":"Cylindriskt rullager","source":"https://www.shbenzc.com/skf_yzgzzc/178603.html"},{"id":"srb","title":"Sfäriskt rullager","source":"https://bamboostore.vn/skf-22210-e-ek-e-c3-ek-c3-spherical-roller-bearing-vong-bi-tang-trong-hai-day-tu-lua-d50xd90xb23-mm-xuat-xu-eu-g7"},{"id":"trb","title":"Koniskt rullager","source":"https://indauto.net/tienda/rodamientos-de-rodillos/717-rodamiento-rodillos-conicos-30205-25x52x15.html"},{"id":"needle","title":"Nållager","source":"https://www.monotaro.id/s017175357.html"},{"id":"carb","title":"CARB toroidalt rullager","source":"https://www.klium.be/nl/skf-c-2208-tn9-carb-eenrijige-toroidale-rollager-cilindrisch-40-x-80-x-23-mm-123147"},{"id":"thrustball","title":"Axialkullager","source":"https://simmering.pl/en/thrust-ball-bearings/103695-thrust-ball-bearing-51105-skf-25x42x11.html"},{"id":"thrustroller","title":"Sfäriskt axialrullager","source":"https://www.lily-bearing.com/products/29424-e/"},{"id":"qj","title":"Fyrpunktskontaktkullager","source":"https://loja.abecom.com.br/rolamento-esferas-quatro-pontos-de-contato-skf-qj-248-n2ma-c3"},{"id":"insert","title":"Insatslager / Y-lager","source":"https://tienda.lugohermanos.com/producto/chumaceras/skf/rodamiento-tipo-y/id/38350"}];
function render(){
 const q=normalized(search.value.trim());typeList.replaceChildren();suffixList.replaceChildren();
 let total=0;
 for(const [index,[terms,title,body]] of library.types.entries()){
  if(q&&!normalized(title+' '+body+' '+terms).includes(q))continue;
  const card=document.createElement('details');card.className='skf-card';
  const summary=document.createElement('summary');
  const picture=pictures[index],img=document.createElement('img');img.src='assets/images/bearings/'+picture.id+'.svg';img.alt='SKF '+picture.title+' – exempel på utförande';img.loading='lazy';img.width=600;img.height=450;img.className='skf-product-image';
  const label=document.createElement('span');label.className='skf-product-name';label.textContent=title;
  const hint=document.createElement('small');hint.textContent='Visa uppbyggnad & egenskaper';hint.className='skf-product-hint';summary.append(img,label,hint);
  const text=document.createElement('p');text.textContent=body;
  const caption=document.createElement('p');caption.className='fine skf-image-credit';
  caption.append(document.createTextNode('Bilden visar ett exempel: '+picture.title+'. '));
  const source=document.createElement('a');source.href=picture.source;source.target='_blank';source.rel='noopener noreferrer';source.textContent='Bildkälla';caption.append(source);
  card.append(summary,text,caption);typeList.append(card);total++;
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
const comparison=document.querySelector('#skf-pane-compare');
if(comparison){const gallery=document.createElement('div');gallery.className='skf-compare-gallery';for(const i of [3,4,5]){const p=pictures[i],figure=document.createElement('figure'),img=document.createElement('img'),caption=document.createElement('figcaption');img.src='assets/images/bearings/'+p.id+'.svg';img.alt=p.title;img.loading='lazy';img.width=600;img.height=450;caption.textContent=p.title;figure.append(img,caption);gallery.append(figure)}comparison.prepend(gallery)}
render();
})();