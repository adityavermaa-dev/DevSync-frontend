import React, { useState, useEffect, useCallback, useMemo } from 'react';
import toast from 'react-hot-toast';
import { taskAPI } from '../utils/taskAPI';
import defaultAvatar from '../assests/images/default-user-image.png';
import './TaskBoard.css';

const TaskBoard = ({ projectId, members }) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [draggedItem, setDraggedItem] = useState(null);
  const [dragOverStatus, setDragOverStatus] = useState('');
  const [editingTaskId, setEditingTaskId] = useState('');
  const [savingTaskId, setSavingTaskId] = useState('');
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    priority: 'medium',
    status: 'todo',
    assignee: ''
  });

  const [form, setForm] = useState({
    title: '',
    description: '',
    status: 'todo',
    priority: 'medium',
    assignee: ''
  });

  const memberOptions = useMemo(() => {
    const source = Array.isArray(members) ? members : [];
    const seen = new Set();
    return source
      .map((member) => member?.user || member)
      .filter((member) => member?._id && !seen.has(member._id) && seen.add(member._id));
  }, [members]);

  const columns = [
    { id: 'todo', title: 'To Do', subtitle: 'Planned and ready' },
    { id: 'in-progress', title: 'In Progress', subtitle: 'Currently active' },
    { id: 'done', title: 'Done', subtitle: 'Completed tasks' }
  ];

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    try {
      const data = await taskAPI.getTasks(projectId);
      setTasks(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to load tasks', error);
      toast.error('Failed to load project tasks');
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const handleInputChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return toast.error('Title is required');

    try {
      const newTask = await taskAPI.createTask(projectId, {
        ...form,
        assignee: form.assignee || null
      });

      const taskToInsert = newTask?._id
        ? newTask
        : {
            _id: `local-${Date.now()}`,
            title: form.title,
            description: form.description,
            status: form.status,
            priority: form.priority,
            assignee: memberOptions.find((member) => member._id === form.assignee) || null
          };

      setTasks((prev) => [taskToInsert, ...prev]);
      setShowForm(false);
      setForm({ title: '', description: '', status: 'todo', priority: 'medium', assignee: '' });
      toast.success('Task created');
    } catch {
      toast.error('Failed to create task');
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    const previousTasks = [...tasks];
    setTasks((prev) => prev.map((task) => (task._id === taskId ? { ...task, status: newStatus } : task)));

    try {
      const updatedTask = await taskAPI.updateTask(projectId, taskId, { status: newStatus });
      if (updatedTask?._id) {
        setTasks((prev) => prev.map((task) => (task._id === taskId ? { ...task, ...updatedTask } : task)));
      }
    } catch {
      setTasks(previousTasks);
      toast.error('Failed to update task status');
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Delete this task?')) return;
    try {
      await taskAPI.deleteTask(projectId, taskId);
      setTasks((prev) => prev.filter((task) => task._id !== taskId));
      if (editingTaskId === taskId) {
        setEditingTaskId('');
      }
      toast.success('Task deleted');
    } catch {
      toast.error('Failed to delete task');
    }
  };

  const startEditTask = (task) => {
    setEditingTaskId(task._id);
    setEditForm({
      title: task.title || '',
      description: task.description || '',
      priority: task.priority || 'medium',
      status: task.status || 'todo',
      assignee: task.assignee?._id || ''
    });
  };

  const cancelEditTask = () => {
    setEditingTaskId('');
    setSavingTaskId('');
    setEditForm({ title: '', description: '', priority: 'medium', status: 'todo', assignee: '' });
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveTaskEdit = async (taskId) => {
    if (!editForm.title.trim()) {
      toast.error('Title is required');
      return;
    }

    const previousTasks = [...tasks];
    const optimisticAssignee = memberOptions.find((member) => member._id === editForm.assignee) || null;
    const optimisticUpdate = {
      title: editForm.title.trim(),
      description: editForm.description.trim(),
      priority: editForm.priority,
      status: editForm.status,
      assignee: optimisticAssignee
    };

    setSavingTaskId(taskId);
    setTasks((prev) => prev.map((task) => (task._id === taskId ? { ...task, ...optimisticUpdate } : task)));

    try {
      const updated = await taskAPI.updateTask(projectId, taskId, {
        title: optimisticUpdate.title,
        description: optimisticUpdate.description,
        priority: optimisticUpdate.priority,
        status: optimisticUpdate.status,
        assignee: editForm.assignee || null
      });

      if (updated?._id) {
        setTasks((prev) => prev.map((task) => (task._id === taskId ? { ...task, ...updated } : task)));
      }

      setSavingTaskId('');
      setEditingTaskId('');
      toast.success('Task updated');
    } catch {
      setTasks(previousTasks);
      setSavingTaskId('');
      toast.error('Failed to update task');
    }
  };

  const handleDragStart = (e, task) => {
    setDraggedItem(task);
    e.dataTransfer.effectAllowed = 'move';
    e.currentTarget.classList.add('opacity-50', 'scale-95');
  };

  const handleDragEnd = (e) => {
    e.currentTarget.classList.remove('opacity-50', 'scale-95');
    setDraggedItem(null);
    setDragOverStatus('');
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDragEnter = (status) => {
    setDragOverStatus(status);
  };

  const handleDrop = (e, targetStatus) => {
    e.preventDefault();
    setDragOverStatus('');
    if (draggedItem && draggedItem.status !== targetStatus) {
      handleStatusChange(draggedItem._id, targetStatus);
    }
  };

  if (loading) {
    return (
      <div className="w-full h-64 flex items-center justify-center bg-base-100 rounded-2xl border border-base-200 mt-4">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'high': return 'badge-error';
      case 'medium': return 'badge-warning';
      case 'low': return 'badge-success';
      default: return 'badge-ghost';
    }
  };

  return (
    <div className="w-full mt-4 bg-base-100/50 backdrop-blur-xl rounded-3xl p-4 md:p-6 shadow-sm border border-base-200 transition-all duration-300">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h3 className="text-xl md:text-2xl font-bold text-base-content tracking-tight">Project Tasks</h3>
          <p className="text-sm text-base-content/60 mt-1 font-medium">Organize work with drag and drop across columns.</p>
        </div>
        <button 
          className={`btn ${showForm ? 'btn-ghost' : 'btn-primary'} btn-sm md:btn-md rounded-xl font-bold shadow-sm transition-transform hover:-translate-y-0.5`} 
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? 'Cancel' : '+ New Task'}
        </button>
      </div>

      {showForm && (
        <form className="mb-8 p-5 bg-base-200/50 backdrop-blur-md border border-base-300 rounded-2xl animate-in fade-in slide-in-from-top-4 duration-300" onSubmit={handleCreateTask}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <input 
              className="input input-bordered input-sm md:input-md w-full bg-base-100 focus:outline-primary rounded-xl" 
              name="title" 
              placeholder="Task Title*" 
              value={form.title} 
              onChange={handleInputChange} 
              autoFocus
            />
            <select className="select select-bordered select-sm md:select-md w-full bg-base-100 focus:outline-primary rounded-xl" name="assignee" value={form.assignee} onChange={handleInputChange}>
              <option value="">Assign to (Unassigned)</option>
              {memberOptions.map((member) => (
                <option key={member._id} value={member._id}>
                  {member.firstName} {member.lastName}
                </option>
              ))}
            </select>
          </div>
          <div className="mb-4">
            <textarea 
              className="textarea textarea-bordered w-full bg-base-100 focus:outline-primary rounded-xl" 
              name="description" 
              placeholder="Description (Optional)" 
              rows="2" 
              value={form.description} 
              onChange={handleInputChange} 
            />
          </div>
          <div className="flex flex-col md:flex-row gap-4 mb-5">
            <select className="select select-bordered select-sm w-full md:w-auto bg-base-100 focus:outline-primary rounded-lg" name="priority" value={form.priority} onChange={handleInputChange}>
              <option value="low">Priority: Low</option>
              <option value="medium">Priority: Medium</option>
              <option value="high">Priority: High</option>
            </select>
            <select className="select select-bordered select-sm w-full md:w-auto bg-base-100 focus:outline-primary rounded-lg" name="status" value={form.status} onChange={handleInputChange}>
              <option value="todo">Status: To Do</option>
              <option value="in-progress">Status: In Progress</option>
              <option value="done">Status: Done</option>
            </select>
          </div>
          <div className="flex justify-end">
            <button type="submit" className="btn btn-primary btn-sm md:btn-md rounded-xl font-bold px-8 shadow-sm">Add Task</button>
          </div>
        </form>
      )}

      {!showForm && tasks.length === 0 && (
        <div className="w-full py-12 flex flex-col items-center justify-center text-center bg-base-200/30 border-2 border-dashed border-base-300 rounded-3xl">
          <div className="w-16 h-16 bg-base-100 flex items-center justify-center rounded-full shadow-sm mb-4">
            <span className="text-2xl">📝</span>
          </div>
          <h4 className="text-base-content font-bold text-lg">No tasks yet</h4>
          <p className="text-base-content/60 text-sm mt-1 max-w-sm">Create the first task to kick off the sprint and start tracking your project's progress.</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {columns.map((col) => {
          const colTasks = tasks.filter((task) => task.status === col.id);
          const isDragOver = dragOverStatus === col.id;

          return (
            <div 
              key={col.id} 
              className={`bg-base-200/40 rounded-3xl p-4 flex flex-col border transition-colors duration-200 min-h-[350px] ${isDragOver ? 'border-primary bg-primary/5' : 'border-base-300'}`}
              onDragOver={handleDragOver}
              onDragEnter={() => handleDragEnter(col.id)}
              onDrop={(e) => handleDrop(e, col.id)}
            >
              <div className="flex justify-between items-center px-2 mb-4">
                <div className="flex items-center gap-3">
                  <h4 className="text-xs font-bold text-base-content/70 uppercase tracking-widest">{col.title}</h4>
                  <span className="badge badge-sm badge-ghost font-bold rounded-md bg-base-300/50 text-base-content/70">{colTasks.length}</span>
                </div>
              </div>
              
              <div className="flex flex-col gap-3 flex-1">
                {colTasks.map((task) => {
                  const isEditing = editingTaskId === task._id;
                  const isSaving = savingTaskId === task._id;
                  const assigneeName = task.assignee
                    ? `${task.assignee.firstName || ''} ${task.assignee.lastName || ''}`.trim() || 'Assigned'
                    : 'Unassigned';

                  return (
                  <div 
                    key={task._id} 
                    className="bg-base-100 border border-base-300/60 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all duration-200 cursor-grab active:cursor-grabbing hover:border-base-300 group"
                    draggable={!isEditing && !isSaving}
                    onDragStart={(e) => handleDragStart(e, task)}
                    onDragEnd={handleDragEnd}
                  >
                    {isEditing ? (
                      <div className="flex flex-col gap-3" onClick={(e) => e.stopPropagation()}>
                        <input
                          className="input input-bordered input-sm w-full bg-base-50 focus:outline-primary rounded-lg font-semibold"
                          name="title"
                          value={editForm.title}
                          onChange={handleEditInputChange}
                          placeholder="Task title"
                          disabled={isSaving}
                        />
                        <textarea
                          className="textarea textarea-bordered textarea-sm w-full bg-base-50 focus:outline-primary rounded-lg leading-snug"
                          name="description"
                          rows="2"
                          value={editForm.description}
                          onChange={handleEditInputChange}
                          placeholder="Task description"
                          disabled={isSaving}
                        />
                        <div className="grid grid-cols-2 gap-2">
                          <select
                            className="select select-bordered select-sm w-full bg-base-50 focus:outline-primary rounded-lg"
                            name="priority"
                            value={editForm.priority}
                            onChange={handleEditInputChange}
                            disabled={isSaving}
                          >
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                          </select>
                          <select
                            className="select select-bordered select-sm w-full bg-base-50 focus:outline-primary rounded-lg"
                            name="status"
                            value={editForm.status}
                            onChange={handleEditInputChange}
                            disabled={isSaving}
                          >
                            <option value="todo">To Do</option>
                            <option value="in-progress">In Progress</option>
                            <option value="done">Done</option>
                          </select>
                        </div>
                        <select
                          className="select select-bordered select-sm w-full bg-base-50 focus:outline-primary rounded-lg"
                          name="assignee"
                          value={editForm.assignee}
                          onChange={handleEditInputChange}
                          disabled={isSaving}
                        >
                          <option value="">Unassigned</option>
                          {memberOptions.map((member) => (
                            <option key={member._id} value={member._id}>
                              {member.firstName} {member.lastName}
                            </option>
                          ))}
                        </select>
                        <div className="flex gap-2 mt-1">
                          <button
                            type="button"
                            className="btn btn-primary btn-sm flex-1 rounded-lg font-bold"
                            onClick={() => handleSaveTaskEdit(task._id)}
                            disabled={isSaving}
                          >
                            {isSaving ? <span className="loading loading-spinner loading-xs"></span> : 'Save'}
                          </button>
                          <button
                            type="button"
                            className="btn btn-ghost btn-sm flex-1 rounded-lg font-bold"
                            onClick={cancelEditTask}
                            disabled={isSaving}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex justify-between items-start gap-2 mb-2">
                          <h5 className="text-sm font-bold text-base-content leading-tight flex-1">{task.title}</h5>
                          <div className={`badge badge-sm badge-outline font-bold uppercase text-[9px] px-1.5 py-0.5 h-auto opacity-80 ${getPriorityBadge(task.priority)}`}>
                            {task.priority}
                          </div>
                        </div>
                        
                        {task.description && (
                          <p className="text-[13px] text-base-content/60 mb-4 line-clamp-2 leading-snug">{task.description}</p>
                        )}
                        
                        <div className="flex justify-between items-end pt-3 border-t border-base-200/60 mt-auto">
                          <div className="flex items-center gap-2">
                            {task.assignee ? (
                              <div className="flex items-center gap-2 bg-base-200/50 rounded-full pr-3 p-0.5 border border-base-300">
                                <img
                                  src={task.assignee.photoUrl || defaultAvatar}
                                  alt={assigneeName}
                                  className="w-5 h-5 rounded-full object-cover"
                                  title={assigneeName}
                                />
                                <span className="text-[11px] font-bold text-base-content/70 max-w-[80px] truncate">{assigneeName}</span>
                              </div>
                            ) : (
                              <span className="text-[11px] font-bold text-base-content/40 bg-base-200/30 rounded-full px-2 py-1">Unassigned</span>
                            )}
                          </div>
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <select 
                              className="select select-ghost select-xs w-[100px] text-[11px] font-bold focus:outline-none focus:bg-base-200 rounded-lg"
                              value={task.status} 
                              onChange={(e) => handleStatusChange(task._id, e.target.value)}
                              onClick={(e) => e.stopPropagation()}
                              aria-label="Change task status"
                            >
                              <option value="todo">To Do</option>
                              <option value="in-progress">In Progress</option>
                              <option value="done">Done</option>
                            </select>
                            <button
                              type="button"
                              onClick={() => startEditTask(task)}
                              className="btn btn-ghost btn-xs btn-square rounded-lg text-base-content/60 hover:text-primary hover:bg-primary/10"
                              title="Edit Task"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                                <path d="M2.695 14.763l-1.262 3.154a.5.5 0 00.65.65l3.155-1.262a4 4 0 001.343-.885L17.5 5.5a2.121 2.121 0 00-3-3L3.58 13.42a4 4 0 00-.885 1.343z" />
                              </svg>
                            </button>
                            <button 
                              type="button"
                              onClick={() => handleDeleteTask(task._id)}
                              className="btn btn-ghost btn-xs btn-square rounded-lg text-base-content/60 hover:text-error hover:bg-error/10"
                              title="Delete Task"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                                <path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.52.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.34.06a.75.75 0 10-1.5-.06l-.3 7.5a.75.75 0 101.5.06l.3-7.5z" clipRule="evenodd" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                  );
                })}
                
                {colTasks.length === 0 && (
                  <div className="flex-1 flex items-center justify-center border-2 border-dashed border-base-300 rounded-2xl bg-base-200/20 text-base-content/40 text-xs font-bold uppercase tracking-wider min-h-[100px]">
                    {isDragOver ? 'Drop here' : 'Empty'}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    
    </div>
  );
};

export default TaskBoard;
