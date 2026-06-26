import React, { useState } from 'react';
import { Stack, Heading, Text, Button } from '@/design-system';
import { ProgressStepper } from './components/ProgressStepper';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { addUser } from '@/redux/userSlice';
import axios from 'axios';
import { BASE_URL } from '@/constants/commonData';
import toast from 'react-hot-toast';

const TOTAL_STEPS = 4;

const INTEREST_OPTIONS = [
  'Backend', 'Frontend', 'AI / ML', 'Mobile', 
  'UI/UX', 'DevOps', 'Web3', 'Open Source'
];

const GOAL_OPTIONS = [
  { title: 'Build a Hackathon Team', desc: 'Looking for teammates to win hackathons with.' },
  { title: 'Find a Startup Co-founder', desc: 'Looking to build a real product and company.' },
  { title: 'Contribute to Open Source', desc: 'Looking to build portfolio projects.' }
];

export const ProfileSetup = () => {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector(store => store.user);

  // Form State
  const [formData, setFormData] = useState({
    college: '',
    graduationYear: '1st Year',
    timezone: 'IST (UTC+5:30)',
    interests: [],
    devSyncGoal: ''
  });

  const updateFormData = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleInterest = (interest) => {
    setFormData(prev => {
      const isSelected = prev.interests.includes(interest);
      if (isSelected) {
        return { ...prev, interests: prev.interests.filter(i => i !== interest) };
      } else {
        if (prev.interests.length >= 5) {
          toast.error("You can select up to 5 interests.");
          return prev;
        }
        return { ...prev, interests: [...prev.interests, interest] };
      }
    });
  };

  const handleNext = async () => {
    if (step < TOTAL_STEPS) {
      setStep(step + 1);
    } else {
      await submitProfile(false);
    }
  };

  const handleSkip = async () => {
    if (step < TOTAL_STEPS) {
      setStep(step + 1);
    } else {
      await submitProfile(true); // they skipped the last step but still completing
    }
  };

  const submitProfile = async (skipped) => {
    try {
      setIsSubmitting(true);
      const dataToSubmit = {
        college: formData.college,
        graduationYear: formData.graduationYear,
        timezone: formData.timezone,
        interests: JSON.stringify(formData.interests), // backend expects stringified array or handles it
        devSyncGoal: formData.devSyncGoal,
        profileCompleted: true
      };

      const response = await axios.patch(`${BASE_URL}/profile/edit`, dataToSubmit, {
        withCredentials: true,
      });

      if (response.data?.user) {
        dispatch(addUser(response.data.user));
        toast.success("Profile Setup Complete!");
        navigate('/discover');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong saving your profile.");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[var(--surface-sunken)] p-6">
      <div className="w-full max-w-2xl bg-[var(--surface-primary)] border border-[var(--border-subtle)] rounded-2xl p-8 md:p-12 shadow-xl">
        <ProgressStepper currentStep={step} totalSteps={TOTAL_STEPS} />

        <div className="min-h-[400px] flex flex-col">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div 
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex-1 flex flex-col justify-center items-center text-center space-y-6"
              >
                <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center text-green-500 text-3xl">✓</div>
                <Heading level={2}>Welcome to DevSync!</Heading>
                <Text className="text-[var(--text-secondary)] max-w-md">
                  Let's set up your profile so we can match you with the perfect teammates and projects.
                </Text>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div 
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex-1 flex flex-col justify-center"
              >
                <Heading level={2} className="mb-2">Developer Details</Heading>
                <Text className="text-[var(--text-secondary)] mb-8">Tell us a bit about your background.</Text>
                
                <Stack spacing="lg">
                  <div className="flex flex-col space-y-2">
                    <label className="text-sm font-medium">College / University</label>
                    <input 
                      type="text" 
                      value={formData.college}
                      onChange={(e) => updateFormData('college', e.target.value)}
                      className="h-12 px-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-elevated)] focus:border-[var(--color-primary)] outline-none" 
                      placeholder="e.g. Stanford University" 
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col space-y-2">
                      <label className="text-sm font-medium">Year of Study</label>
                      <select 
                        value={formData.graduationYear}
                        onChange={(e) => updateFormData('graduationYear', e.target.value)}
                        className="h-12 px-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-elevated)] focus:border-[var(--color-primary)] outline-none"
                      >
                        <option>1st Year</option>
                        <option>2nd Year</option>
                        <option>3rd Year</option>
                        <option>4th Year</option>
                        <option>Graduated</option>
                      </select>
                    </div>
                    <div className="flex flex-col space-y-2">
                      <label className="text-sm font-medium">Timezone</label>
                      <select 
                        value={formData.timezone}
                        onChange={(e) => updateFormData('timezone', e.target.value)}
                        className="h-12 px-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-elevated)] focus:border-[var(--color-primary)] outline-none"
                      >
                        <option>IST (UTC+5:30)</option>
                        <option>EST (UTC-5:00)</option>
                        <option>PST (UTC-8:00)</option>
                        <option>GMT (UTC+0:00)</option>
                      </select>
                    </div>
                  </div>
                </Stack>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div 
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex-1 flex flex-col justify-center"
              >
                <Heading level={2} className="mb-2">What are your interests?</Heading>
                <Text className="text-[var(--text-secondary)] mb-8">Select the fields you want to work in.</Text>
                
                <div className="flex flex-wrap gap-3">
                  {INTEREST_OPTIONS.map(interest => (
                    <button 
                      key={interest} 
                      onClick={() => toggleInterest(interest)}
                      className={`px-5 py-3 rounded-xl border font-medium transition-colors ${
                        formData.interests.includes(interest)
                          ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/10 text-[var(--color-primary)]'
                          : 'border-[var(--border-subtle)] hover:border-[var(--color-primary)] text-sm bg-[var(--surface-elevated)]'
                      }`}
                    >
                      {interest}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {step === 4 && (
              <motion.div 
                key="step4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex-1 flex flex-col justify-center"
              >
                <Heading level={2} className="mb-2">What's your goal on DevSync?</Heading>
                <Text className="text-[var(--text-secondary)] mb-8">We'll use this to recommend the right teammates for you.</Text>
                
                <Stack spacing="md">
                  {GOAL_OPTIONS.map(goal => (
                    <div 
                      key={goal.title} 
                      onClick={() => updateFormData('devSyncGoal', goal.title)}
                      className={`p-4 rounded-xl border cursor-pointer transition-colors ${
                        formData.devSyncGoal === goal.title
                          ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/10'
                          : 'border-[var(--border-subtle)] hover:border-[var(--color-primary)] bg-[var(--surface-elevated)]'
                      }`}
                    >
                      <p className="font-bold mb-1">{goal.title}</p>
                      <p className="text-sm text-[var(--text-secondary)]">{goal.desc}</p>
                    </div>
                  ))}
                </Stack>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="mt-12 flex items-center justify-between pt-6 border-t border-[var(--border-subtle)]">
            <button onClick={handleSkip} className="text-[var(--text-muted)] hover:text-[var(--text-primary)] font-medium px-4 py-2">
              Skip
            </button>
            <Button variant="primary" onClick={handleNext} disabled={isSubmitting} className="h-11 px-8">
              {isSubmitting ? 'Saving...' : step === TOTAL_STEPS ? 'Complete Profile' : 'Continue'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
