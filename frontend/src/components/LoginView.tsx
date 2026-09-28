import React, { useState } from 'react';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import { CrewmateLogo, CrewmateMark } from './CrewmateLogo';
import { signInWithGoogle, signInWithEmail, signUpWithEmail } from '../firebase';
import { useAuth } from '../context/AuthContext';

interface LoginViewProps {
  onLoginSuccess: () => void;
  onBackToLanding: () => void;
}

const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5 shrink-0" fill="none">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

export const LoginView: React.FC<LoginViewProps> = ({ onLoginSuccess, onBackToLanding }) => {
  const { syncWithBackend } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleGoogleSignIn = async () => {
    setError('');
    setIsLoading(true);
    setStep('Signing in with Google...');
    try {
      const user = await signInWithGoogle();
      setStep('Setting up your account...');
      const displayName = user.displayName || user.email?.split('@')[0] || 'Founder';
      await syncWithBackend(displayName);
      onLoginSuccess();
    } catch (err: unknown) {
      setIsLoading(false);
      setStep('');
      const msg = err instanceof Error ? err.message : 'Sign-in failed. Please try again.';
      if (!msg.includes('popup-closed')) setError(msg);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Email and password are required.');
      return;
    }
    if (isSignUp && !name.trim()) {
      setError('Please enter your name.');
      return;
    }
    setError('');
    setIsLoading(true);
    setStep(isSignUp ? 'Creating account...' : 'Signing in...');
    try {
      let user;
      if (isSignUp) {
        user = await signUpWithEmail(email, password);
      } else {
        user = await signInWithEmail(email, password);
      }
      setStep('Setting up your account...');
      const displayName = isSignUp ? name.trim() : (user.displayName || user.email?.split('@')[0] || 'Founder');
      await syncWithBackend(displayName);
      onLoginSuccess();
    } catch (err: unknown) {
      setIsLoading(false);
      setStep('');
      setError(err instanceof Error ? err.message : 'Authentication failed.');
    }
  };

  return (
    <div className="min-h-screen bg-[#080A0F] text-white flex flex-col">

      {/* Header */}
      <header className="border-b border-white/8 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <button
            onClick={onBackToLanding}
            className="flex items-center gap-2 text-neutral-400 hover:text-white transition-colors text-sm cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <div className="flex items-center gap-2">
            <CrewmateMark size={22} variant="color" />
            <span className="font-semibold text-sm text-white">Crewmate</span>
          </div>
          <div className="w-16" />
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">

          {/* Card */}
          <div className="bg-[#0D111C] border border-white/8 rounded-2xl p-8 shadow-2xl">
            <div className="mb-8 text-center">
              <CrewmateLogo size="lg" variant="white" withTagline={false} />
              <h1 className="mt-6 text-2xl font-bold text-white">
                {isSignUp ? 'Create an account' : 'Welcome back'}
              </h1>
              <p className="mt-2 text-neutral-400 text-sm leading-relaxed">
                {isSignUp 
                  ? 'Sign up to create your AI co-founder.' 
                  : 'Sign in to access your AI co-founder console.'}
              </p>
            </div>

            {/* Error */}
            {error && (
              <div className="mb-4 flex items-start gap-2.5 p-3.5 bg-red-950/40 border border-red-800/40 rounded-xl text-sm text-red-300">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-400" />
                <span>{error}</span>
              </div>
            )}

            {/* Loading state */}
            {isLoading && (
              <div className="mb-4 flex items-center gap-3 p-3.5 bg-[#141B2D] border border-[#1842FF]/30 rounded-xl text-sm text-neutral-300">
                <div className="w-4 h-4 rounded-full border-2 border-[#1842FF] border-t-transparent animate-spin shrink-0" />
                <span>{step}</span>
              </div>
            )}

            <form onSubmit={handleEmailAuth} className="space-y-4 mb-6">
              {isSignUp && (
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-1.5">Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Jane Doe"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:border-[#1842FF] transition-colors"
                    required={isSignUp}
                  />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-1.5">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:border-[#1842FF] transition-colors"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-1.5">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:border-[#1842FF] transition-colors"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 py-3.5 bg-[#1842FF] hover:bg-[#2855FF] disabled:opacity-60 text-white font-semibold text-sm rounded-xl transition-all shadow-sm active:scale-[0.98] cursor-pointer"
              >
                {isSignUp ? 'Sign Up' : 'Sign In'}
              </button>
            </form>

            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-[#0D111C] px-2 text-neutral-500">Or continue with</span>
              </div>
            </div>

            {/* Google Button */}
            <button
              type="button"
              id="google-signin-btn"
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-3 py-3.5 px-4 bg-white hover:bg-gray-50 disabled:opacity-60 text-gray-800 font-semibold text-sm rounded-xl transition-all shadow-sm active:scale-[0.98] cursor-pointer mb-6"
            >
              <GoogleIcon />
              <span>Google</span>
            </button>

            <div className="text-center text-sm">
              <span className="text-neutral-400">
                {isSignUp ? 'Already have an account?' : "Don't have an account?"}
              </span>
              {' '}
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setError('');
                }}
                className="text-[#1842FF] hover:text-[#2855FF] font-medium transition-colors cursor-pointer"
              >
                {isSignUp ? 'Sign in' : 'Sign up'}
              </button>
            </div>

            <p className="mt-8 text-center text-xs text-neutral-500 leading-relaxed">
              By signing in, you agree to let your AI teammate handle operations
              within the trust boundaries you configure.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

