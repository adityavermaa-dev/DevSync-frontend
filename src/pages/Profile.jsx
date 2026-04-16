import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';
import { BASE_URL } from '../constants/commonData';
import { addUser } from '../redux/userSlice';
import './Profile.css';
import toast from 'react-hot-toast';
import { extractGithubUsername, fetchGithubActivity, fetchGithubContributionStats, persistGithubUsername, summarizeGithubEvent } from '../utils/githubAPI';

const intentLabels = {
    cofounder: '🚀 Looking for Co-Founder',
    freelance: '💼 Open to Freelance/Hire',
    opensource: '🤝 Open Source Collaborator',
    mentor: '📚 Seeking Mentor/Mentee',
    networking: '🧑‍💻 Just Networking',
};

const normalizeList = (payload, keys = []) => {
    if (Array.isArray(payload)) return payload;
    if (payload && typeof payload === 'object') {
        for (const key of keys) {
            if (Array.isArray(payload[key])) return payload[key];
        }
        if (payload.data && Array.isArray(payload.data)) return payload.data;
    }
    return [];
};

const getIdString = (value) => {
    if (!value) return '';
    if (typeof value === 'string') return value;
    if (typeof value === 'object') return String(value._id || value.id || '');
    return '';
};

const isUserPartOfProject = (project, userId) => {
    if (!project || !userId) return false;

    const ownerId = getIdString(project.owner);
    if (ownerId && ownerId === userId) return true;

    const memberIds = Array.isArray(project.members)
        ? project.members.map((member) => getIdString(member?.user || member))
        : [];

    return memberIds.includes(userId);
};

const formatIsoDate = (isoDate) => {
    if (!isoDate) return '-';
    const date = new Date(`${isoDate}T00:00:00Z`);
    if (Number.isNaN(date.getTime())) return '-';
    return date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
};

const computeLanguageMix = (repos, limit = 3) => {
    if (!Array.isArray(repos) || repos.length === 0) return [];

    const weights = new Map();
    repos.forEach((repo) => {
        const language = repo?.language;
        if (!language) return;
        const weight = Number(repo?.size) > 0 ? Number(repo.size) : 1;
        weights.set(language, (weights.get(language) || 0) + weight);
    });

    const total = Array.from(weights.values()).reduce((sum, value) => sum + value, 0);
    if (!total) return [];

    return Array.from(weights.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, limit)
        .map(([name, weight]) => ({
            name,
            percent: Math.round((weight / total) * 100),
        }));
};

const isInvalidFieldError = (error) => {
    const msg = String(error?.response?.data?.message || '').toLowerCase();
    return msg.includes('invalid field') || msg.includes('not allowed');
};

const Profile = () => {
    const user = useSelector(store => store.user);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [isEditing, setIsEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [newSkill, setNewSkill] = useState('');

    const [form, setForm] = useState({
        firstName: '', lastName: '', age: '', gender: '', about: '', skills: [], intent: '', githubUrl: ''
    });

    const [profileImageFile, setProfileImageFile] = useState(null);
    const [photoPreview, setPhotoPreview] = useState('');

    // Tabs Data
    const [activeTab, setActiveTab] = useState('my_videos'); // 'my_videos' | 'liked_videos' | 'projects'
    const [myVideos, setMyVideos] = useState([]);
    const [likedVideos, setLikedVideos] = useState([]);
    const [myProjects, setMyProjects] = useState([]);
    const [githubRepos, setGithubRepos] = useState([]);
    const [githubLanguageMix, setGithubLanguageMix] = useState([]);
    const [githubEvents, setGithubEvents] = useState([]);
    const [githubStats, setGithubStats] = useState(null);
    const [githubGraphFailed, setGithubGraphFailed] = useState(false);
    const [loadingData, setLoadingData] = useState(false);

    // Modal
    const [videoToDelete, setVideoToDelete] = useState(null);
    const [deletingVideo, setDeletingVideo] = useState(false);

    const hasAnyVideos = myVideos.length > 0 || likedVideos.length > 0;

    useEffect(() => {
        if (user) {
            const githubUsername = extractGithubUsername(user) || '';
            setForm({
                firstName: user.firstName || '', lastName: user.lastName || '',
                age: user.age || '', gender: user.gender || '',
                about: user.about || '', skills: user.skills || [],
                intent: user.intent || '',
                githubUrl: githubUsername,
            });
            setPhotoPreview(user.photoUrl || '');
        }
    }, [user]);

    const fetchProfileData = useCallback(async () => {
        setLoadingData(true);
        try {
            const [myRes, likedRes, projRes] = await Promise.all([
                axios.get(BASE_URL + '/my-videos', { withCredentials: true }).catch(() => ({ data: [] })),
                axios.get(BASE_URL + '/liked-videos', { withCredentials: true }).catch(() => ({ data: [] })),
                axios.get(BASE_URL + '/projects?owner=' + user._id, { withCredentials: true }).catch(() => ({ data: { projects: [] } }))
            ]);

            const myVideoList = normalizeList(myRes?.data, ['videos', 'myVideos', 'items']);
            const likedVideoList = normalizeList(likedRes?.data, ['videos', 'likedVideos', 'items']);
            const projectList = normalizeList(projRes?.data, ['projects', 'items']);

            setMyVideos(myVideoList);
            setLikedVideos(likedVideoList);
            setMyProjects(projectList.filter((project) => isUserPartOfProject(project, String(user?._id || ''))));
        } catch (error) {
            console.error(error);
            toast.error("Failed to load some profile data");
        } finally {
            setLoadingData(false);
        }
    }, [user?._id]);

    useEffect(() => {
        if (user && !isEditing) {
            fetchProfileData();
        }
    }, [user, isEditing, fetchProfileData]);

    useEffect(() => {
        if (!hasAnyVideos && (activeTab === 'my_videos' || activeTab === 'liked_videos')) {
            setActiveTab('projects');
        }
    }, [activeTab, hasAnyVideos]);

    useEffect(() => {
        if (!user || isEditing) return;
        const fetchGithub = async () => {
            const username = extractGithubUsername(user);
            if (!username) {
                setGithubRepos([]);
                setGithubStats(null);
                return;
            }
            try {
                const [reposRes, stats] = await Promise.all([
                    axios.get(`https://api.github.com/users/${username}/repos?sort=updated&per_page=50`),
                    fetchGithubContributionStats(username, { maxPages: 3 }),
                ]);

                const repos = Array.isArray(reposRes?.data) ? reposRes.data : [];
                setGithubRepos(repos.slice(0, 6));
                setGithubLanguageMix(computeLanguageMix(repos, 3));
                setGithubStats(stats);
            } catch (err) {
                console.error("Failed to fetch github repos", err);
                setGithubRepos([]);
                setGithubLanguageMix([]);
                setGithubStats(null);
            }
        };
        fetchGithub();
    }, [user, isEditing]);

    useEffect(() => {
        if (!user || isEditing) return;
        const username = extractGithubUsername(user);
        if (!username) {
            setGithubEvents([]);
            return;
        }

        const controller = new AbortController();
        fetchGithubActivity(username, { perPage: 6, signal: controller.signal })
            .then((events) => setGithubEvents(Array.isArray(events) ? events : []))
            .catch((err) => {
                if (controller.signal.aborted) return;
                console.error('Failed to fetch github activity', err);
                setGithubEvents([]);
            });

        return () => controller.abort();
    }, [user, isEditing]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setProfileImageFile(file);
            setPhotoPreview(URL.createObjectURL(file));
        }
    };

    const handleAddSkill = () => {
        const skill = newSkill.trim();
        if (skill && !form.skills.includes(skill)) {
            setForm(prev => ({ ...prev, skills: [...prev.skills, skill] }));
            setNewSkill('');
        }
    };

    const handleSkillKeyDown = (e) => {
        if (e.key === 'Enter') { e.preventDefault(); handleAddSkill(); }
    };

    const handleRemoveSkill = (skillToRemove) => {
        setForm(prev => ({ ...prev, skills: prev.skills.filter(s => s !== skillToRemove) }));
    };

    const handleCancel = () => {
        setIsEditing(false);
        setProfileImageFile(null);
        if (user) {
            const githubUsername = extractGithubUsername(user) || '';
            setForm({ firstName: user.firstName || '', lastName: user.lastName || '', age: user.age || '', gender: user.gender || '', about: user.about || '', skills: user.skills || [], intent: user.intent || '', githubUrl: githubUsername });
            setPhotoPreview(user.photoUrl || '');
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const githubUsername = extractGithubUsername(form.githubUrl);

            const buildPayload = (includeGithubField = true) => {
                const formData = new FormData();
                formData.append('firstName', form.firstName);
                formData.append('lastName', form.lastName);
                if (form.age) formData.append('age', form.age);
                if (form.gender) formData.append('gender', form.gender);
                if (form.about) formData.append('about', form.about);
                if (form.skills.length > 0) formData.append('skills', JSON.stringify(form.skills));
                if (includeGithubField && githubUsername) formData.append('githubUsername', githubUsername);
                if (profileImageFile) formData.append('profileImage', profileImageFile);
                return formData;
            };

            try {
                await axios.patch(BASE_URL + '/profile/edit', buildPayload(true), { withCredentials: true, headers: { 'Content-Type': 'multipart/form-data' } });
            } catch (error) {
                if (!(githubUsername && isInvalidFieldError(error))) throw error;
                // Backend may reject github fields. Save remaining profile fields and keep GitHub locally.
                await axios.patch(BASE_URL + '/profile/edit', buildPayload(false), { withCredentials: true, headers: { 'Content-Type': 'multipart/form-data' } });
            }

            const profileRes = await axios.get(BASE_URL + '/profile/view', { withCredentials: true });

            const refreshedUser = profileRes?.data?.data || profileRes?.data;
            if (githubUsername) {
                persistGithubUsername(githubUsername, refreshedUser?._id || refreshedUser?.id || user?._id);
            }

            const hydratedUser = (!extractGithubUsername(refreshedUser) && githubUsername)
                ? {
                    ...refreshedUser,
                    githubUsername,
                    githubUrl: `https://github.com/${githubUsername}`,
                }
                : refreshedUser;

            dispatch(addUser(hydratedUser));
            toast.success('Profile updated!');
            setIsEditing(false);
        } catch (error) {
            const msg = error?.response?.data?.message || error?.response?.data || 'Failed to update profile';
            toast.error(typeof msg === 'string' ? msg : 'Something went wrong');
        } finally { setSaving(false); }
    };

    const handleDeleteVideoConfirm = async () => {
        if (!videoToDelete) return;
        setDeletingVideo(true);
        try {
            await axios.delete(`${BASE_URL}/${videoToDelete._id}`, { withCredentials: true });
            toast.success("Video deleted");
            setMyVideos(prev => prev.filter(v => v._id !== videoToDelete._id));
            setVideoToDelete(null);
        } catch (error) {
            console.error(error);
            toast.error("Failed to delete video");
        } finally {
            setDeletingVideo(false);
        }
    };

    if (!user) {
        return <div className="profile-page"><div className="profile-loading"><span className="profile-spinner" /></div></div>;
    }

    const currentVideos = activeTab === 'my_videos' ? myVideos : likedVideos;
    const githubUsername = extractGithubUsername(user);
    const githubProfileUrl = githubUsername ? `https://github.com/${githubUsername}` : '';

    /* ── View Mode ── */
    if (!isEditing) {
        return (
            <div className="profile-page">
                <div className="profile-card-view">
                    {/* Hero Cover */}
                    <div className="profile-hero">
                        <div className="profile-header-actions">
                            <button className="profile-edit-btn" onClick={() => setIsEditing(true)}>
                                {editIcon}
                                Edit Profile
                            </button>
                        </div>
                    </div>

                    {/* Avatar & Info */}
                    <div className="profile-info-section">
                        <div className="profile-avatar-wrap">
                            <img
                                src={user.photoUrl || `https://ui-avatars.com/api/?background=e5e7eb&color=374151&bold=true&size=200&name=${user.firstName}`}
                                alt={user.firstName}
                                className="profile-avatar-img"
                                onError={(e) => { e.target.src = `https://ui-avatars.com/api/?background=e5e7eb&color=374151&bold=true&size=200&name=${user.firstName}`; }}
                            />
                        </div>
                        <h1 className="profile-name">{user.firstName} {user.lastName}</h1>
                        {user.about && <p className="profile-bio">{user.about}</p>}

                        {githubProfileUrl && (
                            <a href={githubProfileUrl} target="_blank" rel="noopener noreferrer" className="profile-github-link">
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
                                GitHub
                            </a>
                        )}
                        
                        <div className="profile-badges">
                            {user.age && (
                                <span className="profile-badge">
                                    {user.age} yrs
                                </span>
                            )}
                            {user.gender && (
                                <span className="profile-badge">
                                    {user.gender.charAt(0).toUpperCase() + user.gender.slice(1)}
                                </span>
                            )}
                        </div>

                        {user.intent && (
                            <div className="profile-intent-badge-wrap">
                                <span className={`profile-intent-badge intent-${user.intent}`}>
                                    {intentLabels[user.intent] || user.intent}
                                </span>
                            </div>
                        )}

                        {user.skills?.length > 0 && (
                            <div className="profile-skills-wrap">
                                {user.skills.map((skill, i) => (
                                    <span key={i} className="profile-skill-pill">{skill}</span>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Tabs */}
                    <div className="profile-tabs">
                        <button 
                            className={`profile-tab ${activeTab === 'projects' ? 'active' : ''}`}
                            onClick={() => setActiveTab('projects')}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M14.25 9.75 16.5 12l-2.25 2.25m-4.5 0L7.5 12l2.25-2.25M6 20.25h12A2.25 2.25 0 0 0 20.25 18V6A2.25 2.25 0 0 0 18 3.75H6A2.25 2.25 0 0 0 3.75 6v12A2.25 2.25 0 0 0 6 20.25Z" />
                            </svg>
                            Projects
                        </button>
                        <button 
                            className={`profile-tab ${activeTab === 'github' ? 'active' : ''}`}
                            onClick={() => setActiveTab('github')}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
                            GitHub
                        </button>
                        {hasAnyVideos && (
                            <>
                                <button 
                                    className={`profile-tab ${activeTab === 'my_videos' ? 'active' : ''}`}
                                    onClick={() => setActiveTab('my_videos')}
                                >
                                    {videoGridIcon}
                                    My Videos
                                </button>
                                <button 
                                    className={`profile-tab ${activeTab === 'liked_videos' ? 'active' : ''}`}
                                    onClick={() => setActiveTab('liked_videos')}
                                >
                                    {heartSolidIcon}
                                    Liked
                                </button>
                            </>
                        )}
                    </div>

                    {/* Content Grid */}
                    <div className="profile-content-wrap">
                        {loadingData ? (
                            <div className="profile-loading"><span className="profile-spinner" style={{borderColor: 'rgba(0,0,0,0.1)', borderTopColor: '#8b5cf6'}} /></div>
                        ) : activeTab === 'projects' ? (
                            <div className="profile-projects-list">
                                {myProjects.length > 0 ? (
                                    <div className="profile-projects-grid">
                                        {myProjects.map(proj => (
                                            <div key={proj._id} className="profile-proj-card" onClick={() => navigate(`/projects/${proj._id}`)}>
                                                <h4>{proj.title}</h4>
                                                <p className="proj-status">{proj.status}</p>
                                                <div className="proj-techs">
                                                    {proj.techStack?.slice(0, 3).map((t, i) => <span key={i}>{t}</span>)}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="profile-empty-state">
                                        <div style={{opacity: 0.5, transform: 'scale(1.5)', marginBottom: '10px'}}>🚀</div>
                                        <h3>No projects yet</h3>
                                        <p>Create a project to collaborate with others.</p>
                                    </div>
                                )}
                            </div>
                        ) : activeTab === 'github' ? (
                            <div className="profile-github-section">
                                {!githubUsername && (
                                    <div className="profile-empty-state" style={{ width: '100%', minHeight: 180 }}>
                                        <div style={{ opacity: 0.5, transform: 'scale(1.4)', marginBottom: '10px' }}>🐙</div>
                                        <h3>Add GitHub to unlock stats</h3>
                                        <p>Add your GitHub URL in Edit Profile to see contributions, streaks, and repo insights.</p>
                                    </div>
                                )}
                                {githubStats && (
                                    <div className="profile-github-legacy-grid">
                                        <div className="profile-legacy-card">
                                            <p className="profile-legacy-kicker">Legacy</p>
                                            <h4 className="profile-legacy-title">Total Contributions</h4>
                                            <div className="profile-legacy-total">{githubStats.totalContributions}</div>
                                            <p className="profile-legacy-range">
                                                {githubStats.activityWindow
                                                    ? `${formatIsoDate(githubStats.activityWindow.start)} - ${formatIsoDate(githubStats.activityWindow.end)}`
                                                    : 'No contribution data yet'}
                                            </p>
                                        </div>

                                        <div className="profile-legacy-card profile-legacy-card-center">
                                            <div className="profile-streak-crown">♛</div>
                                            <div className="profile-streak-ring-wrap">
                                                <div className="profile-streak-ring">
                                                    <span>{githubStats.currentStreak}</span>
                                                </div>
                                            </div>
                                            <p className="profile-legacy-kicker">Current Streak</p>
                                            <p className="profile-legacy-muted">
                                                {githubStats.currentRange
                                                    ? `${formatIsoDate(githubStats.currentRange.start)} - ${formatIsoDate(githubStats.currentRange.end)}`
                                                    : 'No active streak'}
                                            </p>
                                            <div className="profile-longest-strip">
                                                <strong>Longest Streak</strong>
                                                <span>{githubStats.longestStreak}</span>
                                            </div>
                                        </div>

                                        <div className="profile-legacy-card">
                                            <p className="profile-legacy-kicker">The Arsenal</p>
                                            {githubLanguageMix.length > 0 ? (
                                                <div className="profile-arsenal-list">
                                                    {githubLanguageMix.map((language, index) => (
                                                        <div key={language.name} className="profile-arsenal-item">
                                                            <div className="profile-arsenal-head">
                                                                <span>{language.name}</span>
                                                                <strong>{language.percent}%</strong>
                                                            </div>
                                                            <div className="profile-arsenal-bar-track">
                                                                <div
                                                                    className={`profile-arsenal-bar-fill tier-${index + 1}`}
                                                                    style={{ width: `${Math.max(language.percent, 6)}%` }}
                                                                />
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <p className="profile-legacy-muted">No language data found.</p>
                                            )}
                                        </div>
                                    </div>
                                )}

                                <div className="profile-github-heatmap">
                                    {!githubGraphFailed && extractGithubUsername(user) && (
                                        <img 
                                            src={`https://github-readme-activity-graph.vercel.app/graph?username=${extractGithubUsername(user)}&bg_color=transparent&color=8b5cf6&line=8b5cf6&point=3b82f6&hide_border=true`} 
                                            alt="GitHub Activity Graph" 
                                            onError={() => setGithubGraphFailed(true)}
                                        />
                                    )}

                                    {(githubGraphFailed || !extractGithubUsername(user)) && (
                                        <div style={{ width: '100%', padding: '18px 16px', borderRadius: '16px', border: '1px solid var(--dashboard-border)', background: 'var(--dashboard-surface-alt)' }}>
                                            <h3 style={{ margin: 0, color: 'var(--dashboard-text-main)', fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: '1.05rem' }}>Recent GitHub Activity</h3>
                                            {githubEvents.length > 0 ? (
                                                <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                                    {githubEvents.slice(0, 5).map((ev) => (
                                                        <div key={ev.id} style={{ color: 'var(--dashboard-text-secondary)', fontWeight: 600, fontSize: '0.9rem' }}>
                                                            {summarizeGithubEvent(ev)}
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <p style={{ marginTop: '10px', marginBottom: 0, color: 'var(--dashboard-text-faint)', fontWeight: 600 }}>
                                                    No recent public events found.
                                                </p>
                                            )}
                                        </div>
                                    )}
                                </div>
                                <h3 style={{ alignSelf: 'flex-start', margin: '10px 0 0', color: 'var(--dashboard-text-main)', fontFamily: "'Outfit', sans-serif" }}>Recent Repositories</h3>
                                {githubRepos.length > 0 ? (
                                    <div className="profile-github-repos-grid">
                                        {githubRepos.map(repo => (
                                            <a key={repo.id} href={repo.html_url} target="_blank" rel="noopener noreferrer" className="profile-repo-card">
                                                <h4 className="profile-repo-name">
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
                                                    {repo.name}
                                                </h4>
                                                <p className="profile-repo-desc">{repo.description || 'No description available.'}</p>
                                                <div className="profile-repo-meta">
                                                    <span style={{color: '#f59e0b'}}>⭐ {repo.stargazers_count}</span>
                                                    <span>🍴 {repo.forks_count}</span>
                                                    {repo.language && <span className="profile-repo-lang">{repo.language}</span>}
                                                </div>
                                            </a>
                                        ))}
                                    </div>
                                ) : (
                                    <p style={{ color: 'var(--dashboard-text-faint)' }}>No public repositories found.</p>
                                )}
                                {githubStats?.note && (
                                    <p className="profile-github-stats-note">{githubStats.note}</p>
                                )}
                            </div>
                        ) : (
                            <div className="profile-video-list-wrap">
                                {currentVideos.length > 0 ? (
                                    <div className="profile-video-grid">
                                        {currentVideos.map((video) => (
                                            <div key={video._id} className="profile-video-item">
                                                <img src={video.thumbnail || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop"} alt="Reel thumbnail" />
                                                
                                                <div className="profile-video-overlay">
                                                    <div className="profile-video-stats">
                                                        <span className="profile-video-stat">{playIcon} {video.views || 0}</span>
                                                        <span className="profile-video-stat">{heartIcon} {video.likesCount || 0}</span>
                                                    </div>
                                                </div>

                                                {activeTab === 'my_videos' && (
                                                    <div className="profile-video-actions">
                                                        <button 
                                                            className="profile-delete-video-btn" 
                                                            onClick={(e) => { e.stopPropagation(); setVideoToDelete(video); }}
                                                            title="Delete Video"
                                                        >
                                                            {trashIcon}
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="profile-empty-state">
                                        <div style={{opacity: 0.5, transform: 'scale(1.5)', marginBottom: '10px'}}>{videoGridIcon}</div>
                                        <h3>No videos found</h3>
                                        <p>{activeTab === 'my_videos' ? "Upload your first reel to see it here!" : "Videos you like will appear here."}</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                </div>

                {/* Delete Video Modal */}
                {videoToDelete && (
                    <div className="profile-modal-overlay">
                        <div className="profile-modal">
                            <h3>Delete Video?</h3>
                            <p>Are you sure you want to delete this video? This action cannot be undone.</p>
                            <div className="profile-modal-actions">
                                <button className="profile-modal-btn profile-modal-cancel" onClick={() => setVideoToDelete(null)} disabled={deletingVideo}>
                                    Cancel
                                </button>
                                <button className="profile-modal-btn profile-modal-confirm" onClick={handleDeleteVideoConfirm} disabled={deletingVideo}>
                                    {deletingVideo ? 'Deleting...' : 'Delete'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    /* ── Edit Mode ── */
    return (
        <div className="profile-page">
            <div className="profile-edit-layout">
                {/* Edit Form */}
                <div className="profile-edit-header">
                    <h2 className="profile-edit-title">Edit Profile</h2>
                    <button className="profile-edit-close" onClick={handleCancel}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                <div className="profile-edit-body">
                    <div className="profile-field">
                        <label className="profile-field-label">Profile Photo</label>
                        <label className="profile-photo-upload">
                            <input type="file" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />
                            <div className="profile-photo-dropzone">
                                {photoPreview ? (
                                    <img src={photoPreview} alt="" className="profile-photo-thumb" />
                                ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5Z" /></svg>
                                )}
                                <span>Click to change photo</span>
                            </div>
                        </label>
                    </div>

                    <div className="profile-field-row">
                        <div className="profile-field">
                            <label className="profile-field-label">First Name</label>
                            <input className="profile-input" name="firstName" value={form.firstName} onChange={handleChange} placeholder="John" />
                        </div>
                        <div className="profile-field">
                            <label className="profile-field-label">Last Name</label>
                            <input className="profile-input" name="lastName" value={form.lastName} onChange={handleChange} placeholder="Doe" />
                        </div>
                    </div>

                    <div className="profile-field-row">
                        <div className="profile-field">
                            <label className="profile-field-label">Age</label>
                            <input className="profile-input" name="age" type="number" min="13" max="120" value={form.age} onChange={handleChange} placeholder="25" />
                        </div>
                        <div className="profile-field">
                            <label className="profile-field-label">Gender</label>
                            <select className="profile-input profile-select" name="gender" value={form.gender} onChange={handleChange}>
                                <option value="">Select</option>
                                <option value="male">Male</option>
                                <option value="female">Female</option>
                                <option value="other">Other</option>
                            </select>
                        </div>
                    </div>

                    <div className="profile-field">
                        <label className="profile-field-label">About</label>
                        <textarea className="profile-input profile-textarea" name="about" value={form.about} onChange={handleChange} placeholder="Tell the world about yourself..." rows={3} />
                    </div>

                    <div className="profile-field">
                        <label className="profile-field-label">Skills</label>
                        <div className="profile-skills-edit-wrap">
                            {form.skills.map((skill, idx) => (
                                <span key={idx} className="profile-skill-chip editable" onClick={() => handleRemoveSkill(skill)} title="Click to remove">
                                    {skill}
                                    <span className="profile-skill-remove">×</span>
                                </span>
                            ))}
                        </div>
                        <div className="profile-skill-add-row">
                            <input className="profile-input" value={newSkill} onChange={(e) => setNewSkill(e.target.value)} onKeyDown={handleSkillKeyDown} placeholder="React, Python..." style={{ flex: 1 }} />
                            <button type="button" className="profile-skill-add-btn" onClick={handleAddSkill}>+ Add</button>
                        </div>
                    </div>

                    <div className="profile-field">
                        <label className="profile-field-label">GitHub Username or URL (Optional)</label>
                        <input className="profile-input" type="text" name="githubUrl" value={form.githubUrl} onChange={handleChange} placeholder="username or https://github.com/username" />
                    </div>
                </div>

                <div className="profile-edit-actions">
                    <button className="profile-btn profile-btn-cancel" onClick={handleCancel} disabled={saving}>Cancel</button>
                    <button className="profile-btn profile-btn-save" onClick={handleSave} disabled={saving}>
                        {saving && <span className="profile-spinner" />}
                        {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </div>
        </div>
    );
};

/* ── Icons ── */
const editIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Z" />
    </svg>
);

const videoGridIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z" />
    </svg>
);

const heartIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
    </svg>
);

const heartSolidIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="m11.645 20.91-.007-.003-.022-.012a15.247 15.247 0 0 1-.383-.218 25.18 25.18 0 0 1-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0 1 12 5.052 5.5 5.5 0 0 1 16.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 0 1-4.244 3.17 15.247 15.247 0 0 1-.383.219l-.022.012-.007.004-.003.001a.752.752 0 0 1-.704 0l-.003-.001Z" />
    </svg>
);

const playIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
        <path fillRule="evenodd" d="M4.5 5.653c0-1.427 1.529-2.33 2.779-1.643l11.54 6.347c1.295.712 1.295 2.573 0 3.286L7.28 19.99c-1.25.687-2.779-.217-2.779-1.643V5.653Z" clipRule="evenodd" />
    </svg>
);

const trashIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
    </svg>
);

export default Profile;