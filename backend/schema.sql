-- Create the Team table
CREATE TABLE IF NOT EXISTS team (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    monkeytype_score INTEGER DEFAULT 0,
    wordle_score INTEGER DEFAULT 0,
    pacman_score INTEGER DEFAULT 0,
    meme_decoder_score INTEGER DEFAULT 0,
    emoji_score INTEGER DEFAULT 0,
    current_game_index INTEGER DEFAULT 0
);
