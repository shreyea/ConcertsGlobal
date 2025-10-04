import React, { createContext, useEffect, useRef, useState } from "react";

export const AppContext = createContext();

export function AppProvider({ children }) {
  const [user, setUser] = useState(null); // for future auth
  const [liked, setLiked] = useState(() => {
    try {
      const raw = localStorage.getItem("likedEvents");
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem("likedEvents", JSON.stringify(liked));
  }, [liked]);

  // Planned events/plans persisted locally. Stored as array of plan objects.
  const [planned, setPlanned] = useState(() => {
    try {
      const raw = localStorage.getItem('planned:v1');
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try { localStorage.setItem('planned:v1', JSON.stringify(planned)); } catch {}
  }, [planned]);

  function addPlanned(plan) {
    if (!plan) return;
    setPlanned(prev => {
      try {
        // normalization: prefer serverId if present
        const serverId = plan.serverId || plan.id;
        const makeSignature = (p) => {
          const evKey = getEventKey(p.event) || '';
          return `${evKey}|${p.budget||''}|${p.transport||''}|${p.seatingPref||''}|${p.numPeople||''}`;
        };

        // if serverId exists, dedupe by serverId first
        let existsIndex = -1;
        if (serverId) {
          existsIndex = prev.findIndex(p => (p.serverId && String(p.serverId) === String(serverId)) || String(p.id) === String(serverId));
        }

        // fallback: dedupe by signature
        if (existsIndex === -1) {
          const sig = makeSignature(plan);
          existsIndex = prev.findIndex(p => makeSignature(p) === sig);
        }

        // If already present, move it to top and update timestamp/serverId
        if (existsIndex >= 0) {
          const existing = prev[existsIndex];
          const updated = { ...existing, ...plan, createdAt: existing.createdAt || plan.createdAt };
          const next = [updated, ...prev.slice(0, existsIndex), ...prev.slice(existsIndex+1)];
          try { notify && notify('Plan already saved — moved to top'); } catch {}
          // record UI action for duplicate so calling UI can show inline message / animation
          try { setLastPlannedAction({ type: 'duplicate', id: updated.serverId || updated.id || null, at: Date.now() }); setLastMovedId(updated.serverId || updated.id || null); } catch {}
          return next.slice(0, 50);
        }

  // otherwise insert new at top
  const next = [plan, ...prev].slice(0, 50);
  try { setLastPlannedAction({ type: 'added', id: plan.serverId || plan.id || null, at: Date.now() }); setLastMovedId(plan.serverId || plan.id || null); } catch {}
  return next;
      } catch (e) {
        // fallback to naive prepend
        return [plan, ...prev].slice(0, 50);
      }
    });
    // update last planned timestamp (for UI pulse)
    try { setLastPlannedAt(Date.now()); } catch {}
    // notify caller via toast
    try { notify && notify(`Saved plan for "${plan.event?.name || 'Event'}"`); } catch {}
  }

  function clearPlanned() { setPlanned([]); }

  function removePlanned(id) {
    if (!id) return;
    // find item to check for serverId
    const target = planned.find(p => String(p.id) === String(id));
    // Optimistically remove locally
    setPlanned(prev => prev.filter(p => String(p.id) !== String(id)));
    // If there is a serverId, attempt to delete on server as best-effort and enqueue on failure
    (async () => {
      const serverId = target?.serverId || target?.id; // support older saved items where id may be server id
      if (!serverId) return;
      try {
        const proxyBase = import.meta.env.VITE_AI_PROXY_URL || 'http://localhost:4001';
        const auth = import.meta.env.VITE_PROXY_AUTH_TOKEN;
        const url = `${proxyBase.replace(/\/$/, '')}/plans/${encodeURIComponent(serverId)}`;
        const headers = {};
        if (auth) headers['x-proxy-auth'] = auth;
        const resp = await fetch(url, { method: 'DELETE', headers });
        if (!resp.ok) {
          // enqueue for retry
          setPendingDeletes(prev => {
            if (prev.some(p => p.serverId === serverId)) return prev;
            return [...prev, { serverId, attempts: 1, addedAt: Date.now() }];
          });
        }
      } catch (e) {
        setPendingDeletes(prev => {
          if (prev.some(p => p.serverId === serverId)) return prev;
          return [...prev, { serverId, attempts: 1, addedAt: Date.now() }];
        });
      }
    })();
  }

  function getPlannedById(id) {
    if (!id) return null;
    return planned.find(p => String(p.id) === String(id)) || null;
  }

  const [lastPlannedAt, setLastPlannedAt] = useState(null);

  // UI action tracking: when a plan is added or moved (duplicate), record for the UI
  const [lastPlannedAction, setLastPlannedAction] = useState(null); // { type: 'added'|'duplicate', id, at }
  const [lastMovedId, setLastMovedId] = useState(null);

  // pending server-side deletes retry queue
  const [pendingDeletes, setPendingDeletes] = useState(() => []); // [{ serverId, attempts }]

  // Currently active/loaded plan (user opened via Load). Persist briefly so navigation doesn't lose it.
  const [activePlan, setActivePlan] = useState(() => {
    try {
      const raw = localStorage.getItem('activePlan:v1');
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  });

  useEffect(() => {
    try { localStorage.setItem('activePlan:v1', JSON.stringify(activePlan)); } catch {}
  }, [activePlan]);

  // background retry worker for pending deletes (best-effort)
  useEffect(() => {
    if (!pendingDeletes || pendingDeletes.length === 0) return;
    const interval = setInterval(() => {
      const items = [...pendingDeletes];
      items.forEach(async (item) => {
        try {
          const proxyBase = import.meta.env.VITE_AI_PROXY_URL || 'http://localhost:4001';
          const auth = import.meta.env.VITE_PROXY_AUTH_TOKEN;
          const url = `${proxyBase.replace(/\/$/, '')}/plans/${encodeURIComponent(item.serverId)}`;
          const headers = {};
          if (auth) headers['x-proxy-auth'] = auth;
          const resp = await fetch(url, { method: 'DELETE', headers });
          if (resp.ok) {
            setPendingDeletes(prev => prev.filter(p => p.serverId !== item.serverId));
          } else {
            // increment attempts and drop if too many
            setPendingDeletes(prev => prev.map(p => p.serverId === item.serverId ? { ...p, attempts: (p.attempts || 0) + 1 } : p));
            if ((item.attempts || 0) + 1 >= 5) {
              // give up after 5 attempts
              setPendingDeletes(prev => prev.filter(p => p.serverId !== item.serverId));
              try { notify && notify(`Failed to delete plan ${item.serverId} after multiple attempts`); } catch {}
            }
          }
        } catch (e) {
          setPendingDeletes(prev => prev.map(p => p.serverId === item.serverId ? { ...p, attempts: (p.attempts || 0) + 1 } : p));
          if ((item.attempts || 0) + 1 >= 5) {
            setPendingDeletes(prev => prev.filter(p => p.serverId !== item.serverId));
            try { notify && notify(`Failed to delete plan ${item.serverId} after multiple attempts`); } catch {}
          }
        }
      });
    }, 30000);
    return () => clearInterval(interval);
  }, [pendingDeletes]);

  function updatePlannedServerId(localId, serverId) {
    if (!localId || !serverId) return;
    setPlanned(prev => prev.map(p => {
      if (String(p.id) === String(localId)) {
        return { ...p, serverId };
      }
      return p;
    }));
  }


  // Stable key generator for events: prefer _id or id, fall back to composite
  function getEventKey(event) {
    if (!event) return null;
    if (event._id) return String(event._id);
    if (event.id) return String(event.id);
    // fallback composite - include lat/lng to reduce collisions when fields are missing
    const name = (event.name || '').trim();
    const city = (event.city || '').trim();
    const date = (event.date || '').trim();
    const lat = (typeof event.lat === 'number') ? String(event.lat) : (event.location?.lat ? String(event.location.lat) : '');
    const lng = (typeof event.lng === 'number') ? String(event.lng) : (event.location?.lng ? String(event.location.lng) : '');
    return `${name}::${city}::${date}::${lat}::${lng}`;
  }

  function toggleLike(event) {
    const key = getEventKey(event);
    if (!key) return;
    setLiked(prev => {
      const exists = prev.some(e => getEventKey(e) === key);
      if (exists) return prev.filter(e => getEventKey(e) !== key);
      return [...prev, event];
    });
  }

  // Lightweight global toast notifications
  const [toast, setToast] = useState(null);
  const toastTimerRef = useRef(null);
  function notify(message, duration = 1600) {
    setToast(message);
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setToast(null), duration);
  }

  // tracked is an alias of liked for UI purposes while backend is pending
  const tracked = liked;
  const [trackedIds, setTrackedIds] = useState([]);

const toggleTrack = (eventId) => {
  setTrackedIds((prev) =>
    prev.includes(eventId) ? prev.filter((id) => id !== eventId) : [...prev, eventId]
  );
};

  return (
    <AppContext.Provider value={{
      user, setUser,
      liked, tracked, trackedIds, toggleTrack, toggleLike,
      getEventKey,
      toast, notify,
      planned, addPlanned, removePlanned, clearPlanned, getPlannedById, updatePlannedServerId,
      lastPlannedAt, lastPlannedAction, lastMovedId,
      pendingDeletes,
      activePlan, setActivePlan
    }}>
      {children}
    </AppContext.Provider>
  );
}
