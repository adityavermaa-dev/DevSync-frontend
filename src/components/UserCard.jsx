import React from 'react';
import defaultAvatar from '../assests/images/default-user-image.png';
import './UserCard.css';

const UserCard = ({ user, actions, showEmail = false, variant = 'default' }) => {
    if (!user) return null;

    const isProfileMode = variant === 'profile';

    const {
        firstName,
        lastName,
        photoUrl,
        age,
        gender,
        about,
        skills,
        githubUrl,
        intent
    } = user;

    const renderIntentBadge = () => {
        if (!intent || intent.length === 0) return null;
        const mainIntent = intent[0];
        
        const intentStyles = {
            'co-founder': 'bg-error/90 text-error-content',
            'freelance': 'bg-success/90 text-success-content',
            'open-source': 'bg-info/90 text-info-content',
            'mentor': 'bg-primary/90 text-primary-content',
            'networking': 'bg-warning/90 text-warning-content'
        };

        const styleClass = intentStyles[mainIntent.toLowerCase()] || 'bg-base-300/90 text-base-content';

        return (
            <div className="absolute top-3 right-3 z-30">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm border border-white/20 backdrop-blur-sm ${styleClass}`}>
                    {mainIntent}
                </span>
            </div>
        );
    };

    return (
        <div className={`flex flex-col w-full bg-base-100 border border-base-200 overflow-hidden text-base-content shadow-xl transition-all duration-300 ${isProfileMode ? 'max-w-full rounded-[28px] border-base-200/50 backdrop-blur-xl bg-base-100/60 shadow-2xl hover:-translate-y-0.5' : 'max-w-[400px] max-h-[min(78vh,690px)] rounded-3xl'}`}>
            <div className={`relative bg-neutral flex-none ${isProfileMode ? 'h-[clamp(230px,30vh,310px)]' : 'h-[clamp(250px,46vh,420px)]'}`}>
                <img
                    src={photoUrl || defaultAvatar}
                    alt={`${firstName} ${lastName}`}
                    className="w-full h-full object-cover object-top block"
                    onError={(e) => { e.target.src = defaultAvatar; }}
                />
                <div className="absolute inset-0 bg-gradient-to-b from-neutral-900/5 via-neutral-900/20 to-neutral-900/80 pointer-events-none"></div>
                
                {renderIntentBadge()}

                <div className="absolute left-4 right-4 bottom-3 z-20">
                    <h2 className="m-0 flex items-baseline gap-2 font-extrabold text-white text-[clamp(1.7rem,3.2vw,2.2rem)] tracking-tight drop-shadow-md">
                        {firstName} {lastName}
                        {age && <span className="text-lg font-bold opacity-90">{age}</span>}
                    </h2>
                    {about && (
                        <p className={`m-0 mt-1 text-white/90 font-medium leading-snug drop-shadow-sm line-clamp-2 ${isProfileMode ? 'text-sm line-clamp-3' : 'text-sm'}`}>
                            {about}
                        </p>
                    )}
                </div>
            </div>

            <div className={`flex flex-col gap-3 flex-auto min-h-0 ${isProfileMode ? 'p-4 bg-transparent' : 'p-3.5 bg-base-100'}`}>
                {(gender) && (
                    <div className="flex flex-wrap gap-1.5">
                        <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-base-200 text-base-content/80 border border-base-300">
                            {gender}
                        </span>
                    </div>
                )}

                {skills && skills.length > 0 && (
                    <div className={`flex flex-wrap gap-1.5 ${isProfileMode ? 'max-h-24 overflow-auto pr-1' : ''}`}>
                        {skills.slice(0, isProfileMode ? skills.length : 5).map((skill, index) => (
                            <span key={index} className="px-2.5 py-1 text-xs font-bold rounded-full bg-primary/10 text-primary border border-primary/20">
                                {skill}
                            </span>
                        ))}
                        {!isProfileMode && skills.length > 5 && (
                            <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-base-200 text-base-content/70 border border-base-300">
                                +{skills.length - 5}
                            </span>
                        )}
                    </div>
                )}

                {githubUrl && (
                    <a
                        href={githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center w-fit px-3 py-1.5 text-xs font-bold rounded-full border border-base-300 text-base-content/70 hover:bg-base-200 hover:text-base-content transition-colors mt-auto"
                    >
                        <svg className="w-4 h-4 mr-1.5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                            <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                        </svg>
                        GitHub Profile
                    </a>
                )}
            </div>

            {actions && (
                <div className="flex-none p-3.5 pt-2.5 border-t border-base-200 bg-base-100/50">
                    {actions}
                </div>
            )}
        </div>
    );
};

export default React.memo(UserCard);
