import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Alert } from '../components/ui/Alert';
import { Activity } from 'lucide-react';

export const Register = () => {
  const { loginUser } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password) {
      setError('Please fill in all registration fields.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const result = await api.register(name, email, password);
      if (result.user_id) {
        setSuccess('Registration completed successfully! Logging in...');
        setTimeout(() => {
          loginUser(result.user_id, name);
          navigate('/dashboard');
        }, 1500);
      } else {
        setError(result.message || 'System failed to create user account.');
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed: API server offline.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center px-4 relative overflow-hidden bg-[#050510]">
      {/* Sci-Fi Background FX */}
      <div className="cyber-grid opacity-30"></div>
      <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-neonPurple/10 rounded-full blur-[120px] animate-pulse"></div>
      <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-neonBlue/10 rounded-full blur-[120px] animate-pulse-cyan"></div>

      <div className="w-full max-w-md relative z-10">
        <div className="flex flex-col items-center mb-8">
          <div className="p-3 bg-neonPurple/10 rounded-2xl border border-neonPurple/30 shadow-neon-purple mb-4">
            <Activity className="w-10 h-10 text-neonPurple animate-pulse" />
          </div>
          <h1 className="font-orbitron font-extrabold tracking-widest text-slate-100 text-2xl">
            NUTRIMIND<span className="text-neonBlue font-bold">AI</span>
          </h1>
          <p className="text-xs text-slate-400 font-orbitron tracking-widest uppercase mt-2">
            CREATE A NEW NUTRITION ACCOUNT
          </p>
        </div>

        <Card variant="purple" className="shadow-neon-purple border-neonPurple/20 bg-[#12122c]/80 backdrop-blur-md">
          <CardHeader className="text-center">
            <CardTitle>CREATE ACCOUNT</CardTitle>
            <CardDescription>Register a new nutrition account</CardDescription>
          </CardHeader>

          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {error && <Alert variant="error">{error}</Alert>}
              {success && <Alert variant="success">{success}</Alert>}
              
              <Input
                label="FULL NAME"
                type="text"
                placeholder="Jihan Ahmed"
                value={name}
                onChange={(e) => setName(e.target.value)}
                variant="purple"
                required
              />

              <Input
                label="EMAIL ADDRESS"
                type="email"
                placeholder="operator@nutrimind.ai"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                variant="purple"
                required
              />

              <Input
                label="PASSWORD"
                type="password"
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                variant="purple"
                required
              />
            </CardContent>

            <CardFooter className="flex flex-col gap-4">
              <Button
                type="submit"
                variant="purple"
                className="w-full"
                loading={loading}
              >
                REGISTER
              </Button>

              <div className="text-center w-full">
                <span className="text-xs text-slate-400 font-sans">
                  Already registered?{' '}
                  <Link
                    to="/login"
                    className="text-neonPurple hover:underline font-orbitron text-[11px] tracking-wider ml-1"
                  >
                    SIGN IN
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
