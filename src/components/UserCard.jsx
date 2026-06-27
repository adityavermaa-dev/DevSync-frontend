import React from 'react';
import defaultAvatar from '../assests/images/default-user-image.png';
import { Card, Stack, Avatar, Text, Heading, Badge } from '@/design-system';
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

const UserCard = ({ user, actions, showEmail = false, variant = 'default' }) => {
    if (!user) return null;

    const displayPhoto = getUserPhotoUrl(user);
    const displayName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Developer';
    const visibleSkills = Array.isArray(user.skills) ? user.skills.slice(0, 5) : [];
    const remainingSkillsCount = Array.isArray(user.skills) && user.skills.length > 5 ? user.skills.length - 5 : 0;
    
    // For MatchScore UI if passed as a top match from feed logic
    const matchScore = user.matchScore;

    return (
        <Card className={`relative flex flex-col overflow-hidden border-[var(--border-subtle)] ${variant === 'profile' ? 'w-full shadow-none' : 'w-full max-w-sm shadow-xl'}`} variant="elevated">
            {/* Top Identity Section */}
            <div className="relative pt-8 pb-4 px-6 flex flex-col items-center bg-[var(--surface-sunken)] border-b border-[var(--border-subtle)]">
                {matchScore && (
                    <div className="absolute top-4 right-4 bg-green-500/10 border border-green-500/20 text-green-500 font-bold px-2 py-1 rounded-full text-xs">
                        {matchScore}% Match
                    </div>
                )}
                
                <Avatar src={displayPhoto} alt={displayName} size="xl" className="border-4 border-[var(--surface-primary)] shadow-sm mb-4" />
                
                <Stack spacing="xs" className="text-center items-center">
                    <Heading level={3} className="text-xl font-bold flex items-center gap-2">
                        {displayName}
                        {user.age && <span className="text-[var(--text-muted)] text-base font-normal">, {user.age}</span>}
                    </Heading>
                    
                    {user.about ? (
                        <Text className="text-[var(--text-secondary)] text-sm max-w-[250px] line-clamp-2">
                            {user.about}
                        </Text>
                    ) : (
                        <Text className="text-[var(--text-muted)] text-sm italic">
                            No bio provided
                        </Text>
                    )}
                </Stack>
            </div>

            {/* Content Section */}
            <div className="flex-1 p-6 flex flex-col gap-5 bg-[var(--surface-primary)]">
                {/* Intent & Availability */}
                <div className="flex flex-wrap justify-center gap-2">
                    {user.intent && (
                        <Badge variant="primary" className="bg-purple-500/10 text-purple-400 border-purple-500/20">
                            {intentLabelsShort[user.intent] || user.intent}
                        </Badge>
                    )}
                    {user.college && (
                        <Badge variant="neutral" className="bg-[var(--surface-elevated)] border-[var(--border-subtle)] text-[var(--text-secondary)]">
                            🎓 {user.college}
                        </Badge>
                    )}
                    {user.availability && (
                        <Badge variant="neutral" className="bg-[var(--surface-elevated)] border-[var(--border-subtle)] text-[var(--text-secondary)]">
                            ⏱️ {user.availability} hrs/week
                        </Badge>
                    )}
                </div>

                {/* Hackathon Goals Section */}
                <div className="bg-[var(--surface-sunken)] p-4 rounded-xl border border-[var(--border-subtle)]">
                    <Stack spacing="sm">
                        {user.currentProject ? (
                            <div>
                                <Text size="xs" weight="medium" className="uppercase text-[var(--text-muted)] tracking-wider mb-1">Currently Building</Text>
                                <Text className="font-medium text-[var(--text-primary)]">{user.currentProject}</Text>
                            </div>
                        ) : (
                            <div>
                                <Text size="xs" weight="medium" className="uppercase text-[var(--text-muted)] tracking-wider mb-1">Interested In</Text>
                                <Text className="font-medium text-[var(--text-primary)]">{user.hackathonInterest || 'Looking for a Hackathon Team'}</Text>
                            </div>
                        )}
                        
                        {user.lookingFor && (
                            <div className="mt-2">
                                <Text size="xs" weight="medium" className="uppercase text-[var(--color-primary)] tracking-wider mb-1">Looking For</Text>
                                <Text className="text-[var(--text-secondary)]">{user.lookingFor}</Text>
                            </div>
                        )}
                    </Stack>
                </div>

                {/* Skills */}
                {user.skills && user.skills.length > 0 && (
                    <div className="flex flex-col gap-2 mt-1">
                        <Text variant="small" className="text-[var(--text-muted)] font-medium uppercase tracking-wider text-center">Tech Stack</Text>
                        <div className="flex flex-wrap justify-center gap-1.5">
                            {visibleSkills.map((skill, idx) => (
                                <Badge key={idx} variant="outline" className="text-xs bg-[var(--surface-sunken)] border-[var(--border-subtle)] text-[var(--text-primary)]">
                                    {skill}
                                </Badge>
                            ))}
                            {remainingSkillsCount > 0 && (
                                <Badge variant="outline" className="text-xs text-[var(--text-muted)] border-dashed border-[var(--border-subtle)]">
                                    +{remainingSkillsCount} more
                                </Badge>
                            )}
                        </div>
                    </div>
                )}

                {/* GitHub */}
                {user.githubUrl && (
                    <div className="flex justify-center mt-auto pt-4">
                        <a 
                            href={user.githubUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors text-sm font-medium flex items-center gap-1.5 bg-[var(--surface-sunken)] px-4 py-2 rounded-lg border border-[var(--border-subtle)]"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
                            View GitHub
                        </a>
                    </div>
                )}
            </div>

            {/* Actions */}
            {actions && (
                <div className="p-4 bg-[var(--surface-sunken)] border-t border-[var(--border-subtle)]">
                    {actions}
                </div>
            )}
        </Card>
    );
};

export default React.memo(UserCard);
