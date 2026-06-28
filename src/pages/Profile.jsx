import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';
import { BASE_URL } from '../constants/commonData';
import { addUser } from '../redux/userSlice';
import toast from 'react-hot-toast';
import { extractGithubUsername, fetchGithubContributionStats, persistGithubUsername } from '../utils/githubAPI';
import ContributionGraph from '../components/ContributionGraph';
import { Page, Container, Card, Heading, Text, Badge, Button, Avatar, Grid, Input, Textarea, Select } from '@/design-system';
import { Edit2, Folder, Activity, Video, Upload, Heart, Star, Play, Trash2, X } from 'lucide-react';

const Github = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
);
const GitFork = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="18" r="3"></circle><circle cx="6" cy="6" r="3"></circle><circle cx="18" cy="6" r="3"></circle><path d="M18 9v1a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V9"></path><path d="M12 12v3"></path></svg>
);

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
    return msg.includes('invalid field') || msg.includes('not allowed') || msg.includes('unexpected field');
};

const getUserPhotoUrl = (user) => {
    if (!user || typeof user !== 'object') return '';
    return user.photoUrl || user.profileImageUrl || user.avatarUrl || user.photo || '';
};

const getUserCoverPhotoUrl = (user) => {
    if (!user || typeof user !== 'object') return '';
    return user.coverPhotoUrl || user.coverPhoto || user.coverImageUrl || user.coverImage || user.bannerUrl || user.bannerImageUrl || '';
};

const normalizeUserPayload = (payload) => {
    if (!payload || typeof payload !== 'object') return payload;

    const photoUrl = getUserPhotoUrl(payload);
    const coverPhotoUrl = getUserCoverPhotoUrl(payload);

    return {
        ...payload,
        ...(photoUrl ? { photoUrl } : {}),
        ...(coverPhotoUrl ? { coverPhotoUrl } : {}),
    };
};

const getEmbedUrl = (url) => {
    if (!url) return null;
    let embedUrl = url;
    try {
        if (url.includes('youtube.com/watch') || url.includes('youtu.be/')) {
            const videoId = url.includes('youtu.be/') ? url.split('youtu.be/')[1].split('?')[0] : new URLSearchParams(new URL(url).search).get('v');
            embedUrl = `https://www.youtube.com/embed/${videoId}`;
        } else if (url.includes('youtube.com/embed/')) {
            embedUrl = url;
        } else if (url.includes('vimeo.com/')) {
            const videoId = url.split('vimeo.com/')[1].split('?')[0].split('/')[0];
            embedUrl = `https://player.vimeo.com/video/${videoId}`;
        } else if (url.includes('loom.com/share/')) {
            const videoId = url.split('loom.com/share/')[1].split('?')[0];
            embedUrl = `https://www.loom.com/embed/${videoId}`;
        }
    } catch (e) {
        console.error('Invalid URL', e);
    }
    return embedUrl;
};

const Profile = () => {
    const user = useSelector(store => store.user);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [isEditing, setIsEditing] = useState(false);
    const [_saving, setSaving] = useState(false);
    const [newSkill, setNewSkill] = useState('');

    const [showSpotlightModal, setShowSpotlightModal] = useState(false);
    const [spotlightUrlInput, setSpotlightUrlInput] = useState('');
    const [savingSpotlight, setSavingSpotlight] = useState(false);

    const [form, setForm] = useState({
        firstName: '', lastName: '', age: '', gender: '', about: '', skills: [], intent: '', githubUrl: ''
    });

    const [profileImageFile, setProfileImageFile] = useState(null);
    const [_photoPreview, setPhotoPreview] = useState('');
    const [coverPhotoFile, setCoverPhotoFile] = useState(null);
    const [coverPhotoPreview, setCoverPhotoPreview] = useState('');

    const [activeTab, setActiveTab] = useState('projects'); 
    const [myProjects, setMyProjects] = useState([]);
    const [githubRepos, setGithubRepos] = useState([]);
    const [githubLanguageMix, setGithubLanguageMix] = useState([]);
    const [githubStats, setGithubStats] = useState(null);
    const [loadingData, setLoadingData] = useState(false);

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
            setPhotoPreview(getUserPhotoUrl(user));
            setCoverPhotoPreview(getUserCoverPhotoUrl(user));
        }
    }, [user]);

    const fetchProfileData = useCallback(async () => {
        setLoadingData(true);
        try {
            const projRes = await axios.get(BASE_URL + '/projects?owner=' + user._id, { withCredentials: true }).catch(() => ({ data: { projects: [] } }));
            const projectList = normalizeList(projRes?.data, ['projects', 'items']);
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

    const _handleChange = (e) => {
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

    const _handleCoverPhotoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setCoverPhotoFile(file);
            setCoverPhotoPreview(URL.createObjectURL(file));
        }
    };

    const handleAddSkill = () => {
        const skill = newSkill.trim();
        if (skill && !form.skills.includes(skill)) {
            setForm(prev => ({ ...prev, skills: [...prev.skills, skill] }));
            setNewSkill('');
        }
    };

    const _handleSkillKeyDown = (e) => {
        if (e.key === 'Enter') { e.preventDefault(); handleAddSkill(); }
    };

    const _handleRemoveSkill = (skillToRemove) => {
        setForm(prev => ({ ...prev, skills: prev.skills.filter(s => s !== skillToRemove) }));
    };

    const handleCancel = () => {
        setIsEditing(false);
        setProfileImageFile(null);
        setCoverPhotoFile(null);
        if (user) {
            const githubUsername = extractGithubUsername(user) || '';
            setForm({ firstName: user.firstName || '', lastName: user.lastName || '', age: user.age || '', gender: user.gender || '', about: user.about || '', skills: user.skills || [], intent: user.intent || '', githubUrl: githubUsername });
            setPhotoPreview(getUserPhotoUrl(user));
            setCoverPhotoPreview(getUserCoverPhotoUrl(user));
        }
    };

    const _handleSave = async () => {
        setSaving(true);
        try {
            const githubUsername = extractGithubUsername(form.githubUrl);

            const buildPayload = ({ includeGithubField = true, coverFieldName = null } = {}) => {
                const formData = new FormData();
                formData.append('firstName', form.firstName);
                formData.append('lastName', form.lastName);
                if (form.age) formData.append('age', form.age);
                if (form.gender) formData.append('gender', form.gender);
                if (form.about) formData.append('about', form.about);
                if (form.skills.length > 0) formData.append('skills', JSON.stringify(form.skills));
                if (includeGithubField && githubUsername) formData.append('githubUsername', githubUsername);
                if (profileImageFile) formData.append('profileImage', profileImageFile);
                if (coverPhotoFile && coverFieldName) formData.append(coverFieldName, coverPhotoFile);
                return formData;
            };

            const coverFieldCandidates = ['coverPhoto', 'coverImage', 'coverPhotoFile', 'bannerImage'];
            const includeGithubCandidates = [true, false];

            const saveAttemptConfigs = [];

            if (coverPhotoFile) {
                for (const includeGithubField of includeGithubCandidates) {
                    for (const coverFieldName of coverFieldCandidates) {
                        saveAttemptConfigs.push({ includeGithubField, coverFieldName });
                    }
                }
            } else {
                saveAttemptConfigs.push({ includeGithubField: true, coverFieldName: null });
                saveAttemptConfigs.push({ includeGithubField: false, coverFieldName: null });
            }

            let lastInvalidFieldError = null;
            let didSave = false;

            for (const attemptConfig of saveAttemptConfigs) {
                try {
                    await axios.patch(
                        BASE_URL + '/profile/edit',
                        buildPayload(attemptConfig),
                        { withCredentials: true, headers: { 'Content-Type': 'multipart/form-data' } }
                    );
                    lastInvalidFieldError = null;
                    didSave = true;
                    break;
                } catch (error) {
                    if (!isInvalidFieldError(error)) throw error;
                    lastInvalidFieldError = error;
                }
            }

            if (!didSave && lastInvalidFieldError) {
                throw lastInvalidFieldError;
            }

            const profileRes = await axios.get(BASE_URL + '/profile/view', { withCredentials: true });

            const refreshedUserRaw = profileRes?.data?.data?.user || profileRes?.data?.user || profileRes?.data?.data || profileRes?.data;
            const refreshedUser = normalizeUserPayload(refreshedUserRaw);
            const refreshedPhotoUrl = getUserPhotoUrl(refreshedUser);
            const refreshedCoverUrl = getUserCoverPhotoUrl(refreshedUser);

            if (coverPhotoFile && !refreshedCoverUrl) {
                throw new Error('Cover image upload failed. Please verify backend field name for cover image upload.');
            }

            if (profileImageFile && !refreshedPhotoUrl) {
                throw new Error('Profile image upload failed. Please verify backend field name for profile image upload.');
            }

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

    const handleSaveSpotlight = async () => {
        setSavingSpotlight(true);
        try {
            await axios.patch(BASE_URL + '/profile/edit', { spotlightVideoUrl: spotlightUrlInput }, { withCredentials: true });
            dispatch(addUser({ ...user, spotlightVideoUrl: spotlightUrlInput }));
            toast.success("Spotlight video updated");
            setShowSpotlightModal(false);
        } catch (error) {
            console.error(error);
            toast.error("Failed to update spotlight video");
        } finally {
            setSavingSpotlight(false);
        }
    };

    if (!user) {
        return (
            <Page className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
            </Page>
        );
    }

    const githubUsername = extractGithubUsername(user);
    const githubProfileUrl = githubUsername ? `https://github.com/${githubUsername}` : '';
    const userPhotoUrl = getUserPhotoUrl(user);
    const userCoverPhotoUrl = getUserCoverPhotoUrl(user);

    if (!isEditing) {
        return (
            <Page>
                <Container size="xl" className="py-8 space-y-8">
                    {/* Cover & Avatar & Header info */}
                    <div className="relative rounded-2xl overflow-hidden bg-[var(--surface-primary)] border border-[var(--border-subtle)] shadow-sm">
                        {/* Cover Image */}
                        <div 
                            className="h-48 w-full bg-black/5"
                            style={(userCoverPhotoUrl || coverPhotoPreview) ? {
                                backgroundImage: `url(${coverPhotoPreview || userCoverPhotoUrl})`,
                                backgroundSize: 'cover',
                                backgroundPosition: 'center',
                            } : undefined}
                        />
                        {/* Edit Button overlay */}
                        <div className="absolute top-4 right-4">
                            <Button variant="secondary" size="sm" onClick={() => setIsEditing(true)} leftIcon={<Edit2 className="w-4 h-4" />}>
                                Edit Profile
                            </Button>
                        </div>
                        
                        {/* Avatar & Basic Info */}
                        <div className="px-6 sm:px-8 pb-8 flex flex-col sm:flex-row gap-6 relative">
                            <div className="-mt-16 relative">
                                <Avatar 
                                    src={userPhotoUrl || `https://ui-avatars.com/api/?background=e5e7eb&color=374151&bold=true&size=200&name=${user.firstName}`}
                                    alt={user.firstName}
                                    size="2xl"
                                    className="border-4 border-[var(--surface-primary)] shadow-md bg-[var(--surface-primary)]"
                                    style={{ width: '128px', height: '128px' }}
                                />
                            </div>
                            <div className="flex-1 pt-2">
                                <Heading level={2} className="text-2xl font-semibold text-[var(--text-primary)]">
                                    {user.firstName} {user.lastName}
                                </Heading>
                                {user.about && (
                                    <Text className="mt-2 text-[var(--text-secondary)] max-w-3xl leading-relaxed">
                                        {user.about}
                                    </Text>
                                )}
                                
                                <div className="flex flex-wrap items-center gap-3 mt-4">
                                    {githubProfileUrl && (
                                        <a href={githubProfileUrl} target="_blank" rel="noopener noreferrer" className="flex items-center text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
                                            <Github className="w-4 h-4 mr-1.5" />
                                            GitHub
                                        </a>
                                    )}
                                    {user.age && <Badge variant="default">{user.age} yrs</Badge>}
                                    {user.gender && <Badge variant="default">{user.gender.charAt(0).toUpperCase() + user.gender.slice(1)}</Badge>}
                                    {user.intent && <Badge variant="accent">{intentLabels[user.intent] || user.intent}</Badge>}
                                </div>

                                {user.skills?.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mt-4">
                                        {user.skills.map((skill, i) => (
                                            <Badge key={i} variant="skill">{skill}</Badge>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                    
                    {/* Developer Spotlight Section */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <Heading level={3} className="text-xl font-semibold text-[var(--text-primary)]">Developer Spotlight</Heading>
                        </div>
                        <Card className="p-6 border-[var(--border-subtle)]">
                            {user.spotlightVideoUrl ? (
                                <div className="aspect-video w-full max-w-4xl mx-auto rounded-xl overflow-hidden relative bg-black shadow-sm group">
                                    <iframe
                                        src={getEmbedUrl(user.spotlightVideoUrl)}
                                        title="Developer Spotlight"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                        className="absolute inset-0 w-full h-full border-0"
                                    ></iframe>
                                    <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Button variant="secondary" size="sm" onClick={() => {
                                            setSpotlightUrlInput(user.spotlightVideoUrl || '');
                                            setShowSpotlightModal(true);
                                        }}>
                                            Edit Video
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center p-8 text-center border-2 border-dashed border-[var(--border-subtle)] rounded-xl bg-[var(--surface-primary)]">
                                    <div className="text-4xl mb-4 opacity-40">🎬</div>
                                    <Heading level={4} className="text-lg font-medium text-[var(--text-primary)] mb-2">Add a Spotlight Video</Heading>
                                    <Text className="text-[var(--text-secondary)] max-w-md mb-6">
                                        Introduce yourself, showcase a project, or share your developer journey with a YouTube, Vimeo, or Loom video.
                                    </Text>
                                    <Button variant="primary" onClick={() => {
                                        setSpotlightUrlInput('');
                                        setShowSpotlightModal(true);
                                    }}>
                                        Add Spotlight Video
                                    </Button>
                                </div>
                            )}
                        </Card>
                    </div>

                    {/* Tabs */}
                    <div className="flex overflow-x-auto gap-2 border-b border-[var(--border-subtle)] pb-px no-scrollbar">
                        {[
                            { id: 'projects', icon: Folder, label: 'Projects' },
                            { id: 'github', icon: Github, label: 'GitHub' },
                            { id: 'activity', icon: Activity, label: 'Activity' },
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                                    activeTab === tab.id 
                                        ? 'border-[var(--color-primary)] text-[var(--color-primary)]' 
                                        : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border-hover)]'
                                }`}
                            >
                                <tab.icon className="w-4 h-4" />
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Tab Content */}
                    <div className="pt-2 min-h-[400px]">
                        {loadingData ? (
                            <div className="flex justify-center py-20">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--color-primary)]"></div>
                            </div>
                        ) : activeTab === 'projects' ? (
                            <div className="space-y-4">
                                {myProjects.length > 0 ? (
                                    <Grid cols={3} gap="md">
                                        {myProjects.map(proj => (
                                            <Card key={proj._id} className="p-5 cursor-pointer flex flex-col" interactive onClick={() => navigate(`/projects/${proj._id}`)}>
                                                <Heading level={4} className="text-lg font-semibold text-[var(--text-primary)] truncate">{proj.title}</Heading>
                                                <Text className="text-sm font-medium text-[var(--text-muted)] mt-1 capitalize">{proj.status}</Text>
                                                <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-[var(--border-subtle)]">
                                                    {proj.techStack?.slice(0, 3).map((t, i) => (
                                                        <Badge key={i} variant="default" size="sm">{t}</Badge>
                                                    ))}
                                                    {(proj.techStack?.length > 3) && <Badge variant="default" size="sm">+{proj.techStack.length - 3}</Badge>}
                                                </div>
                                            </Card>
                                        ))}
                                    </Grid>
                                ) : (
                                    <Card className="flex flex-col items-center justify-center p-16 text-center border-dashed">
                                        <div className="text-4xl mb-4 opacity-40">🚀</div>
                                        <Heading level={3} className="text-lg font-medium text-[var(--text-primary)]">No projects yet</Heading>
                                        <Text className="text-[var(--text-secondary)] mt-1">Create a project to collaborate with others.</Text>
                                    </Card>
                                )}
                            </div>
                        ) : activeTab === 'github' ? (
                            <div className="space-y-6">
                                {!githubUsername && (
                                    <Card className="flex flex-col items-center justify-center p-16 text-center border-dashed">
                                        <div className="text-4xl mb-4 opacity-40">🐙</div>
                                        <Heading level={3} className="text-lg font-medium text-[var(--text-primary)]">Add GitHub to unlock stats</Heading>
                                        <Text className="text-[var(--text-secondary)] mt-1 max-w-md">Add your GitHub URL in Edit Profile to see contributions, streaks, and repo insights.</Text>
                                    </Card>
                                )}
                                
                                {githubStats && (
                                    <Grid cols={3} gap="md">
                                        <Card className="p-6 flex flex-col justify-center border-[var(--border-subtle)] shadow-sm">
                                            <Text className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-wider mb-2">Total Contributions</Text>
                                            <Heading level={2} className="text-3xl font-bold text-[var(--text-primary)]">{githubStats.totalContributions}</Heading>
                                            <Text className="text-[13px] text-[var(--text-secondary)] mt-2">
                                                {githubStats.activityWindow ? `${formatIsoDate(githubStats.activityWindow.start)} - ${formatIsoDate(githubStats.activityWindow.end)}` : 'No contribution data yet'}
                                            </Text>
                                        </Card>

                                        <Card className="p-6 flex flex-col items-center text-center justify-center bg-black/5 dark:bg-white/5 border-0 shadow-inner">
                                            <Text className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-wider mb-2">Current Streak</Text>
                                            <Heading level={2} className="text-4xl font-bold text-[var(--color-primary)]">{githubStats.currentStreak}</Heading>
                                            <Text className="text-[13px] text-[var(--text-secondary)] mt-2">
                                                {githubStats.currentRange ? `${formatIsoDate(githubStats.currentRange.start)} - ${formatIsoDate(githubStats.currentRange.end)}` : 'No active streak'}
                                            </Text>
                                            <div className="mt-3 text-[13px] font-semibold text-[var(--text-secondary)]">
                                                Longest: {githubStats.longestStreak} days
                                            </div>
                                        </Card>

                                        <Card className="p-6 border-[var(--border-subtle)] shadow-sm">
                                            <Text className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-wider mb-4">Top Languages</Text>
                                            {githubLanguageMix.length > 0 ? (
                                                <div className="space-y-3">
                                                    {githubLanguageMix.map((language) => (
                                                        <div key={language.name}>
                                                            <div className="flex justify-between text-[13px] mb-1.5 font-medium">
                                                                <span className="text-[var(--text-primary)]">{language.name}</span>
                                                                <span className="text-[var(--text-muted)]">{language.percent}%</span>
                                                            </div>
                                                            <div className="w-full h-1.5 bg-black/10 dark:bg-white/10 rounded-full overflow-hidden">
                                                                <div 
                                                                    className="h-full bg-[var(--color-primary)] rounded-full transition-all duration-500 ease-out" 
                                                                    style={{ width: `${Math.max(language.percent, 2)}%` }}
                                                                />
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <Text className="text-sm text-[var(--text-muted)]">No language data found.</Text>
                                            )}
                                        </Card>
                                    </Grid>
                                )}

                                {githubRepos.length > 0 && (
                                    <div>
                                        <Heading level={4} className="text-[15px] font-semibold text-[var(--text-primary)] mb-4">Recent Repositories</Heading>
                                        <Grid cols={3} gap="md">
                                            {githubRepos.map(repo => (
                                                <a key={repo.id} href={repo.html_url} target="_blank" rel="noopener noreferrer" className="block h-full group">
                                                    <Card className="p-5 h-full flex flex-col group-hover:border-[var(--color-primary)] transition-colors" interactive>
                                                        <div className="flex items-center gap-2 text-[var(--text-primary)] font-semibold truncate">
                                                            <Github className="w-4 h-4 shrink-0 text-[var(--text-muted)] group-hover:text-[var(--color-primary)] transition-colors" />
                                                            <span className="truncate">{repo.name}</span>
                                                        </div>
                                                        <Text className="text-sm text-[var(--text-secondary)] mt-2 line-clamp-2 flex-1">
                                                            {repo.description || 'No description available.'}
                                                        </Text>
                                                        <div className="flex items-center gap-4 mt-5 text-[13px] font-medium text-[var(--text-muted)]">
                                                            <div className="flex items-center gap-1.5">
                                                                <Star className="w-3.5 h-3.5" /> {repo.stargazers_count}
                                                            </div>
                                                            <div className="flex items-center gap-1.5">
                                                                <GitFork className="w-3.5 h-3.5" /> {repo.forks_count}
                                                            </div>
                                                            {repo.language && (
                                                                <div className="flex items-center gap-1.5 ml-auto">
                                                                    <div className="w-2 h-2 rounded-full bg-[var(--color-primary)]" />
                                                                    {repo.language}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </Card>
                                                </a>
                                            ))}
                                        </Grid>
                                    </div>
                                )}
                                
                                {githubStats?.note && (
                                    <Text className="text-sm text-[var(--text-muted)] italic">{githubStats.note}</Text>
                                )}
                            </div>
                        ) : activeTab === 'activity' ? (
                            <Card className="p-6 border-[var(--border-subtle)] overflow-hidden">
                                <ContributionGraph />
                            </Card>
                        ) : null}
                    </div>

                    {/* Developer Spotlight Modal */}
                    {showSpotlightModal && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
                            <Card className="w-full max-w-md p-6 animate-in fade-in zoom-in duration-200 shadow-xl border-[var(--border-subtle)] bg-[var(--surface-primary)]">
                                <div className="flex items-center justify-between mb-4">
                                    <Heading level={3} className="text-lg font-semibold text-[var(--text-primary)]">Developer Spotlight Video</Heading>
                                    <Button variant="ghost" size="sm" onClick={() => setShowSpotlightModal(false)}><X className="w-5 h-5" /></Button>
                                </div>
                                <div className="space-y-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[13px] font-medium text-[var(--text-primary)]">Video URL</label>
                                        <Input 
                                            value={spotlightUrlInput} 
                                            onChange={(e) => setSpotlightUrlInput(e.target.value)} 
                                            placeholder="Paste YouTube, Vimeo, or Loom URL" 
                                        />
                                        <Text className="text-xs text-[var(--text-muted)] mt-1">Supports YouTube, Vimeo, and Loom links.</Text>
                                    </div>
                                    <div className="flex justify-end gap-3 mt-6">
                                        <Button variant="secondary" onClick={() => setShowSpotlightModal(false)} disabled={savingSpotlight}>
                                            Cancel
                                        </Button>
                                        <Button variant="primary" onClick={handleSaveSpotlight} loading={savingSpotlight}>
                                            Save Video
                                        </Button>
                                    </div>
                                </div>
                            </Card>
                        </div>
                    )}
                </Container>
            </Page>
        );
    }

    return (
        <Page>
            <Container size="md" className="py-8">
                <Card className="overflow-hidden shadow-sm border-[var(--border-subtle)]">
                    <div className="flex items-center justify-between p-5 sm:p-6 border-b border-[var(--border-subtle)] bg-[var(--surface-primary)]">
                        <Heading level={3} className="text-xl font-semibold text-[var(--text-primary)]">Edit Profile</Heading>
                        <Button variant="ghost" size="sm" onClick={handleCancel}>
                            <X className="w-5 h-5" />
                        </Button>
                    </div>
                    
                    <div className="p-5 sm:p-8 space-y-10 bg-[var(--surface-primary)]">
                        {/* Images */}
                        <div className="space-y-4">
                            <Heading level={4} className="text-sm font-bold tracking-wide text-[var(--text-primary)] uppercase">Images</Heading>
                            <div className="flex flex-col sm:flex-row gap-6 sm:gap-8 items-start">
                                <div className="flex flex-col gap-2">
                                    <Text className="text-xs font-medium text-[var(--text-muted)]">Profile Photo</Text>
                                    <label className="relative cursor-pointer group">
                                        <Avatar 
                                            src={_photoPreview || userPhotoUrl || `https://ui-avatars.com/api/?background=e5e7eb&color=374151&bold=true&size=200&name=${form.firstName}`}
                                            alt="Profile"
                                            size="xl"
                                            className="border border-[var(--border-subtle)] group-hover:opacity-75 transition-opacity"
                                            style={{ width: '100px', height: '100px' }}
                                        />
                                        <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30 rounded-full backdrop-blur-[2px]">
                                            <Upload className="w-6 h-6 text-white drop-shadow-md" />
                                        </div>
                                    </label>
                                </div>
                                
                                <div className="flex flex-col gap-2 flex-1 w-full">
                                    <Text className="text-xs font-medium text-[var(--text-muted)]">Cover Photo</Text>
                                    <label className="relative cursor-pointer group h-[100px] w-full rounded-xl overflow-hidden border border-[var(--border-subtle)] bg-black/5 dark:bg-white/5 flex items-center justify-center">
                                        {(coverPhotoPreview || userCoverPhotoUrl) ? (
                                            <img src={coverPhotoPreview || userCoverPhotoUrl} alt="Cover" className="w-full h-full object-cover group-hover:opacity-75 transition-opacity" />
                                        ) : (
                                            <span className="text-sm font-medium text-[var(--text-muted)]">Upload cover image</span>
                                        )}
                                        <input type="file" accept="image/*" onChange={_handleCoverPhotoChange} className="hidden" />
                                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30 backdrop-blur-[2px]">
                                            <Upload className="w-6 h-6 text-white drop-shadow-md" />
                                        </div>
                                    </label>
                                </div>
                            </div>
                        </div>

                        {/* Basic Info */}
                        <div className="space-y-4">
                            <Heading level={4} className="text-sm font-bold tracking-wide text-[var(--text-primary)] uppercase">Basic Info</Heading>
                            <Grid cols={2} gap="md">
                                <div className="space-y-1.5">
                                    <label className="text-[13px] font-medium text-[var(--text-primary)]">First Name</label>
                                    <Input name="firstName" value={form.firstName} onChange={_handleChange} placeholder="First Name" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[13px] font-medium text-[var(--text-primary)]">Last Name</label>
                                    <Input name="lastName" value={form.lastName} onChange={_handleChange} placeholder="Last Name" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[13px] font-medium text-[var(--text-primary)]">Age</label>
                                    <Input type="number" name="age" value={form.age} onChange={_handleChange} placeholder="Age" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[13px] font-medium text-[var(--text-primary)]">Gender</label>
                                    <Select name="gender" value={form.gender} onChange={_handleChange}>
                                        <option value="">Select Gender</option>
                                        <option value="male">Male</option>
                                        <option value="female">Female</option>
                                        <option value="other">Other</option>
                                    </Select>
                                </div>
                            </Grid>
                        </div>

                        {/* About & Links */}
                        <div className="space-y-4">
                            <Heading level={4} className="text-sm font-bold tracking-wide text-[var(--text-primary)] uppercase">About & Links</Heading>
                            <div className="space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-[13px] font-medium text-[var(--text-primary)]">Bio</label>
                                    <Textarea 
                                        name="about" 
                                        value={form.about} 
                                        onChange={_handleChange} 
                                        placeholder="Tell us about yourself..." 
                                        rows={4} 
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[13px] font-medium text-[var(--text-primary)]">GitHub Username or URL</label>
                                    <Input 
                                        name="githubUrl" 
                                        value={form.githubUrl} 
                                        onChange={_handleChange} 
                                        placeholder="e.g. torvalds or https://github.com/torvalds" 
                                        leftIcon={<Github className="w-4 h-4" />}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Career Info */}
                        <div className="space-y-4">
                            <Heading level={4} className="text-sm font-bold tracking-wide text-[var(--text-primary)] uppercase">Career Info</Heading>
                            <div className="space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-[13px] font-medium text-[var(--text-primary)]">Intent</label>
                                    <Select name="intent" value={form.intent} onChange={_handleChange}>
                                        <option value="">What are you looking for?</option>
                                        {Object.entries(intentLabels).map(([key, label]) => (
                                            <option key={key} value={key}>{label}</option>
                                        ))}
                                    </Select>
                                </div>
                                
                                <div className="space-y-1.5">
                                    <label className="text-[13px] font-medium text-[var(--text-primary)]">Skills</label>
                                    <div className="flex gap-2">
                                        <Input 
                                            value={newSkill}
                                            onChange={(e) => setNewSkill(e.target.value)}
                                            onKeyDown={_handleSkillKeyDown}
                                            placeholder="Add a skill (e.g. React, Node.js)"
                                        />
                                        <Button type="button" onClick={handleAddSkill} variant="secondary" fullWidth={false}>Add</Button>
                                    </div>
                                    {form.skills.length > 0 && (
                                        <div className="flex flex-wrap gap-2 mt-3 p-3 bg-black/5 dark:bg-white/5 rounded-lg border border-[var(--border-subtle)] min-h-[48px]">
                                            {form.skills.map((skill) => (
                                                <Badge key={skill} variant="skill" className="flex items-center gap-1 pl-2.5 pr-1.5 py-1 text-[13px]">
                                                    {skill}
                                                    <button 
                                                        type="button"
                                                        onClick={() => _handleRemoveSkill(skill)}
                                                        className="text-[var(--text-muted)] hover:text-red-500 focus:outline-none transition-colors rounded-full p-0.5 ml-1 bg-black/5 dark:bg-white/5 hover:bg-red-500/10"
                                                    >
                                                        <X className="w-3 h-3" />
                                                    </button>
                                                </Badge>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-end gap-3 p-5 sm:p-6 border-t border-[var(--border-subtle)] bg-[var(--surface-elevated)]">
                        <Button variant="ghost" onClick={handleCancel} disabled={_saving}>
                            Cancel
                        </Button>
                        <Button variant="primary" onClick={_handleSave} loading={_saving}>
                            Save Changes
                        </Button>
                    </div>
                </Card>
            </Container>
        </Page>
    );
};

export default Profile;