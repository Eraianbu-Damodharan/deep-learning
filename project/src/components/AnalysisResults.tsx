import { MapPin, Leaf, Mountain, Target, Lightbulb } from 'lucide-react';
import type { AnalysisResult } from '../types/land';

interface AnalysisResultsProps {
  result: AnalysisResult;
  imageUrl: string;
  latitude: number;
  longitude: number;
}

export function AnalysisResults({ result, imageUrl, latitude, longitude }: AnalysisResultsProps) {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="relative h-64 bg-gray-200">
        <img
          src={imageUrl}
          alt="Land capture"
          className="w-full h-full object-cover"
        />
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
          <div className="flex items-center gap-2 text-white text-sm">
            <MapPin className="w-4 h-4" />
            <span>{latitude.toFixed(6)}°, {longitude.toFixed(6)}°</span>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Mountain className="w-5 h-5 text-blue-600" />
              <h4 className="font-semibold text-gray-800">Terrain</h4>
            </div>
            <p className="text-gray-700">{result.terrain}</p>
          </div>

          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Leaf className="w-5 h-5 text-green-600" />
              <h4 className="font-semibold text-gray-800">Vegetation</h4>
            </div>
            <p className="text-gray-700">{result.vegetation}</p>
          </div>

          <div className="bg-amber-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-5 h-5 text-amber-600" />
              <h4 className="font-semibold text-gray-800">Soil Type</h4>
            </div>
            <p className="text-gray-700">{result.soilType}</p>
          </div>

          <div className="bg-purple-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-5 h-5 text-purple-600" />
              <h4 className="font-semibold text-gray-800">Land Use</h4>
            </div>
            <p className="text-gray-700">{result.landUse}</p>
          </div>
        </div>

        <div className="border-t pt-4">
          <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <Leaf className="w-5 h-5 text-green-600" />
            Key Features
          </h4>
          <ul className="space-y-2">
            {result.features.map((feature, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-green-600 mt-2 flex-shrink-0"></span>
                <span className="text-gray-700">{feature}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="border-t pt-4">
          <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-yellow-600" />
            Recommendations
          </h4>
          <ul className="space-y-2">
            {result.recommendations.map((rec, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-yellow-600 mt-2 flex-shrink-0"></span>
                <span className="text-gray-700">{rec}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
