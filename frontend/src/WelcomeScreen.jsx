import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameCompletion } from './GameContext';
import './WelcomeScreen.css';
import acmLogo from './assets/acm_logo.png';
import grassImg from './assets/grass.png';
import { API_URL } from './config';

function WelcomeScreen() {
    const navigate = useNavigate();
    const { teamName } = useGameCompletion();
    const [gameActive, setGameActive] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Poll game status every 8 seconds, only when tab is visible
        const checkGameStatus = async () => {
            try {
                const response = await fetch(`${API_URL}/api/game-status`);
                if (response.ok) {
                    const data = await response.json();
                    setGameActive(data.gameActive);

                    // If game becomes active, redirect to game
                    if (data.gameActive) {
                        navigate('/monkeytype');
                    }
                }
            } catch (error) {
                console.error('Error checking game status:', error);
            } finally {
                setLoading(false);
            }
        };

        const handleVisibilityChange = () => {
            if (!document.hidden) {
                checkGameStatus();
            }
        };

        checkGameStatus(); // Initial check
        const interval = setInterval(() => {
            if (!document.hidden) {
                checkGameStatus();
            }
        }, 8000);
        
        document.addEventListener('visibilitychange', handleVisibilityChange);
        
        return () => {
            clearInterval(interval);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [navigate]);

    return (
        <div className="landing-container">
            <div className="bg-rays"></div>

            <div className="content-wrapper">
                <header className="presenter-header">
                    <img src={acmLogo} alt="ACM Logo" className="club-logo" />
                    <div className="badge-container">
                        <span className="club-badge">ACM STUDENT CHAPTER</span>
                    </div>
                </header>

                <main className="main-content">
                    <h1 className="event-title">DEV RELAY</h1>

                    <div className="welcome-message">
                        <div className="team-welcome">
                            <h2>Welcome, <span className="team-name-highlight">{teamName}!</span></h2>
                            <p className="subtitle">You're all set to compete.</p>
                        </div>

                        {loading ? (
                            <div className="status-box loading">
                                <div className="spinner"></div>
                                <p>Connecting...</p>
                            </div>
                        ) : gameActive ? (
                            <div className="status-box active">
                                <div className="pulse-indicator"></div>
                                <h3>🚀 Game Starting!</h3>
                                <p>Redirecting you now...</p>
                            </div>
                        ) : (
                            <div className="status-box waiting">
                                <div className="waiting-animation">
                                    <div className="dot"></div>
                                    <div className="dot"></div>
                                    <div className="dot"></div>
                                </div>
                                <h3>⏳ Waiting for Admin</h3>
                                <p>The competition will begin shortly.<br />Please stay on this page.</p>
                            </div>
                        )}
                    </div>
                </main>
            </div>

            <div className="grass-container" style={{ backgroundImage: `url(${grassImg})` }}></div>
        </div>
    );
}

export default WelcomeScreen;
