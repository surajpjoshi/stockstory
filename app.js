const API_BASE="https://stockstory-api-icdq.onrender.com";
const STORAGE_KEY="stockstory_v5";

const seed=[{
  symbol:"JYOTICNC",
  instrumentKey:"NSE_EQ|INE980O01024",
  company:"Jyoti CNC Automation",
  price:949.75,
  tags:["Trendline Breakout","Strong RS","Above EMA50"],
  setup:"Long-term descending trendline breakout",
  thesis:"Price has broken the long-term descending trendline. Watch for confirmation or a controlled retest rather than chasing.",
  entry:"920–950",
  stop:"880",
  target1:"1050",
  target2:"1150",
  levelWatch:"950 breakout / 920 retest",
  chartink:"",
  research:"",
  addedToRSI:true
}];

let data=JSON.parse(localStorage.getItem(STORAGE_KEY)||"null")||{
  stocks:seed,
  journal:[],
  alerts:[]
};

save();

function save(){localStorage.setItem(STORAGE_KEY,JSON.stringify(data))}
function esc(s=""){return String(s).replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]))}
function money(v){return Number.isFinite(Number(v))&&Number(v)!==0?"₹"+Number(v).toLocaleString("en-IN",{maximumFractionDigits:2}):"—"}
function pct(v){return Number.isFinite(Number(v))?Number(v).toFixed(1)+"%":"—"}
function formatVolume(v){
  if(!Number.isFinite(Number(v)))return "—";
  const n=Number(v);
  if(n>=10000000)return (n/10000000).toFixed(2)+" Cr";
  if(n>=100000)return (n/100000).toFixed(2)+" L";
  if(n>=1000)return (n/1000).toFixed(1)+" K";
  return n.toLocaleString("en-IN");
}
function x(v){return encodeURIComponent(v||"")}

document.querySelectorAll(".tab").forEach(b=>b.onclick=()=>switchTab(b.dataset.tab));

function switchTab(t){
  document.querySelectorAll(".tab").forEach(b=>b.classList.toggle("active",b.dataset.tab===t));
  document.querySelectorAll(".tab-panel").forEach(p=>p.classList.toggle("active",p.id===t));
  if(t==="stocks")renderStocks();
  if(t==="journal")renderJournal();
}

function updateStats(live=0){
  document.getElementById("stockCount").textContent=data.stocks.length;
  document.getElementById("liveCount").textContent=live;
  document.getElementById("alertCount").textContent=data.alerts.length;
}

async function checkApi(){
  const el=document.getElementById("apiStatus");
  try{
    const r=await fetch(API_BASE+"/health");
    const j=await r.json();
    el.textContent=j.upstoxConfigured?"● Upstox Connected":"● API Online";
    el.className="status "+(j.upstoxConfigured?"ok":"bad");
  }catch(e){
    el.textContent="● API Offline";
    el.className="status bad";
  }
}

function attention(){
  return [
    ["🔥","Volume Shockers","≥ 2× average volume"],
    ["🏆","Near 52W High","Scanner calculation next"],
    ["🚀","Near ATH","ATH calculation is live"],
    ["📈","RS Strength","RS persistence ≥ 5 days"]
  ].map(a=>`<div class="attention"><div class="icon">${a[0]}</div><h3>${a[1]}</h3><p class="muted">${a[2]}</p><span class="tag">Scanner roadmap</span></div>`).join("");
}

function card(s,m){
  const live=m&&m.currentPrice;
  const tags=[...(s.tags||[])];

  if(m?.volumeShocker)tags.unshift("🔥 Volume Shock");
  if(m?.nearAth)tags.unshift("🚀 Near ATH");

  return `<article class="stock-card">
    <div class="stock-top">
      <div>
        <div class="symbol">${esc(s.symbol)}</div>
        <div class="company">${esc(s.company)}</div>
      </div>
      <div style="text-align:right">
        ${live?'<span class="live-badge">LIVE</span>':""}
        <div class="price">${money(m?.currentPrice||s.price)}</div>
      </div>
    </div>

    <div>${tags.map(t=>`<span class="tag">${esc(t)}</span>`).join("")}</div>

    ${live?`
      <div class="metric-grid">
        <div class="metric-box"><small>DAY HIGH</small><strong>${money(m.dayHigh)}</strong></div>
        <div class="metric-box"><small>DAY LOW</small><strong>${money(m.dayLow)}</strong></div>
        <div class="metric-box"><small>TODAY VOLUME</small><strong>${formatVolume(m.currentVolume)}</strong></div>
        <div class="metric-box"><small>20D AVG VOLUME</small><strong>${formatVolume(m.average20Volume)}</strong></div>
        <div class="metric-box"><small>RELATIVE VOLUME</small><strong class="${m.volumeShocker?"warning":""}">${m.relativeVolume!==null?m.relativeVolume.toFixed(2)+"×":"—"} ${m.volumeShocker?"🔥":""}</strong></div>
        <div class="metric-box"><small>ATH</small><strong>${money(m.ath)}</strong></div>
        <div class="metric-box"><small>FROM ATH</small><strong>${pct(m.distanceFromAthPct)}</strong></div>
        <div class="metric-box"><small>52W STATUS</small><strong class="muted">Scanner next</strong></div>
      </div>
    `:`<p class="muted">Add the Upstox instrument key to enable live data.</p>`}

    <div class="thesis">${esc(s.thesis||"Add your reason for watching this stock.")}</div>

    <div class="levels">
      <div class="level"><small>ENTRY</small><strong>${esc(s.entry||"—")}</strong></div>
      <div class="level"><small>STOP</small><strong>${esc(s.stop||"—")}</strong></div>
      <div class="level"><small>TARGET</small><strong>${esc(s.target1||"—")}</strong></div>
    </div>

    <div class="actions">
      <button class="ghost" onclick="viewStock('${x(s.symbol)}')">Details</button>
      <button class="primary" onclick="addToRSI('${x(s.symbol)}')">${s.addedToRSI?"✓ In RSI":"＋ RSI System"}</button>
    </div>
  </article>`;
}

async function fetchMetrics(s){
  if(!s.instrumentKey)return null;

  try{
    const [mr,qr]=await Promise.all([
      fetch(API_BASE+"/api/stock-metrics?instrumentKey="+encodeURIComponent(s.instrumentKey)),
      fetch(API_BASE+"/api/quote?instrumentKey="+encodeURIComponent(s.instrumentKey))
    ]);

    if(!mr.ok)throw new Error(await mr.text());

    const mj=await mr.json();
    let quote={};

    if(qr.ok)quote=await qr.json();

    const q=quote?.data?Object.values(quote.data)[0]:{};
    const live=q?.live_ohlc||q?.liveOHLC||{};

    mj.metrics=mj.metrics||{};
    mj.metrics.dayHigh=Number(live.high)||null;
    mj.metrics.dayLow=Number(live.low)||null;

    if(!mj.metrics.currentPrice)mj.metrics.currentPrice=Number(q?.last_price)||0;
    if(!mj.metrics.currentVolume)mj.metrics.currentVolume=Number(live.volume)||0;

    return mj.metrics;
  }catch(e){
    console.error(s.symbol,e);
    return null;
  }
}

async function refreshAll(){
  const grid=document.getElementById("liveGrid");

  grid.innerHTML=data.stocks.map(s=>card(s,null)).join("")||
    "<div class='attention'>Add your first stock.</div>";

  const results=await Promise.all(
    data.stocks.map(async s=>[s,await fetchMetrics(s)])
  );

  let live=0;

  grid.innerHTML=results.map(([s,m])=>{
    if(m)live++;
    return card(s,m);
  }).join("")||
    "<div class='attention'>Add your first stock.</div>";

  updateStats(live);
}

function renderDashboard(){
  document.getElementById("attentionGrid").innerHTML=attention();
  refreshAll();
}

function renderStocks(){
  const q=(document.getElementById("stockSearch")?.value||"").toLowerCase();

  const list=data.stocks.filter(s=>
    (s.symbol+" "+s.company+" "+s.setup+" "+(s.tags||[]).join(" "))
      .toLowerCase()
      .includes(q)
  );

  document.getElementById("stockGrid").innerHTML=list.map(s=>card(s,null)).join("")||
    "<div class='attention'>No stocks match.</div>";
}

function addToRSI(enc){
  const s=data.stocks.find(a=>a.symbol===decodeURIComponent(enc));
  if(!s)return;

  s.addedToRSI=true;
  save();
  renderDashboard();
  renderStocks();

  alert(`${s.symbol} is marked for RSI Trading System integration.`);
}

function viewStock(enc){
  const s=data.stocks.find(a=>a.symbol===decodeURIComponent(enc));
  if(!s)return;

  showModal(`
    <p class="eyebrow">STOCK STORY</p>
    <h2>${esc(s.symbol)} — ${esc(s.company)}</h2>
    <p class="thesis">${esc(s.thesis)}</p>
    <p><strong>Setup:</strong> ${esc(s.setup)}</p>
    <p><strong>Level:</strong> ${esc(s.levelWatch)}</p>
    <div class="actions">
      ${s.chartink?`<a class="primary" target="_blank" href="${esc(s.chartink)}">Chartink ↗</a>`:""}
      ${s.research?`<a class="ghost" target="_blank" href="${esc(s.research)}">Research ↗</a>`:""}
      <button class="primary" onclick="addToRSI('${x(s.symbol)}')">＋ Add to RSI</button>
    </div>
  `);
}

function openAddStock(){
  showModal(`
    <p class="eyebrow">ADD STOCK</p>
    <h2>Add Favourite Stock</h2>

    <div class="form-grid">
      <div class="form-group"><label>Symbol</label><input id="f_symbol" placeholder="JYOTICNC"></div>
      <div class="form-group"><label>Company</label><input id="f_company"></div>

      <div class="form-group full">
        <label>Upstox Instrument Key</label>
        <input id="f_key" placeholder="NSE_EQ|INE980O01024">
        <small class="muted">Required for live Upstox data.</small>
      </div>

      <div class="form-group"><label>Setup</label><input id="f_setup"></div>
      <div class="form-group"><label>RS Days</label><input id="f_rs" type="number" value="5"></div>

      <div class="form-group full"><label>Why am I watching this?</label><textarea id="f_thesis"></textarea></div>

      <div class="form-group"><label>Entry Zone</label><input id="f_entry"></div>
      <div class="form-group"><label>Stop</label><input id="f_stop"></div>

      <div class="form-group"><label>Target 1</label><input id="f_t1"></div>
      <div class="form-group"><label>Target 2</label><input id="f_t2"></div>

      <div class="form-group full"><label>Level to Watch</label><input id="f_level"></div>
      <div class="form-group full"><label>Chartink URL</label><input id="f_chartink"></div>
    </div>

    <div class="modal-actions">
      <button class="ghost" onclick="closeModal()">Cancel</button>
      <button class="primary" onclick="saveStock()">Save Stock</button>
    </div>
  `);
}

function saveStock(){
  const symbol=document.getElementById("f_symbol").value.trim().toUpperCase();

  if(!symbol)return alert("Enter symbol.");

  if(data.stocks.some(s=>s.symbol===symbol))
    return alert("Stock already exists.");

  data.stocks.unshift({
    symbol,
    company:document.getElementById("f_company").value.trim(),
    instrumentKey:document.getElementById("f_key").value.trim(),
    setup:document.getElementById("f_setup").value.trim(),
    rsDays:Number(document.getElementById("f_rs").value)||0,
    tags:[],
    thesis:document.getElementById("f_thesis").value.trim(),
    entry:document.getElementById("f_entry").value.trim(),
    stop:document.getElementById("f_stop").value.trim(),
    target1:document.getElementById("f_t1").value.trim(),
    target2:document.getElementById("f_t2").value.trim(),
    levelWatch:document.getElementById("f_level").value.trim(),
    chartink:document.getElementById("f_chartink").value.trim(),
    addedToRSI:false
  });

  save();
  closeModal();
  renderDashboard();
  renderStocks();
}

function openJournal(){
  showModal(`
    <p class="eyebrow">TRADING JOURNAL</p>
    <h2>Record a Trade</h2>

    <div class="form-grid">
      <div class="form-group"><label>Symbol</label><input id="j_symbol"></div>
      <div class="form-group"><label>Setup</label><input id="j_setup"></div>
      <div class="form-group"><label>Entry</label><input id="j_entry" type="number"></div>
      <div class="form-group"><label>Exit</label><input id="j_exit" type="number"></div>
      <div class="form-group full"><label>Reason</label><textarea id="j_reason"></textarea></div>
      <div class="form-group full"><label>Learning</label><textarea id="j_learning"></textarea></div>
    </div>

    <div class="modal-actions">
      <button class="ghost" onclick="closeModal()">Cancel</button>
      <button class="primary" onclick="saveJournal()">Save Trade</button>
    </div>
  `);
}

function saveJournal(){
  const symbol=document.getElementById("j_symbol").value.trim().toUpperCase();
  const entry=Number(document.getElementById("j_entry").value)||0;
  const exit=Number(document.getElementById("j_exit").value)||0;

  if(!symbol)return alert("Enter symbol.");

  data.journal.unshift({
    date:new Date().toISOString(),
    symbol,
    setup:document.getElementById("j_setup").value,
    entry,
    exit,
    pnl:exit-entry,
    reason:document.getElementById("j_reason").value,
    learning:document.getElementById("j_learning").value
  });

  save();
  closeModal();
  renderJournal();
}

function renderJournal(){
  const j=data.journal;
  const w=j.filter(x=>x.pnl>0).length;
  const p=j.reduce((a,x)=>a+(Number(x.pnl)||0),0);

  document.getElementById("journalStats").innerHTML=`
    <div class="metric"><strong>${j.length}</strong><span>Total Trades</span></div>
    <div class="metric"><strong>${w}</strong><span>Winning Trades</span></div>
    <div class="metric"><strong>${j.length?(w/j.length*100).toFixed(1):"0"}%</strong><span>Win Rate</span></div>
    <div class="metric"><strong class="${p>=0?"positive":"negative"}">${p>=0?"+":""}${p.toFixed(2)}</strong><span>Net P/L points</span></div>
  `;

  document.getElementById("journalList").innerHTML=j.map(t=>`
    <div class="journal-item">
      <div>
        <h3>${esc(t.symbol)} · ${esc(t.setup)}</h3>
        <div class="muted">${new Date(t.date).toLocaleDateString("en-IN")} · ${esc(t.reason||"")}</div>
      </div>
      <strong class="${t.pnl>=0?"positive":"negative"}">${t.pnl>=0?"+":""}${Number(t.pnl).toFixed(2)}</strong>
    </div>
  `).join("")||"<div class='attention'>No trades recorded yet.</div>";
}

function showModal(html){
  document.getElementById("modalContent").innerHTML=html;
  document.getElementById("modal").classList.remove("hidden");
}

function closeModal(){
  document.getElementById("modal").classList.add("hidden");
}

window.onclick=e=>{
  if(e.target.id==="modal")closeModal();
};

checkApi();
renderDashboard();
renderJournal();
