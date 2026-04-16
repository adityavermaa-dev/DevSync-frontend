import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { BASE_URL } from '../constants/commonData';
import { addUser } from '../redux/userSlice';
import logo from '../assests/images/logo.png';
import AnimatedEmoji from '../components/AnimatedEmoji';
import './Onboarding.css';

const PREDEFINED_SKILLS = [
  'HTML', 'CSS', 'JavaScript', 'TypeScript',
  'React', 'Next.js', 'Redux', 'Tailwind CSS',
  'Node.js', 'Express.js', 'REST API', 'GraphQL',
  'Python', 'Django', 'Flask',
  'Java', 'Spring Boot',
  'PHP', 'Laravel',
  'Ruby on Rails',
  'Go', 'Rust', 'C++',
  'MongoDB', 'PostgreSQL', 'MySQL', 'Redis',
  'Docker', 'Kubernetes', 'AWS', 'Azure', 'Google Cloud',
  'CI/CD', 'Nginx',
  'Machine Learning', 'Deep Learning',
  'TensorFlow', 'PyTorch',
  'Git', 'GitHub', 'GitLab',
  'Linux', 'Bash', 'Postman',
  'Figma', 'UI Design', 'UX Research'
];

const UI_ROLES = [
  'Frontend Developer',
  'Backend Developer',
  'Full Stack Developer',
  'Mobile App Developer',
  'DevOps Engineer',
  'Cloud Engineer',
  'Site Reliability Engineer',
  'Security Engineer',
  'Data Scientist',
  'Machine Learning Engineer',
  'AI Engineer',
  'UI/UX Designer',
  'Product Designer',
  'Product Manager',
  'QA Engineer',
  'Test Automation Engineer',
  'Game Developer',
  'Blockchain Developer',
  'Embedded Systems Engineer',
  'Project Manager',
  'Technical Writer',
  'Open Source Contributor',
  'Student / Learner'
];

const Onboarding = () => {
  const user = useSelector(store => store.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const getInitialGithubUsername = () => {
    const raw = (user?.githubUrl || user?.githubUsername || '').trim();
    if (!raw) return '';
    return raw
      .replace(/^https?:\/\/github\.com\//i, '')
      .replace(/^github\.com\//i, '')
      .replace(/^@/, '')
      .replace(/\/$/, '');
  };

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    about: user?.about || '',
    skills: user?.skills || [],
    role: '', 
    githubUsername: getInitialGithubUsername(),
  });

  const handleSkillToggle = (skill) => {
    setFormData(prev => {
      const skills = prev.skills.includes(skill)
        ? prev.skills.filter(s => s !== skill)
        : [...prev.skills, skill];
      return { ...prev, skills };
    });
  };

  const handleRoleSelect = (role) => {
    setFormData(prev => ({ ...prev, role }));
  };

  const nextStep = () => {
    if (step === 1 && formData.role === '') {
      toast.error('Please select your primary role');
      return;
    }
    if (step === 2 && formData.skills.length < 3) {
      toast.error('Please select at least 3 skills to get good matches');
      return;
    }
    setStep(s => s + 1);
  };

  const formatUpdatePayload = () => {
    // If we wanted to store role we could, right now DevSync uses about + skills.
    // Let's prepend the role to "about" if about is empty or just update it
    const enhancedAbout = formData.about.trim() 
      ? formData.about 
      : `I am a ${formData.role} looking to collaborate on exciting projects!`;
      
    const trimmedGithubUsername = (formData.githubUsername || '').trim().replace(/^@/, '').replace(/\/$/, '');

    const payload = {
      about: enhancedAbout,
      skills: formData.skills,
    };

    if (trimmedGithubUsername) {
      payload.githubUrl = `https://github.com/${trimmedGithubUsername}`;
      payload.githubUsername = trimmedGithubUsername;
    }

    return payload;
  };

  const buildProfileFormData = ({ about, skills, githubUrl, githubUsername }, githubMode = 'url') => {
    const payload = new FormData();

    if (about) payload.append('about', about);
    if (skills && skills.length > 0) payload.append('skills', JSON.stringify(skills));

    if (githubMode === 'url' && githubUrl) {
      payload.append('githubUrl', githubUrl);
    }
    if (githubMode === 'username' && githubUsername) {
      payload.append('githubUsername', githubUsername);
    }

    return payload;
  };

  const getFormDataKeys = (formData) => Array.from(formData.keys());

  const isInvalidFieldError = (error) => {
    const msg = String(error?.response?.data?.message || '').toLowerCase();
    return msg.includes('invalid field') || msg.includes('not allowed');
  };

  const submitOnboarding = async () => {
    if (formData.skills.length < 1) {
      toast.error('You need at least one skill to continue');
      return;
    }

    setLoading(true);
    try {
      const updateData = formatUpdatePayload();
      const requestConfig = {
        withCredentials: true,
        headers: { 'Content-Type': 'multipart/form-data' },
      };

      let res;
      try {
        // Attempt 1: backend expects githubUrl
        const payloadUrl = buildProfileFormData(updateData, 'url');
        console.log('Onboarding payload attempt 1 keys:', getFormDataKeys(payloadUrl));
        res = await axios.patch(
          BASE_URL + '/profile/edit',
          payloadUrl,
          requestConfig
        );
      } catch (error) {
        if (!isInvalidFieldError(error)) throw error;

        try {
          // Attempt 2: backend expects githubUsername
          const payloadUsername = buildProfileFormData(updateData, 'username');
          console.log('Onboarding payload attempt 2 keys:', getFormDataKeys(payloadUsername));
          res = await axios.patch(
            BASE_URL + '/profile/edit',
            payloadUsername,
            requestConfig
          );
        } catch (secondError) {
          if (!isInvalidFieldError(secondError)) throw secondError;

          // Attempt 3: proceed without github field to unblock onboarding
          const payloadNoGithub = buildProfileFormData(updateData, 'none');
          console.log('Onboarding payload attempt 3 keys:', getFormDataKeys(payloadNoGithub));
          res = await axios.patch(
            BASE_URL + '/profile/edit',
            payloadNoGithub,
            requestConfig
          );
        }
      }

      if (!res) {
        throw new Error('Profile update did not return a valid response');
      }

      // Fetch the canonical profile shape before redirecting.
      const profileRes = await axios.get(BASE_URL + '/profile/view', { withCredentials: true });
      const refreshedUser = profileRes?.data?.data || profileRes?.data;

      if (!refreshedUser) {
        throw new Error('Failed to refresh updated profile');
      }

      dispatch(addUser(refreshedUser));

      if (!Array.isArray(refreshedUser?.skills) || refreshedUser.skills.length === 0) {
        throw new Error('Your skills were not saved. Please try again.');
      }

      toast.success('Profile completed! 🎉');
      navigate('/'); // Go to Hub/Feed
    } catch (error) {
      console.error('Onboarding update error:', error);
      const details = error?.response?.data;
      const message = details?.message || details || 'Failed to update profile';
      toast.error(typeof message === 'string' ? message : 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="onboarding-page min-h-screen flex items-center justify-center -mt-4 w-full relative z-20 px-4 py-8">
      {/* Background blurs */}
      <div className="absolute top-1/4 left-1/4 bg-purple-500/20 rounded-full pointer-events-none" style={{ width: 500, height: 500, filter: 'blur(120px)' }} />
      <div className="absolute bottom-1/4 right-1/4 bg-blue-500/20 rounded-full pointer-events-none" style={{ width: 400, height: 400, filter: 'blur(100px)' }} />

      <div className="onboarding-card w-full max-w-2xl backdrop-blur-2xl shadow-2xl rounded-[2.5rem] p-8 md:p-12 relative overflow-hidden">
        
        {/* Progress Bar */}
        <div className="absolute top-0 left-0 w-full h-1.5 onboarding-progress-track">
          <div className="h-full bg-linear-to-r from-purple-500 to-blue-500 transition-all duration-500 ease-out" style={{ width: `${(step / 3) * 100}%` }} />
        </div>

        {/* Header */}
        <div className="text-center mb-8">
           <div className="inline-flex justify-center items-center w-20 h-20 rounded-3xl onboarding-logo-badge shadow-lg mb-6 mx-auto animate-float">
             <img src={logo} alt="DevSync" className="w-12 h-12" />
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-linear-to-r from-purple-600 to-blue-500 tracking-tight mb-2" style={{ fontFamily: "'Outfit', sans-serif" }}>
             Welcome to DevSync, {user?.firstName}!
          </h1>
          <p className="onboarding-subtext font-medium">Let's set up your profile to find the best matches.</p>
        </div>

        {/* --- STEP 1: ROLE --- */}
        {step === 1 && (
          <div className="onboarding-step animation-fade-in">
            <h2 className="text-xl font-bold onboarding-title mb-4 text-center">What best describes you?</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-8">
              {UI_ROLES.map(role => (
                <button
                  key={role}
                  className={`p-4 rounded-2xl border-2 text-left font-bold transition-all onboarding-role-btn ${formData.role === role ? 'selected' : ''}`}
                  onClick={() => handleRoleSelect(role)}
                >
                  {role}
                </button>
              ))}
            </div>
            <button onClick={nextStep} className="w-full py-4 rounded-xl text-white font-bold text-lg bg-linear-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 shadow-lg shadow-purple-500/30 transition-all hover:scale-[1.02]">
              Continue
            </button>
          </div>
        )}

        {/* --- STEP 2: SKILLS --- */}
        {step === 2 && (
          <div className="onboarding-step animation-fade-in">
            <h2 className="text-xl font-bold onboarding-title mb-2 text-center">Select your top skills</h2>
            <p className="text-center text-sm onboarding-subtext mb-6">Choose at least 3 skills to trigger the matching algorithm.</p>
            
            <div className="flex flex-wrap gap-2 justify-center mb-8">
              {PREDEFINED_SKILLS.map(skill => (
                <button
                  key={skill}
                  onClick={() => handleSkillToggle(skill)}
                  className={`px-4 py-2 rounded-full font-bold text-sm transition-all border onboarding-skill-btn ${formData.skills.includes(skill) ? 'selected' : ''}`}
                >
                  {skill}
                </button>
              ))}
            </div>
            
            <div className="flex gap-4">
              <button onClick={() => setStep(1)} className="w-1/3 py-4 rounded-xl font-bold border-2 onboarding-secondary-btn transition-all">
                Back
              </button>
              <button onClick={nextStep} className="w-2/3 py-4 rounded-xl text-white font-bold text-lg bg-linear-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 shadow-lg shadow-purple-500/30 transition-all">
                Continue
              </button>
            </div>
          </div>
        )}

        {/* --- STEP 3: DETAILS --- */}
        {step === 3 && (
          <div className="onboarding-step animation-fade-in">
            <h2 className="text-xl font-bold onboarding-title mb-6 text-center">Final touches</h2>
            
            <div className="space-y-4 mb-8">
              <div>
                <label className="block text-sm font-bold onboarding-title mb-2">GitHub Username</label>
                <div className="relative">
                  <span className="absolute left-4 top-3.5 text-gray-400 font-medium">github.com/</span>
                  <input 
                    type="text" 
                    className="w-full onboarding-input rounded-xl py-3 pr-4 outline-none font-bold transition-all"
                    style={{ paddingLeft: 105 }}
                    placeholder="username"
                    value={formData.githubUsername}
                    onChange={e => setFormData({...formData, githubUsername: e.target.value})}
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-bold onboarding-title mb-2">About You (Optional)</label>
                <textarea 
                  className="w-full onboarding-input rounded-xl p-4 outline-none resize-none transition-all"
                  style={{ minHeight: 100 }}
                  placeholder={`I am a ${formData.role} building awesome things...`}
                  value={formData.about}
                  onChange={e => setFormData({...formData, about: e.target.value})}
                />
              </div>
            </div>
            
            <div className="flex gap-4">
              <button onClick={() => setStep(2)} className="w-1/3 py-4 rounded-xl font-bold border-2 onboarding-secondary-btn transition-all">
                Back
              </button>
              <button onClick={submitOnboarding} disabled={loading} className={`w-2/3 py-4 rounded-xl text-white font-bold text-lg bg-linear-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 shadow-lg shadow-purple-500/30 transition-all ${loading ? 'opacity-70 scale-95' : 'hover:scale-[1.02]'}`}>
                {loading ? 'Saving...' : 'Enter Hub 🚀'}
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default Onboarding;
