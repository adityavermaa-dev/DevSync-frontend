import { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { BASE_URL } from '../constants/commonData';
import { setReels, updateReelLikeStatus } from '../redux/reelsSlice';
import './VideoFeed.css';

const VideoFeed = () => {
    const dispatch = useDispatch();
    const videos = useSelector((store) => store.reels);
    const [loading, setLoading] = useState(true);
    const videoRefs = useRef([]);

    useEffect(() => {
        fetchVideos();
    }, []);

    const fetchVideos = async () => {
        if (videos) {
            setLoading(false);
            return;
        }
        try {
            const response = await fetch(`${BASE_URL}/feed`, {
                credentials: 'include'
            });
            const data = await response.json();
            dispatch(setReels(data));
        } catch (error) {
            console.error('Error fetching videos:', error);
        } finally {
            setLoading(false);
        }
    };

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
                const isLiked = result.liked !== undefined ? result.liked : !currentVideo.liked;
                const updatedCount = isLiked ? (currentVideo.likesCount || 0) + 1 : Math.max((currentVideo.likesCount || 0) - 1, 0);

                dispatch(updateReelLikeStatus({ videoId, liked: isLiked, likesCount: updatedCount }));
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
            await response.json();
            // In a real app we'd dispatch an update to add the comment to the reel state here
        } catch (error) {
            console.error('Comment error:', error);
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

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    const video = entry.target;
                    // Play video if it's the main completely visible element
                    if (entry.isIntersecting && entry.intersectionRatio >= 0.7) {
                        // First, pause ALL videos to guarantee only 1 plays
                        videoRefs.current.forEach(v => {
                            if (v && v !== video && !v.paused) v.pause();
                        });

                        // Then play the current one
                        const playPromise = video.play();
                        if (playPromise !== undefined) {
                            playPromise.catch(e => console.log('Autoplay prevented', e));
                        }

                        // Register view logic
                        handleView(video.dataset.id);
                    } else {
                        // Automatically pause when it's scrolling out of view
                        video.pause();
                    }
                });
            },
            { threshold: [0.3, 0.7] } // Check when it's leaving (0.3) and arriving (0.7)
        );

        videoRefs.current.forEach((video) => {
            if (video) observer.observe(video);
        });

        return () => observer.disconnect();
    }, [videos]);

    const togglePlay = (e) => {
        const video = e.target;
        if (video.paused) {
            video.play();
        } else {
            video.pause();
        }
    };

    if (loading) return <div className="reels-loading">Loading Reels...</div>;

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
                <div key={video._id} className="video-item">
                    <video
                        ref={(el) => (videoRefs.current[index] = el)}
                        data-id={video._id}
                        src={video.videoUrl}
                        loop
                        playsInline
                        onClick={togglePlay}
                    />
                    <div className="video-overlay pointer-events-none">
                        <div className="video-info pointer-events-auto w-full pr-12">
                            <p className="video-caption">{video.caption || 'No caption'}</p>
                            <div className="comment-input-container w-full">
                                <input
                                    type="text"
                                    placeholder="Add comment..."
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            handleComment(video._id, e.target.value);
                                            e.target.value = '';
                                        }
                                    }}
                                />
                            </div>
                        </div>
                        <div className="video-actions pointer-events-auto">
                            <button className="action-btn" onClick={() => handleLike(video._id)}>
                                {video.liked ? heartFilledIcon : heartOutlineIcon}
                                <span>{video.likesCount || 0}</span>
                            </button>
                            <button className="action-btn">
                                {commentIcon}
                                <span>{video.comments?.length || 0}</span>
                            </button>
                            <button className="action-btn">
                                {shareIcon}
                            </button>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

const heartOutlineIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
    </svg>
);

const heartFilledIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#FD267A" strokeWidth={1} stroke="#FD267A">
        <path d="m11.645 20.91-.007-.003-.022-.012a15.247 15.247 0 0 1-.383-.218 25.18 25.18 0 0 1-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0 1 12 5.052 5.5 5.5 0 0 1 16.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 0 1-4.244 3.17 15.247 15.247 0 0 1-.383.219l-.022.012-.007.004-.003.001a.752.752 0 0 1-.704 0l-.003-.001Z" />
    </svg>
);

const commentIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 0 1-.923 1.785A5.969 5.969 0 0 0 6 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337Z" />
    </svg>
);

const shareIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186 9.566-5.314m-9.566 7.5 9.566 5.314m0 0a2.25 2.25 0 1 0 3.935 2.186 2.25 2.25 0 0 0-3.935-2.186Zm0-12.814a2.25 2.25 0 1 0 3.933-2.185 2.25 2.25 0 0 0-3.933 2.185Z" />
    </svg>
);

export default VideoFeed;