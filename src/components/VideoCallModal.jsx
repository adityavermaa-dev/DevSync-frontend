import React, { useEffect, useRef, useState } from 'react';

const VideoCallModal = ({
    isOpen,
    isIncoming,
    isOutgoing,
    callerName,
    localStream,
    remoteStream,
    onAccept,
    onDecline,
    onEndCall,
    callStatus, // 'calling', 'connected', 'ended'
}) => {
    const localVideoRef = useRef(null);
    const remoteVideoRef = useRef(null);
    const [isMuted, setIsMuted] = useState(false);
    const [isVideoOff, setIsVideoOff] = useState(false);

    useEffect(() => {
        if (localVideoRef.current && localStream) {
            localVideoRef.current.srcObject = localStream;
        }
    }, [localStream]);

    useEffect(() => {
        if (remoteVideoRef.current && remoteStream) {
            remoteVideoRef.current.srcObject = remoteStream;
        }
    }, [remoteStream]);

    const toggleMute = () => {
        if (localStream) {
            localStream.getAudioTracks().forEach(track => {
                track.enabled = !track.enabled;
            });
            setIsMuted(!isMuted);
        }
    };

    const toggleVideo = () => {
        if (localStream) {
            localStream.getVideoTracks().forEach(track => {
                track.enabled = !track.enabled;
            });
            setIsVideoOff(!isVideoOff);
        }
    };

    if (!isOpen) return null;

    return (
        <div style={styles.overlay}>
            <div style={styles.modal}>
                {/* Header / Status */}
                <div style={styles.header}>
                    <h3 style={styles.title}>
                        {isIncoming && callStatus === 'calling' ? `Incoming call from ${callerName}...` : ''}
                        {isOutgoing && callStatus === 'calling' ? `Calling ${callerName}...` : ''}
                        {callStatus === 'connected' ? `In Call with ${callerName}` : ''}
                    </h3>
                </div>

                {/* Video Streams Grid */}
                <div style={styles.videoGrid}>
                    <div style={styles.remoteVideoWrapper}>
                        {remoteStream ? (
                            <video 
                                ref={remoteVideoRef} 
                                autoPlay 
                                playsInline 
                                style={styles.remoteVideo} 
                            />
                        ) : (
                            <div style={styles.placeholder}>
                                <div style={styles.spinner} />
                                <p>Waiting for video...</p>
                            </div>
                        )}
                        <span style={styles.videoLabel}>{callerName || 'Unknown'}</span>
                    </div>

                    <div style={styles.localVideoWrapper}>
                        {localStream ? (
                            <video 
                                ref={localVideoRef} 
                                autoPlay 
                                playsInline 
                                muted 
                                style={{
                                    ...styles.localVideo,
                                    opacity: isVideoOff ? 0 : 1
                                }} 
                            />
                        ) : null}
                        {isVideoOff && <div style={styles.localPlaceholder}>Video Off</div>}
                        <span style={styles.localLabel}>You</span>
                    </div>
                </div>

                {/* Controls */}
                <div style={styles.controls}>
                    {callStatus === 'calling' && isIncoming && (
                        <>
                            <button style={styles.btnAccept} onClick={onAccept}>Accept</button>
                            <button style={styles.btnDecline} onClick={onDecline}>Decline</button>
                        </>
                    )}
                    {callStatus === 'calling' && isOutgoing && (
                        <button style={styles.btnDecline} onClick={onEndCall}>Cancel Call</button>
                    )}
                    {callStatus === 'connected' && (
                        <>
                            <button 
                                style={{ ...styles.controlBtn, background: isMuted ? '#fecaca' : 'var(--dashboard-surface-alt)' }} 
                                onClick={toggleMute}
                                title="Toggle Mic"
                            >
                                {isMuted ? '🔇' : '🎤'}
                            </button>
                            <button 
                                style={{ ...styles.controlBtn, background: isVideoOff ? '#fecaca' : 'var(--dashboard-surface-alt)' }} 
                                onClick={toggleVideo}
                                title="Toggle Camera"
                            >
                                {isVideoOff ? '🚫' : '📹'}
                            </button>
                            <button style={styles.btnDecline} onClick={onEndCall}>End Call</button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

const styles = {
    overlay: {
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.6)',
        backdropFilter: 'blur(10px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    modal: {
        width: '90%',
        maxWidth: '800px',
        background: 'var(--dashboard-glass-bg, rgba(255,255,255,0.85))',
        border: '1px solid var(--dashboard-glass-border, rgba(255,255,255,0.4))',
        borderRadius: '24px',
        padding: '24px',
        boxShadow: '0 25px 60px rgba(0,0,0,0.2)',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        fontFamily: "'Outfit', sans-serif"
    },
    header: {
        textAlign: 'center',
    },
    title: {
        margin: 0,
        fontSize: '1.5rem',
        fontWeight: '700',
        color: 'var(--dashboard-text-main)',
    },
    videoGrid: {
        position: 'relative',
        width: '100%',
        aspectRatio: '16/9',
        background: '#111',
        borderRadius: '16px',
        overflow: 'hidden',
        boxShadow: 'inset 0 0 40px rgba(0,0,0,0.5)',
    },
    remoteVideoWrapper: {
        width: '100%',
        height: '100%',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    remoteVideo: {
        width: '100%',
        height: '100%',
        objectFit: 'cover',
    },
    placeholder: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        color: '#fff',
        gap: '12px',
        fontFamily: "'Outfit', sans-serif"
    },
    spinner: {
        width: '40px',
        height: '40px',
        border: '4px solid rgba(255,255,255,0.2)',
        borderTopColor: '#fff',
        borderRadius: '50%',
        animation: 'spinnerSpin 1s linear infinite',
    },
    localVideoWrapper: {
        position: 'absolute',
        bottom: '20px',
        right: '20px',
        width: '160px',
        height: '120px',
        background: '#333',
        borderRadius: '12px',
        overflow: 'hidden',
        border: '2px solid rgba(255,255,255,0.2)',
        boxShadow: '0 8px 20px rgba(0,0,0,0.4)',
    },
    localVideo: {
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        transform: 'scaleX(-1)', // mirror self
    },
    localPlaceholder: {
        position: 'absolute',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#333',
        color: '#fff',
        fontSize: '0.8rem',
    },
    videoLabel: {
        position: 'absolute',
        bottom: '12px',
        left: '12px',
        background: 'rgba(0,0,0,0.5)',
        color: '#fff',
        padding: '4px 12px',
        borderRadius: '12px',
        fontSize: '0.9rem',
    },
    localLabel: {
        position: 'absolute',
        bottom: '6px',
        left: '6px',
        background: 'rgba(0,0,0,0.5)',
        color: '#fff',
        padding: '2px 8px',
        borderRadius: '8px',
        fontSize: '0.7rem',
    },
    controls: {
        display: 'flex',
        justifyContent: 'center',
        gap: '16px',
        padding: '10px 0 0',
    },
    btnAccept: {
        background: '#10b981',
        color: '#fff',
        border: 'none',
        padding: '12px 32px',
        borderRadius: '99px',
        fontSize: '1.1rem',
        fontWeight: '700',
        cursor: 'pointer',
        boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
        transition: 'all 0.2s',
    },
    btnDecline: {
        background: '#ef4444',
        color: '#fff',
        border: 'none',
        padding: '12px 32px',
        borderRadius: '99px',
        fontSize: '1.1rem',
        fontWeight: '700',
        cursor: 'pointer',
        boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)',
        transition: 'all 0.2s',
    },
    controlBtn: {
        width: '50px',
        height: '50px',
        borderRadius: '50%',
        border: '1px solid var(--dashboard-border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '1.4rem',
        cursor: 'pointer',
        transition: 'all 0.2s',
    }
};

export default VideoCallModal;
