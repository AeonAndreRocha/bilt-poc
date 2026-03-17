import { useEffect, useRef, useState } from 'react';
import { fetchHotspotData, type HotspotData } from '../services/hotspotService';

const POLL_INTERVAL = 2000; // ms

/**
 * Polls the hotspot service every 2 seconds for live data.
 * Only active when `id` is non-null (i.e. a hotspot is selected).
 */
export function useHotspotData(id: string | null) {
  const [data, setData] = useState<HotspotData | null>(null);
  const [loading, setLoading] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);

  useEffect(() => {
    if (!id) {
      setData(null);
      setLoading(false);
      return;
    }

    let cancelled = false;

    const load = async () => {
      try {
        const result = await fetchHotspotData(id);
        if (!cancelled) setData(result);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    setLoading(true);
    load();

    intervalRef.current = setInterval(() => {
      load();
    }, POLL_INTERVAL);

    return () => {
      cancelled = true;
      clearInterval(intervalRef.current);
    };
  }, [id]);

  return { data, loading };
}
