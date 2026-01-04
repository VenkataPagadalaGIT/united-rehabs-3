import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface StateMapProps {
  className?: string;
  showUSA?: boolean;
  latitude: number;
  longitude: number;
  stateName: string;
  stateAbbreviation?: string;
}

// USA center - shifted to show California in center
const usaCenter: L.LatLngExpression = [38, -115];

// Simplified state boundaries for highlighting (approximate polygons)
const stateBoundaries: Record<string, L.LatLngExpression[]> = {
  CA: [
    [42.0, -124.4], [42.0, -120.0], [39.0, -120.0], [35.0, -114.6],
    [34.5, -114.6], [32.7, -114.7], [32.5, -117.1], [33.0, -117.3],
    [33.5, -118.0], [34.0, -118.5], [34.5, -120.5], [35.8, -121.3],
    [37.0, -122.4], [38.0, -123.0], [39.0, -123.7], [40.0, -124.1],
    [41.0, -124.2], [42.0, -124.4]
  ],
  // Add more states as needed
};

export function StateMap({ 
  className = "", 
  showUSA = false, 
  latitude, 
  longitude, 
  stateName,
  stateAbbreviation = "CA"
}: StateMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapRef.current) return;

    // Clean up existing map
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const center: L.LatLngExpression = showUSA ? usaCenter : [latitude, longitude];
    const zoom = showUSA ? 3 : 6;

    const map = L.map(mapRef.current, {
      center,
      zoom,
      scrollWheelZoom: false,
      zoomControl: !showUSA,
      dragging: !showUSA,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);

    if (!showUSA) {
      // Add a custom marker for the state (fixes broken default icon)
      const customIcon = L.divIcon({
        className: 'custom-marker',
        html: `<div style="
          width: 24px;
          height: 24px;
          background: #f97316;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          border: 2px solid white;
          box-shadow: 0 2px 5px rgba(0,0,0,0.3);
        "></div>`,
        iconSize: [24, 24],
        iconAnchor: [12, 24],
      });
      
      L.marker([latitude, longitude], { icon: customIcon })
        .addTo(map)
        .bindPopup(`${stateName} - Rehab Centers`);
    } else {
      // Add highlighted polygon for the state
      const boundary = stateBoundaries[stateAbbreviation];
      if (boundary) {
        L.polygon(boundary, {
          color: '#f97316', // Orange border
          weight: 3,
          fillColor: '#f97316',
          fillOpacity: 0.4,
        }).addTo(map);
      }
      
      // Add a pulsing marker
      const pulsingIcon = L.divIcon({
        className: 'custom-pulsing-marker',
        html: `<div style="
          width: 12px;
          height: 12px;
          background: #f97316;
          border-radius: 50%;
          border: 2px solid white;
          box-shadow: 0 0 0 4px rgba(249, 115, 22, 0.3);
        "></div>`,
        iconSize: [12, 12],
        iconAnchor: [6, 6],
      });
      
      L.marker([latitude, longitude], { icon: pulsingIcon }).addTo(map);
    }

    mapInstanceRef.current = map;

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [showUSA, latitude, longitude, stateName, stateAbbreviation]);

  return (
    <div className={`relative ${className}`}>
      <div ref={mapRef} className="w-full h-full rounded-xl" style={{ minHeight: "100%" }} />
    </div>
  );
}
