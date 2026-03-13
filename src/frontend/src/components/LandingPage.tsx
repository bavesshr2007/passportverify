import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowRight,
  Award,
  CheckCircle2,
  Clock,
  FileText,
  Globe,
  Lock,
  Shield,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import type { ApplicationStats } from "../backend";
import { useActor } from "../hooks/useActor";

type View = "landing" | "apply" | "status" | "admin";

interface LandingPageProps {
  onNavigate: (view: View) => void;
}

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

function StatCard({
  label,
  value,
  icon: Icon,
  color,
  loading,
}: {
  label: string;
  value: string;
  icon: React.ElementType;
  color: string;
  loading: boolean;
}) {
  return (
    <motion.div variants={fadeUp} className="text-center">
      <div
        className={`inline-flex items-center justify-center w-12 h-12 rounded-xl mb-3 ${color}`}
      >
        <Icon className="w-6 h-6" />
      </div>
      {loading ? (
        <Skeleton className="h-8 w-16 mx-auto mb-1" />
      ) : (
        <div className="text-3xl font-display font-bold text-foreground tracking-tight">
          {value}
        </div>
      )}
      <div className="text-sm text-muted-foreground mt-1 font-medium">
        {label}
      </div>
    </motion.div>
  );
}

export function LandingPage({ onNavigate }: LandingPageProps) {
  const { actor, isFetching } = useActor();
  const [stats, setStats] = useState<ApplicationStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    if (!actor || isFetching) return;
    setStatsLoading(true);
    actor
      .getStats()
      .then(setStats)
      .catch(() => {})
      .finally(() => setStatsLoading(false));
  }, [actor, isFetching]);

  const statsData = [
    {
      label: "Total Applications",
      value: stats ? Number(stats.totalApplications).toLocaleString() : "—",
      icon: FileText,
      color: "bg-info-muted text-info",
      loading: statsLoading,
    },
    {
      label: "Approved",
      value: stats ? Number(stats.approvedCount).toLocaleString() : "—",
      icon: CheckCircle2,
      color: "bg-success-muted text-success",
      loading: statsLoading,
    },
    {
      label: "Pending Review",
      value: stats ? Number(stats.pendingCount).toLocaleString() : "—",
      icon: Clock,
      color: "bg-warning-muted text-warning",
      loading: statsLoading,
    },
    {
      label: "Processed",
      value: stats
        ? (
            Number(stats.approvedCount) + Number(stats.rejectedCount)
          ).toLocaleString()
        : "—",
      icon: TrendingUp,
      color: "bg-accent/20 text-accent-foreground",
      loading: statsLoading,
    },
  ];

  const features = [
    {
      icon: Lock,
      title: "Secure & Private",
      description:
        "Your personal information is protected with military-grade encryption on the Internet Computer blockchain. Zero data breaches.",
      accent: "bg-info-muted text-info",
    },
    {
      icon: Zap,
      title: "Fast Processing",
      description:
        "Applications reviewed within 24-48 hours by certified authorities. Real-time status updates keep you informed every step.",
      accent: "bg-warning-muted text-warning",
    },
    {
      icon: Globe,
      title: "Global Recognition",
      description:
        "Verified documents accepted in 193 countries. Our verification certificates meet ICAO international standards.",
      accent: "bg-success-muted text-success",
    },
  ];

  const trustedBy = [
    { name: "ICAO", full: "Int'l Civil Aviation Org." },
    { name: "INTERPOL", full: "International Police" },
    { name: "EU-DGC", full: "EU Digital Green Cert" },
    { name: "IATA", full: "Air Transport Assoc." },
    { name: "UN-HCR", full: "UN Refugee Agency" },
  ];

  const processSteps = [
    {
      step: "01",
      title: "Submit Application",
      desc: "Fill out your personal and passport details in our secure multi-step form.",
    },
    {
      step: "02",
      title: "Document Review",
      desc: "Our certified team reviews your application against international standards.",
    },
    {
      step: "03",
      title: "Verification",
      desc: "Cryptographic verification ensures your documents are authentic and valid.",
    },
    {
      step: "04",
      title: "Certificate Issued",
      desc: "Receive your digital verification certificate recognized globally.",
    },
  ];

  return (
    <main className="min-h-screen">
      {/* ===================== HERO ===================== */}
      <section className="relative overflow-hidden hero-gradient grain-overlay">
        <div className="hero-mesh absolute inset-0" />

        {/* Decorative passport stamp rings */}
        <div className="absolute right-8 top-1/2 -translate-y-1/2 hidden xl:block opacity-10">
          <div className="w-72 h-72 rounded-full border-4 border-white flex items-center justify-center">
            <div className="w-60 h-60 rounded-full border-2 border-white flex items-center justify-center">
              <div className="w-48 h-48 rounded-full border border-white" />
            </div>
          </div>
        </div>

        <div className="container max-w-7xl mx-auto px-4 sm:px-6 py-20 md:py-28 relative z-10">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={stagger}
            className="max-w-3xl"
          >
            <motion.div variants={fadeUp} className="mb-6">
              <span className="inline-flex items-center gap-2 glass-card px-4 py-2 rounded-full text-xs font-semibold text-white/80 uppercase tracking-widest">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                Secure Blockchain Verification
              </span>
            </motion.div>

            <motion.h1
              variants={fadeUp}
              className="text-5xl md:text-6xl lg:text-7xl font-display font-bold text-white leading-[1.05] tracking-tight mb-6"
            >
              Fast, Secure{" "}
              <span className="block">
                Passport{" "}
                <span className="relative inline-block">
                  <span className="relative z-10">Verification</span>
                  <span
                    className="absolute inset-x-0 bottom-1 h-3 rounded-sm opacity-30"
                    style={{ background: "oklch(0.82 0.12 82)" }}
                  />
                </span>
              </span>
            </motion.h1>

            <motion.p
              variants={fadeUp}
              className="text-lg md:text-xl text-white/65 max-w-xl leading-relaxed mb-10 font-body"
            >
              Apply for passport verification, track your application status,
              and receive a globally recognized digital certificate — all
              secured on the Internet Computer.
            </motion.p>

            <motion.div variants={fadeUp} className="flex flex-wrap gap-3">
              <Button
                size="lg"
                onClick={() => onNavigate("apply")}
                className="gap-2 bg-white text-foreground hover:bg-white/90 font-semibold text-base px-7 h-12 shadow-navy"
              >
                Apply Now
                <ArrowRight className="w-4 h-4" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => onNavigate("status")}
                className="gap-2 border-white/25 text-white hover:bg-white/10 font-semibold text-base px-7 h-12"
                style={{ background: "transparent" }}
              >
                Check Status
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ===================== STATS BAR ===================== */}
      <section className="bg-card border-b border-border shadow-card">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 py-10">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="grid grid-cols-2 md:grid-cols-4 gap-8 divide-y md:divide-y-0 md:divide-x divide-border"
          >
            {statsData.map((stat) => (
              <StatCard key={stat.label} {...stat} />
            ))}
          </motion.div>
        </div>
      </section>

      {/* ===================== FEATURES ===================== */}
      <section className="py-20 md:py-28">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
          >
            <motion.div variants={fadeUp} className="text-center mb-14">
              <div className="inline-flex items-center gap-2 bg-secondary px-4 py-2 rounded-full text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-4">
                <Award className="w-3.5 h-3.5" />
                Why PassportVerify
              </div>
              <h2 className="text-4xl md:text-5xl font-display font-bold tracking-tight text-foreground">
                Built for the modern world
              </h2>
              <p className="mt-4 text-muted-foreground text-lg max-w-2xl mx-auto">
                We combine blockchain security with institutional-grade
                processes to deliver verification you can trust.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-6">
              {features.map((f) => (
                <motion.div key={f.title} variants={fadeUp}>
                  <Card className="h-full border-border shadow-card hover:shadow-card-hover transition-all duration-300 group">
                    <CardContent className="p-8">
                      <div
                        className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-6 ${f.accent} transition-transform group-hover:scale-110 duration-300`}
                      >
                        <f.icon className="w-7 h-7" />
                      </div>
                      <h3 className="text-xl font-display font-bold text-foreground mb-3">
                        {f.title}
                      </h3>
                      <p className="text-muted-foreground leading-relaxed">
                        {f.description}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ===================== PROCESS ===================== */}
      <section className="py-20 bg-secondary/30">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
          >
            <motion.div variants={fadeUp} className="text-center mb-14">
              <h2 className="text-4xl md:text-5xl font-display font-bold tracking-tight text-foreground">
                How it works
              </h2>
              <p className="mt-4 text-muted-foreground text-lg">
                Four simple steps to get your verification certificate.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {processSteps.map((s, i) => (
                <motion.div key={s.step} variants={fadeUp} className="relative">
                  {i < processSteps.length - 1 && (
                    <div className="hidden lg:block absolute top-8 left-[calc(100%-12px)] w-6 h-px bg-border z-10" />
                  )}
                  <Card className="border-border shadow-xs h-full">
                    <CardContent className="p-6">
                      <div className="text-4xl font-display font-black text-border mb-4">
                        {s.step}
                      </div>
                      <h3 className="text-lg font-display font-bold text-foreground mb-2">
                        {s.title}
                      </h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {s.desc}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ===================== TRUSTED BY ===================== */}
      <section className="py-16 border-y border-border">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
          >
            <motion.p
              variants={fadeUp}
              className="text-center text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-10"
            >
              Trusted by leading international authorities
            </motion.p>
            <motion.div
              variants={stagger}
              className="flex flex-wrap justify-center gap-4 md:gap-8"
            >
              {trustedBy.map((org) => (
                <motion.div
                  key={org.name}
                  variants={fadeUp}
                  className="flex flex-col items-center justify-center px-6 py-4 rounded-xl border border-border bg-card shadow-xs hover:shadow-card transition-all duration-200 min-w-[120px] group"
                >
                  <span className="text-base font-display font-black text-foreground tracking-tight group-hover:text-primary transition-colors">
                    {org.name}
                  </span>
                  <span className="text-[10px] text-muted-foreground text-center mt-0.5 leading-tight max-w-[100px]">
                    {org.full}
                  </span>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ===================== CTA ===================== */}
      <section className="py-24 relative overflow-hidden hero-gradient grain-overlay">
        <div className="hero-mesh absolute inset-0" />
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="text-center max-w-2xl mx-auto"
          >
            <motion.div variants={fadeUp} className="flex justify-center mb-6">
              <div className="w-16 h-16 rounded-2xl glass-card flex items-center justify-center">
                <Shield className="w-8 h-8 text-white" />
              </div>
            </motion.div>
            <motion.h2
              variants={fadeUp}
              className="text-4xl md:text-5xl font-display font-bold text-white tracking-tight mb-4"
            >
              Ready to get verified?
            </motion.h2>
            <motion.p variants={fadeUp} className="text-white/65 text-lg mb-8">
              Start your application today and receive your internationally
              recognized verification certificate within 48 hours.
            </motion.p>
            <motion.div
              variants={fadeUp}
              className="flex flex-wrap justify-center gap-3"
            >
              <Button
                size="lg"
                onClick={() => onNavigate("apply")}
                className="gap-2 bg-white text-foreground hover:bg-white/90 font-semibold px-8 h-12"
              >
                Start Application
                <ArrowRight className="w-4 h-4" />
              </Button>
              <Button
                size="lg"
                variant="ghost"
                onClick={() => onNavigate("status")}
                className="text-white hover:bg-white/10 font-semibold px-8 h-12"
              >
                <Users className="w-4 h-4 mr-2" />
                Track Existing
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ===================== FOOTER ===================== */}
      <footer className="bg-card border-t border-border py-8">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-primary" />
              <span className="font-display font-semibold text-foreground text-sm">
                PassportVerify
              </span>
            </div>
            <p className="text-xs text-muted-foreground text-center">
              © {new Date().getFullYear()}. Built with{" "}
              <span className="text-destructive">♥</span> using{" "}
              <a
                href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                caffeine.ai
              </a>
            </p>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
              <span className="text-xs text-muted-foreground">
                All systems operational
              </span>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
