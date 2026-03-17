import { useCallback, useRef, useState } from 'react';

const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100 MB

interface GlbDropZoneProps {
  onFileLoaded: (buffer: ArrayBuffer, filename: string) => void;
}

export function GlbDropZone({ onFileLoaded }: GlbDropZoneProps) {
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback(
    (file: File) => {
      setError(null);

      if (!file.name.toLowerCase().endsWith('.glb')) {
        setError('Only .glb files are supported.');
        return;
      }
      if (file.size > MAX_FILE_SIZE) {
        setError(`File too large (${(file.size / 1024 / 1024).toFixed(1)} MB). Max 100 MB.`);
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        if (reader.result instanceof ArrayBuffer) {
          onFileLoaded(reader.result, file.name);
        }
      };
      reader.onerror = () => setError('Failed to read file.');
      reader.readAsArrayBuffer(file);
    },
    [onFileLoaded],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) processFile(file);
    },
    [processFile],
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback(() => setDragOver(false), []);

  const handleClick = () => inputRef.current?.click();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  return (
    <div
      className={`glb-drop-zone ${dragOver ? 'drag-over' : ''}`}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onClick={handleClick}
    >
      <div className="glb-drop-content">
        <div className="glb-drop-icon">&#128230;</div>
        <h2>Drop a .glb file here</h2>
        <p>or click to browse</p>
        {error && <p className="glb-drop-error">{error}</p>}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept=".glb"
        style={{ display: 'none' }}
        onChange={handleInputChange}
      />
    </div>
  );
}
