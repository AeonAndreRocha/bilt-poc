import { useState } from 'react';

interface Guide {
  id: string;
  label: string;
}

interface Category {
  id: string;
  label: string;
  guides: Guide[];
}

const catalog: Category[] = [
  {
    id: 'ikea',
    label: 'IKEA',
    guides: [{ id: 'kallax-2x2', label: 'KALLAX 2×2' }],
  },
];

interface SidebarProps {
  activeGuide: string;
  onSelect: (guideId: string) => void;
}

export function Sidebar({ activeGuide, onSelect }: SidebarProps) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({ ikea: true });

  const toggle = (catId: string) =>
    setExpanded((prev) => ({ ...prev, [catId]: !prev[catId] }));

  return (
    <aside className="sidebar">
      <div className="sidebar-title">Assembly Guides</div>
      <nav className="sidebar-nav">
        {catalog.map((cat) => (
          <div key={cat.id} className="sidebar-category">
            <button
              className={`sidebar-cat-btn ${expanded[cat.id] ? 'open' : ''}`}
              onClick={() => toggle(cat.id)}
            >
              <span className="sidebar-chevron">{expanded[cat.id] ? '▾' : '▸'}</span>
              {cat.label}
            </button>
            {expanded[cat.id] && (
              <ul className="sidebar-guides">
                {cat.guides.map((g) => (
                  <li key={g.id}>
                    <button
                      className={`sidebar-guide-btn ${activeGuide === g.id ? 'active' : ''}`}
                      onClick={() => onSelect(g.id)}
                    >
                      {g.label}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </nav>
    </aside>
  );
}
