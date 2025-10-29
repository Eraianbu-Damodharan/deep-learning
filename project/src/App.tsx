import { useEffect, useState } from 'react';
import { Camera, Loader, LogOut } from 'lucide-react';
import { supabase } from './lib/supabase';
import { AuthForm } from './components/AuthForm';
import { CameraCapture } from './components/CameraCapture';
import { GPSTracker } from './components/GPSTracker';
import { AnalysisResults } from './components/AnalysisResults';
import { AnalysisHistory } from './components/AnalysisHistory';
import type { GPSCoordinates, LandAnalysis } from './types/land';

function App() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showCamera, setShowCamera] = useState(false);
  const [gpsCoords, setGpsCoords] = useState<GPSCoordinates | null>(null);
  const [capturedImage, setCapturedImage] = useState<string>('');
  const [analyzing, setAnalyzing] = useState(false);
  const [currentAnalysis, setCurrentAnalysis] = useState<LandAnalysis | null>(null);
  const [notes, setNotes] = useState('');
  const [historyRefresh, setHistoryRefresh] = useState(0);

  useEffect(() => {
    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
    setLoading(false);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setCurrentAnalysis(null);
    setCapturedImage('');
    setNotes('');
  };

  const handleCapture = (imageData: string) => {
    setCapturedImage(imageData);
    setShowCamera(false);
  };

  const handleAnalyze = async () => {
    if (!gpsCoords || !capturedImage) {
      alert('Please ensure GPS location is available and image is captured');
      return;
    }

    setAnalyzing(true);

    try {
      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/analyze-land`;
      const { data: { session } } = await supabase.auth.getSession();

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session?.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          latitude: gpsCoords.latitude,
          longitude: gpsCoords.longitude,
          altitude: gpsCoords.altitude,
          accuracy: gpsCoords.accuracy,
          imageData: capturedImage,
          notes: notes,
        }),
      });

      if (!response.ok) {
        throw new Error('Analysis failed');
      }

      const result = await response.json();
      setCurrentAnalysis(result.data);
      setCapturedImage('');
      setNotes('');
      setHistoryRefresh(prev => prev + 1);
    } catch (err: any) {
      alert('Error analyzing land: ' + err.message);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSelectHistory = (analysis: LandAnalysis) => {
    setCurrentAnalysis(analysis);
    setCapturedImage('');
  };

  const handleNewAnalysis = () => {
    setCurrentAnalysis(null);
    setCapturedImage('');
    setNotes('');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center">
        <Loader className="w-12 h-12 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!user) {
    return <AuthForm onAuthSuccess={checkUser} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-800">Land Recognition System</h1>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-gray-900 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {currentAnalysis ? (
              <>
                <div className="flex justify-end">
                  <button
                    onClick={handleNewAnalysis}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    New Analysis
                  </button>
                </div>
                <AnalysisResults
                  result={currentAnalysis.analysis_result}
                  imageUrl={currentAnalysis.image_url}
                  latitude={currentAnalysis.latitude}
                  longitude={currentAnalysis.longitude}
                />
              </>
            ) : (
              <>
                <GPSTracker onLocationUpdate={setGpsCoords} />

                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Capture Land Image</h3>

                  {capturedImage ? (
                    <div className="space-y-4">
                      <img
                        src={capturedImage}
                        alt="Captured land"
                        className="w-full h-64 object-cover rounded-lg"
                      />
                      <div className="flex gap-3">
                        <button
                          onClick={() => setCapturedImage('')}
                          className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          Retake
                        </button>
                        <button
                          onClick={handleAnalyze}
                          disabled={analyzing || !gpsCoords}
                          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                          {analyzing && <Loader className="w-4 h-4 animate-spin" />}
                          {analyzing ? 'Analyzing...' : 'Analyze Land'}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setShowCamera(true)}
                      className="w-full py-8 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors flex flex-col items-center justify-center gap-3"
                    >
                      <Camera className="w-12 h-12 text-gray-400" />
                      <span className="text-gray-600 font-medium">Open Camera</span>
                    </button>
                  )}

                  <div className="mt-4">
                    <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
                      Notes (Optional)
                    </label>
                    <textarea
                      id="notes"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Add any notes about this location..."
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none"
                      rows={3}
                    />
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="lg:col-span-1">
            <AnalysisHistory onSelect={handleSelectHistory} refreshTrigger={historyRefresh} />
          </div>
        </div>
      </main>

      {showCamera && (
        <CameraCapture
          onCapture={handleCapture}
          onClose={() => setShowCamera(false)}
        />
      )}
    </div>
  );
}

export default App;
