/* My – PassBit 5.1. On-device assistant, no remote AI backend. */
(()=>{'use strict';
const panel=document.getElementById('my-panel'),toggle=document.getElementById('my-toggle'),close=document.getElementById('my-close'),feed=document.getElementById('my-feed'),input=document.getElementById('my-input'),form=document.getElementById('my-form'),chips=document.getElementById('my-suggestions');
if(!panel||!toggle)return;
const tools=[...document.querySelectorAll('.dashboard .dashbtn[data-go]')].map(button=>({id:button.dataset.go,name:(button.querySelector('strong')?.textContent||button.dataset.go).trim(),button}));
const norm=s=>String(s).toLocaleLowerCase('sv-SE').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,' ').trim();
const aliases={hydraulik:'hydraulics',hydraul:'hydraulics',koppling:'fittings',ermeto:'fittings',parker:'hydraulics',cylinder:'hydcyl',pump:'hydpump',ackumulator:'hydacc',tryckmatare:'hydraulics',flodesmatare:'hydraulics',flode:'hydraulics',slang:'hydraulics',ror:'hydpipe',pneumatik:'pneumatics',sensor:'cylinders',lager:'mechbearing',lagerlivslangd:'mechbearing',skruv:'screws',passning:'fits',tolerans:'fits',passbit:'blocks',sinus:'sin',slip:'grinding',slipskiva:'grindwheel',vibration:'servicevib',el:'electrical',motor:'elec3',kugg:'mechgear',rem:'belt',temperatur:'metrotemp',matosakerhet:'metrounc',robot:'abbrobot',cnc:'cncpro',projekt:'field',fat:'field',sat:'field'};
const answers=[
{terms:['bar','mpa','psi'],text:'1 bar = 0,1 MPa ≈ 14,504 psi. Tryckmätare visar oftast övertryck; ackumulatorberäkningar använder absoluttryck.'},
{terms:['hydraulisk effekt','effekt hydraulik','kw hydraulik'],text:'Hydraulisk effekt i kW = tryck (bar) × flöde (l/min) / 600. För verklig axeleffekt måste du även ta hänsyn till verkningsgrader.'},
{terms:['eo','24','ermeto'],text:'Parker EO använder en 24° tätningsgeometri. Kontrollera L/S-serie, rördiameter, material och rätt mutter/skärring. EO, JIC och ORFS får inte blandas bara för att gängor verkar passa.'},
{terms:['orfs'],text:'ORFS står för O-Ring Face Seal och tätar med O-ring mot en plan tätningsyta. Kontrollera O-ring, gängstorlek, anslutning och tryckklass.'},
{terms:['jic'],text:'JIC använder 37° kona. Det är inte samma tätningsgeometri som EO 24°. Välj anslutning efter båda sidornas specifikation.'},
{terms:['l min','liter per minut'],text:'1 l/min = 1/60 000 m³/s. Rörhastighet = volymflöde / rörets fria tvärsnittsarea.'},
{terms:['tryckfall'],text:'Tryckfall Δp beror på flöde, rördiameter, längd, viskositet och lokala motstånd. Mät gärna före och efter filter eller strypning.'},
{terms:['l10'],text:'L10 är nominell statistisk lagerlivslängd, normalt uttryckt vid 90 % överlevnad enligt grundmodellen. Smörjning, renhet och lastvariation påverkar verklig livslängd.'},
{terms:['sinuslinjal'],text:'För en sinuslinjal: passbitshöjd h = L × sin(vinkel). Exempel: L = 100 mm och 5° ger ungefär 8,716 mm.'},
{terms:['sakerhet','lackage','injektion'],text:'Hydraulolja under tryck kan tränga in under huden. Sök aldrig läckage med handen. Avlasta tryck och säkra laster innan demontering.'}
];
let greeted=false;
function bubble(text,who='my'){const b=document.createElement('div');b.className='my-bubble '+who;b.textContent=text;feed.append(b);feed.scrollTop=feed.scrollHeight;return b}
function action(label,fn){const b=document.createElement('button');b.type='button';b.className='my-action';b.textContent=label;b.addEventListener('click',fn);feed.append(b);feed.scrollTop=feed.scrollHeight}
function openTool(t){panel.hidden=true;toggle.setAttribute('aria-expanded','false');t.button.click()}
function matchTools(q){const n=norm(q),words=n.split(' ').filter(w=>w.length>2),scores=tools.map(t=>{const title=norm(t.name+' '+t.id);let score=title.includes(n)&&n.length>2?20:0;for(const word of words){if(title.includes(word))score+=3;for(const [alias,id] of Object.entries(aliases))if((word===alias||word.startsWith(alias)&&alias.length>4)&&t.id===id)score+=12}return{...t,score}});return scores.filter(t=>t.score>0).sort((a,b)=>b.score-a.score).slice(0,4)}

/* My 6.0 – deterministic offline engineering calculator, conversions and reference. */
const MY_UNITS={
 length:{mm:0.001,cm:0.01,m:1,km:1000,um:1e-6,'µm':1e-6,'μm':1e-6,in:0.0254,inch:0.0254,tum:0.0254,ft:0.3048,feet:0.3048,yd:0.9144,mil:1609.344},
 area:{'mm2':1e-6,'cm2':1e-4,'m2':1,'in2':0.00064516,'ft2':0.09290304},
 volume:{ml:0.001,cl:0.01,dl:0.1,l:1,liter:1,'cm3':0.001,'mm3':1e-6,'m3':1000,gal:3.785411784},
 mass:{mg:1e-6,g:0.001,kg:1,ton:1000,lb:0.45359237,oz:0.028349523125},
 pressure:{pa:1,kpa:1000,mpa:1e6,bar:1e5,mbar:100,psi:6894.757293,atm:101325},
 force:{n:1,kn:1000,mn:1e6,lbf:4.448221615},
 torque:{nm:1,'nmm':0.001,'knm':1000,'lbft':1.355817948,'ftlb':1.355817948},
 power:{w:1,kw:1000,mw:1e6,hk:735.49875,hp:745.699872},
 energy:{j:1,kj:1000,mj:1e6,wh:3600,kwh:3.6e6},
 speed:{'m/s':1,'m/min':1/60,'km/h':1/3.6,'mph':0.44704,'ft/min':0.00508,'mm/s':0.001},
 flow:{'l/min':1,'l/s':60,'m3/h':1000/60,'m3/s':60000,'gpm':3.785411784},
 angle:{grad:1,grader:1,'°':1,rad:180/Math.PI},
 time:{ms:0.001,s:1,sek:1,min:60,h:3600,timme:3600,dygn:86400},
 frequency:{hz:1,khz:1000,rpm:1/60,'varv/min':1/60}
};
const myFormat=n=>Number(n).toLocaleString('sv-SE',{maximumFractionDigits:8});
const myUnit=s=>String(s).toLowerCase().replace(/\s+/g,'').replace(/²/g,'2').replace(/³/g,'3').replace(/μ/g,'µ').replace(/liter\/min/g,'l/min').replace(/lpm/g,'l/min').replace(/nm\b/g,'nm');
function myConvert(v,a,b){
 a=myUnit(a);b=myUnit(b);
 if(['c','°c','celsius','f','°f','fahrenheit','k','kelvin'].includes(a)&&['c','°c','celsius','f','°f','fahrenheit','k','kelvin'].includes(b)){
 const k=['c','°c','celsius'].includes(a)?v+273.15:['f','°f','fahrenheit'].includes(a)?(v-32)*5/9+273.15:v;
 return ['c','°c','celsius'].includes(b)?k-273.15:['f','°f','fahrenheit'].includes(b)?(k-273.15)*9/5+32:k;
 }
 for(const group of Object.values(MY_UNITS))if(a in group&&b in group)return v*group[a]/group[b];
 return null;
}
function myMath(expr){
 const t=expr.replace(/,/g,'.').replace(/×/g,'*').replace(/÷/g,'/').replace(/−/g,'-').replace(/\^/g,'^').replace(/π/gi,'pi').replace(/\s+/g,'').toLowerCase();
 if(t.length>150)return null;
 const tokens=t.match(/(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?|pi|sqrt|sin|cos|tan|abs|log|ln|[()+*/%^,-]/g);
 if(!tokens||tokens.join('')!==t)return null;
 let i=0,depth=0;const next=()=>tokens[i];
 function primary(){if(++depth>35)throw Error('depth');let v,tk=tokens[i++];if(tk==='-')v=-primary();else if(tk==='+')v=primary();else if(tk==='('){v=add();if(tokens[i++]!==')')throw Error(')');}else if(tk==='pi')v=Math.PI;else if(['sqrt','sin','cos','tan','abs','log','ln'].includes(tk)){if(tokens[i++]!=='(')throw Error('(');const n=add();if(tokens[i++]!==')')throw Error(')');v=({sqrt:Math.sqrt,sin:x=>Math.sin(x*Math.PI/180),cos:x=>Math.cos(x*Math.PI/180),tan:x=>Math.tan(x*Math.PI/180),abs:Math.abs,log:Math.log10,ln:Math.log})[tk](n);}else if(tk&&/^(?:\d|\.)/.test(tk))v=Number(tk);else throw Error('token');depth--;return v}
 function power(){let v=primary();if(next()==='^'){i++;v=Math.pow(v,power())}return v}
 function mul(){let v=power();while(['*','/','%'].includes(next())){let op=tokens[i++],n=power();v=op==='*'?v*n:op==='/'?v/n:v%n}return v}
 function add(){let v=mul();while(['+','-'].includes(next())){let op=tokens[i++],n=mul();v=op==='+'?v+n:v-n}return v}
 try{const result=add();return i===tokens.length&&Number.isFinite(result)?result:null}catch{return null}
}
const MY_KNOWLEDGE=[
 {terms:['matosakerhet','mat osakerhet','uncertainty'],text:'Mätosäkerhet beskriver spridningen hos rimliga mätvärden. Kombinera oberoende standardosäkerheter med kvadratsumman u_c = √(Σuᵢ²); utvidgad osäkerhet U = k·u_c (ofta k≈2). Rapportera mätvärde ± U och täckningsfaktor. Kalibrering och spårbarhet är inte samma sak som noggrannhet.'},
 {terms:['h7','h6','passning','tolerans'],text:'ISO 286 använder bokstav för toleransläget och siffra för toleransgrad (IT). H-hål har nedre avvikelse 0; h-axel har övre avvikelse 0. Exakta gränsmått kräver nominell diameter och rätt ISO 286-tabell. H7 är alltså inte en konstant tolerans i mm.'},
 {terms:['ra','rz','ytfinhet','ytjamnhet'],text:'Ra är aritmetiskt medelvärde av profilens absoluta avvikelser. Rz beskriver profilhöjd enligt tillämplig standard. Ra kan inte entydigt räknas om till Rz; mätmetod, filter, utvärderingslängd och standard måste anges.'},
 {terms:['mikrometer','skjutmatt','indikatorklocka'],text:'Kontrollera nollpunkt, temperatur, mätkraft, renhet och kalibreringsstatus. För precisionsmått gäller normalt referenstemperatur 20 °C. Undvik att värma arbetsstycket med händerna före finmätning.'},
 {terms:['sinuslinjal','sinus lineal'],text:'Sinuslinjal: h = L·sin(α), där L är centrumavstånd mellan rullarna. Exempel L=100 mm, α=5° ger h=8,7156 mm. Ange gärna “sinus 100 mm 5 grader”.'},
 {terms:['lagerlivslangd','l10','kullager'],text:'Grundläggande nominell lagerlivslängd: L10 = (C/P)^p miljoner varv, där p=3 för kullager och p=10/3 för rullager. L10h = 10⁶·(C/P)^p/(60·n). Beräkningen kräver dynamiskt bärighetstal C, ekvivalent last P och varvtal n.'},
 {terms:['slipbranning','slipskiva','slipning'],text:'Vid slipning påverkar skivspecifikation, dressning, periferihastighet, matning, kylning och material risken för slipbränning. Kontrollera skivans märkta maxhastighet och maskinens skydd; överskrid aldrig tillverkarens gräns.'},
 {terms:['fat','sat','acceptanstest'],text:'FAT (Factory Acceptance Test) utförs före leverans; SAT (Site Acceptance Test) efter installation hos kund. Dokumentera krav, provmetod, acceptanskriterier, mätresultat, avvikelser och signaturer.'},
 {terms:['cmm','koordinatmatmaskin','form och lage','gd&t'],text:'Form- och lägetoleranser enligt ISO GPS kräver rätt referenser, toleranszon och mätstrategi. CMM-resultat påverkas av fixturering, probkalibrering, temperatur och utvärderingsmetod.'},
 {terms:['momentdragning','atdragningsmoment'],text:'Åtdragningsmoment ger inte entydig klämkraft: friktion i gänga och under skalle dominerar osäkerheten. Följ alltid tillverkarens moment, smörjning och åtdragningsföljd.'},
 {terms:['reynolds','laminar','turbulent'],text:'Reynoldstal Re = ρ·v·D/μ = v·D/ν. I raka rör är laminär strömning ofta Re < 2300 och turbulent oftast Re > 4000; övergångsområdet är osäkert.'},
 {terms:['plc','felsokning','givare','sensor'],text:'Felsök systematiskt: dokumentera felbild, kontrollera matning och säkra kretsar, läs larm/loggar, verifiera I/O och signalnivåer, jämför mot schema och prova en ändring åt gången. Bryt och lås energi före ingrepp.'}
];
function myEngineering(raw){
 const q=norm(raw),rawLower=raw.toLowerCase(),number=s=>Number(s.replace(',','.'));
 const conv=rawLower.match(/(-?\d+(?:[.,]\d+)?)\s*([a-zµμ°/²³0-9]+)\s+(?:till|i|to|=)\s*([a-zµμ°/²³0-9]+)/i);
 if(conv){const result=myConvert(number(conv[1]),conv[2],conv[3]);if(result!==null&&Number.isFinite(result))return myFormat(number(conv[1]))+' '+conv[2]+' = '+myFormat(result)+' '+conv[3]+'.'}
 const sin=rawLower.match(/sinus(?:linjal)?\s*(?:på|med|längd|=)?\s*(\d+(?:[.,]\d+)?)\s*mm.{0,35}?(\d+(?:[.,]\d+)?)\s*(?:grader|grad|°)/);
 if(sin){const l=number(sin[1]),deg=number(sin[2]);return 'Passbitshöjd h = L × sin(α) = '+myFormat(l*Math.sin(deg*Math.PI/180))+' mm (L='+myFormat(l)+' mm, α='+myFormat(deg)+'°).'}
 const p=rawLower.match(/(\d+(?:[.,]\d+)?)\s*bar/),f=rawLower.match(/(\d+(?:[.,]\d+)?)\s*(?:l\s*\/\s*min|lpm|liter\s*per\s*minut)/);
 if(p&&f){const bar=number(p[1]),flow=number(f[1]);return 'Teoretisk hydraulisk effekt: P = p × Q / 600 = '+myFormat(bar*flow/600)+' kW ('+myFormat(bar)+' bar, '+myFormat(flow)+' l/min). Verklig axeleffekt kräver hänsyn till total verkningsgrad.'}
 const rpm=rawLower.match(/(\d+(?:[.,]\d+)?)\s*(?:rpm|varv\/min)/),dia=rawLower.match(/(\d+(?:[.,]\d+)?)\s*mm/);
 if(rpm&&dia&&/(sk[aä]r|periferihastighet|slip|varvtal|vc)/i.test(rawLower)){const n=number(rpm[1]),d=number(dia[1]);return 'Periferihastighet v = π × D × n / 60000 = '+myFormat(Math.PI*d*n/60000)+' m/s, där D='+myFormat(d)+' mm och n='+myFormat(n)+' rpm. Kontrollera verktygets högsta tillåtna hastighet.'}
 const calc=rawLower.replace(/^(?:räkna\s*(?:ut)?|beräkna|vad är|hur mycket är|miniräknare|calc)\s*[:=]?\s*/,'').trim();
 if(/^[\d.,+\-*/%^()×÷−π\s]+$/.test(calc)&&/[+\-*/%^×÷]/.test(calc)){const value=myMath(calc);if(value!==null)return calc+' = '+myFormat(value);}
 if(/^(?:sqrt|sin|cos|tan|abs|log|ln)\s*\(/i.test(calc)){const value=myMath(calc);if(value!==null)return calc+' = '+myFormat(value)+' (trigonometri i grader).'}
 const found=MY_KNOWLEDGE.find(x=>x.terms.some(t=>q.includes(norm(t))));if(found)return found.text;
 if(/(konvertera|omvandla|enheter|alla enheter)/.test(q))return 'Jag kan omvandla längd, area, volym, massa, tryck, kraft, moment, effekt, energi, hastighet, flöde, temperatur, vinkel, tid och frekvens. Skriv t.ex. “25,4 mm till tum”, “120 psi till bar”, “10 l/min till m3/h” eller “20 c till f”.';
 if(/(miniraknare|rakna ut|matte|kalkylator)/.test(q))return 'Miniräknaren klarar + − × ÷, parenteser, potenser (^), sqrt(), sin(), cos(), tan(), log(), ln() och pi. Skriv t.ex. “(125,4+32)/2” eller “sqrt(144)+2^3”. Trigonometriska vinklar anges i grader.';
 return null;
}

function reply(raw){
const q=norm(raw);if(!q)return;
const engineering=myEngineering(raw);if(engineering){bubble(raw,'user');bubble(engineering);return}
bubble(raw,'user');
if(/^(hej|hejsan|tjena|hall[aå]|vem ar du)/.test(q)){bubble('Hej! Jag är My 🌸 Din lilla verkstadskompis. Jag hjälper dig att hitta verktyg, förstå teknik och komma igång med beräkningar. Vad jobbar du med?');return}
if(/(vad kan du|hjalp|funktioner)/.test(q)){bubble('Jag kan guida dig till rätt blad, förklara hydraulik, mätteknik och maskinteknik samt visa formler och begrepp. Jag har en inbyggd miniräknare, enhetsomvandlingar och tekniska formler offline. För öppna specialistfrågor kan AI-läget användas om en egen AI-server ansluts.');action('Visa hydraulik',()=>{const t=tools.find(x=>x.id==='hydraulics');if(t)openTool(t)});return}
const barValue=q.match(/(\d+(?:[.,]\d+)?)\s*bar\b/),flowValue=q.match(/(\d+(?:[.,]\d+)?)\s*(?:l\s*\/\s*min|liter\s*(?:per|\/)\s*minut)/);
if(barValue&&flowValue){const p=Number(barValue[1].replace(',','.')),f=Number(flowValue[1].replace(',','.'));bubble('Med '+p.toLocaleString('sv-SE')+' bar och '+f.toLocaleString('sv-SE')+' l/min blir den teoretiska hydrauliska effekten '+(p*f/600).toLocaleString('sv-SE',{maximumFractionDigits:3})+' kW. Formeln är p × Q / 600. Pumpens verkliga axeleffekt blir högre på grund av förluster.');const t=tools.find(x=>x.id==='hydpump');if(t)action('↗ Öppna Hydraulpump',()=>openTool(t));return}
const sin=q.match(/(\d+(?:[.,]\d+)?)\s*(?:mm)?\s*(?:sinuslinjal|sinuslinjalen).*?(\d+(?:[.,]\d+)?)\s*(?:grader|grad|°)/);
if(sin){const length=Number(sin[1].replace(',','.')),degrees=Number(sin[2].replace(',','.'));bubble('Passbitshöjd = '+(length*Math.sin(degrees*Math.PI/180)).toLocaleString('sv-SE',{maximumFractionDigits:4})+' mm för '+length+' mm sinuslinjal vid '+degrees+'°.');return}
if(/(rakna|berakna|hur mycket|hur manga)/.test(q)&&q.includes('bar')&&q.includes('l min')){bubble('Hydraulisk effekt: P (kW) = p (bar) × Q (l/min) / 600. Öppna Hydraulpump eller Hydraulik för att ange dina värden.')}
else{const found=answers.find(a=>a.terms.some(t=>q.includes(norm(t))));if(found)bubble(found.text)}
const matches=matchTools(q);
if(matches.length){bubble('Jag hittade verktyg som kan passa:');matches.forEach(t=>action('↗ '+t.name,()=>openTool(t)))}
else if(!answers.some(a=>a.terms.some(t=>q.includes(norm(t))))){bubble('Min lokala kunskapsbank har inte ett säkert svar på just den frågan. Prova ett teknikord, till exempel ”ORFS”, ”tryckfall”, ”lager” eller ”sinuslinjal”. Du kan också söka bland alla verktyg på startsidan.')}
}
function show(){panel.hidden=false;toggle.setAttribute('aria-expanded','true');if(!greeted){bubble('Hej! Jag heter My 🌸 Jag kan hjälpa dig hitta rätt verktyg och förklara tekniska begrepp. Vad behöver du hjälp med?');greeted=true}input.focus()}
function hide(){panel.hidden=true;toggle.setAttribute('aria-expanded','false');toggle.focus()}
toggle.addEventListener('click',()=>panel.hidden?show():hide());
close.addEventListener('click',hide);
form.addEventListener('submit',e=>{e.preventDefault();const value=input.value.trim();if(!value)return;input.value='';reply(value)});
chips.querySelectorAll('[data-my-question]').forEach(b=>b.addEventListener('click',()=>reply(b.dataset.myQuestion)));
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!panel.hidden)hide()});

/* Optional remote AI, user-configured server endpoint only. */
const mode=document.getElementById('my-mode'),settings=document.getElementById('my-settings'),settingsPanel=document.getElementById('my-settings-panel'),endpoint=document.getElementById('my-endpoint'),saveEndpoint=document.getElementById('my-save-endpoint'),status=document.getElementById('my-status'),clear=document.getElementById('my-clear');
const history=[];
const endpointKey='passbit.my.endpoint';
let pending=false;
try{endpoint.value=localStorage.getItem(endpointKey)||''}catch(e){}
function endpointValid(url){try{const u=new URL(url);return u.protocol==='https:'&&!u.username&&!u.password&&!u.hash&&!u.search&&u.hostname.length>3}catch{return false}}
function setStatus(){const ai=mode.value==='ai';status.textContent=ai?(endpointValid(endpoint.value.trim())?'AI-läge · egen server':'AI-läge · serveradress saknas'):'Lokal guide · fungerar offline';status.dataset.mode=ai?'ai':'local'}
mode.addEventListener('change',()=>{setStatus();bubble(mode.value==='ai'?'AI-läge valt. Meddelanden skickas till din konfigurerade server när du trycker Skicka.':'Lokal guide aktiverad. Inga frågor skickas till en AI-server.')});
settings.addEventListener('click',()=>{settingsPanel.hidden=!settingsPanel.hidden;settings.setAttribute('aria-expanded',String(!settingsPanel.hidden))});
saveEndpoint.addEventListener('click',()=>{const url=endpoint.value.trim();if(url&&!endpointValid(url)){bubble('Ange en giltig HTTPS-adress till din egen AI-proxy. Ange aldrig en API-nyckel här.');return}try{if(url)localStorage.setItem(endpointKey,url);else localStorage.removeItem(endpointKey)}catch(e){}settingsPanel.hidden=true;settings.setAttribute('aria-expanded','false');setStatus();bubble(url?'Serveradressen är sparad på den här enheten.':'Serveradressen har tagits bort.')});
clear.addEventListener('click',()=>{history.length=0;feed.replaceChildren();bubble('Ny konversation! 🌸 Vad vill du undersöka?')});
async function askAI(question){
if(pending)return;
const url=endpoint.value.trim();
if(!endpointValid(url)){bubble('För att använda AI-läget behöver du först ansluta en säker server. Tryck på kugghjulet för att ange HTTPS-adressen. Ingen API-nyckel ska skrivas in i appen.');settingsPanel.hidden=false;return}
bubble(question,'user');
history.push({role:'user',content:question.slice(0,1200)});
if(history.length>12)history.splice(0,history.length-12);
pending=true;const button=form.querySelector('button[type="submit"]');button.disabled=true;button.textContent='Tänker…';
const wait=bubble('My funderar… ✨');
const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),20000);
try{
const response=await fetch(url,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({messages:history}),signal:controller.signal,mode:'cors',credentials:'omit'});
if(!response.ok)throw Error('Servern svarade med HTTP '+response.status);
const data=await response.json();
if(typeof data.answer!=='string'||!data.answer.trim())throw Error('Tomt svar');
wait.remove();bubble(data.answer.slice(0,4500));history.push({role:'assistant',content:data.answer.slice(0,1200)});
}catch(e){wait.remove();bubble('Jag kunde inte nå AI-servern just nu ('+(e.name==='AbortError'?'tidsgräns':e.message)+'). Kontrollera anslutningen eller välj Lokal guide.');history.pop()}
finally{clearTimeout(timer);pending=false;button.disabled=false;button.textContent='Skicka'}
}
form.addEventListener('submit',e=>{if(mode.value!=='ai')return;e.stopImmediatePropagation();e.preventDefault();const value=input.value.trim();if(!value||pending)return;input.value='';askAI(value)},true);
chips.querySelectorAll('[data-my-question]').forEach(b=>b.addEventListener('click',e=>{if(mode.value!=='ai')return;e.stopImmediatePropagation();askAI(b.dataset.myQuestion)},true));
setStatus();

window.passbitMy={open:show,ask:reply,calculate:myMath,convert:myConvert};
})();