import React, { useMemo } from 'react';
import Globe from 'react-globe.gl';

const ThreatMap = ({ threats }) => {
  // Map country names to coordinates (simplified for demo)
  const countryCoords = {
    'Russia': { lat: 61.524, lng: 105.318 },
    'China': { lat: 35.861, lng: 104.195 },
    'USA': { lat: 37.090, lng: -95.712 },
    'Ukraine': { lat: 48.379, lng: 31.165 },
    'Netherlands': { lat: 52.132, lng: 5.291 },
    'Internal': { lat: 38.0, lng: -77.0 }, // Represent internal as a specific point (e.g., DC)
    'Unknown': { lat: 0, lng: 0 }
  };

  const targetCoords = { lat: 38.0, lng: -77.0 }; // Assume target is US-based for demo

  const arcsData = useMemo(() => {
    return threats
      .filter(t => t.status === 'active' || t.status === 'investigating')
      .map(t => ({
        startLat: countryCoords[t.country] ? countryCoords[t.country].lat : 0,
        startLng: countryCoords[t.country] ? countryCoords[t.country].lng : 0,
        endLat: targetCoords.lat,
        endLng: targetCoords.lng,
        color: t.severity === 'critical' ? '#ef4444' : '#f59e0b',
        label: t.title
      }));
  }, [threats]);

  return (
    <div className="bg-slate-900/50 rounded-xl overflow-hidden border border-slate-800 h-[400px] relative map-glow">
      <div className="absolute top-4 left-4 z-10">
        <h3 className="text-white font-semibold flex items-center gap-2">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
          </span>
          Live Threat Visualization (3D)
        </h3>
      </div>
      <Globe
        width={800}
        height={400}
        backgroundColor="rgba(0,0,0,0)"
        globeImageUrl="//unpkg.com/three-globe/example/img/earth-night.jpg"
        bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
        arcsData={arcsData}
        arcColor="color"
        arcDashLength={0.4}
        arcDashGap={4}
        arcDashAnimateTime={1500}
        arcsTransitionDuration={1000}
        arcStroke={0.5}
      />
    </div>
  );
};

export default ThreatMap;
