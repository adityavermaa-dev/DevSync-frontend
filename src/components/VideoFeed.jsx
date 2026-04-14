import { useEffect, useState, useRef, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { BASE_URL } from '../constants/commonData';
import { setReels, updateReelLikeStatus } from '../redux/reelsSlice';
import defaultAvatar from '../assests/images/default-user-image.png';
import './VideoFeed.css';

const VideoFeed = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const videos = useSelector((store) => store.reels);
    const user = useSelector(store => store.user);
    const [loading, setLoading] = useState(true);
    
    // Comments state
    const [activeCommentsVideoId, setActiveCommentsVideoId] = useState(null);
    const [comments, setComments] = useState([]);
    const [loadingComments, setLoadingComments] = useState(false);
    
    const videoRefs = useRef([]);

    const fetchVideos = useCallback(async () => {
        if (videos) {
            setLoading(false);
            return;
        }
        try {
            const response = await fetch(`${BASE_URL}/feed`, { credentials: 'include' });
            const data = await response.json();
            dispatch(setReels(data));
        } catch (error) {
            console.error('Error fetching videos:', error);
        } finally {
            setLoading(false);
        }
    }, [dispatch, videos]);

    useEffect(() => {
        fetchVideos();
    }, [fetchVideos]);

    const handleLike = async (videoId) => {
        try {
            const response = await fetch(`${BASE_URL}/like`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ videoId }),
                credentials: 'include',
            });
            const result = await response.json();

            const currentVideo = videos.find(v => v._id === videoId);
            if (currentVideo) {
                const isLiked = result.liked !== undefined ? result.liked : !currentVideo.isLiked;
                const updatedCount = isLiked ? (currentVideo.likesCount || 0) + 1 : Math.max((currentVideo.likesCount || 0) - 1, 0);
                dispatch(updateReelLikeStatus({ videoId, isLiked, likesCount: updatedCount }));
            }
        } catch (error) {
            console.error('Like error:', error);
        }
    };

    const handleComment = async (videoId, text) => {
        if (!text.trim()) return;
        try {
            const response = await fetch(`${BASE_URL}/comment`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ videoId, text }),
                credentials: 'include',
            });
            const newComment = await response.json();

            if (activeCommentsVideoId === videoId) {
                const currentUser = {
                    _id: user?._id,
                    firstName: user?.firstName || 'You',
                    lastName: user?.lastName || '',
                    photoUrl: user?.photoUrl || defaultAvatar
                };
                setComments(prev => [...prev, { ...newComment, userId: currentUser }]);
            }
        } catch (error) {
            console.error('Comment error:', error);
        }
    };

    const fetchCommentsForVideo = async (videoId) => {
        setActiveCommentsVideoId(videoId);
        setLoadingComments(true);
        try {
            const res = await fetch(`${BASE_URL}/comments/${videoId}`, { credentials: 'include' });
            const data = await res.json();
            setComments(data);
        } catch (error) {
            console.error('Error fetching comments:', error);
        } finally {
            setLoadingComments(false);
        }
    };

    const handleView = async (videoId) => {
        try {
            await fetch(`${BASE_URL}/${videoId}/view`, { method: 'PATCH', credentials: 'include' });
        } catch (error) {
            console.error('View increment error:', error);
        }
    };

    useEffect(() => {
        if (!videos || videos.length === 0) return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                const video = entry.target;
                if (entry.isIntersecting && entry.intersectionRatio >= 0.7) {
                    videoRefs.current.forEach(v => {
                        if (v && v !== video && !v.paused) v.pause();
                    });
                    const playPromise = video.play();
                    if (playPromise !== undefined) { playPromise.catch(e => console.log('Autoplay prevented', e)); }
                    handleView(video.dataset.id);
                    
                    // Clear comments if switching videos
                    setActiveCommentsVideoId(null);
                } else {
                    video.pause();
                }
            });
        }, { threshold: [0.3, 0.7] });

        videoRefs.current.forEach((video) => {
            if (video) observer.observe(video);
        });

        return () => observer.disconnect();
    }, [videos]);

    const togglePlay = (videoEl) => {
        if (!videoEl) return;
        if (videoEl.paused) videoEl.play();
        else videoEl.pause();
    };

    const handleViewProfile = (targetUser, e) => {
        if (e) e.stopPropagation();
        if (targetUser && targetUser._id) {
            navigate(`/user/${targetUser._id}`, { state: { user: targetUser } });
        }
    };

    if (loading) return <div className="reels-loading"><h2>Loading Reels...</h2></div>;

    if (!videos || videos.length === 0) {
        return (
            <div className="no-reels">
                <h2>No videos available yet</h2>
                <p>Be the first to upload one!</p>
            </div>
        );
    }

    return (
        <div className="video-feed">
            {videos.map((video, index) => (
                <div key={video._id} className="video-item-split">
                    {/* Left Column: Video */}
                    <div className="video-player-container" onClick={() => togglePlay(videoRefs.current[index])}>
                        <video
                            ref={(el) => (videoRefs.current[index] = el)}
                            data-id={video._id}
                            src={video.videoUrl}
                            loop
                            playsInline
                        />
                        {/* Mobile Overlay (Only visible on small screens to mimic old layout) */}
                        <div className="mobile-overlay-actions">
                            <button className="mobile-action-btn" onClick={(e) => { e.stopPropagation(); handleLike(video._id); }}>
                                {video.isLiked ? heartFilledIcon : heartOutlineIcon}
                            </button>
                            <button className="mobile-action-btn" onClick={(e) => { e.stopPropagation(); fetchCommentsForVideo(video._id); }}>
                                {commentIcon}
                            </button>
                            <button className="mobile-action-btn" onClick={(e) => e.stopPropagation()}>
                                {shareIcon}
                            </button>
                        </div>
                    </div>

                    {/* Right Column: Information Panel (Hidden on very small screens, integrated into modal logic normally, but here flex) */}
                    <div className="video-interaction-panel">
                        {/* Header */}
                        <div className="interaction-header">
                            <div className="flex items-center gap-3 cursor-pointer" onClick={(e) => handleViewProfile(video.userId, e)}>
                                <img
                                    src={video.userId?.photoUrl || defaultAvatar}
                                    alt={video.userId?.firstName}
                                    className="panel-avatar"
                                />
                                <span className="panel-author-name">{video.userId?.firstName} {video.userId?.lastName}</span>
                            </div>
                            <button className="panel-more-btn">•••</button>
                        </div>

                        {/* Middle: Scrollable Comments & Caption */}
                        <div className="interaction-body">
                            {/* Caption Block */}
                            <div className="panel-caption-block">
                                <img
                                    src={video.userId?.photoUrl || defaultAvatar}
                                    alt={video.userId?.firstName}
                                    className="panel-avatar-small cursor-pointer"
                                    onClick={(e) => handleViewProfile(video.userId, e)}
                                />
                                <div className="panel-caption-text" style={{width: '100%'}}>
                                    <span 
                                        className="font-bold cursor-pointer hover:underline mr-2" 
                                        onClick={(e) => handleViewProfile(video.userId, e)}
                                    >
                                        {video.userId?.firstName}
                                    </span>
                                    {video.caption || 'No caption provided.'}

                                    {/* Linked Project */}
                                    {video.targetProject && (
                                        <div style={{ marginTop: '12px', marginBottom: '8px' }}>
                                            <div 
                                                className="video-project-link" 
                                                onClick={(e) => { e.stopPropagation(); navigate(`/projects/${video.targetProject._id || video.targetProject}`); }}
                                                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', backgroundColor: 'rgba(139, 92, 246, 0.1)', color: '#8b5cf6', padding: '6px 14px', borderRadius: '12px', fontSize: '0.85rem', fontWeight: '700', cursor: 'pointer', border: '1px solid rgba(139, 92, 246, 0.2)' }}
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" style={{width:14, height:14}}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.25 9.75 16.5 12l-2.25 2.25m-4.5 0L7.5 12l2.25-2.25M6 20.25h12A2.25 2.25 0 0 0 20.25 18V6A2.25 2.25 0 0 0 18 3.75H6A2.25 2.25 0 0 0 3.75 6v12A2.25 2.25 0 0 0 6 20.25Z" />
                                                </svg>
                                                Linked Project
                                            </div>
                                        </div>
                                    )}

                                    {/* Code Snippet */}
                                    {video.codeSnippet && (
                                        <div className="video-code-snippet" style={{ marginTop: '12px', backgroundColor: 'var(--dashboard-surface-alt)', padding: '12px', borderRadius: '12px', border: '1px solid var(--dashboard-border)' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                                <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--dashboard-text-faint)', textTransform: 'uppercase' }}>Snippet</span>
                                                <button 
                                                    onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(video.codeSnippet); toast.success("Copied snippet"); }}
                                                    style={{ background: 'none', border: 'none', color: '#8b5cf6', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 'bold' }}
                                                >
                                                    Copy
                                                </button>
                                            </div>
                                            <pre style={{ margin: 0, padding: 0, whiteSpace: 'pre-wrap', fontFamily: '"JetBrains Mono", monospace', fontSize: '0.85rem', color: 'var(--dashboard-text-secondary)', overflowX: 'auto' }}>
                                                <code>{video.codeSnippet}</code>
                                            </pre>
                                        </div>
                                    )}
                                </div>
                            </div>
                            
                            <hr className="panel-divider" />

                            {/* Comments Inline */}
                            <div className="panel-comments-list">
                                {activeCommentsVideoId === video._id ? (
                                    loadingComments ? (
                                        <div className="panel-loading-text">Loading comments...</div>
                                    ) : comments.length === 0 ? (
                                        <div className="panel-loading-text">No comments yet.</div>
                                    ) : (
                                        comments.map(c => (
                                            <div key={c._id} className="panel-comment-item">
                                                <img
                                                    src={c.userId?.photoUrl || defaultAvatar}
                                                    alt={c.userId?.firstName}
                                                    className="panel-avatar-small cursor-pointer"
                                                    onClick={(e) => handleViewProfile(c.userId, e)}
                                                />
                                                <div className="panel-comment-text">
                                                    <span 
                                                        className="font-bold cursor-pointer hover:underline mr-2"
                                                        onClick={(e) => handleViewProfile(c.userId, e)}
                                                    >
                                                        {c.userId?.firstName}
                                                    </span>
                                                    {c.text}
                                                </div>
                                            </div>
                                        ))
                                    )
                                ) : (
                                    <div 
                                        className="panel-view-comments-btn cursor-pointer" 
                                        onClick={() => fetchCommentsForVideo(video._id)}
                                    >
                                        View all {video.commentsCount || ''} comments
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Footer: Actions & Input */}
                        <div className="interaction-footer">
                            <div className="panel-actions-row">
                                <button className="panel-action-icon" onClick={() => handleLike(video._id)}>
                                    {video.isLiked ? heartFilledIcon : heartOutlineIcon}
                                </button>
                                <button className="panel-action-icon" onClick={() => fetchCommentsForVideo(video._id)}>
                                    {commentIcon}
                                </button>
                                <button className="panel-action-icon">
                                    {shareIcon}
                                </button>
                            </div>
                            <p className="panel-likes-count">{video.likesCount || 0} likes</p>
                            
                            <div className="panel-comment-input">
                                <input
                                    type="text"
                                    placeholder="Add a comment..."
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            handleComment(video._id, e.target.value);
                                            e.target.value = '';
                                        }
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

const heartOutlineIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" /></svg>
);

const heartFilledIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#FD267A" strokeWidth={1} stroke="#FD267A"><path d="m11.645 20.91-.007-.003-.022-.012a15.247 15.247 0 0 1-.383-.218 25.18 25.18 0 0 1-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0 1 12 5.052 5.5 5.5 0 0 1 16.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 0 1-4.244 3.17 15.247 15.247 0 0 1-.383.219l-.022.012-.007.004-.003.001a.752.752 0 0 1-.704 0l-.003-.001Z" /></svg>
);

const commentIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 0 1-.923 1.785A5.969 5.969 0 0 0 6 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337Z" /></svg>
);

const shareIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186 9.566-5.314m-9.566 7.5 9.566 5.314m0 0a2.25 2.25 0 1 0 3.935 2.186 2.25 2.25 0 0 0-3.935-2.186Zm0-12.814a2.25 2.25 0 1 0 3.933-2.185 2.25 2.25 0 0 0-3.933 2.185Z" /></svg>
);

export default VideoFeed;
