import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  BarChart3,
  CheckCircle2,
  Clock,
  FileText,
  Home,
  Loader2,
  LogIn,
  RefreshCw,
  Shield,
  TrendingUp,
  Users,
  XCircle,
} from "lucide-react";
import { motion } from "motion/react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { UserRole } from "../backend";
import type { ApplicationStats, PassportApplication } from "../backend";
import { useActor } from "../hooks/useActor";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

type FilterTab = "all" | "pending" | "approved" | "rejected";

interface AdminDashboardProps {
  onRoleChange: (role: UserRole) => void;
}

function StatusBadge({ status }: { status: PassportApplication["status"] }) {
  if (status.__kind__ === "Approved") {
    return (
      <span className="inline-flex items-center gap-1 status-approved px-2.5 py-1 rounded-full text-xs font-semibold">
        <CheckCircle2 className="w-3 h-3" />
        Approved
      </span>
    );
  }
  if (status.__kind__ === "Pending") {
    return (
      <span className="inline-flex items-center gap-1 status-pending px-2.5 py-1 rounded-full text-xs font-semibold">
        <Clock className="w-3 h-3" />
        Pending
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 status-rejected px-2.5 py-1 rounded-full text-xs font-semibold">
      <XCircle className="w-3 h-3" />
      Rejected
    </span>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  accent,
  loading,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  accent: string;
  loading: boolean;
}) {
  return (
    <Card className="border-border shadow-card">
      <CardContent className="p-5">
        <div className="flex items-center justify-between mb-3">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center ${accent}`}
          >
            <Icon className="w-5 h-5" />
          </div>
        </div>
        {loading ? (
          <Skeleton className="h-8 w-16 mb-1" />
        ) : (
          <div className="text-2xl font-display font-black text-foreground tracking-tight">
            {value}
          </div>
        )}
        <div className="text-xs text-muted-foreground font-medium mt-0.5">
          {label}
        </div>
      </CardContent>
    </Card>
  );
}

function TableSkeleton() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 5 }, (_, i) => i).map((i) => (
        <div key={i} className="flex gap-4 p-3">
          {Array.from({ length: 6 }, (__, j) => j).map((j) => (
            <Skeleton key={j} className="h-5 flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
}

/** Screen shown when the logged-in user is not an admin */
function NotAdminScreen({
  principal,
  role,
  isAdminAssigned,
  onClaimAdmin,
}: {
  principal: string;
  role: UserRole;
  isAdminAssigned: boolean;
  onClaimAdmin: () => Promise<void>;
}) {
  const [claiming, setClaiming] = useState(false);

  const handleClaim = async () => {
    setClaiming(true);
    try {
      await onClaimAdmin();
    } finally {
      setClaiming(false);
    }
  };

  return (
    <main className="min-h-[80vh] flex items-center justify-center px-4 py-16">
      <div className="max-w-lg w-full space-y-6">
        {/* Role indicator */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-center gap-2"
        >
          <span className="text-sm text-muted-foreground">
            You are logged in as:
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold bg-secondary text-foreground border border-border">
            <Users className="w-3.5 h-3.5" />
            {role === UserRole.guest ? "Guest" : "User"}
          </span>
        </motion.div>

        {/* Principal */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.05 }}
          className="text-center"
        >
          <p className="text-xs text-muted-foreground mb-1">
            Your Principal ID
          </p>
          <code className="text-xs font-mono bg-secondary text-foreground px-3 py-2 rounded-lg inline-block break-all">
            {principal}
          </code>
        </motion.div>

        {/* Claim admin card — only shown when no admin has been assigned yet */}
        {!isAdminAssigned && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 }}
          >
            <Card className="border-primary/30 shadow-card overflow-hidden">
              <div className="px-5 py-4 border-b border-border bg-primary/5">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Shield className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-base font-display font-bold text-foreground">
                      Claim Admin Access
                    </h2>
                    <p className="text-xs text-muted-foreground">
                      No admin has been assigned yet — you can claim it now
                    </p>
                  </div>
                </div>
              </div>
              <CardContent className="p-5 space-y-4">
                <div className="rounded-lg bg-secondary/60 border border-border px-4 py-3 text-sm text-foreground/80 leading-relaxed">
                  No admin has been assigned yet. Click the button below to
                  claim admin access.
                </div>
                <Button
                  onClick={handleClaim}
                  disabled={claiming}
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90 gap-2"
                >
                  {claiming ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Shield className="w-4 h-4" />
                  )}
                  {claiming ? "Claiming Admin Access…" : "Claim Admin Access"}
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Not admin card — shown when admin already exists but this user isn't it */}
        {isAdminAssigned && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="border-border shadow-card overflow-hidden">
              <div className="px-5 py-4 border-b border-border bg-secondary/40">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-destructive/10 flex items-center justify-center">
                    <Shield className="w-4 h-4 text-destructive" />
                  </div>
                  <div>
                    <h2 className="text-base font-display font-bold text-foreground">
                      Not an Admin
                    </h2>
                    <p className="text-xs text-muted-foreground">
                      You do not have administrator privileges
                    </p>
                  </div>
                </div>
              </div>
              <CardContent className="p-5 space-y-4">
                <div className="rounded-lg bg-secondary/60 border border-border px-4 py-3 text-sm text-foreground/80 leading-relaxed">
                  An admin has already been assigned for this app. You are
                  registered as a{" "}
                  <strong className="text-foreground">
                    {role === UserRole.guest ? "Guest" : "Regular User"}
                  </strong>
                  .
                </div>
                <p className="text-xs text-muted-foreground text-center">
                  You can still submit and track your own passport applications
                  from the home page.
                </p>
                <Button
                  asChild
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90 gap-2"
                >
                  <a href="/">
                    <Home className="w-4 h-4" />
                    Go to My Applications
                  </a>
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </main>
  );
}

export function AdminDashboard({ onRoleChange }: AdminDashboardProps) {
  const { actor, isFetching } = useActor();
  const { identity, login, loginStatus } = useInternetIdentity();
  const isLoggedIn = !!identity;
  const isLoggingIn = loginStatus === "logging-in";

  const [role, setRole] = useState<UserRole | null>(null);
  const [checkingRole, setCheckingRole] = useState(false);
  const [adminAssigned, setAdminAssigned] = useState<boolean>(true);
  const [applications, setApplications] = useState<PassportApplication[]>([]);
  const [stats, setStats] = useState<ApplicationStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<FilterTab>("all");

  // Reject dialog state
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectTarget, setRejectTarget] = useState<PassportApplication | null>(
    null,
  );
  const [rejectReason, setRejectReason] = useState("");
  const [rejectLoading, setRejectLoading] = useState(false);

  // Approve action state
  const [approvingId, setApprovingId] = useState<bigint | null>(null);

  const loadData = useCallback(async () => {
    if (!actor) return;
    setLoading(true);
    try {
      const [apps, statsData] = await Promise.all([
        actor.getAllApplications(),
        actor.getStats(),
      ]);
      setApplications(apps);
      setStats(statsData);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load applications");
    } finally {
      setLoading(false);
    }
  }, [actor]);

  const checkRoleStatus = useCallback(async () => {
    if (!isLoggedIn) {
      setRole(null);
      return;
    }
    if (!actor || isFetching) return; // wait for actor to be ready
    setCheckingRole(true);
    try {
      // Register current user and get their role; also check if any admin exists
      const [myRole, adminExists] = await Promise.all([
        actor.selfRegister(),
        actor.isAdminAssigned(),
      ]);
      setRole(myRole);
      setAdminAssigned(adminExists);
      onRoleChange(myRole);
      if (myRole === UserRole.admin) {
        await loadData();
      }
    } catch {
      setRole(UserRole.guest);
    } finally {
      setCheckingRole(false);
    }
  }, [isLoggedIn, actor, isFetching, loadData, onRoleChange]);

  useEffect(() => {
    checkRoleStatus();
  }, [checkRoleStatus]);

  const handleClaimAdmin = async () => {
    if (!actor) return;
    try {
      await actor.claimAdmin();
      // Re-register to refresh the role now that admin claim succeeded
      const newRole = await actor.selfRegister();
      setRole(newRole);
      setAdminAssigned(true);
      onRoleChange(newRole);
      if (newRole === UserRole.admin) {
        toast.success("Admin access claimed successfully!");
        await loadData();
      } else {
        toast.error(
          "Admin claim succeeded but role was not updated — please refresh",
        );
      }
    } catch {
      toast.error("Failed to claim admin access — please try again");
    }
  };

  const handleRefresh = async () => {
    if (!actor) return;
    setRefreshing(true);
    try {
      const [apps, statsData] = await Promise.all([
        actor.getAllApplications(),
        actor.getStats(),
      ]);
      setApplications(apps);
      setStats(statsData);
      toast.success("Data refreshed");
    } catch {
      toast.error("Failed to refresh");
    } finally {
      setRefreshing(false);
    }
  };

  const handleApprove = async (app: PassportApplication) => {
    if (!actor) return;
    setApprovingId(app.id);
    try {
      await actor.approveApplication(app.id);
      toast.success(`Application #${Number(app.id)} approved`);
      await loadData();
    } catch (err) {
      console.error(err);
      toast.error("Failed to approve application");
    } finally {
      setApprovingId(null);
    }
  };

  const handleRejectOpen = (app: PassportApplication) => {
    setRejectTarget(app);
    setRejectReason("");
    setRejectDialogOpen(true);
  };

  const handleRejectConfirm = async () => {
    if (!rejectTarget || !actor) return;
    if (!rejectReason.trim()) {
      toast.error("Please provide a rejection reason");
      return;
    }
    setRejectLoading(true);
    try {
      await actor.rejectApplication(rejectTarget.id, rejectReason.trim());
      toast.success(`Application #${Number(rejectTarget.id)} rejected`);
      setRejectDialogOpen(false);
      await loadData();
    } catch {
      toast.error("Failed to reject application");
    } finally {
      setRejectLoading(false);
    }
  };

  const filteredApps = applications.filter((app) => {
    if (activeTab === "all") return true;
    if (activeTab === "pending") return app.status.__kind__ === "Pending";
    if (activeTab === "approved") return app.status.__kind__ === "Approved";
    if (activeTab === "rejected") return app.status.__kind__ === "Rejected";
    return true;
  });

  const formatDate = (ts: bigint) =>
    new Date(Number(ts) / 1_000_000).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

  // — Not logged in —
  if (!isLoggedIn) {
    return (
      <main className="min-h-[80vh] flex items-center justify-center px-4 py-16">
        <div className="max-w-md w-full text-center">
          <div className="w-20 h-20 rounded-2xl bg-secondary flex items-center justify-center mx-auto mb-6">
            <Shield className="w-10 h-10 text-primary" />
          </div>
          <h2 className="text-3xl font-display font-bold text-foreground mb-2">
            Admin Access
          </h2>
          <p className="text-muted-foreground mb-6">
            Please log in with your Internet Identity to access the admin
            dashboard.
          </p>
          <Button
            size="lg"
            onClick={() => login()}
            disabled={isLoggingIn}
            className="bg-primary text-primary-foreground gap-2"
          >
            {isLoggingIn ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <LogIn className="w-4 h-4" />
            )}
            Login to Continue
          </Button>
        </div>
      </main>
    );
  }

  // — Checking role —
  if (checkingRole || isFetching || role === null) {
    return (
      <main className="min-h-[80vh] flex items-center justify-center px-4">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-3" />
          <p className="text-muted-foreground">Verifying your access level…</p>
        </div>
      </main>
    );
  }

  // — Not admin: show informational / claim screen —
  if (role !== UserRole.admin) {
    return (
      <NotAdminScreen
        principal={identity?.getPrincipal().toString() ?? ""}
        role={role}
        isAdminAssigned={adminAssigned}
        onClaimAdmin={handleClaimAdmin}
      />
    );
  }

  // — Admin dashboard —
  return (
    <main className="min-h-screen py-8 px-4">
      <div className="container max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8"
        >
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
                <BarChart3 className="w-4 h-4 text-primary-foreground" />
              </div>
              <h1 className="text-2xl font-display font-bold text-foreground">
                Admin Dashboard
              </h1>
              <Badge className="bg-accent text-accent-foreground text-xs">
                Admin
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              Manage passport verification applications
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
            className="gap-2 self-start sm:self-auto"
          >
            <RefreshCw
              className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
        >
          <StatCard
            icon={FileText}
            label="Total Applications"
            value={stats ? Number(stats.totalApplications) : "—"}
            accent="bg-info-muted text-info"
            loading={loading}
          />
          <StatCard
            icon={Clock}
            label="Pending Review"
            value={stats ? Number(stats.pendingCount) : "—"}
            accent="bg-warning-muted text-warning"
            loading={loading}
          />
          <StatCard
            icon={CheckCircle2}
            label="Approved"
            value={stats ? Number(stats.approvedCount) : "—"}
            accent="bg-success-muted text-success"
            loading={loading}
          />
          <StatCard
            icon={XCircle}
            label="Rejected"
            value={stats ? Number(stats.rejectedCount) : "—"}
            accent="bg-destructive/10 text-destructive"
            loading={loading}
          />
        </motion.div>

        {/* Approval rate */}
        {stats && Number(stats.totalApplications) > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mb-6"
          >
            <Card className="border-border shadow-xs">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-foreground flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-muted-foreground" />
                    Approval Rate
                  </span>
                  <span className="text-sm font-semibold text-foreground">
                    {Math.round(
                      (Number(stats.approvedCount) /
                        Number(stats.totalApplications)) *
                        100,
                    )}
                    %
                  </span>
                </div>
                <div className="h-2 rounded-full bg-secondary overflow-hidden">
                  <div
                    className="h-full rounded-full bg-success transition-all duration-700"
                    style={{
                      width: `${(Number(stats.approvedCount) / Number(stats.totalApplications)) * 100}%`,
                    }}
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Applications table */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <Card className="border-border shadow-card">
            <CardContent className="p-0">
              <div className="p-4 border-b border-border">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-muted-foreground" />
                    <h2 className="text-base font-display font-bold text-foreground">
                      Applications
                    </h2>
                    <span className="text-xs text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">
                      {filteredApps.length}
                    </span>
                  </div>
                </div>
              </div>

              <Tabs
                value={activeTab}
                onValueChange={(v) => setActiveTab(v as FilterTab)}
                className="w-full"
              >
                <div className="px-4 pt-3 border-b border-border">
                  <TabsList className="h-8 bg-secondary">
                    {(
                      [
                        {
                          value: "all",
                          label: "All",
                          count: applications.length,
                        },
                        {
                          value: "pending",
                          label: "Pending",
                          count: applications.filter(
                            (a) => a.status.__kind__ === "Pending",
                          ).length,
                        },
                        {
                          value: "approved",
                          label: "Approved",
                          count: applications.filter(
                            (a) => a.status.__kind__ === "Approved",
                          ).length,
                        },
                        {
                          value: "rejected",
                          label: "Rejected",
                          count: applications.filter(
                            (a) => a.status.__kind__ === "Rejected",
                          ).length,
                        },
                      ] as const
                    ).map((tab) => (
                      <TabsTrigger
                        key={tab.value}
                        value={tab.value}
                        className="text-xs h-6 px-3 data-[state=active]:bg-card"
                      >
                        {tab.label}
                        <span className="ml-1 text-[10px] text-muted-foreground">
                          {tab.count}
                        </span>
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </div>

                <TabsContent value={activeTab} className="m-0">
                  {loading ? (
                    <div className="p-4">
                      <TableSkeleton />
                    </div>
                  ) : filteredApps.length === 0 ? (
                    <div className="py-16 text-center">
                      <FileText className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
                      <p className="text-sm font-medium text-muted-foreground">
                        No applications found
                      </p>
                      <p className="text-xs text-muted-foreground/60 mt-1">
                        {activeTab === "all"
                          ? "No applications have been submitted yet."
                          : `No ${activeTab} applications.`}
                      </p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="border-border hover:bg-transparent">
                            <TableHead className="text-xs font-semibold text-muted-foreground w-16">
                              ID
                            </TableHead>
                            <TableHead className="text-xs font-semibold text-muted-foreground">
                              Name
                            </TableHead>
                            <TableHead className="text-xs font-semibold text-muted-foreground hidden md:table-cell">
                              Passport No.
                            </TableHead>
                            <TableHead className="text-xs font-semibold text-muted-foreground hidden lg:table-cell">
                              Nationality
                            </TableHead>
                            <TableHead className="text-xs font-semibold text-muted-foreground hidden sm:table-cell">
                              Submitted
                            </TableHead>
                            <TableHead className="text-xs font-semibold text-muted-foreground">
                              Status
                            </TableHead>
                            <TableHead className="text-xs font-semibold text-muted-foreground text-right">
                              Actions
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredApps.map((app) => (
                            <TableRow
                              key={String(app.id)}
                              className="table-row-hover border-border"
                            >
                              <TableCell className="text-xs font-mono text-muted-foreground">
                                #{Number(app.id)}
                              </TableCell>
                              <TableCell>
                                <span className="text-sm font-semibold text-foreground">
                                  {app.fullName}
                                </span>
                              </TableCell>
                              <TableCell className="hidden md:table-cell">
                                <span className="text-xs font-mono text-muted-foreground">
                                  {app.passportNumber}
                                </span>
                              </TableCell>
                              <TableCell className="hidden lg:table-cell">
                                <span className="text-xs text-muted-foreground">
                                  {app.nationality}
                                </span>
                              </TableCell>
                              <TableCell className="hidden sm:table-cell">
                                <span className="text-xs text-muted-foreground">
                                  {formatDate(app.submittedAt)}
                                </span>
                              </TableCell>
                              <TableCell>
                                <StatusBadge status={app.status} />
                              </TableCell>
                              <TableCell className="text-right">
                                {app.status.__kind__ === "Pending" && (
                                  <div className="flex items-center justify-end gap-2">
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => handleApprove(app)}
                                      disabled={approvingId === app.id}
                                      className="text-xs h-7 px-2.5 border-success/40 text-success hover:bg-success-muted hover:text-success hover:border-success/60"
                                    >
                                      {approvingId === app.id ? (
                                        <Loader2 className="w-3 h-3 animate-spin" />
                                      ) : (
                                        <CheckCircle2 className="w-3 h-3 mr-1" />
                                      )}
                                      Approve
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => handleRejectOpen(app)}
                                      className="text-xs h-7 px-2.5 border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive hover:border-destructive/60"
                                    >
                                      <XCircle className="w-3 h-3 mr-1" />
                                      Reject
                                    </Button>
                                  </div>
                                )}
                                {app.status.__kind__ !== "Pending" && (
                                  <span className="text-xs text-muted-foreground/50 italic">
                                    —
                                  </span>
                                )}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Reject Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display">
              Reject Application
            </DialogTitle>
            <DialogDescription>
              You are rejecting application #
              {rejectTarget ? Number(rejectTarget.id) : ""} for{" "}
              <strong>{rejectTarget?.fullName}</strong>. Please provide a
              reason.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-2">
            <Label>Rejection Reason *</Label>
            <Textarea
              placeholder="e.g. Document appears expired. Please resubmit with a valid passport."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={4}
              className="resize-none"
            />
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setRejectDialogOpen(false)}
              disabled={rejectLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleRejectConfirm}
              disabled={rejectLoading || !rejectReason.trim()}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 gap-2"
            >
              {rejectLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <XCircle className="w-4 h-4" />
              )}
              Confirm Rejection
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}
