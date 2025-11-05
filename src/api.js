export const API_BASE = 'https://mil.psy.ntu.edu.tw:5000';

export const fetchTerms = async (query) => {
  const response = await fetch(`${API_BASE}/terms?q=${encodeURIComponent(query || '')}`);
  if (!response.ok) throw new Error('Failed to fetch terms');
  return response.json();
};

export const fetchStudies = async (query) => {
  const response = await fetch(`${API_BASE}/studies?q=${encodeURIComponent(query || '')}`);
  if (!response.ok) throw new Error('Failed to fetch studies');
  return response.json();
};

export const fetchBrainMap = async (query) => {
  const response = await fetch(`${API_BASE}/brain-map?q=${encodeURIComponent(query || '')}`);
  if (!response.ok) throw new Error('Failed to fetch brain map');
  return response.json();
};

export const fetchLocations = async (query) => {
  const response = await fetch(`${API_BASE}/locations?q=${encodeURIComponent(query || '')}`);
  if (!response.ok) throw new Error('Failed to fetch locations');
  return response.json();
};
