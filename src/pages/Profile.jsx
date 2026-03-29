import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';
import { BASE_URL } from '../constants/commonData';
import { addUser } from '../redux/userSlice';
import './Profile.css';
import toast from 'react-hot-toast';

const intentLabels = {
    cofounder: '🚀 Looking for Co-Founder',
    freelance: '💼 Open to Freelance/Hire',
    opensource: '🤝 Open Source Collaborator',
    mentor: '📚 Seeking Mentor/Mentee',
    networking: '🧑‍💻 Just Networking',
};

const Profile = () => {
    const user = useSelector(store => store.user);
    const dispatch = useDispatch();

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
    const [loadingData, setLoadingData] = useState(false);

    // Modal
    const [videoToDelete, setVideoToDelete] = useState(null);
    const [deletingVideo, setDeletingVideo] = useState(false);

    useEffect(() => {
        if (user) {
            setForm({
                firstName: user.firstName || '', lastName: user.lastName || '',
                age: user.age || '', gender: user.gender || '',
                about: user.about || '', skills: user.skills || [],
                intent: user.intent || '',
                githubUrl: user.githubUrl || '',
            });
            setPhotoPreview(user.photoUrl || '');
        }
    }, [user]);

    const fetchProfileData = async () => {
        setLoadingData(true);
        try {
            const [myRes, likedRes, projRes] = await Promise.all([
                axios.get(BASE_URL + '/my-videos', { withCredentials: true }).catch(() => ({ data: [] })),
                axios.get(BASE_URL + '/liked-videos', { withCredentials: true }).catch(() => ({ data: [] })),
                axios.get(BASE_URL + '/projects?owner=' + user._id, { withCredentials: true }).catch(() => ({ data: { projects: [] } }))
            ]);
            setMyVideos(myRes.data || []);
            setLikedVideos(likedRes.data || []);
            setMyProjects(projRes.data?.projects || projRes.data || []);
        } catch (error) {
            console.error(error);
            toast.error("Failed to load some profile data");
        } finally {
            setLoadingData(false);
        }
    };

    useEffect(() => {
        if (user && !isEditing) {
            fetchProfileData();
        }
    }, [user, isEditing]);

    useEffect(() => {
        if (!user || isEditing) return;
        const fetchGithub = async () => {
            const username = user.githubUrl ? user.githubUrl.split('/').filter(Boolean).pop() : null;
            if (!username) return;
            try {
                const res = await axios.get(`https://api.github.com/users/${username}/repos?sort=updated&per_page=3`);
                setGithubRepos(res.data);
            } catch (err) {
                console.error("Failed to fetch github repos", err);
            }
        };
        fetchGithub();
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
            setForm({ firstName: user.firstName || '', lastName: user.lastName || '', age: user.age || '', gender: user.gender || '', about: user.about || '', skills: user.skills || [], intent: user.intent || '', githubUrl: user.githubUrl || '' });
            setPhotoPreview(user.photoUrl || '');
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const formData = new FormData();
            formData.append('firstName', form.firstName);
            formData.append('lastName', form.lastName);
            if (form.age) formData.append('age', form.age);
            if (form.gender) formData.append('gender', form.gender);
            if (form.about) formData.append('about', form.about);
            if (form.skills.length > 0) formData.append('skills', JSON.stringify(form.skills));
            if (form.intent) formData.append('intent', form.intent);
            if (form.githubUrl) formData.append('githubUrl', form.githubUrl);
            if (profileImageFile) formData.append('profileImage', profileImageFile);

            await axios.patch(BASE_URL + '/profile/edit', formData, { withCredentials: true, headers: { 'Content-Type': 'multipart/form-data' } });
            const profileRes = await axios.get(BASE_URL + '/profile/view', { withCredentials: true });
            dispatch(addUser(profileRes.data));
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

                        {user.githubUrl && (
                            <a href={user.githubUrl} target="_blank" rel="noopener noreferrer" className="profile-github-link">
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
                        {user.githubUrl && (
                            <button 
                                className={`profile-tab ${activeTab === 'github' ? 'active' : ''}`}
                                onClick={() => setActiveTab('github')}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
                                GitHub
                            </button>
                        )}
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
                                <div className="profile-github-heatmap">
                                    <img 
                                        src={`https://github-readme-activity-graph.vercel.app/graph?username=${user.githubUrl.split('/').filter(Boolean).pop()}&bg_color=transparent&color=8b5cf6&line=8b5cf6&point=3b82f6&hide_border=true`} 
                                        alt="GitHub Activity Graph" 
                                    />
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
                        <label className="profile-field-label">What are you looking for?</label>
                        <div className="profile-intent-selector">
                            {Object.entries(intentLabels).map(([key, label]) => (
                                <button
                                    key={key}
                                    type="button"
                                    className={`profile-intent-option ${form.intent === key ? 'active' : ''}`}
                                    onClick={() => setForm(prev => ({ ...prev, intent: key }))}
                                >
                                    {label}
                                </button>
                            ))}
                        </div>
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
                        <label className="profile-field-label">GitHub URL (Optional)</label>
                        <input className="profile-input" type="url" name="githubUrl" value={form.githubUrl} onChange={handleChange} placeholder="https://github.com/username" />
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