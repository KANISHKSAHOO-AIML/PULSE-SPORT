-- Create the generic matches table
CREATE TABLE matches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sport VARCHAR(50) NOT NULL, -- 'cricket' or 'football'
    title VARCHAR(255) NOT NULL,
    team_a VARCHAR(100) NOT NULL,
    team_b VARCHAR(100) NOT NULL,
    score_a VARCHAR(50) NOT NULL,
    score_b VARCHAR(50) NOT NULL,
    status VARCHAR(255) NOT NULL,
    live BOOLEAN DEFAULT false,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Realtime for the matches table
ALTER TABLE matches REPLICA IDENTITY FULL;

-- (Optional) Insert some initial seed data
INSERT INTO matches (sport, title, team_a, team_b, score_a, score_b, status, live)
VALUES
    ('cricket', 'World Cup Finals • T20', 'India', 'Australia', '185/4 (20)', '160/8 (18.2)', 'Australia need 26 runs from 10 balls', true),
    ('cricket', 'IPL 2026 • Match 45', 'CSK', 'MI', '210/6 (20)', '198/9 (20)', 'CSK won by 12 runs', false),
    ('football', 'Champions League • Semi-Final', 'Real Madrid', 'Man City', '2', '1', '78'' - 2nd Half', true),
    ('football', 'Premier League • Matchday 32', 'Arsenal', 'Liverpool', '0', '0', 'HT - Half Time', true);
