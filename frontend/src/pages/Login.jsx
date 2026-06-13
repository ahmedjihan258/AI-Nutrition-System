import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Alert } from '../components/ui/Alert';
import { Activity, ShieldAlert } from 'lucide-react';

export const Login = () => {
  const { loginUser } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all email and password fields.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const result = await api.login(email, password);
      if (result.user_id) {
        // Login successful
        loginUser(result.user_id, result.name || email.split('@')[0]);
        navigate('/dashboard');
      } else {
        // API returned error message like "Invalid email or password"
        setError(result.message || 'Access Denied: Invalid email or password.');
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Connection failed: API server offline.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center px-4 relative overflow-hidden bg-[#050510]">
      {/* Sci-Fi Background FX */}
      <div className="cyber-grid opacity-30"></div>
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-neonBlue/10 rounded-full blur-[120px] animate-pulse-cyan"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-neonPurple/10 rounded-full blur-[120px] animate-pulse"></div>

      <div className="w-full max-w-md relative z-10">
        <div className="flex flex-col items-center mb-8">
          <div className="p-3 bg-neonBlue/10 rounded-2xl border border-neonBlue/30 shadow-neon-blue mb-4">
            <Activity className="w-10 h-10 text-neonBlue animate-pulse" />
          </div>
          <h1 className="font-orbitron font-extrabold tracking-widest text-slate-100 text-2xl">
            NUTRIMIND<span className="text-neonPurple font-bold">AI</span>
          </h1>
          <p className="text-xs text-slate-400 font-orbitron tracking-widest uppercase mt-2">
            PERSONAL HEALTH & NUTRITION ASSISTANT
          </p>
        </div>

        <Card variant="blue" className="shadow-neon-blue border-neonBlue/20 bg-[#12122c]/80 backdrop-blur-md">
          <CardHeader className="text-center">
            <CardTitle>USER LOGIN</CardTitle>
            <CardDescription>Enter your email and password to log in</CardDescription>
          </CardHeader>

          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {error && <Alert variant="error">{error}</Alert>}
              
              <Input
                label="EMAIL ADDRESS"
                type="email"
                placeholder="operator@nutrimind.ai"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                variant="blue"
                required
              />

              <Input
                label="PASSWORD"
                type="password"
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                variant="blue"
                required
              />
            </CardContent>

            <CardFooter className="flex flex-col gap-4">
              <Button
                type="submit"
                variant="blue"
                className="w-full"
                loading={loading}
              >
                SIGN IN
              </Button>

              <div className="text-center w-full">
                <span className="text-xs text-slate-400 font-sans">
                  Need an account?{' '}
                  <Link
                    to="/register"
                    className="text-neonBlue hover:underline font-orbitron text-[11px] tracking-wider ml-1"
                  >
                    SIGN UP
                  </Link>
                </span>
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
};
