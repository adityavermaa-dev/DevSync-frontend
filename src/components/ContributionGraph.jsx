import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { BASE_URL } from '../constants/commonData';
import './ContributionGraph.css';

const ContributionGraph = () => {
  const [data, setData] = useState({ activities: [], currentStreak: 0, longestStreak: 0, badges: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActivity = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/activity`, {
          withCredentials: true,
        });

        const payload = response?.data?.data || response?.data || {};
        setData({
          activities: Array.isArray(payload.activities) ? payload.activities : [],
          currentStreak: Number(payload.currentStreak) || 0,
          longestStreak: Number(payload.longestStreak) || 0,
          badges: Array.isArray(payload.badges) ? payload.badges : [],
        });
      } catch (error) {
        console.error('Failed to fetch activity data', error);
      } finally {
        setLoading(false);
      }
    };

    fetchActivity();
  }, []);

  const pastYearDates = useMemo(() => {
    const dates = [];
    const today = new Date();
    for (let i = 364; i >= 0; i -= 1) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      dates.push(date.toISOString().split('T')[0]);
    }
    return dates;
  }, []);

  const activityMap = useMemo(() => {
    return data.activities.reduce((acc, curr) => {
      const dateStr = String(curr?.date || '').split('T')[0];
      if (!dateStr) return acc;
      acc[dateStr] = Number(curr?.count) || 0;
      return acc;
    }, {});
  }, [data.activities]);

  const getSquareToneClass = (count) => {
    if (!count || count === 0) return 'cg-tone-0';
    if (count <= 2) return 'cg-tone-1';
    if (count <= 5) return 'cg-tone-2';
    if (count <= 9) return 'cg-tone-3';
    return 'cg-tone-4';
  };

  if (loading) {
    return <div className="cg-loading">Loading activity...</div>;
  }

  return (
    <section className="cg-panel" aria-label="Contribution activity graph">
      <div className="cg-head">
        <h3>Contribution Grid</h3>
        <span>Auto tracked from your DevSync activity</span>
      </div>

      <div className="cg-stats-row">
        <div className="cg-stat-card">
          <p>Current Streak</p>
          <h4>{data.currentStreak} days</h4>
        </div>
        <div className="cg-stat-card">
          <p>Longest Streak</p>
          <h4>{data.longestStreak} days</h4>
        </div>
      </div>

      <div className="cg-grid-shell">
        <div className="cg-days-col">
          <span />
          <span>Mon</span>
          <span />
          <span>Wed</span>
          <span />
          <span>Fri</span>
          <span />
        </div>

        <div className="cg-grid">
          {pastYearDates.map((date) => {
            const count = activityMap[date] || 0;
            return (
              <div
                key={date}
                className={`cg-cell ${getSquareToneClass(count)}`}
                title={`${count} activities on ${date}`}
              />
            );
          })}
        </div>
      </div>

      {data.badges?.length > 0 && (
        <div className="cg-badges-wrap">
          <h4>Achievements</h4>
          <div className="cg-badges">
            {data.badges.map((badge, idx) => (
              <span key={badge?._id || `${badge?.badgeType || 'badge'}-${idx}`} className="cg-badge-pill">
                {String(badge?.badgeType || 'achievement').replace(/_/g, ' ')}
              </span>
            ))}
          </div>
        </div>
      )}
    </section>
  );
};

export default ContributionGraph;
