import React, { useState, useEffect, useContext } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import BackgroundParticles from "../components/BackgroundParticles";
import MapView from "../components/MapView";
import { AppContext } from "../context/AppContext";

export default function Plan() {
  const location = useLocation();
  const navigate = useNavigate();
  const params = useParams();
  const eventFromState = location.state?.event || null;
  const planIdFromState = location.state?.planId || null;
  const planIdFromUrl = params?.id || null;
  const { addPlanned, getPlannedById, removePlanned, notify, updatePlannedServerId, planned, lastPlannedAction, lastMovedId, activePlan, setActivePlan, getEventKey } = useContext(AppContext);
  function handleBack() {
    try {
      // clear any transient active plan when navigating away
      try { setActivePlan && setActivePlan(null); } catch {}
      // if there's a history entry, go back; otherwise go to home
      if (window.history && window.history.length > 1) {
        navigate(-1);
      } else {
        navigate('/');
      }
    } catch (e) {
      try { navigate('/'); } catch {}
    }
  }
  const [showInlineAction, setShowInlineAction] = useState(false);
  const [highlightId, setHighlightId] = useState(null);

  useEffect(() => {
    if (!lastPlannedAction) return;
    setShowInlineAction(true);
    const t = setTimeout(() => setShowInlineAction(false), 2000);
    return () => clearTimeout(t);
  }, [lastPlannedAction]);

  useEffect(() => {
    if (!lastMovedId) return;
    setHighlightId(lastMovedId);
    const t = setTimeout(() => setHighlightId(null), 900);
    return () => clearTimeout(t);
  }, [lastMovedId]);
  const [loadedPlanState, setLoadedPlanState] = useState(null);
  let loadedPlan = null;
  if (planIdFromState) loadedPlan = getPlannedById(planIdFromState);
  // if url param provided, try to find locally first, otherwise use loadedPlanState (from server)
  if (!loadedPlan && planIdFromUrl) {
    // try local lookup by id
    const local = getPlannedById(planIdFromUrl);
    if (local) loadedPlan = local;
    else loadedPlan = loadedPlanState;
  }
  const event = eventFromState || (loadedPlan ? loadedPlan.event : null);
  // If an active plan is present (user clicked Load), prefer its event/details
  const active = activePlan || null;
  const displayEvent = eventFromState || (active ? active.event : (loadedPlan ? loadedPlan.event : null));
  const currentEvent = displayEvent;

  const [budget, setBudget] = useState(100);
  const [transport, setTransport] = useState('car');
  const [seatingPref, setSeatingPref] = useState('standard');
  const [numPeople, setNumPeople] = useState(1);

  // Simple suggestion logic (mock): breakdown costs and suggestions based on budget
  function computeSuggestions() {
    if (!currentEvent) return { suggestions: [], summary: {} };
    const baseTicket = seatingPref === 'vip' ? 120 : seatingPref === 'premium' ? 80 : 40;
    const transportCost = transport === 'flight' ? 150 : transport === 'train' ? 40 : 20;
    const accommodation = budget > 300 && numPeople > 1 ? 80 : (budget > 200 ? 50 : 0);

    const ticketTotal = baseTicket * numPeople;
    const totalEstimate = ticketTotal + transportCost + accommodation;

    const suggestions = [];
    if (totalEstimate <= budget) {
      suggestions.push({ title: 'Within budget', detail: `Estimated total ${totalEstimate} (tickets ${ticketTotal} + travel ${transportCost} + lodging ${accommodation})` });
      suggestions.push({ title: 'Buy now', detail: 'Tickets are within your budget — consider purchasing early to secure seats.' });
    } else {
      suggestions.push({ title: 'Over budget', detail: `Estimated total ${totalEstimate}. Increase budget or change options (seating/transport).` });
      suggestions.push({ title: 'Cheaper options', detail: 'Choose Standard seating or travel by car to reduce costs.' });
    }

    // Add contextual suggestions
    if (currentEvent.city && currentEvent.city.toLowerCase() !== 'online') {
      suggestions.push({ title: 'Local tips', detail: `Consider local transit passes in ${currentEvent.city} or carpooling with friends.` });
    }

    return { suggestions, summary: { ticketTotal, transportCost, accommodation, totalEstimate } };
  }

  const { suggestions, summary } = computeSuggestions();

  const [savedPlans, setSavedPlans] = useState([]);
  const [savedMsg, setSavedMsg] = useState('');
  const [justSavedPlanId, setJustSavedPlanId] = useState(null);
  const [showPlannedModal, setShowPlannedModal] = useState(false);
  const [isSavedFlag, setIsSavedFlag] = useState(false);
  const [savedSignature, setSavedSignature] = useState(null);
  const [transitEstimates, setTransitEstimates] = useState(null);
  const [aiEnabled, setAiEnabled] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState([]);
  const savedTimerRef = React.useRef(null);
  

  useEffect(() => {
    try {
      const raw = localStorage.getItem('plans:v1');
      setSavedPlans(raw ? JSON.parse(raw) : []);
    } catch { setSavedPlans([]); }
  }, []);

  // If this page was opened with a planId, load its settings into the editor
  useEffect(() => {
    // if opened with a planId via navigation state, load it
    if (planIdFromState && loadedPlan) {
      try {
        setBudget(loadedPlan.budget || 100);
        setTransport(loadedPlan.transport || 'car');
        setSeatingPref(loadedPlan.seatingPref || 'standard');
        setNumPeople(loadedPlan.numPeople || 1);
      } catch (e) { /* ignore */ }
      return;
    }
    // if opened via URL param, and we don't have the plan locally, fetch it from server
    if (planIdFromUrl && !loadedPlanState) {
      (async () => {
        try {
          const proxyBase = import.meta.env.VITE_AI_PROXY_URL || 'http://localhost:4001';
          const url = `${proxyBase.replace(/\/$/, '')}/plans/${encodeURIComponent(planIdFromUrl)}`;
          const headers = {};
          const auth = import.meta.env.VITE_PROXY_AUTH_TOKEN;
          if (auth) headers['x-proxy-auth'] = auth;
          const resp = await fetch(url, { method: 'GET', headers });
          if (!resp.ok) throw new Error('not found');
          const body = await resp.json();
          if (body && body.plan) {
            setLoadedPlanState(body.plan);
            // populate editor with fetched plan
            setBudget(body.plan.budget || 100);
            setTransport(body.plan.transport || 'car');
            setSeatingPref(body.plan.seatingPref || 'standard');
            setNumPeople(body.plan.numPeople || 1);
          }
        } catch (err) {
          console.warn('fetch plan failed', err);
          notify && notify('Unable to load shared plan');
        }
      })();
    }
  }, [planIdFromState, loadedPlan, planIdFromUrl, loadedPlanState]);

  // If an activePlan was set (via Load), populate editor with its values
  useEffect(() => {
    if (!active) return;
    try {
      setBudget(active.budget || 100);
      setTransport(active.transport || 'car');
      setSeatingPref(active.seatingPref || 'standard');
      setNumPeople(active.numPeople || 1);
    } catch (e) { /* ignore */ }
  }, [active]);

  // Clear saved flag if user changes inputs after saving
  useEffect(() => {
    if (isSavedFlag) {
      // any change to the main inputs should clear the saved visual after user edits
      if (savedTimerRef.current) {
        clearTimeout(savedTimerRef.current);
        savedTimerRef.current = null;
      }
      setIsSavedFlag(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [budget, transport, seatingPref, numPeople]);

  // cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (savedTimerRef.current) {
        clearTimeout(savedTimerRef.current);
        savedTimerRef.current = null;
      }
    };
  }, []);

  // Request user geolocation for transit estimates
  useEffect(()=>{
    if (!('geolocation' in navigator)) return;
    navigator.geolocation.getCurrentPosition((p)=>{
      window.__USER_LAT__ = p.coords.latitude;
      window.__USER_LNG__ = p.coords.longitude;
      const te = computeTransitEstimates(currentEvent, numPeople);
      setTransitEstimates(te);
    }, ()=>{
      // ignore
    }, { maximumAge: 60*60*1000, timeout: 5000 });
  }, [currentEvent]);

  function persistPlans(plans) {
    try { localStorage.setItem('plans:v1', JSON.stringify(plans)); } catch {}
  }

  // Make a deterministic signature for a plan so we can detect duplicates across saves
  function normalizeString(v) {
    try { return String(v || '').trim().toLowerCase(); } catch { return ''; }
  }

  function makeSignatureFor({ event: ev, budget: b, transport: t, seatingPref: s, numPeople: n } = {}) {
    try {
      const rawKey = getEventKey ? getEventKey(ev) : (ev?._id || ev?.id || `${ev?.name}::${ev?.city}::${ev?.date}`);
      const evKey = normalizeString(rawKey);
      return `${evKey}|${normalizeString(b)}|${normalizeString(t)}|${normalizeString(s)}|${normalizeString(n)}`;
    } catch (e) { return null; }
  }

  // Keep saved flag in sync: if the current inputs match an existing planned item, mark as saved
  useEffect(() => {
    const sig = makeSignatureFor({ event: currentEvent, budget, transport, seatingPref, numPeople });
    if (!sig) {
      setIsSavedFlag(false);
      setSavedSignature(null);
      return;
    }

    // If we previously saved this exact signature, keep saved state
    if (savedSignature && savedSignature === sig) {
      setIsSavedFlag(true);
      return;
    }

    // Check planned list for an existing matching signature
    const found = Array.isArray(planned) && planned.find(p => makeSignatureFor(p) === sig);
    if (found) {
      setIsSavedFlag(true);
      setSavedSignature(sig);
      // record the justSavedPlanId if available
      try { setJustSavedPlanId(found.serverId || found.id); } catch {}
    } else {
      setIsSavedFlag(false);
      setSavedSignature(null);
    }
  }, [planned, budget, transport, seatingPref, numPeople, currentEvent]);

  // Debug toggle for signature overlay
  const [showSigDebug, setShowSigDebug] = useState(false);
  useEffect(()=>{
    try {
      if (showSigDebug) document.body.classList.add('debug-click');
      else document.body.classList.remove('debug-click');
    } catch(e){}
  }, [showSigDebug]);

  function handleSavePlan() {
    const plan = { id: Date.now(), event: currentEvent || null, budget, transport, seatingPref, numPeople, summary, createdAt: new Date().toISOString() };

    const sig = makeSignatureFor(plan);

    // If central planned list already has this signature, move-to-top and don't add a duplicate
    try {
      const plannedExists = Array.isArray(planned) && planned.find(p => makeSignatureFor(p) === sig);
      if (plannedExists) {
        try { addPlanned(plannedExists); } catch (e) { console.warn('addPlanned failed', e); }
        // ensure savedPlans reflects it (move to top or prepend)
        const existsIndex = savedPlans.findIndex(p => makeSignatureFor(p) === sig);
        if (existsIndex >= 0) {
          const existing = savedPlans[existsIndex];
          const next = [existing, ...savedPlans.slice(0, existsIndex), ...savedPlans.slice(existsIndex+1)].slice(0,20);
          setSavedPlans(next);
          persistPlans(next);
        } else {
          const next = [plannedExists, ...savedPlans].slice(0,20);
          setSavedPlans(next);
          persistPlans(next);
        }
        setSavedMsg('Plan already planned');
        notify && notify('Plan already planned');
        try { setSavedSignature(sig); setIsSavedFlag(true); setJustSavedPlanId(plannedExists.serverId || plannedExists.id || plannedExists.id); } catch {};
        return;
      }
    } catch (e) {
      console.warn('planned check failed', e);
    }

    // Check savedPlans for duplicates and either move-to-top or add
    try {
      const existsIndex = savedPlans.findIndex(p => makeSignatureFor(p) === sig);
      if (existsIndex >= 0) {
        const existing = savedPlans[existsIndex];
        const next = [existing, ...savedPlans.slice(0, existsIndex), ...savedPlans.slice(existsIndex+1)].slice(0,20);
        setSavedPlans(next);
        persistPlans(next);
        setSavedMsg('Plan already saved');
        notify && notify('Plan already saved');
        try { addPlanned(existing); } catch (e) { console.warn('addPlanned failed', e); }
        try { setSavedSignature(sig); setIsSavedFlag(true); setJustSavedPlanId(existing.serverId || existing.id); } catch {}
      } else {
        const next = [plan, ...savedPlans].slice(0, 20);
        setSavedPlans(next);
        persistPlans(next);
        setSavedMsg('Plan saved');
        notify && notify('Plan saved');
        try { addPlanned(plan); } catch (e) { console.warn('addPlanned failed', e); }
        try { setSavedSignature(sig); setIsSavedFlag(true); setJustSavedPlanId(plan.id); } catch {}
      }
    } catch (e) {
      console.warn('save flow failed', e);
    }

    // Do not auto-clear saved flag here; it should clear when user edits inputs (handled by effect above)

    // attempt server save as well (fire-and-forget)
    (async () => {
      try {
        const proxyBase = import.meta.env.VITE_AI_PROXY_URL || 'http://localhost:4001';
        const url = `${proxyBase.replace(/\/$/, '')}/plans`;
        const headers = { 'Content-Type': 'application/json' };
        const auth = import.meta.env.VITE_PROXY_AUTH_TOKEN;
        if (auth) headers['x-proxy-auth'] = auth;
        const resp = await fetch(url, { method: 'POST', headers, body: JSON.stringify(plan) });
        if (resp.ok) {
          const body = await resp.json();
          if (body && body.id) {
            setJustSavedPlanId(body.id);
            try { updatePlannedServerId(plan.id, body.id); } catch (e) {}
          }
        }
      } catch (err) {
        // ignore network errors here
      }
    })();
  }

  // helper: delete plan both locally and from planned list
  function handleDeleteLocalPlan(id) {
    try {
      const next = savedPlans.filter(p => String(p.id) !== String(id));
      setSavedPlans(next);
      persistPlans(next);
      try { removePlanned(id); } catch {}
      setSavedMsg('Plan deleted');
      setTimeout(()=>setSavedMsg(''),1200);
    } catch (e) { console.warn('delete failed', e); }
  }

  async function handleSharePlan(p) {
    try {
      const payload = JSON.stringify(p);
      await navigator.clipboard.writeText(payload);
      setSavedMsg('Plan copied to clipboard');
      setTimeout(()=>setSavedMsg(''), 2000);
    } catch (err) {
      console.warn('Share failed', err);
      setSavedMsg('Unable to copy');
      setTimeout(()=>setSavedMsg(''), 2000);
    }
  }

  async function handleShareAsLink(currentPlan) {
    try {
      const proxyBase = import.meta.env.VITE_AI_PROXY_URL || 'http://localhost:4001';
      const url = `${proxyBase.replace(/\/$/, '')}/plans`;
      const headers = { 'Content-Type': 'application/json' };
      const auth = import.meta.env.VITE_PROXY_AUTH_TOKEN;
      if (auth) headers['x-proxy-auth'] = auth;
      
      const resp = await fetch(url, { method: 'POST', headers, body: JSON.stringify(currentPlan) });
      if (!resp.ok) throw new Error('save failed');
      const body = await resp.json();
      const id = body && body.id;
      if (!id) throw new Error('no id');
      const shareUrl = `${window.location.origin}/plans/${id}`;
      await navigator.clipboard.writeText(shareUrl);
      setSavedMsg('Shareable link copied');
      setTimeout(()=>setSavedMsg(''),2000);
    } catch (err) {
      console.warn('share link failed', err);
      setSavedMsg('Unable to create link');
      setTimeout(()=>setSavedMsg(''),2000);
    }
  }

  // compute distance (km) between two coords
  function distanceKm(lat1, lon1, lat2, lon2){
    if ([lat1,lon1,lat2,lon2].some(v=>typeof v !== 'number')) return null;
    const R = 6371;
    const dLat = (lat2-lat1) * Math.PI/180;
    const dLon = (lon2-lon1) * Math.PI/180;
    const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLon/2)**2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  }

  function computeTransitEstimates(ev, numPeople=1){
    if (!ev || typeof ev.lat !== 'number' || typeof ev.lng !== 'number') return null;
    // For demo, assume user at 0,0 or use navigator geolocation if available
    const userLat = (window.__USER_LAT__ ?? null);
    const userLng = (window.__USER_LNG__ ?? null);
    // If no user location, skip distance-based estimates
    if (userLat == null || userLng == null) return null;
    const d = distanceKm(userLat, userLng, ev.lat, ev.lng);
    if (d == null) return null;
    // Simple heuristics
    const car = { timeMin: Math.round((d / 80) * 60), costUsd: Math.round(d * 0.35 * numPeople) };
    const train = { timeMin: Math.round((d / 100) * 60), costUsd: Math.round(d * 0.15 * numPeople) };
    const flight = { timeMin: Math.round((d / 600) * 60) + 90, costUsd: Math.round(80 + d * 0.08 * numPeople) };
    return { distanceKm: d.toFixed(1), car, train, flight };
  }

  async function generateAiSuggestions() {
    if (!currentEvent) return;
    setAiLoading(true);
    setAiSuggestions([]);
    const proxyBase = import.meta.env.VITE_AI_PROXY_URL || 'http://localhost:4001';
    const url = `${proxyBase.replace(/\/$/, '')}/ai/suggest`;
    const headers = { 'Content-Type': 'application/json' };
    const auth = import.meta.env.VITE_PROXY_AUTH_TOKEN;
    if (auth) headers['x-proxy-auth'] = auth;
    try {
  const resp = await fetch(url, { method: 'POST', headers, body: JSON.stringify({ event: currentEvent, budget, transport, seatingPref, numPeople, summary }) });
      const body = await resp.json();
      
      // Handle error responses
      if (!resp.ok || body.error) {
        const errorMsg = body.error || body.details || 'AI service unavailable';
        console.warn('AI error:', errorMsg);
        setAiSuggestions([{ 
          title: '⚠️ AI Service Error', 
          detail: `The AI service encountered an issue: ${errorMsg}. Please check that your OpenAI API key is valid and has available quota.`,
          suggestedChanges: undefined
        }]);
        setAiLoading(false);
        return;
      }

      let recs = [];
      if (Array.isArray(body.suggestions)) {
        recs = body.suggestions.map((s) => {
          const sanitized = {
            title: String(s.title || '').slice(0, 180),
            detail: String(s.detail || s.recommendation || '').slice(0, 1000),
            suggestedChanges: typeof s.suggestedChanges === 'object' && s.suggestedChanges ? s.suggestedChanges : undefined
          };
          return sanitized;
        });
      } else if (Array.isArray(body)) {
        recs = body.map((s) => ({ title: s.title || 'AI', detail: s.detail || JSON.stringify(s), suggestedChanges: s.suggestedChanges }));
      } else if (body.raw) {
        // fallback: show raw text
        recs = [{ title: 'AI Response', detail: String(body.raw), suggestedChanges: undefined }];
      }
      
      if (recs.length === 0) {
        recs = [{ title: 'No suggestions', detail: 'AI did not return any recommendations. Try adjusting your budget or preferences.', suggestedChanges: undefined }];
      }
      
      // Attach apply handlers for suggestedChanges
      const withApply = recs.map(r => ({ ...r, apply: () => {
        try {
          if (r.suggestedChanges) {
            const sc = r.suggestedChanges;
            if (sc.seatingPref) setSeatingPref(sc.seatingPref);
            if (sc.transport) setTransport(sc.transport);
            if (typeof sc.budgetAdjustment === 'number') setBudget(prev => Math.max(0, prev + sc.budgetAdjustment));
            if (typeof sc.numPeople === 'number') setNumPeople(sc.numPeople);
          }
        } catch (e) { console.warn('apply suggestion failed', e); }
      }}));

      setAiSuggestions(withApply);
    } catch (err) {
      console.warn('AI request failed', err);
      setAiSuggestions([{ 
        title: '❌ Connection Error', 
        detail: `Could not connect to AI proxy server at ${url}. Make sure the server is running (npm run start:ai) and accessible.`,
        suggestedChanges: undefined 
      }]);
    } finally {
      setAiLoading(false);
    }
  }

  function applyAiRecommendation(rec) {
    try {
      rec.apply && rec.apply();
      setSavedMsg('Applied recommendation');
      setTimeout(()=>setSavedMsg(''),1200);
    } catch (err) { console.warn('apply failed', err); }
  }

  return (
    <div className="page-root page-plan" style={{ position: 'relative', minHeight: '100vh', overflow: 'hidden' }}>
      <BackgroundParticles />
      <div className="plan-container">
        <header className="plan-header">
          <div className="plan-header-left">
            <button className="plan-back" onClick={handleBack} aria-label="Back">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <div>
              <h2 className="plan-title">Plan for {displayEvent ? displayEvent.name : 'Event'}</h2>
              {displayEvent && <div className="muted plan-subtitle">{displayEvent.artist} • {displayEvent.city} • {displayEvent.date}</div>}
            </div>
          </div>
          <div className="plan-header-right">
            <div className="planned-badge" onClick={() => setShowPlannedModal(true)} style={{ cursor: 'pointer' }}>
              📌 Planned{Array.isArray(planned) && planned.length ? ` (${planned.length})` : ''}
            </div>
            <div style={{ marginLeft: 12 }}>
              <button className="btn" onClick={() => setShowSigDebug(s => !s)}>{showSigDebug ? 'Hide Sig Debug' : 'Show Sig Debug'}</button>
            </div>
          </div>
        </header>

        <main className="plan-main">
          <section className="plan-editor">
            <div className="plan-card">
              <div className="plan-row">
                <label>Budget (USD)</label>
                <input type="number" value={budget} onChange={(e)=>setBudget(Number(e.target.value))} className="plan-input plan-input-narrow" />
              </div>

              <div className="plan-row">
                <label>Transport</label>
                <select value={transport} onChange={(e)=>setTransport(e.target.value)} className="plan-input">
                  <option value="car">Car</option>
                  <option value="train">Train</option>
                  <option value="flight">Flight</option>
                </select>
              </div>

              <div className="plan-row">
                <label>Seating</label>
                <select value={seatingPref} onChange={(e)=>setSeatingPref(e.target.value)} className="plan-input">
                  <option value="standard">Standard</option>
                  <option value="premium">Premium</option>
                  <option value="vip">VIP</option>
                </select>
              </div>

              <div className="plan-row">
                <label>People</label>
                <input type="number" min="1" value={numPeople} onChange={(e)=>setNumPeople(Number(e.target.value))} className="plan-input plan-input-narrow" />
              </div>

              <div className="plan-suggestions">
                <div className="plan-suggestions-header">
                  <h3>Suggestions</h3>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <label style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <input type="checkbox" checked={aiEnabled} onChange={(e)=>setAiEnabled(e.target.checked)} /> Enable AI
                    </label>
                    {aiEnabled && (
                      <button className="btn" onClick={generateAiSuggestions}>{aiLoading ? <span className="ai-spinner"/> : 'Generate AI suggestions'}</button>
                    )}
                    <span className="muted">{savedMsg}</span>
                  </div>
                </div>

                <div className="suggestions-list">
                  {suggestions.map((s, idx) => (
                    <div key={idx} className="suggestion-item">
                      <strong>{s.title}</strong>
                      <div className="muted">{s.detail}</div>
                    </div>
                  ))}
                </div>

                {aiEnabled && aiSuggestions.length > 0 && (
                  <div className="ai-block">
                    <h4 className="ai-badge">AI Recommendations</h4>
                    {aiSuggestions.map((a, i) => (
                      <div key={i} className="ai-suggestion">
                        <strong>{a.title}</strong>
                        <div className="muted">{a.detail}</div>
                        <div className="ai-actions">
                          <button className="btn" onClick={() => applyAiRecommendation(a)}>Apply</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="plan-actions">
                <button className="btn btn-primary" onClick={handleSavePlan} disabled={isSavedFlag}>{isSavedFlag ? 'Saved' : 'Save Plan'}</button>
                <button className="btn" onClick={() => window.open(currentEvent?.tickets || '#', '_blank')}>Go to Tickets</button>
                {justSavedPlanId && (
                  <button className="btn" onClick={() => {
                    const shareUrl = `${window.location.origin}/plans/${justSavedPlanId}`;
                    navigator.clipboard.writeText(shareUrl).then(() => {
                      setSavedMsg('Share link copied');
                      setTimeout(()=>setSavedMsg(''), 1600);
                    });
                  }}>Share</button>
                )}
                <span className="muted" style={{ marginLeft: 12 }}>{savedMsg}</span>
              </div>
            </div>
          </section>

          <aside className="plan-sidebar">
            <div className="plan-card">
              {currentEvent && <div className="map-wrap"><MapView events={[currentEvent]} onMarkerClick={()=>{}} isVisible={true} isActive={false} /></div>}
              <div style={{ marginTop: 10 }}>
                <h4>Estimate</h4>
                <div className="muted">Tickets: ${summary.ticketTotal || 0}</div>
                <div className="muted">Transport: ${summary.transportCost || 0}</div>
                <div className="muted">Lodging: ${summary.accommodation || 0}</div>
                <hr />
                <div style={{ fontWeight: 700 }}>Total: ${summary.totalEstimate || 0}</div>
              </div>

              {transitEstimates && (
                <div style={{ marginTop: 12 }}>
                  <h4>Transit estimates</h4>
                  <div className="muted">Distance: {transitEstimates.distanceKm} km</div>
                  <div className="muted">Car — {transitEstimates.car.timeMin} min • ${transitEstimates.car.costUsd}</div>
                  <div className="muted">Train — {transitEstimates.train.timeMin} min • ${transitEstimates.train.costUsd}</div>
                  <div className="muted">Flight — {transitEstimates.flight.timeMin} min • ${transitEstimates.flight.costUsd}</div>
                </div>
              )}

              <div style={{ marginTop: 12 }}>
                <h4>Quick tips</h4>
                <ul className="muted">
                  <li>Book early for better seats and lower prices.</li>
                  <li>Check public transport night schedules if the show ends late.</li>
                  <li>Group discounts may apply for larger parties.</li>
                </ul>
              </div>
            </div>
          </aside>
        </main>
      </div>
      {showPlannedModal && (
        <div className="planned-modal" style={{ position: 'fixed', left: 0, right: 0, top: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }} onClick={() => setShowPlannedModal(false)}>
          <div style={{ background: '#071122', padding: 18, borderRadius: 10, width: 680, maxHeight: '80vh', overflow: 'auto' }} onClick={(e)=>e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <h3 style={{ margin: 0 }}>Planned</h3>
              <button className="btn" onClick={() => setShowPlannedModal(false)}>Close</button>
            </div>
            {showInlineAction && lastPlannedAction && (
              <div style={{ marginBottom: 10, padding: '8px 10px', borderRadius: 8, background: 'linear-gradient(90deg, rgba(59,130,246,0.08), rgba(96,165,250,0.04))', border: '1px solid rgba(59,130,246,0.12)', color: 'var(--text-secondary)' }}>
                {lastPlannedAction.type === 'duplicate' ? 'Plan already saved — moved to top' : 'Plan added to Planned'}
              </div>
            )}
            {(!planned || planned.length === 0) ? (
              <div className="muted">No planned items yet.</div>
            ) : (
              <ul>
                {planned.map((p, idx) => (
                  <li key={p.id || idx} style={{ marginBottom: 12 }}>
                    <div className={`planned-item ${highlightId && String(p.id) === String(highlightId) ? 'moved' : ''}`}>
                      <strong>{p.event?.name || 'Custom plan'}</strong>
                      <div className="muted">{p.event?.city} • {p.createdAt ? new Date(p.createdAt).toLocaleString() : ''}</div>
                      <div style={{ marginTop: 8 }}>
                        <button className="btn" onClick={() => { try { setActivePlan(p); } catch {} setBudget(p.budget); setTransport(p.transport); setSeatingPref(p.seatingPref); setNumPeople(p.numPeople); setShowPlannedModal(false); }}>Load</button>
                        {p.id ? (
                          <button className="btn" style={{ marginLeft: 8 }} onClick={async () => {
                            try {
                              const shareUrl = `${window.location.origin}/plans/${p.id}`;
                              await navigator.clipboard.writeText(shareUrl);
                              notify && notify('Share link copied');
                            } catch (e) {
                              // fallback: open in new tab
                              window.open(`/plans/${p.id}`, '_blank');
                            }
                          }}>Share</button>
                        ) : (
                          <button className="btn" style={{ marginLeft: 8 }} onClick={() => { handleShareAsLink(p); }}>Share</button>
                        )}
                        <button className="btn" style={{ marginLeft: 8 }} onClick={() => { try { removePlanned(p.id); } catch {} }}>Remove</button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
      {showSigDebug && (
        <div className="signature-debug" role="region" aria-label="Signature debug">
          <h4>Plan Signature Debug</h4>
          <div><strong>Current signature</strong></div>
          <pre>{makeSignatureFor({ event: currentEvent, budget, transport, seatingPref, numPeople })}</pre>
          <div style={{ marginTop: 8 }}><strong>Planned signatures</strong></div>
          <div className="sig-list">
            {Array.isArray(planned) && planned.length ? planned.map((p, i) => (
              <div key={p.id || i} style={{ marginBottom: 8 }}>
                <div style={{ fontWeight: 700 }}>{p.event?.name || 'Custom'}</div>
                <pre>{makeSignatureFor(p)}</pre>
              </div>
            )) : <div className="muted">No planned items</div>}
          </div>
        </div>
      )}
    </div>
  );
}
