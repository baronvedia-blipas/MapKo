"use client";

import { useRef } from "react";
import Link from "next/link";
import {
  MapPin,
  Search,
  Download,
  Globe,
  BarChart3,
  Map,
  FileSpreadsheet,
  Users,
  Radar,
  ArrowRight,
  Sparkles,
  Check,
} from "lucide-react";
import { motion, useInView } from "framer-motion";
import { Button } from "@/components/ui/button";

/* ------------------------------------------------------------------ */
/*  Animation helpers                                                  */
/* ------------------------------------------------------------------ */

function FadeInUp({ children, delay = 0, className = "" }: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 32 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Hero map visual                                                    */
/* ------------------------------------------------------------------ */

function HeroMapVisual() {
  const pins = [
    { top: "22%", left: "30%", color: "#ef4444", size: 12, score: 85, delay: 0.4 },
    { top: "38%", left: "55%", color: "#3b82f6", size: 14, score: 62, delay: 0.6 },
    { top: "55%", left: "40%", color: "#f59e0b", size: 12, score: 45, delay: 0.5 },
    { top: "30%", left: "70%", color: "#ef4444", size: 10, score: 78, delay: 0.7 },
    { top: "65%", left: "60%", color: "#22c55e", size: 12, score: 25, delay: 0.8 },
    { top: "45%", left: "25%", color: "#ef4444", size: 10, score: 92, delay: 0.55 },
    { top: "20%", left: "50%", color: "#f59e0b", size: 10, score: 55, delay: 0.65 },
    { top: "70%", left: "35%", color: "#3b82f6", size: 12, score: 68, delay: 0.75 },
    { top: "50%", left: "72%", color: "#ef4444", size: 14, score: 88, delay: 0.9 },
    { top: "35%", left: "42%", color: "#22c55e", size: 10, score: 18, delay: 0.85 },
  ];

  return (
    <div className="relative w-full max-w-xl aspect-[4/3] rounded-2xl overflow-hidden border border-white/[0.06]">
      {/* Dark map background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0a0f1e] via-[#0d1326] to-[#0a0f1e]" />
      {/* Grid */}
      <div className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.4) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />
      {/* Roads */}
      <div className="absolute inset-0">
        <div className="absolute top-[40%] left-0 right-0 h-px bg-white/[0.06]" />
        <div className="absolute top-[60%] left-0 right-0 h-px bg-white/[0.04]" />
        <div className="absolute top-0 bottom-0 left-[35%] w-px bg-white/[0.06]" />
        <div className="absolute top-0 bottom-0 left-[65%] w-px bg-white/[0.04]" />
      </div>
      {/* Scanning pulse rings */}
      {[0, 0.8, 1.6].map((d, i) => (
        <motion.div
          key={i}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-blue-400/20"
          initial={{ width: 0, height: 0, opacity: 0.6 }}
          animate={{ width: 320, height: 320, opacity: 0 }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeOut", delay: d }}
        />
      ))}
      {/* Pins with scores */}
      {pins.map((pin, i) => (
        <motion.div
          key={i}
          className="absolute"
          style={{ top: pin.top, left: pin.left }}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: pin.delay, duration: 0.4, type: "spring", stiffness: 260, damping: 20 }}
        >
          <div
            className="rounded-full border-2 border-white/30 flex items-center justify-center text-[8px] font-bold text-white shadow-lg"
            style={{ width: pin.size + 8, height: pin.size + 8, backgroundColor: pin.color, boxShadow: `0 0 12px ${pin.color}40` }}
          >
            {pin.score}
          </div>
        </motion.div>
      ))}
      {/* Center scanner */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <div className="h-4 w-4 rounded-full bg-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.6)]" />
      </div>
      {/* Corner label */}
      <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-md rounded-lg px-3 py-2 border border-white/10">
        <div className="flex items-center gap-2 text-xs text-slate-300">
          <Radar className="h-3.5 w-3.5 text-blue-400 animate-spin" style={{ animationDuration: "3s" }} />
          <span>Scanning 247 businesses...</span>
        </div>
      </div>
      {/* Stats overlay */}
      <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md rounded-lg px-3 py-2 border border-white/10">
        <div className="text-[10px] text-slate-400">Opportunity Score</div>
        <div className="text-lg font-bold text-white">73<span className="text-xs text-slate-400">/100</span></div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Sections                                                           */
/* ------------------------------------------------------------------ */

function HeroSection() {
  return (
    <section className="relative overflow-hidden">
      {/* Mesh gradient background */}
      <div className="absolute inset-0">
        <div className="absolute top-[-20%] left-[10%] w-[600px] h-[600px] bg-blue-500/[0.07] rounded-full blur-[120px]" />
        <div className="absolute top-[20%] right-[5%] w-[400px] h-[400px] bg-purple-500/[0.05] rounded-full blur-[100px]" />
        <div className="absolute bottom-[-10%] left-[40%] w-[500px] h-[500px] bg-cyan-500/[0.04] rounded-full blur-[120px]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 sm:py-28 lg:py-36">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <FadeInUp>
            <div className="space-y-8">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
                className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm text-slate-300 border border-white/10 bg-white/[0.03] backdrop-blur-sm"
              >
                <Sparkles className="h-4 w-4 text-blue-400" />
                <span>B2B Lead Generation, Reinvented</span>
              </motion.div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.08]">
                Find Businesses{" "}
                <span className="gradient-text">That Need You</span>
              </h1>
              <p className="text-lg sm:text-xl text-slate-400 leading-relaxed max-w-lg">
                Scan any area on Google Maps. Detect businesses without websites,
                social media, or digital presence. Generate qualified leads in
                minutes.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link href="/login">
                  <Button size="xl" className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg shadow-blue-500/25 glow-blue">
                    Start Scanning Free
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="#how-it-works">
                  <Button
                    size="xl"
                    variant="outline"
                    className="border-white/10 text-slate-300 hover:bg-white/5 hover:text-white hover:border-white/20"
                  >
                    See How It Works
                  </Button>
                </Link>
              </div>
              {/* Social proof */}
              <div className="flex items-center gap-3 pt-2">
                <div className="flex -space-x-2">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-8 w-8 rounded-full bg-gradient-to-br from-slate-600 to-slate-700 border-2 border-background" />
                  ))}
                </div>
                <div className="text-sm text-slate-400">
                  <span className="text-white font-medium">300+</span> agencies already using MapKo
                </div>
              </div>
            </div>
          </FadeInUp>
          <FadeInUp delay={0.2} className="flex justify-center lg:justify-end">
            <HeroMapVisual />
          </FadeInUp>
        </div>
      </div>
    </section>
  );
}

function StatsBar() {
  const stats = [
    { value: "50K+", label: "Businesses Scanned" },
    { value: "2,500+", label: "Leads Generated" },
    { value: "300+", label: "Agencies Trust Us" },
  ];

  return (
    <section className="border-y border-white/[0.06] bg-white/[0.01]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <FadeInUp>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
            {stats.map((stat) => (
              <div key={stat.label}>
                <div className="text-3xl sm:text-4xl font-bold gradient-text">{stat.value}</div>
                <div className="mt-1 text-sm text-slate-500">{stat.label}</div>
              </div>
            ))}
          </div>
        </FadeInUp>
      </div>
    </section>
  );
}

function HowItWorksSection() {
  const steps = [
    {
      icon: MapPin,
      title: "Pick a Zone",
      description: "Choose any city, neighborhood, or custom area. Search by name or browse the interactive map.",
    },
    {
      icon: Search,
      title: "We Scan & Analyze",
      description: "Every business gets a full digital presence audit — website, social media, reviews, and more.",
    },
    {
      icon: Download,
      title: "Export & Outreach",
      description: "Download qualified leads with opportunity scores, contact info, and actionable recommendations.",
    },
  ];

  return (
    <section id="how-it-works" className="py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <FadeInUp className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold">How It Works</h2>
          <p className="mt-4 text-lg text-slate-400 max-w-2xl mx-auto">
            Three simple steps from map scan to qualified leads.
          </p>
        </FadeInUp>

        <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
          {steps.map((step, i) => (
            <FadeInUp key={step.title} delay={i * 0.15}>
              <div className="relative text-center group">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-8xl font-black text-white/[0.02] select-none">
                  {i + 1}
                </div>
                <div className="relative mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500/10 to-purple-500/5 border border-blue-500/10 group-hover:border-blue-500/20 group-hover:shadow-[0_0_30px_-5px_rgba(59,130,246,0.2)] transition-all duration-500">
                  <step.icon className="h-7 w-7 text-blue-400" />
                </div>
                <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
                <p className="text-slate-400 leading-relaxed">{step.description}</p>
                {i < steps.length - 1 && (
                  <div className="hidden md:block absolute top-8 -right-6 lg:-right-8 w-12 lg:w-16 h-px bg-gradient-to-r from-blue-500/20 to-transparent" />
                )}
              </div>
            </FadeInUp>
          ))}
        </div>
      </div>
    </section>
  );
}

function FeaturesSection() {
  const features = [
    {
      icon: Radar,
      title: "Bulk Zone Scanning",
      description: "Scan entire neighborhoods or cities at once. Pull every business from Google Maps data.",
      color: "from-blue-500 to-cyan-500",
    },
    {
      icon: Globe,
      title: "Digital Presence Audit",
      description: "Detect missing websites, inactive social profiles, poor SEO, and outdated listings.",
      color: "from-emerald-500 to-teal-500",
    },
    {
      icon: BarChart3,
      title: "Opportunity Scoring",
      description: "Each business gets a score 0-100 based on digital gaps. High score = high opportunity.",
      color: "from-amber-500 to-orange-500",
    },
    {
      icon: Map,
      title: "Interactive Map View",
      description: "Visualize results on a color-coded map. Filter by score, category, or gap type.",
      color: "from-purple-500 to-pink-500",
    },
    {
      icon: FileSpreadsheet,
      title: "Smart Export",
      description: "Export CSV/XLSX with all data. Business name, address, phone, website status, scores.",
      color: "from-rose-500 to-red-500",
    },
    {
      icon: Users,
      title: "Team & Agency Plans",
      description: "Collaborate with your team. Share scans, assign leads, manage outreach from one dashboard.",
      color: "from-indigo-500 to-blue-500",
    },
  ];

  return (
    <section className="py-20 sm:py-28 relative">
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-blue-500/[0.03] rounded-full blur-[120px]" />
      </div>
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <FadeInUp className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold">
            Everything You Need to{" "}
            <span className="gradient-text">Find Clients</span>
          </h2>
          <p className="mt-4 text-lg text-slate-400 max-w-2xl mx-auto">
            Powerful tools to discover, qualify, and export business leads at scale.
          </p>
        </FadeInUp>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((feature, i) => (
            <FadeInUp key={feature.title} delay={i * 0.1}>
              <div className="glass rounded-2xl p-6 h-full group hover:border-white/10 transition-all duration-500 hover:shadow-[0_8px_32px_-8px_rgba(0,0,0,0.5)] hover:-translate-y-1">
                <div className={`mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${feature.color} shadow-lg`}>
                  <feature.icon className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{feature.description}</p>
              </div>
            </FadeInUp>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTASection() {
  return (
    <section className="py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <FadeInUp>
          <div className="relative rounded-3xl overflow-hidden border border-white/[0.06]">
            {/* Gradient background */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/[0.08] via-purple-500/[0.04] to-blue-500/[0.08]" />
            <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 rounded-full blur-[80px] pointer-events-none" />

            <div className="relative px-8 py-16 sm:px-16 sm:py-20 text-center">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                Ready to Find Your Next Clients?
              </h2>
              <p className="text-lg text-slate-400 max-w-xl mx-auto mb-8">
                Join hundreds of agencies and freelancers using MapKo to discover
                businesses that need their services.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/login">
                  <Button size="xl" className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg shadow-blue-500/25 glow-blue">
                    Start Scanning Free
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
              <div className="flex items-center justify-center gap-6 mt-8 text-sm text-slate-500">
                <span className="flex items-center gap-1.5"><Check className="h-4 w-4 text-green-400" /> Free plan available</span>
                <span className="flex items-center gap-1.5"><Check className="h-4 w-4 text-green-400" /> No credit card required</span>
              </div>
            </div>
          </div>
        </FadeInUp>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function LandingPage() {
  return (
    <>
      <HeroSection />
      <StatsBar />
      <HowItWorksSection />
      <FeaturesSection />
      <CTASection />
    </>
  );
}
