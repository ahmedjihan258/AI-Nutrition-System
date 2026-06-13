import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Alert } from '../components/ui/Alert';
import { Flame, Dna, Wheat, Droplet, ClipboardList, CheckCircle, Database } from 'lucide-react';

export const FoodLogging = () => {
  const { user } = useAuth();
  const [foodName, setFoodName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [loggedFood, setLoggedFood] = useState(null);
  
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);

  const fetchHistory = async () => {
    try {
      const data = await api.getHistory(user.user_id);
      setHistory(data);
    } catch (err) {
      console.error("Failed to load meal history.", err);
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchHistory();
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!foodName.trim()) {
      setError('Please input a valid food name.');
      return;
    }

    setError('');
    setLoggedFood(null);
    setLoading(true);

    try {
      const response = await api.logFood(user.user_id, foodName.trim());
      setLoggedFood(response);
      setFoodName('');
      // Reload logs history
      fetchHistory();
    } catch (err) {
      setError(
        err.response?.data?.detail || 
        `The food item '${foodName}' is not stored in our database. Try another item (e.g., rice, apple, banana).`
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Page Header */}
      <div className="border-b border-white/5 pb-6">
        <span className="text-[10px] font-orbitron font-extrabold tracking-widest text-neonBlue uppercase">
          ADD MEAL LOG
        </span>
        <h1 className="text-3xl font-orbitron font-black tracking-wider text-slate-100 mt-1">
          FOOD LOG
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Form and Logged Result */}
        <div className="space-y-6">
          <Card variant="blue" className="bg-[#12122c]/40 border-white/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5 text-neonBlue" />
                LOG YOUR MEAL
              </CardTitle>
              <CardDescription>Input a food item name and amount</CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4">
                {error && <Alert variant="error">{error}</Alert>}
                
                <Input
                  label="FOOD NAME"
                  type="text"
                  placeholder="e.g. apple, boiled chicken, white rice, egg"
                  value={foodName}
                  onChange={(e) => setFoodName(e.target.value)}
                  variant="blue"
                  required
                />
              </CardContent>
              <CardFooter>
                <Button
                  type="submit"
                  variant="blue"
                  className="w-full"
                  loading={loading}
                >
                  LOG MEAL
                </Button>
              </CardFooter>
            </form>
          </Card>

          {/* Logged Nutrition Result Card */}
          {loggedFood && (
            <Card variant="green" className="bg-[#12122c]/60 border-neonGreen/30 shadow-neon-green/10 animate-fade-in">
              <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-neonGreen/10">
                <div>
                  <div className="flex items-center gap-2 text-neonGreen font-orbitron text-xs font-bold tracking-widest">
                    <CheckCircle className="w-4 h-4" />
                    MEAL LOGGED SUCCESSFULLY
                  </div>
                  <CardTitle className="text-slate-100 capitalize mt-2">{loggedFood.food_name}</CardTitle>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-400 font-orbitron block">CALORIES</span>
                  <span className="text-2xl font-orbitron font-bold text-neonBlue">{Math.round(loggedFood.calories)} kcal</span>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <h4 className="text-xs font-orbitron font-bold text-slate-400 tracking-wider mb-4">MACRONUTRIENT BALANCE</h4>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="bg-[#12122c] border border-white/5 rounded-lg p-3">
                    <div className="flex justify-center mb-1 text-neonPurple">
                      <Dna className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-orbitron text-slate-400 block">PROTEIN</span>
                    <span className="text-base font-orbitron font-bold text-slate-100">{loggedFood.protein}g</span>
                  </div>
                  <div className="bg-[#12122c] border border-white/5 rounded-lg p-3">
                    <div className="flex justify-center mb-1 text-neonGreen">
                      <Wheat className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-orbitron text-slate-400 block">CARBS</span>
                    <span className="text-base font-orbitron font-bold text-slate-100">{loggedFood.carbs}g</span>
                  </div>
                  <div className="bg-[#12122c] border border-white/5 rounded-lg p-3">
                    <div className="flex justify-center mb-1 text-cyberPink">
                      <Droplet className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-orbitron text-slate-400 block">FAT</span>
                    <span className="text-base font-orbitron font-bold text-slate-100">{loggedFood.fat}g</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Database log history */}
        <div>
          <Card variant="blue" className="bg-[#12122c]/40 border-white/5 h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ClipboardList className="w-5 h-5 text-neonBlue" />
                MEAL HISTORY
              </CardTitle>
              <CardDescription>Your logged meals history</CardDescription>
            </CardHeader>
            <CardContent className="p-0 max-h-[500px] overflow-y-auto">
              {historyLoading ? (
                <div className="p-8 text-center text-xs text-slate-400 italic">Reading database...</div>
              ) : history.length > 0 ? (
                <div className="divide-y divide-white/5">
                  {history.map((log, index) => (
                    <div key={log.id || index} className="px-6 py-4 flex justify-between items-center hover:bg-white/5 transition-colors">
                      <div>
                        <h4 className="text-xs font-bold font-sans text-slate-200 capitalize">{log.food_name}</h4>
                        <p className="text-[10px] text-slate-400 font-orbitron mt-0.5">
                          {new Date(log.timestamp).toLocaleDateString()} @ {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-xs font-orbitron font-bold text-neonBlue">{Math.round(log.calories)} kcal</span>
                        <div className="text-[9px] font-orbitron flex gap-1.5 text-slate-400">
                          <span className="text-neonPurple">P: {Math.round(log.protein)}g</span>
                          <span className="text-neonGreen">C: {Math.round(log.carbs)}g</span>
                          <span className="text-cyberPink">F: {Math.round(log.fat)}g</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-12 text-center text-slate-500 text-xs italic flex flex-col items-center">
                  <Database className="w-8 h-8 text-slate-600 mb-2 stroke-1" />
                  No logged meals found.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
