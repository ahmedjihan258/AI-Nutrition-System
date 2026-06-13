import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Alert } from '../components/ui/Alert';
import { PageSpinner } from '../components/ui/Spinner';
import { User, Calendar, LogOut, BarChart3 } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

export const Profile = () => {
  const { user, logoutUser } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) return;
    
    const fetchProfile = async () => {
      try {
        const data = await api.getProfile(user.user_id);
        setProfileData(data);
      } catch (err) {
        setError('Failed to fetch profile details.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  if (loading) {
    return <PageSpinner message="LOADING USER PROFILE..." />;
  }

  const trends = profileData?.nutrition_trends || [];

  return (
    <div className="space-y-8 pb-12">
      {/* Page Header */}
      <div className="border-b border-white/5 pb-6">
        <span className="text-[10px] font-orbitron font-extrabold tracking-widest text-neonBlue uppercase">
          USER ACCOUNT
        </span>
        <h1 className="text-3xl font-orbitron font-black tracking-wider text-slate-100 mt-1">
          MY PROFILE
        </h1>
      </div>

      {error && <Alert variant="error">{error}</Alert>}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* User details Card */}
        <Card variant="blue" className="bg-[#12122c]/40 border-white/5 h-fit lg:col-span-1">
          <CardHeader className="flex flex-col items-center text-center">
            <div className="w-20 h-20 rounded-full bg-neonBlue/10 border-2 border-neonBlue/40 flex items-center justify-center text-neonBlue shadow-neon-blue/20 mb-4">
              <User className="w-10 h-10" />
            </div>
            <CardTitle className="capitalize">{profileData?.name || user?.username || 'User'}</CardTitle>
            <CardDescription>Nutrition Assistant Profile</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="border-t border-b border-white/5 py-4 space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400 font-orbitron font-semibold tracking-wider">USER ID</span>
                <span className="text-neonBlue font-orbitron font-bold">{user?.user_id || 'UNKNOWN'}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400 font-orbitron font-semibold tracking-wider">EMAIL</span>
                <span className="text-slate-200 font-semibold">{profileData?.email || 'user@example.com'}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400 font-orbitron font-semibold tracking-wider">JOINED</span>
                <span className="text-slate-200 font-semibold flex items-center gap-1 font-orbitron">
                  <Calendar className="w-3.5 h-3.5 text-neonBlue" /> {profileData?.joined_date || new Date().toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400 font-orbitron font-semibold tracking-wider">MEALS LOGGED</span>
                <span className="text-neonPurple font-orbitron font-bold">{profileData?.meals_logged || 0}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400 font-orbitron font-semibold tracking-wider">AVG CALORIES</span>
                <span className="text-neonGreen font-orbitron font-bold">{profileData?.average_calories || 0} kcal</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400 font-orbitron font-semibold tracking-wider">FAVORITE FOOD</span>
                <span className="text-cyberPink font-semibold capitalize">{profileData?.favorite_food || 'None'}</span>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="ghost" className="w-full text-cyberPink border border-cyberPink/20 hover:bg-cyberPink/10 hover:border-cyberPink" onClick={logoutUser}>
              <LogOut className="w-4 h-4 mr-2" />
              LOG OUT
            </Button>
          </CardFooter>
        </Card>

        {/* Nutrition statistics trends Card */}
        <Card variant="purple" className="bg-[#12122c]/40 border-white/5 lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-neonPurple" />
              WEEKLY NUTRITION STATISTICS
            </CardTitle>
            <CardDescription>Daily historical nutrient totals over the past week</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="h-72">
              {trends.length > 0 && trends.some(t => t.Calories > 0) ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={trends} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="day" stroke="#94a3b8" fontSize={11} />
                    <YAxis stroke="#94a3b8" fontSize={11} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#12122c', border: '1px solid rgba(189, 0, 255, 0.2)', borderRadius: '8px' }}
                      labelStyle={{ color: '#bd00ff', fontWeight: 'bold' }}
                    />
                    <Bar dataKey="Calories" fill="#bd00ff" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-slate-500 text-xs italic">
                  No weekly trend data available yet. Log meals to display statistics.
                </div>
              )}
            </div>

            <div className="border-t border-white/5 pt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-[#12122c] border border-white/5 p-4 rounded-xl flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-orbitron font-bold text-slate-300 tracking-wider uppercase">Average Calories</h4>
                  <p className="text-[10px] text-slate-500 mt-1">Average caloric intake per active logging day</p>
                </div>
                <span className="text-sm font-orbitron font-extrabold tracking-wider text-neonBlue uppercase px-2 py-1 bg-white/5 border border-white/10 rounded-md">
                  {profileData?.average_calories || 0} kcal
                </span>
              </div>
              <div className="bg-[#12122c] border border-white/5 p-4 rounded-xl flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-orbitron font-bold text-slate-300 tracking-wider uppercase">Favorite Choice</h4>
                  <p className="text-[10px] text-slate-500 mt-1">Most frequently logged item</p>
                </div>
                <span className="text-sm font-orbitron font-extrabold tracking-wider text-neonPurple uppercase px-2 py-1 bg-white/5 border border-white/10 rounded-md capitalize">
                  {profileData?.favorite_food || 'None'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
