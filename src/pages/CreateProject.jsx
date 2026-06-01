import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { projectAPI } from '../utils/projectAPI';
import { addProject } from '../redux/projectSlice';
import './CreateProject.css';

const CreateProject = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [saving, setSaving] = useState(false);
  const [newTech, setNewTech] = useState('');
  const [newRole, setNewRole] = useState('');

  const [form, setForm] = useState({
    title: '',
    description: '',
    techStack: [],
    rolesNeeded: [],
    repoUrl: '',
    status: 'Open',
    maxMembers: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  
  const handleAddTech = () => {
    const tech = newTech.trim();
    if (tech && !form.techStack.includes(tech)) {
      setForm(prev => ({ ...prev, techStack: [...prev.techStack, tech] }));
      setNewTech('');
    }
  };

  const handleTechKeyDown = (e) => {
    if (e.key === 'Enter') { e.preventDefault(); handleAddTech(); }
  };

  const handleRemoveTech = (techToRemove) => {
    setForm(prev => ({ ...prev, techStack: prev.techStack.filter(t => t !== techToRemove) }));
  };

  
  const handleAddRole = () => {
    const role = newRole.trim();
    if (role && !form.rolesNeeded.includes(role)) {
      setForm(prev => ({ ...prev, rolesNeeded: [...prev.rolesNeeded, role] }));
      setNewRole('');
    }
  };

  const handleRoleKeyDown = (e) => {
    if (e.key === 'Enter') { e.preventDefault(); handleAddRole(); }
  };

  const handleRemoveRole = (roleToRemove) => {
    setForm(prev => ({ ...prev, rolesNeeded: prev.rolesNeeded.filter(r => r !== roleToRemove) }));
  };

  const handleSave = async () => {
    if (!form.title.trim() || !form.description.trim()) {
      toast.error('Title and Description are required.');
      return;
    }

    setSaving(true);
    try {
      
      const payload = { ...form };
      if (payload.maxMembers) payload.maxMembers = parseInt(payload.maxMembers, 10);
      else delete payload.maxMembers;

      const newProj = await projectAPI.createProject(payload);
      if (newProj && newProj._id) {
        dispatch(addProject(newProj));
        toast.success('Project created successfully!');
        navigate(`/projects/${newProj._id}`);
      } else {
         
         toast.success('Project created!');
         navigate('/projects');
      }
    } catch (error) {
      const msg = error?.response?.data?.message || 'Failed to create project';
      toast.error(typeof msg === 'string' ? msg : 'Something went wrong');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="create-project-page">
      <div className="create-project-layout">
        <div className="cp-header">
          <button className="cp-back-btn" onClick={() => navigate('/projects')}>
             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
            </svg>
            Back
          </button>
          <h2 className="cp-title">Create a Project</h2>
        </div>

        <div className="cp-body">
          <div className="cp-field">
            <label className="cp-label">Project Title *</label>
            <input 
              className="cp-input text-xl" 
              name="title" 
              value={form.title} 
              onChange={handleChange} 
              placeholder="e.g. AI-Powered Code Reviewer" 
              maxLength={60}
            />
          </div>

          <div className="cp-field">
            <label className="cp-label">Description *</label>
            <textarea 
              className="cp-input cp-textarea" 
              name="description" 
              value={form.description} 
              onChange={handleChange} 
              placeholder="Explain what the project does, what problem it solves, and its current state..." 
              rows={5} 
            />
          </div>

          <div className="cp-field-row">
            <div className="cp-field">
              <label className="cp-label">Status</label>
              <select className="cp-input cp-select" name="status" value={form.status} onChange={handleChange}>
                <option value="Open">Open (Looking for team)</option>
                <option value="Building">Building (Active)</option>
              </select>
            </div>
            <div className="cp-field">
              <label className="cp-label">Max Members (Optional)</label>
              <input 
                className="cp-input" 
                name="maxMembers" 
                type="number" 
                min="2" max="50" 
                value={form.maxMembers} 
                onChange={handleChange} 
                placeholder="e.g. 4" 
              />
            </div>
          </div>

          <div className="cp-section-divider" />

          <div className="cp-field">
            <label className="cp-label">Tech Stack</label>
            <div className="cp-tags-wrap">
              {form.techStack.map((tech, idx) => (
                <span key={idx} className="cp-tag-chip" onClick={() => handleRemoveTech(tech)}>
                  {tech}
                  <span className="cp-tag-remove">×</span>
                </span>
              ))}
            </div>
            <div className="cp-tag-add-row">
              <input 
                className="cp-input" 
                value={newTech} 
                onChange={(e) => setNewTech(e.target.value)} 
                onKeyDown={handleTechKeyDown} 
                placeholder="e.g. React, Node.js, Python..." 
              />
              <button type="button" className="cp-add-btn" onClick={handleAddTech}>+ Add Tech</button>
            </div>
          </div>

          <div className="cp-field">
            <label className="cp-label">Roles Needed</label>
            <p className="cp-help-text">What kind of developers do you need for this project?</p>
            <div className="cp-tags-wrap">
              {form.rolesNeeded.map((role, idx) => (
                <span key={idx} className="cp-tag-chip role-chip" onClick={() => handleRemoveRole(role)}>
                  {role}
                  <span className="cp-tag-remove">×</span>
                </span>
              ))}
            </div>
            <div className="cp-tag-add-row">
              <input 
                className="cp-input" 
                value={newRole} 
                onChange={(e) => setNewRole(e.target.value)} 
                onKeyDown={handleRoleKeyDown} 
                placeholder="e.g. Frontend Developer, UI Designer..." 
              />
              <button type="button" className="cp-add-btn" onClick={handleAddRole}>+ Add Role</button>
            </div>
          </div>

          <div className="cp-section-divider" />

          <div className="cp-field mb-0">
            <label className="cp-label">GitHub Repository URL (Optional)</label>
            <input 
              className="cp-input" 
              name="repoUrl" 
              type="url"
              value={form.repoUrl} 
              onChange={handleChange} 
              placeholder="https://github.com/username/repo" 
            />
          </div>
        </div>

        <div className="cp-actions">
          <button className="cp-btn cp-btn-cancel" onClick={() => navigate('/projects')} disabled={saving}>Cancel</button>
          <button className="cp-btn cp-btn-save" onClick={handleSave} disabled={saving || !form.title.trim()}>
            {saving && <span className="profile-spinner" style={{width: '20px', height: '20px'}} />}
            {saving ? 'Creating...' : '🚀 Publish Project'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateProject
