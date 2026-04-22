import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import UserCard from '../components/UserCard';
import axios from 'axios';
import { BASE_URL } from '../constants/commonData';
import './UserProfile.css';
import { extractGithubUsername, fetchGithubActivity, summarizeGithubEvent } from '../utils/githubAPI';

const getIdString = (value) => {
    if (!value) return '';
    if (typeof value === 'string') return value;
    if (typeof value === 'object') return String(value._id || value.id || '');
    return '';
};

const idEquals = (a, b) => String(a || '') === String(b || '');

const normalizeArrayPayload = (payload) => {
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.data)) return payload.data;
    if (Array.isArray(payload?.data?.data)) return payload.data.data;
    if (Array.isArray(payload?.data?.projects)) return payload.data.projects;
    if (Array.isArray(payload?.projects)) return payload.projects;
    if (Array.isArray(payload?.data?.items)) return payload.data.items;
    return [];
};

const normalizeUserPayload = (payload) => {
    if (!payload) return null;
    if (payload?._id) return payload;
    if (payload?.user?._id) return payload.user;
    if (payload?.fromUserId?._id) return payload.fromUserId;
    if (payload?.userId?._id) return payload.userId;
    if (payload?.data?._id) return payload.data;
    if (payload?.data?.user?._id) return payload.data.user;
    if (payload?.data?.data?._id) return payload.data.data;
    if (payload?.data?.data?.user?._id) return payload.data.data.user;
    return null;
};

const extractGithubFromUserLike = (userLike) => {
    if (!userLike || typeof userLike !== 'object') {
        return { githubUsername: '', githubUrl: '' };
    }

    const githubUsername = userLike.githubUsername
        || userLike.github_user
        || userLike?.github?.username
        || userLike?.github?.user
        || userLike?.github?.handle
        || userLike?.social?.githubUsername
        || userLike?.social?.github?.username
        || userLike?.social?.github?.handle
        || userLike?.profiles?.githubUsername
        || userLike?.profiles?.github?.username
        || '';

    const githubUrl = userLike.githubUrl
        || userLike.github_url
        || userLike.github
        || userLike.githubProfile
        || userLike?.social?.github
        || userLike?.social?.githubUrl
        || userLike?.social?.github?.url
        || userLike?.socialLinks?.github
        || userLike?.socialLinks?.githubUrl
        || userLike?.links?.github
        || userLike?.links?.githubUrl
        || userLike?.profiles?.github
        || userLike?.profiles?.githubUrl
        || '';

    return { githubUsername, githubUrl };
};

const mergeUserData = (baseUser, incomingUser) => {
    if (!incomingUser) return baseUser;
    if (!baseUser) return incomingUser;

    const merged = { ...baseUser, ...incomingUser };
    const incomingGithub = extractGithubFromUserLike(incomingUser);
    const baseGithub = extractGithubFromUserLike(baseUser);
    merged.skills = Array.isArray(incomingUser.skills) && incomingUser.skills.length > 0
        ? incomingUser.skills
        : (Array.isArray(baseUser.skills) ? baseUser.skills : []);
    merged.about = incomingUser.about || baseUser.about || '';
    merged.githubUrl = incomingGithub.githubUrl || baseGithub.githubUrl || '';
    merged.githubUsername = incomingGithub.githubUsername || baseGithub.githubUsername || '';
    return merged;
};

const findMatchingUserInList = (list, targetUserId) => {
    for (const item of list) {
        const candidates = [
            item,
            item?.user,
            item?.userId,
            item?.member,
            item?.memberId,
            item?.fromUserId,
            item?.toUserId,
            item?.owner,
        ];

        if (Array.isArray(item?.members)) {
            item.members.forEach((member) => {
                candidates.push(member?.user || member);
            });
        }

        for (const candidate of candidates) {
            const normalizedUser = normalizeUserPayload(candidate);
            if (normalizedUser?._id && idEquals(normalizedUser._id, targetUserId)) {
                return normalizedUser;
            }
        }
    }
    return null;
};

const UserProfile = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { userId } = useParams();
    const sessionUser = useSelector((store) => store.user);
    const routeStateUser = location.state?.user || null;
    const [user, setUser] = useState(location.state?.user || null);
    const [loadingUser, setLoadingUser] = useState(true);

    const [repos, setRepos] = useState([]);
    const [loadingRepos, setLoadingRepos] = useState(false);
    const [githubEvents, setGithubEvents] = useState([]);
    const [loadingEvents, setLoadingEvents] = useState(false);
    const [graphFailed, setGraphFailed] = useState(false);
    const [devsyncStats, setDevsyncStats] = useState({
        projectsOwned: 0,
        projectsContributed: 0,
        reelsPublished: 0,
    });
    const [loadingDevsync, setLoadingDevsync] = useState(false);

    useEffect(() => {
        let cancelled = false;

        const fetchRealUserProfile = async () => {
            if (!userId) {
                if (!cancelled) setLoadingUser(false);
                return;
            }

            const validFallbackUser = routeStateUser?._id && idEquals(routeStateUser._id, userId)
                ? routeStateUser
                : null;

            const isSelfProfile = sessionUser?._id && idEquals(sessionUser._id, userId);

            if (isSelfProfile) {
                try {
                    const res = await axios.get(`${BASE_URL}/profile/view`, { withCredentials: true });
                    const selfUser = normalizeUserPayload(res?.data) || sessionUser;
                    if (!cancelled) {
                        setUser(mergeUserData(validFallbackUser, selfUser));
                        setLoadingUser(false);
                    }
                    return;
                } catch {
                    if (!cancelled) {
                        setUser(sessionUser || null);
                        setLoadingUser(false);
                    }
                    return;
                }
            }

            let resolvedUser = validFallbackUser;

            try {
                const res = await axios.get(`${BASE_URL}/user/${userId}`, { withCredentials: true });
                const candidateUser = normalizeUserPayload(res?.data);
                if (candidateUser?._id && idEquals(candidateUser._id, userId)) {
                    resolvedUser = mergeUserData(resolvedUser, candidateUser);
                }
            } catch {
                // Keep route-state fallback when direct user lookup is unavailable.
            }

            if (!cancelled) {
                const sessionFallbackUser = sessionUser?._id && idEquals(sessionUser._id, userId)
                    ? sessionUser
                    : null;

                setUser(mergeUserData(sessionFallbackUser || validFallbackUser, resolvedUser));
                setLoadingUser(false);
            }
        };

        setLoadingUser(true);
        fetchRealUserProfile();

        return () => {
            cancelled = true;
        };
    }, [userId, routeStateUser, sessionUser]);

    useEffect(() => {
        const fetchRepos = async () => {
            const username = extractGithubUsername(user);
            if (!username) {
                setRepos([]);
                setLoadingRepos(false);
                return;
            }
            
            setLoadingRepos(true);
            try {
                const res = await axios.get(`https://api.github.com/users/${username}/repos?sort=updated&per_page=4`);
                setRepos(res.data);
            } catch (err) {
                console.error("Failed to fetch github repos", err);
            } finally {
                setLoadingRepos(false);
            }
        };
        fetchRepos();
    }, [user]);

    useEffect(() => {
        const username = extractGithubUsername(user);
        if (!username) {
            setGithubEvents([]);
            setLoadingEvents(false);
            return;
        }

        const controller = new AbortController();
        setLoadingEvents(true);
        fetchGithubActivity(username, { perPage: 6, signal: controller.signal })
            .then((events) => setGithubEvents(Array.isArray(events) ? events : []))
            .catch((err) => {
                if (controller.signal.aborted) return;
                console.error('Failed to fetch github activity', err);
                setGithubEvents([]);
            })
            .finally(() => {
                if (!controller.signal.aborted) setLoadingEvents(false);
            });

        return () => controller.abort();
    }, [user]);

    useEffect(() => {
        const fetchDevsyncActivity = async () => {
            if (!userId) return;
            setLoadingDevsync(true);

            try {
                const [projectsRes, reelsRes] = await Promise.all([
                    axios.get(`${BASE_URL}/projects`, { withCredentials: true }).catch(() => ({ data: [] })),
                    axios.get(`${BASE_URL}/feed`, { withCredentials: true }).catch(() => ({ data: [] })),
                ]);

                const projects = normalizeArrayPayload(projectsRes?.data);
                const reels = normalizeArrayPayload(reelsRes?.data);

                const projectsOwned = projects.filter((project) => idEquals(getIdString(project?.owner), userId)).length;
                const projectsContributed = projects.filter((project) => {
                    if (!Array.isArray(project?.members)) return false;
                    return project.members.some((member) => idEquals(getIdString(member?.user || member), userId));
                }).length;
                const reelsPublished = reels.filter((reel) => idEquals(getIdString(reel?.userId), userId)).length;

                setDevsyncStats({
                    projectsOwned,
                    projectsContributed,
                    reelsPublished,
                });
            } catch {
                setDevsyncStats({
                    projectsOwned: 0,
                    projectsContributed: 0,
                    reelsPublished: 0,
                });
            } finally {
                setLoadingDevsync(false);
            }
        };

        fetchDevsyncActivity();
    }, [userId]);

    if (loadingUser) {
        return (
            <div className="userprofile-page">
                <p style={{ color: '#666' }}>Loading user profile...</p>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="userprofile-page">
                <p style={{ color: '#666' }}>User not found.</p>
                <button className="userprofile-back" onClick={() => navigate(-1)}>
                    {backIcon}
                    Go back
                </button>
            </div>
        );
    }

    return (
        <div className="userprofile-page">
            <button className="userprofile-back" onClick={() => navigate(-1)}>
                {backIcon}
                Back
            </button>

            <div className="userprofile-header animate-fade-in">
                <p className="userprofile-kicker">Member Snapshot</p>
                <h1 className="userprofile-title">
                    {user.firstName || 'Developer'} {user.lastName || ''}
                </h1>
                <p className="userprofile-subtitle">
                    Skills, GitHub footprint, and DevSync contribution overview.
                </p>
            </div>

            <div className="userprofile-content">
                <aside className="up-left-col">
                    <div className="up-card-wrapper">
                        <UserCard user={user} variant="profile" />
                    </div>
                </aside>

                <section className="up-right-col">
                    <div className="up-devsync-section animate-fade-in">
                        <h3 className="up-section-title">DevSync Activity</h3>
                        <p className="up-section-subtitle">How this member contributes inside DevSync.</p>
                        {loadingDevsync ? (
                            <p className="up-devsync-empty">Loading DevSync activity...</p>
                        ) : (
                            <div className="up-stats-grid">
                                <div className="up-stat-card">
                                    <span className="up-stat-value">{devsyncStats.projectsOwned}</span>
                                    <span className="up-stat-label">Projects Led</span>
                                </div>
                                <div className="up-stat-card">
                                    <span className="up-stat-value">{devsyncStats.projectsContributed}</span>
                                    <span className="up-stat-label">Projects Joined</span>
                                </div>
                                <div className="up-stat-card">
                                    <span className="up-stat-value">{devsyncStats.reelsPublished}</span>
                                    <span className="up-stat-label">Reels Published</span>
                                </div>
                                <div className="up-stat-card">
                                    <span className="up-stat-value">{Array.isArray(user.skills) ? user.skills.length : 0}</span>
                                    <span className="up-stat-label">Skills Listed</span>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="up-github-section animate-fade-in">
                        <h3 className="up-section-title">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
                            GitHub Activity & Repositories
                        </h3>
                        <p className="up-section-subtitle">Recent open-source work and repository highlights.</p>

                        {!extractGithubUsername(user) && (
                            <p className="up-github-empty">No GitHub profile linked for this user yet.</p>
                        )}

                        <div className="up-github-visual">
                            {!graphFailed && extractGithubUsername(user) && (
                                <img 
                                    src={`https://github-readme-activity-graph.vercel.app/graph?username=${extractGithubUsername(user)}&bg_color=transparent&color=8b5cf6&line=8b5cf6&point=3b82f6&hide_border=true`} 
                                    alt="GitHub Activity Graph" 
                                    className="up-github-graph"
                                    onError={() => setGraphFailed(true)}
                                />
                            )}

                            {(graphFailed || !extractGithubUsername(user)) && (
                                <div className="up-activity-fallback">
                                    <h4 className="up-activity-title">Recent GitHub Activity</h4>
                                    {loadingEvents ? (
                                        <p className="up-activity-empty">Loading activity...</p>
                                    ) : githubEvents.length > 0 ? (
                                        <div className="up-activity-list">
                                            {githubEvents.slice(0, 5).map((ev) => (
                                                <div key={ev.id} className="up-activity-item">
                                                    {summarizeGithubEvent(ev)}
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="up-activity-empty">No recent public events found.</p>
                                    )}
                                </div>
                            )}
                        </div>
                        
                        {loadingRepos ? (
                            <p className="up-github-loading">Loading repositories...</p>
                        ) : repos.length > 0 ? (
                            <div className="up-repos-grid">
                                {repos.map(repo => (
                                    <a key={repo.id} href={repo.html_url} target="_blank" rel="noopener noreferrer" className="up-repo-card">
                                        <h4 className="up-repo-name">{repo.name}</h4>
                                        <p className="up-repo-desc">{repo.description || 'No description available.'}</p>
                                        <div className="up-repo-meta">
                                            <span className="up-repo-stars">* {repo.stargazers_count}</span>
                                            <span className="up-repo-forks">Fork {repo.forks_count}</span>
                                            {repo.language && <span className="up-repo-lang">{repo.language}</span>}
                                        </div>
                                    </a>
                                ))}
                            </div>
                        ) : (
                            <p className="up-github-empty">No public repositories found.</p>
                        )}
                    </div>
                </section>
            </div>
        </div>
    );
};

const backIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
    </svg>
);

export default UserProfile;
