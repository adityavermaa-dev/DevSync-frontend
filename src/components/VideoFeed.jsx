import { useEffect, useState, useRef } from 'react';

const VideoFeed = () => {
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const videoRefs = useRef([]);

    useEffect(() => {
        fetchVideos();
    }, []);

    const fetchVideos = async () => {
        try {
            const response = await fetch('/api/videos/feed');
            const data = await response.json();
            setVideos(data);
        } catch (error) {
            console.error('Error fetching videos:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleLike = async (videoId) => {
        try {
            const response = await fetch('/api/videos/like', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: 'currentUserId', videoId }),
                credentials: 'include',
            });
            const result = await response.json();
            setVideos(videos.map(v => v._id === videoId ? { ...v, likesCount: result.liked ? v.likesCount + 1 : v.likesCount - 1 } : v));
        } catch (error) {
            console.error('Like error:', error);
        }
    };

    const handleComment = async (videoId, text) => {
        try {
            const response = await fetch('/api/videos/comment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: 'currentUserId', videoId, text }),
                credentials: 'include',
            });
            const comment = await response.json();
        } catch (error) {
            console.error('Comment error:', error);
        }
    };

    const handleView = async (videoId) => {
        try {
            await fetch(`/api/videos/${videoId}/view`, { method: 'PATCH' });
        } catch (error) {
            console.error('View increment error:', error);
        }
    };

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    const video = entry.target;
                    if (entry.isIntersecting) {
                        video.play();
                        handleView(video.dataset.id);
                    } else {
                        video.pause();
                    }
                });
            },
            { threshold: 0.5 }
        );

        videoRefs.current.forEach((video) => {
            if (video) observer.observe(video);
        });

        return () => observer.disconnect();
    }, [videos]);

    if (loading) return <div>Loading...</div>;

    return (
        <div className="video-feed">
            {videos.map((video, index) => (
                <div key={video._id} className="video-item">
                    <video
                        ref={(el) => (videoRefs.current[index] = el)}
                        data-id={video._id}
                        src={video.videoUrl}
                        muted
                        loop
                        playsInline
                        style={{ width: '100%', height: 'auto' }}
                    />
                    <div className="video-overlay">
                        <p>{video.caption}</p>
                        <button onClick={() => handleLike(video._id)}>Like ({video.likesCount})</button>
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
            ))}
        </div>
    );
};

export default VideoFeed;