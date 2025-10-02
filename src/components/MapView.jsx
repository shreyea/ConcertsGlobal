import React, { useEffect, useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const DEFAULT_CENTER = [20, 0];

function MapEventBridge({
  onSurfaceActivate
}) {
  useMapEvents({
    mousedown: (e) => {
      if (!e.originalEvent.target.closest('.leaflet-marker-icon')) {
        onSurfaceActivate();
      }
    },
    touchstart: (e) => {
      if (!e.originalEvent.target.closest('.leaflet-marker-icon')) {
        onSurfaceActivate();
      }
    },
    dragstart: () => onSurfaceActivate(),
    zoomstart: () => onSurfaceActivate()
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

  return (
    <div
      className={`globe-area-60 map-view ${isActive ? "globe-fullscreen" : ""} ${containerClassName}`.trim()}
      onClick={() => onSurfaceActivate()}
      role="presentation"
    >
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
          onSurfaceActivate={onSurfaceActivate}
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
                onSurfaceActivate();
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
}
