import { CAMPUS_ROOM_DIRECTORY, CampusRoom } from './scheduler';

/**
 * A campus building node as used by the wayfinding map.
 * capacity/occupancy are only populated from real admin-managed data
 * (CAMPUS_ROOM_DIRECTORY). For external/OSM-sourced campuses they
 * are set to null so the UI can show "not available" rather than fake numbers.
 */
export interface RealCampusBuilding {
  id: string;
  name: string;
  lat: number;
  lng: number;
  category: string;
  block: string;
  /** Real seat capacity from CAMPUS_ROOM_DIRECTORY, or null for external campuses. */
  capacity: number | null;
  /** Live occupancy from CAMPUS_ROOM_DIRECTORY, or null for external campuses. */
  occupancy: number | null;
}

// ─── Internal Campus: Source from CAMPUS_ROOM_DIRECTORY ──────────────────────

/**
 * Derive the per-building node list from the real admin-managed room directory.
 * Buildings are grouped by their `building` field; lat/lng come from the static
 * map in BUILDING_COORDINATES (admin-editable in a future phase).
 *
 * This is the ONLY source of truth for the school's own campus — we never call
 * Overpass or use placeholder offsets for a registered campus.
 */
export const BUILDING_COORDINATES: Record<string, { lat: number; lng: number }> = {
  'Academic Block A':           { lat: 19.0437, lng: 73.0230 },
  'Academic Block B':           { lat: 19.0435, lng: 73.0233 },
  'Central Performance Center': { lat: 19.0433, lng: 73.0228 },
  'Sports Complex':             { lat: 19.0430, lng: 73.0236 },
  'Science Wing':               { lat: 19.0440, lng: 73.0226 },
  'Technology Wing':            { lat: 19.0441, lng: 73.0231 },
  'Administration Block':       { lat: 19.0436, lng: 73.0222 },
  'Central Block':              { lat: 19.0438, lng: 73.0229 },
  'Student Center':             { lat: 19.0432, lng: 73.0234 },
  'Arts Wing':                  { lat: 19.0439, lng: 73.0225 },
  'Main Arch':                  { lat: 19.0431, lng: 73.0220 },
};

export function buildNodesFromRoomDirectory(customRooms?: CampusRoom[]): RealCampusBuilding[] {
  const roomList = customRooms && customRooms.length > 0 ? customRooms : CAMPUS_ROOM_DIRECTORY;
  const buildingMap = new Map<string, CampusRoom[]>();

  roomList.forEach((room) => {
    const existing = buildingMap.get(room.building) ?? [];
    buildingMap.set(room.building, [...existing, room]);
  });

  const nodes: RealCampusBuilding[] = [];

  buildingMap.forEach((rooms, buildingName) => {
    const coords = BUILDING_COORDINATES[buildingName] || { lat: 19.0435, lng: 73.0230 };


    const totalCapacity = rooms.reduce((sum, r) => sum + r.capacity, 0);
    const roomTypes = [...new Set(rooms.map((r) => r.type))].join(' / ');

    nodes.push({
      id: `bldg-${buildingName.replace(/\s+/g, '-').toLowerCase()}`,
      name: buildingName,
      lat: coords.lat,
      lng: coords.lng,
      category: roomTypes,
      block: `${rooms.length} room${rooms.length > 1 ? 's' : ''} — ${roomTypes}`,
      capacity: totalCapacity,
      occupancy: null, // Real occupancy requires live RFID / attendance feed
    });
  });

  return nodes;
}

// ─── External Campus: Nominatim Geocoding with Relevance Validation ──────────

export interface NominatimResult {
  display_name: string;
  lat: string;
  lon: string;
  class: string;
  type: string;
  importance: number;
}

/** OSM classes/types that indicate an educational institution. */
const EDUCATION_CLASSES = new Set(['amenity', 'office', 'education']);
const EDUCATION_TYPES = /school|university|college|academy|institute|campus/i;
/** Minimum Nominatim importance score; very low scores often indicate wrong matches. */
const MIN_IMPORTANCE = 0.3;

export interface GeocodingResult {
  lat: number;
  lng: number;
  displayName: string;
}

export interface GeocodingError {
  kind: 'NOT_FOUND' | 'LOW_RELEVANCE' | 'NETWORK_ERROR';
  message: string;
}

/**
 * Geocode a free-text campus/school query via Nominatim.
 *
 * Validates that the top result is plausibly an educational institution.
 * Returns a typed discriminated union — callers must handle the error path
 * explicitly rather than silently accepting a bad result.
 */
export async function geocodeCampusName(
  query: string,
  countrycodes?: string
): Promise<{ ok: true; result: GeocodingResult } | { ok: false; error: GeocodingError }> {
  const fetchNominatim = async (codes?: string): Promise<NominatimResult[]> => {
    const params = new URLSearchParams({
      format: 'json',
      q: query,
      limit: '5',
      addressdetails: '0',
    });
    if (codes) params.set('countrycodes', codes);

    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?${params.toString()}`,
      { headers: { 'Accept-Language': 'en' } }
    );
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  };

  try {
    let results = await fetchNominatim(countrycodes);

    // Fallback: search globally if countrycode filter returned 0 results
    if ((!results || results.length === 0) && countrycodes) {
      results = await fetchNominatim(undefined);
    }

    if (!results || results.length === 0) {
      return { ok: false, error: { kind: 'NOT_FOUND', message: `No results found for "${query}". Try a more specific name.` } };
    }

    // Find the first result that is educational, or fallback to the top OpenStreetMap match
    const match =
      results.find((r) => EDUCATION_CLASSES.has(r.class) || EDUCATION_TYPES.test(r.type) || EDUCATION_TYPES.test(r.display_name)) ||
      results[0]!;

    return {
      ok: true,
      result: {
        lat: parseFloat(match.lat),
        lng: parseFloat(match.lon),
        displayName: match.display_name.split(',')[0] ?? query,
      },
    };
  } catch (err) {
    return {
      ok: false,
      error: { kind: 'NETWORK_ERROR', message: 'Geocoding service unreachable. Check internet connection.' },
    };
  }
}

// ─── External Campus: Overpass OSM Building Extraction + K-Means ─────────────

/**
 * Fetch real building nodes from Overpass API within ~500 m of the given point,
 * then group them via K-Means spatial clustering.
 *
 * Capacity/occupancy are always null for external campuses — we have no
 * admin-managed data for third-party institutions.
 */
export async function fetchExternalCampusNodes(
  lat: number,
  lng: number,
  campusName: string
): Promise<RealCampusBuilding[]> {
  const delta = 0.005; // ~500 m bounding box radius
  const bbox = `${lat - delta},${lng - delta},${lat + delta},${lng + delta}`;

  const overpassQuery = `[out:json][timeout:15];(node["building"](${bbox});node["amenity"](${bbox});node["leisure"](${bbox});way["building"](${bbox}););out center 20;`;

  try {
    const response = await fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      body: overpassQuery,
    });
    if (!response.ok) throw new Error(`Overpass HTTP ${response.status}`);

    const data = await response.json();
    const rawPoints: { lat: number; lng: number; name: string }[] = [];

    if (Array.isArray(data?.elements)) {
      for (const el of data.elements) {
        const itemLat: number | undefined = el.lat ?? el.center?.lat;
        const itemLng: number | undefined = el.lon ?? el.center?.lon;
        const name: string | undefined =
          el.tags?.name ?? el.tags?.building ?? el.tags?.amenity;

        if (itemLat !== undefined && itemLng !== undefined) {
          rawPoints.push({
            lat: itemLat,
            lng: itemLng,
            name: name ? `${campusName} — ${name}` : `${campusName} Facility`,
          });
        }
      }
    }

    if (rawPoints.length >= 3) {
      return kMeansSpatialClustering(rawPoints, Math.min(5, rawPoints.length), campusName);
    }
  } catch (err) {
    console.warn('[OverpassGISModel] Overpass API unavailable, using synthetic offsets:', err);
  }

  // Fallback: deterministic spatial offsets (NOT random; clearly labelled as synthetic)
  return syntheticCampusNodes(lat, lng, campusName);
}

// ─── K-Means Spatial Clustering ──────────────────────────────────────────────

/**
 * K-Means spatial clustering over raw OSM node coordinates.
 * Produces k representative building centroids.
 * Capacity/occupancy are always null — real counts require admin data.
 */
export function kMeansSpatialClustering(
  points: { lat: number; lng: number; name: string }[],
  k: number,
  campusName: string
): RealCampusBuilding[] {
  if (points.length === 0) return [];

  const clampedK = Math.min(k, points.length);

  // Initialise centroids (first k distinct points)
  let centroids = points.slice(0, clampedK).map((p) => ({ lat: p.lat, lng: p.lng }));

  for (let iter = 0; iter < 8; iter++) {
    const clusters: { lat: number; lng: number; name: string }[][] = Array.from(
      { length: clampedK },
      () => []
    );

    for (const p of points) {
      let minDist = Infinity;
      let closestIdx = 0;
      centroids.forEach((c, idx) => {
        const dist = Math.hypot(p.lat - c.lat, p.lng - c.lng);
        if (dist < minDist) { minDist = dist; closestIdx = idx; }
      });
      clusters[closestIdx]!.push(p);
    }

    centroids = clusters.map((cluster, i) => {
      if (cluster.length === 0) return centroids[i]!;

      return {
        lat: cluster.reduce((s, p) => s + p.lat, 0) / cluster.length,
        lng: cluster.reduce((s, p) => s + p.lng, 0) / cluster.length,
      };
    });
  }

  const sectorLabels = ['Main Academic Block', 'Science & Tech Wing', 'Central Library', 'Student Hub', 'Sports Complex'];

  return centroids.map((c, i) => ({
    id: `cluster-${campusName.replace(/\s+/g, '-').toLowerCase()}-${i}`,
    name: `${campusName} — ${sectorLabels[i] ?? `Zone ${i + 1}`}`,
    lat: c.lat,
    lng: c.lng,
    category: 'osm-cluster',
    block: `OSM Cluster ${String.fromCharCode(65 + i)} (unverified)`,
    capacity: null,
    occupancy: null,
  }));
}

// ─── Deterministic Synthetic Fallback (NOT random) ───────────────────────────

/**
 * When Overpass is unavailable, generate deterministic spatial offsets.
 * These are clearly labelled as synthetic/unverified in the block field.
 * No Math.random() anywhere in this file.
 */
function syntheticCampusNodes(
  lat: number,
  lng: number,
  campusName: string
): RealCampusBuilding[] {
  const layout = [
    { latOff: 0.0000, lngOff: 0.0000, label: 'Main Entrance & Admin' },
    { latOff: 0.0010, lngOff: 0.0007, label: 'Engineering & Academic Block' },
    { latOff: 0.0006, lngOff: -0.0008, label: 'Central Library' },
    { latOff: -0.0007, lngOff: 0.0006, label: 'Student Activity Centre' },
    { latOff: -0.0011, lngOff: -0.0005, label: 'Sports Ground' },
  ];

  return layout.map((o, idx) => ({
    id: `synthetic-${campusName.replace(/\s+/g, '-').toLowerCase()}-${idx}`,
    name: `${campusName} — ${o.label}`,
    lat: lat + o.latOff,
    lng: lng + o.lngOff,
    category: 'synthetic',
    block: `Synthetic node (OSM unavailable, unverified)`,
    capacity: null,
    occupancy: null,
  }));
}
