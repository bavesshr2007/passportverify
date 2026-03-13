import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Copy,
  FileText,
  Loader2,
  LogIn,
  Shield,
  User,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { useActor } from "../hooks/useActor";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

const COUNTRIES = [
  "Afghanistan",
  "Albania",
  "Algeria",
  "Andorra",
  "Angola",
  "Argentina",
  "Armenia",
  "Australia",
  "Austria",
  "Azerbaijan",
  "Bahamas",
  "Bahrain",
  "Bangladesh",
  "Belarus",
  "Belgium",
  "Belize",
  "Benin",
  "Bhutan",
  "Bolivia",
  "Bosnia and Herzegovina",
  "Botswana",
  "Brazil",
  "Brunei",
  "Bulgaria",
  "Burkina Faso",
  "Burundi",
  "Cambodia",
  "Cameroon",
  "Canada",
  "Cape Verde",
  "Central African Republic",
  "Chad",
  "Chile",
  "China",
  "Colombia",
  "Comoros",
  "Congo",
  "Costa Rica",
  "Croatia",
  "Cuba",
  "Cyprus",
  "Czech Republic",
  "Denmark",
  "Djibouti",
  "Dominican Republic",
  "Ecuador",
  "Egypt",
  "El Salvador",
  "Estonia",
  "Ethiopia",
  "Fiji",
  "Finland",
  "France",
  "Gabon",
  "Gambia",
  "Georgia",
  "Germany",
  "Ghana",
  "Greece",
  "Guatemala",
  "Guinea",
  "Haiti",
  "Honduras",
  "Hungary",
  "Iceland",
  "India",
  "Indonesia",
  "Iran",
  "Iraq",
  "Ireland",
  "Israel",
  "Italy",
  "Jamaica",
  "Japan",
  "Jordan",
  "Kazakhstan",
  "Kenya",
  "Kuwait",
  "Kyrgyzstan",
  "Laos",
  "Latvia",
  "Lebanon",
  "Liberia",
  "Libya",
  "Liechtenstein",
  "Lithuania",
  "Luxembourg",
  "Madagascar",
  "Malawi",
  "Malaysia",
  "Maldives",
  "Mali",
  "Malta",
  "Mexico",
  "Moldova",
  "Monaco",
  "Mongolia",
  "Montenegro",
  "Morocco",
  "Mozambique",
  "Myanmar",
  "Namibia",
  "Nepal",
  "Netherlands",
  "New Zealand",
  "Nicaragua",
  "Niger",
  "Nigeria",
  "North Korea",
  "Norway",
  "Oman",
  "Pakistan",
  "Panama",
  "Papua New Guinea",
  "Paraguay",
  "Peru",
  "Philippines",
  "Poland",
  "Portugal",
  "Qatar",
  "Romania",
  "Russia",
  "Rwanda",
  "Saudi Arabia",
  "Senegal",
  "Serbia",
  "Sierra Leone",
  "Singapore",
  "Slovakia",
  "Slovenia",
  "Somalia",
  "South Africa",
  "South Korea",
  "Spain",
  "Sri Lanka",
  "Sudan",
  "Sweden",
  "Switzerland",
  "Syria",
  "Taiwan",
  "Tajikistan",
  "Tanzania",
  "Thailand",
  "Togo",
  "Trinidad and Tobago",
  "Tunisia",
  "Turkey",
  "Turkmenistan",
  "Uganda",
  "Ukraine",
  "United Arab Emirates",
  "United Kingdom",
  "United States",
  "Uruguay",
  "Uzbekistan",
  "Venezuela",
  "Vietnam",
  "Yemen",
  "Zambia",
  "Zimbabwe",
];

interface FormData {
  fullName: string;
  dateOfBirth: string;
  gender: string;
  placeOfBirth: string;
  nationality: string;
  address: string;
  passportNumber: string;
  issueDate: string;
  expiryDate: string;
}

const initialForm: FormData = {
  fullName: "",
  dateOfBirth: "",
  gender: "",
  placeOfBirth: "",
  nationality: "",
  address: "",
  passportNumber: "",
  issueDate: "",
  expiryDate: "",
};

const steps = [
  { id: 1, label: "Personal Info", icon: User },
  { id: 2, label: "Passport Details", icon: FileText },
  { id: 3, label: "Review & Submit", icon: CheckCircle2 },
];

function FieldGroup({
  label,
  children,
  error,
}: {
  label: string;
  children: React.ReactNode;
  error?: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm font-medium text-foreground">{label}</Label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between py-3 border-b border-border last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium text-foreground text-right max-w-[60%] break-all">
        {value || "—"}
      </span>
    </div>
  );
}

export function ApplyForm() {
  const { actor } = useActor();
  const { identity, login, loginStatus } = useInternetIdentity();
  const isLoggedIn = !!identity;
  const isLoggingIn = loginStatus === "logging-in";

  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormData>(initialForm);
  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submittedId, setSubmittedId] = useState<bigint | null>(null);

  const set = (field: keyof FormData) => (value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const validateStep1 = (): boolean => {
    const errs: Partial<FormData> = {};
    if (!form.fullName.trim()) errs.fullName = "Full name is required";
    if (!form.dateOfBirth) errs.dateOfBirth = "Date of birth is required";
    if (!form.gender) errs.gender = "Please select a gender";
    if (!form.placeOfBirth.trim())
      errs.placeOfBirth = "Place of birth is required";
    if (!form.nationality) errs.nationality = "Please select a nationality";
    if (!form.address.trim()) errs.address = "Address is required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const validateStep2 = (): boolean => {
    const errs: Partial<FormData> = {};
    if (!form.passportNumber.trim())
      errs.passportNumber = "Passport number is required";
    if (!form.issueDate) errs.issueDate = "Issue date is required";
    if (!form.expiryDate) errs.expiryDate = "Expiry date is required";
    if (
      form.issueDate &&
      form.expiryDate &&
      form.issueDate >= form.expiryDate
    ) {
      errs.expiryDate = "Expiry date must be after issue date";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = () => {
    if (step === 1 && validateStep1()) setStep(2);
    if (step === 2 && validateStep2()) setStep(3);
  };

  const handleSubmit = async () => {
    if (!isLoggedIn) {
      toast.error("Please login to submit an application");
      return;
    }
    if (!actor) {
      toast.error("Backend not available. Please try again.");
      return;
    }
    setSubmitting(true);
    try {
      const id = await actor.submitApplication(
        form.fullName,
        form.dateOfBirth,
        form.passportNumber,
        form.nationality,
        form.issueDate,
        form.expiryDate,
        form.placeOfBirth,
        form.gender,
        form.address,
      );
      setSubmittedId(id);
      toast.success("Application submitted successfully!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to submit application. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setStep(1);
    setForm(initialForm);
    setErrors({});
    setSubmittedId(null);
  };

  if (submittedId !== null) {
    return (
      <main className="min-h-[80vh] flex items-center justify-center py-16 px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full text-center"
        >
          <div className="w-20 h-20 rounded-full bg-success-muted flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-success" />
          </div>
          <h2 className="text-3xl font-display font-bold text-foreground mb-2">
            Application Submitted!
          </h2>
          <p className="text-muted-foreground mb-6">
            Your passport verification application has been received and is
            being reviewed.
          </p>
          <Card className="border-border shadow-card mb-6">
            <CardContent className="p-6">
              <p className="text-xs text-muted-foreground uppercase tracking-widest mb-2 font-semibold">
                Application ID
              </p>
              <div className="flex items-center justify-center gap-3">
                <span className="text-2xl font-display font-black text-foreground">
                  #{Number(submittedId)}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(String(Number(submittedId)));
                    toast.success("Copied to clipboard");
                  }}
                  className="p-1.5 rounded-md hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Save this ID to check your application status
              </p>
            </CardContent>
          </Card>
          <div className="flex gap-3 justify-center">
            <Button variant="outline" onClick={handleReset}>
              Submit Another
            </Button>
            <Button
              onClick={handleReset}
              className="bg-primary text-primary-foreground"
            >
              <Shield className="w-4 h-4 mr-2" />
              Done
            </Button>
          </div>
        </motion.div>
      </main>
    );
  }

  return (
    <main className="min-h-screen py-12 px-4">
      <div className="container max-w-2xl mx-auto">
        {/* Page header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-display font-bold text-foreground tracking-tight mb-2">
            Apply for Verification
          </h1>
          <p className="text-muted-foreground">
            Complete the form below to start your passport verification process.
          </p>
        </div>

        {/* Login prompt */}
        {!isLoggedIn && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <Card className="border-warning/30 bg-warning-muted">
              <CardContent className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-warning-foreground">
                    Login required to submit
                  </p>
                  <p className="text-xs text-warning-foreground/70 mt-0.5">
                    You can fill the form now, but must login before submitting.
                  </p>
                </div>
                <Button
                  size="sm"
                  onClick={() => login()}
                  disabled={isLoggingIn}
                  className="shrink-0 bg-warning text-warning-foreground hover:bg-warning/90"
                >
                  {isLoggingIn ? (
                    <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                  ) : (
                    <LogIn className="w-3.5 h-3.5 mr-1.5" />
                  )}
                  Login
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Step indicator */}
        <div className="flex items-center mb-10">
          {steps.map((s, i) => (
            <div key={s.id} className="flex items-center flex-1">
              <div className="flex flex-col items-center gap-1.5 flex-1">
                <div
                  className={`
                    w-10 h-10 rounded-full flex items-center justify-center font-display font-bold text-sm transition-all duration-300
                    ${step === s.id ? "step-active" : step > s.id ? "step-complete" : "step-inactive"}
                  `}
                >
                  {step > s.id ? (
                    <CheckCircle2 className="w-5 h-5" />
                  ) : (
                    <s.icon className="w-4 h-4" />
                  )}
                </div>
                <span
                  className={`text-xs font-medium hidden sm:block ${
                    step === s.id ? "text-foreground" : "text-muted-foreground"
                  }`}
                >
                  {s.label}
                </span>
              </div>
              {i < steps.length - 1 && (
                <div
                  className={`h-px flex-1 mx-2 transition-all duration-300 ${
                    step > s.id ? "bg-success" : "bg-border"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Form card */}
        <Card className="border-border shadow-card">
          <CardContent className="p-6 md:p-8">
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.22 }}
                  className="space-y-5"
                >
                  <div>
                    <h2 className="text-xl font-display font-bold text-foreground">
                      Personal Information
                    </h2>
                    <p className="text-sm text-muted-foreground mt-1">
                      Enter your personal details as they appear on official
                      documents.
                    </p>
                  </div>

                  <FieldGroup label="Full Name *" error={errors.fullName}>
                    <Input
                      placeholder="e.g. John Michael Smith"
                      value={form.fullName}
                      onChange={(e) => set("fullName")(e.target.value)}
                      className={errors.fullName ? "border-destructive" : ""}
                    />
                  </FieldGroup>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FieldGroup
                      label="Date of Birth *"
                      error={errors.dateOfBirth}
                    >
                      <Input
                        type="date"
                        value={form.dateOfBirth}
                        onChange={(e) => set("dateOfBirth")(e.target.value)}
                        max={new Date().toISOString().split("T")[0]}
                        className={
                          errors.dateOfBirth ? "border-destructive" : ""
                        }
                      />
                    </FieldGroup>

                    <FieldGroup label="Gender *" error={errors.gender}>
                      <Select value={form.gender} onValueChange={set("gender")}>
                        <SelectTrigger
                          className={errors.gender ? "border-destructive" : ""}
                        >
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                          <SelectItem value="non-binary">Non-binary</SelectItem>
                          <SelectItem value="prefer-not-to-say">
                            Prefer not to say
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </FieldGroup>
                  </div>

                  <FieldGroup
                    label="Place of Birth *"
                    error={errors.placeOfBirth}
                  >
                    <Input
                      placeholder="e.g. New York, USA"
                      value={form.placeOfBirth}
                      onChange={(e) => set("placeOfBirth")(e.target.value)}
                      className={
                        errors.placeOfBirth ? "border-destructive" : ""
                      }
                    />
                  </FieldGroup>

                  <FieldGroup label="Nationality *" error={errors.nationality}>
                    <Select
                      value={form.nationality}
                      onValueChange={set("nationality")}
                    >
                      <SelectTrigger
                        className={
                          errors.nationality ? "border-destructive" : ""
                        }
                      >
                        <SelectValue placeholder="Select nationality" />
                      </SelectTrigger>
                      <SelectContent className="max-h-60">
                        {COUNTRIES.map((c) => (
                          <SelectItem key={c} value={c}>
                            {c}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FieldGroup>

                  <FieldGroup label="Home Address *" error={errors.address}>
                    <Textarea
                      placeholder="Street address, city, state, country"
                      value={form.address}
                      onChange={(e) => set("address")(e.target.value)}
                      rows={3}
                      className={errors.address ? "border-destructive" : ""}
                    />
                  </FieldGroup>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.22 }}
                  className="space-y-5"
                >
                  <div>
                    <h2 className="text-xl font-display font-bold text-foreground">
                      Passport Details
                    </h2>
                    <p className="text-sm text-muted-foreground mt-1">
                      Enter the information exactly as printed on your passport.
                    </p>
                  </div>

                  <FieldGroup
                    label="Passport Number *"
                    error={errors.passportNumber}
                  >
                    <Input
                      placeholder="e.g. P123456789"
                      value={form.passportNumber}
                      onChange={(e) =>
                        set("passportNumber")(e.target.value.toUpperCase())
                      }
                      className={`font-mono tracking-wider ${errors.passportNumber ? "border-destructive" : ""}`}
                    />
                  </FieldGroup>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FieldGroup label="Issue Date *" error={errors.issueDate}>
                      <Input
                        type="date"
                        value={form.issueDate}
                        onChange={(e) => set("issueDate")(e.target.value)}
                        max={new Date().toISOString().split("T")[0]}
                        className={errors.issueDate ? "border-destructive" : ""}
                      />
                    </FieldGroup>

                    <FieldGroup label="Expiry Date *" error={errors.expiryDate}>
                      <Input
                        type="date"
                        value={form.expiryDate}
                        onChange={(e) => set("expiryDate")(e.target.value)}
                        min={form.issueDate || undefined}
                        className={
                          errors.expiryDate ? "border-destructive" : ""
                        }
                      />
                    </FieldGroup>
                  </div>

                  {/* Passport visual hint */}
                  <div className="passport-card rounded-xl p-6 mt-4">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <Shield className="w-5 h-5 text-white/80" />
                        <span className="text-white/70 text-xs font-semibold uppercase tracking-widest">
                          Passport
                        </span>
                      </div>
                      <span className="text-white/50 text-xs font-mono">
                        TRAVEL DOCUMENT
                      </span>
                    </div>
                    <div className="space-y-2">
                      <div>
                        <p className="text-white/50 text-[10px] uppercase tracking-widest">
                          Passport No.
                        </p>
                        <p className="text-white font-mono font-bold text-lg tracking-widest">
                          {form.passportNumber || "P000000000"}
                        </p>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-white/50 text-[10px] uppercase tracking-widest">
                            Issued
                          </p>
                          <p className="text-white text-sm font-medium">
                            {form.issueDate || "—"}
                          </p>
                        </div>
                        <div>
                          <p className="text-white/50 text-[10px] uppercase tracking-widest">
                            Expires
                          </p>
                          <p className="text-white text-sm font-medium">
                            {form.expiryDate || "—"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.22 }}
                  className="space-y-5"
                >
                  <div>
                    <h2 className="text-xl font-display font-bold text-foreground">
                      Review & Submit
                    </h2>
                    <p className="text-sm text-muted-foreground mt-1">
                      Please verify all information before submitting.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-2">
                        Personal Information
                      </p>
                      <Card className="border-border">
                        <CardContent className="p-4">
                          <ReviewRow label="Full Name" value={form.fullName} />
                          <ReviewRow
                            label="Date of Birth"
                            value={form.dateOfBirth}
                          />
                          <ReviewRow label="Gender" value={form.gender} />
                          <ReviewRow
                            label="Place of Birth"
                            value={form.placeOfBirth}
                          />
                          <ReviewRow
                            label="Nationality"
                            value={form.nationality}
                          />
                          <ReviewRow label="Address" value={form.address} />
                        </CardContent>
                      </Card>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-2">
                        Passport Details
                      </p>
                      <Card className="border-border">
                        <CardContent className="p-4">
                          <ReviewRow
                            label="Passport Number"
                            value={form.passportNumber}
                          />
                          <ReviewRow
                            label="Issue Date"
                            value={form.issueDate}
                          />
                          <ReviewRow
                            label="Expiry Date"
                            value={form.expiryDate}
                          />
                        </CardContent>
                      </Card>
                    </div>
                  </div>

                  {!isLoggedIn && (
                    <Card className="border-destructive/30 bg-destructive/5">
                      <CardContent className="p-4 flex items-center gap-3">
                        <LogIn className="w-5 h-5 text-destructive shrink-0" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-destructive">
                            Login required
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            You must be logged in to submit this application.
                          </p>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => login()}
                          disabled={isLoggingIn}
                          className="shrink-0"
                        >
                          {isLoggingIn ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            "Login"
                          )}
                        </Button>
                      </CardContent>
                    </Card>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Navigation */}
            <div className="flex justify-between mt-8 pt-6 border-t border-border">
              <Button
                variant="outline"
                onClick={() => setStep((s) => s - 1)}
                disabled={step === 1}
                className="gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>

              {step < 3 ? (
                <Button
                  onClick={handleNext}
                  className="gap-2 bg-primary text-primary-foreground"
                >
                  Continue
                  <ArrowRight className="w-4 h-4" />
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={submitting || !isLoggedIn}
                  className="gap-2 bg-primary text-primary-foreground min-w-[140px]"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Submitting…
                    </>
                  ) : (
                    <>
                      <Shield className="w-4 h-4" />
                      Submit Application
                    </>
                  )}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
