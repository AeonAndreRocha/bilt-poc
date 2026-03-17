import type { HotspotData } from '../services/hotspotService';

interface HotspotPopupProps {
  data: HotspotData;
  loading: boolean;
  onClose: () => void;
}

export function HotspotPopup({ data, loading, onClose }: HotspotPopupProps) {
  return (
    <div className="hotspot-popup" onClick={(e) => e.stopPropagation()}>
      <button className="hotspot-popup-close" onClick={onClose}>
        &times;
      </button>

      <img
        className="hotspot-popup-image"
        src={data.imageUrl}
        alt={data.title}
      />

      <div className="hotspot-popup-body">
        <h3 className="hotspot-popup-title">{data.title}</h3>
        <p className="hotspot-popup-desc">{data.description}</p>

        {data.liveMetrics.length > 0 && (
          <div className="hotspot-metrics">
            <div className="hotspot-metrics-header">
              <span>Live Readings</span>
              <span className={`hotspot-popup-live-badge ${loading ? 'hotspot-popup-price-updating' : ''}`}>LIVE</span>
            </div>
            {data.liveMetrics.map((m) => (
              <div key={m.label} className={`hotspot-metric-row hotspot-metric-${m.status ?? 'normal'}`}>
                <span className="hotspot-metric-label">{m.label}</span>
                <span className="hotspot-metric-value">
                  {m.value} <span className="hotspot-metric-unit">{m.unit}</span>
                </span>
              </div>
            ))}
          </div>
        )}

        {data.details.length > 0 && (
          <table className="hotspot-popup-details">
            <tbody>
              {data.details.map((d) => (
                <tr key={d.label}>
                  <td className="hotspot-popup-detail-label">{d.label}</td>
                  <td className="hotspot-popup-detail-value">{d.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
