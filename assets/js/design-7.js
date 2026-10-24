(()=>{'use strict';
document.title='PassBit Titanium 7.0 · Precision Engineering';
const header=document.querySelector('main > header'),toolbar=document.getElementById('toolBar'),title=document.getElementById('currentTool'),status=document.getElementById('utilityStatus');
if(header&&toolbar)header.after(toolbar,...[title,status].filter(Boolean));
const descriptions={workshop:'Beräkningar, maskiner och montage',grinding:'Slipdata, process och felsökning',metrology:'Mått, passningar och kontroll',advanced:'Hydraulik, pneumatik och automation',projects:'Kundjobb, mätprotokoll och FAT/SAT'};
document.querySelectorAll('.pb-category-card[data-category]').forEach(card=>{const p=document.createElement('span');p.className='pb-category-description';p.textContent=descriptions[card.dataset.category]||'';card.append(p)});
const shortcuts=document.createElement('div');shortcuts.className='pb7-shortcuts';shortcuts.setAttribute('aria-label','Snabbvägar');
for(const [id,label] of [['skf','◎ SKF-lager'],['oils','◈ Oljor & smörjning'],['sin','∠ Sinuslinjal']]){
 const b=document.createElement('button');b.type='button';b.textContent=label;b.addEventListener('click',()=>{window.passbitLastCategory=window.passbitCategoryForTool?.(id)||'workshop';document.querySelector('.dashboard [data-go="'+id+'"]')?.click()});shortcuts.append(b)
}
document.getElementById('pb5-command')?.after(shortcuts);
const settings=document.querySelector('#settingsPanel .settings-panel'),edition=document.getElementById('editionPanel');
if(settings&&edition){const label=document.createElement('h3');label.textContent='Testläge & utgåva';settings.append(label,edition)}
})();