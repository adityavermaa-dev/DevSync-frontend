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
