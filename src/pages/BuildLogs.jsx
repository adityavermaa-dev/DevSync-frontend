import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { BASE_URL } from '../constants/commonData';
import toast from 'react-hot-toast';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Link } from 'react-router-dom';
import { Target, Rocket, Award, MessageSquare, Calendar, Folder } from 'lucide-react';
import defaultAvatar from '../assests/images/default-user-image.png';
import './BuildLogs.css';
import { Badge } from '@/design-system/primitives';

const LOG_TYPES = [
  { value: 'update', label: 'Update', icon: MessageSquare, color: 'text-blue-500', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
  { value: 'milestone', label: 'Milestone', icon: Target, color: 'text-purple-500', bg: 'bg-purple-500/10', border: 'border-purple-500/20' },
  { value: 'demo', label: 'Demo', icon: Rocket, color: 'text-orange-500', bg: 'bg-orange-500/10', border: 'border-orange-500/20' },
  { value: 'win', label: 'Win', icon: Award, color: 'text-yellow-500', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20' }
];

const BuildLogs = () => {
    const user = useSelector(store => store.user);
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);

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

    const handleToggleLike = async (logId) => {
        if (!user) return toast.error("Please login to like updates.");
        try {
            const res = await axios.post(BASE_URL + `/build-logs/${logId}/like`, {}, { withCredentials: true });
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

    const formatDate = (dateString) => {
        const options = { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
        return new Date(dateString).toLocaleDateString('en-US', options);
    };

    return (
        <div className="buildlogs-container w-full max-w-[900px] mx-auto px-4 py-8">
            <div className="text-center mb-10">
                <h1 className="text-4xl md:text-5xl font-extrabold feed-text-main tracking-tight mb-3" style={{ fontFamily: "'Outfit', sans-serif" }}>
                    Global Build Journal
                </h1>
                <p className="text-sm md:text-base feed-text-faint font-medium mx-auto max-w-lg leading-relaxed">
                    Follow the journey of teams building across DevSync. Post your own updates directly from your Team Workspace!
                </p>
            </div>

            <div className="buildlog-feed space-y-8">
                {loading ? (
                    <div className="flex justify-center py-10">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[var(--color-primary)]"></div>
                    </div>
                ) : logs.length === 0 ? (
                    <div className="text-center py-16 bg-[var(--bg-secondary)] border-2 border-dashed border-[var(--border-color)] rounded-3xl">
                        <span className="text-5xl mb-4 inline-block">🚀</span>
                        <h2 className="text-xl font-bold text-[var(--text-primary)] mb-2">No updates yet!</h2>
                        <p className="text-[var(--text-secondary)] text-sm">Teams will post their updates here soon.</p>
                    </div>
                ) : (
                    <div className="relative border-l-2 border-[var(--border-subtle)] ml-4 md:ml-8 space-y-8 pb-4">
                        {logs.map(log => {
                            const isLiked = user && log.likes.includes(user._id);
                            const typeConfig = LOG_TYPES.find(t => t.value === log.logType) || LOG_TYPES[0];
                            const Icon = typeConfig.icon;

                            return (
                                <div key={log._id} className="relative pl-6 md:pl-10">
                                    {/* Timeline Node */}
                                    <div className={`absolute -left-[17px] top-4 w-8 h-8 rounded-full border-4 border-[var(--bg-primary)] ${typeConfig.bg} flex items-center justify-center`}>
                                        <Icon size={12} className={typeConfig.color} />
                                    </div>

                                    <div className={`buildlog-card bg-[var(--bg-secondary)] border border-[var(--border-subtle)] hover:border-[var(--border-hover)] shadow-sm rounded-2xl overflow-hidden transition-all duration-200`}>
                                        
                                        {/* Team & Type Header */}
                                        <div className={`px-5 py-3 border-b border-[var(--border-subtle)] flex flex-wrap gap-3 items-center justify-between bg-gradient-to-r ${typeConfig.bg} to-transparent`}>
                                            <div className="flex flex-wrap items-center gap-2">
                                                <Badge variant="secondary" className={`${typeConfig.color} bg-white/50 dark:bg-black/20 border-transparent shadow-sm`} size="sm">
                                                    {typeConfig.label}
                                                </Badge>
                                                {log.dayNumber && <Badge variant="outline" size="sm" className="bg-[var(--bg-primary)]">Day {log.dayNumber}</Badge>}
                                                {log.teamId && (
                                                    <Link to={`/workspace/${log.teamId._id}`} className="flex items-center gap-1.5 text-sm font-medium text-[var(--text-primary)] hover:text-[var(--color-primary)] transition-colors ml-2 bg-[var(--bg-primary)] px-2.5 py-1 rounded-md border border-[var(--border-subtle)] shadow-sm">
                                                        <Folder size={14} className="text-[var(--color-primary)]" />
                                                        {log.teamId.name}
                                                    </Link>
                                                )}
                                            </div>
                                            <span className="text-[12px] text-[var(--text-muted)] flex items-center gap-1.5 font-medium">
                                                <Calendar size={12} />
                                                {formatDate(log.createdAt)}
                                            </span>
                                        </div>
                                        
                                        <div className="p-5 md:p-6">
                                            <h3 className="text-xl md:text-2xl font-bold text-[var(--text-primary)] mb-4">{log.title}</h3>
                                            
                                            <div className="buildlog-content prose prose-sm dark:prose-invert max-w-none text-[var(--text-secondary)] opacity-95 mb-6 text-[15px] leading-relaxed">
                                                <ReactMarkdown 
                                                    remarkPlugins={[remarkGfm]}
                                                    components={{
                                                        code({inline, className, children, ...props}) {
                                                            const match = /language-(\w+)/.exec(className || '');
                                                            return !inline && match ? (
                                                                <SyntaxHighlighter
                                                                    {...props}
                                                                    children={String(children).replace(/\n$/, '')}
                                                                    style={atomDark}
                                                                    language={match[1]}
                                                                    PreTag="div"
                                                                    className="rounded-xl overflow-hidden shadow-sm !my-5 text-sm"
                                                                />
                                                            ) : (
                                                                <code {...props} className="bg-[var(--bg-tertiary)] px-1.5 py-0.5 rounded text-[var(--color-primary)] font-mono text-[13px]">
                                                                    {children}
                                                                </code>
                                                            )
                                                        }
                                                    }}
                                                >
                                                    {log.content}
                                                </ReactMarkdown>
                                            </div>

                                            {log.tags && log.tags.length > 0 && (
                                                <div className="flex flex-wrap gap-2 mb-6">
                                                    {log.tags.map((tag, idx) => (
                                                        <span key={idx} className="bg-[var(--color-primary-muted)] text-[var(--color-primary)] text-[11px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wide">
                                                            #{tag}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}

                                            <div className="border-t border-[var(--border-subtle)] pt-4 mt-auto flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <img src={log.author?.photoUrl || defaultAvatar} alt={log.author?.firstName} className="w-8 h-8 rounded-full object-cover border border-[var(--border-subtle)] shadow-sm" />
                                                    <div className="flex flex-col">
                                                        <span className="text-[13px] font-bold text-[var(--text-primary)] leading-tight">
                                                            {log.author?.firstName} {log.author?.lastName}
                                                        </span>
                                                        {log.author?.githubUsername && (
                                                            <span className="text-[11px] font-medium text-[var(--text-muted)]">
                                                                @{log.author.githubUsername}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-3">
                                                    <button 
                                                        onClick={() => handleToggleLike(log._id)}
                                                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all text-sm font-bold border ${isLiked ? 'bg-pink-50 text-pink-600 border-pink-200 dark:bg-pink-500/20 dark:border-pink-500/30 dark:text-pink-400' : 'bg-[var(--bg-primary)] text-[var(--text-muted)] border-[var(--border-subtle)] hover:bg-pink-50 hover:text-pink-500 hover:border-pink-200 dark:hover:bg-pink-500/10 dark:hover:border-pink-500/20 dark:hover:text-pink-400'}`}
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={`w-4 h-4 transition-transform ${isLiked ? 'scale-110' : ''}`}>
                                                            <path d="M9.653 16.915l-.005-.003-.019-.01a20.759 20.759 0 01-1.162-.682 22.045 22.045 0 01-2.582-1.9C4.045 12.733 2 10.352 2 7.5a4.5 4.5 0 018-2.828A4.5 4.5 0 0118 7.5c0 2.852-2.044 5.233-3.885 6.82a22.049 22.049 0 01-3.744 2.582l-.019.01-.005.003h-.002a.739.739 0 01-.69.001l-.002-.001z" />
                                                        </svg>
                                                        {log.likes.length}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default BuildLogs;
