import { useState, useEffect, useCallback, useMemo } from 'react';
import L from 'leaflet';
import {
  getUserLocation,
  watchUserLocation,
  clearLocationWatch,
  calculateDistance,
  isWithinBounds,
  panToLocation,
} from '../lib/mapConfig';
import type { Hostel, UserLocation, MapBounds, MapViewport } from '../types';
import { useHostels } from './useFirestore';
import toast from 'react-hot-toast';

interface UseMapProps {
  initialViewport?: MapViewport;
  radius?: number; // Search radius in km
  autoCenter?: boolean;
}

interface UseMapReturn {
  // Map state
  map: L.Map | null;
  setMap: (map: L.Map) => void;
  viewport: MapViewport;
  bounds: MapBounds | null;
  
  // Location state
  userLocation: UserLocation | null;
  locationError: string | null;
  isLocating: boolean;
  locationPermission: 'prompt' | 'granted' | 'denied' | 'unsupported';
  
  // Hostel filtering
  nearbyHostels: Hostel[];
  hostelsInView: Hostel[];
  selectedHostel: Hostel | null;
  
  // Actions
  centerOnUser: () => Promise<void>;
  centerOnHostel: (hostel: Hostel, zoom?: number) => void;
  selectHostel: (hostel: Hostel | null) => void;
  searchNearby: (radius?: number) => Hostel[];
  refreshLocation: () => Promise<void>;
  fitBoundsToHostels: (hostels?: Hostel[]) => void;
}

export const useMap = ({
  initialViewport,
  radius = 2, // Default 2km radius
  autoCenter = true,
}: UseMapProps = {}): UseMapReturn => {
  // Map instance
  const [map, setMap] = useState<L.Map | null>(null);
  const [viewport, setViewport] = useState<MapViewport>(
    initialViewport || {
      center: [5.1167, -1.2833], // UCC campus
      zoom: 15,
    }
  );
  const [bounds, setBounds] = useState<MapBounds | null>(null);
  
  // Location state
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [locationPermission, setLocationPermission] = useState<'prompt' | 'granted' | 'denied' | 'unsupported'>('prompt');
  
  // Hostel state
  const [selectedHostel, setSelectedHostel] = useState<Hostel | null>(null);
  const { hostels } = useHostels(); // Get all hostels

  // ==================== Location Management ====================

  // Check location permission
  useEffect(() => {
    if (!navigator.permissions) {
      setLocationPermission('unsupported');
      return;
    }

    navigator.permissions.query({ name: 'geolocation' }).then((result) => {
      setLocationPermission(result.state as 'prompt' | 'granted' | 'denied');
      
      result.onchange = () => {
        setLocationPermission(result.state as 'prompt' | 'granted' | 'denied');
      };
    });
  }, []);

  // Get user location
  const refreshLocation = useCallback(async () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation not supported');
      setLocationPermission('unsupported');
      return;
    }

    setIsLocating(true);
    setLocationError(null);

    try {
      const position = await getUserLocation();
      const newLocation: UserLocation = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
        accuracy: position.coords.accuracy,
        timestamp: position.timestamp,
      };
      
      setUserLocation(newLocation);
      setLocationPermission('granted');
      
      // Center map on user if autoCenter is true
      if (autoCenter && map) {
        panToLocation(map, newLocation.lat, newLocation.lng, 16, 1.5);
        toast.success('Found your location! 🎯');
      }
    } catch (error: unknown) {
      let message = 'Failed to get location';
      if (typeof error === 'object' && error !== null && 'code' in error) {
        const err = error as { code: number };
        if (err.code === 1) {
          message = 'Location permission denied';
          setLocationPermission('denied');
        } else if (err.code === 2) {
          message = 'Location unavailable';
        } else if (err.code === 3) {
          message = 'Location request timeout';
        }
      }
      setLocationError(message);
      toast.error(message);
    } finally {
      setIsLocating(false);
    }
  }, [map, autoCenter]);

  // Watch location changes
  useEffect(() => {
    if (!map || locationPermission !== 'granted') return;


    const onSuccess = (position: GeolocationPosition) => {
      const newLocation: UserLocation = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
        accuracy: position.coords.accuracy,
        timestamp: position.timestamp,
      };
      
      setUserLocation(newLocation);
      
      // Update viewport if user moves significantly
      if (userLocation) {
        const distance = calculateDistance(
          userLocation.lat,
          userLocation.lng,
          newLocation.lat,
          newLocation.lng
        );
        
        // If moved more than 100 meters, update
        if (distance > 0.1 && autoCenter) {
          panToLocation(map, newLocation.lat, newLocation.lng, map.getZoom(), 0.5);
        }
      }
    };

    const onError = (error: GeolocationPositionError) => {
      console.error('Location watch error:', error);
    };

    const watchId = watchUserLocation(onSuccess, onError);

    return () => {
      clearLocationWatch(watchId);
    };
  }, [map, locationPermission, userLocation, autoCenter]);

  // ==================== Map Events ====================

  // Update bounds when map moves
  useEffect(() => {
    if (!map) return;

    const updateBounds = () => {
      const mapBounds = map.getBounds();
      const ne = mapBounds.getNorthEast();
      const sw = mapBounds.getSouthWest();
      
      setBounds({
        north: ne.lat,
        south: sw.lat,
        east: ne.lng,
        west: sw.lng,
      });
      
      setViewport({
        center: [map.getCenter().lat, map.getCenter().lng],
        zoom: map.getZoom(),
        bounds: {
          north: ne.lat,
          south: sw.lat,
          east: ne.lng,
          west: sw.lng,
        },
      });
    };

    map.on('moveend', updateBounds);
    updateBounds(); // Initial update

    return () => {
      map.off('moveend', updateBounds);
    };
  }, [map]);

  // ==================== Hostel Filtering ====================

  // Get hostels near user location
  const nearbyHostels = useMemo(() => {
    if (!userLocation || !hostels.length) return [];

    return hostels
      .map(hostel => ({
        ...hostel,
        distance: calculateDistance(
          userLocation.lat,
          userLocation.lng,
          hostel.coordinates.latitude,
          hostel.coordinates.longitude
        ),
      }))
      .filter(hostel => hostel.distance <= radius)
      .sort((a, b) => (a.distance || 0) - (b.distance || 0));
  }, [userLocation, hostels, radius]);

  // Get hostels currently visible in map view
  const hostelsInView = useMemo(() => {
    if (!bounds || !hostels.length) return [];

    return hostels.filter(hostel =>
      isWithinBounds(
        hostel.coordinates.latitude,
        hostel.coordinates.longitude,
        bounds
      )
    );
  }, [bounds, hostels]);

  // ==================== Actions ====================

  // Center map on user location
  const centerOnUser = useCallback(async () => {
    if (!map) return;

    if (!userLocation) {
      await refreshLocation();
    } else {
      panToLocation(map, userLocation.lat, userLocation.lng, 16, 1);
    }
  }, [map, userLocation, refreshLocation]);

  // Center map on specific hostel
  const centerOnHostel = useCallback((hostel: Hostel, zoom: number = 17) => {
    if (!map) return;
    
    panToLocation(
      map,
      hostel.coordinates.latitude,
      hostel.coordinates.longitude,
      zoom,
      1
    );
    setSelectedHostel(hostel);
  }, [map]);

  // Select hostel
  const selectHostel = useCallback((hostel: Hostel | null) => {
    setSelectedHostel(hostel);
    
    if (hostel && map) {
      panToLocation(
        map,
        hostel.coordinates.latitude,
        hostel.coordinates.longitude,
        17,
        0.5
      );
    }
  }, [map]);

  // Search for hostels within radius
  const searchNearby = useCallback((searchRadius: number = radius): Hostel[] => {
    if (!userLocation || !hostels.length) return [];

    const nearby = hostels
      .map(hostel => ({
        ...hostel,
        distance: calculateDistance(
          userLocation.lat,
          userLocation.lng,
          hostel.coordinates.latitude,
          hostel.coordinates.longitude
        ),
      }))
      .filter(hostel => hostel.distance <= searchRadius)
      .sort((a, b) => (a.distance || 0) - (b.distance || 0));

    toast.success(`Found ${nearby.length} hostels within ${searchRadius}km`);
    return nearby;
  }, [userLocation, hostels, radius]);

  // Fit map bounds to show all hostels
  const fitBoundsToHostels = useCallback((hostelsToFit: Hostel[] = hostels) => {
    if (!map || !hostelsToFit.length) return;

    const bounds = L.latLngBounds(
      hostelsToFit.map(h => [h.coordinates.latitude, h.coordinates.longitude])
    );
    
    map.flyToBounds(bounds, {
      padding: [50, 50],
      duration: 1,
    });
  }, [map, hostels]);

  // Get location name for current position

  return {
    // Map state
    map,
    setMap,
    viewport,
    bounds,
    
    // Location state
    userLocation,
    locationError,
    isLocating,
    locationPermission,
    
    // Hostel filtering
    nearbyHostels,
    hostelsInView,
    selectedHostel,
    
    // Actions
    centerOnUser,
    centerOnHostel,
    selectHostel,
    searchNearby,
    refreshLocation,
    fitBoundsToHostels,
  };
};

// ==================== Helper Hook for Directions ====================

interface UseDirectionsProps {
  origin?: { lat: number; lng: number };
  destination?: { lat: number; lng: number };
}

export const useDirections = ({ origin, destination }: UseDirectionsProps = {}) => {
  const [route, setRoute] = useState<unknown>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [distance, setDistance] = useState<string>('');
  const [duration, setDuration] = useState<string>('');

  const getDirections = useCallback(async (
    start: { lat: number; lng: number },
    end: { lat: number; lng: number }
  ) => {
    setLoading(true);
    setError(null);

    try {
      // Using OSRM (Open Source Routing Machine) - free tier
      const response = await fetch(
        `https://router.project-osrm.org/route/v1/driving/${start.lng},${start.lat};${end.lng},${end.lat}?overview=full&geometries=geojson`
      );
      
      const data = await response.json();
      
      if (data.code === 'Ok') {
        const route = data.routes[0];
        setRoute(route);
        
        // Format distance (convert from meters to km)
        const distKm = route.distance / 1000;
        setDistance(distKm < 1 
          ? `${Math.round(route.distance)} m` 
          : `${distKm.toFixed(1)} km`
        );
        
        // Format duration (convert from seconds)
        const mins = Math.round(route.duration / 60);
        if (mins < 60) {
          setDuration(`${mins} min`);
        } else {
          const hours = Math.floor(mins / 60);
          const remainingMins = mins % 60;
          setDuration(`${hours} hr ${remainingMins} min`);
        }
      } else {
        throw new Error('Could not calculate route');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get directions');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (origin && destination) {
      getDirections(origin, destination);
    }
  }, [origin, destination, getDirections]);

  const clearRoute = useCallback(() => {
    setRoute(null);
    setDistance('');
    setDuration('');
    setError(null);
  }, []);

  return {
    route,
    loading,
    error,
    distance,
    duration,
    getDirections,
    clearRoute,
  };
};

// ==================== Hook for Map Search ====================

export const useMapSearch = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Hostel[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  type LocationResult = { display_name: string; lat: string; lon: string; type: string };

  const searchByLocation = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);

    try {
      // Use Nominatim (OpenStreetMap's geocoding service) - free
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          query + ', University of Cape Coast, Ghana'
        )}`
      );
      
      const data: LocationResult[] = await response.json();
      
      // Convert results to locations
      const locations = data.map((item) => ({
        name: item.display_name.split(',')[0],
        lat: parseFloat(item.lat),
        lng: parseFloat(item.lon),
        type: item.type,
      }));
      setSearchResults(locations as unknown as Hostel[]);
    } catch (error) {
      console.error('Search error:', error);
      toast.error('Search failed. Please try again.');
    } finally {
      setIsSearching(false);
    }
  }, []);

  return {
    searchQuery,
    setSearchQuery,
    searchResults,
    isSearching,
    searchByLocation,
  };
};