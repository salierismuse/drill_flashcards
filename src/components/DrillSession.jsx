import { useState, useEffect } from 'react';
import FlashCard from './FlashCard';
import SessionStats from './SessionStats';
import KeyboardHelp from './KeyboardHelp';
import { useSession } from '../hooks/useSession';
import { useKeyboard } from '../hooks/useKeyboard';
import './DrillSession.css';

export default function DrillSession({ deck, onEnd }) {
    const [showHelp, setShowHelp] = useState(false);
    const [statsMinimized, setStatsMinimized] = useState(false);
    const [showEndConfirm, setShowEndConfirm] = useState(false);
    const [sessionNameInput, setSessionNameInput] = useState('');
    const [hasStarted, setHasStarted] = useState(false);

    const session = useSession(deck);

    // Auto-save every 2 minutes
    useEffect(() => {
        if (!hasStarted) return;

        const autoSaveInterval = setInterval(() => {
            session.saveSession();
        }, 2 * 60 * 1000); // 2 minutes

        return () => clearInterval(autoSaveInterval);
    }, [hasStarted, session]);

    const handleEnd = () => {
        session.saveSession();
        onEnd();
    };

    const handleEndClick = () => {
        setShowEndConfirm(true);
    };

    // Determine which move actions are available based on current deck
    const getMoveActions = () => {
        if (session.activeDeck === 'main') {
            return [
                { label: '→ Side 1', key: '3', action: () => session.moveToSideDeck(1) },
                { label: '→ Side 2', key: '4', action: () => session.moveToSideDeck(2) },
            ];
        } else if (session.activeDeck === 'side1') {
            return [
                { label: '→ Main', key: '3', action: () => session.moveToMain() },
                { label: '→ Side 2', key: '4', action: () => session.moveToSideDeck(2) },
            ];
        } else {
            return [
                { label: '→ Main', key: '3', action: () => session.moveToMain() },
                { label: '→ Side 1', key: '4', action: () => session.moveToSideDeck(1) },
            ];
        }
    };

    const moveActions = getMoveActions();

    useKeyboard({
        onFlip: session.flipCard,
        onGotIt: session.isFlipped ? session.gotIt : null,
        onMissed: session.isFlipped ? session.missedIt : null,
        onMove1: session.isFlipped ? moveActions[0].action : null,
        onMove2: session.isFlipped ? moveActions[1].action : null,
        onSwitchSide1: () => session.sideDeck1.length > 0 && session.activeDeck !== 'side1' && session.switchDeck('side1'),
        onSwitchMain: () => session.mainDeck.length > 0 && session.activeDeck !== 'main' && session.switchDeck('main'),
        onSwitchSide2: () => session.sideDeck2.length > 0 && session.activeDeck !== 'side2' && session.switchDeck('side2'),
        onEnd: handleEndClick,
        onHelp: () => setShowHelp(prev => !prev),
    }, hasStarted && !showEndConfirm);

    // Session naming screen
    if (!hasStarted) {
        return (
            <div className="drill-session">
                <div className="session-start">
                    <h2>Start Drilling Session</h2>
                    <p className="deck-info">
                        <strong>{deck.name}</strong> — {deck.cards.length} cards
                    </p>

                    <div className="session-name-input">
                        <label htmlFor="session-name">Session Name (optional)</label>
                        <input
                            id="session-name"
                            type="text"
                            value={sessionNameInput}
                            onChange={(e) => setSessionNameInput(e.target.value)}
                            placeholder={`${deck.name} Session`}
                            autoFocus
                        />
                    </div>

                    <div className="session-start-actions">
                        <button className="btn btn-secondary" onClick={onEnd}>
                            Cancel
                        </button>
                        <button
                            className="btn btn-primary"
                            onClick={() => {
                                session.setSessionName(sessionNameInput);
                                setHasStarted(true);
                            }}
                        >
                            Start Session
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const activeDeckName = session.activeDeck === 'main' ? 'Main Deck'
        : session.activeDeck === 'side1' ? 'Side Deck 1' : 'Side Deck 2';

    const allEmpty = session.mainDeck.length === 0 && session.sideDeck1.length === 0 && session.sideDeck2.length === 0;

    return (
        <div className="drill-session">
            <header className="drill-header">
                <div className="drill-title">
                    <h1>{deck.name}</h1>
                    <span className="active-deck-badge">{activeDeckName}</span>
                </div>
                <button
                    className="help-btn"
                    onClick={() => setShowHelp(true)}
                    aria-label="Keyboard shortcuts"
                >
                    ?
                </button>
            </header>

            <SessionStats
                stats={session.stats}
                mainCount={session.mainDeck.length}
                side1Count={session.sideDeck1.length}
                side2Count={session.sideDeck2.length}
                minimized={statsMinimized}
                onToggle={() => setStatsMinimized(prev => !prev)}
            />

            {/* Three-deck layout */}
            <div className="drill-layout">
                {/* Side Deck 1 mini display */}
                <div
                    className={`mini-deck side1 ${session.activeDeck === 'side1' ? 'active' : ''}`}
                    onClick={() => session.sideDeck1.length > 0 && session.switchDeck('side1')}
                >
                    <div className="mini-deck-label">Side 1</div>
                    <div className="mini-deck-count">{session.sideDeck1.length}</div>
                    {session.sideDeck1.length > 0 && (
                        <div className="mini-deck-preview">
                            {session.sideDeck1.slice(0, 3).map((_, i) => (
                                <div key={i} className="mini-card" style={{ top: i * 4 }}></div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Main card area */}
                <div className="drill-card-area">
                    {allEmpty ? (
                        <div className="all-done">
                            <h2>🎉 All cards reviewed!</h2>
                            <p>You've gone through all cards in every deck.</p>
                            <button className="btn btn-primary" onClick={handleEnd}>
                                End Session
                            </button>
                        </div>
                    ) : (
                        <FlashCard
                            card={session.currentCard}
                            isFlipped={session.isFlipped}
                            onFlip={session.flipCard}
                        />
                    )}
                </div>

                {/* Side Deck 2 mini display */}
                <div
                    className={`mini-deck side2 ${session.activeDeck === 'side2' ? 'active' : ''}`}
                    onClick={() => session.sideDeck2.length > 0 && session.switchDeck('side2')}
                >
                    <div className="mini-deck-label">Side 2</div>
                    <div className="mini-deck-count">{session.sideDeck2.length}</div>
                    {session.sideDeck2.length > 0 && (
                        <div className="mini-deck-preview">
                            {session.sideDeck2.slice(0, 3).map((_, i) => (
                                <div key={i} className="mini-card" style={{ top: i * 4 }}></div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {session.currentCard && (
                <div className="drill-actions">
                    <div className="action-row main-actions">
                        <button
                            className="btn action-btn got-it"
                            onClick={session.gotIt}
                            disabled={!session.isFlipped}
                        >
                            <span className="action-label">Got It</span>
                            <kbd>1</kbd>
                        </button>
                        <button
                            className="btn action-btn missed"
                            onClick={session.missedIt}
                            disabled={!session.isFlipped}
                        >
                            <span className="action-label">Missed</span>
                            <kbd>2</kbd>
                        </button>
                    </div>

                    <div className="action-row side-actions">
                        <button
                            className="btn action-btn side"
                            onClick={moveActions[0].action}
                            disabled={!session.isFlipped}
                        >
                            <span className="action-label">{moveActions[0].label}</span>
                            <kbd>{moveActions[0].key}</kbd>
                        </button>
                        <button
                            className="btn action-btn side"
                            onClick={moveActions[1].action}
                            disabled={!session.isFlipped}
                        >
                            <span className="action-label">{moveActions[1].label}</span>
                            <kbd>{moveActions[1].key}</kbd>
                        </button>
                    </div>
                </div>
            )}

            <div className="drill-footer">
                <div className="deck-switcher">
                    <span className="switcher-label">Switch to:</span>
                    <button
                        className={`deck-switch-btn ${session.activeDeck === 'side1' ? 'active' : ''}`}
                        onClick={() => session.switchDeck('side1')}
                        disabled={session.sideDeck1.length === 0}
                    >
                        Side 1 ({session.sideDeck1.length})
                    </button>
                    <button
                        className={`deck-switch-btn ${session.activeDeck === 'main' ? 'active' : ''}`}
                        onClick={() => session.switchDeck('main')}
                        disabled={session.mainDeck.length === 0}
                    >
                        Main ({session.mainDeck.length})
                    </button>
                    <button
                        className={`deck-switch-btn ${session.activeDeck === 'side2' ? 'active' : ''}`}
                        onClick={() => session.switchDeck('side2')}
                        disabled={session.sideDeck2.length === 0}
                    >
                        Side 2 ({session.sideDeck2.length})
                    </button>
                </div>

                <button className="btn btn-danger" onClick={handleEndClick}>
                    End Session
                </button>
            </div>

            {showHelp && <KeyboardHelp onClose={() => setShowHelp(false)} />}

            {showEndConfirm && (
                <div className="confirm-overlay" onClick={() => setShowEndConfirm(false)}>
                    <div className="confirm-dialog" onClick={e => e.stopPropagation()}>
                        <h3>End Session?</h3>
                        <p>Your progress will be saved to session history.</p>
                        <div className="confirm-actions">
                            <button className="btn btn-secondary" onClick={() => setShowEndConfirm(false)}>
                                Continue Drilling
                            </button>
                            <button className="btn btn-danger" onClick={handleEnd}>
                                End Session
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
