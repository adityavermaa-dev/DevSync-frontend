import { useState, useRef, useMemo } from 'react';
import { BASE_URL } from '../constants/commonData';
import toast from 'react-hot-toast';
import './VideoUpload.css';

const MAX_CAPTION = 280;

const VideoUpload = () => {
    const [videoFile, setVideoFile] = useState(null);
    const [caption, setCaption] = useState('');
    const [uploading, setUploading] = useState(false);
    const [dragActive, setDragActive] = useState(false);
    const fileInputRef = useRef(null);

    const fileSize = useMemo(() => {
        if (!videoFile) return '';
        const mb = (videoFile.size / (1024 * 1024)).toFixed(1);
        return `${mb} MB`;
    }, [videoFile]);

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files.length > 0) {
            setVideoFile(e.target.files[0]);
        }
    };

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            const file = e.dataTransfer.files[0];
            if (file.type.startsWith('video/')) {
                setVideoFile(file);
            } else {
                toast.error('Please drop a video file');
            }
        }
    };

    const handleUpload = async () => {
        if (!videoFile) return toast.error('Please select a video file.');

        setUploading(true);
        const uploadToast = toast.loading('Uploading your reel…');

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
                toast.success('Reel uploaded successfully! 🎉', { id: uploadToast });
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

    const captionLengthClass = caption.length > MAX_CAPTION 
        ? 'at-limit' 
        : caption.length > MAX_CAPTION * 0.85 
            ? 'near-limit' 
            : '';

    return (
        <div className="video-upload-container">
            <div className="video-upload-card">
                {/* Header */}
                <div className="video-upload-header">
                    <h2 className="video-upload-title">
                        <span className="video-upload-title-icon">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 01-1.125-1.125M3.375 19.5h1.5C5.496 19.5 6 18.996 6 18.375m-2.625 0V5.625m0 12.75v-1.5c0-.621.504-1.125 1.125-1.125m18.375 2.625V5.625m0 12.75c0 .621-.504 1.125-1.125 1.125m1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125m0 3.75h-1.5A1.125 1.125 0 0118 18.375M20.625 4.5H3.375m17.25 0c.621 0 1.125.504 1.125 1.125M20.625 4.5h-1.5C18.504 4.5 18 5.004 18 5.625m3.75 0v1.5c0 .621-.504 1.125-1.125 1.125M3.375 4.5c-.621 0-1.125.504-1.125 1.125M3.375 4.5h1.5C5.496 4.5 6 5.004 6 5.625m-3.75 0v1.5c0 .621.504 1.125 1.125 1.125m0 0h1.5m-1.5 0c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125m1.5-3.75C5.496 8.25 6 7.746 6 7.125v-1.5M4.875 8.25C5.496 8.25 6 8.754 6 9.375v1.5m0-5.25v5.25m0-5.25C6 5.004 6.504 4.5 7.125 4.5h9.75c.621 0 1.125.504 1.125 1.125m1.125 2.625h1.5m-1.5 0A1.125 1.125 0 0118 7.125v-1.5m1.125 2.625c-.621 0-1.125.504-1.125 1.125v1.5m2.625-2.625c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125M18 5.625v5.25M7.125 12h9.75m-9.75 0A1.125 1.125 0 016 10.875M7.125 12C6.504 12 6 12.504 6 13.125m0-2.25C6 11.496 5.496 12 4.875 12M18 10.875c0 .621-.504 1.125-1.125 1.125M18 10.875c0 .621.504 1.125 1.125 1.125m-2.25 0c.621 0 1.125.504 1.125 1.125m-12 5.25v-5.25m0 5.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125m-12 0v-1.5c0-.621-.504-1.125-1.125-1.125M18 18.375v-5.25m0 5.25v-1.5c0-.621.504-1.125 1.125-1.125M18 13.125v1.5c0 .621.504 1.125 1.125 1.125M18 13.125c0-.621.504-1.125 1.125-1.125M6 13.125v1.5c0 .621-.504 1.125-1.125 1.125M6 13.125C6 12.504 5.496 12 4.875 12m-1.5 0h1.5m-1.5 0c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125M19.125 12h1.5m0 0c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125m-17.25 0h1.5m14.25 0h1.5" />
                            </svg>
                        </span>
                        New Reel
                    </h2>
                    <p className="video-upload-subtitle">Share a short video with the DevSync community</p>
                </div>

                {/* Body */}
                <div className="video-upload-body">
                    {/* Dropzone */}
                    <div
                        className={`file-input-wrapper ${videoFile ? 'has-file' : ''} ${dragActive ? 'drag-active' : ''}`}
                        onClick={() => fileInputRef.current?.click()}
                        onDragEnter={handleDrag}
                        onDragLeave={handleDrag}
                        onDragOver={handleDrag}
                        onDrop={handleDrop}
                    >
                        <input
                            type="file"
                            accept="video/*"
                            onChange={handleFileChange}
                            ref={fileInputRef}
                        />
                        {!videoFile ? (
                            <>
                                <div className="file-input-icon-wrap">
                                    <svg className="file-input-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.748 3.748 0 0118 19.5H6.75z" />
                                    </svg>
                                </div>
                                <span className="file-input-label">
                                    <strong>Click to upload</strong> or drag and drop
                                </span>
                                <span className="file-input-hint">MP4, WebM, MOV up to 100MB</span>
                            </>
                        ) : (
                            <div className="selected-file-info">
                                <div className="selected-file-icon">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <div className="selected-file-details">
                                    <span className="selected-file">{videoFile.name}</span>
                                    <span className="selected-file-size">{fileSize}</span>
                                    <span className="selected-file-change">Click to change</span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Caption */}
                    <div className="video-caption-group">
                        <label className="video-caption-label">Caption</label>
                        <textarea
                            className="video-caption-input"
                            placeholder="Write something about your reel…"
                            value={caption}
                            onChange={(e) => setCaption(e.target.value.slice(0, MAX_CAPTION))}
                            maxLength={MAX_CAPTION}
                        />
                        <div className={`caption-char-count ${captionLengthClass}`}>
                            {caption.length}/{MAX_CAPTION}
                        </div>
                    </div>

                    {/* Submit */}
                    <button
                        className="upload-submit-btn"
                        onClick={handleUpload}
                        disabled={uploading || !videoFile}
                    >
                        {uploading ? (
                            <>
                                <div className="auth-spinner" />
                                Uploading…
                            </>
                        ) : (
                            <>
                                <svg className="upload-btn-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                                </svg>
                                Share Reel
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default VideoUpload;