import React, { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext';
import { LandingPage } from './components/LandingPage';
import { LoginView } from './components/LoginView';
import { Console } from './components/Console';
import { OnboardingModal } from './components/OnboardingModal';
import { GoogleConnectView } from './components/GoogleConnectView';
import { INITIAL_TEAMMATE, AUTONOMY_LEVELS, INITIAL_MISSIONS } from './data/initialData';

type ViewMode = 'landing' | 'login' | 'onboarding' | 'console' | 'google_connect';

export default function App() {
  const { firebaseUser, backendUser, teammate, isLoading } = useAuth();
  const [viewMode, setViewMode] = useState<ViewMode>('landing');

  // Derive view from auth state
  useEffect(() => {
    if (isLoading) return;

    if (!firebaseUser) {
      if (viewMode === 'console' || viewMode === 'onboarding') {
        setViewMode('landing');
      }
      return;
    }

    // Signed in with Firebase but no backend record or no workspace yet → onboarding
    if (!backendUser || backendUser.workspaces.length === 0) {
      setViewMode('onboarding');
      return;
    }

    // Has workspace but Google not connected yet → connect screen
    if (!backendUser.user.google_connected) {
      setViewMode('google_connect');
      return;
    }

    // Has workspace + Google connected: go straight to console.
    // teammate is restored async by AuthContext — Console handles the null case gracefully.
    setViewMode('console');
  }, [firebaseUser, backendUser, isLoading]);


  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#080A0F] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 rounded-full border-2 border-[#1842FF] border-t-transparent animate-spin" />
          <span className="text-neutral-400 text-sm">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <>
      {viewMode === 'landing' && (
        <LandingPage
          teammate={INITIAL_TEAMMATE}
          currentLevelData={AUTONOMY_LEVELS[0]}
          latestMission={INITIAL_MISSIONS[0]}
          onGoToLogin={() => setViewMode('login')}
          onEnterConsole={() => {
            if (firebaseUser && teammate) setViewMode('console');
            else setViewMode('login');
          }}
          onOpenHireModal={() => setViewMode('login')}
        />
      )}

      {viewMode === 'login' && (
        <LoginView
          onLoginSuccess={() => {/* auth state change drives viewMode */}}
          onBackToLanding={() => setViewMode('landing')}
        />
      )}

      {viewMode === 'onboarding' && (
        <OnboardingModal
          isOpen={true}
          onClose={() => setViewMode('landing')}
          onComplete={() => setViewMode('console')}
        />
      )}

      {viewMode === 'console' && (
        <Console onSignOut={() => setViewMode('landing')} />
      )}

      {viewMode === 'google_connect' && (
        <GoogleConnectView />
      )}
    </>
  );
}
