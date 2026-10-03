(() => {
  const qs = (s) => document.querySelector(s);
  const esc = (v) => String(v ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  let feed = null;

  function fmtDate(v){
    if(!v) return "Not refreshed yet";
    const d = new Date(v);
    return Number.isNaN(d.getTime()) ? v : d.toLocaleString();
  }

  function renderSources(){
    const el = qs("#autoSourceStatus");
    if(!el || !feed) return;
    el.innerHTML = (feed.sources || []).map(s =>
      '<span class="engine-source ' + esc(s.status || "unknown") + '"><b>' + esc(s.name) + '</b> ' +
      esc(s.status || "unknown") + (Number.isFinite(s.records) ? ' · ' + s.records : '') + '</span>'
    ).join("");
  }

  function renderHud(){
    const grid = qs("#autoFeedGrid"), count = qs("#autoFeedCount");
    if(!grid || !feed) return;
    const q = (qs("#autoFeedSearch")?.value || "").trim().toLowerCase();
    const state = qs("#autoFeedState")?.value || "";
    const rows = (feed.records || []).filter(r => {
      const text = [r.address,r.city,r.state,r.zip,r.market,r.revitalizationArea].join(" ").toLowerCase();
      return (!q || text.includes(q)) && (!state || r.state === state);
    });
    if(count) count.textContent = rows.length + " government REO signal" + (rows.length === 1 ? "" : "s");
    grid.innerHTML = rows.slice(0, 36).map(r => {
      const title = [r.address, r.city, r.state, r.zip].filter(Boolean).join(", ");
      const area = r.revitalizationArea ? '<span>Revitalization area: ' + esc(r.revitalizationArea) + '</span>' : '';
      return '<article class="engine-card">' +
        '<div class="engine-card-top"><span>HUD FHA REO</span><b>VERIFIED SOURCE</b></div>' +
        '<h3>' + esc(title || "HUD property record") + '</h3>' +
        '<div class="engine-meta"><span>Price: verify</span><span>APR: unknown</span><span>Step: ' + esc(r.caseStep ?? "—") + '</span>' + area + '</div>' +
        '<p>' + esc(r.nextAction || "Verify the property before acting.") + '</p>' +
        '<a class="btn small" href="' + esc(r.sourceUrl || "#") + '" target="_blank" rel="noopener noreferrer">Official source ↗</a>' +
      '</article>';
    }).join("") || '<div class="engine-empty">No automated feed records match this filter yet.</div>';
  }

  function buildStateFilter(){
    const select = qs("#autoFeedState");
    if(!select || !feed) return;
    const states = [...new Set((feed.records || []).map(r => r.state).filter(Boolean))].sort();
    select.innerHTML = '<option value="">All states</option>' + states.map(s => '<option>' + esc(s) + '</option>').join("");
  }

  function renderChicago(){
    const box = qs("#chicagoPublicData");
    if(!box || !feed) return;
    const rows = feed.chicago || [];
    box.innerHTML = rows.map(r =>
      '<article class="public-record-row"><b>' + esc(r.address) + '</b>' +
      '<span>Historical violation-search matches: ' + esc(r.violationsHistoricalMatches ?? "unavailable") + '</span>' +
      '<span>Permit-search matches: ' + esc(r.permitsMatches ?? "unavailable") + '</span>' +
      '<small>' + esc(r.note || "") + '</small></article>'
    ).join("") || '<div class="engine-empty">Public-record enrichment has not run yet.</div>';
  }

  async function load(){
    const status = qs("#autoFeedStatus");
    try{
      const res = await fetch("./data/auto-feed.json?v=" + Date.now(), {cache:"no-store"});
      if(!res.ok) throw new Error("feed unavailable");
      feed = await res.json();
      if(status) status.innerHTML = '<b>Engine:</b> ' + esc(feed.status || "unknown") + ' · refreshed ' + esc(fmtDate(feed.generatedAt));
      buildStateFilter();
      renderSources();
      renderHud();
      renderChicago();
    }catch(err){
      if(status) status.innerHTML = '<b>Engine:</b> feed waiting for first automated refresh.';
      const grid = qs("#autoFeedGrid");
      if(grid) grid.innerHTML = '<div class="engine-empty">The public-data engine is installed; the first refresh has not populated the feed yet.</div>';
    }
  }

  document.addEventListener("input", e => { if(e.target?.id === "autoFeedSearch") renderHud(); });
  document.addEventListener("change", e => { if(e.target?.id === "autoFeedState") renderHud(); });
  load();
})();
