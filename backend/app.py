import os
from flask import Flask, jsonify, request
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from flask_compress import Compress
from dotenv import load_dotenv
from functools import wraps
from time import time

# Load environment variables from .env file
load_dotenv()

app = Flask(__name__)
Compress(app)  # Enable gzip compression

# Simple in-memory cache
cache = {}
CACHE_TIMEOUT = 5  # seconds

def cached(timeout=CACHE_TIMEOUT):
    """Simple cache decorator"""
    def decorator(f):
        @wraps(f)
        def wrapper(*args, **kwargs):
            cache_key = f.__name__ + str(args) + str(kwargs)
            now = time()
            if cache_key in cache:
                result, timestamp = cache[cache_key]
                if now - timestamp < timeout:
                    return result
            result = f(*args, **kwargs)
            cache[cache_key] = (result, now)
            return result
        return wrapper
    return decorator

@app.route('/')
def home():
    return "Backend is running!", 200

# 1. Configuration
# Ensure DB is always in the backend/instance folder regardless of where code is run from
basedir = os.path.abspath(os.path.dirname(__file__))
db_path = os.path.join(basedir, 'leaderboard.db')

# Fix for Windows: SQLAlchemy requires forward slashes in the path for sqlite
if os.name == 'nt':
    db_path = db_path.replace('\\', '/')

# Use DATABASE_URL if set (Postgres), otherwise fallback to local SQLite
uri = os.environ.get('DATABASE_URL')
if not uri or not uri.strip(): 
    # Fallback to SQLite if DATABASE_URL is missing or empty
    uri = 'sqlite:///' + db_path

app.config['SQLALCHEMY_DATABASE_URI'] = uri

if app.config['SQLALCHEMY_DATABASE_URI'] and app.config['SQLALCHEMY_DATABASE_URI'].startswith("postgres://"):
    app.config['SQLALCHEMY_DATABASE_URI'] = app.config['SQLALCHEMY_DATABASE_URI'].replace("postgres://", "postgresql://", 1)
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Enable CORS with specific origins
# Support both development (localhost) and production (Vercel) URLs
frontend_url = os.environ.get('FRONTEND_URL', '*')
if frontend_url == '*':
    # Allow all origins in development if FRONTEND_URL is not set
    CORS(app, resources={r"/api/*": {"origins": "*"}})
else:
    # Allow both the specified URL and localhost for development
    allowed_origins = [
        frontend_url,
        'http://localhost:5173',
        'http://localhost:3000',
        'https://mini-games-acm.vercel.app'
    ]
    CORS(app, resources={r"/api/*": {"origins": allowed_origins}})

# Initialize Database
db = SQLAlchemy(app)

# 2. Database Model
class Team(db.Model):
    __tablename__ = 'team'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False, unique=True, index=True)  # Add index
    monkeytype_score = db.Column(db.Integer, default=0)
    wordle_score = db.Column(db.Integer, default=0)
    pacman_score = db.Column(db.Integer, default=0)
    meme_decoder_score = db.Column(db.Integer, default=0)
    emoji_score = db.Column(db.Integer, default=0)
    current_game_index = db.Column(db.Integer, default=0, index=True)  # Add index
    unlocks_count = db.Column(db.Integer, default=0)  # Track number of unlocks

    # Helper to convert SQL object to JSON for React
    def to_json(self):
        return {
            'teamName': self.name,
            'monkeytypeScore': self.monkeytype_score,
            'wordleScore': self.wordle_score,
            'pacmanScore': self.pacman_score,
            'memodecoderScore': self.meme_decoder_score, # specific spelling from your React code
            'emojiScore': self.emoji_score,
            'currentGameIndex': self.current_game_index,  # Include game progress
            'unlocksCount': self.unlocks_count,
            'totalScore': (self.monkeytype_score + self.wordle_score + 
                           self.pacman_score + self.meme_decoder_score + 
                           self.emoji_score)
        }

# Game Configuration Model (Singleton)
class GameConfig(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    game_active = db.Column(db.Boolean, default=False)
    
    def to_json(self):
        return {
            'gameActive': self.game_active
        }

# 3. Create DB and Seed Data (Run once on startup)
def init_db():
    with app.app_context():
        db.create_all()
        
        # Initialize GameConfig if it doesn't exist
        if not GameConfig.query.first():
            config = GameConfig(game_active=False)
            db.session.add(config)
            db.session.commit()
            print("✅ GameConfig initialized with game_active=False")
        


# New batched endpoint for admin dashboard (combines leaderboard + game status)
@app.route('/api/admin/dashboard-data', methods=['GET'])
@cached(timeout=8)
def get_dashboard_data():
    teams = Team.query.all()
    config = GameConfig.query.first()
    if not config:
        config = GameConfig(game_active=False)
        db.session.add(config)
        db.session.commit()
    
    response = jsonify({
        'teams': [team.to_json() for team in teams],
        'gameActive': config.game_active
    })
    response.headers['Cache-Control'] = 'public, max-age=8'
    return response

# 4. Routes
@app.route('/api/leaderboard', methods=['GET'])
@cached(timeout=8)  # Cache for 8 seconds
def get_leaderboard():
    teams = Team.query.all()
    # Convert list of SQL objects to list of dictionaries (JSON)
    response = jsonify([team.to_json() for team in teams])
    response.headers['Cache-Control'] = 'public, max-age=8'
    return response

# (Optional) Endpoint to update a score
@app.route('/api/update-score', methods=['POST'])
def update_score():
    # Clear cache when scores change
    cache.clear()
    data = request.json
    team_name = data.get('teamName')
    game_id = data.get('gameId') # e.g., 'pacman'
    new_score = data.get('score')
    
    print(f"🎮 Score update request: Team={team_name}, Game={game_id}, Score={new_score}")

    team = Team.query.filter_by(name=team_name).first()
    if not team:
        print(f"❌ Team not found: {team_name}")
        return jsonify({"error": "Team not found"}), 404

    # Update the specific score based on game ID
    if game_id == 'monkeytype': 
        team.monkeytype_score = new_score
        print(f"✅ Updated monkeytype_score to {new_score}")
    elif game_id == 'wordle': 
        team.wordle_score = new_score
        print(f"✅ Updated wordle_score to {new_score}")
    elif game_id == 'pacman': 
        team.pacman_score = new_score
        print(f"✅ Updated pacman_score to {new_score}")
    elif game_id == 'memeDecoder': 
        team.meme_decoder_score = new_score
        print(f"✅ Updated meme_decoder_score to {new_score}")
    elif game_id == 'emoji': 
        team.emoji_score = new_score
        print(f"✅ Updated emoji_score to {new_score}")
    else:
        print(f"⚠️ Unknown game_id: {game_id}")
    
    db.session.commit()
    print(f"💾 Database committed. Team data: {team.to_json()}")
    return jsonify({"success": True, "team": team.to_json()})

# New endpoint to get game state for a team
@app.route('/api/game-state/<team_name>', methods=['GET'])
def get_game_state(team_name):
    team = Team.query.filter_by(name=team_name).first()
    if not team:
        return jsonify({"error": "Team not found"}), 404
    
    return jsonify({
        "teamName": team.name,
        "currentGameIndex": team.current_game_index
    })

# New endpoint to register a team (Admin)
@app.route('/api/register-team', methods=['POST'])
def register_team():
    data = request.json
    team_name = data.get('teamName')
    
    if not team_name:
        return jsonify({"error": "Missing teamName"}), 400
    
    # Check if exists
    if Team.query.filter_by(name=team_name).first():
        return jsonify({"error": "Team already exists"}), 400
        
    # Create new team with 0 scores
    new_team = Team(name=team_name)
    db.session.add(new_team)
    db.session.commit()
    
    return jsonify({"success": True, "team": new_team.to_json()})

# New endpoint to update unlock count
@app.route('/api/update-unlocks', methods=['POST'])
def update_unlocks():
    cache.clear()
    data = request.json
    team_name = data.get('teamName')
    unlocks_count = data.get('unlocksCount')
    
    print(f"🔓 Unlock update: Team={team_name}, Unlocks={unlocks_count}")
    
    team = Team.query.filter_by(name=team_name).first()
    if not team:
        print(f"❌ Team not found: {team_name}")
        return jsonify({"error": "Team not found"}), 404
    
    team.unlocks_count = unlocks_count
    db.session.commit()
    print(f"✅ Updated {team_name} unlocks to {unlocks_count}")
    return jsonify({"success": True, "team": team.to_json()})

# New endpoint to save game state
@app.route('/api/save-game-state', methods=['POST'])
def save_game_state():
    # Clear cache when game state changes
    cache.clear()
    data = request.json
    team_name = data.get('teamName')
    game_index = data.get('currentGameIndex')
    
    if team_name is None or game_index is None:
        return jsonify({"error": "Missing teamName or currentGameIndex"}), 400
    
    team = Team.query.filter_by(name=team_name).first()
    if not team:
        # Create team if it doesn't exist
        team = Team(name=team_name, current_game_index=game_index)
        db.session.add(team)
    else:
        team.current_game_index = game_index
    
    db.session.commit()
    return jsonify({"success": True, "team": team.to_json()})

# Game control endpoints
@app.route('/api/game-status', methods=['GET'])
@cached(timeout=8)  # Cache for 8 seconds
def get_game_status():
    config = GameConfig.query.first()
    if not config:
        # If config doesn't exist, create it with default value
        config = GameConfig(game_active=False)
        db.session.add(config)
        db.session.commit()
    response = jsonify(config.to_json())
    response.headers['Cache-Control'] = 'public, max-age=8'
    return response

@app.route('/api/admin/start-game', methods=['POST'])
def start_game():
    # Clear cache when game state changes
    cache.clear()
    config = GameConfig.query.first()
    if not config:
        config = GameConfig(game_active=True)
        db.session.add(config)
    else:
        config.game_active = True
    db.session.commit()
    return jsonify({"success": True, "message": "Game started!", "gameActive": config.game_active})

@app.route('/api/admin/stop-game', methods=['POST'])
def stop_game():
    # Clear cache when game state changes
    cache.clear()
    config = GameConfig.query.first()
    if not config:
        config = GameConfig(game_active=False)
        db.session.add(config)
    else:
        config.game_active = False
    db.session.commit()
    return jsonify({"success": True, "message": "Game stopped!", "gameActive": config.game_active})

if __name__ == '__main__':
    init_db() # Ensure DB exists before starting
    app.run(debug=True, port=5000)