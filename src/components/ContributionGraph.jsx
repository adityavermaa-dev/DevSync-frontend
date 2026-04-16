import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { BASE_URL } from '../constants/commonData';
import './ContributionGraph.css';

const GRID_ROWS = 7;
const GRID_DAYS = 365;
const GRID_COLS = Math.ceil(GRID_DAYS / GRID_ROWS);

const toCellIndex = (col, row) => (col * GRID_ROWS) + row;

const SNAKE_PATH = [
  [GRID_COLS - 4, 1],
  [GRID_COLS - 3, 1],
  [GRID_COLS - 2, 1],
  [GRID_COLS - 1, 1],
  [GRID_COLS - 1, 2],
  [GRID_COLS - 1, 3],
  [GRID_COLS - 2, 3],
  [GRID_COLS - 3, 3],
  [GRID_COLS - 4, 3],
  [GRID_COLS - 4, 2],
  [GRID_COLS - 3, 2],
].map(([col, row]) => toCellIndex(col, row));

const ContributionGraph = () => {
  const [data, setData] = useState({ activities: [], currentStreak: 0, longestStreak: 0, badges: [] });
  const [loading, setLoading] = useState(true);
  const [isSnakeInit, setIsSnakeInit] = useState(true);
  const [snakeTrail, setSnakeTrail] = useState([]);

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
    for (let i = GRID_DAYS - 1; i >= 0; i -= 1) {
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

  useEffect(() => {
    if (loading) return;

    let step = 0;
    const tailLength = 4;

    const timer = window.setInterval(() => {
      const nextStep = Math.min(step + 1, SNAKE_PATH.length);
      const start = Math.max(0, nextStep - tailLength);
      setSnakeTrail(SNAKE_PATH.slice(start, nextStep));
      step = nextStep;

      if (nextStep >= SNAKE_PATH.length) {
        window.clearInterval(timer);
        window.setTimeout(() => {
          setIsSnakeInit(false);
          setSnakeTrail([]);
        }, 240);
      }
    }, 90);

    return () => window.clearInterval(timer);
  }, [loading]);

  const getSquareToneClass = (count) => {
    if (!count || count === 0) return 'cg-tone-0';
    if (count <= 2) return 'cg-tone-1';
    if (count <= 5) return 'cg-tone-2';
    if (count <= 9) return 'cg-tone-3';
    return 'cg-tone-4';
  };

  const getSnakeClass = (index) => {
    const pos = snakeTrail.indexOf(index);
    if (pos === -1) return '';
    if (pos === snakeTrail.length - 1) return 'cg-snake-head';
    if (pos === 0) return 'cg-snake-tail';
    return 'cg-snake-body';
  };

  const activeDays = useMemo(() => Object.values(activityMap).filter((count) => count > 0).length, [activityMap]);
  const activityPercent = Math.min(100, Math.round((activeDays / GRID_DAYS) * 100));

  if (loading) {
    return <div className="cg-loading">Booting activity console...</div>;
  }

  return (
    <section className="cg-console" aria-label="Contribution activity graph">
      <span className="cg-corner tl" />
      <span className="cg-corner tr" />
      <span className="cg-corner bl" />
      <span className="cg-corner br" />

      <div className="cg-console-head">
        <h3>ROYAL_ARSENAL_OS // v2.0</h3>
        <span>SYSTEM: {isSnakeInit ? 'BOOTING' : 'ACTIVE'}</span>
      </div>

      <div className="cg-console-body">
        <div className="cg-cyan-cross left">+</div>
        <div className="cg-cyan-cross right">+</div>

        <div className="cg-grid-shell">
          <div className="cg-grid">
            {pastYearDates.map((date, index) => {
              const count = activityMap[date] || 0;
              const snakeClass = isSnakeInit ? getSnakeClass(index) : '';

              return (
                <div
                  key={date}
                  className={`cg-cell ${snakeClass || getSquareToneClass(count)}`}
                  title={`${count} activities on ${date}`}
                />
              );
            })}
          </div>
        </div>

        <div className="cg-progress-track" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={activityPercent}>
          <div className="cg-progress-fill" style={{ width: `${activityPercent}%` }} />
        </div>
      </div>

      <div className="cg-console-foot">
        <span>SEQ: 0x9A4F | UPLINK ESTABLISHED | PORT: 8080</span>
        <span>TARGET_LOCK: {isSnakeInit ? 'WARMING' : 'CONFIRMED'}</span>
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
        <div className="cg-stat-card">
          <p>Active Days</p>
          <h4>{activeDays} / {GRID_DAYS}</h4>
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
