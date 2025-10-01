import React, { createContext, useEffect, useState } from "react";

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

  function toggleLike(event) {
    setLiked(prev => (prev.some(e => e.id === event.id) ? prev.filter(e => e.id !== event.id) : [...prev, event]));
  }

  return (
    <AppContext.Provider value={{ user, setUser, liked, toggleLike }}>
      {children}
    </AppContext.Provider>
  );
}
