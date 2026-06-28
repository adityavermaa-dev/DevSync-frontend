import React, { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { projectAPI } from '../utils/projectAPI';
import { setProjects, setLoadingProjects } from '../redux/projectSlice';
import { Skeleton } from '@/design-system';
import './Projects.css';

const Projects = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { list: projects, loading } = useSelector((store) => store.projects);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTech, setFilterTech] = useState('');

  const fetchProjects = useCallback(async () => {
    dispatch(setLoadingProjects(true));
    try {
      
      const data = await projectAPI.getProjects();
      dispatch(setProjects(data));
    } catch (err) {
      console.error(err);
      toast.error('Failed to load projects');
    } finally {
      dispatch(setLoadingProjects(false));
    }
  }, [dispatch]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const filteredProjects = projects.filter(p => {
    const matchesSearch = p.title?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTech = !filterTech || p.techStack?.some(t => t.toLowerCase() === filterTech.toLowerCase());
    return matchesSearch && matchesTech;
  });

  const uniqueTechStacks = Array.from(new Set(projects.flatMap(p => p.techStack || [])));

  if (loading && projects.length === 0) {
    return (
      <div className="projects-page">
        <div className="projects-container">
          <div className="mb-8">
            <Skeleton className="h-10 w-64 mb-2" />
            <Skeleton className="h-5 w-96" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="bg-[var(--surface-primary)] border border-[var(--border-subtle)] rounded-[var(--radius-card)] p-6 h-[260px] flex flex-col">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                  <Skeleton className="h-6 w-16 rounded-full" />
                </div>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-5/6 mb-4" />
                <div className="flex gap-2 mb-auto mt-2">
                  <Skeleton className="h-6 w-16 rounded-full" />
                  <Skeleton className="h-6 w-20 rounded-full" />
                  <Skeleton className="h-6 w-14 rounded-full" />
                </div>
                <div className="flex justify-between items-center pt-4 mt-4 border-t border-[var(--border-subtle)]">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-16" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="projects-page">
      <div className="projects-container">
        
        {}
        <div className="projects-header-section">
          <div>
            <h1 className="projects-title">Project Hub</h1>
            <p className="projects-subtitle">Discover active projects and find teams to build with.</p>
          </div>
          <button className="create-project-btn" onClick={() => navigate('/projects/new')}>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Create Project
          </button>
        </div>

        <div className="projects-controls">
          <div className="projects-search">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" /></svg>
            <input 
              type="text" 
              placeholder="Search by name or description..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <select 
            className="projects-filter" 
            value={filterTech} 
            onChange={(e) => setFilterTech(e.target.value)}
          >
            <option value="">All Technologies</option>
            {uniqueTechStacks.map((tech, i) => (
              <option key={i} value={tech}>{tech}</option>
            ))}
          </select>
        </div>

        {}
        <div className="projects-grid">
          {filteredProjects.length > 0 ? (
            filteredProjects.map((project) => (
              <div 
                key={project._id} 
                className="project-card animate-fade-in"
                onClick={() => navigate(`/projects/${project._id}`)}
              >
                <div className="project-card-header">
                  <div className="project-card-title-row">
                    <h3 className="project-title">{project.title}</h3>
                    <span className={`project-status status-${project.status?.toLowerCase() || 'open'}`}>
                      {project.status || 'Active'}
                    </span>
                  </div>
                  <p className="project-owner">
                    by <span>{project.owner?.firstName} {project.owner?.lastName}</span>
                  </p>
                </div>

                <p className="project-desc line-clamp-3">
                  {project.description}
                </p>

                {project.techStack && project.techStack.length > 0 && (
                  <div className="project-tech-stack">
                    {project.techStack.slice(0, 4).map((tech, i) => (
                      <span key={i} className="project-tech-pill">{tech}</span>
                    ))}
                    {project.techStack.length > 4 && (
                      <span className="project-tech-pill extra">+{project.techStack.length - 4}</span>
                    )}
                  </div>
                )}

                <div className="project-card-footer">
                  <div className="project-roles">
                    <span className="roles-label">Looking for:</span>
                    <span className="roles-text truncate">{project.rolesNeeded?.join(', ') || 'Contributors'}</span>
                  </div>
                  <div className="project-members">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
                    </svg>
                    <span>{project.members?.length || 1} / {project.maxMembers || '∞'}</span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="projects-empty">
              <div className="empty-icon">🚀</div>
              <h3>No projects found</h3>
              <p>Try adjusting your search filters or create a new project to get started.</p>
              <button className="empty-create-btn" onClick={() => navigate('/projects/new')}>
                Create First Project
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default Projects;
