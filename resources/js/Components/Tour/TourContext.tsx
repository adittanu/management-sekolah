import { createContext, useContext } from 'react';

interface TourContextType {
    startTour: () => void;
}

export const TourContext = createContext<TourContextType>({
    startTour: () => {},
});

export function useTour() {
    return useContext(TourContext);
}
