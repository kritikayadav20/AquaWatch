'use client'

import Link from "next/link";
import { Camera, ScanEye, Trophy, ArrowRight, ShieldCheck, Users, Globe, X, LogIn } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useState, useEffect } from "react";
import SubmissionsMap from "@/components/SubmissionsMap";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function Home() {
  const [showLogin, setShowLogin] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  // Map Data State
  const [mapSubmissions, setMapSubmissions] = useState([])

  useEffect(() => {
    // Fetch public submissions for the map
    const fetchPublicData = async () => {
      const { data } = await supabase
        .from('submissions')
        .select('*')
        .neq('status', 'rejected') // Don't show rejected
        .limit(100)

      if (data) setMapSubmissions(data as any)
    }
    fetchPublicData()
  }, [])


  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) throw error
      router.push('/dashboard')
    } catch (error: any) {
      alert(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col w-full overflow-hidden relative">

      {/* Login Modal Overlay */}
      {showLogin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-700">
            <div className="flex justify-between items-center p-6 border-b border-slate-700">
              <h3 className="text-xl font-bold text-slate-50 font-display">Welcome Back</h3>
              <button onClick={() => setShowLogin(false)} className="text-slate-400 hover:text-slate-200">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-8">
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    className="w-full px-4 py-3 rounded-xl border border-slate-600 bg-slate-900 text-slate-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none"
                    placeholder="you@example.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Password</label>
                  <input
                    type="password"
                    required
                    className="w-full px-4 py-3 rounded-xl border border-slate-600 bg-slate-900 text-slate-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none"
                    placeholder="••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                  />
                </div>
                <Button
                  type="submit"
                  size="lg"
                  className="w-full text-lg mt-2"
                  isLoading={loading}
                  disabled={loading}
                >
                  Sign In
                </Button>
              </form>
              <div className="mt-6 text-center text-sm text-slate-400">
                Don't have an account? <Link href="/register" className="text-primary-400 font-bold hover:underline">Register now</Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="relative w-full overflow-hidden pt-20 pb-16 lg:pt-32 lg:pb-24">

        {/* Absolute Login Button for Landing Page Modal */}
        <div className="absolute top-6 right-6 z-20 md:hidden">
          {/* Mobile: relying on Global Nav */}
        </div>
        <div className="absolute top-6 right-6 z-20 hidden md:block">
          <Button onClick={() => setShowLogin(true)} variant="ghost" className="text-slate-200 hover:text-primary-300 hover:bg-slate-800/50 backdrop-blur-sm">
            <LogIn className="w-4 h-4 mr-2" /> Member Login
          </Button>
        </div>

        {/* Animated Background Blobs */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-[10%] left-1/4 w-[600px] h-[600px] bg-primary-200/40 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob"></div>
          <div className="absolute top-[20%] right-1/4 w-[500px] h-[500px] bg-secondary-200/40 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob delay-2000"></div>
          <div className="absolute -bottom-[10%] left-1/2 w-[600px] h-[600px] bg-primary-100/40 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob delay-4000"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10 flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-800/60 border border-slate-700/50 shadow-sm mb-8 backdrop-blur-md animate-fade-in">
            <span className="flex h-2 w-2 rounded-full bg-primary-400 animate-pulse"></span>
            <span className="text-sm font-bold text-slate-300 tracking-wide uppercase text-[11px]">Verified Community Data</span>
          </div>

          <h1 className="text-6xl md:text-8xl font-black text-slate-50 mb-8 tracking-tight font-display text-balance animate-enter">
            Welcome to <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary-400 to-primary-600">AquaWatch</span>
          </h1>

          <div className="max-w-3xl mx-auto mb-10 animate-enter delay-200">
            <p className="text-xl md:text-2xl text-slate-200 font-medium mb-4 leading-relaxed">
              "Preserving our waters, one report at a time."
            </p>
            <p className="text-lg text-slate-400 leading-relaxed">
              Join our community effort to monitor and control invasive Water Hyacinth. Your contributions directly help local authorities restore the ecological balance of our lakes and rivers.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-scale-in delay-300 w-full sm:w-auto mb-16">
            <Link href="/register" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto rounded-full font-bold text-lg h-14 px-10 shadow-xl shadow-primary-500/20 group hover:shadow-primary-500/40 transition-all duration-300">
                Start Monitoring
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link href="#impact-map" className="w-full sm:w-auto">
              <Button variant="secondary" size="lg" className="w-full sm:w-auto rounded-full font-bold text-lg h-14 px-10 bg-slate-800/60 backdrop-blur-md border-slate-700 hover:bg-slate-700/80 transition-all duration-300">
                View Live Map
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Global Impact Map Section */}
      <section id="impact-map" className="py-12 px-4 relative z-10 -mt-10">
        <div className="max-w-7xl mx-auto mb-10 text-center animate-fade-in delay-500">
          <h2 className="text-4xl font-bold text-slate-50 mb-4 font-display">Live Impact Tracker</h2>
          <p className="text-lg text-slate-300 max-w-3xl mx-auto">
            See real-time reports from our community. <span className="text-red-400 font-bold">Red</span> markers indicate high infestation levels requiring immediate attention.
          </p>
        </div>

        <div className="max-w-7xl mx-auto h-[600px] rounded-[2.5rem] overflow-hidden shadow-2xl shadow-primary-900/10 border-4 border-white ring-1 ring-slate-100 relative animate-scale-in delay-700">
          <SubmissionsMap submissions={mapSubmissions} zoom={12} />

          {/* Map Filters Overlay */}
          <div className="absolute top-6 left-6 bg-slate-800/90 backdrop-blur-xl p-4 rounded-2xl border border-slate-700/50 shadow-lg flex flex-col gap-3">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">Legend</div>
            <div className="flex items-center gap-2.5 px-1">
              <span className="w-3 h-3 rounded-full bg-red-500 shadow-sm shadow-red-500/50"></span>
              <span className="text-sm font-bold text-slate-200">Critical ({'>'}50%)</span>
            </div>
            <div className="flex items-center gap-2.5 px-1">
              <span className="w-3 h-3 rounded-full bg-amber-500 shadow-sm shadow-amber-500/50"></span>
              <span className="text-sm font-bold text-slate-200">Moderate</span>
            </div>
            <div className="flex items-center gap-2.5 px-1">
              <span className="w-3 h-3 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50"></span>
              <span className="text-sm font-bold text-slate-200">Cleaned</span>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto mt-20 text-center space-y-8">
          <h3 className="text-3xl font-bold text-slate-50 font-display">About The Project</h3>
          <p className="text-slate-300 leading-relaxed text-xl font-medium text-balance">
            AquaWatch is an initiative designed to combat the rapid spread of invasive aquatic plants like Water Hyacinth using <span className="text-primary-400">AI & Community Power</span>.
          </p>
          <div className="grid md:grid-cols-3 gap-6 pt-4 text-left">
            <div className="glass-card p-8 rounded-3xl">
              <div className="font-bold text-slate-50 text-lg mb-2">Decentralized Data</div>
              <p className="text-sm text-slate-400 leading-relaxed">Anyone with a smartphone can contribute to the preservation of their local water bodies.</p>
            </div>
            <div className="glass-card p-8 rounded-3xl">
              <div className="font-bold text-slate-50 text-lg mb-2">Computer Vision</div>
              <p className="text-sm text-slate-400 leading-relaxed">Our backend automatically calculates infestation density to prioritize high-risk zones.</p>
            </div>
            <div className="glass-card p-8 rounded-3xl">
              <div className="font-bold text-slate-50 text-lg mb-2">Verified Impact</div>
              <p className="text-sm text-slate-400 leading-relaxed">Admin verification ensures data integrity and proper rewarding of citizen scientists.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-4 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 max-w-3xl mx-auto">
            <h2 className="text-4xl font-bold text-slate-50 mb-6 font-display">Advanced Tech. Simple Action.</h2>
            <p className="text-lg text-slate-300">We combine satellite data and on-ground reporting to create the most accurate real-time map of invasive water species.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card variant="glass" className="p-8 h-full hover:-translate-y-2 transition-transform duration-500">
              <div className="w-16 h-16 bg-primary-900/50 rounded-2xl flex items-center justify-center mb-6 text-primary-400 shadow-sm">
                <Camera className="w-8 h-8" strokeWidth={1.5} />
              </div>
              <h3 className="text-2xl font-bold mb-3 text-slate-50 font-display">Snap & Report</h3>
              <p className="text-slate-400 leading-relaxed">
                Capture photos of water bodies in your area. Our geo-tagging system maps the infestation instantly to our central database.
              </p>
            </Card>

            <Card variant="glass" className="p-8 h-full border-primary-500/50 shadow-lg shadow-primary-500/20 hover:-translate-y-2 transition-transform duration-500">
              <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-700 text-white rounded-2xl flex items-center justify-center mb-6 shadow-xl shadow-primary-500/30">
                <ScanEye className="w-8 h-8" strokeWidth={1.5} />
              </div>
              <h3 className="text-2xl font-bold mb-3 text-slate-50 font-display">Smart Analysis</h3>
              <p className="text-slate-400 leading-relaxed">
                Our AI algorithms analyze coverage density from photos to prioritize clean-up efforts where they matter most.
              </p>
            </Card>

            <Card variant="glass" className="p-8 h-full hover:-translate-y-2 transition-transform duration-500">
              <div className="w-16 h-16 bg-primary-900/50 rounded-2xl flex items-center justify-center mb-6 text-primary-400 shadow-sm">
                <Trophy className="w-8 h-8" strokeWidth={1.5} />
              </div>
              <h3 className="text-2xl font-bold mb-3 text-slate-50 font-display">Community Rewards</h3>
              <p className="text-slate-400 leading-relaxed">
                Earn badges and recognition for your contributions. Compete on the leaderboard while protecting our waters.
              </p>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}

