import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import toast from 'react-hot-toast';
import { projectAPI } from '../utils/projectAPI';
import { setActiveProject } from '../redux/projectSlice';
import defaultAvatar from '../assests/images/default-user-image.png';
import TaskBoard from '../components/TaskBoard';
import './ProjectDetail.css';

const ProjectDetail = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const user = useSelector(store => store.user);
  const project = useSelector(store => store.projects.activeProject);

  const [loading, setLoading] = useState(true);
  const [applyModalOpen, setApplyModalOpen] = useState(false);
  const [applyRole, setApplyRole] = useState('');
  const [applyMessage, setApplyMessage] = useState('');
  const [applying, setApplying] = useState(false);
  const [activeTab, setActiveTab] = useState('details');

  useEffect(() => {
    const fetchProject = async () => {
      setLoading(true);
      try {
        const data = await projectAPI.getProject(projectId);
        dispatch(setActiveProject(data));
      } catch (err) {
        console.error(err);
        toast.error('Failed to load project details');
        navigate('/projects');
      } finally {
        setLoading(false);
      }
    };
    fetchProject();

    return () => dispatch(setActiveProject(null));
  }, [projectId, dispatch, navigate]);

  const handleAcceptRequest = async (requestId) => {
    try {
      await projectAPI.handleApplication(projectId, requestId, 'accept');
      toast.success('Member accepted!');
      
      const updatedProject = await projectAPI.getProject(projectId);
      dispatch(setActiveProject(updatedProject));
    } catch (err) {
      toast.error('Failed to accept request');
    }
  };

  const handleMarkComplete = async () => {
    if (!window.confirm("Are you sure you want to mark this project as completely finished? It will stop new join requests.")) return;
    try {
      await projectAPI.updateProject(projectId, { status: 'Closed' });
      toast.success("Project marked as complete!");
      const updatedProject = await projectAPI.getProject(projectId);
      dispatch(setActiveProject(updatedProject));
    } catch (err) {
      toast.error("Failed to update project status");
    }
  };

  const handleDeleteProject = async () => {
    if (!window.confirm("CRITICAL WARNING: Are you sure you want to delete this project? This action cannot be undone.")) return;
    try {
      await projectAPI.deleteProject(projectId);
      toast.success("Project deleted successfully");
      navigate('/projects');
    } catch (err) {
      toast.error("Failed to delete project");
    }
  };

  const handleApply = async () => {
    if (!applyRole || !applyMessage.trim()) {
      toast.error('Please select a role and write a message');
      return;
    }

    setApplying(true);
    try {
      await projectAPI.applyToProject(projectId, applyRole, applyMessage);
      toast.success('Your application was sent successfully!');
      setApplyModalOpen(false);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to submit application');
    } finally {
      setApplying(false);
    }
  };

  const startProjectChat = () => {
    if (!project) return;
    // Assuming backend auto-creates a group chat for the project,
    // or we navigate to existing group thread.
    // For now, redirect to /chat indicating group context
    navigate(`/chat?project=${project._id}`);
  };

  if (loading || !project) {
    return (
      <div className="pd-page">
        <div className="pd-loading">
          <span className="profile-spinner" />
          <p>Loading project space...</p>
        </div>
      </div>
    );
  }

  const isOwner = user && project.owner && user._id === project.owner._id;
  const isMember = user && project.members?.some(m => m.user?._id === user._id);

  return (
    <div className="pd-page">
      <div className="pd-container">

        {/* Header Block */}
        <div className="pd-header">
          <button className="pd-back-btn" onClick={() => navigate('/projects')}>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
            </svg>
            Back to Hub
          </button>

          <div className="pd-title-area">
            <h1 className="pd-title">{project.title}</h1>
            <span className={`project-status status-${project.status?.toLowerCase() || 'open'}`}>
              {project.status || 'Active'}
            </span>
          </div>

          <div className="pd-owner-row">
            <img
              src={project.owner?.photoUrl || defaultAvatar}
              alt="Owner"
              className="pd-owner-avatar"
            />
            <div className="pd-owner-info">
              <span className="pd-owner-name">{project.owner?.firstName} {project.owner?.lastName}</span>
              <span className="pd-owner-label">Project Lead</span>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="pd-body-grid">

          {/* Main Column */}
          <div className="pd-main-col">

            {/* Tabs for Project Members */}
            {(isOwner || isMember) && (
              <div className="pd-tabs-wrapper">
                <button 
                  className={`pd-tab-btn ${activeTab === 'details' ? 'active' : ''}`}
                  onClick={() => setActiveTab('details')}
                >
                  Project Details
                </button>
                <button 
                  className={`pd-tab-btn ${activeTab === 'tasks' ? 'active' : ''}`}
                  onClick={() => setActiveTab('tasks')}
                >
                  Task Board (Kanban)
                </button>
              </div>
            )}

            {activeTab === 'details' ? (
              <>
                <div className="pd-card">
                  <h3 className="pd-section-title">About the Project</h3>
                  <p className="pd-description">{project.description}</p>

                  {project.repoUrl && (
                    <a href={project.repoUrl} target="_blank" rel="noopener noreferrer" className="pd-repo-link">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.205 11.387.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 21.795 24 17.295 24 12c0-6.627-5.373-12-12-12z" />
                      </svg>
                      Repository Link
                    </a>
                  )}
                </div>

                <div className="pd-card">
                  <h3 className="pd-section-title">Tech Stack</h3>
                  <div className="pd-tech-warp">
                    {project.techStack?.length > 0 ? (
                      project.techStack.map((tech, i) => (
                        <span key={i} className="pd-tech-pill">{tech}</span>
                      ))
                    ) : (
                      <span className="pd-empty-text">No technologies specified.</span>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <TaskBoard projectId={project._id} members={project.members} />
            )}
          </div>

          {/* Sidebar Column */}
          <div className="pd-side-col">

            {/* Action Card */}
            <div className="pd-card pd-action-card">
              <h3 className="pd-section-title">Collaboration</h3>

              <div className="pd-roles-list">
                <p className="pd-label mb-2">Roles Needed:</p>
                {project.rolesNeeded?.length > 0 ? (
                  project.rolesNeeded.map((role, i) => (
                    <span key={i} className="pd-role-tag">{role}</span>
                  ))
                ) : (
                  <span className="pd-empty-text">Not looking for specific roles right now.</span>
                )}
              </div>

              <div className="pd-action-divider" />

              {isOwner || isMember ? (
                <>
                  <p className="pd-member-status">
                    <span className="status-dot online"></span>
                    You are part of this project
                  </p>
                  <button className="pd-primary-btn" onClick={startProjectChat}>
                    Open Group Chat
                  </button>
                </>
              ) : (
                <button
                  className="pd-primary-btn"
                  onClick={() => setApplyModalOpen(true)}
                  disabled={project.status === 'Closed'}
                >
                  Apply to Join
                </button>
              )}
            </div>

            {/* Manage Project Card (Owner Only) */}
            {isOwner && (
              <div className="pd-card pd-action-card">
                <h3 className="pd-section-title">Manage Project</h3>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' }}>
                  {project.status !== 'Closed' && (
                    <button 
                      className="pd-primary-btn" 
                      style={{ background: 'var(--dashboard-surface-alt)', color: 'var(--dashboard-text-main)' }}
                      onClick={handleMarkComplete}
                    >
                      Mark as Complete
                    </button>
                  )}
                  
                  <button 
                    className="cp-btn cp-btn-cancel" 
                    style={{ width: '100%', padding: '12px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.3)' }}
                    onClick={handleDeleteProject}
                  >
                    Delete Project
                  </button>
                </div>
              </div>
            )}

            {/* Members Card */}
            <div className="pd-card">
              <h3 className="pd-section-title">
                Team Members
                <span className="pd-member-count">({project.members?.length || 1}/{project.maxMembers || '∞'})</span>
              </h3>

              <div className="pd-member-list">
                {/* Lead is always listed */}
                <div className="pd-member-item" onClick={() => navigate(`/user/${project.owner?._id}`)}>
                  <img src={project.owner?.photoUrl || defaultAvatar} alt="owner" />
                  <span>{project.owner?.firstName}</span>
                  <span className="pd-lead-badge">Lead</span>
                </div>

                {/* Other members */}
                {project.members?.map(member => {
                  const mUser = member.user;
                  if (!mUser || mUser._id === project.owner?._id) return null;
                  return (
                    <div key={mUser._id} className="pd-member-item" onClick={() => navigate(`/user/${mUser._id}`)}>
                      <img src={mUser.photoUrl || defaultAvatar} alt="member" />
                      <span>{mUser.firstName}</span>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Apply Modal */}
      {applyModalOpen && (
        <div className="pd-modal-overlay">
          <div className="pd-modal animate-fade-in">
            <h3 className="pd-modal-title">Join Project</h3>
            <p className="pd-modal-sub">Tell the lead how you can contribute to '{project.title}'.</p>

            <div className="pd-modal-body">
              <label className="cp-label">Which role are you applying for?</label>
              <select
                className="cp-input cp-select mb-4"
                value={applyRole}
                onChange={(e) => setApplyRole(e.target.value)}
              >
                <option value="">Select a role...</option>
                {project.rolesNeeded?.map((role, i) => (
                  <option key={i} value={role}>{role}</option>
                ))}
                <option value="General Contributor">General Contributor</option>
              </select>

              <label className="cp-label">Why do you want to join?</label>
              <textarea
                className="cp-input cp-textarea"
                value={applyMessage}
                onChange={(e) => setApplyMessage(e.target.value)}
                placeholder="Share your relevant skills and experience briefly..."
                rows={4}
              />
            </div>

            <div className="pd-modal-actions mt-6">
              <button
                className="cp-btn cp-btn-cancel"
                onClick={() => setApplyModalOpen(false)}
                disabled={applying}
              >
                Cancel
              </button>
              <button
                className="cp-btn cp-btn-save"
                onClick={handleApply}
                disabled={applying}
              >
                {applying ? 'Sending...' : 'Send Application'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectDetail;
