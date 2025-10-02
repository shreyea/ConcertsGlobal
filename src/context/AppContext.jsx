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
    <AppContext.Provider value={{ user, setUser, liked, tracked, trackedIds, toggleTrack, toggleLike, getEventKey, toast, notify }}>
      {children}
    </AppContext.Provider>
  );
}
