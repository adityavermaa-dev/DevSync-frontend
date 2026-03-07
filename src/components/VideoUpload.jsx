import { useState, useRef } from 'react';
import { BASE_URL } from '../constants/commonData';
import toast from 'react-hot-toast';
import './VideoUpload.css';

const VideoUpload = () => {
    const [videoFile, setVideoFile] = useState(null);
    const [caption, setCaption] = useState('');
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef(null);

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files.length > 0) {
            setVideoFile(e.target.files[0]);
        }
    };

    const handleUpload = async () => {
        if (!videoFile) return toast.error('Please select a video file.');

        setUploading(true);
        const uploadToast = toast.loading('Uploading your video...');

        const formData = new FormData();
        formData.append('video', videoFile);
        formData.append('caption', caption);

        try {
            const response = await fetch(`${BASE_URL}/upload`, {
                method: 'POST',
                body: formData,
                credentials: 'include',
            });

            if (response.ok) {
                toast.success('Reel uploaded successfully!', { id: uploadToast });
                setVideoFile(null);
                setCaption('');
                if (fileInputRef.current) fileInputRef.current.value = '';
            } else {
                toast.error('Upload failed.', { id: uploadToast });
            }
        } catch (error) {
            console.error('Upload error:', error);
            toast.error('An error occurred during upload.', { id: uploadToast });
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="video-upload-container">
            <div className="video-upload-card">
                <h2 className="video-upload-title">New Reel</h2>

                <div
                    className="file-input-wrapper"
                    onClick={() => fileInputRef.current?.click()}
                >
                    <input
                        type="file"
                        accept="video/*"
                        onChange={handleFileChange}
                        ref={fileInputRef}
                    />
                    {!videoFile ? (
                        <>
                            <svg className="file-input-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.748 3.748 0 0118 19.5H6.75z" />
                            </svg>
                            <span className="file-input-label">Click here to choose a video</span>
                        </>
                    ) : (
                        <span className="selected-file">{videoFile.name}</span>
                    )}
                </div>

                <textarea
                    className="video-caption-input"
                    placeholder="Write a caption..."
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                />

                <button
                    className="upload-submit-btn"
                    onClick={handleUpload}
                    disabled={uploading || !videoFile}
                >
                    {uploading ? 'Uploading...' : 'Share'}
                </button>
            </div>
        </div>
    );
};

export default VideoUpload;