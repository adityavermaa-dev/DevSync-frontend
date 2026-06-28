import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BASE_URL } from '@/constants/commonData';
import toast from 'react-hot-toast';
import { Card, Button, Badge, Input, Textarea, Skeleton } from '@/design-system/primitives';
import { Heading, Text } from '@/design-system/typography';
import { PlusCircle, Target, Rocket, Award, MessageSquare, Trash2, Calendar } from 'lucide-react';
import { useSelector } from 'react-redux';

const LOG_TYPES = [
  { value: 'update', label: 'Update', icon: MessageSquare, color: 'text-blue-500', bg: 'bg-blue-500/10' },
  { value: 'milestone', label: 'Milestone', icon: Target, color: 'text-purple-500', bg: 'bg-purple-500/10' },
  { value: 'demo', label: 'Demo', icon: Rocket, color: 'text-orange-500', bg: 'bg-orange-500/10' },
  { value: 'win', label: 'Win', icon: Award, color: 'text-yellow-500', bg: 'bg-yellow-500/10' }
];

export default function TeamBuildJournal({ teamId, teamOwnerId }) {
  const user = useSelector(store => store.user);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  
  const [form, setForm] = useState({
    title: '',
    content: '',
    logType: 'update',
    dayNumber: ''
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchLogs();
  }, [teamId]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${BASE_URL}/api/build-logs/team/${teamId}`, { withCredentials: true });
      setLogs(res.data);
    } catch (error) {
      toast.error('Failed to load build journal entries.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.content) return toast.error('Title and content are required');
    
    setSubmitting(true);
    try {
      const payload = { ...form, teamId };
      const res = await axios.post(`${BASE_URL}/api/build-logs`, payload, { withCredentials: true });
      setLogs([res.data, ...logs]);
      setForm({ title: '', content: '', logType: 'update', dayNumber: '' });
      setShowForm(false);
      toast.success('Journal entry posted!');
    } catch (error) {
      toast.error('Failed to post entry');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (logId) => {
    try {
      await axios.delete(`${BASE_URL}/api/build-logs/${logId}`, { withCredentials: true });
      setLogs(logs.filter(l => l._id !== logId));
      toast.success('Entry deleted');
    } catch (error) {
      toast.error('Failed to delete entry');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col gap-4 w-full max-w-3xl mx-auto h-full overflow-hidden">
        {[1, 2, 3].map(i => (
          <Card key={i} className="p-4"><Skeleton className="h-20 w-full"/></Card>
        ))}
      </div>
    );
  }

  return (
    <div className="w-full max-w-3xl mx-auto h-full flex flex-col">
      <div className="flex justify-between items-center mb-6 shrink-0">
        <div>
          <Heading level={4}>Build Journal</Heading>
          <Text variant="muted" size="sm">Document your hackathon journey.</Text>
        </div>
        <Button variant={showForm ? 'outline' : 'primary'} onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : <><PlusCircle size={16} className="mr-1.5"/> New Entry</>}
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 pb-10 space-y-6 no-scrollbar">
        {showForm && (
          <Card className="p-5 border-[var(--color-primary)] bg-[var(--bg-secondary)] shadow-sm">
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Text size="sm" weight="medium" className="mb-1">Title</Text>
                  <Input value={form.title} onChange={e => setForm({...form, title: e.target.value})} placeholder="e.g., Finished the Authentication flow" required />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Text size="sm" weight="medium" className="mb-1">Type</Text>
                    <select 
                      className="w-full h-10 px-3 rounded-lg bg-[var(--bg-primary)] border border-[var(--border-color)] text-sm focus:outline-none focus:border-[var(--color-primary)]"
                      value={form.logType} onChange={e => setForm({...form, logType: e.target.value})}
                    >
                      {LOG_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <Text size="sm" weight="medium" className="mb-1">Day</Text>
                    <Input type="number" min="1" value={form.dayNumber} onChange={e => setForm({...form, dayNumber: e.target.value})} placeholder="e.g., 1" />
                  </div>
                </div>
              </div>
              <div>
                <Text size="sm" weight="medium" className="mb-1">Content</Text>
                <Textarea value={form.content} onChange={e => setForm({...form, content: e.target.value})} placeholder="What did you build today? Any blockers?" required className="min-h-[100px]" />
              </div>
              <div className="flex justify-end pt-2">
                <Button variant="primary" type="submit" loading={submitting}>Post Entry</Button>
              </div>
            </form>
          </Card>
        )}

        {logs.length === 0 && !showForm ? (
          <div className="text-center py-12 bg-[var(--bg-secondary)] rounded-xl border-2 border-dashed border-[var(--border-color)]">
            <MessageSquare size={32} className="mx-auto text-[var(--text-muted)] mb-3" />
            <Heading level={4} className="mb-1">No Journal Entries Yet</Heading>
            <Text variant="muted">Start documenting your team's progress!</Text>
          </div>
        ) : (
          <div className="relative border-l-2 border-[var(--border-color)] ml-4 space-y-6 pb-4">
            {logs.map(log => {
              const typeConfig = LOG_TYPES.find(t => t.value === log.logType) || LOG_TYPES[0];
              const Icon = typeConfig.icon;
              const canDelete = log.author?._id === user?._id || teamOwnerId === user?._id;
              
              return (
                <div key={log._id} className="relative pl-6">
                  {/* Timeline Node */}
                  <div className={`absolute -left-[17px] top-1 w-8 h-8 rounded-full border-4 border-[var(--bg-primary)] ${typeConfig.bg} flex items-center justify-center`}>
                    <Icon size={12} className={typeConfig.color} />
                  </div>
                  
                  <Card className="p-4 hover:border-[var(--color-primary-muted)] transition-colors">
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          {log.dayNumber && <Badge variant="outline" size="sm">Day {log.dayNumber}</Badge>}
                          <Badge variant="secondary" className={`${typeConfig.color} ${typeConfig.bg} border-transparent`} size="sm">{typeConfig.label}</Badge>
                          <span className="text-[11px] text-[var(--text-muted)] flex items-center gap-1">
                            <Calendar size={10} />
                            {new Date(log.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <Heading level={4} className="text-base mb-2 mt-1">{log.title}</Heading>
                        <Text className="text-[var(--text-secondary)] whitespace-pre-wrap text-sm leading-relaxed mb-4">{log.content}</Text>
                        
                        <div className="flex items-center gap-2 mt-2 pt-3 border-t border-[var(--border-subtle)]">
                          <img src={log.author?.photoUrl || 'https://via.placeholder.com/30'} alt="Author" className="w-6 h-6 rounded-full bg-[var(--bg-tertiary)]" />
                          <Text size="xs" weight="medium">{log.author?.firstName} {log.author?.lastName}</Text>
                        </div>
                      </div>
                      
                      {canDelete && (
                        <button 
                          onClick={() => handleDelete(log._id)}
                          className="text-[var(--text-muted)] hover:text-red-500 transition-colors shrink-0"
                          title="Delete entry"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </Card>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
