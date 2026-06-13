import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { Alert } from '../components/ui/Alert';
import { PageSpinner } from '../components/ui/Spinner';
import { Button } from '../components/ui/Button';
import {
  Flame,
  Dna,
  Wheat,
  Droplet,
  Plus,
  RefreshCw,
  Compass,
  History,
  TrendingUp,
  Activity,
  Award
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid
} from 'recharts';

export const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [dashboardData, setDashboardData] = useState(null);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  // Daily target values for visualization purposes
  const targets = {
    calories: 2000,
    protein: 140,
    carbs: 230,
    fat: 65,
  };

  useEffect(() => {
    if (!user) return;

    const fetchAllData = async () => {
      setError('');
      try {
        const [dash, analytics, hist] = await Promise.all([
          api.getDashboard(user.user_id),
          api.getAnalytics(user.user_id),
          api.getHistory(user.user_id)
        ]);
        setDashboardData(dash);
        setAnalyticsData(analytics);
        setHistory(hist);
      } catch (err) {
        setError('Failed to fetch nutrition data. Re-verify API connection.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, [user, refreshKey]);

  const handleRefresh = () => {
    setLoading(true);
    setRefreshKey(prev => prev + 1);
  };

  if (loading) {
    return <PageSpinner message="LOADING NUTRITION DATA SYSTEM..." />;
  }

  const summary = dashboardData?.nutrition_summary || {
    total_calories: 0,
    total_protein: 0,
    total_carbs: 0,
    total_fat: 0,
  };
  const recentFoods = dashboardData?.recent_foods || [];
  const recommendations = dashboardData?.recommendations || [];

  // If no records exist, show a clean empty state
  if (recentFoods.length === 0) {
    return (
      <div className="space-y-8 pb-12">
        {/* Header Panel */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-6">
          <div>
            <span className="text-[10px] font-orbitron font-extrabold tracking-widest text-neonBlue uppercase">
              MEAL NUTRITION DASHBOARD
            </span>
            <h1 className="text-3xl font-orbitron font-black tracking-wider text-slate-100 mt-1">
              HEALTH DASHBOARD
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={handleRefresh}>
              <RefreshCw className="w-4 h-4 mr-2" />
              REFRESH
            </Button>
            <Button variant="blue" size="sm" onClick={() => navigate('/log')}>
              <Plus className="w-4 h-4 mr-2" />
              LOG MEAL
            </Button>
          </div>
        </div>

        <div className="glass-panel border-dashed border-white/10 rounded-2xl p-16 text-center flex flex-col items-center justify-center min-h-[400px]">
          <Activity className="w-16 h-16 text-slate-600 mb-6 stroke-1 animate-pulse" />
          <h2 className="text-xl font-orbitron font-bold text-slate-300 uppercase tracking-wider">
            No nutrition data available yet.
          </h2>
          <p className="text-slate-400 text-sm max-w-md mt-3 mb-8 leading-relaxed">
            Start logging your daily meals using text analysis or food photo upload to view personalized real-time metrics and dynamic AI diet suggestions.
          </p>
          <Button variant="blue" onClick={() => navigate('/log')}>
            <Plus className="w-4 h-4 mr-2" />
            LOG FIRST MEAL
          </Button>
        </div>
      </div>
    );
  }

  // Recharts Data Prep
  // 1. Macronutrient Breakdown Pie
  const macroPieData = [
    { name: 'Protein (g)', value: Math.max(summary.total_protein, 0), color: '#bd00ff' },
    { name: 'Carbs (g)', value: Math.max(summary.total_carbs, 0), color: '#39ff14' },
    { name: 'Fat (g)', value: Math.max(summary.total_fat, 0), color: '#ff007f' },
  ];
  const totalMacrosLogged = macroPieData.reduce((sum, item) => sum + item.value, 0);

  // 2. Generate Real Weekly Calories Trend data dynamically from history logs
  const getWeeklyTrendData = () => {
    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const result = [];
    const today = new Date();
    
    const dailyMap = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      const dateKey = d.toDateString();
      const dayLabel = i === 0 ? 'Today' : daysOfWeek[d.getDay()];
      dailyMap[dateKey] = {
        day: dayLabel,
        Calories: 0,
        Protein: 0,
        Carbs: 0,
        Fat: 0
      };
    }
    
    history.forEach(log => {
      const logDate = new Date(log.timestamp).toDateString();
      if (dailyMap[logDate]) {
        dailyMap[logDate].Calories += log.calories;
        dailyMap[logDate].Protein += log.protein;
        dailyMap[logDate].Carbs += log.carbs;
        dailyMap[logDate].Fat += log.fat;
      }
    });
    
    Object.keys(dailyMap).forEach(key => {
      result.push({
        day: dailyMap[key].day,
        Calories: Math.round(dailyMap[key].Calories),
        Protein: Math.round(dailyMap[key].Protein),
        Carbs: Math.round(dailyMap[key].Carbs),
        Fat: Math.round(dailyMap[key].Fat)
      });
    });
    
    return result;
  };

  const weeklyTrendData = getWeeklyTrendData();

  return (
    <div className="space-y-8 pb-12">
      {/* Header Panel */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-6">
        <div>
          <span className="text-[10px] font-orbitron font-extrabold tracking-widest text-neonBlue uppercase">
            MEAL NUTRITION DASHBOARD
          </span>
          <h1 className="text-3xl font-orbitron font-black tracking-wider text-slate-100 mt-1">
            HEALTH DASHBOARD
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            <RefreshCw className="w-4 h-4 mr-2" />
            REFRESH
          </Button>
          <Button variant="blue" size="sm" onClick={() => navigate('/log')}>
            <Plus className="w-4 h-4 mr-2" />
            LOG MEAL
          </Button>
        </div>
      </div>

      {error && <Alert variant="error">{error}</Alert>}

      {/* Grid of Micro stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Calories Card */}
        <Card variant="blue" hover className="border-neonBlue/10 bg-[#12122c]/40 relative">
          <div className="absolute top-0 right-0 w-24 h-24 bg-neonBlue/5 rounded-full blur-2xl"></div>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="p-3 bg-neonBlue/15 rounded-xl border border-neonBlue/20 text-neonBlue shadow-neon-blue/20">
              <Flame className="w-6 h-6 animate-pulse" />
            </div>
            <div className="flex-1">
              <span className="text-[10px] font-orbitron font-bold text-slate-400 tracking-wider">ENERGY INTAKE</span>
              <div className="text-2xl font-orbitron font-bold text-slate-100 mt-1">
                {Math.round(summary.total_calories)} <span className="text-xs text-neonBlue">kcal</span>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden">
                <div 
                  className="bg-neonBlue h-full rounded-full transition-all duration-500 shadow-neon-blue"
                  style={{ width: `${Math.min((summary.total_calories / targets.calories) * 100, 100)}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-[10px] text-slate-400 font-orbitron mt-1.5">
                <span>GOAL: {targets.calories}</span>
                <span>{Math.round((summary.total_calories / targets.calories) * 100)}%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Protein Card */}
        <Card variant="purple" hover className="border-neonPurple/10 bg-[#12122c]/40 relative">
          <div className="absolute top-0 right-0 w-24 h-24 bg-neonPurple/5 rounded-full blur-2xl"></div>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="p-3 bg-neonPurple/15 rounded-xl border border-neonPurple/20 text-neonPurple shadow-neon-purple/20">
              <Dna className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <span className="text-[10px] font-orbitron font-bold text-slate-400 tracking-wider">PROTEIN INTAKE</span>
              <div className="text-2xl font-orbitron font-bold text-slate-100 mt-1">
                {Math.round(summary.total_protein)} <span className="text-xs text-neonPurple">g</span>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden">
                <div 
                  className="bg-neonPurple h-full rounded-full transition-all duration-500 shadow-neon-purple"
                  style={{ width: `${Math.min((summary.total_protein / targets.protein) * 100, 100)}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-[10px] text-slate-400 font-orbitron mt-1.5">
                <span>GOAL: {targets.protein}g</span>
                <span>{Math.round((summary.total_protein / targets.protein) * 100)}%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Carbs Card */}
        <Card variant="green" hover className="border-neonGreen/10 bg-[#12122c]/40 relative">
          <div className="absolute top-0 right-0 w-24 h-24 bg-neonGreen/5 rounded-full blur-2xl"></div>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="p-3 bg-neonGreen/15 rounded-xl border border-neonGreen/20 text-neonGreen">
              <Wheat className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <span className="text-[10px] font-orbitron font-bold text-slate-400 tracking-wider">CARBOHYDRATES</span>
              <div className="text-2xl font-orbitron font-bold text-slate-100 mt-1">
                {Math.round(summary.total_carbs)} <span className="text-xs text-neonGreen">g</span>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden">
                <div 
                  className="bg-neonGreen h-full rounded-full transition-all duration-500 shadow-[0_0_8px_rgba(57,255,20,0.4)]"
                  style={{ width: `${Math.min((summary.total_carbs / targets.carbs) * 100, 100)}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-[10px] text-slate-400 font-orbitron mt-1.5">
                <span>GOAL: {targets.carbs}g</span>
                <span>{Math.round((summary.total_carbs / targets.carbs) * 100)}%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Fat Card */}
        <Card variant="pink" hover className="border-cyberPink/10 bg-[#12122c]/40 relative">
          <div className="absolute top-0 right-0 w-24 h-24 bg-cyberPink/5 rounded-full blur-2xl"></div>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="p-3 bg-cyberPink/15 rounded-xl border border-cyberPink/20 text-cyberPink shadow-[0_0_12px_rgba(255,0,127,0.15)]">
              <Droplet className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <span className="text-[10px] font-orbitron font-bold text-slate-400 tracking-wider">FAT INTAKE</span>
              <div className="text-2xl font-orbitron font-bold text-slate-100 mt-1">
                {Math.round(summary.total_fat)} <span className="text-xs text-cyberPink">g</span>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden">
                <div 
                  className="bg-cyberPink h-full rounded-full transition-all duration-500 shadow-[0_0_8px_rgba(255,0,127,0.4)]"
                  style={{ width: `${Math.min((summary.total_fat / targets.fat) * 100, 100)}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-[10px] text-slate-400 font-orbitron mt-1.5">
                <span>GOAL: {targets.fat}g</span>
                <span>{Math.round((summary.total_fat / targets.fat) * 100)}%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Charts & Telemetry Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
        {/* Chart 1: Daily Calorie Intake Trend */}
        <Card variant="blue" className="lg:col-span-2 border-white/5 bg-[#12122c]/20">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-neonBlue" />
                WEEKLY CALORIC TREND
              </CardTitle>
              <CardDescription>Daily Caloric logs vs Target Baseline</CardDescription>
            </div>
            <Activity className="w-5 h-5 text-neonPurple/50 animate-pulse" />
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyTrendData} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="day" stroke="#94a3b8" fontSize={11} fontStyle="italic" />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#12122c', border: '1px solid rgba(0, 240, 255, 0.2)', borderRadius: '8px' }}
                  labelStyle={{ color: '#00f0ff', fontWeight: 'bold' }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', color: '#fff' }} />
                <Bar dataKey="Calories" fill="#00f0ff" radius={[4, 4, 0, 0]} shadow="0 0 10px rgba(0,240,255,0.3)">
                  {weeklyTrendData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.day === 'Today' ? '#bd00ff' : '#00f0ff'} 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Chart 2: Macronutrient distribution */}
        <Card variant="purple" className="border-white/5 bg-[#12122c]/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-neonPurple" />
              MACRO DISTRIBUTION
            </CardTitle>
            <CardDescription>Synthesized balance of today's logs</CardDescription>
          </CardHeader>
          <CardContent className="h-80 flex flex-col justify-between items-center">
            {totalMacrosLogged > 0 ? (
              <div className="w-full h-48 relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={macroPieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {macroPieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ backgroundColor: '#12122c', border: '1px solid rgba(189, 0, 255, 0.2)', borderRadius: '8px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-[10px] font-orbitron text-slate-400 tracking-wider">TOTAL MACROS</span>
                  <span className="text-xl font-orbitron font-bold text-slate-100">{Math.round(totalMacrosLogged)}g</span>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-48 text-slate-500 text-xs italic">
                No logs recorded today.
              </div>
            )}
            <div className="grid grid-cols-3 w-full gap-2 text-center text-xs mt-2 border-t border-white/5 pt-4">
              <div className="flex flex-col">
                <span className="text-[10px] text-neonPurple font-orbitron font-bold">PROTEIN</span>
                <span className="text-slate-200 mt-1 font-semibold">{Math.round(summary.total_protein)}g</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-neonGreen font-orbitron font-bold">CARBS</span>
                <span className="text-slate-200 mt-1 font-semibold">{Math.round(summary.total_carbs)}g</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-cyberPink font-orbitron font-bold">FAT</span>
                <span className="text-slate-200 mt-1 font-semibold">{Math.round(summary.total_fat)}g</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Food logs & recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Foods List */}
        <Card variant="blue" className="border-white/5 bg-[#12122c]/20">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <History className="w-5 h-5 text-neonBlue" />
                RECENTLY LOGGED MEALS
              </CardTitle>
              <CardDescription>Last 5 food items added to your log</CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={() => navigate('/log')}>
              VIEW ALL
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            {recentFoods.length > 0 ? (
              <div className="divide-y divide-white/5">
                {recentFoods.map((food, idx) => (
                  <div key={food.id || idx} className="px-6 py-4 flex items-center justify-between hover:bg-white/5 transition-colors">
                    <div>
                      <h4 className="text-sm font-semibold text-slate-100 capitalize">{food.food_name}</h4>
                      <p className="text-[10px] text-slate-400 font-orbitron mt-0.5">
                        {new Date(food.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-xs font-bold font-orbitron text-neonBlue">
                        {Math.round(food.calories)} kcal
                      </span>
                      <div className="text-[10px] font-orbitron flex gap-1.5 text-slate-400">
                        <span className="text-neonPurple">P: {Math.round(food.protein)}g</span>
                        <span className="text-neonGreen">C: {Math.round(food.carbs)}g</span>
                        <span className="text-cyberPink">F: {Math.round(food.fat)}g</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="px-6 py-12 flex flex-col items-center justify-center text-slate-500 text-xs italic">
                <Activity className="w-8 h-8 text-slate-600 mb-2 stroke-1" />
                No meals logged today.
              </div>
            )}
          </CardContent>
        </Card>

        {/* AI Healthcare Recommendations */}
        <Card variant="purple" className="border-white/5 bg-[#12122c]/20 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-neonPurple/5 rounded-full blur-3xl"></div>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Compass className="w-5 h-5 text-neonPurple" />
              AI NUTRITION RECOMMENDATIONS
            </CardTitle>
            <CardDescription>Personalized advice computed from nutrient trends</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              {recommendations.length > 0 ? (
                recommendations.map((rec, index) => (
                  <div 
                    key={index} 
                    className="glass-panel p-4 rounded-xl border-l-4 border-neonPurple flex items-start gap-3 bg-[#19193f]/20 hover:bg-[#19193f]/40 transition-colors"
                  >
                    <Award className="w-5 h-5 text-neonPurple shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-orbitron font-bold text-slate-300 tracking-wider">NUTRITIONAL GUIDANCE</h4>
                      <p className="text-xs text-slate-200 mt-1 font-medium leading-relaxed">
                        {typeof rec === 'string' ? rec : rec.description}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-xs text-slate-400 italic">No recommendations today. Log meals to trigger analysis.</div>
              )}
            </div>
            <div className="pt-2">
              <Button 
                variant="outlinePurple" 
                size="sm" 
                className="w-full" 
                onClick={() => navigate('/recommendations')}
              >
                OPEN RECOMMENDATION HUB
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
