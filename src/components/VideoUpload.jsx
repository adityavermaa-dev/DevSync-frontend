import { useState } from 'react';

const VideoUpload = () => {
    const [videoFile, setVideoFile] = useState(null);
    const [caption, setCaption] = useState('');
    const [uploading, setUploading] = useState(false);

    const handleFileChange = (e) => {
        setVideoFile(e.target.files[0]);
    };

    const handleUpload = async () => {
        if (!videoFile) return alert('Please select a video file.');

        setUploading(true);
        const formData = new FormData();
        formData.append('video', videoFile);
        formData.append('caption', caption);

        try {
            const response = await fetch('/api/videos/upload', {
                method: 'POST',
                body: formData,
                credentials: 'include',
            });

            if (response.ok) {
                alert('Video uploaded successfully!');
                setVideoFile(null);
                setCaption('');
            } else {
                alert('Upload failed.');
            }
        } catch (error) {
            console.error('Upload error:', error);
            alert('An error occurred during upload.');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="video-upload">
            <h2>Upload Video</h2>
            <input type="file" accept="video/*" onChange={handleFileChange} />
            <textarea
                placeholder="Add a caption..."
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
            />
            <button onClick={handleUpload} disabled={uploading}>
                {uploading ? 'Uploading...' : 'Upload'}
            </button>
        </div>
    );
};

export default VideoUpload;