import type { LatLngExpression } from 'leaflet';
import { DivIcon } from 'leaflet';

// ==================== Map Configuration ====================

// Default view for UCC campus
export const DEFAULT_MAP_CENTER: LatLngExpression = [5.1167, -1.2833]; // UCC main campus
export const DEFAULT_MAP_ZOOM = 15;
export const MIN_ZOOM = 12;
export const MAX_ZOOM = 19;

// Tile layer configuration (OpenStreetMap)
export const TILE_LAYER = {
  url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  maxZoom: MAX_ZOOM,
  minZoom: MIN_ZOOM,
};

// ==================== Custom Map Icons ====================

// Create custom marker icons
export const createHostelIcon = (isSelected: boolean = false, isFavorite: boolean = false) => {
  const color = isSelected ? '#f4c430' : isFavorite ? '#0a2472' : '#4a5568';
  
  return new DivIcon({
    html: `
      <div style="
        background-color: ${color};
        width: ${isSelected ? '40px' : '32px'};
        height: ${isSelected ? '40px' : '32px'};
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 2px 5px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s;
      ">
        <svg width="${isSelected ? '20' : '16'}" height="${isSelected ? '20' : '16'}" viewBox="0 0 24 24" fill="white">
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
        </svg>
      </div>
    `,
    className: 'custom-marker',
    iconSize: [isSelected ? 40 : 32, isSelected ? 40 : 32],
    iconAnchor: [isSelected ? 20 : 16, isSelected ? 40 : 32],
    popupAnchor: [0, -20],
  });
};

// User location marker
export const userLocationIcon = new DivIcon({
  html: `
    <div style="
      background-color: #3b82f6;
      width: 24px;
      height: 24px;
      border-radius: 50%;
      border: 3px solid white;
      box-shadow: 0 2px 5px rgba(0,0,0,0.3);
      animation: pulse 1.5s infinite;
    ">
      <div style="
        width: 12px;
        height: 12px;
        background-color: white;
        border-radius: 50%;
        margin: 6px auto;
      "></div>
    </div>
  `,
  className: 'user-location-marker',
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

// Cluster icon
export const createClusterIcon = (count: number) => {
  return new DivIcon({
    html: `
      <div style="
        background-color: #0a2472;
        width: ${count > 100 ? '56px' : count > 50 ? '48px' : '40px'};
        height: ${count > 100 ? '56px' : count > 50 ? '48px' : '40px'};
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 2px 5px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: bold;
        font-size: ${count > 100 ? '18px' : count > 50 ? '16px' : '14px'};
        background-color: ${count > 100 ? '#1e3a8a' : count > 50 ? '#2563eb' : '#3b82f6'};
      ">
        ${count}
      </div>
    `,
    className: 'cluster-marker',
    iconSize: [count > 100 ? 56 : count > 50 ? 48 : 40, count > 100 ? 56 : count > 50 ? 48 : 40],
    iconAnchor: [count > 100 ? 28 : count > 50 ? 24 : 20, count > 100 ? 28 : count > 50 ? 24 : 20],
  });
};

// ==================== Location Utilities ====================

// Calculate distance between two coordinates in km (Haversine formula)
export const calculateDistance = (
  lat1: number, 
  lon1: number, 
  lat2: number, 
  lon2: number
): number => {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const toRad = (value: number): number => {
  return (value * Math.PI) / 180;
};

// Get user's current location
export const getUserLocation = (): Promise<GeolocationPosition> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser'));
    } else {
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      });
    }
  });
};

// Watch user's location (for real-time updates)
export const watchUserLocation = (
  onSuccess: (position: GeolocationPosition) => void,
  onError?: (error: GeolocationPositionError) => void
): number => {
  if (!navigator.geolocation) {
    onError?.({
      code: 0,
      message: 'Geolocation not supported',
      PERMISSION_DENIED: 1,
      POSITION_UNAVAILABLE: 2,
      TIMEOUT: 3,
    } as GeolocationPositionError);
    return -1;
  }

  return navigator.geolocation.watchPosition(onSuccess, onError, {
    enableHighAccuracy: true,
    timeout: 10000,
    maximumAge: 0,
  });
};

// Clear location watch
export const clearLocationWatch = (watchId: number) => {
  if (watchId !== -1) {
    navigator.geolocation.clearWatch(watchId);
  }
};

// Format distance for display
export const formatDistance = (distance: number): string => {
  if (distance < 1) {
    return `${Math.round(distance * 1000)} m`;
  }
  return `${distance.toFixed(1)} km`;
};

// Get approximate location name from coordinates
export const getLocationName = (lat: number, lng: number): string => {
  // Simple reverse geocoding - in production, use a proper service
  const locations = [
    { name: 'Science', lat: 5.1167, lng: -1.2833, radius: 0.5 },
    { name: 'North Campus', lat: 5.1200, lng: -1.2800, radius: 0.5 },
    { name: 'South Campus', lat: 5.1130, lng: -1.2860, radius: 0.5 },
    { name: 'Atlantic Hall', lat: 5.1150, lng: -1.2850, radius: 0.3 },
    { name: 'African Hall', lat: 5.1170, lng: -1.2820, radius: 0.3 },
  ];

  for (const loc of locations) {
    const distance = calculateDistance(lat, lng, loc.lat, loc.lng);
    if (distance <= loc.radius) {
      return loc.name;
    }
  }

  return 'Off Campus';
};

// ==================== Map Bounds Utilities ====================

// Calculate bounds from array of coordinates
export const calculateBounds = (coordinates: [number, number][]) => {
  if (coordinates.length === 0) return null;

  let north = -90;
  let south = 90;
  let east = -180;
  let west = 180;

  coordinates.forEach(([lat, lng]) => {
    north = Math.max(north, lat);
    south = Math.min(south, lat);
    east = Math.max(east, lng);
    west = Math.min(west, lng);
  });

  // Add padding
  const latPadding = (north - south) * 0.1;
  const lngPadding = (east - west) * 0.1;

  return {
    north: north + latPadding,
    south: south - latPadding,
    east: east + lngPadding,
    west: west - lngPadding,
  };
};

// Check if a point is within bounds
export const isWithinBounds = (
  lat: number,
  lng: number,
  bounds: { north: number; south: number; east: number; west: number }
): boolean => {
  return (
    lat <= bounds.north &&
    lat >= bounds.south &&
    lng <= bounds.east &&
    lng >= bounds.west
  );
};

// ==================== Map Animation Utilities ====================

// Smooth pan to location
export const panToLocation = (
  map: L.Map,
  lat: number,
  lng: number,
  zoom?: number,
  duration: number = 1
) => {
  map.flyTo([lat, lng], zoom || map.getZoom(), {
    duration,
    easeLinearity: 0.25,
  });
};

// ==================== Mobile-Specific Utilities ====================

// Check if device is mobile (for touch interactions)
export const isMobileDevice = (): boolean => {
  return (
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    ) || window.innerWidth <= 768
  );
};

// Get appropriate map height for device
export const getMapHeight = (): string => {
  if (isMobileDevice()) {
    return 'calc(100vh - 120px)'; // Adjust for header/footer
  }
  return '600px';
};

// Handle map touch events
export const handleMapTouch = (
  e: React.TouchEvent,
  map: L.Map,
  onTouchStart?: () => void,
  // onTouchEnd?: () => void
) => {
  if (e.touches.length === 1) {
    // Single touch - likely user interacting with marker
    onTouchStart?.();
  } else if (e.touches.length === 2) {
    // Two touches - user zooming
    map.dragging.disable();
  }
};

// ==================== CSS Animations ====================

// Add these to your global CSS
const mapAnimations = `
  @keyframes pulse {
    0% {
      transform: scale(1);
      opacity: 1;
    }
    50% {
      transform: scale(1.2);
      opacity: 0.7;
    }
    100% {
      transform: scale(1);
      opacity: 1;
    }
  }

  .custom-marker {
    transition: transform 0.2s;
  }

  .custom-marker:hover {
    transform: scale(1.1);
    z-index: 1000 !important;
  }

  .cluster-marker {
    transition: all 0.2s;
  }

  .cluster-marker:hover {
    transform: scale(1.1);
  }

  /* Mobile touch optimizations */
  .leaflet-control-zoom {
    border: none !important;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1) !important;
  }

  .leaflet-control-zoom a {
    width: 44px !important;
    height: 44px !important;
    line-height: 44px !important;
    font-size: 20px !important;
  }

  .leaflet-control-attribution {
    font-size: 10px !important;
    background: rgba(255,255,255,0.8) !important;
    padding: 2px 5px !important;
    border-radius: 3px !important;
  }

  /* Improve touch targets on mobile */
  @media (max-width: 768px) {
    .leaflet-control-zoom a {
      width: 48px !important;
      height: 48px !important;
      line-height: 48px !important;
    }
    
    .leaflet-popup-close-button {
      width: 44px !important;
      height: 44px !important;
      font-size: 24px !important;
      line-height: 44px !important;
    }
    
    .leaflet-popup-content {
      margin: 15px 20px !important;
    }
  }
`;

// Inject animations
const styleSheet = document.createElement('style');
styleSheet.innerText = mapAnimations;
document.head.appendChild(styleSheet);