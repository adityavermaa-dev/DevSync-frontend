import React from 'react';
import defaultAvatar from '../assests/images/default-user-image.png';
import './UserCard.css';

const intentLabels = {
    cofounder: '🚀 Looking for Co-Founder',
    freelance: '💼 Open to Freelance/Hire',
    opensource: '🤝 Open Source Collaborator',
    mentor: '📚 Seeking Mentor/Mentee',
    networking: '🧑‍💻 Just Networking',
};

const UserCard = ({ user, actions, showEmail = false }) => {
    if (!user) return null;

    const displayPhoto = user.photoUrl || defaultAvatar;
    const displayName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Developer';
    const genderLabel = user.gender
        ? user.gender.charAt(0).toUpperCase() + user.gender.slice(1)
        : null;

    return (
        <div className="user-card">
            {/* ── Photo ── */}
            <div className="user-card-photo">
                <img
                    src={displayPhoto}
                    alt={displayName}
                    onError={(e) => { e.target.src = defaultAvatar; }}
                />
                <div className="user-card-gradient" />
                
                {user.intent && (
                    <div className="user-card-intent-badge">
                        <span className={`intent-tag intent-${user.intent}`}>
                            {intentLabels[user.intent] || user.intent}
                        </span>
                    </div>
                )}
                
                <div className="user-card-identity">
                    <h2 className="user-card-name">
                        {user.firstName || 'Developer'}
                        {user.age && <span className="user-card-age">{user.age}</span>}
                    </h2>
                </div>
            </div>

            {/* ── Body ── */}
            <div className="user-card-body">
                {genderLabel && (
                    <div className="user-card-info-row">
                        {genderIcon}
                        <span>{genderLabel}</span>
                    </div>
                )}
                {showEmail && user.email && (
                    <div className="user-card-info-row">
                        {emailIcon}
                        <span style={{ color: '#6b6b80', fontSize: '0.82rem' }}>{user.email}</span>
                    </div>
                )}
                {user.githubUrl && (
                    <div className="user-card-info-row">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
                        <a href={user.githubUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#8b5cf6', textDecoration: 'none', fontWeight: '700' }}>
                            GitHub Profile
                        </a>
                    </div>
                )}

                {user.about && (
                    <>
                        <div className="user-card-divider" />
                        <div className="user-card-section">
                            <p className="user-card-section-title">About</p>
                            <p className="user-card-about">{user.about}</p>
                        </div>
                    </>
                )}

                {user.skills && user.skills.length > 0 && (
                    <>
                        <div className="user-card-divider" />
                        <div className="user-card-section">
                            <p className="user-card-section-title">Skills</p>
                            <div className="user-card-skills">
                                {user.skills.map((skill, idx) => (
                                    <span key={idx} className="user-card-skill">{skill}</span>
                                ))}
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* ── Actions slot ── */}
            {actions && <div className="user-card-actions">{actions}</div>}
        </div>
    );
};

/* ── Inline SVG Icons ── */
const genderIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
    </svg>
);

const emailIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25H4.5a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5H4.5a2.25 2.25 0 0 0-2.25 2.25m19.5 0-8.953 5.468a1.5 1.5 0 0 1-1.594 0L2.25 6.75" />
    </svg>
);

export default UserCard;
