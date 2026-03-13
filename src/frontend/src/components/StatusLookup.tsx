import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertTriangle,
  Calendar,
  CheckCircle2,
  Clock,
  CreditCard,
  Globe,
  Hash,
  MapPin,
  Search,
  User,
  XCircle,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import type { PassportApplication } from "../backend";
import { useActor } from "../hooks/useActor";

type LookupMode = "id" | "passport";

function StatusBadge({ status }: { status: PassportApplication["status"] }) {
  if (status.__kind__ === "Approved") {
    return (
      <span className="inline-flex items-center gap-1.5 status-approved px-3 py-1.5 rounded-full text-sm font-semibold">
        <CheckCircle2 className="w-4 h-4" />
        Approved
      </span>
    );
  }
  if (status.__kind__ === "Pending") {
    return (
      <span className="inline-flex items-center gap-1.5 status-pending px-3 py-1.5 rounded-full text-sm font-semibold">
        <Clock className="w-4 h-4" />
        Pending Review
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 status-rejected px-3 py-1.5 rounded-full text-sm font-semibold">
      <XCircle className="w-4 h-4" />
      Rejected
    </span>
  );
}

function ResultCard({ app }: { app: PassportApplication }) {
  const submittedDate = new Date(
    Number(app.submittedAt) / 1_000_000,
  ).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="border-border shadow-card overflow-hidden">
        {/* Status header bar */}
        <div
          className={`h-1.5 w-full ${
            app.status.__kind__ === "Approved"
              ? "bg-success"
              : app.status.__kind__ === "Pending"
                ? "bg-warning"
                : "bg-destructive"
          }`}
        />
        <CardContent className="p-6 md:p-8">
          {/* Header row */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-widest font-semibold mb-1">
                Application #{Number(app.id)}
              </p>
              <h3 className="text-2xl font-display font-bold text-foreground">
                {app.fullName}
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                Submitted {submittedDate}
              </p>
            </div>
            <StatusBadge status={app.status} />
          </div>

          {/* Details grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-6">
            <DetailItem
              icon={CreditCard}
              label="Passport Number"
              value={app.passportNumber}
              mono
            />
            <DetailItem
              icon={Globe}
              label="Nationality"
              value={app.nationality}
            />
            <DetailItem icon={User} label="Gender" value={app.gender} />
            <DetailItem
              icon={MapPin}
              label="Place of Birth"
              value={app.placeOfBirth}
            />
            <DetailItem
              icon={Calendar}
              label="Date of Birth"
              value={app.dateOfBirth}
            />
            <DetailItem
              icon={Calendar}
              label="Issue Date"
              value={app.issueDate}
            />
            <DetailItem
              icon={Calendar}
              label="Expiry Date"
              value={app.expiryDate}
            />
          </div>

          {/* Rejection reason */}
          {app.status.__kind__ === "Rejected" && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="flex items-start gap-3 p-4 rounded-lg bg-destructive/8 border border-destructive/20"
            >
              <AlertTriangle className="w-4 h-4 text-destructive mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-semibold text-destructive mb-0.5">
                  Rejection Reason
                </p>
                <p className="text-sm text-muted-foreground">
                  {app.status.Rejected}
                </p>
              </div>
            </motion.div>
          )}

          {/* Pending hint */}
          {app.status.__kind__ === "Pending" && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground p-3 rounded-lg bg-warning-muted">
              <Clock className="w-4 h-4 text-warning shrink-0" />
              <span>
                Your application is under review. Typical processing takes 24–48
                hours.
              </span>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

function DetailItem({
  icon: Icon,
  label,
  value,
  mono = false,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center shrink-0 mt-0.5">
        <Icon className="w-4 h-4 text-muted-foreground" />
      </div>
      <div>
        <p className="text-xs text-muted-foreground font-medium">{label}</p>
        <p
          className={`text-sm font-semibold text-foreground mt-0.5 ${mono ? "font-mono" : ""}`}
        >
          {value || "—"}
        </p>
      </div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <Card className="border-border shadow-card">
      <div className="h-1.5 w-full bg-muted rounded-t" />
      <CardContent className="p-6 md:p-8">
        <div className="flex justify-between mb-6">
          <div className="space-y-2">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-7 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
          <Skeleton className="h-9 w-28 rounded-full" />
        </div>
        <div className="grid grid-cols-2 gap-5">
          {Array.from({ length: 6 }, (_, i) => i).map((i) => (
            <div key={i} className="flex items-start gap-3">
              <Skeleton className="w-8 h-8 rounded-lg shrink-0" />
              <div className="space-y-1.5">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-4 w-28" />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function StatusLookup() {
  const { actor } = useActor();
  const [mode, setMode] = useState<LookupMode>("id");
  const [idInput, setIdInput] = useState("");
  const [passportInput, setPassportInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PassportApplication | null>(null);
  const [notFound, setNotFound] = useState(false);

  const handleSearch = async () => {
    setNotFound(false);
    setResult(null);

    const query = mode === "id" ? idInput.trim() : passportInput.trim();
    if (!query) {
      toast.error(
        mode === "id"
          ? "Please enter an application ID"
          : "Please enter a passport number",
      );
      return;
    }
    if (!actor) {
      toast.error("Backend not available. Please try again.");
      return;
    }

    setLoading(true);
    try {
      let app: PassportApplication;
      if (mode === "id") {
        app = await actor.getApplicationStatus(BigInt(query));
      } else {
        app = await actor.lookupByPassportNumber(query);
      }
      setResult(app);
    } catch (err) {
      console.error(err);
      setNotFound(true);
      toast.error("No application found. Please check your details.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSearch();
  };

  return (
    <main className="min-h-screen py-12 px-4">
      <div className="container max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-4xl font-display font-bold text-foreground tracking-tight mb-2">
            Check Application Status
          </h1>
          <p className="text-muted-foreground">
            Look up your passport verification status using your application ID
            or passport number.
          </p>
        </div>

        {/* Search card */}
        <Card className="border-border shadow-card mb-6">
          <CardContent className="p-6 md:p-8">
            {/* Mode toggle */}
            <div className="flex gap-2 mb-6 p-1 bg-secondary rounded-lg">
              <button
                type="button"
                onClick={() => {
                  setMode("id");
                  setResult(null);
                  setNotFound(false);
                }}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-md text-sm font-semibold transition-all duration-150 ${
                  mode === "id"
                    ? "bg-card shadow-xs text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Hash className="w-4 h-4" />
                By Application ID
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode("passport");
                  setResult(null);
                  setNotFound(false);
                }}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-md text-sm font-semibold transition-all duration-150 ${
                  mode === "passport"
                    ? "bg-card shadow-xs text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <CreditCard className="w-4 h-4" />
                By Passport Number
              </button>
            </div>

            {/* Input */}
            <AnimatePresence mode="wait">
              {mode === "id" ? (
                <motion.div
                  key="id-input"
                  initial={{ opacity: 0, x: 8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -8 }}
                  transition={{ duration: 0.15 }}
                  className="flex gap-3"
                >
                  <div className="relative flex-1">
                    <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      type="number"
                      placeholder="Enter application ID (e.g. 42)"
                      value={idInput}
                      onChange={(e) => setIdInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      className="pl-9 font-mono"
                      min="0"
                    />
                  </div>
                  <Button
                    onClick={handleSearch}
                    disabled={loading}
                    className="bg-primary text-primary-foreground gap-2"
                  >
                    {loading ? (
                      <span className="w-4 h-4 rounded-full border-2 border-primary-foreground/40 border-t-primary-foreground animate-spin" />
                    ) : (
                      <Search className="w-4 h-4" />
                    )}
                    Search
                  </Button>
                </motion.div>
              ) : (
                <motion.div
                  key="passport-input"
                  initial={{ opacity: 0, x: 8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -8 }}
                  transition={{ duration: 0.15 }}
                  className="flex gap-3"
                >
                  <div className="relative flex-1">
                    <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Enter passport number (e.g. P123456)"
                      value={passportInput}
                      onChange={(e) =>
                        setPassportInput(e.target.value.toUpperCase())
                      }
                      onKeyDown={handleKeyDown}
                      className="pl-9 font-mono tracking-wider uppercase"
                    />
                  </div>
                  <Button
                    onClick={handleSearch}
                    disabled={loading}
                    className="bg-primary text-primary-foreground gap-2"
                  >
                    {loading ? (
                      <span className="w-4 h-4 rounded-full border-2 border-primary-foreground/40 border-t-primary-foreground animate-spin" />
                    ) : (
                      <Search className="w-4 h-4" />
                    )}
                    Search
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>

        {/* Results */}
        <AnimatePresence mode="wait">
          {loading && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <LoadingSkeleton />
            </motion.div>
          )}

          {!loading && result && (
            <motion.div key="result">
              <ResultCard app={result} />
            </motion.div>
          )}

          {!loading && notFound && (
            <motion.div
              key="not-found"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <Card className="border-border shadow-card">
                <CardContent className="p-10 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-secondary flex items-center justify-center mx-auto mb-4">
                    <AlertTriangle className="w-7 h-7 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-display font-bold text-foreground mb-2">
                    No application found
                  </h3>
                  <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                    We couldn't find an application matching your search. Please
                    double-check your{" "}
                    {mode === "id" ? "application ID" : "passport number"} and
                    try again.
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
