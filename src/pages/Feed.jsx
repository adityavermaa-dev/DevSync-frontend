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
import './Feed.css';
import toast from 'react-hot-toast';

const SWIPE_THRESHOLD = 120;
const VELOCITY_THRESHOLD = 0.5;
const FLY_DURATION = 350;

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

    // Refs for smooth DOM manipulation
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

    const fetchFeed = async () => {
        if (feed) return;
        setLoading(true);
        try {
            const res = await axios.get(BASE_URL + '/user/feed', { withCredentials: true });
            dispatch(addFeed(res.data?.feed || res.data?.data || []));
        } catch (error) {
            console.error('Feed fetch error:', error);
            toast.error('Failed to load feed');
        } finally {
            setLoading(false);
        }
    };

    const fetchConnections = async () => {
        if (connections) return;
        try {
            const res = await axios.get(BASE_URL + '/user/connections', { withCredentials: true });
            dispatch(addConnections(res.data?.data || []));
        } catch (error) {
            console.error('Connections fetch error:', error);
        }
    };

    const fetchRequests = async () => {
        if (requests) return;
        try {
            const res = await axios.get(BASE_URL + '/user/request/received', { withCredentials: true });
            dispatch(addRequests(res.data?.connectionRequests || []));
        } catch (error) {
            console.error('Requests fetch error:', error);
        }
    };

    const fetchRecommendations = async () => {
        try {
            const res = await axios.get(BASE_URL + '/matches/recommendations', { withCredentials: true });
            setRecommendations(res.data);
        } catch (error) {
            console.error('Recommendations fetch error:', error);
        }
    };

    useEffect(() => { 
        fetchFeed(); 
        fetchConnections();
        fetchRequests();
        fetchRecommendations();
    }, []);

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
            // Optionally refetch connections/requests in background if mutual match happens
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
            
            // Refetch connections globally so the new connection immediately jumps into the left sidebar!
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

    // ── Apply transform directly to DOM (60fps) ──
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

    /* ── Render Main Feed Content ── */
    const renderFeedState = () => {
        if (loading) {
            return (
                <div className="feed-page w-full flex flex-col items-center">
                    <div className="feed-loading">
                        <div className="feed-spinner" />
                    </div>
                </div>
            );
        }

        if (!feed || feed.length === 0) {
            return (
                <div className="feed-page w-full flex flex-col items-center">
                    <div className="feed-empty w-full">
                        <div className="feed-empty-avatar">
                            <AnimatedEmoji mousePos={{x: 0, y: 0}} />
                        </div>
                        <h2 className="feed-empty-title">All Caught Up!</h2>
                        <p className="feed-empty-text">
                            You&apos;ve seen everyone for now. Check back later for new connections!
                        </p>
                    </div>
                </div>
            );
        }

        const currentUser = feed[0];
        const nextUser = feed[1] || null;

        return (
            <div className="feed-page w-full flex flex-col items-center">
                
                {/* Clean Typography Header */}
                <div className="w-full max-w-lg mb-8 text-center relative z-10 flex flex-col items-center mt-6">
                    <h1 className="text-3xl md:text-5xl font-extrabold feed-text-main tracking-tight mb-3" style={{ fontFamily: "'Outfit', sans-serif" }}>
                        Discover Matches
                    </h1>
                    <p className="text-sm md:text-base feed-text-faint font-medium max-w-sm md:max-w-md px-6 leading-relaxed">
                        Swipe right on developers that match your stack. Build your network and start collaborating today!
                    </p>
                </div>

                <div className="feed-deck m-auto">
                    {/* Next card */}
                    {nextUser && (
                        <div className="feed-card-behind">
                            <UserCard user={nextUser} />
                        </div>
                    )}

                    {/* Current card */}
                    <div
                        className="feed-card-wrap"
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
                                <div className="feed-actions">
                                    <button
                                        className="feed-action-btn feed-btn-pass"
                                        onClick={(e) => { e.stopPropagation(); flyOff('left'); }}
                                        title="Pass"
                                    >
                                        {passIcon}
                                    </button>
                                    <button
                                        className="feed-action-btn feed-btn-like"
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
            </div>
        );
    };

    return (
        <div className="w-full max-w-[1500px] mx-auto flex flex-col xl:flex-row gap-6 lg:gap-8 px-4 py-4">
            
            {/* 1. LEFT SIDEBAR: Connections */}
            <aside className="hidden xl:flex flex-col w-[320px] shrink-0 h-[calc(100vh-40px)] sticky top-6 backdrop-blur-xl rounded-3xl overflow-hidden transition-all feed-sidebar">
                <div className="p-6 feed-sidebar-header shadow-sm z-10">
                    <h2 className="text-2xl font-extrabold feed-text-main tracking-tight" style={{ fontFamily: "'Outfit', sans-serif" }}>Your Network</h2>
                    <p className="text-sm feed-text-faint font-semibold mt-1">{connections?.length || 0} active connections</p>
                </div>
                
                <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                    {(!connections || connections.length === 0) ? (
                        <div className="text-center p-6 text-gray-500 h-full flex flex-col justify-center items-center">
                            <span className="text-4xl mb-4 opacity-80">🤝</span>
                            <p className="text-base font-bold feed-text-main">No connections yet</p>
                            <p className="text-sm mt-2 opacity-80 font-medium feed-text-faint">Start swiping right to match!</p>
                        </div>
                    ) : (
                        connections.map(user => (
                            <div key={user._id} className="group flex items-center gap-3 p-3 rounded-2xl transition-all cursor-pointer feed-sidebar-item" onClick={() => navigate(`/user/${user._id}`, { state: { user } })}>
                                <img src={user.photoUrl || defaultAvatar} alt={user.firstName} className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm" onError={(e) => { e.target.src = defaultAvatar; }} />
                                <div className="flex-1 min-w-0">
                                    <p className="text-[15px] font-bold feed-text-main truncate">{user.firstName} {user.lastName}</p>
                                    <p className="text-xs font-semibold text-purple-500 truncate">{user.skills?.[0] || 'Developer'}</p>
                                </div>
                                <Link to={`/chat/${user._id}`} className="p-2.5 rounded-full bg-blue-50/80 text-blue-600 hover:bg-blue-100 group-hover:scale-105 transition-all shadow-sm" onClick={(e) => e.stopPropagation()} title="Open Chat">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 0 1-.923 1.785A5.969 5.969 0 0 0 6 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337Z" /></svg>
                                </Link>
                            </div>
                        ))
                    )}
                </div>
            </aside>

            {/* 2. CENTER: Main Swift Deck */}
            <main className="flex-1 flex justify-center w-full min-w-0">
                {renderFeedState()}
            </main>

            {/* 3. RIGHT SIDEBAR: Incoming Requests & Recommendations */}
            <aside className="hidden xl:flex flex-col w-[320px] shrink-0 h-[calc(100vh-40px)] sticky top-6 backdrop-blur-xl rounded-3xl overflow-hidden transition-all feed-sidebar">
                
                {/* Top Half: Requests */}
                <div className="flex flex-col h-1/2 border-b border-white/20">
                    <div className="p-5 pb-3 feed-sidebar-header shadow-sm z-10">
                        <h2 className="text-[1.35rem] font-extrabold feed-text-main tracking-tight flex items-center gap-2" style={{ fontFamily: "'Outfit', sans-serif" }}>
                            Requests
                            {requests?.length > 0 && (
                                <span className="bg-purple-100 text-purple-700 text-xs py-1 px-2.5 rounded-full">{requests.length}</span>
                            )}
                        </h2>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                        {(!requests || requests.length === 0) ? (
                            <div className="text-center p-4 text-gray-500 h-full flex flex-col justify-center items-center">
                                <span className="text-3xl mb-2 opacity-80">📬</span>
                                <p className="text-sm font-bold feed-text-main">No pending requests</p>
                            </div>
                        ) : (
                            requests.map(req => {
                                const user = req.fromUserId || req;
                                const isRemoving = removingReqId === req._id;
                                return (
                                    <div key={req._id} className={`group flex items-center gap-3 p-3 rounded-2xl transition-all cursor-pointer feed-sidebar-item ${isRemoving ? 'opacity-0 scale-95' : 'opacity-100'}`} style={{ transitionDuration: '300ms' }} onClick={() => navigate(`/user/${user._id}`, { state: { user } })}>
                                        <img src={user.photoUrl || defaultAvatar} alt={user.firstName} className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm" onError={(e) => { e.target.src = defaultAvatar; }} />
                                        <div className="flex-1 min-w-0 pr-1">
                                            <p className="text-[13px] font-bold feed-text-main truncate">{user.firstName} {user.lastName}</p>
                                            <p className="text-[11px] font-semibold text-gray-500 truncate">{user.skills?.[0] || 'Developer'}</p>
                                        </div>
                                        <div className="flex gap-1">
                                            <button className="p-1.5 rounded-full bg-red-50 text-red-500 hover:bg-red-100 hover:scale-110 transition-all shadow-sm" onClick={(e) => handleReviewRequest('rejected', req._id, e)} title="Reject">
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3.5 h-3.5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" /></svg>
                                            </button>
                                            <button className="p-1.5 rounded-full bg-green-50 text-green-600 hover:bg-green-100 hover:scale-110 transition-all shadow-sm" onClick={(e) => handleReviewRequest('accepted', req._id, e)} title="Accept">
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3.5 h-3.5"><path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" /></svg>
                                            </button>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* Bottom Half: Top Matches */}
                <div className="flex flex-col h-1/2">
                    <div className="p-5 pb-3 feed-sidebar-header shadow-sm z-10 flex justify-between items-center">
                        <h2 className="text-[1.35rem] font-extrabold feed-text-main tracking-tight flex items-center gap-2" style={{ fontFamily: "'Outfit', sans-serif" }}>
                            Top Matches
                        </h2>
                        <span className="bg-blue-100 text-blue-700 text-[10px] font-bold py-0.5 px-2 rounded-full uppercase tracking-wider">AI</span>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                        {(!recommendations?.matchedDevelopers?.length && !recommendations?.matchedProjects?.length) ? (
                            <div className="text-center p-4 text-gray-500 h-full flex flex-col justify-center items-center">
                                <span className="text-3xl mb-2 opacity-80">✨</span>
                                <p className="text-sm font-bold feed-text-main">No exact matches yet</p>
                                <p className="text-xs mt-1 opacity-80 font-medium feed-text-faint">Add more skills to your profile!</p>
                            </div>
                        ) : (
                            <>
                                {recommendations?.matchedDevelopers?.slice(0, 4).map(dev => (
                                    <div key={`dev-${dev._id}`} className="group flex items-center gap-3 p-3 rounded-2xl transition-all cursor-pointer feed-sidebar-item bg-white/50 hover:bg-white/80" onClick={() => navigate(`/user/${dev._id}`, { state: { user: dev } })}>
                                        <img src={dev.photoUrl || defaultAvatar} alt={dev.firstName} className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm" onError={(e) => { e.target.src = defaultAvatar; }} />
                                        <div className="flex-1 min-w-0 pr-1">
                                            <p className="text-[13px] font-bold feed-text-main truncate">{dev.firstName} {dev.lastName}</p>
                                            <p className="text-[11px] font-bold text-blue-600 truncate flex items-center gap-1">
                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3"><path fillRule="evenodd" d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.691 1.456 1.405 1.02L10 15.591l4.069 2.485c.713.436 1.598-.207 1.404-1.02l-1.106-4.637 3.62-3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.831-4.401Z" clipRule="evenodd" /></svg>
                                                {dev.matchScore} matching skills
                                            </p>
                                        </div>
                                    </div>
                                ))}
                                {recommendations?.matchedProjects?.slice(0, 3).map(proj => (
                                    <div key={`proj-${proj._id}`} className="group flex items-center gap-3 p-3 rounded-2xl transition-all cursor-pointer feed-sidebar-item bg-purple-50/50 hover:bg-purple-50/90" onClick={() => navigate(`/projects/${proj._id}`)}>
                                        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-500 to-indigo-500 flex items-center justify-center text-white font-bold text-lg shadow-sm shrink-0 border-2 border-white">
                                            {proj.title.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="flex-1 min-w-0 pr-1">
                                            <p className="text-[13px] font-bold feed-text-main truncate">{proj.title}</p>
                                            <p className="text-[10px] font-bold uppercase text-purple-600 tracking-wider">Project Match</p>
                                        </div>
                                    </div>
                                ))}
                            </>
                        )}
                    </div>
                </div>
            </aside>

        </div>
    );
};

/* ── Icons for Main Deck ── */
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