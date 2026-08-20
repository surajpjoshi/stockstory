const STORAGE_KEY="stockstory_v1";

const defaultData={
  stocks:[
    {
      symbol:"JYOTICNC", company:"Jyoti CNC Automation",
      price:949.80, change:0, rsi:72.80, rsDays:5,
      tags:["Trendline Breakout","Strong RS","Above EMA50"],
      setup:"Long-term descending trendline breakout",
      thesis:"Price has broken the long-term descending trendline and is above EMA20/30/40/50. Watching for confirmation or a controlled retest rather than chasing.",
      entry:"920-950", stop:"880", target1:"1050", target2:"1150",
      levelWatch:"950 breakout / 920 retest",
      chartink:"",
      research:"",
      image:"",
      addedToRSI:false,
      alertPrice:"950"
    }
  ],
  journal:[],
  alerts:[]
};

let data=JSON.parse(localStorage.getItem(STORAGE_KEY)||"null")||defaultData;
save();

function save(){localStorage.setItem(STORAGE_KEY,JSON.stringify(data))}
function esc(s=""){return String(s).replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]))}
function money(v){return v===""?"—":"₹"+Number(v).toLocaleString("en-IN",{maximumFractionDigits:2})}

document.querySelectorAll(".tab").forEach(b=>b.addEventListener("click",()=>switchTab(b.dataset.tab)));
function switchTab(tab){
  document.querySelectorAll(".tab").forEach(b=>b.classList.toggle("active",b.dataset.tab===tab));
  document.querySelectorAll(".tab-panel").forEach(p=>p.classList.toggle("active",p.id===tab));
  if(tab==="stocks")renderStocks(); if(tab==="journal")renderJournal(); updateStats();
}

function updateStats(){
  document.getElementById("stockCount").textContent=data.stocks.length;
  document.getElementById("alertCount").textContent=data.alerts.length;
  document.getElementById("setupCount").textContent=data.stocks.filter(s=>s.setup).length;
}
function renderDashboard(){
  const attention=[
    ["🔥","Breakout Watch","Stocks with a breakout setup","breakout"],
    ["🔊","Volume Shockers","Add relative-volume data here","volume"],
    ["🏆","52W / ATH Watch","Stocks approaching major highs","high"],
    ["📈","Strong RS","RS strength and 5+ day persistence","rs"]
  ];
  document.getElementById("attentionGrid").innerHTML=attention.map(a=>`
    <div class="attention"><div class="icon">${a[0]}</div><h3>${a[1]}</h3><p class="muted">${a[2]}</p><span class="tag">${data.stocks.length} stocks tracked</span></div>`).join("");
  document.getElementById("dashboardStocks").innerHTML=data.stocks.slice(0,6).map(stockCard).join("")||empty("No favourite stocks yet.");
  updateStats();
}
function empty(text){return `<div class="attention"><h3>${esc(text)}</h3><p class="muted">Use + Add Stock to start building your watchlist.</p></div>`}
function stockCard(s){
  return `<article class="stock-card">
    <div class="stock-top"><div><div class="symbol">${esc(s.symbol)}</div><div class="company">${esc(s.company)}</div></div><div class="price">${money(s.price)}</div></div>
    <div class="pills">${(s.tags||[]).map(t=>`<span class="tag">${esc(t)}</span>`).join("")}</div>
    <div class="thesis">${esc(s.thesis||"Add your reason for watching this stock.")}</div>
    <div class="levels">
      <div class="level"><small>ENTRY</small><strong>${esc(s.entry||"—")}</strong></div>
      <div class="level"><small>STOP</small><strong>${esc(s.stop||"—")}</strong></div>
      <div class="level"><small>TARGET</small><strong>${esc(s.target1||"—")}</strong></div>
    </div>
    <div class="actions">
      <button class="ghost" onclick="viewStock('${encodeURIComponent(s.symbol)}')">Details</button>
      <button class="primary" onclick="addToRSI('${encodeURIComponent(s.symbol)}')">${s.addedToRSI?"✓ In RSI":"＋ RSI System"}</button>
    </div>
  </article>`
}
function renderStocks(){
  const q=(document.getElementById("stockSearch")?.value||"").toLowerCase();
  const list=data.stocks.filter(s=>(s.symbol+" "+s.company+" "+s.setup+" "+(s.tags||[]).join(" ")).toLowerCase().includes(q));
  document.getElementById("stockGrid").innerHTML=list.map(stockCard).join("")||empty("No stocks match your search.");
}
function viewStock(enc){
  const s=data.stocks.find(x=>x.symbol===decodeURIComponent(enc)); if(!s)return;
  showModal(`<p class="eyebrow">STOCK STORY</p><h2>${esc(s.symbol)} — ${esc(s.company)}</h2>
  <div class="stock-top"><div><div class="tag">Setup: ${esc(s.setup||"Not defined")}</div><div class="tag">RS days: ${esc(s.rsDays||"—")}</div><div class="tag">RSI: ${esc(s.rsi||"—")}</div></div><div class="price">${money(s.price)}</div></div>
  <h3>Why am I watching this?</h3><p class="thesis">${esc(s.thesis||"—")}</p>
  <h3>Levels to watch</h3><div class="levels"><div class="level"><small>ENTRY</small><strong>${esc(s.entry||"—")}</strong></div><div class="level"><small>STOP</small><strong>${esc(s.stop||"—")}</strong></div><div class="level"><small>TARGET 1</small><strong>${esc(s.target1||"—")}</strong></div></div>
  <p><strong>Level to watch:</strong> ${esc(s.levelWatch||"—")}</p>
  <div class="actions">
    ${s.chartink?`<a class="primary" target="_blank" href="${esc(s.chartink)}">Chartink ↗</a>`:""}
    ${s.research?`<a class="ghost" target="_blank" href="${esc(s.research)}">Research ↗</a>`:""}
    <button class="primary" onclick="addToRSI('${encodeURIComponent(s.symbol)}')">${s.addedToRSI?"✓ Added to RSI":"＋ Add to RSI System"}</button>
    <button class="danger" onclick="deleteStock('${encodeURIComponent(s.symbol)}')">Delete</button>
  </div>`);
}
function addToRSI(enc){
  const s=data.stocks.find(x=>x.symbol===decodeURIComponent(enc)); if(!s)return;
  s.addedToRSI=true; save(); renderDashboard(); renderStocks(); closeModal();
  alert(`${s.symbol} marked for RSI Trading System integration. The actual cross-repository sync will be connected in the next phase.`);
}
function deleteStock(enc){
  const symbol=decodeURIComponent(enc); if(!confirm(`Remove ${symbol} from StockStory?`))return;
  data.stocks=data.stocks.filter(s=>s.symbol!==symbol); save(); closeModal(); renderDashboard(); renderStocks();
}
function openAddStock(){
  showModal(`<p class="eyebrow">ADD TO WATCHLIST</p><h2>Add Favourite Stock</h2>
  <div class="form-grid">
    <div class="form-group"><label>Symbol</label><input id="f_symbol" placeholder="JYOTICNC"></div>
    <div class="form-group"><label>Company</label><input id="f_company" placeholder="Company name"></div>
    <div class="form-group"><label>Current Price</label><input id="f_price" type="number"></div>
    <div class="form-group"><label>RSI</label><input id="f_rsi" type="number"></div>
    <div class="form-group"><label>RS Days</label><input id="f_rs" type="number" value="5"></div>
    <div class="form-group"><label>Setup</label><input id="f_setup" placeholder="Trendline breakout"></div>
    <div class="form-group full"><label>Tags (comma separated)</label><input id="f_tags" placeholder="Strong RS, Volume Shock, Near 52W High"></div>
    <div class="form-group full"><label>Why am I watching this?</label><textarea id="f_thesis" placeholder="Explain the setup in your own words..."></textarea></div>
    <div class="form-group"><label>Entry Zone</label><input id="f_entry" placeholder="920-950"></div>
    <div class="form-group"><label>Stop</label><input id="f_stop" placeholder="880"></div>
    <div class="form-group"><label>Target 1</label><input id="f_t1" placeholder="1050"></div>
    <div class="form-group"><label>Target 2</label><input id="f_t2" placeholder="1150"></div>
    <div class="form-group full"><label>Level to Watch</label><input id="f_level" placeholder="Breakout / retest level"></div>
    <div class="form-group full"><label>Chartink URL</label><input id="f_chartink" placeholder="Paste Chartink link"></div>
    <div class="form-group full"><label>Research / Image URL</label><input id="f_research" placeholder="Paste research or stock-image link"></div>
  </div>
  <div class="modal-actions"><button class="ghost" onclick="closeModal()">Cancel</button><button class="primary" onclick="saveStock()">Save Stock</button></div>`);
}
function saveStock(){
  const symbol=document.getElementById("f_symbol").value.trim().toUpperCase();
  if(!symbol)return alert("Please enter a symbol.");
  if(data.stocks.some(s=>s.symbol===symbol))return alert("That stock already exists.");
  data.stocks.unshift({
    symbol,company:document.getElementById("f_company").value.trim(),price:Number(document.getElementById("f_price").value)||0,
    rsi:Number(document.getElementById("f_rsi").value)||0,rsDays:Number(document.getElementById("f_rs").value)||0,
    tags:document.getElementById("f_tags").value.split(",").map(x=>x.trim()).filter(Boolean),
    setup:document.getElementById("f_setup").value.trim(),thesis:document.getElementById("f_thesis").value.trim(),
    entry:document.getElementById("f_entry").value.trim(),stop:document.getElementById("f_stop").value.trim(),
    target1:document.getElementById("f_t1").value.trim(),target2:document.getElementById("f_t2").value.trim(),
    levelWatch:document.getElementById("f_level").value.trim(),chartink:document.getElementById("f_chartink").value.trim(),
    research:document.getElementById("f_research").value.trim(),addedToRSI:false,alertPrice:""
  });
  save(); closeModal(); renderDashboard(); renderStocks();
}
function openJournal(){
  showModal(`<p class="eyebrow">TRADING JOURNAL</p><h2>Record a Trade</h2>
  <div class="form-grid">
    <div class="form-group"><label>Symbol</label><input id="j_symbol"></div>
    <div class="form-group"><label>Setup</label><input id="j_setup" placeholder="Trendline breakout"></div>
    <div class="form-group"><label>Entry</label><input id="j_entry" type="number"></div>
    <div class="form-group"><label>Exit</label><input id="j_exit" type="number"></div>
    <div class="form-group full"><label>What was the reason?</label><textarea id="j_reason"></textarea></div>
    <div class="form-group full"><label>What did I learn?</label><textarea id="j_learning"></textarea></div>
  </div>
  <div class="modal-actions"><button class="ghost" onclick="closeModal()">Cancel</button><button class="primary" onclick="saveJournal()">Save Trade</button></div>`);
}
function saveJournal(){
  const symbol=document.getElementById("j_symbol").value.trim().toUpperCase(); if(!symbol)return alert("Enter symbol.");
  const entry=Number(document.getElementById("j_entry").value)||0, exit=Number(document.getElementById("j_exit").value)||0;
  data.journal.unshift({date:new Date().toISOString(),symbol,setup:document.getElementById("j_setup").value,entry,exit,pnl:exit-entry,reason:document.getElementById("j_reason").value,learning:document.getElementById("j_learning").value});
  save(); closeModal(); renderJournal(); updateStats();
}
function renderJournal(){
  const j=data.journal; const wins=j.filter(x=>x.pnl>0).length; const pnl=j.reduce((a,x)=>a+(Number(x.pnl)||0),0);
  document.getElementById("journalStats").innerHTML=`<div class="metric"><strong>${j.length}</strong><span>Total Trades</span></div><div class="metric"><strong>${wins}</strong><span>Winning Trades</span></div><div class="metric"><strong>${j.length?wins/j.length*100:0 .toFixed(1)}%</strong><span>Win Rate</span></div><div class="metric"><strong class="${pnl>=0?"positive":"negative"}">${money(pnl)}</strong><span>Net P/L (price points)</span></div>`;
  document.getElementById("journalList").innerHTML=j.map(x=>`<div class="journal-item"><div><h3>${esc(x.symbol)} · ${esc(x.setup)}</h3><div class="muted">${new Date(x.date).toLocaleDateString("en-IN")} · ${esc(x.reason||"No reason recorded")}</div></div><strong class="${x.pnl>=0?"positive":"negative"}">${x.pnl>=0?"+":""}${Number(x.pnl).toFixed(2)}</strong></div>`).join("")||empty("No trades recorded yet.");
}
function showModal(html){document.getElementById("modalContent").innerHTML=html;document.getElementById("modal").classList.remove("hidden")}
function closeModal(){document.getElementById("modal").classList.add("hidden")}
window.addEventListener("click",e=>{if(e.target.id==="modal")closeModal()});
renderDashboard(); renderStocks(); renderJournal(); updateStats();
