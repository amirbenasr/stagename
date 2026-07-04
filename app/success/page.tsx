'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';

interface StageName {
  name: string;
  culturalOrigin: string;
  midjourneyPrompt: string;
}

interface SessionData {
  stageNames: StageName[];
  sessionId: string;
  customerEmail?: string;
}

export default function SuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">Loading...</div>}>
      <SuccessPageContent />
    </Suspense>
  );
}

function SuccessPageContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');

  const [sessionData, setSessionData] = useState<SessionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [animationPhase, setAnimationPhase] = useState(0);

  useEffect(() => {
    if (!sessionId) {
      setError('Invalid session. Please complete checkout.');
      setLoading(false);
      return;
    }

    // Simulate fetching session data
    // In production, you'd call an API endpoint to fetch stage names and session details
    const fetchSessionData = async () => {
      try {
        // For demo purposes, we'll create mock data
        // In production, replace with: await fetch(`/api/session/${sessionId}`)
        const mockData: SessionData = {
          sessionId,
          customerEmail: 'artist@example.com',
          stageNames: [
            {
              name: 'Lunar Echo',
              culturalOrigin: 'English-Japanese fusion',
              midjourneyPrompt:
                'ethereal Japanese-inspired artist portrait, glowing neon aura, cyberpunk aesthetic, midnight blue and silver palette, floating particles, intricate details',
            },
            {
              name: 'Solstice Drift',
              culturalOrigin: 'Scandinavian-influenced',
              midjourneyPrompt:
                'minimalist Nordic artist, stark white and black tones, geometric patterns, aurora borealis background, professional headshot, mysterious lighting',
            },
            {
              name: 'Meridian',
              culturalOrigin: 'Latin-contemporary blend',
              midjourneyPrompt:
                'vibrant tropical-modern artist, warm golden hour lighting, Latin artistic elements, contemporary fashion, confident expression, artistic flourishes',
            },
            {
              name: 'Cipher',
              culturalOrigin: 'Multilingual modern',
              midjourneyPrompt:
                'futuristic artist portrait, holographic effects, digital art style, complex geometric background, cutting-edge aesthetic, tech-forward vibe',
            },
          ],
        };

        setSessionData(mockData);
        setLoading(false);

        // Trigger animation sequence
        setTimeout(() => setAnimationPhase(1), 100);
        setTimeout(() => setAnimationPhase(2), 600);
      } catch (err) {
        setError('Failed to load session data. Please try again.');
        setLoading(false);
      }
    };

    fetchSessionData();
  }, [sessionId]);

  const downloadBrandProfile = () => {
    // Create a sample brand profile PDF download
    const brandProfileContent = `
STAGENAME.CLUB - BRAND PROFILE
Generated: ${new Date().toLocaleDateString()}
Session ID: ${sessionId}

YOUR UNLOCKED STAGE NAMES:
${sessionData?.stageNames.map((name, idx) => `${idx + 1}. ${name.name} (${name.culturalOrigin})`).join('\n')}

Each stage name has been carefully curated with:
- Cultural authenticity and sensitivity
- Market appeal and discoverability
- Streaming platform optimization
- Unique artistic positioning

NEXT STEPS:
1. Select your preferred stage name
2. Complete your artist profile
3. Begin building your brand presence
4. Share with your team and audience

For more information, visit stagename.club
    `;

    const element = document.createElement('a');
    element.setAttribute(
      'href',
      'data:text/plain;charset=utf-8,' + encodeURIComponent(brandProfileContent)
    );
    element.setAttribute('download', `stagename-profile-${sessionId}.txt`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block">
            <div className="w-16 h-16 border-4 border-purple-500 border-t-pink-500 rounded-full animate-spin"></div>
          </div>
          <p className="mt-6 text-lg text-slate-300">Loading your unlocked identity...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <h1 className="text-3xl font-bold text-red-400 mb-4">Oops!</h1>
          <p className="text-slate-300 mb-6">{error}</p>
          <Link
            href="/"
            className="inline-block px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-colors"
          >
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  if (!sessionData) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white overflow-hidden">
      {/* Animated background gradient */}
      <div className="fixed inset-0 opacity-30">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
        <div className="absolute -bottom-8 right-1/4 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 right-1/3 w-96 h-96 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000"></div>
      </div>

      {/* Content */}
      <div className="relative z-10">
        {/* Header with congratulations */}
        <div className="min-h-[40vh] flex flex-col items-center justify-center px-4 py-12 md:py-20">
          {/* Celebration icon */}
          <div
            className={`mb-8 transform transition-all duration-1000 ${
              animationPhase >= 1
                ? 'scale-100 opacity-100'
                : 'scale-0 opacity-0'
            }`}
          >
            <div className="relative w-20 h-20 md:w-24 md:h-24">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full blur-lg opacity-75 animate-pulse"></div>
              <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-4xl md:text-5xl">
                ✨
              </div>
            </div>
          </div>

          {/* Main heading with animation */}
          <h1
            className={`text-4xl md:text-6xl font-black text-center mb-4 bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent leading-tight transition-all duration-1000 ${
              animationPhase >= 1
                ? 'opacity-100 translate-y-0'
                : 'opacity-0 translate-y-4'
            }`}
          >
            Your Identity is Unlocked!
          </h1>

          {/* Subheading */}
          <p className="text-lg md:text-xl text-slate-300 text-center max-w-2xl mt-6">
            Four exclusive stage names have been crafted for your unique artistic vision
          </p>
        </div>

        {/* Main content container */}
        <div className="max-w-7xl mx-auto px-4 py-12 md:py-16">
          {/* Two column layout for names and spotify cover */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
            {/* Stage Names Section */}
            <div className="lg:col-span-2">
              <h2 className="text-2xl md:text-3xl font-bold mb-8 text-transparent bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text">
                Your Stage Names
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {sessionData.stageNames.map((stageName, index) => (
                  <div
                    key={index}
                    className={`group relative bg-gradient-to-br from-slate-800 to-slate-900 border border-purple-500/30 hover:border-purple-500/60 rounded-2xl p-6 transition-all duration-500 hover:shadow-2xl hover:shadow-purple-500/20 ${
                      animationPhase >= 2
                        ? 'opacity-100 translate-y-0'
                        : 'opacity-0 translate-y-8'
                    }`}
                    style={{
                      transitionDelay: `${index * 150}ms`,
                    }}
                  >
                    {/* Glow effect on hover */}
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500/0 to-pink-500/0 group-hover:from-purple-500/10 group-hover:to-pink-500/10 rounded-2xl transition-all duration-500"></div>

                    {/* Content */}
                    <div className="relative">
                      {/* Number badge */}
                      <div className="inline-block mb-4 px-3 py-1 bg-purple-500/20 border border-purple-500/50 rounded-full text-xs font-semibold text-purple-300">
                        Option {index + 1}
                      </div>

                      {/* Stage name */}
                      <h3 className="text-2xl md:text-3xl font-black mb-3 text-white">
                        {stageName.name}
                      </h3>

                      {/* Cultural origin */}
                      <p className="text-sm text-slate-400 mb-4 pb-4 border-b border-slate-700/50">
                        <span className="text-slate-500">Origin: </span>
                        {stageName.culturalOrigin}
                      </p>

                      {/* Midjourney prompt */}
                      <div className="bg-slate-900/50 rounded-lg p-3 backdrop-blur-sm border border-slate-700/30">
                        <p className="text-xs text-slate-400 mb-2">Visual Direction</p>
                        <p className="text-sm text-slate-200 italic">
                          {stageName.midjourneyPrompt}
                        </p>
                      </div>

                      {/* Select button */}
                      <button className="w-full mt-4 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-semibold rounded-lg transition-all duration-300 transform hover:scale-105 active:scale-95">
                        Select This Name
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Spotify Cover Art Section */}
            <div className="lg:col-span-1">
              <h2 className="text-2xl md:text-3xl font-bold mb-8 text-transparent bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text">
                Spotify Cover Art
              </h2>

              <div
                className={`relative group ${
                  animationPhase >= 2
                    ? 'opacity-100 translate-x-0'
                    : 'opacity-0 translate-x-8'
                }`}
              >
                {/* Cover art placeholder */}
                <div className="relative bg-gradient-to-br from-purple-600 via-pink-600 to-cyan-600 rounded-2xl aspect-square shadow-2xl overflow-hidden border-2 border-slate-700/50 group-hover:border-purple-500/50 transition-colors duration-500">
                  {/* Decorative elements */}
                  <div className="absolute inset-0 opacity-20">
                    <div className="absolute top-0 right-0 w-40 h-40 bg-white rounded-full mix-blend-screen filter blur-3xl"></div>
                    <div className="absolute bottom-0 left-0 w-40 h-40 bg-cyan-300 rounded-full mix-blend-multiply filter blur-3xl"></div>
                  </div>

                  {/* Content overlay */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4 backdrop-blur-sm">
                    <div className="text-5xl md:text-6xl font-black text-white mb-4 drop-shadow-lg">
                      🎵
                    </div>
                    <p className="text-sm text-white/80 mb-2 font-semibold">
                      AI-Generated Spotify Cover
                    </p>
                    <p className="text-xs text-white/60">
                      Based on your selected stage name visual direction
                    </p>
                  </div>

                  {/* Hover effect */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center">
                    <span className="text-white text-sm font-semibold">Ready to Download</span>
                  </div>
                </div>

                {/* Download button */}
                <button
                  onClick={downloadBrandProfile}
                  className="w-full mt-6 px-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold rounded-lg transition-all duration-300 transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
                >
                  <span>📥</span>
                  Download Cover Art
                </button>

                {/* Additional info */}
                <div className="mt-4 p-4 bg-slate-900/50 rounded-lg border border-slate-700/30 backdrop-blur-sm">
                  <p className="text-xs text-slate-400 leading-relaxed">
                    <span className="text-slate-300 font-semibold">Session ID:</span>
                    <br />
                    <code className="text-green-400 text-xs">{sessionId}</code>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom action section */}
          <div className="mt-16 py-12 border-t border-slate-700/30">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              {/* Download profile */}
              <button
                onClick={downloadBrandProfile}
                className="group relative px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 active:scale-95 overflow-hidden"
              >
                <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <span className="relative flex items-center justify-center gap-2">
                  <span>📋</span>
                  Download Brand Profile
                </span>
              </button>

              {/* Share */}
              <button className="group relative px-8 py-4 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 active:scale-95 overflow-hidden">
                <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <span className="relative flex items-center justify-center gap-2">
                  <span>🔗</span>
                  Share with Team
                </span>
              </button>

              {/* Continue */}
              <Link
                href="/"
                className="group relative px-8 py-4 bg-slate-700 hover:bg-slate-600 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 active:scale-95 overflow-hidden"
              >
                <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <span className="relative flex items-center justify-center gap-2">
                  <span>🏠</span>
                  Back to Home
                </span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* CSS for animations */}
      <style jsx>{`
        @keyframes blob {
          0%,
          100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
        }

        .animate-blob {
          animation: blob 7s infinite;
        }

        .animation-delay-2000 {
          animation-delay: 2s;
        }

        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}
