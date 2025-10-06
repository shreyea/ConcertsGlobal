import React, { useEffect, useMemo } from "react";
import { createPortal } from 'react-dom';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const DEFAULT_CENTER = [20, 0];

function MapEventBridge() {
  // Intentionally left as a no-op for fullscreen activation.
  // Fullscreen / surface expansion should only occur when the user
  // explicitly clicks the fullscreen control.
  useMapEvents({
    mousedown: () => {},
    touchstart: () => {},
    dragstart: () => {},
    zoomstart: () => {}
  });
  return null;
}

function MapController({ positions, isVisible, isActive }) {
  const map = useMap();
  useEffect(() => {
    if (!map) return;
    // Defer to next tick so container sizing has applied
    const id = setTimeout(() => {
      map.invalidateSize();
      if (positions && positions.length > 0) {
        const bounds = L.latLngBounds(positions.map((e) => e.position));
        map.fitBounds(bounds, { padding: [30, 30], maxZoom: 6 });
      } else {
        map.setView(DEFAULT_CENTER, 2);
      }
    }, 50);
    return () => clearTimeout(id);
  }, [map, positions, isVisible, isActive]);
  return null;
}

function MapResizeWatcher() {
  const map = useMap();
  useEffect(() => {
    if (!map) return;
    const onResize = () => map.invalidateSize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [map]);
  return null;
}

export default function MapView({
  events = [],
  onMarkerClick = () => {},
  onSurfaceActivate = () => {},
  onSurfaceDeactivate = () => {},
  isActive = false,
  isVisible = false,
  containerClassName = ""
}) {
  const eventPositions = useMemo(
    () =>
      events
        .filter((e) => typeof e.lat === "number" && typeof e.lng === "number")
        .map((e) => ({ ...e, position: [e.lat, e.lng] })),
    [events]
  );

  const markerIcon = useMemo(
    () =>
      L.divIcon({
        className: "map-marker-icon",
        html: '<span class="marker-pulse"></span><span class="marker-core"></span>',
        iconSize: [26, 26],
        iconAnchor: [13, 13]
      }),
    []
  );

  const toggleFullscreen = (e) => {
    if (e && e.stopPropagation) e.stopPropagation();
    if (isActive) onSurfaceDeactivate();
    else onSurfaceActivate();
  };

  const content = (
    <div
      className={`globe-area-60 map-view ${isActive ? "globe-fullscreen" : ""} ${containerClassName}`.trim()}
      role="presentation"
    >
      {/* fullscreen toggle icon (top-left) - click only this to toggle fullscreen */}
      <button
        className="globe-fullscreen-btn"
        aria-label={isActive ? 'Exit fullscreen' : 'Enter fullscreen'}
        onClick={(e) => toggleFullscreen(e)}
        title={isActive ? 'minimize' : 'fullscreen'}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden>
          <g fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 9V3h6" />
            <path d="M21 9V3h-6" />
            <path d="M3 15v6h6" />
            <path d="M21 15v6h-6" />
          </g>
        </svg>
      </button>
      <MapContainer
        key={`${isVisible}-${isActive}`}
        center={DEFAULT_CENTER}
        zoom={2}
        minZoom={2}
        maxZoom={7}
        worldCopyJump
        zoomControl={false}
        attributionControl={false}
        style={{ width: "100%", height: "100%" }}
      >
        <MapController positions={eventPositions} isVisible={isVisible} isActive={isActive} />
        <MapResizeWatcher />
        <MapEventBridge
        />
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution="&copy; <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a> contributors"
        />
        {eventPositions.map((event) => (
          <Marker
            key={event.id}
            position={event.position}
            icon={markerIcon}
            eventHandlers={{
              click: () => {
                onMarkerClick(event);
              }
            }}
          >
            <Popup className="map-popup">
              <div className="map-popup-content">
                <h3>{event.artist || event.name}</h3>
                <p>{event.city}</p>
                {event.date ? <p>{event.date}</p> : null}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );

  if (isActive && typeof document !== 'undefined') {
    try {
      return createPortal(content, document.body);
    } catch (e) {
      return content;
    }
  }

  return content;
}
