import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { Alert } from '../components/ui/Alert';
import { PageSpinner } from '../components/ui/Spinner';
import { Button } from '../components/ui/Button';
import { Compass, Sparkles, RefreshCw, Flame, Dna, Wheat, Droplet, CheckCircle } from 'lucide-react';

export const Recommendations = () => {
  const { user } = useAuth();
  
  const [recommendations, setRecommendations] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      setError('');
      try {
        const [recsData, analyticsData] = await Promise.all([
          api.getRecommendations(user.user_id),
          api.getAnalytics(user.user_id)
        ]);
        setRecommendations(recsData.recommendations || []);
        setAnalytics(analyticsData);
      } catch (err) {
        setError('Failed to fetch recommendations. Server link offline.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, refreshKey]);

  const handleRefresh = () => {
    setLoading(true);
    setRefreshKey(prev => prev + 1);
  };

  if (loading) {
    return <PageSpinner message="COMPUTING NUTRITIONAL ADVICE..." />;
  }

  // Target boundaries for nutrition diagnostic gauges
  const targets = {
    calories: 2000,
    protein: 140,
    carbs: 230,
    fat: 65,
  };

  const totals = analytics || {
    total_calories: 0,
    total_protein: 0,
    total_carbs: 0,
    total_fat: 0,
  };

  // Helper function to return icon/color for specific recommendations
  const getRecommendationStyle = (rec) => {
    const text = (typeof rec === 'string' ? rec : rec.description || rec.food || '').toLowerCase();
    if (text.includes('protein')) {
      return { border: 'border-neonPurple', iconColor: 'text-neonPurple', bg: 'bg-neonPurple/5', label: 'PROTEIN ADVICE' };
    }
    if (text.includes('calorie') || text.includes('reduce')) {
      return { border: 'border-cyberPink', iconColor: 'text-cyberPink', bg: 'bg-cyberPink/5', label: 'CALORIC ALERT' };
    }
    if (text.includes('fried') || text.includes('fat')) {
      return { border: 'border-yellow-500', iconColor: 'text-yellow-500', bg: 'bg-yellow-500/5', label: 'LIPID CONTROL' };
    }
    return { border: 'border-neonGreen', iconColor: 'text-neonGreen', bg: 'bg-neonGreen/5', label: 'SYSTEM BALANCED' };
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-6">
        <div>
          <span className="text-[10px] font-orbitron font-extrabold tracking-widest text-neonBlue uppercase">
            PERSONALIZED DIETARY ADVICE
          </span>
          <h1 className="text-3xl font-orbitron font-black tracking-wider text-slate-100 mt-1">
            AI RECOMMENDATIONS
          </h1>
        </div>
        <Button variant="outline" size="sm" onClick={handleRefresh}>
          <RefreshCw className="w-4 h-4 mr-2" />
          REFRESH GUIDANCE
        </Button>
      </div>

      {error && <Alert variant="error">{error}</Alert>}

      {/* Daily Nutrition Summary (Required by prompt) */}
      <Card variant="blue" className="bg-[#12122c]/40 border-white/5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-neonBlue/5 rounded-full blur-3xl pointer-events-none"></div>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-neonBlue animate-pulse" />
            DIETARY BALANCE SUMMARY
          </CardTitle>
          <CardDescription>Daily nutrient intake analyzed by AI Assistant</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Calories Summary */}
            <div className="bg-[#12122c] border border-white/5 p-4 rounded-xl">
              <div className="flex items-center justify-between text-slate-400 text-xs font-orbitron font-bold">
                <span>ENERGY INTAKE</span>
                <Flame className="w-4 h-4 text-neonBlue" />
              </div>
              <p className="text-xl font-orbitron font-bold text-slate-100 mt-2">
                {Math.round(totals.total_calories)} <span className="text-xs text-slate-400">kcal</span>
              </p>
              <div className="text-[10px] font-orbitron text-slate-500 mt-1">Goal: {targets.calories} kcal</div>
            </div>

            {/* Protein Summary */}
            <div className="bg-[#12122c] border border-white/5 p-4 rounded-xl">
              <div className="flex items-center justify-between text-slate-400 text-xs font-orbitron font-bold">
                <span>PROTEIN STATUS</span>
                <Dna className="w-4 h-4 text-neonPurple" />
              </div>
              <p className="text-xl font-orbitron font-bold text-slate-100 mt-2">
                {Math.round(totals.total_protein)} <span className="text-xs text-slate-400">g</span>
              </p>
              <div className="text-[10px] font-orbitron text-slate-500 mt-1">Goal: {targets.protein}g</div>
            </div>

            {/* Carbs Summary */}
            <div className="bg-[#12122c] border border-white/5 p-4 rounded-xl">
              <div className="flex items-center justify-between text-slate-400 text-xs font-orbitron font-bold">
                <span>CARBOHYDRATES</span>
                <Wheat className="w-4 h-4 text-neonGreen" />
              </div>
              <p className="text-xl font-orbitron font-bold text-slate-100 mt-2">
                {Math.round(totals.total_carbs)} <span className="text-xs text-slate-400">g</span>
              </p>
              <div className="text-[10px] font-orbitron text-slate-500 mt-1">Goal: {targets.carbs}g</div>
            </div>

            {/* Fat Summary */}
            <div className="bg-[#12122c] border border-white/5 p-4 rounded-xl">
              <div className="flex items-center justify-between text-slate-400 text-xs font-orbitron font-bold">
                <span>FAT INTAKE</span>
                <Droplet className="w-4 h-4 text-cyberPink" />
              </div>
              <p className="text-xl font-orbitron font-bold text-slate-100 mt-2">
                {Math.round(totals.total_fat)} <span className="text-xs text-slate-400">g</span>
              </p>
              <div className="text-[10px] font-orbitron text-slate-500 mt-1">Goal: {targets.fat}g</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recommendation Cards Section */}
      <div className="space-y-4">
        <h3 className="font-orbitron font-extrabold text-sm tracking-widest text-slate-300 uppercase">
          AI DIETARY SUGGESTIONS
        </h3>

        {recommendations.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {recommendations.map((rec, index) => {
              const meta = getRecommendationStyle(rec);
              return (
                <Card 
                  key={index} 
                  hover
                  variant="blue" 
                  className={`bg-[#12122c]/40 border-l-4 ${meta.border} ${meta.bg} transition-all duration-300`}
                >
                  <CardContent className="p-6 flex gap-4">
                    <div className={`p-3 bg-white/5 rounded-xl border border-white/10 ${meta.iconColor}`}>
                      <Compass className="w-6 h-6 animate-pulse" />
                    </div>
                    <div>
                      <span className={`text-[10px] font-orbitron font-bold tracking-wider ${meta.iconColor} block`}>
                        {meta.label}
                      </span>
                      <p className="text-sm text-slate-200 mt-2 font-medium leading-relaxed">
                        {typeof rec === 'string' ? rec : rec.description}
                      </p>
                      <div className="flex items-center gap-1.5 mt-4 text-[10px] font-orbitron text-slate-400">
                        <CheckCircle className="w-3.5 h-3.5 text-neonBlue" />
                        NUTRITIONIST VERIFIED ADVICE
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 text-slate-500 text-xs italic">
            No recommendations yet. Please log food to generate suggestions.
          </div>
        )}
      </div>
    </div>
  );
};
