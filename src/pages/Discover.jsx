import React, { useEffect, useRef, useCallback, useState, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { BASE_URL } from '../constants/commonData';
import { addFeed, removeFeed } from '../redux/feedSlice';
import { addConnections } from '../redux/connectionSlice';
import { addRequests, removeRequest } from '../redux/requestSlice';
import defaultAvatar from '../assests/images/default-user-image.png';
import { Page, Container, Card, Heading, Text, Badge, Avatar, Button, Skeleton } from '@/design-system';
import toast from 'react-hot-toast';

const getUserPhotoUrl = (user) => {
    if (!user || typeof user !== 'object') return defaultAvatar;
    return user.photoUrl || user.profileImageUrl || user.avatarUrl || user.photo || defaultAvatar;
};

const Discover = () => {
    const rawFeed = useSelector(store => store.feed) || [];
    const connections = useSelector(store => store.connections);
    const requests = useSelector(store => store.requests);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    
    const [loading, setLoading] = useState(false);
    const [recommendations, setRecommendations] = useState({ matchedDevelopers: [], matchedProjects: [] });
    
    // Filter State
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState('');
    
    // Current Index State (for pagination/next)
    const [currentIndex, setCurrentIndex] = useState(0);
    
    // Modal State
    const [connectModalOpen, setConnectModalOpen] = useState(false);
    const [connectIntent, setConnectIntent] = useState('');
    const [connectMessage, setConnectMessage] = useState('');

    const fetchFeed = useCallback(async () => {
        if (rawFeed && rawFeed.length > 0) return;
        setLoading(true);
        try {
            const res = await axios.get(BASE_URL + '/user/feed', { withCredentials: true });
            dispatch(addFeed(res.data?.feed || res.data?.data || []));
        } catch (error) {
            console.error('Feed fetch error:', error);
        } finally {
            setLoading(false);
        }
    }, [dispatch, rawFeed]);

    const fetchRequests = useCallback(async () => {
        if (requests) return;
        try {
            const res = await axios.get(BASE_URL + '/user/request/received', { withCredentials: true });
            dispatch(addRequests(res.data?.connectionRequests || []));
        } catch (error) {
            console.error('Requests fetch error:', error);
        }
    }, [dispatch, requests]);

    const fetchRecommendations = useCallback(async () => {
        try {
            const res = await axios.get(BASE_URL + '/matches/recommendations', { withCredentials: true });
            setRecommendations(res.data);
        } catch (error) {
            console.error('Recommendations fetch error:', error);
        }
    }, []);

    useEffect(() => { 
        fetchFeed(); 
        fetchRequests();
        fetchRecommendations();
    }, [fetchFeed, fetchRecommendations, fetchRequests]);

    // Derived State: Merged Feed
    const feed = useMemo(() => {
        let merged = [...rawFeed];
        if (recommendations?.matchedDevelopers?.length > 0) {
            const matchMap = new Map();
            recommendations.matchedDevelopers.forEach(dev => matchMap.set(dev._id, dev.matchScore));
            
            merged = merged.map(user => ({
                ...user,
                matchScore: matchMap.get(user._id)
            })).sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
        }

        // Apply filters
        if (searchQuery) {
            merged = merged.filter(u => 
                `${u.firstName} ${u.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
                u.skills?.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()))
            );
        }
        if (activeFilter) {
            merged = merged.filter(u => u.skills?.some(s => s.toLowerCase() === activeFilter.toLowerCase()));
        }

        return merged;
    }, [rawFeed, recommendations, searchQuery, activeFilter]);

    const handleAction = async (status, targetUserId) => {
        try {
            await axios.post(
                `${BASE_URL}/request/send/${status}/${targetUserId}`,
                { intent: connectIntent, message: connectMessage },
                { withCredentials: true }
            );
            
            dispatch(addFeed(rawFeed.filter(u => u._id !== targetUserId)));
            
            if (status === 'interested') {
                toast.success('Connection request sent!');
            } else {
                toast.success('Passed on developer.');
            }
            
            // Close modal and move to next
            setConnectModalOpen(false);
            setConnectIntent('');
            setConnectMessage('');
            
            // Keep index same, which automatically shows next person because feed array shortens
        } catch (error) {
            console.error('Action error:', error);
            toast.error('Action failed. Try again.');
        }
    };

    const handleReviewRequest = async (status, requestId, e) => {
        e.stopPropagation();
        try {
            await axios.post(
                `${BASE_URL}/request/review/${status}/${requestId}`,
                {},
                { withCredentials: true }
            );
            toast.success(status === 'accepted' ? 'Request accepted! 🎉' : 'Request rejected');
            dispatch(removeRequest(requestId));
        } catch (error) {
            console.error('Review request error:', error);
            toast.error('Failed to process request');
        }
    };

    const currentUser = feed[currentIndex] || feed[0]; // Fallback to 0 if out of bounds

    return (
        <Page className="bg-[var(--surface-primary)] h-full overflow-y-auto">
            <Container size="xl" className="py-6 md:py-8 h-full flex flex-col">
                
                {/* Header & Filter Bar */}
                <div className="mb-6">
                    <Heading level={2} className="text-2xl font-bold tracking-tight mb-4">
                        Find Your Next Teammate
                    </Heading>
                    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                        <input 
                            type="text" 
                            placeholder="Search developers..." 
                            className="px-4 py-2 bg-[var(--surface-sunken)] border border-[var(--border-subtle)] rounded-md text-sm outline-none focus:border-[var(--color-primary)] w-64 min-w-64 text-[var(--text-primary)]"
                            value={searchQuery}
                            onChange={(e) => {
                                setSearchQuery(e.target.value);
                                setCurrentIndex(0); // Reset index on search
                            }}
                        />
                        {['Backend', 'Frontend', 'AI/ML', 'Blockchain', 'UI/UX'].map(filter => (
                            <button
                                key={filter}
                                className={`px-4 py-2 rounded-md text-sm border whitespace-nowrap transition-colors ${activeFilter === filter ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)]' : 'bg-[var(--surface-sunken)] border-[var(--border-subtle)] hover:border-[var(--border-strong)] text-[var(--text-primary)]'}`}
                                onClick={() => {
                                    setActiveFilter(activeFilter === filter ? '' : filter);
                                    setCurrentIndex(0); // Reset index on filter
                                }}
                            >
                                {filter}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 flex-1 min-h-0">
                    
                    {/* Main Column: 1 Premium Developer Card */}
                    <div className="w-full lg:w-[65%] flex flex-col min-h-0">
                        {loading ? (
                            <Skeleton className="w-full h-[600px] rounded-lg" />
                        ) : !currentUser ? (
                            <Card className="flex-1 flex flex-col items-center justify-center p-8 border border-[var(--border-subtle)] min-h-[500px]">
                                <Text className="text-4xl mb-4">🚀</Text>
                                <Heading level={3} className="mb-2">No developers found</Heading>
                                <Text className="text-[var(--text-secondary)] text-center">
                                    Try adjusting your filters or search query to find more teammates.
                                </Text>
                            </Card>
                        ) : (
                            <Card className="flex flex-col border border-[var(--border-subtle)] p-0 bg-[var(--surface-primary)]">
                                <div className="p-6 md:p-8 relative">
                                    
                                    {currentUser.matchScore && (
                                        <div className="absolute top-6 right-8 flex flex-col items-end">
                                            <Badge variant="primary" className="text-lg py-1 px-3 bg-indigo-500/10 text-indigo-400 border-indigo-500/20 rounded-md font-bold mb-2">
                                                {currentUser.matchScore}% AI Match
                                            </Badge>
                                        </div>
                                    )}

                                    <div className="flex flex-col md:flex-row items-center md:items-start gap-6 mb-8 mt-4 md:mt-0">
                                        <Avatar src={getUserPhotoUrl(currentUser)} alt={currentUser.firstName} size="xxl" className="w-32 h-32 md:w-40 md:h-40 border-2 border-[var(--border-subtle)] rounded-xl" />
                                        <div className="text-center md:text-left pt-2 flex-1">
                                            <Heading level={2} className="text-3xl mb-1">{currentUser.firstName} {currentUser.lastName}</Heading>
                                            <Text className="text-xl text-[var(--text-secondary)] font-medium mb-4">{currentUser.role || 'Full Stack Developer'}</Text>
                                            <Text className="text-[var(--text-secondary)] leading-relaxed max-w-2xl">
                                                "{currentUser.about || 'Passionate about building scalable systems and participating in hackathons.'}"
                                            </Text>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                                        {/* Top Skills */}
                                        <div className="border border-[var(--border-subtle)] rounded-lg p-5 bg-[var(--surface-sunken)]">
                                            <Heading level={4} className="text-sm uppercase tracking-wider text-[var(--text-muted)] mb-4">Top Skills</Heading>
                                            <div className="flex flex-wrap gap-2">
                                                {(currentUser.skills || ['Node.js', 'React', 'MongoDB', 'Docker']).map((skill, i) => (
                                                    <Badge key={i} variant="neutral" className="bg-[var(--surface-primary)] border-[var(--border-subtle)] px-3 py-1 text-sm font-medium">
                                                        {skill}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>

                                        {/* GitHub Stats Mock */}
                                        <div className="border border-[var(--border-subtle)] rounded-lg p-5 bg-[var(--surface-sunken)]">
                                            <Heading level={4} className="text-sm uppercase tracking-wider text-[var(--text-muted)] mb-4">GitHub Stats</Heading>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <Text className="text-[var(--text-muted)] text-xs mb-1">Stars</Text>
                                                    <Text className="text-xl font-bold flex items-center gap-1 text-[var(--text-primary)]">
                                                        <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                                                        {Math.floor(Math.random() * 300) + 12}
                                                    </Text>
                                                </div>
                                                <div>
                                                    <Text className="text-[var(--text-muted)] text-xs mb-1">Repositories</Text>
                                                    <Text className="text-xl font-bold text-[var(--text-primary)]">{Math.floor(Math.random() * 50) + 5}</Text>
                                                </div>
                                            </div>
                                            <div className="mt-4 pt-4 border-t border-[var(--border-subtle)]">
                                                <Text className="text-[var(--text-muted)] text-xs mb-1">Activity</Text>
                                                <div className="w-full bg-[var(--surface-primary)] h-2 rounded-full overflow-hidden flex">
                                                    <div className="h-full bg-green-500 w-[70%]"></div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* Why AI Recommends */}
                                        <div className="border border-[var(--border-subtle)] rounded-lg p-5">
                                            <Heading level={4} className="text-sm uppercase tracking-wider text-[var(--text-muted)] mb-4">Why AI recommends {currentUser.firstName}</Heading>
                                            <ul className="space-y-3">
                                                <li className="flex items-start gap-2 text-sm text-[var(--text-secondary)]">
                                                    <span className="text-green-500 font-bold">✓</span> Same timezone
                                                </li>
                                                <li className="flex items-start gap-2 text-sm text-[var(--text-secondary)]">
                                                    <span className="text-green-500 font-bold">✓</span> Similar tech stack
                                                </li>
                                                <li className="flex items-start gap-2 text-sm text-[var(--text-secondary)]">
                                                    <span className="text-green-500 font-bold">✓</span> Complements your skills
                                                </li>
                                                <li className="flex items-start gap-2 text-sm text-[var(--text-secondary)]">
                                                    <span className="text-green-500 font-bold">✓</span> Both available for Hackathons
                                                </li>
                                            </ul>
                                        </div>

                                        {/* Featured Projects Mock */}
                                        <div className="border border-[var(--border-subtle)] rounded-lg p-5">
                                            <Heading level={4} className="text-sm uppercase tracking-wider text-[var(--text-muted)] mb-4">Featured Projects</Heading>
                                            <div className="space-y-4">
                                                <div className="flex items-start justify-between">
                                                    <div>
                                                        <Text className="font-bold mb-1 text-[var(--text-primary)]">AI Interviewer</Text>
                                                        <Text className="text-xs text-[var(--text-muted)]">React • Node • MongoDB</Text>
                                                    </div>
                                                    <Text className="text-xs text-[var(--text-muted)] flex items-center gap-1">⭐ 120</Text>
                                                </div>
                                                <div className="flex items-start justify-between">
                                                    <div>
                                                        <Text className="font-bold mb-1 text-[var(--text-primary)]">DevSync v2</Text>
                                                        <Text className="text-xs text-[var(--text-muted)]">Next.js • Redis</Text>
                                                    </div>
                                                    <Text className="text-xs text-[var(--text-muted)] flex items-center gap-1">⭐ 45</Text>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                </div>

                                {/* Bottom Action Bar */}
                                <div className="flex border-t border-[var(--border-subtle)] bg-[var(--surface-primary)] h-16 shrink-0 mt-auto">
                                    <button 
                                        className="flex-1 border-r border-[var(--border-subtle)] hover:bg-[var(--surface-sunken)] transition-colors font-medium text-[var(--text-secondary)] h-full flex items-center justify-center"
                                        onClick={() => handleAction('ignored', currentUser._id)}
                                    >
                                        Pass
                                    </button>
                                    <button 
                                        className="flex-1 border-r border-[var(--border-subtle)] bg-[var(--color-primary)] hover:brightness-110 text-white transition-colors font-bold h-full flex items-center justify-center text-lg"
                                        onClick={() => setConnectModalOpen(true)}
                                    >
                                        Connect
                                    </button>
                                    <button 
                                        className="flex-1 hover:bg-[var(--surface-sunken)] transition-colors font-medium text-[var(--text-secondary)] h-full flex items-center justify-center"
                                        onClick={() => setCurrentIndex((prev) => (prev + 1) % feed.length)}
                                    >
                                        Next
                                    </button>
                                </div>
                            </Card>
                        )}
                    </div>

                    {/* Right Sidebar */}
                    <div className="w-full lg:w-[35%] flex flex-col gap-6">
                        
                        {/* AI Suggestions */}
                        <div className="flex flex-col">
                            <div className="flex items-center justify-between mb-4">
                                <Heading level={3} className="text-sm uppercase tracking-wider text-[var(--text-muted)]">AI Suggestions</Heading>
                                <button className="text-xs text-[var(--color-primary)] hover:underline">See All</button>
                            </div>
                            <div className="flex flex-col gap-1">
                                {recommendations?.matchedDevelopers?.slice(0, 3).map((dev) => (
                                    <div 
                                        key={`rec-${dev._id}`}
                                        className="flex items-center justify-between p-3 rounded-lg hover:bg-[var(--surface-sunken)] cursor-pointer transition-colors border border-transparent hover:border-[var(--border-subtle)]"
                                        onClick={() => {
                                            const idx = feed.findIndex(u => u._id === dev._id);
                                            if (idx !== -1) setCurrentIndex(idx);
                                        }}
                                    >
                                        <div className="flex items-center gap-3">
                                            <Avatar src={getUserPhotoUrl(dev)} alt={dev.firstName} size="sm" />
                                            <Text className="font-medium text-[var(--text-primary)]">{dev.firstName}</Text>
                                        </div>
                                        <Text className="text-indigo-400 font-bold text-sm">{dev.matchScore}%</Text>
                                    </div>
                                ))}
                                {(!recommendations?.matchedDevelopers || recommendations.matchedDevelopers.length === 0) && (
                                    <Text className="text-sm text-[var(--text-muted)] py-2 px-3 bg-[var(--surface-sunken)] rounded-lg border border-[var(--border-subtle)] text-center">No suggestions available.</Text>
                                )}
                            </div>
                        </div>

                        <div className="w-full h-px bg-[var(--border-subtle)] my-2"></div>

                        {/* Pending Requests */}
                        <div className="flex flex-col">
                            <div className="flex items-center justify-between mb-4">
                                <Heading level={3} className="text-sm uppercase tracking-wider text-[var(--text-muted)]">Pending Requests</Heading>
                                <Badge variant="neutral">{requests?.length || 0}</Badge>
                            </div>
                            <div className="flex flex-col gap-2">
                                {requests?.slice(0, 3).map((req) => {
                                    const user = req?.fromUserId || req;
                                    return (
                                        <div key={req._id} className="flex flex-col p-3 rounded-lg bg-[var(--surface-sunken)] border border-[var(--border-subtle)]">
                                            <div className="flex items-center gap-3 mb-3">
                                                <Avatar src={getUserPhotoUrl(user)} alt={user.firstName} size="sm" />
                                                <div className="flex-1 min-w-0">
                                                    <Text className="font-medium truncate text-[var(--text-primary)]">{user.firstName} {user.lastName}</Text>
                                                    <Text variant="small" className="text-[var(--text-muted)] truncate">{user.skills?.[0] || 'Developer'}</Text>
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <Button variant="secondary" size="sm" fullWidth onClick={(e) => handleReviewRequest('rejected', req._id, e)}>Ignore</Button>
                                                <Button variant="primary" size="sm" fullWidth onClick={(e) => handleReviewRequest('accepted', req._id, e)}>Accept</Button>
                                            </div>
                                        </div>
                                    );
                                })}
                                {(!requests || requests.length === 0) && (
                                    <Text className="text-sm text-[var(--text-muted)] py-2 px-3 text-center bg-[var(--surface-sunken)] rounded-lg border border-[var(--border-subtle)]">No pending requests.</Text>
                                )}
                            </div>
                        </div>

                        <div className="w-full h-px bg-[var(--border-subtle)] my-2"></div>

                        {/* Match Insights */}
                        <div className="flex flex-col">
                            <div className="flex items-center justify-between mb-4">
                                <Heading level={3} className="text-sm uppercase tracking-wider text-[var(--text-muted)]">Match Insights</Heading>
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="text-[var(--text-muted)]">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z" />
                                </svg>
                            </div>
                            <div className="bg-[var(--surface-sunken)] p-4 rounded-lg border border-[var(--border-subtle)]">
                                <Text className="text-sm font-medium mb-2 text-[var(--text-primary)]">How to get better matches?</Text>
                                <Text className="text-xs text-[var(--text-secondary)] leading-relaxed">
                                    Our AI looks for shared interests, complementary skills (e.g., matching Frontend with Backend), and timezone alignment. Keep your profile and skills up to date to find the best teammates!
                                </Text>
                                <Link to="/profile">
                                    <Button variant="secondary" size="sm" className="mt-3 w-full">Update Profile</Button>
                                </Link>
                            </div>
                        </div>

                    </div>
                </div>
            </Container>

            {/* Connect Modal */}
            {connectModalOpen && currentUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <Card className="w-full max-w-md border border-[var(--border-subtle)] shadow-2xl p-6 bg-[var(--surface-primary)]">
                        <Heading level={3} className="mb-2">Connect with {currentUser.firstName}</Heading>
                        <Text className="text-[var(--text-secondary)] mb-6 text-sm">Send a request to collaborate.</Text>

                        <Text className="font-medium mb-2 text-sm text-[var(--text-primary)]">Why do you want to connect?</Text>
                        <div className="flex flex-wrap gap-2 mb-6">
                            {['Hackathon', 'Startup', 'Open Source', 'Learning', 'Freelance'].map(intent => (
                                <button
                                    key={intent}
                                    className={`px-3 py-1.5 rounded-md text-sm border transition-colors ${connectIntent === intent ? 'bg-indigo-500/10 border-indigo-500 text-indigo-400 font-medium' : 'bg-[var(--surface-sunken)] border-[var(--border-subtle)] text-[var(--text-secondary)] hover:border-[var(--border-strong)]'}`}
                                    onClick={() => setConnectIntent(intent)}
                                >
                                    {intent}
                                </button>
                            ))}
                        </div>

                        <Text className="font-medium mb-2 text-sm text-[var(--text-primary)]">Message</Text>
                        <textarea
                            className="w-full h-24 p-3 bg-[var(--surface-sunken)] border border-[var(--border-subtle)] rounded-md text-sm outline-none focus:border-[var(--color-primary)] resize-none mb-6 text-[var(--text-primary)]"
                            placeholder={`Hey ${currentUser.firstName}, I saw your profile and...`}
                            value={connectMessage}
                            onChange={(e) => setConnectMessage(e.target.value)}
                        ></textarea>

                        <div className="flex justify-end gap-3">
                            <Button variant="secondary" onClick={() => setConnectModalOpen(false)}>Cancel</Button>
                            <Button variant="primary" onClick={() => handleAction('interested', currentUser._id)}>Send Request</Button>
                        </div>
                    </Card>
                </div>
            )}
        </Page>
    );
}

export default Discover;
