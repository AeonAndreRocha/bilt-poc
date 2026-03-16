import { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { AssemblyViewer } from './components/AssemblyViewer';

function App() {
  const [activeGuide, setActiveGuide] = useState('kallax-2x2');

  return (
    <div className="app-layout">
      <Sidebar activeGuide={activeGuide} onSelect={setActiveGuide} />
      <div className="app-content">
        {activeGuide === 'kallax-2x2' && <AssemblyViewer />}
      </div>
    </div>
  );
}

export default App;
