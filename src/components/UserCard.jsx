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

const intentLabelsShort = {
    cofounder: 'Co-Founder',
    freelance: 'Freelance',
    opensource: 'Open Source',
    mentor: 'Mentor',
    networking: 'Networking',
};

const getUserPhotoUrl = (user) => {
    if (!user || typeof user !== 'object') return defaultAvatar;
    return user.photoUrl || user.profileImageUrl || user.avatarUrl || user.photo || defaultAvatar;
};

const UserCard = ({ user, actions, showEmail = false }) => {
    if (!user) return null;

    const displayPhoto = getUserPhotoUrl(user);
    const displayName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Developer';
    const visibleSkills = Array.isArray(user.skills) ? user.skills.slice(0, 6) : [];
    const remainingSkillsCount = Array.isArray(user.skills) && user.skills.length > 6 ? user.skills.length - 6 : 0;
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
                    {user.about && (
                        <p className="user-card-tagline">{user.about}</p>
                    )}
                </div>
            </div>

            {/* ── Body ── */}
            <div className="user-card-body">
                <div className="user-card-meta-row">
                    {genderLabel && <span className="user-card-pill">{genderLabel}</span>}
                    {user.intent && <span className="user-card-pill">{intentLabelsShort[user.intent] || user.intent}</span>}
                    {showEmail && user.email && <span className="user-card-pill">Email</span>}
                </div>

                {user.skills && user.skills.length > 0 && (
                    <>
                        <div className="user-card-skills">
                            {visibleSkills.map((skill, idx) => (
                                <span key={idx} className="user-card-skill">{skill}</span>
                            ))}
                            {remainingSkillsCount > 0 && (
                                <span className="user-card-skill user-card-skill-more">+{remainingSkillsCount}</span>
                            )}
                        </div>
                    </>
                )}

                {user.githubUrl && (
                    <a className="user-card-github" href={user.githubUrl} target="_blank" rel="noopener noreferrer">
                        View GitHub
                    </a>
                )}
            </div>

            {/* ── Actions slot ── */}
            {actions && <div className="user-card-actions">{actions}</div>}
        </div>
    );
};

export default UserCard;
