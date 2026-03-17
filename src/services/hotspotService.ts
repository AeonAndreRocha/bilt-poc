/* ── Dummy Hotspot Data Service ─────────────────────────────────
 *
 * Simulates fetching annotation data for model hotspots.
 * In production, replace with a real API call.
 *
 * Convention: hotspot meshes in the GLB are named `hotspot_<id>`
 * (e.g. hotspot_crane_end, hotspot_engine_temperature).
 * ────────────────────────────────────────────────────────────── */

export interface LiveMetric {
  label: string;
  value: string;
  unit: string;
  status?: 'normal' | 'warning' | 'critical';
}

export interface HotspotData {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  details: { label: string; value: string }[];
  liveMetrics: LiveMetric[];
}

interface CatalogEntry {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  details: { label: string; value: string }[];
  /** Returns fresh simulated live metrics on each call */
  generateMetrics: () => LiveMetric[];
}

function statusForPercent(pct: number): LiveMetric['status'] {
  if (pct >= 90) return 'critical';
  if (pct >= 70) return 'warning';
  return 'normal';
}

function statusForTemp(temp: number, warnAt: number, critAt: number): LiveMetric['status'] {
  if (temp >= critAt) return 'critical';
  if (temp >= warnAt) return 'warning';
  return 'normal';
}

const catalog: Record<string, CatalogEntry> = {
  crane_end: {
    id: 'crane_end',
    title: 'Crane Boom End',
    description:
      'Main lifting point at the end of the boom arm. Monitors current load weight and capacity utilization in real time.',
    imageUrl: 'https://placehold.co/280x160/2a4a6e/fff?text=Crane+Boom+End',
    details: [
      { label: 'Max Capacity', value: '20,000 kg' },
      { label: 'Boom Length', value: '60 m' },
      { label: 'Hook Type', value: 'Double sheave' },
    ],
    generateMetrics: () => {
      const weight = Math.round(8000 + Math.random() * 10000);
      const capacity = Math.round((weight / 20000) * 100);
      return [
        {
          label: 'Current Load',
          value: weight.toLocaleString(),
          unit: 'kg',
          status: statusForPercent(capacity),
        },
        {
          label: 'Capacity Used',
          value: capacity.toString(),
          unit: '%',
          status: statusForPercent(capacity),
        },
      ];
    },
  },
  engine_temperature: {
    id: 'engine_temperature',
    title: 'Engine Thermal Monitor',
    description:
      'Real-time thermal sensors on the main drive engine. Tracks motor winding temperature and hydraulic oil temperature.',
    imageUrl: 'https://placehold.co/280x160/6e2a2a/fff?text=Engine+Thermal',
    details: [
      { label: 'Engine Model', value: 'CAT C7.1 ACERT' },
      { label: 'Power Output', value: '225 kW' },
      { label: 'Oil Type', value: 'SAE 15W-40' },
    ],
    generateMetrics: () => {
      const motorTemp = Math.round(65 + Math.random() * 50);
      const oilTemp = Math.round(55 + Math.random() * 45);
      return [
        {
          label: 'Motor Temp',
          value: motorTemp.toString(),
          unit: '°C',
          status: statusForTemp(motorTemp, 95, 110),
        },
        {
          label: 'Oil Temp',
          value: oilTemp.toString(),
          unit: '°C',
          status: statusForTemp(oilTemp, 85, 95),
        },
      ];
    },
  },
};

// Fallback for unknown hotspot IDs
function fallbackEntry(id: string): CatalogEntry {
  return {
    id,
    title: id.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
    description: `Live data for "${id}" component.`,
    imageUrl: `https://placehold.co/280x160/555/fff?text=${encodeURIComponent(id)}`,
    details: [],
    generateMetrics: () => [],
  };
}

/**
 * Fetch hotspot data for a given ID.
 * Simulates a network call with a short delay.
 * Live metrics change on every call to simulate real-time sensor data.
 */
export async function fetchHotspotData(id: string): Promise<HotspotData> {
  // Simulate network latency (100-300ms)
  await new Promise((r) => setTimeout(r, 100 + Math.random() * 200));

  const entry = catalog[id] ?? fallbackEntry(id);
  return {
    id: entry.id,
    title: entry.title,
    description: entry.description,
    imageUrl: entry.imageUrl,
    details: entry.details,
    liveMetrics: entry.generateMetrics(),
  };
}
