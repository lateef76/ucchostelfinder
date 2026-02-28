import React, { useEffect, useRef, useState, useMemo } from "react";
import L from "leaflet";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
  useMapEvents,
  CircleMarker,
} from "react-leaflet";
import {
  DEFAULT_MAP_CENTER,
  DEFAULT_MAP_ZOOM,
  TILE_LAYER,
  createHostelIcon,
  userLocationIcon,
  calculateDistance,
  formatDistance,
  panToLocation,
  getMapHeight,
} from "../lib/mapConfig";
import type { Hostel, UserLocation } from "../types";
import { useFavorites } from "../hooks/useFirestore";
import { MapPin, Navigation, Star, X } from "lucide-react";

// ==================== Props Interface ====================

interface MapProps {
  hostels: Hostel[];
  selectedHostelId?: string | null;
  onHostelSelect?: (hostel: Hostel) => void;
  onMapMove?: (bounds: L.LatLngBounds) => void;
  height?: string;
  showUserLocation?: boolean;
  showClusters?: boolean;
  interactive?: boolean;
}

// ==================== Map Controller Component ====================

interface MapControllerProps {
  selectedHostelId?: string | null;
  hostels: Hostel[];
  onMapReady?: (map: L.Map) => void;
}

const MapController: React.FC<MapControllerProps> = ({
  selectedHostelId,
  hostels,
  onMapReady,
}) => {
  const map = useMap();

  useEffect(() => {
    if (map) {
      onMapReady?.(map);
    }
  }, [map, onMapReady]);

  // Center map on selected hostel
  useEffect(() => {
    if (selectedHostelId) {
      const hostel = hostels.find((h) => h.id === selectedHostelId);
      if (hostel?.coordinates) {
        panToLocation(
          map,
          hostel.coordinates.latitude,
          hostel.coordinates.longitude,
          17,
          1,
        );
      }
    }
  }, [selectedHostelId, hostels, map]);

  return null;
};

// ==================== Map Events Component ====================

interface MapEventsProps {
  onMapClick?: (lat: number, lng: number) => void;
  onMapMove?: (bounds: L.LatLngBounds) => void;
  onMarkerClick?: (hostel: Hostel) => void;
}

const MapEvents: React.FC<MapEventsProps> = ({ onMapClick, onMapMove }) => {
  useMapEvents({
    click(e) {
      onMapClick?.(e.latlng.lat, e.latlng.lng);
    },
    moveend(e) {
      const map = e.target;
      onMapMove?.(map.getBounds());
    },
  });

  return null;
};

// ==================== User Location Component ====================

interface UserLocationMarkerProps {
  show: boolean;
  onLocationFound?: (location: UserLocation) => void;
}

const UserLocationMarker: React.FC<UserLocationMarkerProps> = ({
  show,
  onLocationFound,
}) => {
  const map = useMap();
  const [position, setPosition] = useState<[number, number] | null>(null);
  const [accuracy, setAccuracy] = useState<number | null>(null);

  useEffect(() => {
    if (!show) return;

    let watchId: number;

    const success = (pos: GeolocationPosition) => {
      const { latitude, longitude, accuracy } = pos.coords;
      setPosition([latitude, longitude]);
      setAccuracy(accuracy);

      onLocationFound?.({
        lat: latitude,
        lng: longitude,
        accuracy,
        timestamp: pos.timestamp,
      });

      // Center map on first location
      if (!position) {
        map.flyTo([latitude, longitude], 16, {
          duration: 1.5,
        });
      }
    };

    const error = () => {};

    if (navigator.geolocation) {
      watchId = navigator.geolocation.watchPosition(success, error, {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      });
    }

    return () => {
      if (watchId) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [show, map, onLocationFound, position]);

  if (!show || !position) return null;

  return (
    <>
      {/* Accuracy circle */}
      {accuracy && (
        <CircleMarker
          center={position}
          radius={accuracy / 2} // Rough approximation
          pathOptions={{
            color: "#3b82f6",
            fillColor: "#3b82f6",
            fillOpacity: 0.1,
            weight: 1,
          }}
        />
      )}

      {/* User marker */}
      <Marker position={position} icon={userLocationIcon} zIndexOffset={1000} />
    </>
  );
};

// ==================== Main Map Component ====================

export const Map: React.FC<MapProps> = ({
  hostels,
  selectedHostelId,
  onHostelSelect,
  onMapMove,
  height = getMapHeight(),
  showUserLocation = true,
  interactive = true,
}) => {
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [showLocationPrompt, setShowLocationPrompt] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);
  const { isFavorited } = useFavorites();

  // Handle fullscreen toggle
  const toggleFullscreen = () => {
    if (!document.fullscreenElement && mapRef.current) {
      mapRef.current.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  // Handle location request
  const requestLocation = () => {
    setShowLocationPrompt(true);
  };

  // Handle location found
  const handleLocationFound = (location: UserLocation) => {
    setUserLocation(location);
    setShowLocationPrompt(false);
  };

  // Calculate distance from user for each hostel
  const hostelsWithDistance = useMemo(() => {
    if (!userLocation) return hostels;

    return hostels.map((hostel) => ({
      ...hostel,
      distance: calculateDistance(
        userLocation.lat,
        userLocation.lng,
        hostel.coordinates.latitude,
        hostel.coordinates.longitude,
      ),
    }));
  }, [hostels, userLocation]);

  // Sort by distance if user location available
  // Add distance property to type
  type HostelWithDistance = Hostel & { distance?: number };
  const sortedHostels: HostelWithDistance[] = useMemo(() => {
    if (!userLocation) return hostelsWithDistance as HostelWithDistance[];
    return [...(hostelsWithDistance as HostelWithDistance[])].sort(
      (a, b) => (a.distance || Infinity) - (b.distance || Infinity),
    );
  }, [hostelsWithDistance, userLocation]);

  return (
    <div
      ref={mapRef}
      className="relative rounded-lg overflow-hidden shadow-lg"
      style={{ height }}
    >
      {/* Map Controls Overlay */}
      <div className="absolute top-4 right-4 z-1000 flex flex-col gap-2">
        {/* Location button */}
        {!userLocation && (
          <button
            onClick={requestLocation}
            className="bg-white p-3 rounded-full shadow-lg hover:bg-gray-50 touch-manipulation"
            title="Show my location"
          >
            <Navigation size={24} className="text-ucc-blue" />
          </button>
        )}

        {/* Fullscreen button */}
        <button
          onClick={toggleFullscreen}
          className="bg-white p-3 rounded-full shadow-lg hover:bg-gray-50 touch-manipulation"
          title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            className="text-ucc-blue"
          >
            {isFullscreen ? (
              <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3" />
            ) : (
              <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
            )}
          </svg>
        </button>
      </div>

      {/* Location prompt */}
      {showLocationPrompt && (
        <div className="absolute bottom-4 left-4 right-4 z-1000 bg-white rounded-lg shadow-xl p-4 mx-4">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-semibold">Allow Location Access</h3>
            <button
              onClick={() => setShowLocationPrompt(false)}
              className="p-1 touch-manipulation"
            >
              <X size={20} />
            </button>
          </div>
          <p className="text-sm text-gray-600 mb-3">
            See hostels near you and get directions
          </p>
          <button
            onClick={() => {
              setShowLocationPrompt(false);
              // Browser will prompt automatically
            }}
            className="w-full bg-ucc-blue text-white py-2 rounded-lg touch-manipulation"
          >
            Allow Location Access
          </button>
        </div>
      )}

      {/* Main Map */}
      <MapContainer
        center={DEFAULT_MAP_CENTER}
        zoom={DEFAULT_MAP_ZOOM}
        style={{ height: "100%", width: "100%" }}
        zoomControl={interactive}
        dragging={interactive}
        doubleClickZoom={interactive}
        scrollWheelZoom={interactive}
        touchZoom={interactive}
      >
        <TileLayer {...TILE_LAYER} />

        {/* Map Controller */}
        <MapController
          selectedHostelId={selectedHostelId}
          hostels={hostels}
        />

        {/* Map Events */}
        <MapEvents onMapMove={onMapMove} />

        {/* User Location */}
        <UserLocationMarker
          show={showUserLocation}
          onLocationFound={handleLocationFound}
        />

        {/* Hostel Markers */}
        {sortedHostels.map((hostel) => (
          <Marker
            key={hostel.id}
            position={[
              hostel.coordinates.latitude,
              hostel.coordinates.longitude,
            ]}
            icon={createHostelIcon(
              hostel.id === selectedHostelId,
              isFavorited(hostel.id),
            )}
            eventHandlers={{
              click: () => onHostelSelect?.(hostel),
            }}
          >
            <Popup className="hostel-popup">
              <div className="p-2 max-w-62.5">
                {/* Hostel image */}
                {hostel.images && hostel.images.length > 0 && (
                  <img
                    src={hostel.images[0].url}
                    alt={hostel.name}
                    className="w-full h-32 object-cover rounded-lg mb-2"
                  />
                )}

                {/* Hostel name */}
                <h3 className="font-semibold text-base mb-1">{hostel.name}</h3>

                {/* Location */}
                <p className="text-sm text-gray-600 mb-1 flex items-center gap-1">
                  <MapPin size={14} />
                  {hostel.location}
                </p>

                {/* Distance if available */}
                {hostel.distance && (
                  <p className="text-sm text-ucc-blue font-medium mb-1">
                    {formatDistance(hostel.distance)} from you
                  </p>
                )}

                {/* Rating */}
                {hostel.averageRating > 0 && (
                  <div className="flex items-center gap-1 mb-2">
                    <Star size={14} className="fill-ucc-gold text-ucc-gold" />
                    <span className="text-sm font-medium">
                      {hostel.averageRating.toFixed(1)}
                    </span>
                    <span className="text-xs text-gray-500">
                      ({hostel.reviewCount} reviews)
                    </span>
                  </div>
                )}

                {/* View details button */}
                <button
                  onClick={() => onHostelSelect?.(hostel)}
                  className="w-full bg-ucc-blue text-white text-sm py-2 rounded-lg mt-1 touch-manipulation"
                >
                  View Details
                </button>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Distance indicator */}
      {userLocation && (
        <div className="absolute bottom-4 left-4 bg-white px-3 py-2 rounded-full shadow-md text-sm">
          📍 Showing hostels near you
        </div>
      )}
    </div>
  );
};

export default Map;
