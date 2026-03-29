import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { BASE_URL } from '../constants/commonData';
import toast from 'react-hot-toast';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import defaultAvatar from '../assests/images/default-user-image.png';
import './BuildLogs.css';

const BuildLogs = () => {
    const user = useSelector(store => store.user);
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isPosting, setIsPosting] = useState(false);
    
    // Form state
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [tags, setTags] = useState('');

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const res = await axios.get(BASE_URL + '/build-logs', { withCredentials: true });
            setLogs(res.data);
        } catch (error) {
            console.error('Error fetching logs:', error);
            toast.error('Failed to load logs');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs();
    }, []);

    const handlePostLog = async (e) => {
        e.preventDefault();
        if (!title.trim() || !content.trim()) {
            toast.error('Title and Content are required');
            return;
        }

        setIsPosting(true);
        try {
            const formattedTags = tags.split(',').map(t => t.trim()).filter(t => t);
            const payload = {
                title,
                content,
                tags: formattedTags
            };

            const res = await axios.post(BASE_URL + '/build-logs', payload, { withCredentials: true });
            
            // Unshift new log to top
            setLogs([res.data, ...logs]);
            toast.success('Log posted successfully!');
            
            // Reset form
            setTitle('');
            setContent('');
            setTags('');
        } catch (error) {
            console.error('Error posting log:', error);
            toast.error('Failed to post log');
        } finally {
            setIsPosting(false);
        }
    };

    const handleToggleLike = async (logId) => {
        try {
            const res = await axios.post(BASE_URL + `/build-logs/${logId}/like`, {}, { withCredentials: true });
            
            // Optimistically update
            setLogs(logs.map(log => {
                if (log._id === logId) {
                    return { ...log, likes: res.data.likes };
                }
                return log;
            }));
        } catch (error) {
            console.error('Error liking log:', error);
            toast.error('Failed to update like');
        }
    };

    const handleDeleteLog = async (logId) => {
        try {
            await axios.delete(BASE_URL + `/build-logs/${logId}`, { withCredentials: true });
            setLogs(logs.filter(log => log._id !== logId));
            toast.success('Log deleted');
        } catch (error) {
            console.error('Error deleting log:', error);
            toast.error('Failed to delete log');
        }
    };

    const formatDate = (dateString) => {
        const options = { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
        return new Date(dateString).toLocaleDateString('en-US', options);
    };

    return (
        <div className="buildlogs-container w-full max-w-[1000px] mx-auto px-4 py-8">
            <div className="text-center mb-10">
                <h1 className="text-4xl md:text-5xl font-extrabold feed-text-main tracking-tight mb-3" style={{ fontFamily: "'Outfit', sans-serif" }}>
                    Build Logs
                </h1>
                <p className="text-sm md:text-base feed-text-faint font-medium mx-auto max-w-lg leading-relaxed">
                    Share your daily progress, code snippets, and mini-updates with the community. Markdown is fully supported!
                </p>
            </div>

            {/* Post Creation Box */}
            <div className="buildlog-create-card mb-10 bg-white/60 dark:bg-[#1E1E24]/60 backdrop-blur-xl border border-white/40 shadow-xl rounded-3xl p-6">
                <div className="flex items-center gap-4 mb-4">
                    <img src={user?.photoUrl || defaultAvatar} alt="You" className="w-12 h-12 rounded-full border-2 border-purple-500 object-cover" />
                    <h3 className="text-lg font-bold feed-text-main">What did you build today?</h3>
                </div>
                
                <form onSubmit={handlePostLog}>
                    <input 
                        type="text" 
                        className="buildlog-input w-full bg-white/60 dark:bg-black/20 border-none rounded-xl p-3 mb-3 text-sm font-semibold focus:ring-2 focus:ring-purple-400 outline-none feed-text-main transition-all"
                        placeholder="Log Title (e.g., Implemented WebSocket chat!)"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                    />
                    
                    <textarea 
                        className="buildlog-textarea w-full bg-white/60 dark:bg-black/20 border-none rounded-xl p-3 mb-3 text-sm focus:ring-2 focus:ring-purple-400 outline-none feed-text-main min-h-[120px] resize-y transition-all"
                        placeholder="Write your update here... Supports Markdown! Try code blocks, lists, etc."
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        required
                    />
                    
                    <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
                        <input 
                            type="text" 
                            className="buildlog-input w-full md:w-2/3 bg-white/60 dark:bg-black/20 border-none rounded-xl p-3 text-sm focus:ring-2 focus:ring-purple-400 outline-none feed-text-main transition-all"
                            placeholder="Tags (comma separated, e.g., react, backend, bugfix)"
                            value={tags}
                            onChange={(e) => setTags(e.target.value)}
                        />
                        <button 
                            type="submit" 
                            disabled={isPosting}
                            className={`w-full md:w-auto px-8 py-3 rounded-xl font-bold text-white bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 shadow-lg shadow-purple-500/30 transition-all ${isPosting ? 'opacity-70 cursor-not-allowed' : 'hover:scale-105'}`}
                        >
                            {isPosting ? 'Posting...' : 'Post Log 🚀'}
                        </button>
                    </div>
                </form>
            </div>

            {/* Feed Section */}
            <div className="buildlog-feed space-y-6">
                {loading ? (
                    <div className="flex justify-center py-10">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-500"></div>
                    </div>
                ) : logs.length === 0 ? (
                    <div className="text-center py-16 bg-white/40 dark:bg-[#1E1E24]/40 backdrop-blur-md rounded-3xl border border-white/20">
                        <span className="text-5xl mb-4 inline-block">📝</span>
                        <h2 className="text-xl font-bold feed-text-main mb-2">No logs yet!</h2>
                        <p className="feed-text-faint text-sm">Be the first to share your developer journey.</p>
                    </div>
                ) : (
                    logs.map(log => {
                        const isLiked = user && log.likes.includes(user._id);
                        const isAuthor = user && log.author._id === user._id;

                        return (
                            <div key={log._id} className="buildlog-card bg-white/80 dark:bg-[#1A1A1F]/80 backdrop-blur-xl border border-white/30 dark:border-gray-800 shadow-md rounded-3xl p-6 transition-all hover:shadow-xl">
                                
                                {/* Header */}
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-3">
                                        <img src={log.author?.photoUrl || defaultAvatar} alt={log.author?.firstName} className="w-10 h-10 rounded-full object-cover" />
                                        <div>
                                            <p className="text-[15px] font-bold feed-text-main">
                                                {log.author?.firstName} {log.author?.lastName}
                                            </p>
                                            <p className="text-[11px] font-semibold text-gray-500">
                                                {formatDate(log.createdAt)} 
                                                {log.author?.githubUsername && ` • @${log.author.githubUsername}`}
                                            </p>
                                        </div>
                                    </div>
                                    
                                    {isAuthor && (
                                        <button 
                                            onClick={() => handleDeleteLog(log._id)}
                                            className="p-2 text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors"
                                            title="Delete Log"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" /></svg>
                                        </button>
                                    )}
                                </div>

                                {/* Title */}
                                <h3 className="text-xl font-bold feed-text-main mb-3">{log.title}</h3>

                                {/* Markdown Content */}
                                <div className="buildlog-content prose prose-sm dark:prose-invert max-w-none feed-text-main opacity-90 mb-5 text-[15px]">
                                    <ReactMarkdown 
                                        remarkPlugins={[remarkGfm]}
                                        components={{
                                            code({node, inline, className, children, ...props}) {
                                                const match = /language-(\w+)/.exec(className || '');
                                                return !inline && match ? (
                                                    <SyntaxHighlighter
                                                        {...props}
                                                        children={String(children).replace(/\n$/, '')}
                                                        style={atomDark}
                                                        language={match[1]}
                                                        PreTag="div"
                                                        className="rounded-xl overflow-hidden shadow-sm !my-4 text-sm"
                                                    />
                                                ) : (
                                                    <code {...props} className="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-purple-600 dark:text-purple-400 font-mono text-[13px]">
                                                        {children}
                                                    </code>
                                                )
                                            }
                                        }}
                                    >
                                        {log.content}
                                    </ReactMarkdown>
                                </div>

                                {/* Tags */}
                                {log.tags && log.tags.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mb-4">
                                        {log.tags.map((tag, idx) => (
                                            <span key={idx} className="bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 text-[11px] font-bold px-2 py-1 rounded-md uppercase tracking-wide">
                                                #{tag}
                                            </span>
                                        ))}
                                    </div>
                                )}

                                {/* Card Footer Actions */}
                                <div className="border-t border-gray-100 dark:border-gray-800 pt-4 mt-auto flex items-center justify-between">
                                    <button 
                                        onClick={() => handleToggleLike(log._id)}
                                        className={`flex items-center gap-2 px-3 py-1.5 rounded-full transition-all text-sm font-bold ${isLiked ? 'bg-pink-50 text-pink-500 dark:bg-pink-500/20' : 'bg-gray-50 text-gray-500 hover:bg-pink-50 hover:text-pink-500 dark:bg-gray-800 dark:text-gray-400 dark:hover:text-pink-400'}`}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={`w-5 h-5 transition-transform ${isLiked ? 'scale-110' : ''}`}>
                                            <path d="M9.653 16.915l-.005-.003-.019-.01a20.759 20.759 0 01-1.162-.682 22.045 22.045 0 01-2.582-1.9C4.045 12.733 2 10.352 2 7.5a4.5 4.5 0 018-2.828A4.5 4.5 0 0118 7.5c0 2.852-2.044 5.233-3.885 6.82a22.049 22.049 0 01-3.744 2.582l-.019.01-.005.003h-.002a.739.739 0 01-.69.001l-.002-.001z" />
                                        </svg>
                                        {log.likes.length}
                                    </button>

                                    {/* Copy link option - could be enhanced */}
                                    <button 
                                        className="text-gray-400 hover:text-purple-500 transition-colors p-2"
                                        title="Share Log"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186 9.566-5.314m-9.566 7.5 9.566 5.314m0 0a2.25 2.25 0 1 0 3.935 2.186 2.25 2.25 0 0 0-3.935-2.186Zm0-12.814a2.25 2.25 0 1 0 3.933-2.185 2.25 2.25 0 0 0-3.933 2.185Z" /></svg>
                                    </button>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default BuildLogs;
