import { MapContainer, TileLayer, Marker, Popup, GeoJSON } from "react-leaflet";
import { LatLngExpression } from "leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect, useState } from "react";
import L from "leaflet";

// Fix for default marker icon
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

const DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

interface CaliforniaMapProps {
  className?: string;
  showUSA?: boolean;
}

// California center coordinates
const californiaCenter: LatLngExpression = [36.7783, -119.4179];
const usaCenter: LatLngExpression = [39.8283, -98.5795];

export function CaliforniaMap({ className = "", showUSA = false }: CaliforniaMapProps) {
  const center = showUSA ? usaCenter : californiaCenter;
  const zoom = showUSA ? 4 : 6;

  return (
    <div className={`relative ${className}`}>
      <MapContainer
        center={center}
        zoom={zoom}
        scrollWheelZoom={false}
        className="w-full h-full rounded-xl"
        style={{ minHeight: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {!showUSA && (
          <Marker position={californiaCenter}>
            <Popup>California - Rehab Centers</Popup>
          </Marker>
        )}
      </MapContainer>
      {showUSA && (
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
          <div className="bg-primary/20 border-2 border-primary rounded-lg px-3 py-1 text-sm font-medium text-primary">
            California
          </div>
        </div>
      )}
    </div>
  );
}
