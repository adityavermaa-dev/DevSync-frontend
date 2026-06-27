import React, { useEffect, useRef, useCallback, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { BASE_URL } from '../constants/commonData';
import { addFeed, removeFeed } from '../redux/feedSlice';
import { addConnections } from '../redux/connectionSlice';
import { addRequests, removeRequest } from '../redux/requestSlice';
import UserCard from '../components/UserCard';
import AnimatedEmoji from '../components/AnimatedEmoji';
import defaultAvatar from '../assests/images/default-user-image.png';
import { Page, Container, Card, Stack, Heading, Text, Badge, Avatar, Button } from '@/design-system';
import './Feed.css';
import toast from 'react-hot-toast';

const SWIPE_THRESHOLD = 120;
const VELOCITY_THRESHOLD = 0.5;
const FLY_DURATION = 350;

const getUserPhotoUrl = (user) => {
    if (!user || typeof user !== 'object') return defaultAvatar;
    return user.photoUrl || user.profileImageUrl || user.avatarUrl || user.photo || defaultAvatar;
};

const Feed = () => {
    const feed = useSelector(store => store.feed);
    const connections = useSelector(store => store.connections);
    const requests = useSelector(store => store.requests);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    
    const [loading, setLoading] = useState(false);
    const [swiping, setSwiping] = useState(false);
    const [removingReqId, setRemovingReqId] = useState(null);
    const [recommendations, setRecommendations] = useState({ matchedDevelopers: [], matchedProjects: [] });

    
    const cardRef = useRef(null);
    const likeStampRef = useRef(null);
    const nopeStampRef = useRef(null);
    const isDragging = useRef(false);
    const startPos = useRef({ x: 0, y: 0 });
    const currentPos = useRef({ x: 0, y: 0 });
    const velocity = useRef({ x: 0, y: 0 });
    const lastPos = useRef({ x: 0, y: 0 });
    const lastTime = useRef(0);
    const rafId = useRef(null);

    const fetchFeed = useCallback(async () => {
        if (feed) return;
        setLoading(true);
        try {
            const res = await axios.get(BASE_URL + '/user/feed', { withCredentials: true });
            dispatch(addFeed(res.data?.feed || res.data?.data || []));
        } catch (error) {
            console.error('Feed fetch error:', error);
            
        } finally {
            setLoading(false);
        }
    }, [dispatch, feed]);

    const fetchConnections = useCallback(async () => {
        if (connections) return;
        try {
            const res = await axios.get(BASE_URL + '/user/connections', { withCredentials: true });
            dispatch(addConnections(res.data?.data || []));
        } catch (error) {
            console.error('Connections fetch error:', error);
        }
    }, [connections, dispatch]);

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
        fetchConnections();
        fetchRequests();
        fetchRecommendations();
    }, [fetchConnections, fetchFeed, fetchRecommendations, fetchRequests]);

    const advanceFeed = useCallback(() => {
        const newFeed = feed.slice(1);
        if (newFeed.length === 0) {
            dispatch(removeFeed());
        } else {
            dispatch(addFeed(newFeed));
        }
    }, [feed, dispatch]);

    const sendAction = useCallback(async (status, userId) => {
        try {
            await axios.post(
                `${BASE_URL}/request/send/${status}/${userId}`,
                {},
                { withCredentials: true }
            );
            
            if (status === 'interested') {
                axios.get(BASE_URL + '/user/connections', { withCredentials: true })
                     .then(res => dispatch(addConnections(res.data?.data || [])));
            }
        } catch (error) {
            console.error('Action error:', error);
            toast.error('Action failed. Try again.');
        }
    }, [dispatch]);

    const handleReviewRequest = async (status, requestId, e) => {
        e.stopPropagation();
        try {
            await axios.post(
                `${BASE_URL}/request/review/${status}/${requestId}`,
                {},
                { withCredentials: true }
            );
            toast.success(status === 'accepted' ? 'Request accepted! 🎉' : 'Request rejected');
            
            
            if (status === 'accepted') {
                axios.get(BASE_URL + '/user/connections', { withCredentials: true })
                     .then(res => dispatch(addConnections(res.data?.data || [])));
            }
            
            setRemovingReqId(requestId);
            setTimeout(() => {
                dispatch(removeRequest(requestId));
                setRemovingReqId(null);
            }, 300);
        } catch (error) {
            console.error('Review request error:', error);
            toast.error('Failed to process request');
        }
    };

    
    const applyTransform = useCallback((x, y) => {
        if (!cardRef.current) return;
        const rotation = x * 0.05;
        cardRef.current.style.transform = `translate3d(${x}px, ${y}px, 0) rotate(${rotation}deg)`;

        const progress = Math.abs(x) / SWIPE_THRESHOLD;
        if (likeStampRef.current) {
            likeStampRef.current.style.opacity = x > 0 ? Math.min(progress, 1) : 0;
        }
        if (nopeStampRef.current) {
            nopeStampRef.current.style.opacity = x < 0 ? Math.min(progress, 1) : 0;
        }
    }, []);

    const flyOff = useCallback((direction) => {
        if (!cardRef.current || swiping) return;
        setSwiping(true);

        const card = cardRef.current;
        const flyX = direction === 'right' ? window.innerWidth * 1.5 : -window.innerWidth * 1.5;
        const flyRotation = direction === 'right' ? 30 : -30;

        card.style.transition = `transform ${FLY_DURATION}ms cubic-bezier(0.33, 1, 0.68, 1), opacity ${FLY_DURATION}ms ease`;
        card.style.transform = `translate3d(${flyX}px, -50px, 0) rotate(${flyRotation}deg)`;
        card.style.opacity = '0';

        if (likeStampRef.current) likeStampRef.current.style.opacity = direction === 'right' ? '1' : '0';
        if (nopeStampRef.current) nopeStampRef.current.style.opacity = direction === 'left' ? '1' : '0';

        const currentUser = feed?.[0];
        if (currentUser) {
            sendAction(direction === 'right' ? 'interested' : 'ignored', currentUser._id);
        }

        setTimeout(() => {
            setSwiping(false);
            advanceFeed();
        }, FLY_DURATION);
    }, [feed, advanceFeed, sendAction, swiping]);

    const snapBack = useCallback(() => {
        if (!cardRef.current) return;
        const card = cardRef.current;
        card.style.transition = 'transform 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275), opacity 0.5s ease';
        card.style.transform = 'translate3d(0, 0, 0) rotate(0deg)';
        if (likeStampRef.current) {
            likeStampRef.current.style.transition = 'opacity 0.4s ease';
            likeStampRef.current.style.opacity = '0';
        }
        if (nopeStampRef.current) {
            nopeStampRef.current.style.transition = 'opacity 0.4s ease';
            nopeStampRef.current.style.opacity = '0';
        }
    }, []);

    const getEventPos = (e) => {
        if (e.touches && e.touches.length > 0) return { x: e.touches[0].clientX, y: e.touches[0].clientY };
        return { x: e.clientX, y: e.clientY };
    };

    const handleStart = useCallback((e) => {
        if (swiping) return;
        const pos = getEventPos(e);
        isDragging.current = true;
        startPos.current = pos;
        currentPos.current = { x: 0, y: 0 };
        lastPos.current = pos;
        lastTime.current = Date.now();
        velocity.current = { x: 0, y: 0 };

        if (cardRef.current) {
            cardRef.current.style.transition = 'none'; 
            cardRef.current.style.cursor = 'grabbing';
        }
        if (likeStampRef.current) likeStampRef.current.style.transition = 'none';
        if (nopeStampRef.current) nopeStampRef.current.style.transition = 'none';
    }, [swiping]);

    const handleMove = useCallback((e) => {
        if (!isDragging.current || swiping) return;
        e.preventDefault(); 

        const pos = getEventPos(e);
        const now = Date.now();
        const dt = now - lastTime.current;

        if (dt > 0) {
            velocity.current = {
                x: (pos.x - lastPos.current.x) / dt,
                y: (pos.y - lastPos.current.y) / dt,
            };
        }

        lastPos.current = pos;
        lastTime.current = now;

        currentPos.current = {
            x: pos.x - startPos.current.x,
            y: (pos.y - startPos.current.y) * 0.25,
        };

        if (rafId.current) cancelAnimationFrame(rafId.current);
        rafId.current = requestAnimationFrame(() => {
            applyTransform(currentPos.current.x, currentPos.current.y);
        });
    }, [applyTransform, swiping]);

    const handleEnd = useCallback(() => {
        if (!isDragging.current || swiping) return;
        isDragging.current = false;
        if (rafId.current) cancelAnimationFrame(rafId.current);

        const x = currentPos.current.x;
        const vx = velocity.current.x;

        if (x > SWIPE_THRESHOLD || vx > VELOCITY_THRESHOLD) {
            flyOff('right');
        } else if (x < -SWIPE_THRESHOLD || vx < -VELOCITY_THRESHOLD) {
            flyOff('left');
        } else {
            snapBack();
        }
    }, [flyOff, snapBack, swiping]);

    useEffect(() => {
        const card = cardRef.current;
        if (!card) return;
        const onTouchMove = (e) => handleMove(e);
        card.addEventListener('touchmove', onTouchMove, { passive: false });
        return () => {
            card.removeEventListener('touchmove', onTouchMove);
        };
    }, [handleMove, feed]);

    useEffect(() => {
        return () => {
            if (rafId.current) cancelAnimationFrame(rafId.current);
        };
    }, []);

    
    const displayFeed = React.useMemo(() => {
        if (!feed) return [];
        return feed;
    }, [feed]);

    useEffect(() => {
        if (feed && feed.length > 0 && recommendations?.matchedDevelopers?.length > 0) {
            const alreadyMerged = feed.some(u => u.matchScore !== undefined);
            if (!alreadyMerged) {
                const matchMap = new Map();
                recommendations.matchedDevelopers.forEach(dev => matchMap.set(dev._id, dev.matchScore));
                
                const mergedFeed = [...feed].map(user => ({
                    ...user,
                    matchScore: matchMap.get(user._id)
                })).sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
                
                dispatch(addFeed(mergedFeed));
            }
        }
    }, [feed, recommendations, dispatch]);

    const renderFeedState = () => {
        if (loading) {
            return (
                <div className="w-full flex flex-col items-center justify-center min-h-[500px]">
                    <div className="feed-spinner" />
                </div>
            );
        }

        if (!feed || feed.length === 0) {
            return (
                <div className="w-full flex flex-col items-center justify-center min-h-[500px]">
                    <div className="feed-empty w-full text-center">
                        <div className="feed-empty-avatar mx-auto mb-6">
                            <AnimatedEmoji mousePos={{x: 0, y: 0}} />
                        </div>
                        <Heading level={2} className="mb-2">All Caught Up!</Heading>
                        <Text className="text-[var(--text-secondary)]">
                            You&apos;ve seen everyone for now. Check back later for new connections!
                        </Text>
                    </div>
                </div>
            );
        }

        const currentUser = feed[0];
        const nextUser = feed[1] || null;

        return (
            <div className="w-full flex flex-col items-center">
                <div className="w-full max-w-2xl mb-8 text-center flex flex-col items-center">
                    <Badge variant="primary" className="mb-4">Developer Discovery</Badge>
                    <Heading level={1} className="text-4xl md:text-5xl font-bold tracking-tight mb-4" style={{ fontFamily: "'Outfit', sans-serif" }}>
                        Swipe. Match. Build.
                    </Heading>
                    <Text className="text-[var(--text-secondary)] max-w-xl mx-auto text-lg mb-6">
                        Discover developers who fit your stack and start real collaborations.
                    </Text>
                </div>

                <div
                    className="tinder-stage relative w-full flex justify-center"
                    style={{
                        backgroundImage: `radial-gradient(circle at center, var(--border-subtle) 1px, transparent 1px)`, 
                        backgroundSize: '24px 24px',
                        backgroundColor: 'var(--surface-sunken)',
                        borderRadius: '24px',
                        border: '1px solid var(--border-subtle)'
                    }}
                >
                    <div className="feed-deck m-auto relative h-[600px] flex items-center justify-center" style={{ width: '100%', maxWidth: '380px' }}>
                        {nextUser && (
                            <div className="feed-card-behind absolute scale-95 opacity-50 z-0">
                                <UserCard user={nextUser} />
                            </div>
                        )}

                        <div
                            className="feed-card-wrap absolute z-10 w-full"
                            key={currentUser._id}
                            ref={cardRef}
                            onMouseDown={handleStart}
                            onMouseMove={handleMove}
                            onMouseUp={handleEnd}
                            onMouseLeave={() => { if (isDragging.current) handleEnd(); }}
                            onTouchStart={handleStart}
                            onTouchEnd={handleEnd}
                        >
                            <div className="feed-stamp feed-stamp-like" ref={likeStampRef}>LIKE</div>
                            <div className="feed-stamp feed-stamp-nope" ref={nopeStampRef}>NOPE</div>

                            <UserCard
                                user={currentUser}
                                actions={
                                    <div className="flex justify-center gap-6 py-2">
                                        <button
                                            className="w-14 h-14 rounded-full flex items-center justify-center bg-[var(--surface-elevated)] border-2 border-[var(--border-subtle)] text-red-400 hover:bg-red-500/10 hover:border-red-500 hover:text-red-500 transition-all shadow-md"
                                            onClick={(e) => { e.stopPropagation(); flyOff('left'); }}
                                            title="Pass"
                                        >
                                            {passIcon}
                                        </button>
                                        <button
                                            className="w-14 h-14 rounded-full flex items-center justify-center bg-[var(--surface-elevated)] border-2 border-[var(--border-subtle)] text-green-400 hover:bg-green-500/10 hover:border-green-500 hover:text-green-500 transition-all shadow-md"
                                            onClick={(e) => { e.stopPropagation(); flyOff('right'); }}
                                            title="Interested"
                                        >
                                            {likeIcon}
                                        </button>
                                    </div>
                                }
                            />
                        </div>
                    </div>

                    <div className="absolute bottom-6 w-full text-center text-[var(--text-muted)] text-sm font-medium flex justify-between px-12 pointer-events-none">
                        <span>← Swipe left to pass</span>
                        <span>Swipe right to connect →</span>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <Page className="bg-[var(--surface-primary)]">
            <Container size="xl" className="py-6 md:py-10">
                <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
                    {/* Main Feed Section */}
                    <div className="w-full lg:w-2/3">
                        {renderFeedState()}
                    </div>

                    {/* Sidebar Section */}
                    <div className="w-full lg:w-1/3 flex flex-col gap-6">
                        {/* Top Matches */}
                        <Card variant="elevated" className="overflow-hidden border-[var(--border-subtle)] bg-[var(--surface-sunken)]">
                            <div className="p-4 border-b border-[var(--border-subtle)] flex items-center justify-between">
                                <Heading level={3} className="text-lg">Top Matches</Heading>
                                <Badge variant="primary" className="text-xs bg-blue-500/10 text-blue-500 border-blue-500/20">AI</Badge>
                            </div>
                            
                            <div className="p-4 flex flex-col gap-3">
                                {(!recommendations?.matchedDevelopers?.length && !recommendations?.matchedProjects?.length) ? (
                                    <Text className="text-[var(--text-muted)] text-sm text-center py-4">No matches yet. Add more skills for better suggestions.</Text>
                                ) : (
                                    <>
                                        {recommendations?.matchedDevelopers?.slice(0, 6).map(dev => (
                                            <div 
                                                key={`dev-${dev?._id}`}
                                                className="flex items-center gap-3 p-2 rounded-lg hover:bg-[var(--surface-elevated)] cursor-pointer transition-colors"
                                                onClick={() => navigate(`/user/${dev?._id}`, { state: { user: dev } })}
                                            >
                                                <Avatar src={getUserPhotoUrl(dev)} alt={dev?.firstName} size="md" />
                                                <div className="flex-1 min-w-0">
                                                    <Text className="font-medium truncate">{dev?.firstName}</Text>
                                                    <Text variant="small" className="text-green-500 font-bold">{dev?.matchScore || 100}% Match</Text>
                                                </div>
                                            </div>
                                        ))}
                                        {recommendations?.matchedProjects?.slice(0, 3).map(proj => (
                                            <div 
                                                key={`proj-${proj._id}`}
                                                className="flex items-center gap-3 p-2 rounded-lg hover:bg-[var(--surface-elevated)] cursor-pointer transition-colors"
                                                onClick={() => navigate(`/projects/${proj._id}`)}
                                            >
                                                <div className="w-10 h-10 rounded-lg bg-[var(--color-primary)] text-white flex items-center justify-center font-bold text-lg">
                                                    {proj.title.charAt(0).toUpperCase()}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <Text className="font-medium truncate">{proj.title}</Text>
                                                    <Text variant="small" className="text-[var(--text-muted)]">Project</Text>
                                                </div>
                                            </div>
                                        ))}
                                    </>
                                )}
                            </div>
                        </Card>

                        {/* Your Network */}
                        <Card variant="elevated" className="overflow-hidden border-[var(--border-subtle)] bg-[var(--surface-sunken)]">
                            <div className="p-4 border-b border-[var(--border-subtle)] flex items-center justify-between">
                                <Heading level={3} className="text-lg">Your Network</Heading>
                                <Badge variant="neutral">{connections?.length || 0}</Badge>
                            </div>
                            
                            <div className="p-4 flex flex-col gap-3">
                                {(!connections || connections.length === 0) ? (
                                    <Text className="text-[var(--text-muted)] text-sm text-center py-4">No connections yet. Swipe right to connect.</Text>
                                ) : (
                                    connections.slice(0, 5).map(user => (
                                        <div key={user?._id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-[var(--surface-elevated)] cursor-pointer transition-colors" onClick={() => navigate(`/user/${user?._id}`, { state: { user } })}>
                                            <Avatar src={getUserPhotoUrl(user)} alt={user?.firstName} size="md" />
                                            <div className="flex-1 min-w-0">
                                                <Text className="font-medium truncate">{user?.firstName} {user?.lastName}</Text>
                                                <Text variant="small" className="text-[var(--text-muted)] truncate">{user?.skills?.[0] || 'Developer'}</Text>
                                            </div>
                                            <Button variant="outline" size="sm" className="h-8 px-3 text-xs" onClick={(e) => { e.stopPropagation(); navigate(`/chat/${user?._id}`); }}>Chat</Button>
                                        </div>
                                    ))
                                )}
                            </div>
                        </Card>

                        {/* Requests */}
                        <Card variant="elevated" className="overflow-hidden border-[var(--border-subtle)] bg-[var(--surface-sunken)]">
                            <div className="p-4 border-b border-[var(--border-subtle)] flex items-center justify-between">
                                <Heading level={3} className="text-lg">Requests</Heading>
                                <Badge variant="neutral">{requests?.length || 0}</Badge>
                            </div>
                            
                            <div className="p-4 flex flex-col gap-3">
                                {(!requests || requests.length === 0) ? (
                                    <Text className="text-[var(--text-muted)] text-sm text-center py-4">No pending requests.</Text>
                                ) : (
                                    requests.slice(0, 5).map(req => {
                                        const user = req?.fromUserId || req;
                                        const isRemoving = removingReqId === req?._id;
                                        return (
                                            <div key={req?._id} className={`flex items-center gap-3 p-2 rounded-lg hover:bg-[var(--surface-elevated)] cursor-pointer transition-all duration-300 ${isRemoving ? 'opacity-0 scale-95' : 'opacity-100'}`} onClick={() => navigate(`/user/${user?._id}`, { state: { user } })}>
                                                <Avatar src={getUserPhotoUrl(user)} alt={user?.firstName} size="md" />
                                                <div className="flex-1 min-w-0">
                                                    <Text className="font-medium truncate">{user?.firstName} {user?.lastName}</Text>
                                                    <Text variant="small" className="text-[var(--text-muted)] truncate">{user?.skills?.[0] || 'Developer'}</Text>
                                                </div>
                                                <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                                                    <button type="button" className="w-7 h-7 rounded-full flex items-center justify-center bg-red-500/10 text-red-500 hover:bg-red-500/20" onClick={(e) => handleReviewRequest('rejected', req?._id, e)}>✕</button>
                                                    <button type="button" className="w-7 h-7 rounded-full flex items-center justify-center bg-green-500/10 text-green-500 hover:bg-green-500/20" onClick={(e) => handleReviewRequest('accepted', req?._id, e)}>✓</button>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </Card>
                    </div>
                </div>
            </Container>
        </Page>
    );
}


const passIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
    </svg>
);

const likeIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
        <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
    </svg>
);

export default Feed;