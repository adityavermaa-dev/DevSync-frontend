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

    const fetchFeed = useCallback(async () => {
        if (feed) return;
        setLoading(true);
        try {
            const res = await axios.get(BASE_URL + '/user/feed', { withCredentials: true });
            dispatch(addFeed(res.data?.feed || res.data?.data || []));
        } catch (error) {
            console.error('Feed fetch error:', error);
            // toast.error('Failed to load feed');
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
                <div className="w-full max-w-2xl mb-6 text-center relative z-10 flex flex-col items-center mt-2">
                    <p className="feed-overline">Developer Discovery</p>
                    <h1 className="text-4xl md:text-5xl font-bold feed-text-main tracking-tight mb-3" style={{ fontFamily: "'Outfit', sans-serif", letterSpacing: '-0.02em' }}>
                        Swipe. Match. Build.
                    </h1>
                    <p className="text-sm md:text-base feed-text-faint font-medium max-w-xl px-4 leading-relaxed">
                        Discover developers who fit your stack and start real collaborations.
                    </p>
                    <div className="feed-hero-stats">
                        <span className="feed-hero-chip">{connections?.length || 0} connections</span>
                        <span className="feed-hero-chip">{requests?.length || 0} pending requests</span>
                        <span className="feed-hero-chip">{recommendations?.matchedDevelopers?.length || 0} top matches</span>
                    </div>
                </div>

                <div
                    className="tinder-stage"
                    style={{
                        backgroundImage: `linear-gradient(160deg, rgba(8, 18, 32, 0.5), rgba(8, 18, 32, 0.2)), url('${getUserPhotoUrl(currentUser)}')`
                    }}
                >
                    <div className="feed-deck m-auto">
                        {nextUser && (
                            <div className="feed-card-behind">
                                <UserCard user={nextUser} />
                            </div>
                        )}

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

                    <div className="tinder-stage-hints">
                        <span>Swipe left to pass</span>
                        <span>Swipe right to connect</span>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="tinder-home">
            <main className="tinder-main">
                {renderFeedState()}

                <section className="tinder-matches">
                    <div className="tinder-matches-head">
                        <h3>Top Matches</h3>
                        <span>AI</span>
                    </div>
                    {(!recommendations?.matchedDevelopers?.length && !recommendations?.matchedProjects?.length) ? (
                        <p className="tinder-empty-text">No matches yet. Add more skills for better suggestions.</p>
                    ) : (
                        <div className="tinder-match-row custom-scrollbar">
                            {recommendations?.matchedDevelopers?.slice(0, 6).map(dev => (
                                <button
                                    key={`dev-${dev?._id}`}
                                    type="button"
                                    className="tinder-pill"
                                    onClick={() => navigate(`/user/${dev?._id}`, { state: { user: dev } })}
                                >
                                    <img src={getUserPhotoUrl(dev)} alt={dev?.firstName} onError={(e) => { e.target.src = defaultAvatar; }} />
                                    <div>
                                        <p>{dev?.firstName}</p>
                                        <small>{dev?.matchScore || 100}%</small>
                                    </div>
                                </button>
                            ))}
                            {recommendations?.matchedProjects?.slice(0, 3).map(proj => (
                                <button
                                    key={`proj-${proj._id}`}
                                    type="button"
                                    className="tinder-pill tinder-pill-project"
                                    onClick={() => navigate(`/projects/${proj._id}`)}
                                >
                                    <div className="tinder-pill-badge">{proj.title.charAt(0).toUpperCase()}</div>
                                    <div>
                                        <p>{proj.title}</p>
                                        <small>Project</small>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </section>

                <section className="tinder-lists">
                    <div className="tinder-list-card">
                        <div className="tinder-list-head">
                            <h3>Your Network</h3>
                            <span>{connections?.length || 0}</span>
                        </div>
                        <div className="tinder-list-body custom-scrollbar">
                            {(!connections || connections.length === 0) ? (
                                <p className="tinder-empty-text">No connections yet. Swipe right to connect.</p>
                            ) : (
                                connections.slice(0, 6).map(user => (
                                    <div key={user?._id} className="tinder-list-item" onClick={() => navigate(`/user/${user?._id}`, { state: { user } })}>
                                        <img src={getUserPhotoUrl(user)} alt={user?.firstName} onError={(e) => { e.target.src = defaultAvatar; }} />
                                        <div>
                                            <p>{user?.firstName} {user?.lastName}</p>
                                            <small>{user?.skills?.[0] || 'Developer'}</small>
                                        </div>
                                        <Link to={`/chat/${user?._id}`} onClick={(e) => e.stopPropagation()}>Chat</Link>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    <div className="tinder-list-card">
                        <div className="tinder-list-head">
                            <h3>Requests</h3>
                            <span>{requests?.length || 0}</span>
                        </div>
                        <div className="tinder-list-body custom-scrollbar">
                            {(!requests || requests.length === 0) ? (
                                <p className="tinder-empty-text">No pending requests.</p>
                            ) : (
                                requests.slice(0, 6).map(req => {
                                    const user = req?.fromUserId || req;
                                    const isRemoving = removingReqId === req?._id;
                                    return (
                                        <div key={req?._id} className={`tinder-list-item ${isRemoving ? 'opacity-0 scale-95' : 'opacity-100'}`} style={{ transitionDuration: '300ms' }} onClick={() => navigate(`/user/${user?._id}`, { state: { user } })}>
                                            <img src={getUserPhotoUrl(user)} alt={user?.firstName} onError={(e) => { e.target.src = defaultAvatar; }} />
                                            <div>
                                                <p>{user?.firstName} {user?.lastName}</p>
                                                <small>{user?.skills?.[0] || 'Developer'}</small>
                                            </div>
                                            <div className="tinder-list-actions" onClick={(e) => e.stopPropagation()}>
                                                <button type="button" onClick={(e) => handleReviewRequest('rejected', req?._id, e)}>×</button>
                                                <button type="button" onClick={(e) => handleReviewRequest('accepted', req?._id, e)}>✓</button>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
}

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