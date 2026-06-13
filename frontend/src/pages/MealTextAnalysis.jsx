import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Alert } from '../components/ui/Alert';
import { BrainCircuit, CheckCircle, Flame, Dna, Wheat, Droplet, Tag } from 'lucide-react';

export const MealTextAnalysis = () => {
  const { user } = useAuth();
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  const sampleTexts = [
    "I ate chicken salad and drank apple juice",
    "Had boiled egg, toast with butter and black coffee for breakfast",
    "I ate rice and chicken curry"
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim()) {
      setError('Please input a text log describing what you consumed.');
      return;
    }

    setError('');
    setResult(null);
    setLoading(true);

    try {
      const response = await api.logFoodText(user.user_id, text.trim());
      setResult(response);
    } catch (err) {
      setError(
        err.response?.data?.detail || 
        'Could not parse text input. Please ensure the backend server and spaCy NLP pipeline are operating.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSelectSample = (sample) => {
    setText(sample);
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Page Header */}
      <div className="border-b border-white/5 pb-6">
        <span className="text-[10px] font-orbitron font-extrabold tracking-widest text-neonBlue uppercase">
          AI MEAL TEXT PARSER
        </span>
        <h1 className="text-3xl font-orbitron font-black tracking-wider text-slate-100 mt-1">
          MEAL TEXT ANALYSIS
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input Text Form */}
        <div className="space-y-6">
          <Card variant="blue" className="bg-[#12122c]/40 border-white/5 relative">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BrainCircuit className="w-5 h-5 text-neonBlue animate-pulse" />
                TEXT-BASED NUTRITION DETECTOR
              </CardTitle>
              <CardDescription>Enter normal text (e.g. "I had rice and chicken curry") to extract nutrients automatically</CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4">
                {error && <Alert variant="error">{error}</Alert>}
                
                <div>
                  <label className="block text-xs font-orbitron font-semibold tracking-wider text-slate-300 mb-2 uppercase">
                    MEAL DESCRIPTION
                  </label>
                  <textarea
                    rows={4}
                    className="w-full bg-[#12122c]/50 border border-white/10 rounded-lg px-4 py-3 text-sm text-slate-100 placeholder-slate-500 transition-all duration-300 outline-none focus:border-neonBlue focus:ring-1 focus:ring-neonBlue/40 resize-none"
                    placeholder="e.g. For dinner I had 200g of boiled rice, two servings of chicken curry and an apple"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    required
                  />
                </div>

                {/* Sample Tags */}
                <div className="space-y-2">
                  <span className="text-[10px] font-orbitron font-bold text-slate-400 block uppercase tracking-wider">
                    SAMPLE PRESETS
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {sampleTexts.map((sample, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSelectSample(sample)}
                        className="text-[11px] font-sans px-2.5 py-1 rounded bg-white/5 border border-white/10 text-slate-300 hover:text-neonBlue hover:border-neonBlue/30 hover:bg-neonBlue/5 transition-all duration-200 cursor-pointer"
                      >
                        "{sample}"
                      </button>
                    ))}
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  type="submit"
                  variant="blue"
                  className="w-full"
                  loading={loading}
                >
                  ANALYZE TEXT
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>

        {/* Results Screen */}
        <div>
          {result ? (
            <div className="space-y-6 animate-fade-in">
              {/* Extracted Foods */}
              <Card variant="blue" className="bg-[#12122c]/40 border-white/5">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Tag className="w-5 h-5 text-neonBlue" />
                    EXTRACTED FOOD ITEMS
                  </CardTitle>
                  <CardDescription>Identified ingredients</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-2">
                  {result.foods && result.foods.length > 0 ? (
                    result.foods.map((food, idx) => (
                      <div
                        key={idx}
                        className="px-3.5 py-1.5 rounded-lg font-orbitron font-semibold text-xs tracking-wider text-neonBlue bg-neonBlue/10 border border-neonBlue/30 shadow-neon-blue/20 capitalize"
                      >
                        {typeof food === 'string' ? food : `${food.food} (${food.quantity})`}
                      </div>
                    ))
                  ) : (
                    <div className="text-xs text-cyberPink font-semibold tracking-wider font-orbitron uppercase">
                      NO MEAL ITEMS DETECTED IN TEXT INPUT.
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Nutrition Summary */}
              {result.nutrition_summary && (
                <Card variant="green" className="bg-[#12122c]/60 border-neonGreen/30 shadow-neon-green/10">
                  <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-neonGreen/10">
                    <div>
                      <div className="flex items-center gap-2 text-neonGreen font-orbitron text-xs font-bold tracking-widest">
                        <CheckCircle className="w-4 h-4" />
                        ANALYSIS COMPLETED
                      </div>
                      <CardTitle className="text-slate-100 mt-2">NUTRITION SUMMARY</CardTitle>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-slate-400 font-orbitron block">TOTAL ENERGY</span>
                      <span className="text-2xl font-orbitron font-bold text-neonBlue">
                        {Math.round(result.nutrition_summary.calories)} kcal
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div className="bg-[#12122c] border border-white/5 rounded-lg p-3">
                        <div className="flex justify-center mb-1 text-neonPurple">
                          <Dna className="w-4 h-4" />
                        </div>
                        <span className="text-[10px] font-orbitron text-slate-400 block">PROTEIN</span>
                        <span className="text-base font-orbitron font-bold text-slate-100">
                          {Math.round(result.nutrition_summary.protein)}g
                        </span>
                      </div>
                      <div className="bg-[#12122c] border border-white/5 rounded-lg p-3">
                        <div className="flex justify-center mb-1 text-neonGreen">
                          <Wheat className="w-4 h-4" />
                        </div>
                        <span className="text-[10px] font-orbitron text-slate-400 block">CARBS</span>
                        <span className="text-base font-orbitron font-bold text-slate-100">
                          {Math.round(result.nutrition_summary.carbs)}g
                        </span>
                      </div>
                      <div className="bg-[#12122c] border border-white/5 rounded-lg p-3">
                        <div className="flex justify-center mb-1 text-cyberPink">
                          <Droplet className="w-4 h-4" />
                        </div>
                        <span className="text-[10px] font-orbitron text-slate-400 block">FAT</span>
                        <span className="text-base font-orbitron font-bold text-slate-100">
                          {Math.round(result.nutrition_summary.fat)}g
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          ) : (
            <Card variant="blue" className="bg-[#12122c]/20 border-white/5 border-dashed h-full min-h-[300px] flex flex-col items-center justify-center text-slate-500 text-center p-8">
              <BrainCircuit className="w-10 h-10 text-slate-600 mb-4 stroke-1 animate-pulse" />
              <h3 className="font-orbitron font-bold text-slate-400 text-sm tracking-wider uppercase">MEAL PARSER IDLE</h3>
              <p className="text-xs text-slate-500 max-w-xs mt-2">Submit a meal description on the left panel to begin analysis.</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};
