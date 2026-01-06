import { useState } from 'react';
import { getSessions, clearSessions } from '../utils/storage';
import './SessionHistory.css';

export default function SessionHistory({ onBack }) {
    const [sessions, setSessions] = useState(() => getSessions());
    const [showClearConfirm, setShowClearConfirm] = useState(false);

    const handleClear = () => {
        clearSessions();
        setSessions([]);
        setShowClearConfirm(false);
    };

    const formatDuration = (seconds) => {
        if (!seconds) return '—';
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        if (mins > 0) {
            return `${mins}m ${secs}s`;
        }
        return `${secs}s`;
    };

    const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className="session-history">
            <header className="history-header">
                <button className="btn btn-ghost" onClick={onBack}>
                    ← Back
                </button>
                <h1>Session History</h1>
                {sessions.length > 0 && (
                    <button className="btn btn-danger" onClick={() => setShowClearConfirm(true)}>
                        Clear All
                    </button>
                )}
            </header>

            {sessions.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-icon">📊</div>
                    <h2>No sessions yet</h2>
                    <p>Complete a drilling session to see it here!</p>
                </div>
            ) : (
                <div className="sessions-list">
                    {sessions.map((session, index) => (
                        <div key={index} className="session-item">
                            <div className="session-info">
                                <h3 className="session-name">{session.name}</h3>
                                <p className="session-deck">Deck: {session.deckName}</p>
                                <p className="session-date">{formatDate(session.endTime)}</p>
                            </div>

                            <div className="session-stats-grid">
                                <div className="stat">
                                    <span className="stat-label">Reviewed</span>
                                    <span className="stat-value">{session.stats.cardsReviewed}</span>
                                </div>
                                <div className="stat">
                                    <span className="stat-label">Correct</span>
                                    <span className="stat-value correct">{session.stats.correctCount}</span>
                                </div>
                                <div className="stat">
                                    <span className="stat-label">Missed</span>
                                    <span className="stat-value missed">{session.stats.missedCount}</span>
                                </div>
                                <div className="stat">
                                    <span className="stat-label">Duration</span>
                                    <span className="stat-value">{formatDuration(session.stats.duration)}</span>
                                </div>
                            </div>

                            <div className="session-deck-counts">
                                <span>Main: {session.stats.mainDeckRemaining || 0}</span>
                                <span>Side 1: {session.stats.sideDeck1Count || 0}</span>
                                <span>Side 2: {session.stats.sideDeck2Count || 0}</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {showClearConfirm && (
                <div className="modal-overlay" onClick={() => setShowClearConfirm(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <h2>Clear All History?</h2>
                        <p className="modal-description">
                            This will permanently delete all session history. This cannot be undone.
                        </p>
                        <div className="modal-actions">
                            <button className="btn btn-secondary" onClick={() => setShowClearConfirm(false)}>
                                Cancel
                            </button>
                            <button className="btn btn-danger" onClick={handleClear}>
                                Clear All
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
