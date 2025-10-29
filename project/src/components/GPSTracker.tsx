import { useEffect, useState } from 'react';
import { MapPin, Loader } from 'lucide-react';
import type { GPSCoordinates } from '../types/land';

interface GPSTrackerProps {
  onLocationUpdate: (coords: GPSCoordinates) => void;
}

export function GPSTracker({ onLocationUpdate }: GPSTrackerProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [coordinates, setCoordinates] = useState<GPSCoordinates | null>(null);

  const getLocation = () => {
    setLoading(true);
    setError('');

    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords: GPSCoordinates = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          altitude: position.coords.altitude ?? undefined,
          accuracy: position.coords.accuracy,
        };
        setCoordinates(coords);
        onLocationUpdate(coords);
        setLoading(false);
      },
      (err) => {
        setError(`Unable to retrieve location: ${err.message}`);
        setLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  useEffect(() => {
    getLocation();
  }, []);

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          <MapPin className="w-5 h-5 text-blue-600" />
          GPS Location
        </h3>
        <button
          onClick={getLocation}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {loading && <Loader className="w-4 h-4 animate-spin" />}
          {loading ? 'Getting Location...' : 'Refresh Location'}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      {coordinates && (
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-600 font-medium">Latitude</p>
            <p className="text-gray-900">{coordinates.latitude.toFixed(6)}°</p>
          </div>
          <div>
            <p className="text-gray-600 font-medium">Longitude</p>
            <p className="text-gray-900">{coordinates.longitude.toFixed(6)}°</p>
          </div>
          {coordinates.altitude !== undefined && (
            <div>
              <p className="text-gray-600 font-medium">Altitude</p>
              <p className="text-gray-900">{coordinates.altitude.toFixed(1)} m</p>
            </div>
          )}
          {coordinates.accuracy !== undefined && (
            <div>
              <p className="text-gray-600 font-medium">Accuracy</p>
              <p className="text-gray-900">{coordinates.accuracy.toFixed(1)} m</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
