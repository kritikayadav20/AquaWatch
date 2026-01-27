import Link from "next/link";
import { Camera, ScanEye, Trophy, ArrowRight, ShieldCheck, Users, Globe } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

export default function Home() {
  return (
    <div className="flex flex-col w-full overflow-hidden">
      {/* Hero Section */}
      <section className="relative w-full overflow-hidden bg-slate-50 pt-32 pb-40">
        {/* Animated Background Blobs */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-[10%] left-1/4 w-[600px] h-[600px] bg-primary-200/40 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob"></div>
          <div className="absolute top-[20%] right-1/4 w-[500px] h-[500px] bg-secondary-200/40 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-[10%] left-1/2 w-[600px] h-[600px] bg-primary-100/40 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-4000"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10 flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/80 border border-slate-200 shadow-sm mb-8 backdrop-blur-sm animate-in fade-in slide-in-from-bottom-5 duration-700">
            <span className="flex h-2 w-2 rounded-full bg-secondary-500 animate-pulse"></span>
            <span className="text-sm font-semibold text-slate-700 tracking-wide uppercase text-[11px]">Next-Gen Environment Monitoring</span>
          </div>

          <h1 className="text-6xl md:text-8xl font-black text-slate-900 mb-8 tracking-tight font-display text-balance animate-in fade-in slide-in-from-bottom-8 duration-1000 fill-mode-forwards opacity-0">
            Monitor. Report. <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-secondary-500">Restore.</span>
          </h1>

          <p className="text-xl md:text-2xl text-slate-600 mb-12 max-w-2xl mx-auto leading-relaxed text-balance animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-200 fill-mode-forwards opacity-0">
            Join thousands of citizen scientists using AquaWatch to track invasive Water Hyacinth and protect our fragile ecosystems.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-300 fill-mode-forwards opacity-0 w-full sm:w-auto">
            <Link href="/register" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto rounded-full font-bold text-lg h-14 px-10 shadow-xl shadow-primary-500/20 group">
                Start Monitoring
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link href="#features" className="w-full sm:w-auto">
              <Button variant="secondary" size="lg" className="w-full sm:w-auto rounded-full font-bold text-lg h-14 px-10 bg-white/50 backdrop-blur-sm border-slate-200 hover:bg-white/80">
                Learn More
              </Button>
            </Link>
          </div>

          {/* Stats Bar */}
          <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-16 border-t border-slate-200/60 pt-10 animate-in fade-in duration-1000 delay-500 opacity-0">
            <div className="text-center">
              <p className="text-4xl font-black text-slate-900 mb-1 font-display">2.5k+</p>
              <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Reports Filed</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-black text-slate-900 mb-1 font-display">150+</p>
              <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Lakes Monitored</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-black text-slate-900 mb-1 font-display">12k</p>
              <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Acres Cleared</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-black text-slate-900 mb-1 font-display">98%</p>
              <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Accuracy</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-4 bg-white relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 max-w-3xl mx-auto">
            <h2 className="text-4xl font-bold text-slate-900 mb-6 font-display">Advanced Tech. Simple Action.</h2>
            <p className="text-lg text-slate-600">We combine satellite data and on-ground reporting to create the most accurate real-time map of invasive water species.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card variant="interactive" className="p-8 h-full">
              <div className="w-16 h-16 bg-primary-50 rounded-2xl flex items-center justify-center mb-6 text-primary-600">
                <Camera className="w-8 h-8" strokeWidth={1.5} />
              </div>
              <h3 className="text-2xl font-bold mb-3 text-slate-900 font-display">Snap & Report</h3>
              <p className="text-slate-500 leading-relaxed">
                Capture photos of water bodies in your area. Our geo-tagging system maps the infestation instantly to our central database.
              </p>
            </Card>

            <Card variant="interactive" className="p-8 h-full border-primary-100 shadow-md">
              <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-secondary-500 text-white rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-primary-500/20">
                <ScanEye className="w-8 h-8" strokeWidth={1.5} />
              </div>
              <h3 className="text-2xl font-bold mb-3 text-slate-900 font-display">Smart Analysis</h3>
              <p className="text-slate-500 leading-relaxed">
                Our AI algorithms analyze coverage density from photos to prioritize clean-up efforts where they matter most.
              </p>
            </Card>

            <Card variant="interactive" className="p-8 h-full">
              <div className="w-16 h-16 bg-secondary-50 rounded-2xl flex items-center justify-center mb-6 text-secondary-600">
                <Trophy className="w-8 h-8" strokeWidth={1.5} />
              </div>
              <h3 className="text-2xl font-bold mb-3 text-slate-900 font-display">Community Rewards</h3>
              <p className="text-slate-500 leading-relaxed">
                Earn badges and recognition for your contributions. Compete on the leaderboard while protecting our waters.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Community Section */}
      <section className="py-24 bg-slate-50 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary-100 text-secondary-700 text-xs font-bold mb-6 uppercase tracking-wider">
                <Users className="w-4 h-4" /> Global Impact
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6 font-display leading-tight">
                Empowering communities to take action.
              </h2>
              <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                Water Hyacinth doubles its biomass every 2 weeks. It chokes lakes, kills fish, and breeds disease. Your reports help local authorities target removal efforts effectively.
              </p>

              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-sm text-primary-600">
                    <Globe className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">Real-time Mapping</h4>
                    <p className="text-sm text-slate-500">Live updates from users across the region.</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-sm text-secondary-600">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">Verified Data</h4>
                    <p className="text-sm text-slate-500">All submissions are reviewed by experts.</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-square rounded-3xl overflow-hidden shadow-2xl skew-y-3 transform hover:skew-y-0 transition-transform duration-700">
                {/* Placeholder for a map or app screenshot */}
                <div className="w-full h-full bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center relative group">
                  <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?q=80&w=2674&auto=format&fit=crop')] bg-cover bg-center group-hover:scale-110 transition-transform duration-700"></div>
                  <div className="absolute inset-0 bg-primary-900/10 group-hover:bg-primary-900/0 transition-colors"></div>
                </div>
              </div>
              <div className="absolute -bottom-10 -left-10 w-48 p-4 bg-white rounded-2xl shadow-xl flex items-center gap-3 animate-bounce duration-[3000ms]">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600 font-bold">✓</div>
                <div>
                  <p className="text-xs text-slate-500 font-semibold uppercase">Status</p>
                  <p className="font-bold text-slate-900">Lake Cleaned!</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

