(()=>{'use strict';
const root=document.getElementById('oils');if(!root)return;
const search=root.querySelector('#oil-search'),cards=[...root.querySelectorAll('[data-oil-category]')],filters=[...root.querySelectorAll('[data-oil-filter]')];
const norm=s=>s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
let category='all';
function render(){const words=norm(search.value.trim()).split(/\s+/).filter(Boolean);let count=0;cards.forEach(card=>{const show=(category==='all'||card.dataset.oilCategory===category)&&words.every(word=>norm(card.textContent).includes(word));card.hidden=!show;if(show)count++});root.querySelector('#oil-count').textContent=count+' av '+cards.length+' ämnen';root.querySelector('#oil-empty').hidden=count!==0}
filters.forEach(button=>button.addEventListener('click',()=>{category=button.dataset.oilFilter;filters.forEach(b=>b.setAttribute('aria-pressed',String(b===button)));render()}));
search.addEventListener('input',render);
const vg=root.querySelector('#oil-vg');
function showGrade(){const n=Number(vg.value),fmt=v=>v.toLocaleString('sv-SE',{maximumFractionDigits:1});root.querySelector('#oil-vg-result').textContent='ISO VG '+n+': '+fmt(n*.9)+'–'+fmt(n*1.1)+' mm²/s (cSt) vid 40 °C.'}
vg.addEventListener('change',showGrade);showGrade();render();
})();