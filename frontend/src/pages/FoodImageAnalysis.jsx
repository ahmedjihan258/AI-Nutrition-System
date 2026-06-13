import React, { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Alert } from '../components/ui/Alert';
import { Upload, Camera, FileImage, ShieldCheck, Flame, Dna, Wheat, Droplet, Eye } from 'lucide-react';

export const FoodImageAnalysis = () => {
  const { user } = useAuth();
  const fileInputRef = useRef(null);

  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Invalid format. Please select an image file.');
        return;
      }
      setSelectedFile(file);
      setImagePreview(URL.createObjectURL(file));
      setResult(null);
      setError('');
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Invalid format. Please drop an image file.');
        return;
      }
      setSelectedFile(file);
      setImagePreview(URL.createObjectURL(file));
      setResult(null);
      setError('');
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Please upload a food image first.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const response = await api.logFoodImage(user.user_id, selectedFile);
      setResult(response);
    } catch (err) {
      setError(
        err.response?.data?.detail || 
        'Image analysis failed. Verify the backend server is online.'
      );
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setSelectedFile(null);
    setImagePreview(null);
    setResult(null);
    setError('');
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Page Header */}
      <div className="border-b border-white/5 pb-6">
        <span className="text-[10px] font-orbitron font-extrabold tracking-widest text-neonBlue uppercase">
          AI IMAGE RECOGNITION
        </span>
        <h1 className="text-3xl font-orbitron font-black tracking-wider text-slate-100 mt-1">
          FOOD IMAGE ANALYSIS
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Upload Panel */}
        <div className="space-y-6">
          <Card variant="blue" className="bg-[#12122c]/40 border-white/5 overflow-hidden">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="w-5 h-5 text-neonBlue animate-pulse" />
                MEAL PHOTO SCANNER
              </CardTitle>
              <CardDescription>Upload a meal photo to classify and log nutrients</CardDescription>
            </CardHeader>
            <CardContent>
              {error && <Alert variant="error" className="mb-4">{error}</Alert>}

              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
              />

              {!imagePreview ? (
                <div
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onClick={triggerFileInput}
                  className="border-2 border-dashed border-white/10 hover:border-neonBlue/40 hover:bg-neonBlue/5 transition-all duration-300 rounded-xl p-12 text-center flex flex-col items-center justify-center cursor-pointer min-h-[260px] group"
                >
                  <Upload className="w-12 h-12 text-slate-500 group-hover:text-neonBlue transition-colors mb-4 stroke-1 group-hover:scale-105 duration-300" />
                  <span className="font-orbitron font-bold text-slate-300 text-sm tracking-wider uppercase block">
                    DRAG & DROP MEAL PHOTO
                  </span>
                  <span className="text-[10px] text-slate-500 font-sans mt-2 block">
                    Supports JPG, PNG or WEBP (max 10MB)
                  </span>
                </div>
              ) : (
                <div className="relative rounded-xl overflow-hidden border border-white/10 max-h-[300px] flex items-center justify-center bg-black/40">
                  <img
                    src={imagePreview}
                    alt="Meal scan preview"
                    className="max-h-[300px] object-contain w-full"
                  />
                  {loading && (
                    <div className="absolute inset-0 bg-slate-950/75 flex flex-col items-center justify-center space-y-4">
                      <div className="cyber-scanner absolute inset-0 pointer-events-none"></div>
                      <svg className="animate-spin h-10 w-10 text-neonBlue" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span className="font-orbitron text-xs text-neonBlue tracking-widest animate-pulse uppercase">
                        IDENTIFYING FOOD...
                      </span>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
            {imagePreview && !loading && (
              <CardFooter className="flex gap-4">
                <Button variant="ghost" className="flex-1" onClick={handleClear}>
                  CLEAR
                </Button>
                <Button variant="blue" className="flex-2" onClick={handleUpload}>
                  ANALYZE IMAGE
                </Button>
              </CardFooter>
            )}
          </Card>
        </div>

        {/* Results Screen */}
        <div>
          {result ? (
            <div className="space-y-6 animate-fade-in">
              {/* Classification Label & Confidence */}
              <Card variant="blue" className="bg-[#12122c]/40 border-white/5 relative">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-neonBlue" />
                    ANALYSIS REPORT
                  </CardTitle>
                  <CardDescription>AI recognition results</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Food Name Display */}
                  <div>
                    <span className="text-[10px] font-orbitron font-bold text-slate-400 block tracking-wider">
                      IDENTIFIED FOOD
                    </span>
                    <h3 className="text-2xl font-orbitron font-black text-slate-100 tracking-wider capitalize mt-1">
                      {result.food}
                    </h3>
                  </div>

                  {/* Confidence Gauge */}
                  <div>
                    <div className="flex justify-between items-center text-[10px] font-orbitron font-bold text-slate-400 tracking-wider mb-2">
                      <span>RECOGNITION CONFIDENCE</span>
                      <span className="text-neonBlue">
                        {Math.round((result.confidence || 0.95) * 100)}%
                      </span>
                    </div>
                    <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                      <div 
                        className="bg-neonBlue h-full rounded-full shadow-neon-blue transition-all duration-1000"
                        style={{ width: `${Math.round((result.confidence || 0.95) * 100)}%` }}
                      ></div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Nutrition details */}
              <Card variant="green" className="bg-[#12122c]/60 border-neonGreen/30 shadow-neon-green/10">
                <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-neonGreen/10">
                  <div>
                    <span className="text-[10px] font-orbitron font-bold text-neonGreen tracking-widest">
                      MEAL LOGGED SUCCESSFULLY
                    </span>
                    <CardTitle className="text-slate-100 mt-2">NUTRITION SUMMARY</CardTitle>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-slate-400 font-orbitron block">CALORIES</span>
                    <span className="text-2xl font-orbitron font-bold text-neonBlue">
                      {Math.round(result.calories)} kcal
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
                        {result.protein}g
                      </span>
                    </div>
                    <div className="bg-[#12122c] border border-white/5 rounded-lg p-3">
                      <div className="flex justify-center mb-1 text-neonGreen">
                        <Wheat className="w-4 h-4" />
                      </div>
                      <span className="text-[10px] font-orbitron text-slate-400 block">CARBS</span>
                      <span className="text-base font-orbitron font-bold text-slate-100">
                        {result.carbs}g
                      </span>
                    </div>
                    <div className="bg-[#12122c] border border-white/5 rounded-lg p-3">
                      <div className="flex justify-center mb-1 text-cyberPink">
                        <Droplet className="w-4 h-4" />
                      </div>
                      <span className="text-[10px] font-orbitron text-slate-400 block">FAT</span>
                      <span className="text-base font-orbitron font-bold text-slate-100">
                        {result.fat}g
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card variant="blue" className="bg-[#12122c]/20 border-white/5 border-dashed h-full min-h-[350px] flex flex-col items-center justify-center text-slate-500 text-center p-8">
              <Eye className="w-10 h-10 text-slate-600 mb-4 stroke-1 animate-pulse" />
              <h3 className="font-orbitron font-bold text-slate-400 text-sm tracking-wider uppercase">ANALYSIS PANEL EMPTY</h3>
              <p className="text-xs text-slate-500 max-w-xs mt-2">Upload a photo of your food and click Analyze Image to view the results here.</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};
