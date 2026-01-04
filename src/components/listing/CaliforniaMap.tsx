import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface CaliforniaMapProps {
  className?: string;
  showUSA?: boolean;
}

// California center coordinates
const californiaCenter: L.LatLngExpression = [36.7783, -119.4179];
const usaCenter: L.LatLngExpression = [39.8283, -98.5795];

export function CaliforniaMap({ className = "", showUSA = false }: CaliforniaMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const center = showUSA ? usaCenter : californiaCenter;
    const zoom = showUSA ? 4 : 6;

    const map = L.map(mapRef.current, {
      center,
      zoom,
      scrollWheelZoom: false,
      zoomControl: !showUSA,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);

    if (!showUSA) {
      // Add a marker for California
      L.marker(californiaCenter as L.LatLngExpression)
        .addTo(map)
        .bindPopup("California - Rehab Centers");
    }

    mapInstanceRef.current = map;

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [showUSA]);

  return (
    <div className={`relative ${className}`}>
      <div ref={mapRef} className="w-full h-full rounded-xl" style={{ minHeight: "100%" }} />
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
