import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Page, Container } from '@/design-system/layout';
import { Card, Button, Badge, EmptyState, Skeleton } from '@/design-system/primitives';
import { Text, Heading } from '@/design-system/typography';
import {
  Users, Calendar, CheckCircle2, Clock, MessageSquare,
  FileText, ChevronDown, ChevronUp, Check, X,
  PlusCircle, ArrowRight, AlertCircle, Inbox
} from 'lucide-react';
import axios from 'axios';
import { BASE_URL } from '@/constants/commonData';
import toast from 'react-hot-toast';
import { useSelector } from 'react-redux';

// ─── Helpers ────────────────────────────────────────────────
const statusVariant = (status) => {
  const map = { ACTIVE: 'success', OPEN: 'success', FORMING: 'accent', CLOSED: 'default', COMPLETED: 'default' };
  return map[status] || 'default';
};

const applicationStatusConfig = {
  PENDING:  { variant: 'warning', icon: Clock,        label: 'Pending' },
  ACCEPTED: { variant: 'success', icon: CheckCircle2, label: 'Accepted' },
  REJECTED: { variant: 'error',   icon: X,            label: 'Rejected' },
};

const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
};

// ─── Skeleton loaders ───────────────────────────────────────
const TeamCardSkeleton = () => (
  <Card className="p-6">
    <div className="flex flex-col gap-4">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <Skeleton className="h-6 w-48 mb-2" />
          <Skeleton className="h-4 w-32" />
        </div>
        <Skeleton className="h-6 w-20 rounded-full" />
      </div>
      <div className="flex gap-6">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-4 w-20" />
      </div>
      <Skeleton className="h-9 w-36" />
    </div>
  </Card>
);

// ─── Main Component ─────────────────────────────────────────
export default function MyTeams() {
  const navigate = useNavigate();
  const user = useSelector(store => store.user);

  // Data
  const [teams, setTeams] = useState([]);
  const [applications, setApplications] = useState([]);
  const [teamsLoading, setTeamsLoading] = useState(true);
  const [appsLoading, setAppsLoading] = useState(true);

  // Incoming applications (per team)
  const [expandedTeamId, setExpandedTeamId] = useState(null);
  const [incomingApps, setIncomingApps] = useState({});
  const [incomingLoading, setIncomingLoading] = useState({});
  const [actionLoading, setActionLoading] = useState({});

  // ── Fetch teams ─────────────────────────────────────────
  useEffect(() => {
    fetchMyTeams();
    fetchMyApplications();
  }, []);

  const fetchMyTeams = async () => {
    try {
      setTeamsLoading(true);
      const res = await axios.get(`${BASE_URL}/api/teams/my-teams`, { withCredentials: true });
      setTeams(res.data);
    } catch (error) {
      console.error('Error fetching teams:', error);
      toast.error('Failed to load your teams.');
    } finally {
      setTeamsLoading(false);
    }
  };

  const fetchMyApplications = async () => {
    try {
      setAppsLoading(true);
      const res = await axios.get(`${BASE_URL}/api/teams/my-applications`, { withCredentials: true });
      setApplications(res.data);
    } catch (error) {
      console.error('Error fetching applications:', error);
      toast.error('Failed to load your applications.');
    } finally {
      setAppsLoading(false);
    }
  };

  // ── Incoming applications ───────────────────────────────
  const toggleIncomingApps = async (teamId) => {
    if (expandedTeamId === teamId) {
      setExpandedTeamId(null);
      return;
    }

    setExpandedTeamId(teamId);

    if (incomingApps[teamId]) return; // already fetched

    try {
      setIncomingLoading(prev => ({ ...prev, [teamId]: true }));
      const res = await axios.get(`${BASE_URL}/api/teams/${teamId}/applications`, { withCredentials: true });
      setIncomingApps(prev => ({ ...prev, [teamId]: res.data }));
    } catch (error) {
      toast.error('Failed to load applications.');
    } finally {
      setIncomingLoading(prev => ({ ...prev, [teamId]: false }));
    }
  };

  const handleApplicationAction = async (teamId, applicationId, action) => {
    const loadingKey = `${teamId}-${applicationId}`;
    try {
      setActionLoading(prev => ({ ...prev, [loadingKey]: action }));
      await axios.post(
        `${BASE_URL}/api/teams/${teamId}/applications/${applicationId}`,
        { action },
        { withCredentials: true }
      );
      toast.success(`Application ${action === 'ACCEPT' ? 'accepted' : 'rejected'}!`);

      // Refresh the specific team's applications
      const res = await axios.get(`${BASE_URL}/api/teams/${teamId}/applications`, { withCredentials: true });
      setIncomingApps(prev => ({ ...prev, [teamId]: res.data }));
      fetchMyTeams(); // refresh counts
    } catch (error) {
      toast.error(error.response?.data?.message || `Failed to ${action.toLowerCase()} application.`);
    } finally {
      setActionLoading(prev => ({ ...prev, [loadingKey]: null }));
    }
  };

  // ── Derived data ────────────────────────────────────────
  const ownerTeamsWithPending = teams.filter(t => t.isOwner && t.pendingApplications > 0);
  const totalPending = ownerTeamsWithPending.reduce((sum, t) => sum + t.pendingApplications, 0);

  // ── Render ──────────────────────────────────────────────
  return (
    <Page>
      {/* Page Header */}
      <div className="border-b border-[var(--border-color)] bg-[var(--bg-secondary)]">
        <Container maxWidth="xl" className="py-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <Heading level={1} className="mb-1">My Teams</Heading>
              <Text variant="muted" size="lg">
                Your personal command center — teams, tasks, and applications at a glance.
              </Text>
            </div>
            <Button variant="primary" onClick={() => navigate('/hackathons')}>
              <PlusCircle size={18} className="mr-2" /> Create Team
            </Button>
          </div>

          {/* Quick Stats */}
          {!teamsLoading && !appsLoading && (
            <div className="flex flex-wrap gap-6 mt-6 pt-6 border-t border-[var(--border-color)]">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <Users size={18} className="text-blue-500" />
                </div>
                <div>
                  <Text weight="bold">{teams.length}</Text>
                  <Text size="xs" variant="muted">Active Teams</Text>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-lg bg-yellow-500/10 flex items-center justify-center">
                  <Clock size={18} className="text-yellow-500" />
                </div>
                <div>
                  <Text weight="bold">{applications.filter(a => a.status === 'PENDING').length}</Text>
                  <Text size="xs" variant="muted">Pending Applications</Text>
                </div>
              </div>
              {totalPending > 0 && (
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-lg bg-red-500/10 flex items-center justify-center">
                    <AlertCircle size={18} className="text-red-500" />
                  </div>
                  <div>
                    <Text weight="bold">{totalPending}</Text>
                    <Text size="xs" variant="muted">Needs Review</Text>
                  </div>
                </div>
              )}
            </div>
          )}
        </Container>
      </div>

      <Container maxWidth="xl" className="py-8">
        <div className="flex flex-col gap-10">

          {/* ━━━ Section 1: Active Teams ━━━ */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <Users size={20} className="text-[var(--color-primary)]" />
              <Heading level={3}>Your Teams</Heading>
              {!teamsLoading && <Badge variant="accent">{teams.length}</Badge>}
            </div>

            {teamsLoading ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {[1, 2, 3].map(i => <TeamCardSkeleton key={i} />)}
              </div>
            ) : teams.length === 0 ? (
              <EmptyState
                icon={<Users size={28} />}
                title="No teams yet"
                description="Join a hackathon and create your first team, or apply to an existing one."
                action={
                  <Button variant="primary" onClick={() => navigate('/hackathons')}>
                    <PlusCircle size={16} className="mr-1.5" /> Browse Hackathons
                  </Button>
                }
              />
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {teams.map(team => (
                  <Card key={team._id} className="p-6 flex flex-col gap-4 hover:border-[var(--color-primary-muted)] transition-colors">
                    {/* Team Header */}
                    <div className="flex justify-between items-start gap-3">
                      <div className="min-w-0">
                        <Heading level={4} className="truncate mb-1">{team.name}</Heading>
                        <Text size="sm" className="text-[var(--text-secondary)] truncate">
                          {team.hackathon?.title || 'Hackathon'}
                        </Text>
                      </div>
                      <Badge variant={statusVariant(team.status)} size="sm">
                        {team.status || 'ACTIVE'}
                      </Badge>
                    </div>

                    {/* Team Metadata */}
                    <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-[var(--text-muted)]">
                      {(team.hackathon?.endDate || team.hackathon?.registrationDeadline) && (
                        <span className="flex items-center gap-1.5">
                          <Calendar size={14} className="text-purple-500" />
                          {formatDate(team.hackathon?.endDate || team.hackathon?.registrationDeadline)}
                        </span>
                      )}
                      <span className="flex items-center gap-1.5">
                        <Users size={14} className="text-blue-500" />
                        {team.memberCount ?? team.members?.length ?? 0}
                        {team.openPositions != null && ` / ${(team.memberCount ?? team.members?.length ?? 0) + team.openPositions}`}
                      </span>
                      {team.remainingTasks != null && team.remainingTasks > 0 && (
                        <span className="flex items-center gap-1.5">
                          <FileText size={14} className="text-orange-500" />
                          {team.remainingTasks} tasks
                        </span>
                      )}
                    </div>

                    {/* Actions Row */}
                    <div className="flex items-center justify-between mt-auto pt-4 border-t border-[var(--border-color)]">
                      <div className="flex items-center gap-2">
                        {team.isOwner && team.pendingApplications > 0 && (
                          <button
                            onClick={() => toggleIncomingApps(team._id)}
                            className="flex items-center gap-1.5 text-xs font-medium text-yellow-500 bg-yellow-500/10 border border-yellow-500/20 rounded-full px-3 py-1 hover:bg-yellow-500/20 transition-colors cursor-pointer"
                          >
                            <MessageSquare size={12} />
                            {team.pendingApplications} pending
                            {expandedTeamId === team._id ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                          </button>
                        )}
                        {team.isOwner && (
                          <Badge variant="outline" size="sm">Owner</Badge>
                        )}
                      </div>
                      <Button variant="primary" size="sm" onClick={() => navigate(`/workspace/${team._id}`)}>
                        Open Workspace <ArrowRight size={14} className="ml-1.5" />
                      </Button>
                    </div>

                    {/* ── Inline Incoming Applications (expanded) ── */}
                    {expandedTeamId === team._id && (
                      <div className="mt-2 bg-[var(--bg-secondary)] rounded-xl p-4 border border-[var(--border-color)]">
                        <Heading level={5} className="mb-3 flex items-center gap-2">
                          <Inbox size={16} className="text-[var(--color-primary)]" />
                          Incoming Applications
                        </Heading>

                        {incomingLoading[team._id] ? (
                          <div className="flex flex-col gap-3">
                            {[1, 2].map(i => (
                              <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-[var(--bg-primary)]">
                                <Skeleton variant="circular" className="w-10 h-10" />
                                <div className="flex-1">
                                  <Skeleton className="h-4 w-32 mb-1" />
                                  <Skeleton className="h-3 w-48" />
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (incomingApps[team._id] || []).length === 0 ? (
                          <Text variant="muted" size="sm">No pending applications.</Text>
                        ) : (
                          <div className="flex flex-col gap-3">
                            {(incomingApps[team._id] || []).map(app => {
                              const loadingKey = `${team._id}-${app._id}`;
                              const isProcessing = actionLoading[loadingKey];
                              return (
                                <div key={app._id} className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-3 rounded-lg bg-[var(--bg-primary)] border border-[var(--border-color)]">
                                  {/* Applicant Info */}
                                  <img
                                    src={app.applicant?.photoUrl || 'https://via.placeholder.com/40'}
                                    alt={app.applicant?.firstName || 'User'}
                                    className="w-10 h-10 rounded-full object-cover border-2 border-[var(--border-color)] shrink-0"
                                  />
                                  <div className="flex-1 min-w-0">
                                    <Text weight="medium" className="truncate">
                                      {app.applicant?.firstName} {app.applicant?.lastName}
                                    </Text>
                                    <Text size="xs" variant="muted" className="truncate">
                                      Applied for: <span className="text-[var(--text-primary)] font-medium">{app.roleAppliedFor}</span>
                                    </Text>
                                    {app.applicant?.skills?.length > 0 && (
                                      <div className="flex flex-wrap gap-1 mt-1">
                                        {app.applicant.skills.slice(0, 4).map((skill, idx) => (
                                          <span key={idx} className="text-[10px] bg-[var(--bg-secondary)] px-1.5 py-0.5 rounded text-[var(--text-secondary)] border border-[var(--border-color)]">
                                            {skill}
                                          </span>
                                        ))}
                                        {app.applicant.skills.length > 4 && (
                                          <span className="text-[10px] text-[var(--text-muted)]">+{app.applicant.skills.length - 4}</span>
                                        )}
                                      </div>
                                    )}
                                  </div>

                                  {/* Actions */}
                                  {app.status === 'PENDING' ? (
                                    <div className="flex gap-2 shrink-0">
                                      <Button
                                        variant="primary"
                                        size="sm"
                                        className="h-8 px-3 text-xs bg-green-600 hover:bg-green-700 border-green-600"
                                        onClick={() => handleApplicationAction(team._id, app._id, 'ACCEPT')}
                                        disabled={!!isProcessing}
                                      >
                                        {isProcessing === 'ACCEPT' ? (
                                          <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        ) : (
                                          <><Check size={14} className="mr-1" /> Accept</>
                                        )}
                                      </Button>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        className="h-8 px-3 text-xs text-red-500 border-red-500/30 hover:bg-red-500/10"
                                        onClick={() => handleApplicationAction(team._id, app._id, 'REJECT')}
                                        disabled={!!isProcessing}
                                      >
                                        {isProcessing === 'REJECT' ? (
                                          <div className="w-3 h-3 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
                                        ) : (
                                          <><X size={14} className="mr-1" /> Reject</>
                                        )}
                                      </Button>
                                    </div>
                                  ) : (
                                    <Badge variant={applicationStatusConfig[app.status]?.variant || 'default'} size="sm">
                                      {applicationStatusConfig[app.status]?.label || app.status}
                                    </Badge>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            )}
          </section>

          {/* ━━━ Section 2: Your Applications ━━━ */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <FileText size={20} className="text-[var(--color-primary)]" />
              <Heading level={3}>Your Applications</Heading>
              {!appsLoading && <Badge variant="accent">{applications.length}</Badge>}
            </div>

            {appsLoading ? (
              <div className="flex flex-col gap-4">
                {[1, 2].map(i => (
                  <Card key={i} className="p-5">
                    <div className="flex items-center gap-4">
                      <Skeleton className="h-5 w-40" />
                      <Skeleton className="h-5 w-20 rounded-full" />
                      <Skeleton className="h-4 w-28 ml-auto" />
                    </div>
                  </Card>
                ))}
              </div>
            ) : applications.length === 0 ? (
              <EmptyState
                icon={<FileText size={28} />}
                title="No applications yet"
                description="When you apply to join a team, your applications will appear here."
                action={
                  <Button variant="outline" onClick={() => navigate('/hackathons')}>
                    Browse Hackathons
                  </Button>
                }
              />
            ) : (
              <div className="flex flex-col gap-4">
                {applications.map(app => {
                  const config = applicationStatusConfig[app.status] || applicationStatusConfig.PENDING;
                  const StatusIcon = config.icon;
                  return (
                    <Card key={app._id} className="p-5 hover:border-[var(--color-primary-muted)] transition-colors">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <Text weight="medium" className="truncate">
                              {app.team?.name || 'Team'}
                            </Text>
                            <span className="text-[var(--text-muted)]">·</span>
                            <Text size="sm" variant="muted" className="truncate">
                              {app.hackathon?.title || app.team?.hackathon?.title || 'Hackathon'}
                            </Text>
                          </div>
                          <div className="flex flex-wrap items-center gap-3">
                            <Text size="sm" className="text-[var(--text-secondary)]">
                              Role: <span className="font-medium text-[var(--text-primary)]">{app.roleAppliedFor}</span>
                            </Text>
                            <Text size="xs" variant="muted" className="flex items-center gap-1">
                              <Calendar size={12} /> Applied {formatDate(app.createdAt)}
                            </Text>
                          </div>
                        </div>

                        <Badge variant={config.variant} className="flex items-center gap-1.5 shrink-0">
                          <StatusIcon size={12} />
                          {config.label}
                        </Badge>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </section>

          {/* ━━━ Section 3: Incoming Applications Summary ━━━ */}
          {ownerTeamsWithPending.length > 0 && (
            <section>
              <div className="flex items-center gap-3 mb-6">
                <MessageSquare size={20} className="text-yellow-500" />
                <Heading level={3}>Needs Your Attention</Heading>
                <Badge variant="warning">{totalPending}</Badge>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {ownerTeamsWithPending.map(team => (
                  <Card
                    key={team._id}
                    interactive
                    className="p-5 cursor-pointer border-yellow-500/20 hover:border-yellow-500/40"
                    onClick={() => toggleIncomingApps(team._id)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <Heading level={5} className="truncate">{team.name}</Heading>
                      <Badge variant="warning" size="sm">{team.pendingApplications}</Badge>
                    </div>
                    <Text size="sm" variant="muted" className="mb-3 truncate">
                      {team.hackathon?.title || 'Hackathon'}
                    </Text>
                    <div className="flex items-center gap-1.5 text-xs text-yellow-500 font-medium">
                      Review Applications
                      <ArrowRight size={12} />
                    </div>
                  </Card>
                ))}
              </div>
            </section>
          )}

        </div>
      </Container>
    </Page>
  );
}
