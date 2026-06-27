import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Page, Container, Grid } from '@/design-system/layout';
import { Card, Button, Badge, Input, Textarea } from '@/design-system/primitives';
import { Text, Heading } from '@/design-system/typography';
import { PlusCircle, MessageSquare, Target, CheckCircle2, ListTodo, Circle, Users, X } from 'lucide-react';
import axios from 'axios';
import { BASE_URL } from '@/constants/commonData';
import toast from 'react-hot-toast';
import { useSelector } from 'react-redux';

export default function TeamWorkspace() {
  const { teamId } = useParams();
  const user = useSelector(store => store.user);
  
  const [workspace, setWorkspace] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Board');

  // New Task state
  const [showNewTaskModal, setShowNewTaskModal] = useState(false);
  const [newTaskForm, setNewTaskForm] = useState({ title: '', description: '', assignee: '' });

  useEffect(() => {
    fetchWorkspace();
    fetchTasks();
  }, [teamId]);

  const fetchWorkspace = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/workspace/${teamId}`, { withCredentials: true });
      setWorkspace(res.data);
    } catch (error) {
      toast.error('Failed to load workspace.');
    } finally {
      setLoading(false);
    }
  };

  const fetchTasks = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/workspace/${teamId}/tasks`, { withCredentials: true });
      setTasks(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        title: newTaskForm.title,
        description: newTaskForm.description,
        assignee: newTaskForm.assignee || null
      };
      await axios.post(`${BASE_URL}/api/workspace/${teamId}/tasks`, payload, { withCredentials: true });
      toast.success("Task created!");
      setShowNewTaskModal(false);
      setNewTaskForm({ title: '', description: '', assignee: '' });
      fetchTasks();
    } catch (error) {
      toast.error('Failed to create task');
    }
  };

  const handleUpdateTaskStatus = async (taskId, newStatus) => {
    try {
      await axios.put(`${BASE_URL}/api/workspace/${teamId}/tasks/${taskId}`, { status: newStatus }, { withCredentials: true });
      fetchTasks();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  if (loading || !workspace) {
    return (
      <Page>
        <div className="flex h-[60vh] items-center justify-center">
          <div className="w-12 h-12 border-4 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin"></div>
        </div>
      </Page>
    );
  }

  const { team, members } = workspace;

  const getTasksByStatus = (status) => tasks.filter(t => t.status === status);

  return (
    <Page>
      <div className="border-b border-[var(--border-color)] bg-[var(--bg-secondary)]">
        <Container maxWidth="xl" className="py-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <Heading level={2}>{team.name}</Heading>
                <Badge variant="primary">{team.status}</Badge>
              </div>
              <Text className="text-[var(--text-secondary)]">Project: <span className="font-medium text-[var(--text-primary)]">{team.projectId?.title}</span></Text>
            </div>
            
            <div className="flex -space-x-2">
              {members.map(m => (
                <img key={m._id} src={m.userId.photoUrl || 'https://via.placeholder.com/40'} alt={m.userId.firstName} className="w-10 h-10 rounded-full border-2 border-[var(--bg-secondary)]" title={`${m.userId.firstName} (${m.role})`} />
              ))}
            </div>
          </div>
          
          <div className="flex gap-6 mt-8">
            {['Board', 'Chat'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-3 font-medium transition-colors border-b-2 ${
                  activeTab === tab 
                    ? 'border-[var(--color-primary)] text-[var(--color-primary)]' 
                    : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </Container>
      </div>

      <Container maxWidth="xl" className="py-8 h-[calc(100vh-250px)]">
        {activeTab === 'Board' && (
          <div className="h-full flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <Heading level={4}>Task Board</Heading>
              <Button variant="primary" size="sm" onClick={() => setShowNewTaskModal(true)}>
                <PlusCircle size={16} className="mr-1.5" /> New Task
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-1 overflow-hidden">
              {/* TODO Column */}
              <div className="bg-[var(--bg-secondary)] rounded-xl p-4 flex flex-col gap-4 border border-[var(--border-color)] overflow-y-auto">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Circle size={16} className="text-gray-400" />
                    <Heading level={5}>To Do</Heading>
                  </div>
                  <Badge variant="secondary">{getTasksByStatus('TODO').length}</Badge>
                </div>
                {getTasksByStatus('TODO').map(task => (
                  <Card key={task._id} className="p-4 cursor-pointer hover:border-[var(--color-primary-muted)] transition-colors">
                    <Heading level={5} className="mb-2 text-sm">{task.title}</Heading>
                    {task.description && <Text size="xs" className="text-[var(--text-secondary)] mb-3 line-clamp-2">{task.description}</Text>}
                    <div className="flex justify-between items-center mt-3 pt-3 border-t border-[var(--border-color)]">
                      {task.assignee ? (
                        <img src={task.assignee.photoUrl} alt="Assignee" className="w-6 h-6 rounded-full" title={task.assignee.firstName} />
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-[var(--bg-tertiary)] flex items-center justify-center text-[10px] text-[var(--text-muted)]">?</div>
                      )}
                      <Button variant="ghost" size="sm" className="h-6 text-xs px-2" onClick={() => handleUpdateTaskStatus(task._id, 'IN_PROGRESS')}>Start →</Button>
                    </div>
                  </Card>
                ))}
              </div>

              {/* IN PROGRESS Column */}
              <div className="bg-[var(--bg-secondary)] rounded-xl p-4 flex flex-col gap-4 border border-[var(--border-color)] overflow-y-auto">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Target size={16} className="text-blue-500" />
                    <Heading level={5}>In Progress</Heading>
                  </div>
                  <Badge variant="secondary">{getTasksByStatus('IN_PROGRESS').length}</Badge>
                </div>
                {getTasksByStatus('IN_PROGRESS').map(task => (
                  <Card key={task._id} className="p-4 cursor-pointer hover:border-blue-500/50 transition-colors">
                    <Heading level={5} className="mb-2 text-sm">{task.title}</Heading>
                    <div className="flex justify-between items-center mt-3 pt-3 border-t border-[var(--border-color)]">
                      {task.assignee ? (
                        <img src={task.assignee.photoUrl} alt="Assignee" className="w-6 h-6 rounded-full" title={task.assignee.firstName} />
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-[var(--bg-tertiary)] flex items-center justify-center text-[10px] text-[var(--text-muted)]">?</div>
                      )}
                      <Button variant="ghost" size="sm" className="h-6 text-xs px-2 text-green-500 hover:text-green-400 hover:bg-green-500/10" onClick={() => handleUpdateTaskStatus(task._id, 'DONE')}>Done ✓</Button>
                    </div>
                  </Card>
                ))}
              </div>

              {/* DONE Column */}
              <div className="bg-[var(--bg-secondary)] rounded-xl p-4 flex flex-col gap-4 border border-[var(--border-color)] overflow-y-auto">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-green-500" />
                    <Heading level={5}>Done</Heading>
                  </div>
                  <Badge variant="secondary">{getTasksByStatus('DONE').length}</Badge>
                </div>
                {getTasksByStatus('DONE').map(task => (
                  <Card key={task._id} className="p-4 opacity-75">
                    <Heading level={5} className="mb-2 text-sm line-through text-[var(--text-secondary)]">{task.title}</Heading>
                    <div className="flex justify-between items-center mt-3 pt-3 border-t border-[var(--border-color)]">
                      {task.assignee && (
                        <img src={task.assignee.photoUrl} alt="Assignee" className="w-6 h-6 rounded-full grayscale" title={task.assignee.firstName} />
                      )}
                      <Text size="xs" className="text-green-500">Completed</Text>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'Chat' && (
          <div className="h-full flex flex-col items-center justify-center border-2 border-dashed border-[var(--border-color)] rounded-xl">
             <MessageSquare size={48} className="text-[var(--text-muted)] mb-4" />
             <Heading level={4} className="mb-2">Team Chat Integration</Heading>
             <Text className="text-[var(--text-secondary)] text-center max-w-md">
               The team chat is automatically synced with your DevSync messages. <br/>
               Go to your Inbox to chat with the team.
             </Text>
             <Button variant="primary" className="mt-6" onClick={() => window.location.href='/chat'}>Open Inbox</Button>
          </div>
        )}
      </Container>

      {/* New Task Modal */}
      {showNewTaskModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <Card className="w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-6">
              <Heading level={3}>New Task</Heading>
              <button onClick={() => setShowNewTaskModal(false)} className="text-[var(--text-muted)] hover:text-white"><X/></button>
            </div>
            
            <form onSubmit={handleCreateTask} className="flex flex-col gap-4">
              <div>
                <Text size="sm" weight="medium" className="mb-1">Title</Text>
                <Input value={newTaskForm.title} onChange={e => setNewTaskForm({...newTaskForm, title: e.target.value})} required placeholder="What needs to be done?" />
              </div>
              
              <div>
                <Text size="sm" weight="medium" className="mb-1">Description (Optional)</Text>
                <Textarea value={newTaskForm.description} onChange={e => setNewTaskForm({...newTaskForm, description: e.target.value})} placeholder="Add details..." />
              </div>

              <div>
                <Text size="sm" weight="medium" className="mb-1">Assignee</Text>
                <select 
                  className="w-full px-4 py-2 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary)] transition-colors"
                  value={newTaskForm.assignee}
                  onChange={e => setNewTaskForm({...newTaskForm, assignee: e.target.value})}
                >
                  <option value="">Unassigned</option>
                  {members.map(m => (
                    <option key={m.userId._id} value={m.userId._id}>{m.userId.firstName} {m.userId.lastName}</option>
                  ))}
                </select>
              </div>

              <div className="pt-4 border-t border-[var(--border-color)] flex justify-end gap-3 mt-2">
                <Button variant="outline" type="button" onClick={() => setShowNewTaskModal(false)}>Cancel</Button>
                <Button variant="primary" type="submit">Create Task</Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </Page>
  );
}
