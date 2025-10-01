import React, { useMemo } from "react";

export default function Filters({ events, continent, setContinent, artist, setArtist }) {
  const continents = useMemo(() => {
    const set = new Set(events.map(e => e.continent).filter(Boolean));
    return ["All", ...Array.from(set)];
  }, [events]);

  return (
    <div className="filters">
      <label>
        Continent:
        <select value={continent} onChange={(e) => setContinent(e.target.value)}>
          <option value="">All</option>
          {continents.filter(c => c !== "All").map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </label>

      <label>
        Artist:
        <input placeholder="Artist name" value={artist} onChange={e => setArtist(e.target.value)} />
      </label>
    </div>
  );
}
