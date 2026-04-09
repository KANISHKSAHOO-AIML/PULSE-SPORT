-- Create the news table
CREATE TABLE news (
    id SERIAL PRIMARY KEY,
    sport VARCHAR(50) NOT NULL, -- 'cricket' or 'football'
    title VARCHAR(255) NOT NULL,
    summary TEXT NOT NULL,
    image_url TEXT NOT NULL,
    time_ago VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Realtime for the news table
ALTER TABLE news REPLICA IDENTITY FULL;

-- Seed initial data for news
INSERT INTO news (sport, title, summary, image_url, time_ago)
VALUES
    ('cricket', 'India Lifts the World Cup Trophy After a Thrilling Final', 'In a match that will be remembered for ages, India secured a dramatic victory against Australia in the T20 World Cup Finals.', 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?ixlib=rb-4.0.3&auto=format&fit=crop&q=80', '2 hours ago'),
    ('football', 'Champions League Drama: Real Madrid Pulls Off Another Late Comeback', 'An incredible second-half performance saw Real Madrid overturn a deficit to progress to the Champions League final.', 'https://images.unsplash.com/photo-1518605368461-1ee127fb9218?ixlib=rb-4.0.3&auto=format&fit=crop&q=80', '4 hours ago'),
    ('cricket', 'IPL 2026 Auction: Top 5 Surprise Picks That Stunned Everyone', 'The recent auction saw several unknown players bag massive contracts, while some established veterans went unsold.', 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?ixlib=rb-4.0.3&auto=format&fit=crop&q=80', '1 day ago'),
    ('football', 'Premier League Title Race: Arsenal Drops Crucial Points', 'A frustrating draw against Liverpool means Arsenal''s hopes of lifting the Premier League trophy now rely on other results.', 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?ixlib=rb-4.0.3&auto=format&fit=crop&q=80', '1 day ago');


-- Create the highlights table
CREATE TABLE highlights (
    id SERIAL PRIMARY KEY,
    sport VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    thumbnail TEXT NOT NULL,
    duration VARCHAR(20) NOT NULL,
    views VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Realtime for the highlights table
ALTER TABLE highlights REPLICA IDENTITY FULL;

-- Seed initial data for highlights
INSERT INTO highlights (sport, title, thumbnail, duration, views)
VALUES
    ('football', 'Real Madrid vs Man City: Amazing Semi-Final Goals', 'https://images.unsplash.com/photo-1522778119026-d647f0596c20?ixlib=rb-4.0.3&auto=format&fit=crop&q=80', '5:23', '1.2M views'),
    ('cricket', 'Winning Moment: World Cup Finals Last Ball Drama', 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?ixlib=rb-4.0.3&auto=format&fit=crop&q=80', '2:15', '3.5M views'),
    ('football', 'Top 10 Premier League Saves of the Season', 'https://images.unsplash.com/photo-1431324155629-1a6d0a6eb858?ixlib=rb-4.0.3&auto=format&fit=crop&q=80', '10:45', '850K views'),
    ('cricket', 'IPL 2026: Match 45 Full Highlights', 'https://images.unsplash.com/photo-1593341646782-e0ee5010688f?ixlib=rb-4.0.3&auto=format&fit=crop&q=80', '15:30', '420K views'),
    ('football', 'Insane Free Kick Goal from 35 Yards Out', 'https://images.unsplash.com/photo-1552667466-07770ae110d0?ixlib=rb-4.0.3&auto=format&fit=crop&q=80', '1:10', '2.1M views'),
    ('cricket', 'Fastest Century in T20 History', 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?ixlib=rb-4.0.3&auto=format&fit=crop&q=80', '8:20', '5M views');
