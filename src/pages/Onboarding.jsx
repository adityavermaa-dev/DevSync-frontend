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
  'React', 'Node.js', 'Python', 'Java', 'C++', 'Go', 'Rust', 'Ruby', 'PHP',
  'TypeScript', 'MongoDB', 'PostgreSQL', 'Docker', 'AWS', 'Kubernetes'
];

const UI_ROLES = [
  'Frontend Developer', 'Backend Developer', 'Full Stack Developer',
  'Mobile Developer', 'DevOps Engineer', 'UI/UX Designer', 'Data Scientist'
];

const Onboarding = () => {
  const user = useSelector(store => store.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    about: user?.about || '',
    skills: user?.skills || [],
    role: '', 
    githubUsername: user?.githubUsername || '',
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
      
    return {
      about: enhancedAbout,
      skills: formData.skills,
      githubUsername: formData.githubUsername
    };
  };

  const submitOnboarding = async () => {
    if (formData.skills.length < 1) {
      toast.error('You need at least one skill to continue');
      return;
    }

    setLoading(true);
    try {
      const payload = formatUpdatePayload();
      const res = await axios.put(BASE_URL + '/profile/edit', payload, { withCredentials: true });
      dispatch(addUser(res.data.data)); // Update redux user with complete profile
      toast.success('Profile completed! 🎉');
      navigate('/'); // Go to Hub/Feed
    } catch (error) {
      console.error('Onboarding update error:', error);
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="onboarding-page min-h-screen flex items-center justify-center -mt-4 w-full relative z-20 px-4 py-8">
      {/* Background blurs */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-purple-500/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-blue-500/20 rounded-full blur-[100px] pointer-events-none" />

      <div className="onboarding-card w-full max-w-2xl bg-white/70 dark:bg-[#1A1A1F]/80 backdrop-blur-2xl border border-white/50 dark:border-gray-800 shadow-2xl rounded-[2.5rem] p-8 md:p-12 relative overflow-hidden">
        
        {/* Progress Bar */}
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gray-200 dark:bg-gray-800">
          <div className="h-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-500 ease-out" style={{ width: `${(step / 3) * 100}%` }} />
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex justify-center items-center w-20 h-20 rounded-3xl bg-white dark:bg-black/30 shadow-lg border border-gray-100 dark:border-gray-800 mb-6 mx-auto animate-float">
             <img src={logo} alt="DevSync" className="w-12 h-12" />
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-500 tracking-tight mb-2" style={{ fontFamily: "'Outfit', sans-serif" }}>
             Welcome to DevSync, {user?.firstName}!
          </h1>
          <p className="text-gray-500 dark:text-gray-400 font-medium">Let's set up your profile to find the best matches.</p>
        </div>

        {/* --- STEP 1: ROLE --- */}
        {step === 1 && (
          <div className="onboarding-step animation-fade-in">
            <h2 className="text-xl font-bold feed-text-main mb-4 text-center">What best describes you?</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-8">
              {UI_ROLES.map(role => (
                <button
                  key={role}
                  className={`p-4 rounded-2xl border-2 text-left font-bold transition-all ${formData.role === role ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 shadow-md' : 'border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-700 text-gray-600 dark:text-gray-300 bg-white/50 dark:bg-black/20'}`}
                  onClick={() => handleRoleSelect(role)}
                >
                  {role}
                </button>
              ))}
            </div>
            <button onClick={nextStep} className="w-full py-4 rounded-xl text-white font-bold text-lg bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 shadow-lg shadow-purple-500/30 transition-all hover:scale-[1.02]">
              Continue
            </button>
          </div>
        )}

        {/* --- STEP 2: SKILLS --- */}
        {step === 2 && (
          <div className="onboarding-step animation-fade-in">
            <h2 className="text-xl font-bold feed-text-main mb-2 text-center">Select your top skills</h2>
            <p className="text-center text-sm feed-text-faint mb-6">Choose at least 3 skills to trigger the matching algorithm.</p>
            
            <div className="flex flex-wrap gap-2 justify-center mb-8">
              {PREDEFINED_SKILLS.map(skill => (
                <button
                  key={skill}
                  onClick={() => handleSkillToggle(skill)}
                  className={`px-4 py-2 rounded-full font-bold text-sm transition-all border ${formData.skills.includes(skill) ? 'bg-purple-600 text-white border-purple-600 shadow-md' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-purple-300'}`}
                >
                  {skill}
                </button>
              ))}
            </div>
            
            <div className="flex gap-4">
              <button onClick={() => setStep(1)} className="w-1/3 py-4 rounded-xl font-bold border-2 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 transition-all">
                Back
              </button>
              <button onClick={nextStep} className="w-2/3 py-4 rounded-xl text-white font-bold text-lg bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 shadow-lg shadow-purple-500/30 transition-all">
                Continue
              </button>
            </div>
          </div>
        )}

        {/* --- STEP 3: DETAILS --- */}
        {step === 3 && (
          <div className="onboarding-step animation-fade-in">
            <h2 className="text-xl font-bold feed-text-main mb-6 text-center">Final touches</h2>
            
            <div className="space-y-4 mb-8">
              <div>
                <label className="block text-sm font-bold feed-text-main mb-2">GitHub Username</label>
                <div className="relative">
                  <span className="absolute left-4 top-3.5 text-gray-400 font-medium">github.com/</span>
                  <input 
                    type="text" 
                    className="w-full bg-white dark:bg-black/30 border-2 border-gray-200 dark:border-gray-700 rounded-xl py-3 pl-[105px] pr-4 outline-none focus:border-purple-500 feed-text-main font-bold transition-all"
                    placeholder="username"
                    value={formData.githubUsername}
                    onChange={e => setFormData({...formData, githubUsername: e.target.value})}
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-bold feed-text-main mb-2">About You (Optional)</label>
                <textarea 
                  className="w-full bg-white dark:bg-black/30 border-2 border-gray-200 dark:border-gray-700 rounded-xl p-4 outline-none focus:border-purple-500 feed-text-main min-h-[100px] resize-none transition-all"
                  placeholder={`I am a ${formData.role} building awesome things...`}
                  value={formData.about}
                  onChange={e => setFormData({...formData, about: e.target.value})}
                />
              </div>
            </div>
            
            <div className="flex gap-4">
              <button onClick={() => setStep(2)} className="w-1/3 py-4 rounded-xl font-bold border-2 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 transition-all">
                Back
              </button>
              <button onClick={submitOnboarding} disabled={loading} className={`w-2/3 py-4 rounded-xl text-white font-bold text-lg bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 shadow-lg shadow-purple-500/30 transition-all ${loading ? 'opacity-70 scale-95' : 'hover:scale-[1.02]'}`}>
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
