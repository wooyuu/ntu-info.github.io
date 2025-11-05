import { useState } from 'react';

export function QueryBuilder({ query, setQuery }) {
  const [showHelp, setShowHelp] = useState(false);
  const [inputMode, setInputMode] = useState('terms'); // 'terms' or 'coordinates'
  
  const append = (token) => setQuery((q) => (q ? `${q} ${token}` : token));

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      setQuery(e.currentTarget.value);
    }
  };

  const handleCoordinateInput = (e) => {
    const { name, value } = e.target;
    const coordinates = query.match(/\[(.*?)\]/) ? query.match(/\[(.*?)\]/)[1].split(',') : ['0', '0', '0'];
    const index = ['x', 'y', 'z'].indexOf(name);
    if (index !== -1) {
      coordinates[index] = value;
      const newCoords = `[${coordinates.join(',')}]`;
      if (query.includes('[')) {
        setQuery(query.replace(/\[.*?\]/, newCoords));
      } else {
        setQuery(newCoords);
      }
    }
  };

  return (
    <div className="flex flex-col gap-3 qb">
      <div className="flex items-center justify-between">
        <div className="card__title">Query Builder</div>
        <button
          onClick={() => setShowHelp(!showHelp)}
          className="text-sm"
          style={{ marginLeft: '8px' }}
        >
          {showHelp ? 'Hide Help' : 'Show Help'}
        </button>
      </div>

      {showHelp && (
        <div className="bg-gray-50 p-3 rounded-lg text-sm">
          <p>You can build queries in two ways:</p>
          <ul className="list-disc ml-4 mt-2">
            <li>Search by terms: Use keywords and logical operators (AND, OR, NOT)</li>
            <li>Search by location: Use MNI coordinates in the format [-22,-4,18]</li>
            <li>Combine both: Mix coordinates and terms, e.g. "[-22,-4,18] AND emotion"</li>
          </ul>
        </div>
      )}

      <div className="flex gap-2 mb-2">
        <button
          onClick={() => setInputMode('terms')}
          className={`px-3 py-1 rounded ${inputMode === 'terms' ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}
        >
          Terms
        </button>
        <button
          onClick={() => setInputMode('coordinates')}
          className={`px-3 py-1 rounded ${inputMode === 'coordinates' ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}
        >
          Coordinates
        </button>
      </div>

      {inputMode === 'terms' ? (
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Enter search terms, e.g.: emotion AND memory"
          className="qb__input w-full rounded-xl border px-3 py-2 focus:outline-none focus:ring"
          style={{ width: "100%" }}
        />
      ) : (
        <div className="flex gap-2 items-center">
          <span>[</span>
          <input
            type="number"
            name="x"
            placeholder="X"
            className="w-20 px-2 py-1 border rounded"
            onChange={handleCoordinateInput}
            value={query.match(/\[(.*?)\]/) ? query.match(/\[(.*?)\]/)[1].split(',')[0] : ''}
          />
          <input
            type="number"
            name="y"
            placeholder="Y"
            className="w-20 px-2 py-1 border rounded"
            onChange={handleCoordinateInput}
            value={query.match(/\[(.*?)\]/) ? query.match(/\[(.*?)\]/)[1].split(',')[1] : ''}
          />
          <input
            type="number"
            name="z"
            placeholder="Z"
            className="w-20 px-2 py-1 border rounded"
            onChange={handleCoordinateInput}
            value={query.match(/\[(.*?)\]/) ? query.match(/\[(.*?)\]/)[1].split(',')[2] : ''}
          />
          <span>]</span>
        </div>
      )}

      <div className="flex gap-2 flex-wrap">
        {[
          { label: 'AND', onClick: () => append('AND') },
          { label: 'OR', onClick: () => append('OR') },
          { label: 'NOT', onClick: () => append('NOT') },
          { label: '(', onClick: () => append('(') },
          { label: ')', onClick: () => append(')') },
          { label: 'Reset', onClick: () => setQuery('') },
        ].map((b) => (
          <button
            key={b.label}
            onClick={b.onClick}
            className="rounded-xl border px-3 py-2 text-sm hover:bg-gray-50"
          >
            {b.label}
          </button>
        ))}
      </div>
    </div>
  );
}
