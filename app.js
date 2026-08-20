const KEY="stockstory_v1";
const seedStocks=[{id:crypto.randomUUID(),symbol:"NSE:JYOTICNC",company:"Jyoti CNC",sector:"",setup:"",level:"",entry:"",stop:"",target:"",chartink:"",tradingview:"",why:"",notes:"",favourite:true}];
let state=JSON.parse(localStorage.getItem(KEY)||"null")||{stocks:seedStocks,journal:[]};
function save(){localStorage.setItem(KEY,JSON.stringify(state));render()}
function esc(v){return String(v??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]))}
function money(v){return v?`₹${esc(v)}`:"—"}
function render(){
 document.getElementById("favCount").textContent=state.stocks.filter(x=>x.favourite).length;
 document.getElementById("stockCount").textContent=state.stocks.length;
 document.getElementById("journalCount").textContent=state.journal.length;
 renderFav(); renderLevels(); renderTable(); renderJournal(); renderLatest();
}
function renderFav(){
 const a=state.stocks.filter(x=>x.favourite);
 document.getElementById("favourites").innerHTML=a.length?a.map(card).join(""):`<div class="empty">No favourites yet. Add one from your watchlist.</div>`;
}
function card(s){
 return `<article class="stock-card"><div class="stock-title"><div><div class="symbol">${esc(s.symbol)}</div><div class="muted">${esc(s.company||s.sector||"")}</div></div><div>${s.favourite?"⭐":"☆"}</div></div>
 <div class="chips">${s.setup?`<span class="chip">${esc(s.setup)}</span>`:""}${s.level?`<span class="chip">Watch ${money(s.level)}</span>`:""}</div>
 ${s.why?`<p>${esc(s.why)}</p>`:""}<div class="level"><span>Entry</span><b>${money(s.entry)}</b></div><div class="level"><span>Stop</span><b>${money(s.stop)}</b></div><div class="level"><span>Target</span><b>${money(s.target)}</b></div>
 <div class="stock-actions"><button class="btn" onclick="editStock('${s.id}')">Edit</button>${s.chartink?`<a class="btn" target="_blank" href="${esc(s.chartink)}">Chartink</a>`:""}${s.tradingview?`<a class="btn" target="_blank" href="${esc(s.tradingview)}">Chart</a>`:""}</div></article>`
}
function renderLevels(){
 const a=state.stocks.filter(x=>x.level);
 document.getElementById("levels").innerHTML=a.length?a.slice(0,8).map(x=>`<div class="level"><span><b>${esc(x.symbol)}</b><br><small class="muted">${esc(x.setup||"Watch")}</small></span><b>${money(x.level)}</b></div>`).join(""):`<div class="empty">Add a level to see it here.</div>`;
}
function renderTable(){
 const q=(document.getElementById("search")?.value||"").toLowerCase(), f=document.getElementById("favFilter")?.value||"all";
 const a=state.stocks.filter(s=>(f==="all"||s.favourite)&&JSON.stringify(s).toLowerCase().includes(q));
 document.getElementById("watchlistTable").innerHTML=`<table class="table"><thead><tr><th>★</th><th>Symbol</th><th>Company</th><th>Setup</th><th>Watch</th><th>Entry</th><th>Stop</th><th>Target</th><th>Actions</th></tr></thead><tbody>${a.map(s=>`<tr><td><button class="btn" onclick="toggleFav('${s.id}')">${s.favourite?"⭐":"☆"}</button></td><td><b>${esc(s.symbol)}</b></td><td>${esc(s.company)}</td><td>${esc(s.setup)}</td><td>${money(s.level)}</td><td>${money(s.entry)}</td><td>${money(s.stop)}</td><td>${money(s.target)}</td><td><button class="btn" onclick="editStock('${s.id}')">Edit</button> <button class="btn" onclick="deleteStock('${s.id}')">Delete</button></td></tr>`).join("")}</tbody></table>${!a.length?`<div class="empty" style="padding:30px;text-align:center">No stocks found.</div>`:""}`;
}
function renderJournal(){
 document.getElementById("journalList").innerHTML=state.journal.length?[...state.journal].sort((a,b)=>b.date.localeCompare(a.date)).map((j,i)=>`<article class="journal"><h3>${esc(j.date)} — ${esc(j.market||"")}</h3><div class="date">${esc(j.stocks||"")}</div><p><b>Trades / Actions</b><br>${esc(j.trades||"—")}</p><p><b>What I learned</b><br>${esc(j.lesson||"—")}</p><p>${esc(j.notes||"")}</p><button class="btn" onclick="deleteJournal(${i})">Delete</button></article>`).join(""):`<div class="empty">No journal entries yet.</div>`;
}
function renderLatest(){
 const j=[...state.journal].sort((a,b)=>b.date.localeCompare(a.date))[0];
 document.getElementById("latestJournal").innerHTML=j?`<b>${esc(j.date)}</b><p>${esc(j.market||"")}</p><p>${esc(j.lesson||j.notes||"")}</p>`:`<div class="empty">No journal entry yet.</div>`;
}
function openStock(s=null){
 document.getElementById("modalTitle").textContent=s?"Edit Stock":"Add Stock";
 const ids=["stockId","fSymbol","fCompany","fSector","fSetup","fLevel","fEntry","fStop","fTarget","fChartink","fTradingview","fWhy","fNotes"];
 const vals=s?[s.id,s.symbol,s.company,s.sector,s.setup,s.level,s.entry,s.stop,s.target,s.chartink,s.tradingview,s.why,s.notes]:["","","","","","","","","","","","",""];
 ids.forEach((id,i)=>document.getElementById(id).value=vals[i]||"");
 document.getElementById("fFavourite").checked=!!s?.favourite;
 document.getElementById("modal").classList.remove("hidden");
}
function editStock(id){openStock(state.stocks.find(x=>x.id===id))}
function deleteStock(id){if(confirm("Delete this stock?")){state.stocks=state.stocks.filter(x=>x.id!==id);save()}}
function toggleFav(id){const s=state.stocks.find(x=>x.id===id);if(s){s.favourite=!s.favourite;save()}}
function openJournal(){
 document.getElementById("journalForm").reset(); document.getElementById("jDate").value=new Date().toISOString().slice(0,10); document.getElementById("journalModal").classList.remove("hidden");
}
function parseCSV(text){
 const lines=text.replace(/\r/g,"").split("\n").filter(x=>x.trim());
 if(!lines.length)return[];
 const parse=l=>{let out=[],cur="",q=false;for(let i=0;i<l.length;i++){const c=l[i];if(c==='"'&&l[i+1]==='"'){cur+='"';i++;continue}if(c==='"'){q=!q;continue}if(c===","&&!q){out.push(cur.trim());cur="";}else cur+=c}out.push(cur.trim());return out};
 const h=parse(lines[0]).map(x=>x.toLowerCase().replace(/\s+/g,""));
 return lines.slice(1).map(line=>{const v=parse(line),o={id:crypto.randomUUID()};h.forEach((k,i)=>o[k]=v[i]||"");return {id:o.id,symbol:o.symbol||o.ticker||"",company:o.company||"",sector:o.sector||"",setup:o.setup||"",level:o.level||o.leveltowatch||"",entry:o.entry||"",stop:o.stoploss||o.stop||"",target:o.target||"",chartink:o.chartink||"",tradingview:o.tradingview||"",why:o.whyimwatching||o.why||"",notes:o.notes||"",favourite:["true","yes","1","⭐"].includes(String(o.favourite).toLowerCase())}}).filter(x=>x.symbol)}
document.getElementById("stockForm").onsubmit=e=>{e.preventDefault();const id=document.getElementById("stockId").value,s={id:id||crypto.randomUUID(),symbol:fSymbol.value.trim(),company:fCompany.value.trim(),sector:fSector.value.trim(),setup:fSetup.value.trim(),level:fLevel.value.trim(),entry:fEntry.value.trim(),stop:fStop.value.trim(),target:fTarget.value.trim(),chartink:fChartink.value.trim(),tradingview:fTradingview.value.trim(),why:fWhy.value.trim(),notes:fNotes.value.trim(),favourite:fFavourite.checked};if(id)state.stocks=state.stocks.map(x=>x.id===id?s:x);else state.stocks.push(s);save();modal.classList.add("hidden")}
document.getElementById("journalForm").onsubmit=e=>{e.preventDefault();state.journal.push({date:jDate.value,market:jMarket.value,stocks:jStocks.value,trades:jTrades.value,lesson:jLesson.value,notes:jNotes.value});save();journalModal.classList.add("hidden")}
function download(name,text,type){const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([text],{type}));a.download=name;a.click()}
document.getElementById("exportBtn").onclick=()=>{const h=["Symbol","Company","Sector","Setup","Level","Entry","StopLoss","Target","Chartink","TradingView","Why","Notes","Favourite"];const csv=[h,...state.stocks.map(s=>[s.symbol,s.company,s.sector,s.setup,s.level,s.entry,s.stop,s.target,s.chartink,s.tradingview,s.why,s.notes,s.favourite])].map(r=>r.map(x=>`"${String(x??"").replaceAll('"','""')}"`).join(",")).join("\n");download("stockstory-watchlist.csv",csv,"text/csv")}
importBtn.onclick=()=>csvInput.click();
csvInput.onchange=e=>{const file=e.target.files[0];if(!file)return;const r=new FileReader();r.onload=()=>{const a=parseCSV(r.result);if(a.length){state.stocks.push(...a);save();alert(`${a.length} stocks imported.`)}else alert("No valid Symbol column found.")};r.readAsText(file);e.target.value=""};
document.getElementById("addBtn").onclick=()=>openStock();document.getElementById("addBtn2").onclick=()=>openStock();document.getElementById("journalBtn").onclick=openJournal;document.getElementById("journalTodayBtn").onclick=openJournal;
closeModal.onclick=cancelModal.onclick=()=>modal.classList.add("hidden");closeJournal.onclick=cancelJournal.onclick=()=>journalModal.classList.add("hidden");
document.querySelectorAll(".tab").forEach(b=>b.onclick=()=>{document.querySelectorAll(".tab,.tabpage").forEach(x=>x.classList.remove("active"));b.classList.add("active");document.getElementById(b.dataset.tab).classList.add("active")});
favTabBtn.onclick=()=>document.querySelector('[data-tab="watchlist"]').click();
search.oninput=renderTable;favFilter.onchange=renderTable;
window.editStock=editStock;window.deleteStock=deleteStock;window.toggleFav=toggleFav;window.deleteJournal=i=>{if(confirm("Delete this journal entry?")){const sorted=[...state.journal].sort((a,b)=>b.date.localeCompare(a.date));const target=sorted[i];state.journal=state.journal.filter(x=>x!==target);save()}};
render();
