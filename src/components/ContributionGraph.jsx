import React, { useEffect, useMemo, useRef, useState } from 'react';
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

const toPoint = (index) => ({
  col: Math.floor(index / GRID_ROWS),
  row: index % GRID_ROWS,
});

const inBounds = (col, row) => col >= 0 && col < GRID_COLS && row >= 0 && row < GRID_ROWS;

const getNeighbors = (index) => {
  const { col, row } = toPoint(index);
  const deltas = [
    [1, 0],
    [-1, 0],
    [0, 1],
    [0, -1],
  ];

  return deltas
    .map(([dc, dr]) => ({ col: col + dc, row: row + dr }))
    .filter((point) => inBounds(point.col, point.row))
    .map((point) => toCellIndex(point.col, point.row));
};

const manhattan = (a, b) => {
  const pa = toPoint(a);
  const pb = toPoint(b);
  return Math.abs(pa.col - pb.col) + Math.abs(pa.row - pb.row);
};

const reconstructPath = (cameFrom, current) => {
  const path = [current];
  let cursor = current;
  while (cameFrom.has(cursor)) {
    cursor = cameFrom.get(cursor);
    path.unshift(cursor);
  }
  return path;
};

const aStarPath = (start, goal, blockedSet) => {
  if (start === goal) return [start];

  const open = [start];
  const openSet = new Set([start]);
  const cameFrom = new Map();
  const gScore = new Map([[start, 0]]);
  const fScore = new Map([[start, manhattan(start, goal)]]);

  while (open.length > 0) {
    let current = open[0];
    let currentIdx = 0;

    for (let i = 1; i < open.length; i += 1) {
      if ((fScore.get(open[i]) || Infinity) < (fScore.get(current) || Infinity)) {
        current = open[i];
        currentIdx = i;
      }
    }

    if (current === goal) return reconstructPath(cameFrom, current);

    open.splice(currentIdx, 1);
    openSet.delete(current);

    const neighbors = getNeighbors(current);
    for (const neighbor of neighbors) {
      if (blockedSet.has(neighbor) && neighbor !== goal) continue;

      const tentative = (gScore.get(current) || Infinity) + 1;
      if (tentative < (gScore.get(neighbor) || Infinity)) {
        cameFrom.set(neighbor, current);
        gScore.set(neighbor, tentative);
        fScore.set(neighbor, tentative + manhattan(neighbor, goal));

        if (!openSet.has(neighbor)) {
          open.push(neighbor);
          openSet.add(neighbor);
        }
      }
    }
  }

  return null;
};

const findPathToNearestFood = (head, foods, blockedSet) => {
  if (!foods.length) return null;

  const candidates = [...foods].sort((a, b) => manhattan(head, a) - manhattan(head, b));
  for (let i = 0; i < Math.min(candidates.length, 16); i += 1) {
    const path = aStarPath(head, candidates[i], blockedSet);
    if (path && path.length > 1) return path;
  }
  return null;
};

const ContributionGraph = () => {
  const [data, setData] = useState({ activities: [], currentStreak: 0, longestStreak: 0, badges: [] });
  const [loading, setLoading] = useState(true);
  const [snake, setSnake] = useState([]);
  const [foodIndices, setFoodIndices] = useState([]);
  const [systemStatus, setSystemStatus] = useState('BOOTING');

  const snakeRef = useRef([]);
  const foodRef = useRef([]);

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

  const initialFoodIndices = useMemo(() => {
    return pastYearDates
      .map((date, index) => ({ date, index }))
      .filter(({ date }) => (activityMap[date] || 0) > 0)
      .map(({ index }) => index);
  }, [pastYearDates, activityMap]);

  const initialSnake = useMemo(() => {
    // Start near the top-right, then chase activity cells.
    const head = toCellIndex(GRID_COLS - 5, 1);
    return [head, toCellIndex(GRID_COLS - 6, 1), toCellIndex(GRID_COLS - 7, 1)];
  }, []);

  useEffect(() => {
    snakeRef.current = snake;
  }, [snake]);

  useEffect(() => {
    foodRef.current = foodIndices;
  }, [foodIndices]);

  useEffect(() => {
    if (loading) return;
    setSnake(initialSnake);
    setFoodIndices(initialFoodIndices);
    setSystemStatus(initialFoodIndices.length ? 'SEEKING TARGET' : 'IDLE');
  }, [loading, initialSnake, initialFoodIndices]);

  useEffect(() => {
    if (loading) return undefined;

    let rafId = null;
    let lastFrameTs = 0;
    let accumulator = 0;
    const tickMs = 92;

    const tick = () => {
      const currentSnake = snakeRef.current;
      const currentFood = foodRef.current;
      if (!currentSnake.length) return;

      if (!currentFood.length) {
        setSystemStatus('TARGET_LOCK: COMPLETE');
        return;
      }

      const head = currentSnake[0];
      const bodyBlocks = new Set(currentSnake.slice(0, -1));
      const path = findPathToNearestFood(head, currentFood, bodyBlocks);

      let nextHead = null;
      if (path && path.length > 1) {
        nextHead = path[1];
      } else {
        const fallback = getNeighbors(head).find((neighbor) => !bodyBlocks.has(neighbor));
        nextHead = fallback ?? null;
      }

      if (nextHead === null) {
        setSnake(initialSnake);
        snakeRef.current = initialSnake;
        setSystemStatus('REBOOTING PATHFINDER');
        return;
      }

      const foodSet = new Set(currentFood);
      const ateFood = foodSet.has(nextHead);

      const nextSnake = [nextHead, ...currentSnake];
      if (!ateFood) nextSnake.pop();

      setSnake(nextSnake);
      snakeRef.current = nextSnake;

      if (ateFood) {
        const remainingFood = currentFood.filter((idx) => idx !== nextHead);
        setFoodIndices(remainingFood);
        foodRef.current = remainingFood;
        setSystemStatus(remainingFood.length ? 'TARGET_LOCK: CONFIRMED' : 'GRID CLEARED');
      } else {
        setSystemStatus('UPLINK ESTABLISHED');
      }
    };

    const animate = (timestamp) => {
      if (!lastFrameTs) lastFrameTs = timestamp;
      const delta = timestamp - lastFrameTs;
      lastFrameTs = timestamp;
      accumulator += delta;

      while (accumulator >= tickMs) {
        tick();
        accumulator -= tickMs;
      }

      rafId = window.requestAnimationFrame(animate);
    };

    rafId = window.requestAnimationFrame(animate);

    return () => {
      if (rafId) window.cancelAnimationFrame(rafId);
    };
  }, [loading, initialSnake]);

  const getSquareToneClass = (count) => {
    if (!count || count === 0) return 'cg-tone-0';
    if (count <= 2) return 'cg-tone-1';
    if (count <= 5) return 'cg-tone-2';
    if (count <= 9) return 'cg-tone-3';
    return 'cg-tone-4';
  };

  const snakeSet = useMemo(() => new Set(snake), [snake]);
  const snakeHead = snake[0];
  const snakeTail = snake[snake.length - 1];
  const foodSet = useMemo(() => new Set(foodIndices), [foodIndices]);

  const totalTargets = initialFoodIndices.length;
  const consumedTargets = Math.max(0, totalTargets - foodIndices.length);
  const activityPercent = totalTargets > 0 ? Math.min(100, Math.round((consumedTargets / totalTargets) * 100)) : 0;

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
        <span>SYSTEM: {systemStatus || 'ACTIVE'}</span>
      </div>

      <div className="cg-console-body">
        <div className="cg-cyan-cross left">+</div>
        <div className="cg-cyan-cross right">+</div>

        <div className="cg-grid-shell">
          <div className="cg-grid">
            {pastYearDates.map((date, index) => {
              const count = activityMap[date] || 0;
              const isSnakeCell = snakeSet.has(index);
              const isFoodCell = foodSet.has(index);

              let className = 'cg-cell cg-tone-0';
              if (isFoodCell) className = `cg-cell ${getSquareToneClass(count)}`;
              if (isSnakeCell) {
                if (index === snakeHead) className = 'cg-cell cg-snake-head';
                else if (index === snakeTail) className = 'cg-cell cg-snake-tail';
                else className = 'cg-cell cg-snake-body';
              }

              return (
                <div
                  key={date}
                  className={className}
                  title={`${count} activities on ${date}${isFoodCell ? ' • target' : ''}`}
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
        <span>TARGET_LOCK: {foodIndices.length > 0 ? 'CONFIRMED' : 'COMPLETE'}</span>
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
          <p>Targets Cleared</p>
          <h4>{consumedTargets} / {totalTargets || 0}</h4>
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
