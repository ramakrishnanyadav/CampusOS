import React, { useState, useEffect, useRef } from 'react';
import {
  Navigation, Compass, Footprints, Search, RefreshCw, Globe,
  Target, Bike, Accessibility, Sparkles, AlertTriangle
} from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import { Card } from './ui/Card';
import { Badge } from './ui/Badge';
import { Button } from './ui/Button';
import { usePermissions } from '../auth/PermissionContext';
import {
  buildNodesFromRoomDirectory,
  fetchExternalCampusNodes,
  geocodeCampusName,
  RealCampusBuilding,
} from '../utils/OverpassGISModel';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CollegeCampus {
  id: string;
  name: string;
  locationLabel: string;
  centerLat: number;
  centerLng: number;
  /** Initial Leaflet zoom level — required, no undefined. */
  zoom: number;
  /**
   * 'internal' — owned by this school; buildings sourced from CAMPUS_ROOM_DIRECTORY.
   * 'external' — third-party institution; buildings sourced from Overpass OSM.
   */
  source: 'internal' | 'external';
}

// ─── Preset Campus Registry ───────────────────────────────────────────────────

export const PRESET_CAMPUSES: CollegeCampus[] = [
  {
    id: 'school_own',
    name: 'Our School Campus',
    locationLabel: 'Nerul East, Navi Mumbai',
    centerLat: 19.0435,
    centerLng: 73.0230,
    zoom: 18,
    source: 'internal',
  },
  {
    id: 'iit_bombay',
    name: 'IIT Bombay Campus',
    locationLabel: 'Powai, Mumbai',
    centerLat: 19.1334,
    centerLng: 72.9133,
    zoom: 16,
    source: 'external',
  },
  {
    id: 'iit_delhi',
    name: 'IIT Delhi Campus',
    locationLabel: 'Hauz Khas, New Delhi',
    centerLat: 28.5450,
    centerLng: 77.1926,
    zoom: 16,
    source: 'external',
  },
  {
    id: 'iit_madras',
    name: 'IIT Madras Campus',
    locationLabel: 'Adyar, Chennai',
    centerLat: 12.9915,
    centerLng: 80.2337,
    zoom: 16,
    source: 'external',
  },
  {
    id: 'iisc_bangalore',
    name: 'IISc Campus',
    locationLabel: 'Mathikere, Bengaluru',
    centerLat: 13.0182,
    centerLng: 77.5694,
    zoom: 16,
    source: 'external',
  },
];

// ─── Haversine Distance ───────────────────────────────────────────────────────

export function calculateHaversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3;
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(Δφ / 2) ** 2 +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
  return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

// ─── Component ────────────────────────────────────────────────────────────────

export const CampusWayfindingMap: React.FC = () => {
  const { session } = usePermissions();
  const _isAdmin = session.role === 'ADMIN';

  const [selectedCampusId, setSelectedCampusId] = useState<string>('school_own');
  const currentPreset: CollegeCampus =
    PRESET_CAMPUSES.find((c) => c.id === selectedCampusId) ?? PRESET_CAMPUSES[0]!;

  const [activeCampusName, setActiveCampusName] = useState<string>(currentPreset.name);
  const [campusBuildings, setCampusBuildings] = useState<RealCampusBuilding[]>([]);
  const [startBuildingId, setStartBuildingId] = useState<string>('');
  const [destBuildingId, setDestBuildingId] = useState<string>('');
  const [isExternal, setIsExternal] = useState<boolean>(false);

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [transitMode, setTransitMode] = useState<'walk' | 'shuttle' | 'wheelchair'>('walk');

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const polylineRef = useRef<L.Polyline | null>(null);
  const markersGroupRef = useRef<L.LayerGroup | null>(null);

  const loadNodes = (nodes: RealCampusBuilding[], campusName: string, external: boolean) => {
    setCampusBuildings(nodes);
    setActiveCampusName(campusName);
    setIsExternal(external);
    if (nodes.length > 0) {
      setStartBuildingId(nodes[0]!.id);
      setDestBuildingId(nodes[1]?.id ?? nodes[0]!.id);
    }
  };


  // Load buildings whenever the preset campus selection changes
  useEffect(() => {
    let cancelled = false;
    setIsSearching(true);
    setSearchError(null);

    let unsub: (() => void) | undefined;

    const doLoad = async () => {
      if (currentPreset.source === 'internal') {
        // School's own campus — subscribe to live Firestore room directory
        const { FirestoreRoomRepository } = await import('../repositories/implementations/FirestoreRoomRepository');
        const repo = new FirestoreRoomRepository();
        unsub = repo.subscribeToRooms((liveRooms) => {
          if (!cancelled) {
            const nodes = buildNodesFromRoomDirectory(liveRooms);
            loadNodes(nodes, currentPreset.name, false);
            setIsSearching(false);
          }
        });
      } else {
        // External campus — use Overpass + K-Means
        const nodes = await fetchExternalCampusNodes(
          currentPreset.centerLat,
          currentPreset.centerLng,
          currentPreset.name
        );
        if (!cancelled) {
          loadNodes(nodes, currentPreset.name, true);
          setIsSearching(false);
          mapInstanceRef.current?.flyTo(
            [currentPreset.centerLat, currentPreset.centerLng],
            currentPreset.zoom,
            { duration: 1.0 }
          );
        }
      }
    };

    doLoad();
    return () => {
      cancelled = true;
      if (unsub) unsub();
    };
  }, [selectedCampusId]);


  const startNode: RealCampusBuilding | undefined =
    campusBuildings.find((b) => b.id === startBuildingId) ?? campusBuildings[0];
  const destNode: RealCampusBuilding | undefined =
    campusBuildings.find((b) => b.id === destBuildingId) ?? campusBuildings[1] ?? campusBuildings[0];

  const geodesicDistanceMeters =
    startNode && destNode
      ? calculateHaversineDistance(startNode.lat, startNode.lng, destNode.lat, destNode.lng)
      : 0;
  const walkingMinutes = Math.ceil(geodesicDistanceMeters / 84);
  const shuttleMinutes = Math.max(1, Math.ceil(geodesicDistanceMeters / 250));
  const estimatedSteps = Math.round(geodesicDistanceMeters * 1.35);
  const caloriesBurned = Math.round(geodesicDistanceMeters * 0.055);

  // Open search — external institutions only, with Nominatim relevance validation
  const handleOpenSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchQuery.trim();
    if (!q) return;

    setIsSearching(true);
    setSearchError(null);

    const geo = await geocodeCampusName(q, 'in'); // bias to India; admin can widen later
    if (geo.ok === false) {
      setSearchError(geo.error.message);
      setIsSearching(false);
      return;
    }

    const nodes = await fetchExternalCampusNodes(geo.result.lat, geo.result.lng, geo.result.displayName);
    loadNodes(nodes, geo.result.displayName, true);
    setIsSearching(false);
    mapInstanceRef.current?.flyTo([geo.result.lat, geo.result.lng], 17, { duration: 1.5 });
  };

  // Initialise Leaflet map (once) and re-render markers/polyline on data change
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      // Clear stale Leaflet container ID (React strict-mode / HMR guard)
      if ((mapContainerRef.current as HTMLDivElement & { _leaflet_id?: number })._leaflet_id) {
        (mapContainerRef.current as HTMLDivElement & { _leaflet_id?: number })._leaflet_id = undefined;
      }

      const map = L.map(mapContainerRef.current).setView(
        [currentPreset.centerLat, currentPreset.centerLng],
        currentPreset.zoom
      );
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map);
      mapInstanceRef.current = map;
      markersGroupRef.current = L.layerGroup().addTo(map);
    }

    const map = mapInstanceRef.current;
    const markersGroup = markersGroupRef.current;
    if (!markersGroup) return;
    markersGroup.clearLayers();

    if (campusBuildings.length === 0 || !startNode || !destNode) return;

    for (const node of campusBuildings) {
      const isStart = node.id === startNode.id;
      const isDest = node.id === destNode.id;
      const color = isStart ? '#10B981' : isDest ? '#EF4444' : '#7C3AED';

      const circle = L.circleMarker([node.lat, node.lng], {
        radius: isStart || isDest ? 10 : 7,
        fillColor: color,
        color: '#FFFFFF',
        weight: 2,
        fillOpacity: 0.95,
      });

      const capacityLine =
        node.capacity !== null
          ? `Capacity: ${node.capacity} seats`
          : 'Capacity: not available (external)';

      circle.bindTooltip(
        `<div style="font-family:sans-serif;padding:4px 6px;">
           <b style="color:${color};font-size:12px;">${node.name}</b><br/>
           <span style="font-size:10px;color:#64748B;">${node.block}</span><br/>
           <span style="font-size:10px;color:#10B981;font-weight:bold;">${capacityLine}</span>
         </div>`,
        { permanent: isStart || isDest, direction: 'top' }
      );
      circle.addTo(markersGroup);
    }

    if (polylineRef.current) {
      polylineRef.current.remove();
    }
    const polyColor =
      transitMode === 'shuttle' ? '#2563EB' : transitMode === 'wheelchair' ? '#059669' : '#7C3AED';
    polylineRef.current = L.polyline(
      [[startNode.lat, startNode.lng], [destNode.lat, destNode.lng]],
      { color: polyColor, weight: 5, dashArray: '8, 6', opacity: 0.9 }
    ).addTo(map);

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [campusBuildings, startBuildingId, destBuildingId, transitMode]);

  const handleFocusRouteBounds = () => {
    if (mapInstanceRef.current && startNode && destNode) {
      mapInstanceRef.current.fitBounds(
        L.latLngBounds([[startNode.lat, startNode.lng], [destNode.lat, destNode.lng]]),
        { padding: [50, 50] }
      );
    }
  };

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6 select-none max-w-6xl mx-auto">
      {/* Header */}
      <div className="bg-white border border-slate-200/80 p-6 rounded-3xl shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-purple-600" />
            <h2 className="text-xl font-extrabold text-slate-900">Campus Spatial Navigation & GIS Distance Engine</h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            {currentPreset.source === 'internal'
              ? '✅ Sourced from admin-managed room directory — real facilities only'
              : '⚠️ External campus — OpenStreetMap data, unverified'}
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
          <span className="text-xs font-extrabold text-slate-500 pl-2">Campus:</span>
          <select
            value={selectedCampusId}
            onChange={(e) => setSelectedCampusId(e.target.value)}
            className="p-2 bg-white rounded-xl text-xs font-extrabold text-slate-900 border border-slate-200 focus:outline-none focus:border-purple-600"
          >
            {PRESET_CAMPUSES.map((c) => (
              <option key={c.id} value={c.id}>
                {c.source === 'internal' ? '🏫' : '🌐'} {c.name} ({c.locationLabel})
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* ── Left Column ─────────────────────────────────────────────────── */}
        <div className="lg:col-span-5 space-y-6">
          {/* External Search — clearly labelled */}
          <Card variant="glass" className="p-5 bg-white space-y-3">
            <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Search className="w-4 h-4 text-purple-600" />
                Explore Other Institutions
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                <AlertTriangle className="w-3 h-3" /> Public OSM Data, Unverified
              </span>
            </h3>
            <p className="text-[11px] text-slate-500 font-medium">
              Search any external college or university. Building data comes from OpenStreetMap — not admin-managed. Capacity/occupancy will show as unavailable.
            </p>

            <form onSubmit={handleOpenSearch} className="flex items-center gap-2">
              <input
                type="text"
                placeholder="E.g. IIT Kharagpur, BITS Pilani, Harvard..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-purple-600"
              />
              <Button
                type="submit"
                variant="primary"
                size="sm"
                disabled={isSearching}
                leftIcon={isSearching
                  ? <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  : <Search className="w-3.5 h-3.5" />
                }
              >
                Search
              </Button>
            </form>

            {searchError && (
              <div className="p-2.5 bg-red-50 text-red-700 text-xs font-bold rounded-xl border border-red-200 flex items-start gap-2">
                <AlertTriangle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                <span>{searchError}</span>
              </div>
            )}
          </Card>

          {/* Route Config */}
          <Card variant="glass" className="p-6 bg-white space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                <Navigation className="w-4 h-4 text-purple-600" />
                Intra-Campus Route
              </h3>
              <Badge variant={isExternal ? 'info' : 'success'}>
                {isExternal ? 'EXTERNAL (OSM)' : 'INTERNAL (VERIFIED)'}
              </Badge>

            </div>

            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs font-extrabold text-slate-700">
              Active Campus: <span className="text-purple-700">{activeCampusName}</span>
            </div>

            {/* Transit Mode */}
            <div className="grid grid-cols-3 gap-2">
              {(['walk', 'shuttle', 'wheelchair'] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setTransitMode(mode)}
                  className={`p-2.5 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all border ${
                    transitMode === mode
                      ? mode === 'walk' ? 'bg-purple-50 text-purple-700 border-purple-300'
                        : mode === 'shuttle' ? 'bg-blue-50 text-blue-700 border-blue-300'
                        : 'bg-emerald-50 text-emerald-700 border-emerald-300'
                      : 'bg-slate-50 text-slate-600 border-slate-200'
                  }`}
                >
                  {mode === 'walk' && <Footprints className="w-4 h-4" />}
                  {mode === 'shuttle' && <Bike className="w-4 h-4" />}
                  {mode === 'wheelchair' && <Accessibility className="w-4 h-4" />}
                  <span>{mode === 'walk' ? 'Walk' : mode === 'shuttle' ? 'E-Shuttle' : 'Ramped'}</span>
                </button>
              ))}
            </div>

            {/* Building selectors */}
            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-500 uppercase block mb-1">Origin</label>
                <select
                  value={startBuildingId}
                  onChange={(e) => setStartBuildingId(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-extrabold text-slate-900 focus:outline-none focus:border-purple-600"
                >
                  {campusBuildings.map((node) => (
                    <option key={node.id} value={node.id}>
                      📍 {node.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="font-bold text-slate-500 uppercase block mb-1">Destination</label>
                <select
                  value={destBuildingId}
                  onChange={(e) => setDestBuildingId(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-extrabold text-slate-900 focus:outline-none focus:border-purple-600"
                >
                  {campusBuildings.map((node) => (
                    <option key={node.id} value={node.id}>
                      🎯 {node.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Distance telemetry */}
            {startNode && destNode && (
              <div className="p-4 bg-gradient-to-br from-purple-50 via-indigo-50 to-purple-100 rounded-2xl border border-purple-200 space-y-3 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2.5 bg-purple-600 text-white rounded-xl shadow-md">
                      <Footprints className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-xs font-black text-purple-950 block">
                        {geodesicDistanceMeters}m ({(geodesicDistanceMeters / 1000).toFixed(2)} km)
                      </span>
                      <span className="text-[11px] font-extrabold text-purple-700 block mt-0.5">
                        {transitMode === 'shuttle'
                          ? `~${shuttleMinutes} min via E-Shuttle`
                          : `~${walkingMinutes} min walking`}
                      </span>
                    </div>
                  </div>
                  <Badge variant="purple">HAVERSINE GIS</Badge>
                </div>

                <div className="p-2.5 bg-white/80 rounded-xl border border-purple-200/80 text-xs text-slate-900 font-extrabold">
                  📍 {destNode.name} is {geodesicDistanceMeters}m from {startNode.name}
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 bg-white rounded-xl border border-purple-200/60">
                    <span className="text-slate-500 block text-[10px] uppercase font-bold">Steps</span>
                    <span className="font-mono font-black text-sm text-slate-900">~{estimatedSteps}</span>
                  </div>
                  <div className="p-2.5 bg-white rounded-xl border border-purple-200/60">
                    <span className="text-slate-500 block text-[10px] uppercase font-bold">Calories</span>
                    <span className="font-mono font-black text-sm text-purple-700">~{caloriesBurned} kcal</span>
                  </div>
                </div>

                {/* Capacity — only shown when real data is available */}
                {destNode.capacity !== null && (
                  <div className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-200 text-xs font-bold text-emerald-800">
                    🏛️ Destination Capacity: {destNode.capacity} seats (admin-verified)
                  </div>
                )}
                {destNode.capacity === null && (
                  <div className="p-2.5 bg-amber-50 rounded-xl border border-amber-200 text-xs font-bold text-amber-800">
                    ⚠️ Capacity data not available — external campus (OpenStreetMap)
                  </div>
                )}
              </div>
            )}

            <Button
              variant="secondary"
              size="lg"
              onClick={handleFocusRouteBounds}
              leftIcon={<Target className="w-4 h-4 text-purple-600" />}
              className="w-full font-extrabold bg-purple-50 text-purple-900 border border-purple-200 hover:bg-purple-100"
            >
              🎯 Focus Viewport to Route Bounds
            </Button>
          </Card>
        </div>

        {/* ── Right Column: Map ────────────────────────────────────────────── */}
        <div className="lg:col-span-7">
          <Card variant="glass" className="p-4 bg-white rounded-3xl border border-slate-200 shadow-xl space-y-3">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                <span className="font-extrabold text-slate-900">OPENSTREETMAP REAL-TIME GIS TILES</span>
              </div>
              <span className="text-purple-600 font-mono font-bold text-[11px]">
                {isExternal ? 'OSM K-MEANS CLUSTER' : 'ADMIN ROOM DIRECTORY'}
              </span>
            </div>
            <div
              ref={mapContainerRef}
              className="w-full h-[520px] rounded-2xl border border-slate-200 shadow-inner z-10 overflow-hidden"
            />
          </Card>
        </div>
      </div>
    </div>
  );
};
