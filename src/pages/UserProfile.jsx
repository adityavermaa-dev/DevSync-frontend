import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import UserCard from '../components/UserCard';
import axios from 'axios';
import './UserProfile.css';

const UserProfile = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const user = location.state?.user;

    const [repos, setRepos] = useState([]);
    const [loadingRepos, setLoadingRepos] = useState(false);

    useEffect(() => {
        const fetchRepos = async () => {
            const username = user?.githubUsername || (user?.githubUrl ? user.githubUrl.split('/').pop() : null);
            if (!username) return;
            
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
            <div className="userprofile-content">
                <div className="up-card-wrapper">
                    <UserCard user={user} />
                </div>
                
                {(user.githubUsername || user.githubUrl) && (
                    <div className="up-github-section animate-fade-in">
                        <h3 className="up-section-title">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
                            GitHub Activity & Repositories
                        </h3>

                        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px', background: 'var(--dashboard-surface-alt)', border: '1px solid var(--dashboard-border)', borderRadius: '20px', padding: '20px', boxShadow: '0 8px 20px rgba(0,0,0,0.04)' }}>
                            <img 
                                src={`https://github-readme-activity-graph.vercel.app/graph?username=${(user?.githubUsername || (user?.githubUrl ? user.githubUrl.split('/').filter(Boolean).pop() : ''))}&bg_color=transparent&color=8b5cf6&line=8b5cf6&point=3b82f6&hide_border=true`} 
                                alt="GitHub Activity Graph" 
                                style={{ width: '100%', maxWidth: '600px', height: 'auto' }}
                            />
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
                                            <span style={{color: '#f59e0b'}}>⭐ {repo.stargazers_count}</span>
                                            <span style={{color: '#34d399'}}>🍴 {repo.forks_count}</span>
                                            {repo.language && <span className="up-repo-lang">{repo.language}</span>}
                                        </div>
                                    </a>
                                ))}
                            </div>
                        ) : (
                            <p className="up-github-empty">No public repositories found.</p>
                        )}
                    </div>
                )}
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
