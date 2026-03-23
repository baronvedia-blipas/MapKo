"use client";

import { useEffect, useRef, useCallback } from "react";
import { APIProvider, Map, useMap } from "@vis.gl/react-google-maps";

// Dark map style — matches scan-map.tsx dashboard aesthetic
const darkMapStyle = [
  { elementType: "geometry", stylers: [{ color: "#1a1a2e" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#1a1a2e" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#8892b0" }] },
  {
    featureType: "administrative.locality",
    elementType: "labels.text.fill",
    stylers: [{ color: "#b8c4d8" }],
  },
  {
    featureType: "poi",
    elementType: "labels.text.fill",
    stylers: [{ color: "#6b7894" }],
  },
  {
    featureType: "poi.park",
    elementType: "geometry",
    stylers: [{ color: "#1e2d3d" }],
  },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: "#2a2a4a" }],
  },
  {
    featureType: "road",
    elementType: "geometry.stroke",
    stylers: [{ color: "#1a1a2e" }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry",
    stylers: [{ color: "#3a3a5a" }],
  },
  {
    featureType: "transit",
    elementType: "geometry",
    stylers: [{ color: "#2a2a4a" }],
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#0e1a2b" }],
  },
  {
    featureType: "water",
    elementType: "labels.text.fill",
    stylers: [{ color: "#4a5568" }],
  },
];

function getZoomForRadius(radiusKm: number): number {
  if (radiusKm <= 0.5) return 16;
  if (radiusKm <= 1) return 15;
  if (radiusKm <= 2) return 14;
  if (radiusKm <= 5) return 13;
  if (radiusKm <= 10) return 12;
  return 11;
}

interface RadiusCircleProps {
  center: { lat: number; lng: number };
  radiusKm: number;
}

/**
 * Draws a circle overlay on the map showing the search radius.
 * Uses the Google Maps Circle class directly via the useMap hook.
 */
function RadiusCircle({ center, radiusKm }: RadiusCircleProps) {
  const map = useMap();
  const circleRef = useRef<google.maps.Circle | null>(null);

  const updateCircle = useCallback(() => {
    if (!map) return;

    if (!circleRef.current) {
      circleRef.current = new google.maps.Circle({
        map,
        center,
        radius: radiusKm * 1000,
        fillColor: "#3b82f6",
        fillOpacity: 0.1,
        strokeColor: "#3b82f6",
        strokeOpacity: 0.4,
        strokeWeight: 2,
      });
    } else {
      circleRef.current.setCenter(center);
      circleRef.current.setRadius(radiusKm * 1000);
    }

    // Pan and zoom to fit the circle
    map.panTo(center);
    map.setZoom(getZoomForRadius(radiusKm));
  }, [map, center, radiusKm]);

  useEffect(() => {
    updateCircle();
  }, [updateCircle]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (circleRef.current) {
        circleRef.current.setMap(null);
        circleRef.current = null;
      }
    };
  }, []);

  return null;
}

interface ScanPreviewMapProps {
  center: { lat: number; lng: number };
  radiusKm: number;
}

export function ScanPreviewMap({ center, radiusKm }: ScanPreviewMapProps) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY;

  if (!apiKey) {
    return (
      <div className="h-[280px] bg-slate-800/50 flex items-center justify-center rounded-lg border border-white/10">
        <p className="text-sm text-muted-foreground">
          Google Maps API key not configured
        </p>
      </div>
    );
  }

  return (
    <APIProvider apiKey={apiKey}>
      <div className="h-[280px] rounded-lg overflow-hidden border border-white/10">
        <Map
          defaultCenter={center}
          defaultZoom={getZoomForRadius(radiusKm)}
          mapId="mapko-preview-map"
          gestureHandling="cooperative"
          disableDefaultUI={true}
          zoomControl={true}
          mapTypeControl={false}
          streetViewControl={false}
          fullscreenControl={false}
          styles={darkMapStyle}
        >
          <RadiusCircle center={center} radiusKm={radiusKm} />
        </Map>
      </div>
    </APIProvider>
  );
}
