
import { useCallback, useState } from 'react';
import { Terms } from './components/Terms';
import { QueryBuilder } from './components/QueryBuilder';
import { Studies } from './components/Studies';
import { NiiViewer } from './components/NiiViewer';
import { useUrlQueryState } from './hooks/useUrlQueryState';
import { MainLayout } from './components/MainLayout';
import { BrainViewProvider } from './context/BrainViewContext';
import './App.css';

export default function App() {
  const [query, setQuery] = useUrlQueryState('q');
  const [activeView, setActiveView] = useState('terms'); // 'terms', 'coordinates', or 'results'

  const handlePickTerm = useCallback((t) => {
    setQuery((q) => (q ? `${q} ${t}` : t));
  }, [setQuery]);

  const handleLocationSelect = useCallback((coordinates) => {
    setQuery(`[${coordinates.join(',')}]`);
  }, [setQuery]);

  return (
    <BrainViewProvider>
      <div className="flex h-screen flex-col overflow-hidden">
        <header className="bg-white border-b px-6 py-4">
          <h1 className="text-2xl font-bold text-gray-800">LoTUS-BF</h1>
          <div className="text-sm text-gray-600">Location-or-Term Unified Search for Brain Functions</div>
        </header>

        <MainLayout>
          <div className="flex h-full">
            <div className="w-64 border-r">
              <nav className="p-4">
                <button
                  onClick={() => setActiveView('terms')}
                  className={`w-full py-2 px-4 text-left rounded-lg ${
                    activeView === 'terms' ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-50'
                  }`}
                >
                  Terms
                </button>
                <button
                  onClick={() => setActiveView('coordinates')}
                  className={`w-full py-2 px-4 text-left rounded-lg mt-2 ${
                    activeView === 'coordinates' ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-50'
                  }`}
                >
                  Coordinates
                </button>
                <button
                  onClick={() => setActiveView('results')}
                  className={`w-full py-2 px-4 text-left rounded-lg mt-2 ${
                    activeView === 'results' ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-50'
                  }`}
                >
                  Results
                </button>
              </nav>
            </div>

            <div className="flex-1 min-w-0">
              <div className="p-6">
                <QueryBuilder query={query} setQuery={setQuery} />
              </div>

              <div className="border-t">
                {activeView === 'terms' && (
                  <div className="p-6">
                    <Terms onPickTerm={handlePickTerm} />
                  </div>
                )}

                {activeView === 'coordinates' && (
                  <div className="p-6">
                    <NiiViewer query={query} onLocationSelect={handleLocationSelect} />
                  </div>
                )}

                {activeView === 'results' && (
                  <div className="p-6">
                    <Studies query={query} />
                  </div>
                )}
              </div>
            </div>
          </div>
        </MainLayout>
      </div>
    </BrainViewProvider>
  );
}
