const deals=[
{id:"PB-001",market:"Rockford, IL",type:"Single Family",strategy:"Assumable FHA",ask:145000,value:158000,loan:136400,rate:3.125,rent:1550,repairs:7000,score:88,confidence:"Estimated",signals:["Low equity gap","Rate under 4%","Rentable market"]},
{id:"PB-002",market:"Chicago, IL",type:"2-Flat",strategy:"Seller Financing",ask:165000,value:205000,loan:null,rate:null,rent:2450,repairs:22000,score:84,confidence:"Unknown",signals:["Long-hold owner","2 units","Seller-finance candidate"]},
{id:"PB-003",market:"Gary, IN",type:"Single Family",strategy:"Distressed",ask:79000,value:128000,loan:61200,rate:null,rent:1350,repairs:28000,score:74,confidence:"Estimated",signals:["Large spread","Rehab required","Title check"]},
{id:"PB-004",market:"Marion, AR",type:"Land",strategy:"Land + Modular",ask:24900,value:null,loan:null,rate:null,rent:null,repairs:null,score:69,confidence:"Unknown",signals:["Utilities nearby","Modular candidate","Zoning verify"]},
{id:"PB-005",market:"Peoria, IL",type:"Duplex",strategy:"Seller Financing",ask:119000,value:154000,loan:67000,rate:null,rent:2100,repairs:12000,score:90,confidence:"Estimated",signals:["Strong rent ratio","Owner equity","2 units"]},
{id:"PB-006",market:"South Bend, IN",type:"Single Family",strategy:"Assumable FHA",ask:179900,value:190000,loan:167500,rate:3.5,rent:1750,repairs:5000,score:86,confidence:"Estimated",signals:["Low rate","Small equity gap","Light repairs"]}
];
const $=s=>document.querySelector(s), money=n=>n==null?"Unknown":new Intl.NumberFormat("en-US",{style:"currency",currency:"USD",maximumFractionDigits:0}).format(n);
let activeScreen="dashboard";
function activateScreen(name){
  const target=document.querySelector('[data-screen-id="'+name+'"]'); if(!target)return;
  document.querySelectorAll('.screen').forEach(el=>{el.classList.toggle('active',el===target);el.classList.remove('exit-left')});
  document.querySelectorAll('[data-screen]').forEach(el=>el.classList.toggle('active',el.dataset.screen===name));
  activeScreen=name;
  try{history.replaceState(null,"","#"+name)}catch{}
  target.scrollTop=0;
}
window.activateScreen=activateScreen;

const esc=v=>String(v??"").replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const safeUrl=v=>{try{const u=new URL(v);return u.protocol==='https:'?u.href:''}catch{return ''}};
const safePhoto=v=>safeUrl(v)||(/^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(v||'')?v:'');
const read=(k)=>{try{const v=JSON.parse(localStorage.getItem(k));return Array.isArray(v)?v:[]}catch{return[]}},write=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v));return true}catch{toast("Could not save: browser storage is full or unavailable. Export a backup and use a smaller photo.");return false}};
let saved=read("pbn_saved"),sellers=read("pbn_sellers"),buyers=read("pbn_buyers"),outreach=read("pbn_outreach"),watch=read("pbn_watch");

function toast(msg){const t=document.createElement("div");t.className="toast";t.textContent=msg;t.setAttribute("role","status");document.body.append(t);setTimeout(()=>t.remove(),2200)}
function filtered(){const q=$("#q").value.toLowerCase(),s=$("#strategy").value,t=$("#ptype").value;return deals.filter(d=>(!q||JSON.stringify(d).toLowerCase().includes(q))&&(!s||d.strategy===s)&&(!t||d.type===t)&&(!$("#savedOnly").checked||saved.includes(d.id)))}
function strategyClass(strategy){if(strategy.includes("Assumable"))return"assumable";if(strategy.includes("Seller"))return"seller";if(strategy.includes("Distressed"))return"distressed";if(strategy.includes("Land"))return"land";return"assumable"}
function renderDeals(){const rows=filtered();$("#resultCount").textContent=rows.length+" example"+(rows.length===1?"":"s");$("#dealGrid").innerHTML=rows.map(d=>`
<article class="deal"><div class="deal-top ${strategyClass(d.strategy)}"><div class="deal-art"><div class="mini-home"></div><div class="mini-city"><i></i><i></i><i></i><i></i></div></div><span class="deal-type">FICTIONAL EXAMPLE · ${d.strategy}</span><span class="deal-score">${d.score}</span></div><div class="deal-body"><h3>${money(d.ask)}</h3><div class="sub">${d.type} • ${d.market}</div><div class="rows"><div class="row"><span>Est. value</span><b>${money(d.value)}</b></div><div class="row"><span>Est. loan</span><b>${money(d.loan)}</b></div><div class="row"><span>Rate</span><b>${d.rate?d.rate+"%":"Unknown"}</b></div><div class="row"><span>Est. rent</span><b>${money(d.rent)}</b></div><div class="row"><span>Repairs</span><b>${money(d.repairs)}</b></div></div><div class="badges"><span class="badge ${d.confidence.toLowerCase()}">${d.confidence}</span>${d.signals.slice(0,2).map(x=>'<span class="signal">'+x+'</span>').join("")}</div><div class="actions"><button class="btn small" onclick="openDNA('${d.id}')">Property DNA</button><button class="btn small" aria-pressed="${saved.includes(d.id)}" onclick="saveDeal('${d.id}')">${saved.includes(d.id)?"Saved ✓":"Save"}</button><button class="btn small gold" onclick="queueOutreach('${d.id}')">Outreach Draft</button></div></div></article>`).join("")||"<p>No demo deals match.</p>"}
window.saveDeal=id=>{const next=saved.includes(id)?saved.filter(x=>x!==id):[...saved,id];if(!write("pbn_saved",next))return;saved=next;renderDeals();updateStats()};
window.queueOutreach=id=>{const d=deals.find(x=>x.id===id);const draft={id:"OUT-"+Date.now(),deal:id,market:d.market,status:"Draft",text:`Hello, I'm reaching out regarding a property opportunity in ${d.market}. I'm interested in learning whether the owner would consider a sale and whether flexible terms such as seller financing or an assumable loan may be available. No obligation—I'd simply like to understand the property and the owner's goals.`};if(!write("pbn_outreach",[...outreach,draft]))return;outreach.push(draft);renderOutreach();toast("Draft added — manual review required")};
window.openDNA=id=>{const d=deals.find(x=>x.id===id);$("#dnaAddress").value=d.market;$("#dnaResult").innerHTML=`<h4>${d.id} • ${d.market}</h4><div class="badges"><span class="badge estimated">ESTIMATED</span><span class="badge unknown">VERIFY TITLE / LOAN</span></div><div class="timeline"><div class="event"><b>History</b><span>Demo timeline placeholder for prior sale, refinance and listing events.</span></div><div class="event"><b>Equity</b><span>${d.loan&&d.value?money(d.value-d.loan)+" estimated gross equity":"Unknown until debt/value are verified"}.</span></div><div class="event"><b>Strategy</b><span>${d.strategy} is the current candidate path.</span></div></div><div class="signals">${d.signals.map(x=>'<span class="signal">'+x+'</span>').join("")}</div>`;activateScreen("analyzer")};

function analyzeDNA(){const address=$("#dnaAddress").value.trim();if(!address){toast("Enter an address");return}$("#dnaResult").innerHTML=`<h4>Property DNA request: ${esc(address)}</h4><div class="badges"><span class="badge unknown">LIVE DATA NOT CONNECTED</span></div><div class="timeline"><div class="event"><b>1</b><span>Ownership/deed history</span></div><div class="event"><b>2</b><span>Sales/listing history + price changes</span></div><div class="event"><b>3</b><span>Taxes, liens, mortgage indicators and distress</span></div><div class="event"><b>4</b><span>Zoning, permits, comps, rents and financing paths</span></div></div><p class="sub">This MVP shows the workflow only. Production APIs will populate verified and estimated fields separately.</p>`}

function scoreDeal(){
 const price=+$("#calcPrice").value||0,value=+$("#calcValue").value||0,loan=+$("#calcLoan").value||0,rent=+$("#calcRent").value||0,repairs=+$("#calcRepairs").value||0,monthly=+$("#calcMonthly").value||0;
 let score=50;
 if(value&&price){const discount=(value-price)/value;if(discount>.25)score+=18;else if(discount>.12)score+=10;else if(discount<0)score-=15}
 if(loan&&price){const gap=price-loan;if(gap<=10000)score+=12;else if(gap>30000)score-=7}
 if(rent&&monthly){const cushion=rent-monthly;if(cushion>500)score+=12;else if(cushion>200)score+=6;else if(cushion<0)score-=15}
 if(repairs&&value&&repairs/value>.3)score-=12;
 score=Math.max(0,Math.min(100,Math.round(score)));
 const path=loan&&price-loan<=15000?"Investigate assumption / low-equity purchase":value&&price<value*.75?"Investigate wholesale / value-add spread":rent&&monthly&&rent>monthly+300?"Investigate hold / rental financing":"Gather more verified data before choosing strategy";
 $("#scoreValue").textContent=score;$("#scoreRing").style.background=`conic-gradient(var(--green) 0deg ${score*3.6}deg,#17304a ${score*3.6}deg)`;$("#scoreSummary").innerHTML=`<b>${path}</b><p>Prototype score only. Verify title, debt, taxes, insurance, condition, rents, zoning and financing before committing funds.</p>`;
}


function leadScore(x){
  let score=50;
  const ask=+x.ask||0,value=+x.value||0,loan=+x.loan||0,rent=+x.rent||0,repairs=+x.repairs||0,rate=+x.rate||0;
  if(value&&ask){const discount=(value-ask)/value;if(discount>.25)score+=18;else if(discount>.12)score+=10;else if(discount<0)score-=15}
  if(loan&&ask){const gap=ask-loan;if(gap<=10000)score+=12;else if(gap<=20000)score+=6;else if(gap>40000)score-=6}
  if(rate&&rate<4)score+=10;
  if(rent&&ask&&rent/ask>.011)score+=8;
  if(repairs&&value&&repairs/value>.3)score-=10;
  return Math.max(0,Math.min(100,Math.round(score)));
}
function renderWatch(){
  const el=$("#watchList"); if(!el)return;
  el.innerHTML=watch.length?watch.slice().reverse().map((x,rev)=>{
    const idx=watch.length-1-rev,score=leadScore(x),gap=(+x.ask&&+x.loan)?(+x.ask-+x.loan):null;
    const url=safeUrl(x.listingUrl),photo=safePhoto(x.photo),label=esc(x.label||"Unlabeled"),status=esc(x.status||"New");
    const visual=photo?'<img class="listing-photo" loading="lazy" referrerpolicy="no-referrer" src="'+esc(photo)+'" alt="Property photo: '+esc(x.address)+'">':'<div class="photo-empty"><div><span>⌂</span>Property photo not added</div></div>';
    return '<div class="item watch-card">'+(url?'<a class="listing-visual" href="'+esc(url)+'" target="_blank" rel="noopener noreferrer">'+visual+'</a>':'<div class="listing-visual">'+visual+'</div>')+'<div class="watch-content"><strong>'+esc(x.address)+'</strong><small>'+esc(x.market)+' • '+esc(x.strategy)+'</small><div class="scoreline"><span>'+label+'</span><span>Score '+score+'/100</span><span>Ask '+money(x.ask===""?null:+x.ask)+'</span><span>'+(gap==null?"Equity gap unknown":"Gap "+money(gap))+'</span></div><div class="next">Next: '+esc(x.next)+'</div><div class="source">Source: '+esc(x.source||"not entered")+'</div>'+(url?'<a class="listing-link" href="'+esc(url)+'" target="_blank" rel="noopener noreferrer">View original ad ↗</a>':'<span class="sub">Original ad not linked</span>')+'<div class="watch-actions"><button class="btn small" onclick="loadWatchLead('+idx+')">Load Analyzer</button><button class="btn small" onclick="watchOutreach('+idx+')">Draft Outreach</button><select class="lead-status" aria-label="Property status" onchange="updateLeadStatus('+idx+',this.value)"><option'+(status==="New"?" selected":"")+'>New</option><option'+(status==="Researching"?" selected":"")+'>Researching</option><option'+(status==="Contacting"?" selected":"")+'>Contacting</option><option'+(status==="Analyzing"?" selected":"")+'>Analyzing</option><option'+(status==="Offer Candidate"?" selected":"")+'>Offer Candidate</option><option'+(status==="Hold"?" selected":"")+'>Hold</option></select><button class="btn small ghost" onclick="removeWatchLead('+idx+')">Archive</button></div></div></div>';
  }).join(""):"<div class='item'>No property leads yet. Add the first exact listing, seller lead or drive-by property.</div>";
}
window.updateLeadStatus=(idx,value)=>{if(!watch[idx])return;watch[idx].status=value;if(write("pbn_watch",watch)){renderWatch();toast("Property status updated")}};
window.loadWatchLead=idx=>{const x=watch[idx];if(!x)return;$("#calcPrice").value=x.ask||"";$("#calcValue").value=x.value||"";$("#calcLoan").value=x.loan||"";$("#calcRent").value=x.rent||"";$("#calcRepairs").value=x.repairs||"";$("#calcMonthly").value=x.monthly||"";$("#dnaAddress").value=x.address+", "+x.market;scoreDeal();activateScreen("analyzer");toast("Lead loaded into analyzer")};
window.watchOutreach=idx=>{const x=watch[idx];if(!x)return;const draft={id:"OUT-"+Date.now(),deal:x.address,market:x.market,status:"Draft",text:`Hello, I'm reaching out regarding ${x.address}. I'm interested in learning more about the property and the owner's goals. If appropriate, I'm open to discussing a straightforward purchase as well as flexible terms such as seller financing or an assumable loan. No obligation—I'd first like to verify the property details and see whether there may be a fit.`};if(!write("pbn_outreach",[...outreach,draft]))return;outreach.push(draft);renderOutreach();toast("Outreach draft created — review before sending")};
window.removeWatchLead=idx=>{const next=watch.filter((_,i)=>i!==idx);if(!write("pbn_watch",next))return;watch=next;renderWatch();toast("Lead archived from this device")};
function exportPropertyBridge(){
  const payload={exportedAt:new Date().toISOString(),version:"PROPERTYBridge-v2.1",watch,sellers,buyers,saved,outreach};
  const blob=new Blob([JSON.stringify(payload,null,2)],{type:"application/json"});
  const url=URL.createObjectURL(blob),a=document.createElement("a");a.href=url;a.download="PROPERTYBridge-backup-"+new Date().toISOString().slice(0,10)+".json";document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
}

function calcMatches(){let count=0;sellers.forEach(s=>buyers.forEach(b=>{const price=+s.price||Infinity,max=+b.max||0,market=(b.market||"").toLowerCase();if(price<=max&&(!market||(s.market||"").toLowerCase().includes(market)))count++}));return count}
function updateStats(){$("#savedCount").textContent=saved.length;$("#sellerCount").textContent=sellers.length;$("#buyerCount").textContent=buyers.length;$("#matchCount").textContent=calcMatches();$("#outreachCount").textContent=outreach.length}
function renderCRM(){$("#sellerList").innerHTML=sellers.length?sellers.slice(-6).reverse().map(s=>`<div class="item"><strong>${esc(s.address)}</strong><small>${esc(s.market)} • ${esc(s.need)} • ${money(s.price===""?null:+s.price)}</small></div>`).join(""):"<div class='item'>No seller leads yet.</div>";$("#buyerList").innerHTML=buyers.length?buyers.slice(-6).reverse().map(b=>`<div class="item"><strong>${esc(b.name)}</strong><small>${esc(b.market||"Any market")} • ${esc(b.strategy)} • max ${money(+b.max||0)}</small></div>`).join(""):"<div class='item'>No buyer profiles yet.</div>";$("#matchList").innerHTML=calcMatches()?sellers.flatMap(s=>buyers.filter(b=>(+s.price||Infinity)<=(+b.max||0)&&(!(b.market||"")||(s.market||"").toLowerCase().includes((b.market||"").toLowerCase()))).map(b=>`<div class="item match"><strong>${esc(s.address)} ↔ ${esc(b.name)}</strong><small>${esc(s.market)} • within buy box</small></div>`)).slice(0,8).join(""):"<div class='item'>No current matches.</div>"}
function renderOutreach(){$("#outreachList").innerHTML=outreach.length?outreach.slice(-5).reverse().map(o=>`<div class="item outreach"><strong>${esc(o.deal)} • ${esc(o.market)}</strong><small>${esc(o.status)} — manual review before sending</small><p class="sub">${esc(o.text)}</p></div>`).join(""):"<div class='item'>No outreach drafts yet.</div>";updateStats()}
function wireForms(){
 $("#sellerForm").onsubmit=e=>{e.preventDefault();const d=Object.fromEntries(new FormData(e.currentTarget));if(!write("pbn_sellers",[...sellers,d]))return;sellers.push(d);e.currentTarget.reset();renderCRM();updateStats();toast("Seller lead saved")};
 $("#buyerForm").onsubmit=e=>{e.preventDefault();const d=Object.fromEntries(new FormData(e.currentTarget));if(!write("pbn_buyers",[...buyers,d]))return;buyers.push(d);e.currentTarget.reset();renderCRM();updateStats();toast("Buyer profile saved")};
 const leadForm=$("#leadForm"); if(leadForm)leadForm.onsubmit=async e=>{e.preventDefault();const form=e.currentTarget,button=form.querySelector('button[type=submit]');button.disabled=true;
 try{const d=Object.fromEntries(new FormData(form));for(const key of ['listingUrl','photoUrl'])if(d[key]&&!safeUrl(d[key]))throw new Error("Use a full HTTPS URL for the listing and photo.");
 d.photo=safeUrl(d.photoUrl);const file=$("#photoFile").files[0];if(file){if(!['image/jpeg','image/png','image/webp'].includes(file.type)||file.size>500*1024)throw new Error("Choose a JPG, PNG or WebP photo under 500 KB.");d.photo=await new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(r.result);r.onerror=()=>reject(new Error("Could not read this photo."));r.readAsDataURL(file)});}
 d.createdAt=new Date().toISOString();if(!write("pbn_watch",[...watch,d]))return;watch.push(d);form.reset();renderWatch();toast("Property and source ad saved on this device");}catch(err){toast(err.message)}finally{button.disabled=false}};
}
$("#savedOnly").onchange=renderDeals;$("#q").oninput=renderDeals;$("#strategy").onchange=renderDeals;$("#ptype").onchange=renderDeals;const exportBtn=$("#exportBtn");if(exportBtn)exportBtn.onclick=exportPropertyBridge;$("#dnaAnalyze").onclick=analyzeDNA;$("#scoreBtn").onclick=scoreDeal;$("#clearData").onclick=()=>{if(confirm("Clear browser-only PROPERTYBridge demo data?")){["pbn_saved","pbn_sellers","pbn_buyers","pbn_outreach","pbn_watch"].forEach(k=>localStorage.removeItem(k));saved=[];sellers=[];buyers=[];outreach=[];watch=[];renderCRM();renderOutreach();renderWatch();renderDeals();updateStats();toast("Demo CRM cleared")}};
wireForms();renderDeals();renderCRM();renderOutreach();renderWatch();updateStats();scoreDeal();

// Source image failure never substitutes a different property.
document.addEventListener('error',event=>{const img=event.target;if(img.matches?.('.listing-photo')){const p=document.createElement('div');p.className='photo-empty';p.textContent='Photo unavailable · open the original ad';img.replaceWith(p)}},true);
$("#importBtn").onclick=()=>$("#importFile").click();
$("#importFile").onchange=async e=>{const f=e.target.files[0];if(!f)return;try{if(f.size>4*1024*1024)throw new Error('Backup is too large (4 MB maximum).');const data=JSON.parse(await f.text());const names=['watch','sellers','buyers','saved','outreach'];if(!names.every(k=>Array.isArray(data[k])))throw new Error('Choose a PROPERTYBridge backup file.');for(const k of names)if(data[k].length>500)throw new Error('Backup has too many records.');if(!data.saved.every(x=>typeof x==='string')||!names.filter(k=>k!=='saved').every(k=>data[k].every(x=>x&&typeof x==='object'&&!Array.isArray(x)&&Object.values(x).every(v=>typeof v==='string'||typeof v==='number'||v===null))))throw new Error('Backup contains invalid records.');for(const k of names.filter(k=>k!=='saved'))data[k]=data[k].map(x=>Object.fromEntries(Object.entries(x).map(([key,value])=>[key,String(value??'')])));if(!confirm('Replace this browser’s workspace with this backup? Export your current data first if you need to keep it.'))return;const old=Object.fromEntries(names.map(k=>[k,localStorage.getItem('pbn_'+k)]));try{names.forEach(k=>localStorage.setItem('pbn_'+k,JSON.stringify(data[k])))}catch(err){names.forEach(k=>old[k]===null?localStorage.removeItem('pbn_'+k):localStorage.setItem('pbn_'+k,old[k]));throw new Error('Not enough browser storage to restore this backup.');}({watch,sellers,buyers,saved,outreach}=data);renderWatch();renderCRM();renderDeals();renderOutreach();updateStats();toast('Backup restored on this device');}catch(err){toast(err.message)}finally{e.target.value=''}};
// Give every existing form control a programmatic label.
document.querySelectorAll('.label').forEach((label,i)=>{const input=label.nextElementSibling;if(input?.matches('input,select,textarea')){input.id||='field-'+i;label.htmlFor=input.id}});
$("#q").setAttribute('aria-label','Search example properties');$("#strategy").setAttribute('aria-label','Filter strategy');$("#ptype").setAttribute('aria-label','Filter property type');


document.querySelectorAll('[data-screen]').forEach(btn=>btn.addEventListener('click',()=>activateScreen(btn.dataset.screen)));
document.querySelectorAll('[data-go]').forEach(btn=>btn.addEventListener('click',()=>activateScreen(btn.dataset.go)));
const initial=(location.hash||"").replace("#","");
if(document.querySelector('[data-screen-id="'+initial+'"]'))activateScreen(initial);else activateScreen("dashboard");
