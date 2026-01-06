import './SessionStats.css';

export default function SessionStats({ stats, mainCount, side1Count, side2Count, minimized, onToggle }) {
    const elapsed = getElapsedTime(stats.startTime);
    const accuracy = stats.cardsReviewed > 0
        ? Math.round((stats.correctCount / stats.cardsReviewed) * 100)
        : 0;

    if (minimized) {
        return (
            <button className="stats-minimized" onClick={onToggle} aria-label="Show session stats">
                <span className="stats-mini-item">{stats.cardsReviewed} reviewed</span>
                <span className="stats-mini-divider">•</span>
                <span className="stats-mini-item">{elapsed}</span>
            </button>
        );
    }

    return (
        <div className="session-stats">
            <button className="stats-toggle" onClick={onToggle} aria-label="Minimize stats">
                −
            </button>

            <div className="stats-grid">
                <div className="stat-item">
                    <span className="stat-label">Reviewed</span>
                    <span className="stat-value">{stats.cardsReviewed}</span>
                </div>
                <div className="stat-item">
                    <span className="stat-label">Correct</span>
                    <span className="stat-value correct">{stats.correctCount}</span>
                </div>
                <div className="stat-item">
                    <span className="stat-label">Missed</span>
                    <span className="stat-value missed">{stats.missedCount}</span>
                </div>
                <div className="stat-item">
                    <span className="stat-label">Accuracy</span>
                    <span className="stat-value">{accuracy}%</span>
                </div>
                <div className="stat-item">
                    <span className="stat-label">Time</span>
                    <span className="stat-value">{elapsed}</span>
                </div>
            </div>

            <div className="deck-counts">
                <span className={`deck-count ${mainCount === 0 ? 'empty' : ''}`}>
                    Main: {mainCount}
                </span>
                <span className={`deck-count ${side1Count === 0 ? 'empty' : ''}`}>
                    Side 1: {side1Count}
                </span>
                <span className={`deck-count ${side2Count === 0 ? 'empty' : ''}`}>
                    Side 2: {side2Count}
                </span>
            </div>
        </div>
    );
}

function getElapsedTime(startTime) {
    const start = new Date(startTime);
    const now = new Date();
    const seconds = Math.floor((now - start) / 1000);

    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
        return `${hours}h ${minutes}m`;
    } else if (minutes > 0) {
        return `${minutes}m ${secs}s`;
    } else {
        return `${secs}s`;
    }
}
