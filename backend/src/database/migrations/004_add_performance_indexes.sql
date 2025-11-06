-- Performance optimization indexes
-- Migration 004: Add indexes for frequently queried columns

-- Users table indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);

-- Sessions table indexes
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_status ON sessions(status);
CREATE INDEX IF NOT EXISTS idx_sessions_created_at ON sessions(created_at);
CREATE INDEX IF NOT EXISTS idx_sessions_user_status ON sessions(user_id, status);

-- Activities table indexes
CREATE INDEX IF NOT EXISTS idx_activities_session_id ON activities(session_id);
CREATE INDEX IF NOT EXISTS idx_activities_status ON activities(status);
CREATE INDEX IF NOT EXISTS idx_activities_created_at ON activities(created_at);
CREATE INDEX IF NOT EXISTS idx_activities_session_status ON activities(session_id, status);

-- User stats table indexes
CREATE INDEX IF NOT EXISTS idx_user_stats_user_id ON user_stats(user_id);

-- Premium subscriptions indexes
CREATE INDEX IF NOT EXISTS idx_premium_user_id ON premium_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_premium_status ON premium_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_premium_trial_end ON premium_subscriptions(trial_end_date);
CREATE INDEX IF NOT EXISTS idx_premium_subscription_end ON premium_subscriptions(subscription_end_date);

-- Refresh tokens indexes
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user_id ON refresh_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_expires ON refresh_tokens(expires_at);

-- Composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_sessions_user_created ON sessions(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activities_session_created ON activities(session_id, created_at DESC);

-- Comments to document the indexes
COMMENT ON INDEX idx_users_email IS 'Speeds up login and user lookup queries';
COMMENT ON INDEX idx_sessions_user_status IS 'Optimizes session listing with status filtering';
COMMENT ON INDEX idx_activities_session_status IS 'Improves activity queries per session';
COMMENT ON INDEX idx_premium_user_id IS 'Fast premium status checks';
