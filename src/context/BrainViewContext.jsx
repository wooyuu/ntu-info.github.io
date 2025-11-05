import { createContext, useContext, useState } from 'react';

const BrainViewContext = createContext();

export function BrainViewProvider({ children }) {
  const [coordinates, setCoordinates] = useState({ x: 0, y: 0, z: 0 });
  const [viewSettings, setViewSettings] = useState({
    overlayAlpha: 0.5,
    posOnly: true,
    useAbs: false,
    threshold: 0,
    thresholdMode: 'percentile',
    percentile: 95
  });

  const updateCoordinates = (newCoords) => {
    setCoordinates(prev => ({ ...prev, ...newCoords }));
  };

  const updateViewSettings = (newSettings) => {
    setViewSettings(prev => ({ ...prev, ...newSettings }));
  };

  return (
    <BrainViewContext.Provider value={{
      coordinates,
      viewSettings,
      updateCoordinates,
      updateViewSettings
    }}>
      {children}
    </BrainViewContext.Provider>
  );
}

export function useBrainView() {
  const context = useContext(BrainViewContext);
  if (!context) {
    throw new Error('useBrainView must be used within a BrainViewProvider');
  }
  return context;
}