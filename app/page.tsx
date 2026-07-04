"use client";

import { useState } from "react";

export default function Home() {
  const [pressPhoto, setPressPhoto] = useState<File | null>(null);
  const [audioSnippet, setAudioSnippet] = useState<File | null>(null);
  const [culturalRoots, setCulturalRoots] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isAfterView, setIsAfterView] = useState(false);

  const handleCheckout = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/checkout', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json', // Crucial for Next.js to know it's JSON
  },
  body: JSON.stringify({ quantity: 1 }), // Send a valid JSON string
});
      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error("Checkout error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDrop = (
    e: React.DragEvent<HTMLDivElement>,
    type: "photo" | "audio"
  ) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      if (type === "photo") {
        setPressPhoto(files[0]);
      } else {
        setAudioSnippet(files[0]);
      }
    }
  };

  // Simulated brand names for display
  const simulatedNames = [
    { name: "Crescendo Echo", origin: "Latin-Italian Fusion", match: "98%" },
    { name: "Melodia Nexus", origin: "Spanish-Greek Blend", match: "96%" },
    { name: "Harmonia Divine", origin: "French-Celtic Heritage", match: "94%" },
    { name: "Sonic Epoch", origin: "Germanic-Nordic Mix", match: "92%" },
  ];

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      {/* Social Proof Banner */}
      <div className="border-b border-purple-500/30 bg-gradient-to-r from-purple-900/20 to-emerald-900/20 py-3 px-4 text-center sticky top-0 z-10">
        <p className="text-sm font-medium text-purple-300">
          ✨ 14,204+ Artists Rebranded | ⭐ 5-star rating
        </p>
      </div>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
        {/* Header Section */}
        <div className="text-center mb-12 sm:mb-16">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4 bg-gradient-to-r from-purple-400 via-purple-300 to-emerald-400 bg-clip-text text-transparent">
            Your Brand. Reborn.
          </h1>
          <p className="text-lg sm:text-xl text-gray-300 max-w-2xl mx-auto">
            AI-powered brand naming that captures your cultural essence and sonic identity
          </p>
        </div>

        {/* Placeholder Visual Section */}
        <div className="grid grid-cols-1 xl:grid-cols-[1.1fr_0.9fr] gap-6 mb-12">
          <div className="relative rounded-3xl overflow-hidden border border-purple-500/20 bg-slate-950/80 p-6 shadow-2xl shadow-purple-900/20">
            <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-purple-600/40 to-transparent" />
            <div className="relative flex flex-col gap-5">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm uppercase tracking-[0.3em] text-emerald-300">Artist Preview</p>
                  <h2 className="text-2xl font-bold text-white">Casual Creator</h2>
                  <p className="text-sm text-cyan-300 mt-1">
                    {isAfterView ? 'After: polished identity emerging from the creative spark' : 'Before: raw creative energy with many naming paths in motion'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAfterView((prev) => !prev)}
                  className="relative inline-flex items-center rounded-full bg-slate-900/90 border border-white/10 px-1.5 py-1 shadow-lg shadow-black/20 transition-transform duration-300 hover:scale-105"
                >
                  <span
                    className={`absolute left-1 h-8 w-20 rounded-full bg-gradient-to-r from-purple-500 to-emerald-400 transition-all duration-300 ease-out ${
                      isAfterView ? 'translate-x-12' : 'translate-x-0'
                    }`}
                  />
                  <span className="relative z-10 flex items-center gap-4 text-xs uppercase tracking-[0.3em] text-white/90 font-semibold px-3">
                    <span className={isAfterView ? 'text-white/70' : 'text-white'}>Before</span>
                    <span className="text-white/40">•</span>
                    <span className={isAfterView ? 'text-white' : 'text-white/70'}>After</span>
                  </span>
                </button>
              </div>

              <div className="relative rounded-[2rem] bg-slate-900/95 border border-white/10 p-6 overflow-hidden">
                <div className="absolute -left-6 top-6 h-28 w-28 rounded-full bg-purple-500/20 blur-2xl" />
                <div className="absolute right-4 top-8 h-20 w-20 rounded-full bg-emerald-400/15 blur-2xl" />
                <div className="relative flex items-end justify-center">
                  <div className="h-40 w-40 rounded-full bg-gradient-to-br from-slate-800 to-slate-700 border border-white/10 shadow-[0_20px_80px_rgba(15,23,42,0.6)]" />
                </div>
                <div className="relative mt-6 grid grid-cols-2 gap-4">
                  {['Echo', 'Nova', 'Muse', 'Riff'].map((bubble, index) => (
                    <span
                      key={bubble}
                      className={`relative py-2 px-4 rounded-full text-xs font-semibold text-white ${
                        index % 2 === 0 ? 'bg-purple-500/90' : 'bg-emerald-500/90'
                      } shadow-lg shadow-black/20`}>
                      {bubble}
                    </span>
                  ))}
                </div>
              </div>

              <p className="text-sm text-gray-400 leading-6">
                Casual, confident, and ready to step on stage — this artist portrait captures a relaxed musician with playful name bubbles floating above, signaling the creative identity transformation.
              </p>
            </div>
          </div>

          <div className="rounded-3xl border border-emerald-500/20 bg-slate-950/90 p-6 shadow-2xl shadow-emerald-900/20">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-purple-300">Brand Identified</p>
                <h2 className="text-2xl font-bold text-white">Stage Signature</h2>
                <p className="text-sm text-gray-400 mt-1">
                  {isAfterView ? 'After view: identity polished for launch' : 'Before view: creative direction still unfolding'}
                </p>
              </div>
              <span className="text-2xl">✨</span>
            </div>

            <div className="rounded-[2rem] bg-gradient-to-br from-slate-900/95 via-slate-800 to-slate-950 border border-white/10 p-6">
              <div className="h-52 rounded-3xl bg-[radial-gradient(circle_at_20%_20%,rgba(79,70,229,0.25),transparent_35%),radial-gradient(circle_at_80%_20%,rgba(16,185,129,0.22),transparent_35%),linear-gradient(to_bottom,#0f172a,#020617)] shadow-inner shadow-black/30 flex items-center justify-center">
                <div className="text-center">
                  <div className="mb-3 text-4xl">🎙️</div>
                  <p className="text-white text-lg font-semibold">Your curated Spotify cover art</p>
                  <p className="mt-2 text-sm text-gray-400">Bold, melodic, and unmistakably you.</p>
                </div>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              <div className="rounded-2xl bg-slate-900/90 border border-white/10 p-5">
                <p className="text-xs text-gray-400 uppercase tracking-[0.25em] mb-2">Identified Brand</p>
                <h3 className="text-xl font-semibold text-white">Aurora Pulse</h3>
                <p className="text-sm text-gray-400 mt-1">A modern music persona built for streaming, playability, and cultural resonance.</p>
              </div>
              <div className="rounded-2xl bg-slate-900/90 border border-white/10 p-5">
                <p className="text-xs text-gray-400 uppercase tracking-[0.25em] mb-2">Genre Focus</p>
                <p className="text-sm text-gray-300">Neo-soul, alternative pop, cinematic soundscapes</p>
              </div>
            </div>
          </div>
        </div>

        {/* Upload Form Section */}
        <div className="bg-gradient-to-b from-purple-900/10 to-emerald-900/10 border border-purple-500/20 rounded-xl p-8 sm:p-10 mb-12">
          <h2 className="text-2xl font-bold mb-8 text-center">Tell Us Your Story</h2>

          {/* Drag and Drop Areas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
            {/* Press Photo Upload */}
            <div
              onDrop={(e) => handleDrop(e, "photo")}
              onDragOver={(e) => e.preventDefault()}
              className="border-2 border-dashed border-purple-400/50 hover:border-purple-300 rounded-lg p-6 text-center cursor-pointer transition-all duration-300 hover:bg-purple-900/10"
            >
              <div className="flex flex-col items-center gap-2">
                <div className="text-3xl">📸</div>
                <h3 className="font-semibold text-purple-300">Press Photo</h3>
                <p className="text-sm text-gray-400">JPEG or PNG</p>
                {pressPhoto && (
                  <p className="text-sm text-emerald-400 mt-2">✓ {pressPhoto.name}</p>
                )}
              </div>
            </div>

            {/* Audio Snippet Upload */}
            <div
              onDrop={(e) => handleDrop(e, "audio")}
              onDragOver={(e) => e.preventDefault()}
              className="border-2 border-dashed border-emerald-400/50 hover:border-emerald-300 rounded-lg p-6 text-center cursor-pointer transition-all duration-300 hover:bg-emerald-900/10"
            >
              <div className="flex flex-col items-center gap-2">
                <div className="text-3xl">🎵</div>
                <h3 className="font-semibold text-emerald-300">Audio Snippet</h3>
                <p className="text-sm text-gray-400">MP3 or WAV</p>
                {audioSnippet && (
                  <p className="text-sm text-emerald-400 mt-2">✓ {audioSnippet.name}</p>
                )}
              </div>
            </div>
          </div>

          {/* Cultural Roots Text Field */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-purple-300 mb-2">
              Your Cultural Roots & Inspiration
            </label>
            <textarea
              value={culturalRoots}
              onChange={(e) => setCulturalRoots(e.target.value)}
              placeholder="Share your cultural background, influences, and artistic vision..."
              className="w-full bg-black/50 border border-purple-400/30 rounded-lg p-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-400 resize-none"
              rows={4}
            />
          </div>

          {/* Submit Button */}
          <button className="w-full bg-gradient-to-r from-purple-500 to-emerald-500 hover:from-purple-600 hover:to-emerald-600 text-white font-bold py-3 rounded-lg transition-all duration-300 transform hover:scale-105">
            Generate Your Brand Names
          </button>
        </div>

        {/* Results Section - Blurred */}
        <div className="relative mb-12">
          {/* Blurred Results Grid */}
          <div className="blur-md pointer-events-none">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {simulatedNames.map((item, index) => (
                <div
                  key={index}
                  className="bg-gradient-to-br from-purple-600 to-emerald-600 rounded-lg p-6"
                >
                  <h3 className="text-xl font-bold text-white mb-2">{item.name}</h3>
                  <p className="text-sm text-purple-100 mb-3">{item.origin}</p>
                  <div className="flex items-center gap-2">
                    <div className="w-full bg-purple-800 rounded-full h-2">
                      <div
                        className="bg-emerald-400 h-2 rounded-full"
                        style={{
                          width: item.match,
                        }}
                      />
                    </div>
                    <span className="text-sm font-bold text-emerald-300">
                      {item.match}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Payment CTA Overlay */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-gradient-to-br from-purple-900/95 to-black/95 border border-purple-500/50 backdrop-blur-md rounded-2xl p-8 max-w-sm mx-auto w-full shadow-2xl transform transition-all duration-300 hover:scale-105">
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-white mb-2">
                  Unlock Your Complete Brand Dossier
                </h3>
                <p className="text-gray-300 text-sm">
                  Get 50+ personalized brand names, cultural analysis, and sonic branding guidelines
                </p>
              </div>

              <div className="mb-6">
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold text-emerald-400">$14.99</span>
                  <span className="text-gray-400">one-time</span>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-purple-500 to-emerald-500 hover:from-purple-600 hover:to-emerald-600 disabled:from-gray-600 disabled:to-gray-700 text-white font-bold py-3 rounded-lg transition-all duration-300 transform hover:scale-105 disabled:cursor-not-allowed disabled:scale-100"
              >
                {isLoading ? "Processing..." : "Proceed to Checkout"}
              </button>

              <p className="text-xs text-gray-500 text-center mt-4">
                Secure payment via Stripe. No hidden fees.
              </p>
            </div>
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-16 pt-8 border-t border-purple-500/20 text-center">
          <div>
            <div className="text-2xl font-bold text-emerald-400">14,204+</div>
            <div className="text-sm text-gray-400">Artists Rebranded</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-purple-400">98%</div>
            <div className="text-sm text-gray-400">Match Rate</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-emerald-400">⭐⭐⭐⭐⭐</div>
            <div className="text-sm text-gray-400">5-Star Rating</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-purple-400">2M+</div>
            <div className="text-sm text-gray-400">Names Generated</div>
          </div>
        </div>
      </main>
    </div>
  );
}
