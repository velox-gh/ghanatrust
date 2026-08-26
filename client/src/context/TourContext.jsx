import React, { createContext, useContext, useState } from 'react';

const TourContext = createContext();

export const useTour = () => useContext(TourContext);

export const TourProvider = ({ children }) => {
  const [runTour, setRunTour] = useState(false);

  const startTour = () => {
    setRunTour(true);
  };

  const stopTour = () => {
    setRunTour(false);
  };

  return (
    <TourContext.Provider value={{ runTour, startTour, stopTour }}>
      {children}
    </TourContext.Provider>
  );
};
