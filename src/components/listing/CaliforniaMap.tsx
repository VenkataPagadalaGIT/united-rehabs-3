import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface StateMapProps {
  className?: string;
  showUSA?: boolean;
  latitude: number;
  longitude: number;
  stateName: string;
}

// USA center - shifted west to show California better
const usaCenter: L.LatLngExpression = [37.5, -96];

export function StateMap({ 
  className = "", 
  showUSA = false, 
  latitude, 
  longitude, 
  stateName 
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
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);

    if (!showUSA) {
      // Add a marker for the state
      L.marker([latitude, longitude])
        .addTo(map)
        .bindPopup(`${stateName} - Rehab Centers`);
    } else {
      // Add a marker for state location on USA map
      L.marker([latitude, longitude])
        .addTo(map);
    }

    mapInstanceRef.current = map;

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [showUSA, latitude, longitude, stateName]);

  return (
    <div className={`relative ${className}`}>
      <div ref={mapRef} className="w-full h-full rounded-xl" style={{ minHeight: "100%" }} />
      {showUSA && (
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
          <div className="bg-primary/20 border-2 border-primary rounded-lg px-3 py-1 text-sm font-medium text-primary">
            {stateName}
          </div>
        </div>
      )}
    </div>
  );
}
