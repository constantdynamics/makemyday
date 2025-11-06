-- Make My Day PostgreSQL Schema

-- Enable PostGIS for geographic data
CREATE EXTENSION IF NOT EXISTS postgis;

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    display_name VARCHAR(100) NOT NULL,
    avatar VARCHAR(500),
    language VARCHAR(5) DEFAULT 'en',
    country VARCHAR(3),

    -- Premium status
    is_premium BOOLEAN DEFAULT FALSE,
    premium_type VARCHAR(20), -- 'TRIAL', 'MONTHLY', 'YEARLY'
    premium_start_date TIMESTAMP,
    premium_expiry_date TIMESTAMP,
    premium_auto_renew BOOLEAN DEFAULT FALSE,

    -- Homebase
    homebase_location GEOGRAPHY(POINT, 4326),
    homebase_set_at TIMESTAMP,

    -- Statistics
    total_sessions INTEGER DEFAULT 0,
    total_activities INTEGER DEFAULT 0,
    total_distance INTEGER DEFAULT 0, -- meters
    total_time INTEGER DEFAULT 0, -- minutes
    average_rating DECIMAL(3, 2) DEFAULT 0,

    -- Preferences (stored as JSONB)
    preferences JSONB DEFAULT '{"filters": [], "difficulty": 3, "notifications": {"daily": true, "community": true, "achievements": true}}',

    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_active TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMP,

    -- Indexes
    CONSTRAINT valid_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_premium ON users(is_premium);
CREATE INDEX idx_users_created ON users(created_at);
CREATE INDEX idx_users_homebase ON users USING GIST(homebase_location);

-- Sessions table
CREATE TABLE IF NOT EXISTS sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    -- Configuration
    transport_mode VARCHAR(20) NOT NULL, -- 'WALKING', 'CYCLING', 'DRIVING'
    total_time INTEGER NOT NULL, -- minutes
    group_size INTEGER NOT NULL CHECK (group_size BETWEEN 1 AND 5),
    start_location GEOGRAPHY(POINT, 4326) NOT NULL,
    filters JSONB DEFAULT '[]',

    -- Status
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE', -- 'ACTIVE', 'COMPLETED', 'ABANDONED'

    -- Skip management
    skips_available INTEGER DEFAULT 1,
    skips_used INTEGER DEFAULT 0,
    skipped_types JSONB DEFAULT '[]',

    -- Metrics
    total_distance INTEGER, -- meters
    total_duration INTEGER, -- minutes

    -- Timestamps
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,

    -- Indexes
    CONSTRAINT valid_transport CHECK (transport_mode IN ('WALKING', 'CYCLING', 'DRIVING')),
    CONSTRAINT valid_status CHECK (status IN ('ACTIVE', 'COMPLETED', 'ABANDONED'))
);

CREATE INDEX idx_sessions_user ON sessions(user_id);
CREATE INDEX idx_sessions_status ON sessions(status);
CREATE INDEX idx_sessions_started ON sessions(started_at);

-- Session Activities (activities completed within a session)
CREATE TABLE IF NOT EXISTS session_activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
    activity_id VARCHAR(100) NOT NULL,
    activity_type VARCHAR(20) NOT NULL, -- 'LOCATION', 'CHALLENGE'

    -- Status
    skipped BOOLEAN DEFAULT FALSE,
    completed BOOLEAN DEFAULT FALSE,

    -- Completion data
    rating INTEGER CHECK (rating BETWEEN 1 AND 5),
    photo_url VARCHAR(500),
    feedback TEXT,

    -- Timestamps
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,

    CONSTRAINT valid_activity_type CHECK (activity_type IN ('LOCATION', 'CHALLENGE'))
);

CREATE INDEX idx_session_activities_session ON session_activities(session_id);
CREATE INDEX idx_session_activities_activity ON session_activities(activity_id);
CREATE INDEX idx_session_activities_completed ON session_activities(completed);

-- Refresh Tokens
CREATE TABLE IF NOT EXISTS refresh_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(500) NOT NULL UNIQUE,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT token_not_expired CHECK (expires_at > CURRENT_TIMESTAMP)
);

CREATE INDEX idx_refresh_tokens_user ON refresh_tokens(user_id);
CREATE INDEX idx_refresh_tokens_token ON refresh_tokens(token);
CREATE INDEX idx_refresh_tokens_expires ON refresh_tokens(expires_at);

-- Premium Subscriptions
CREATE TABLE IF NOT EXISTS premium_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    subscription_type VARCHAR(20) NOT NULL, -- 'MONTHLY', 'YEARLY'
    platform VARCHAR(20) NOT NULL, -- 'IOS', 'ANDROID', 'WEB'
    platform_subscription_id VARCHAR(255),

    start_date TIMESTAMP NOT NULL,
    expiry_date TIMESTAMP NOT NULL,
    auto_renew BOOLEAN DEFAULT TRUE,

    -- Payment
    amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'EUR',

    status VARCHAR(20) DEFAULT 'ACTIVE', -- 'ACTIVE', 'CANCELLED', 'EXPIRED'

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT valid_subscription_type CHECK (subscription_type IN ('MONTHLY', 'YEARLY')),
    CONSTRAINT valid_status CHECK (status IN ('ACTIVE', 'CANCELLED', 'EXPIRED'))
);

CREATE INDEX idx_subscriptions_user ON premium_subscriptions(user_id);
CREATE INDEX idx_subscriptions_status ON premium_subscriptions(status);
CREATE INDEX idx_subscriptions_expiry ON premium_subscriptions(expiry_date);

-- Premium Trials
CREATE TABLE IF NOT EXISTS premium_trials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    start_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP NOT NULL,
    converted BOOLEAN DEFAULT FALSE,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_trials_user ON premium_trials(user_id);
CREATE INDEX idx_trials_end_date ON premium_trials(end_date);

-- Vacation Plans (Premium feature)
CREATE TABLE IF NOT EXISTS vacation_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    destination_country VARCHAR(100) NOT NULL,
    destination_region VARCHAR(255),
    destination_location GEOGRAPHY(POINT, 4326),

    duration INTEGER NOT NULL, -- days
    start_date DATE,

    status VARCHAR(20) DEFAULT 'PLANNING', -- 'PLANNING', 'ACTIVE', 'COMPLETED'
    usage_count INTEGER DEFAULT 1, -- track 2x per year limit

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT valid_vacation_status CHECK (status IN ('PLANNING', 'ACTIVE', 'COMPLETED'))
);

CREATE INDEX idx_vacation_plans_user ON vacation_plans(user_id);
CREATE INDEX idx_vacation_plans_created ON vacation_plans(created_at);

-- Analytics Events (for tracking usage patterns)
CREATE TABLE IF NOT EXISTS analytics_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,

    event_type VARCHAR(50) NOT NULL,
    event_data JSONB,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_analytics_user ON analytics_events(user_id);
CREATE INDEX idx_analytics_type ON analytics_events(event_type);
CREATE INDEX idx_analytics_created ON analytics_events(created_at);

-- Functions and Triggers

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to relevant tables
CREATE TRIGGER update_premium_subscriptions_updated_at BEFORE UPDATE ON premium_subscriptions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vacation_plans_updated_at BEFORE UPDATE ON vacation_plans
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Update last_active on user actions
CREATE OR REPLACE FUNCTION update_user_last_active()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE users SET last_active = CURRENT_TIMESTAMP WHERE id = NEW.user_id;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_last_active_on_session AFTER INSERT ON sessions
    FOR EACH ROW EXECUTE FUNCTION update_user_last_active();
