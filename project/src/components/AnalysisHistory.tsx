import { useEffect, useState } from 'react';
import { Loader, MapPin, Calendar, Trash2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { LandAnalysis } from '../types/land';

interface AnalysisHistoryProps {
  onSelect: (analysis: LandAnalysis) => void;
  refreshTrigger: number;
}

export function AnalysisHistory({ onSelect, refreshTrigger }: AnalysisHistoryProps) {
  const [analyses, setAnalyses] = useState<LandAnalysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadAnalyses();
  }, [refreshTrigger]);

  const loadAnalyses = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('land_analyses')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAnalyses(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const deleteAnalysis = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this analysis?')) return;

    try {
      const { error } = await supabase
        .from('land_analyses')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setAnalyses(analyses.filter(a => a.id !== id));
    } catch (err: any) {
      alert('Error deleting analysis: ' + err.message);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8 flex items-center justify-center">
        <Loader className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-xl font-bold text-gray-800 mb-4">Analysis History</h3>

      {analyses.length === 0 ? (
        <p className="text-gray-500 text-center py-8">No analyses yet. Start by capturing land!</p>
      ) : (
        <div className="space-y-3">
          {analyses.map((analysis) => (
            <div
              key={analysis.id}
              onClick={() => onSelect(analysis)}
              className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors group"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin className="w-4 h-4 text-blue-600 flex-shrink-0" />
                    <span className="text-sm text-gray-700 truncate">
                      {analysis.latitude.toFixed(4)}°, {analysis.longitude.toFixed(4)}°
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Calendar className="w-3 h-3" />
                    <span>{new Date(analysis.created_at).toLocaleDateString()}</span>
                  </div>
                  {analysis.notes && (
                    <p className="text-sm text-gray-600 mt-2 truncate">{analysis.notes}</p>
                  )}
                </div>
                <button
                  onClick={(e) => deleteAnalysis(analysis.id, e)}
                  className="text-gray-400 hover:text-red-600 transition-colors opacity-0 group-hover:opacity-100"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
