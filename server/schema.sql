CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  town TEXT NOT NULL,
  initials TEXT NOT NULL,
  hearth_points INTEGER NOT NULL DEFAULT 0,
  lantern_opt_in INTEGER NOT NULL DEFAULT 0,
  lantern_note TEXT NOT NULL DEFAULT '',
  offerings TEXT NOT NULL DEFAULT '',
  needs TEXT NOT NULL DEFAULT ''
);

CREATE TABLE IF NOT EXISTS requests (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  town TEXT NOT NULL,
  requester_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open',
  claimed_by_id TEXT,
  hearth_value INTEGER NOT NULL,
  urgent TEXT,
  created_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS projects (
  id TEXT PRIMARY KEY,
  owner_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  help_wanted TEXT NOT NULL,
  is_venture INTEGER NOT NULL DEFAULT 0,
  stage TEXT,
  backers TEXT NOT NULL DEFAULT '[]',
  skill_shares TEXT NOT NULL DEFAULT '[]',
  testimonials TEXT NOT NULL DEFAULT '[]',
  created_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS lantern_actions (
  id TEXT PRIMARY KEY,
  from_user_id TEXT NOT NULL,
  to_user_id TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at INTEGER NOT NULL
);
