import axios from "axios";

const githubClient = axios.create({
  baseURL: "https://api.github.com",
  headers: {
    Accept: "application/vnd.github+json",
  },
});

const memoryCache = new Map();
const CACHE_TTL_MS = 2 * 60 * 1000;
const GITHUB_FALLBACK_KEY = "devsync-github-username";

const getStorageValue = (key) => {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
};

const setStorageValue = (key, value) => {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // ignore storage failures in private mode
  }
};

const getCached = (key) => {
  const entry = memoryCache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.timestamp > CACHE_TTL_MS) {
    memoryCache.delete(key);
    return null;
  }
  return entry.value;
};

const setCached = (key, value) => {
  memoryCache.set(key, { value, timestamp: Date.now() });
};

export const readPersistedGithubUsername = (userId) => {
  const scopedKey = userId ? `${GITHUB_FALLBACK_KEY}:${userId}` : null;
  return (scopedKey ? getStorageValue(scopedKey) : null) || getStorageValue(GITHUB_FALLBACK_KEY) || null;
};

export const persistGithubUsername = (username, userId) => {
  const normalized = extractGithubUsername(username);
  if (!normalized) return;
  setStorageValue(GITHUB_FALLBACK_KEY, normalized);
  if (userId) {
    setStorageValue(`${GITHUB_FALLBACK_KEY}:${userId}`, normalized);
  }
};

export const extractGithubUsername = (input) => {
  if (!input) return null;

  if (typeof input === "object") {
    const direct = (
      extractGithubUsername(input.githubUsername) ||
      extractGithubUsername(input.githubUrl) ||
      null
    );

    if (direct) return direct;
    return readPersistedGithubUsername(input._id || input.id);
  }

  if (typeof input !== "string") return null;
  const trimmed = input.trim();
  if (!trimmed) return null;

  // If it's already just a username.
  if (!trimmed.includes("/")) return trimmed;

  try {
    // Handle full URL or path-like strings.
    const url = trimmed.startsWith("http") ? new URL(trimmed) : new URL(`https://github.com/${trimmed.replace(/^\/+/, "")}`);
    const parts = url.pathname.split("/").filter(Boolean);
    return parts[0] || null;
  } catch {
    // Fallback: last path segment.
    const parts = trimmed.split("/").filter(Boolean);
    return parts[parts.length - 1] || null;
  }
};

export const fetchGithubRepos = async (username, { perPage = 4, signal } = {}) => {
  const u = extractGithubUsername(username);
  if (!u) return [];

  const cacheKey = `repos:${u}:${perPage}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  const res = await githubClient.get(`/users/${encodeURIComponent(u)}/repos`, {
    params: {
      sort: "updated",
      per_page: perPage,
    },
    signal,
  });

  const repos = Array.isArray(res.data) ? res.data : [];
  setCached(cacheKey, repos);
  return repos;
};

export const fetchGithubActivity = async (username, { perPage = 6, signal } = {}) => {
  const u = extractGithubUsername(username);
  if (!u) return [];

  const cacheKey = `activity:${u}:${perPage}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  const res = await githubClient.get(`/users/${encodeURIComponent(u)}/events/public`, {
    params: {
      per_page: perPage,
    },
    signal,
  });

  const events = Array.isArray(res.data) ? res.data : [];
  setCached(cacheKey, events);
  return events;
};

export const summarizeGithubEvent = (event) => {
  if (!event) return "";
  const repo = event?.repo?.name;
  const createdAt = event?.created_at;
  const type = event?.type;

  const action = (() => {
    switch (type) {
      case "PushEvent": {
        const count = event?.payload?.commits?.length;
        return `Pushed${count ? ` ${count} commit${count === 1 ? "" : "s"}` : ""}`;
      }
      case "PullRequestEvent": {
        const prAction = event?.payload?.action;
        return prAction ? `Pull request ${prAction}` : "Pull request activity";
      }
      case "IssuesEvent": {
        const issueAction = event?.payload?.action;
        return issueAction ? `Issue ${issueAction}` : "Issue activity";
      }
      case "IssueCommentEvent":
        return "Commented on an issue";
      case "WatchEvent":
        return "Starred";
      case "ForkEvent":
        return "Forked";
      case "CreateEvent": {
        const refType = event?.payload?.ref_type;
        return refType ? `Created ${refType}` : "Created";
      }
      case "ReleaseEvent": {
        const relAction = event?.payload?.action;
        return relAction ? `Release ${relAction}` : "Release activity";
      }
      default:
        return type ? type.replace(/Event$/, "") : "Activity";
    }
  })();

  const when = createdAt ? new Date(createdAt).toLocaleDateString([], { month: "short", day: "numeric" }) : "";

  return [action, repo ? `in ${repo}` : "", when ? `• ${when}` : ""].filter(Boolean).join(" ");
};

const toIsoDay = (value) => {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString().slice(0, 10);
};

const eventContributionWeight = (event) => {
  const type = event?.type;
  switch (type) {
    case "PushEvent":
      return Math.max(1, event?.payload?.commits?.length || 0);
    case "PullRequestEvent":
    case "IssuesEvent":
    case "IssueCommentEvent":
    case "PullRequestReviewEvent":
    case "PullRequestReviewCommentEvent":
    case "CommitCommentEvent":
      return 1;
    default:
      return 0;
  }
};

const buildStreaksFromDays = (days) => {
  if (!Array.isArray(days) || days.length === 0) {
    return {
      currentStreak: 0,
      longestStreak: 0,
      currentRange: null,
      longestRange: null,
    };
  }

  const sortedAsc = [...new Set(days)].sort();
  const asDate = (isoDay) => new Date(`${isoDay}T00:00:00Z`);
  const dayDiff = (a, b) => Math.round((asDate(b) - asDate(a)) / (24 * 60 * 60 * 1000));

  let longest = 1;
  let longestStart = sortedAsc[0];
  let longestEnd = sortedAsc[0];

  let runStart = sortedAsc[0];
  let runEnd = sortedAsc[0];
  let runLen = 1;

  for (let i = 1; i < sortedAsc.length; i += 1) {
    const prev = sortedAsc[i - 1];
    const curr = sortedAsc[i];
    if (dayDiff(prev, curr) === 1) {
      runLen += 1;
      runEnd = curr;
    } else {
      if (runLen > longest) {
        longest = runLen;
        longestStart = runStart;
        longestEnd = runEnd;
      }
      runStart = curr;
      runEnd = curr;
      runLen = 1;
    }
  }

  if (runLen > longest) {
    longest = runLen;
    longestStart = runStart;
    longestEnd = runEnd;
  }

  const sortedDesc = [...sortedAsc].sort((a, b) => (a < b ? 1 : -1));
  const todayIso = toIsoDay(new Date());
  const yesterday = new Date();
  yesterday.setUTCDate(yesterday.getUTCDate() - 1);
  const yesterdayIso = toIsoDay(yesterday);

  let current = 0;
  let currentStart = null;
  let currentEnd = null;

  if (sortedDesc[0] === todayIso || sortedDesc[0] === yesterdayIso) {
    current = 1;
    currentEnd = sortedDesc[0];
    currentStart = sortedDesc[0];
    for (let i = 1; i < sortedDesc.length; i += 1) {
      const prev = sortedDesc[i - 1];
      const curr = sortedDesc[i];
      if (dayDiff(curr, prev) === 1) {
        current += 1;
        currentStart = curr;
      } else {
        break;
      }
    }
  }

  return {
    currentStreak: current,
    longestStreak: longest,
    currentRange: currentStart && currentEnd ? { start: currentStart, end: currentEnd } : null,
    longestRange: { start: longestStart, end: longestEnd },
  };
};

export const fetchGithubContributionStats = async (username, { maxPages = 3, signal } = {}) => {
  const u = extractGithubUsername(username);
  if (!u) return null;

  const cacheKey = `contrib-stats:${u}:${maxPages}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  const events = [];
  for (let page = 1; page <= maxPages; page += 1) {
    const res = await githubClient.get(`/users/${encodeURIComponent(u)}/events/public`, {
      params: { per_page: 100, page },
      signal,
    });

    const chunk = Array.isArray(res.data) ? res.data : [];
    events.push(...chunk);
    if (chunk.length < 100) break;
  }

  const contributionByDay = new Map();
  let totalContributions = 0;

  for (const event of events) {
    const day = toIsoDay(event?.created_at);
    const weight = eventContributionWeight(event);
    if (!day || weight <= 0) continue;
    totalContributions += weight;
    contributionByDay.set(day, (contributionByDay.get(day) || 0) + weight);
  }

  const activeDays = Array.from(contributionByDay.keys()).sort();
  const streaks = buildStreaksFromDays(activeDays);

  const result = {
    username: u,
    totalContributions,
    activeDaysCount: activeDays.length,
    currentStreak: streaks.currentStreak,
    longestStreak: streaks.longestStreak,
    currentRange: streaks.currentRange,
    longestRange: streaks.longestRange,
    activityWindow: activeDays.length > 0 ? { start: activeDays[0], end: activeDays[activeDays.length - 1] } : null,
    generatedAt: new Date().toISOString(),
    note: "Based on recent public events (up to 300 events)",
  };

  setCached(cacheKey, result);
  return result;
};
