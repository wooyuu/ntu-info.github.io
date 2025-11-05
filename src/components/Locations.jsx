import { useEffect, useMemo, useState } from 'react';
import { fetchLocations } from '../api';

function cls (...xs) { return xs.filter(Boolean).join(' '); }

// Custom hook for location filtering
function useLocationFilter(locations) {
  const [filters, setFilters] = useState({
    minX: '', maxX: '',
    minY: '', maxY: '',
    minZ: '', maxZ: ''
  });

  const filteredLocations = useMemo(() => {
    return locations.filter(loc => {
      const x = Number(loc.x);
      const y = Number(loc.y);
      const z = Number(loc.z);
      
      return (
        (!filters.minX || x >= Number(filters.minX)) &&
        (!filters.maxX || x <= Number(filters.maxX)) &&
        (!filters.minY || y >= Number(filters.minY)) &&
        (!filters.maxY || y <= Number(filters.maxY)) &&
        (!filters.minZ || z >= Number(filters.minZ)) &&
        (!filters.maxZ || z <= Number(filters.maxZ))
      );
    });
  }, [locations, filters]);

  return { filters, setFilters, filteredLocations };
}

export function Locations ({ query, onLocationSelect }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');
  const [r, setR] = useState(6.0);
  const [limit, setLimit] = useState(200);
  const [offset, setOffset] = useState(0);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  const [sortKey, setSortKey] = useState('study_id');
  const [sortDir, setSortDir] = useState('asc');
  const pageSize = 30;
  const [page, setPage] = useState(1);
  
  const { filters, setFilters, filteredLocations } = useLocationFilter(rows);

  useEffect(() => { setPage(1); setOffset(0) }, [query])

  useEffect(() => {
    if (!query) return
    let alive = true
    const ac = new AbortController()
    ;(async () => {
      setLoading(true); setErr('')
      try {
        const u = new URL(`${API_BASE}/query/${encodeURIComponent(query)}/locations`)
        u.searchParams.set('r', String(r))
        if (limit != null) u.searchParams.set('limit', String(limit))
        if (offset) u.searchParams.set('offset', String(offset))
        const res = await fetch(u.toString(), { signal: ac.signal })
        const data = await res.json().catch(()=>({}))
        if (!res.ok) throw new Error(data?.error || `HTTP ${res.status}`)
        if (!alive) return
        setRows(Array.isArray(data?.results) ? data.results : [])
      } catch (e) {
        if (!alive) return
        setErr(e?.message || String(e))
        setRows([])
      } finally {
        if (alive) setLoading(false)
      }
    })()
    return () => { alive = false; ac.abort() }
  }, [query, r, limit, offset])

  const sorted = useMemo(() => {
    const arr = [...rows]
    const dir = sortDir === 'asc' ? 1 : -1
    arr.sort((a,b) => {
      const A = a?.[sortKey], B = b?.[sortKey]
      if (sortKey === 'study_id' || sortKey === 'x' || sortKey === 'y' || sortKey === 'z') {
        return ((Number(A)||0) - (Number(B)||0)) * dir
      }
      return String(A||'').localeCompare(String(B||'')) * dir
    })
    return arr
  }, [rows, sortKey, sortDir])

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize))
  const pageRows = sorted.slice((page - 1) * pageSize, page * pageSize)

  const changeSort = (k) => {
    if (k === sortKey) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(k); setSortDir('asc') }
  }

  return (
    <div className='flex flex-col rounded-2xl border'>
      <div className='flex items-center justify-between p-3'>
        <div className='font-semibold'>Locations</div>
        <div className='flex items-center gap-2'>
          <button 
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className='text-sm px-3 py-1 rounded-lg border hover:bg-gray-50'
          >
            {showAdvancedFilters ? 'Hide Filters' : 'Show Filters'}
          </button>
          <div className='text-sm text-gray-500'>{query ? `Query: ${query}` : 'Create a query above'}</div>
        </div>
      </div>

      {showAdvancedFilters && (
        <div className='p-3 border-t border-b bg-gray-50'>
          <div className='grid grid-cols-3 gap-4'>
            <div>
              <div className='text-sm font-medium mb-2'>X Coordinate</div>
              <div className='flex gap-2'>
                <input
                  type='number'
                  placeholder='Min X'
                  value={filters.minX}
                  onChange={(e) => setFilters(f => ({ ...f, minX: e.target.value }))}
                  className='w-full rounded-lg border px-2 py-1'
                />
                <input
                  type='number'
                  placeholder='Max X'
                  value={filters.maxX}
                  onChange={(e) => setFilters(f => ({ ...f, maxX: e.target.value }))}
                  className='w-full rounded-lg border px-2 py-1'
                />
              </div>
            </div>
            <div>
              <div className='text-sm font-medium mb-2'>Y Coordinate</div>
              <div className='flex gap-2'>
                <input
                  type='number'
                  placeholder='Min Y'
                  value={filters.minY}
                  onChange={(e) => setFilters(f => ({ ...f, minY: e.target.value }))}
                  className='w-full rounded-lg border px-2 py-1'
                />
                <input
                  type='number'
                  placeholder='Max Y'
                  value={filters.maxY}
                  onChange={(e) => setFilters(f => ({ ...f, maxY: e.target.value }))}
                  className='w-full rounded-lg border px-2 py-1'
                />
              </div>
            </div>
            <div>
              <div className='text-sm font-medium mb-2'>Z Coordinate</div>
              <div className='flex gap-2'>
                <input
                  type='number'
                  placeholder='Min Z'
                  value={filters.minZ}
                  onChange={(e) => setFilters(f => ({ ...f, minZ: e.target.value }))}
                  className='w-full rounded-lg border px-2 py-1'
                />
                <input
                  type='number'
                  placeholder='Max Z'
                  value={filters.maxZ}
                  onChange={(e) => setFilters(f => ({ ...f, maxZ: e.target.value }))}
                  className='w-full rounded-lg border px-2 py-1'
                />
              </div>
            </div>
          </div>
          <div className='flex justify-end mt-3'>
            <button
              onClick={() => setFilters({
                minX: '', maxX: '',
                minY: '', maxY: '',
                minZ: '', maxZ: ''
              })}
              className='text-sm px-3 py-1 rounded-lg border hover:bg-gray-100'
            >
              Reset Filters
            </button>
          </div>
        </div>
      )}

      <div className='flex flex-wrap items-end gap-3 px-3 py-2 text-sm border-b'>
        <label className='flex flex-col'>
          <span className='text-sm font-medium'>Search Radius (mm)</span>
          <input
            type='number'
            step='0.5'
            value={r}
            onChange={e => setR(Number(e.target.value) || 6)}
            className='w-24 rounded-lg border px-2 py-1'
          />
        </label>
        <label className='flex flex-col'>
          <span className='text-sm font-medium'>Results Limit</span>
          <input
            type='number'
            step='10'
            value={limit}
            onChange={e => setLimit(Math.max(0, Number(e.target.value) || 0))}
            className='w-24 rounded-lg border px-2 py-1'
          />
        </label>
      </div>

      {!query && <div className='px-3 py-4 text-sm text-gray-500'>Please provide a search query above.</div>}
      
      {query && loading && (
        <div className='grid gap-3 p-3'>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className='h-10 animate-pulse rounded-lg bg-gray-100' />
          ))}
        </div>
      )}

      {query && err && (
        <div className='mx-3 my-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700'>
          {err}
        </div>
      )}

      {query && !loading && !err && (
        <div className='overflow-auto flex-1'>
          <table className='min-w-full text-sm'>
            <thead className='sticky top-0 bg-gray-50 text-left'>
              <tr>
                {[
                  { key: 'study_id', label: 'Study ID' },
                  { key: 'x', label: 'X' },
                  { key: 'y', label: 'Y' },
                  { key: 'z', label: 'Z' },
                  { key: 'actions', label: 'Actions' }
                ].map(({ key, label }) => (
                  <th key={key} 
                    className={cls(
                      'px-3 py-2 font-semibold',
                      key !== 'actions' ? 'cursor-pointer' : ''
                    )}
                    onClick={() => key !== 'actions' && changeSort(key)}
                  >
                    <span className='inline-flex items-center gap-2'>
                      {label}
                      {key !== 'actions' && (
                        <span className='text-xs text-gray-500'>
                          {sortKey === key ? (sortDir === 'asc' ? '▲' : '▼') : ''}
                        </span>
                      )}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredLocations.length === 0 ? (
                <tr><td colSpan={5} className='px-3 py-4 text-gray-500 text-center'>No matching locations found</td></tr>
              ) : (
                pageRows.map((r, i) => (
                  <tr 
                    key={i} 
                    className={cls(
                      i % 2 ? 'bg-white' : 'bg-gray-50',
                      selectedLocation?.study_id === r.study_id ? 'bg-blue-50' : ''
                    )}
                  >
                    <td className='px-3 py-2 align-top'>{r.study_id}</td>
                    <td className='px-3 py-2 align-top'>{r.x}</td>
                    <td className='px-3 py-2 align-top'>{r.y}</td>
                    <td className='px-3 py-2 align-top'>{r.z}</td>
                    <td className='px-3 py-2 align-top'>
                      <button
                        onClick={() => {
                          setSelectedLocation(r);
                          if (onLocationSelect) onLocationSelect([r.x, r.y, r.z]);
                        }}
                        className='text-sm px-2 py-1 rounded-lg border hover:bg-blue-50'
                      >
                        Use Coordinates
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {query && !loading && !err && (
        <div className='flex items-center justify-between border-t p-3 text-sm'>
          <div>
            <span className='text-gray-600'>Showing </span>
            <b>{(page - 1) * pageSize + 1}</b>
            <span className='text-gray-600'> to </span>
            <b>{Math.min(page * pageSize, filteredLocations.length)}</b>
            <span className='text-gray-600'> of </span>
            <b>{filteredLocations.length}</b>
            <span className='text-gray-600'> locations</span>
          </div>
          <div className='flex items-center gap-2'>
            <button 
              disabled={page <= 1} 
              onClick={() => setPage(1)} 
              className='rounded-lg border px-2 py-1 disabled:opacity-40 hover:bg-gray-50'
              title="First Page"
            >
              ⏮
            </button>
            <button 
              disabled={page <= 1} 
              onClick={() => setPage(p => Math.max(1, p - 1))} 
              className='rounded-lg border px-2 py-1 disabled:opacity-40 hover:bg-gray-50'
            >
              Previous
            </button>
            <button 
              disabled={page >= totalPages} 
              onClick={() => setPage(p => Math.min(totalPages, p + 1))} 
              className='rounded-lg border px-2 py-1 disabled:opacity-40 hover:bg-gray-50'
            >
              Next
            </button>
            <button 
              disabled={page >= totalPages} 
              onClick={() => setPage(totalPages)} 
              className='rounded-lg border px-2 py-1 disabled:opacity-40 hover:bg-gray-50'
              title="Last Page"
            >
              ⏭
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

