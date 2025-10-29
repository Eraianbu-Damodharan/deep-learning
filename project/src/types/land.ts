export interface GPSCoordinates {
  latitude: number;
  longitude: number;
  altitude?: number;
  accuracy?: number;
}

export interface AnalysisResult {
  terrain: string;
  vegetation: string;
  soilType: string;
  landUse: string;
  features: string[];
  recommendations: string[];
}

export interface LandAnalysis {
  id: string;
  user_id: string;
  latitude: number;
  longitude: number;
  altitude?: number;
  accuracy?: number;
  image_url: string;
  analysis_result: AnalysisResult;
  notes?: string;
  created_at: string;
  updated_at: string;
}
