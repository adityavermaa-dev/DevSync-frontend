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

  // Form State
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
    // Optimistic update
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
      toast.success('Task deleted');
    } catch {
      toast.error('Failed to delete task');
    }
  };

  // Drag and Drop Logic
  const handleDragStart = (e, task) => {
    setDraggedItem(task);
    e.dataTransfer.effectAllowed = 'move';
    e.currentTarget.classList.add('tb-card-dragging');
  };

  const handleDragEnd = (e) => {
    e.currentTarget.classList.remove('tb-card-dragging');
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
      <div className="tb-loading-wrap">
        <div className="tb-loading"><span className="profile-spinner"></span></div>
      </div>
    );
  }

  return (
    <div className="task-board-container animate-fade-in">
      
      <div className="tb-header">
        <div>
          <h3 className="tb-title">Project Tasks</h3>
          <p className="tb-subtitle">Organize work with drag and drop across columns.</p>
        </div>
        <button className="tb-add-btn" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : '+ New Task'}
        </button>
      </div>

      {showForm && (
        <form className="tb-form-wrap animate-fade-in" onSubmit={handleCreateTask}>
          <div className="tb-form-row">
            <input 
              className="cp-input" 
              name="title" 
              placeholder="Task Title*" 
              value={form.title} 
              onChange={handleInputChange} 
              autoFocus
            />
          </div>
          <div className="tb-form-row">
            <textarea 
              className="cp-input" 
              name="description" 
              placeholder="Description (Optional)" 
              rows="2" 
              value={form.description} 
              onChange={handleInputChange} 
            />
          </div>
          <div className="tb-form-row">
            <select className="cp-input" name="priority" value={form.priority} onChange={handleInputChange}>
              <option value="low">Priority: Low</option>
              <option value="medium">Priority: Medium</option>
              <option value="high">Priority: High</option>
            </select>
            <select className="cp-input" name="status" value={form.status} onChange={handleInputChange}>
              <option value="todo">Status: To Do</option>
              <option value="in-progress">Status: In Progress</option>
              <option value="done">Status: Done</option>
            </select>
            <select className="cp-input" name="assignee" value={form.assignee} onChange={handleInputChange}>
              <option value="">Assign to (Unassigned)</option>
              {memberOptions.map((member) => (
                <option key={member._id} value={member._id}>
                  {member.firstName} {member.lastName}
                </option>
              ))}
            </select>
          </div>
          <button type="submit" className="cp-btn cp-btn-save tb-submit-btn">Add Task</button>
        </form>
      )}

      {!showForm && tasks.length === 0 && (
        <div className="tb-board-empty">
          <p>No tasks yet. Create the first task to kick off the sprint.</p>
        </div>
      )}

      <div className="tb-columns">
        {columns.map((col) => {
          const colTasks = tasks.filter((task) => task.status === col.id);
          const isDragOver = dragOverStatus === col.id;

          return (
            <div 
              key={col.id} 
              className={`tb-column ${isDragOver ? 'drag-over' : ''}`}
              onDragOver={handleDragOver}
              onDragEnter={() => handleDragEnter(col.id)}
              onDrop={(e) => handleDrop(e, col.id)}
            >
              <div className="tb-col-header">
                <div>
                  <h4 className="tb-col-title">{col.title}</h4>
                  <p className="tb-col-subtitle">{col.subtitle}</p>
                </div>
                <span className="tb-count">{colTasks.length}</span>
              </div>
              
              {colTasks.map((task) => {
                const assigneeName = task.assignee
                  ? `${task.assignee.firstName || ''} ${task.assignee.lastName || ''}`.trim() || 'Assigned member'
                  : 'Unassigned';

                return (
                <div 
                  key={task._id} 
                  className="tb-card"
                  draggable
                  onDragStart={(e) => handleDragStart(e, task)}
                  onDragEnd={handleDragEnd}
                >
                  <div className="tb-card-header">
                    <h5 className="tb-card-title">{task.title}</h5>
                    <span className={`tb-pri ${task.priority}`}>{task.priority}</span>
                  </div>
                  
                  {task.description && <p className="tb-card-desc">{task.description}</p>}
                  
                  <div className="tb-card-footer">
                    <div className="tb-assignee">
                      {task.assignee ? (
                        <>
                          <img
                            src={task.assignee.photoUrl || defaultAvatar}
                            alt={assigneeName}
                            className="tb-assignee-img"
                            title={assigneeName}
                          />
                          <span className="tb-assignee-name">{assigneeName}</span>
                        </>
                      ) : (
                        <span className="tb-unassigned">Unassigned</span>
                      )}
                    </div>
                    <div className="tb-actions">
                      <select 
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
                        onClick={() => handleDeleteTask(task._id)}
                        className="tb-delete-btn"
                        title="Delete Task"
                        aria-label="Delete task"
                      >
                        x
                      </button>
                    </div>
                  </div>
                </div>
                );
              })}
              
              {colTasks.length === 0 && (
                <div className="tb-empty-column">
                  {isDragOver ? 'Release to move task' : 'No tasks in this lane'}
                </div>
              )}
            </div>
          );
        })}
      </div>
    
    </div>
  );
};

export default TaskBoard;
