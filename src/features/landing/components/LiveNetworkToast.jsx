/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const MOCK_EVENTS = [
  '🟢 A developer from Delhi just formed a team.',
  '🟢 3 new Hackathons were just added.',
  '🟢 Team "Neural Net" created 2 min ago.',
  '🟢 A UI Designer just joined DevSync.',
];

export const LiveNetworkToast = () => {
  const [eventIndex, setEventIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const triggerEvent = () => {
      setEventIndex(Math.floor(Math.random() * MOCK_EVENTS.length));
      setIsVisible(true);
      
      setTimeout(() => {
        setIsVisible(false);
      }, 5000);
    };

    const initialTimeout = setTimeout(triggerEvent, 3000);
    const interval = setInterval(triggerEvent, 20000);

    return () => {
      clearTimeout(initialTimeout);
      clearInterval(interval);
    };
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.9 }}
          className="fixed bottom-6 left-6 z-50 p-4 rounded-xl bg-[var(--surface-elevated)] border border-[var(--border-subtle)] shadow-xl"
        >
          <p className="text-sm font-medium text-[var(--text-secondary)]">
            {MOCK_EVENTS[eventIndex]}
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
