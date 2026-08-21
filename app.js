const KEY="stockstory_watchlist_v1";
const JKEY="stockstory_journal_v1";
let stocks=loadJSON(KEY);
let journal=loadJSON(JKEY);

if(!stocks.length){
  stocks=[{id:id(),symbol:"NSE:JYOTICNC",company:"JYOTI CNC AUTOMATION LTD",sector:"Capital Goods",setup:"Trendline Breakout",level:"975",entry:"980",stop:"900",target:"1100",chartink:"",tradingview:"",why:"Price has broken the long-term descending trendline.",notes:"Watch for confirmation and volume.",favourite:true}];
  persist();
}
function id(){return Date.now().toString(36)+Math.random().toString(36).slice(2)}
function loadJSON(k){try{return JSON.parse(localStorage.getItem(k)||"[]")}catch{return[]}}
function persist(){localStorage.setItem(KEY,JSON.stringify(stocks))}
function persistJournal(){localStorage.setItem(JKEY,JSON.stringify(journal))}
function esc(v){return String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]))}
function money(v){return v!==""&&v!=null?"₹"+esc(v):"—"}

function render(){
  const q=(document.getElementById("search")?.value||"").toLowerCase();
  const filter=document.getElementById("filter")?.value||"all";
  const list=stocks.filter(s=>JSON.stringify(s).toLowerCase().includes(q)&&(filter==="all"||s.favourite));
  document.getElementById("stockCount").textContent=stocks.length;
  document.getElementById("favCount").textContent=stocks.filter(s=>s.favourite).length;
  document.getElementById("favourites").innerHTML=stocks.filter(s=>s.favourite).map(card).join("")||empty("No favourite stocks yet. Add one above.");
  document.getElementById("watchlist").innerHTML=list.map(card).join("")||empty("No stocks found.");
  document.getElementById("stories").innerHTML=stocks.map(story).join("")||empty("Add a stock to create its story.");
  renderJournal();
}
function empty(t){return `<div class="empty">${esc(t)}</div>`}
function card(s){return `<article class="card">
<div class="top"><div><div class="symbol">${esc(s.symbol)}</div><div class="company">${esc(s.company)}</div></div><div><span class="badge">${s.favourite?"FAVOURITE":"WATCH"}</span><div class="price">${money(s.level)}</div></div></div>
<div class="metrics">
<div class="metric"><small>SETUP</small><strong>${esc(s.setup||"—")}</strong></div>
<div class="metric"><small>LEVEL</small><strong>${money(s.level)}</strong></div>
<div class="metric"><small>ENTRY</small><strong>${money(s.entry)}</strong></div>
<div class="metric"><small>STOP LOSS</small><strong>${money(s.stop)}</strong></div>
<div class="metric"><small>TARGET</small><strong>${money(s.target)}</strong></div>
<div class="metric"><small>SECTOR</small><strong>${esc(s.sector||"—")}</strong></div>
</div>${s.setup?`<span class="tag">${esc(s.setup)}</span>`:""}<p class="thesis">${esc(s.why||"Add why this stock is interesting.")}</p>
<div class="card-actions"><button onclick="editStock('${s.id}')">Edit</button><button onclick="fav('${s.id}')">${s.favourite?"★ Favourite":"☆ Favourite"}</button>${link(s.chartink,"Chartink")}${link(s.tradingview,"TradingView")}<button onclick="removeStock('${s.id}')">Delete</button></div>
</article>`}
function story(s){return `<article class="card"><div class="top"><div><div class="symbol">${esc(s.symbol)} ${s.favourite?"⭐":""}</div><div class="company">${esc(s.company)}</div></div></div><div class="metrics"><div class="metric"><small>SETUP</small><strong>${esc(s.setup||"—")}</strong></div><div class="metric"><small>WATCH LEVEL</small><strong>${money(s.level)}</strong></div><div class="metric"><small>ENTRY</small><strong>${money(s.entry)}</strong></div><div class="metric"><small>STOP</small><strong>${money(s.stop)}</strong></div><div class="metric"><small>TARGET</small><strong>${money(s.target)}</strong></div><div class="metric"><small>SECTOR</small><strong>${esc(s.sector||"—")}</strong></div></div><p class="thesis"><b>Why I'm watching</b><br>${esc(s.why||"—")}</p><p class="thesis"><b>Notes</b><br>${esc(s.notes||"—")}</p><div class="card-actions"><button onclick="editStock('${s.id}')">Edit Story</button>${link(s.chartink,"Chartink")}${link(s.tradingview,"TradingView")}</div></article>`}
function link(url,text){return url?`<a href="${esc(url)}" target="_blank" rel="noopener">${text}</a>`:""}

function openStockModal(s=null){
  document.getElementById("stockTitle").textContent=s?"Edit Stock":"Add Stock";
  const vals={stockId:s?.id||"",symbol:s?.symbol||"",company:s?.company||"",sector:s?.sector||"",setup:s?.setup||"",level:s?.level||"",entry:s?.entry||"",stop:s?.stop||"",target:s?.target||"",chartink:s?.chartink||"",tradingview:s?.tradingview||"",why:s?.why||"",notes:s?.notes||""};
  Object.entries(vals).forEach(([k,v])=>document.getElementById(k).value=v);
  document.getElementById("favourite").checked=!!s?.favourite;
  document.getElementById("stockModal").classList.remove("hidden");
}
function editStock(i){openStockModal(stocks.find(s=>s.id===i))}
function saveStock(e){
 e.preventDefault();
 const s={id:document.getElementById("stockId").value||id(),symbol:document.getElementById("symbol").value.trim().toUpperCase(),company:document.getElementById("company").value.trim(),sector:document.getElementById("sector").value.trim(),setup:document.getElementById("setup").value.trim(),level:document.getElementById("level").value.trim(),entry:document.getElementById("entry").value.trim(),stop:document.getElementById("stop").value.trim(),target:document.getElementById("target").value.trim(),chartink:document.getElementById("chartink").value.trim(),tradingview:document.getElementById("tradingview").value.trim(),why:document.getElementById("why").value.trim(),notes:document.getElementById("notes").value.trim(),favourite:document.getElementById("favourite").checked};
 const old=document.getElementById("stockId").value;
 stocks=old?stocks.map(x=>x.id===old?s:x):[...stocks,s];persist();closeModals();render();
}
function fav(i){const s=stocks.find(x=>x.id===i);if(s){s.favourite=!s.favourite;persist();render()}}
function removeStock(i){const s=stocks.find(x=>x.id===i);if(s&&confirm("Delete "+s.symbol+"?")){stocks=stocks.filter(x=>x.id!==i);persist();render()}}

function openJournalModal(){
 document.getElementById("jDate").value=new Date().toISOString().slice(0,10);
 ["jMarket","jStocks","jTrades","jLesson","jNotes"].forEach(x=>document.getElementById(x).value="");
 document.getElementById("journalModal").classList.remove("hidden");
}
function saveJournal(e){e.preventDefault();journal.unshift({id:id(),date:jDate.value,market:jMarket.value,stocks:jStocks.value,trades:jTrades.value,lesson:jLesson.value,notes:jNotes.value});persistJournal();closeModals();renderJournal()}
function renderJournal(){document.getElementById("journalList").innerHTML=journal.map(j=>`<div class="journal"><b>${esc(j.date)}</b><div class="muted">${esc(j.market)}</div>${j.stocks?`<p><b>Stocks Watching</b><br>${esc(j.stocks)}</p>`:""}${j.trades?`<p><b>Trades / Actions</b><br>${esc(j.trades)}</p>`:""}${j.lesson?`<p><b>What I Learned</b><br>${esc(j.lesson)}</p>`:""}${j.notes?`<p><b>Notes</b><br>${esc(j.notes)}</p>`:""}<button onclick="deleteJournal('${j.id}')">Delete</button></div>`).join("")||empty("No journal entries yet.")}
function deleteJournal(i){if(confirm("Delete this journal entry?")){journal=journal.filter(x=>x.id!==i);persistJournal();renderJournal()}}

function importCSV(e){
 const file=e.target.files[0];if(!file)return;
 const r=new FileReader();
 r.onload=()=>{const lines=r.result.replace(/\r/g,"").split("\n").filter(Boolean);if(lines.length<2)return alert("CSV is empty.");
 const h=csvLine(lines[0]).map(x=>x.toLowerCase().replace(/\s+/g,""));
 const rows=lines.slice(1).map(line=>{const v=csvLine(line),o={};h.forEach((k,i)=>o[k]=v[i]||"");return {id:id(),symbol:(o.symbol||o.ticker||"").toUpperCase(),company:o.company||"",sector:o.sector||"",setup:o.setup||"",level:o.level||o.leveltowatch||"",entry:o.entry||"",stop:o.stop||o.stoploss||"",target:o.target||"",chartink:o.chartink||"",tradingview:o.tradingview||"",why:o.why||o.whyimwatching||"",notes:o.notes||"",favourite:["true","yes","1","y"].includes((o.favourite||"").toLowerCase())}}).filter(x=>x.symbol);
 if(!rows.length)return alert("CSV must have a Symbol column.");stocks.push(...rows);persist();render();alert(rows.length+" stocks imported.");};r.readAsText(file);e.target.value="";
}
function csvLine(s){const a=[];let x="",q=false;for(let i=0;i<s.length;i++){if(s[i]=='"'&&s[i+1]=='"'){x+='"';i++;continue}if(s[i]=='"'){q=!q;continue}if(s[i]==","&&!q){a.push(x.trim());x=""}else x+=s[i]}a.push(x.trim());return a}
function exportCSV(){const h=["Symbol","Company","Sector","Setup","Level","Entry","StopLoss","Target","Chartink","TradingView","Why","Notes","Favourite"],rows=stocks.map(s=>[s.symbol,s.company,s.sector,s.setup,s.level,s.entry,s.stop,s.target,s.chartink,s.tradingview,s.why,s.notes,s.favourite]),csv=[h,...rows].map(r=>r.map(v=>`"${String(v??"").replaceAll('"','""')}"`).join(",")).join("\n"),a=document.createElement("a");a.href=URL.createObjectURL(new Blob([csv],{type:"text/csv"}));a.download="stockstory-watchlist.csv";a.click()}
function closeModals(){document.querySelectorAll(".modal").forEach(x=>x.classList.add("hidden"))}
document.querySelectorAll(".tabs button").forEach(b=>b.onclick=()=>{document.querySelectorAll(".tabs button").forEach(x=>x.classList.remove("active"));document.querySelectorAll(".page").forEach(x=>x.classList.remove("active"));b.classList.add("active");document.getElementById(b.dataset.page).classList.add("active")});
render();
