import { useEffect, useState } from 'react';
import { BrainViewProvider } from '../context/BrainViewContext';

export function MainLayout({ children }) {
  const [sidebarWidth, setSidebarWidth] = useState(300);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (isDragging) {
        const newWidth = Math.max(200, Math.min(600, e.clientX));
        setSidebarWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  return (
    <BrainViewProvider>
      <div className="flex h-screen overflow-hidden">
        <aside style={{ width: sidebarWidth }} className="flex flex-col border-r">
          <div className="flex-1 overflow-y-auto p-4">
            {children}
          </div>
        </aside>
        <div
          className="w-2 cursor-col-resize bg-gray-200 hover:bg-gray-300"
          onMouseDown={() => setIsDragging(true)}
        />
        <main className="flex-1 overflow-y-auto p-4">
          {/* Main content */}
        </main>
      </div>
    </BrainViewProvider>
  );
}