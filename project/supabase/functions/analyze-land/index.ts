import { createClient } from 'npm:@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

interface AnalysisRequest {
  latitude: number;
  longitude: number;
  altitude?: number;
  accuracy?: number;
  imageData: string;
  notes?: string;
}

interface AnalysisResult {
  terrain: string;
  vegetation: string;
  soilType: string;
  landUse: string;
  features: string[];
  recommendations: string[];
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get user from JWT
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        { 
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { 
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const requestData: AnalysisRequest = await req.json();

    // Simulate AI-powered land analysis based on GPS coordinates and image
    // In production, this would call a real ML model or computer vision API
    const analysis: AnalysisResult = analyzeLand(
      requestData.latitude,
      requestData.longitude,
      requestData.imageData
    );

    // Store the analysis in the database
    const { data: landAnalysis, error: dbError } = await supabase
      .from('land_analyses')
      .insert({
        user_id: user.id,
        latitude: requestData.latitude,
        longitude: requestData.longitude,
        altitude: requestData.altitude,
        accuracy: requestData.accuracy,
        image_url: requestData.imageData,
        analysis_result: analysis,
        notes: requestData.notes,
      })
      .select()
      .single();

    if (dbError) {
      throw dbError;
    }

    return new Response(
      JSON.stringify({ success: true, data: landAnalysis }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error analyzing land:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

function analyzeLand(lat: number, lon: number, imageData: string): AnalysisResult {
  // Simulated analysis based on coordinates
  // In production, this would use actual ML models, satellite data, and computer vision
  
  const features: string[] = [];
  const recommendations: string[] = [];

  // Determine terrain based on latitude (simplified)
  let terrain = 'Plains';
  let vegetation = 'Grassland';
  let soilType = 'Loamy soil';
  let landUse = 'Agricultural';

  if (Math.abs(lat) > 60) {
    terrain = 'Tundra';
    vegetation = 'Low shrubs and mosses';
    soilType = 'Permafrost';
    landUse = 'Conservation';
    features.push('Cold climate', 'Limited growing season');
    recommendations.push('Consider cold-resistant crops', 'Implement greenhouse farming');
  } else if (Math.abs(lat) > 45) {
    terrain = 'Temperate hills';
    vegetation = 'Mixed forest';
    soilType = 'Clay-loam';
    landUse = 'Mixed use';
    features.push('Four seasons', 'Moderate rainfall', 'Good drainage');
    recommendations.push('Suitable for diverse crops', 'Consider fruit orchards', 'Good for livestock');
  } else if (Math.abs(lat) > 23.5) {
    terrain = 'Subtropical plains';
    vegetation = 'Dense vegetation';
    soilType = 'Rich organic soil';
    landUse = 'High-yield agriculture';
    features.push('Long growing season', 'High rainfall', 'Fertile land');
    recommendations.push('Ideal for cash crops', 'Multiple harvests possible', 'Consider irrigation systems');
  } else {
    terrain = 'Tropical';
    vegetation = 'Tropical plants';
    soilType = 'Laterite soil';
    landUse = 'Specialized agriculture';
    features.push('Year-round growing', 'High temperatures', 'Heavy rainfall');
    recommendations.push('Focus on tropical crops', 'Implement water management', 'Consider agroforestry');
  }

  // Add general recommendations
  recommendations.push('Conduct soil testing', 'Monitor water table levels', 'Assess local climate patterns');

  return {
    terrain,
    vegetation,
    soilType,
    landUse,
    features,
    recommendations,
  };
}