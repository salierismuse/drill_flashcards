import { useState, useRef, useEffect } from 'react';
import DeckCard from './DeckCard';
import { getDecks, createDeck, deleteDeck, duplicateDeck, getSessions } from '../utils/storage';
import { parseCSV, parseJSON } from '../utils/importExport';
import './DeckList.css';

export default function DeckList({ onEditDeck, onDrill, onSettings, onHistory }) {
    const [decks, setDecks] = useState(() => getDecks());
    const [sessions, setSessions] = useState(() => getSessions().slice(0, 5));
    const [showNewDeck, setShowNewDeck] = useState(false);
    const [newDeckName, setNewDeckName] = useState('');
    const [showImport, setShowImport] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const fileInputRef = useRef(null);

    const refreshDecks = () => {
        setDecks(getDecks());
        setSessions(getSessions().slice(0, 5));
    };

    const handleCreateDeck = () => {
        if (!newDeckName.trim()) return;
        const deck = createDeck(newDeckName.trim());
        setNewDeckName('');
        setShowNewDeck(false);
        onEditDeck(deck);
    };

    const handleDuplicate = (deck) => {
        duplicateDeck(deck.id);
        refreshDecks();
    };

    const handleDeleteConfirm = () => {
        if (deleteConfirm) {
            deleteDeck(deleteConfirm.id);
            refreshDecks();
            setDeleteConfirm(null);
        }
    };

    const handleFileImport = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            const text = await file.text();
            let imported;

            if (file.name.endsWith('.json')) {
                imported = parseJSON(text);
            } else {
                imported = { name: file.name.replace(/\.[^/.]+$/, ''), cards: parseCSV(text) };
            }

            const deck = createDeck(imported.name || 'Imported Deck');
            deck.cards = imported.cards.map((c, i) => ({
                id: `card-${Date.now()}-${i}`,
                front: c.front,
                back: c.back,
                created: new Date().toISOString(),
            }));

            const { saveDeck } = await import('../utils/storage');
            saveDeck(deck);
            refreshDecks();
            setShowImport(false);
            onEditDeck(deck);
        } catch (err) {
            alert('Error importing file: ' + err.message);
        }

        e.target.value = '';
    };

    const formatDuration = (seconds) => {
        const mins = Math.floor(seconds / 60);
        return mins < 1 ? '<1 min' : `${mins} min`;
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
        if (diffDays === 0) return 'Today';
        if (diffDays === 1) return 'Yesterday';
        if (diffDays < 7) return `${diffDays} days ago`;
        return date.toLocaleDateString();
    };

    return (
        <div className="deck-list-page">
            <header className="page-header">
                <div className="brand">
                    <img src="scroll.png" alt="" className="brand-icon" />
                    <h1>Flashcard Driller</h1>
                </div>
                <div className="header-actions">
                    <button className="btn btn-ghost" onClick={onSettings}>
                        Settings
                    </button>
                </div>
            </header>

            {/* Decks Section */}
            <section className="section">
                <div className="section-header">
                    <h2>Your Decks</h2>
                    <div className="section-actions">
                        <button className="btn btn-secondary btn-sm" onClick={() => setShowImport(true)}>
                            Import
                        </button>
                        <button className="btn btn-primary btn-sm" onClick={() => setShowNewDeck(true)}>
                            + New Deck
                        </button>
                    </div>
                </div>

                {decks.length === 0 ? (
                    <div className="empty-state">
                        <img src="lotus.png" alt="" className="empty-icon" />
                        <h3>No decks yet</h3>
                        <p>Create your first deck to begin your learning journey.</p>
                        <button className="btn btn-primary" onClick={() => setShowNewDeck(true)}>
                            Create Deck
                        </button>
                    </div>
                ) : (
                    <div className="deck-grid">
                        {decks.map(deck => (
                            <DeckCard
                                key={deck.id}
                                deck={deck}
                                onEdit={onEditDeck}
                                onDrill={onDrill}
                                onDuplicate={handleDuplicate}
                                onDelete={(d) => setDeleteConfirm(d)}
                            />
                        ))}
                    </div>
                )}
            </section>

            {/* Recent Sessions Section */}
            <section className="section">
                <div className="section-header">
                    <h2>Recent Sessions</h2>
                    {sessions.length > 0 && (
                        <button className="btn btn-ghost btn-sm" onClick={onHistory}>
                            View All
                        </button>
                    )}
                </div>

                {sessions.length === 0 ? (
                    <div className="empty-state small">
                        <p>Your study sessions will appear here.</p>
                    </div>
                ) : (
                    <div className="deck-grid">
                        {sessions.map((session, i) => (
                            <div key={i} className="session-card">
                                <div className="session-card-header">
                                    <h3 className="session-name">{session.name}</h3>
                                    <span className="session-date">{formatDate(session.stats?.startTime)}</span>
                                </div>
                                <div className="session-deck-name">{session.deckName}</div>
                                <div className="session-card-stats">
                                    <div className="stat-item correct">
                                        <span className="stat-value">{session.stats?.correctCount || 0}</span>
                                        <span className="stat-label">Correct</span>
                                    </div>
                                    <div className="stat-item missed">
                                        <span className="stat-value">{session.stats?.missedCount || 0}</span>
                                        <span className="stat-label">Missed</span>
                                    </div>
                                    <div className="stat-item">
                                        <span className="stat-value">{formatDuration(session.stats?.duration || 0)}</span>
                                        <span className="stat-label">Duration</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            {/* New Deck Modal */}
            {showNewDeck && (
                <div className="modal-overlay" onClick={() => setShowNewDeck(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <h2>Create New Deck</h2>
                        <input
                            type="text"
                            value={newDeckName}
                            onChange={(e) => setNewDeckName(e.target.value)}
                            placeholder="Deck name..."
                            autoFocus
                            onKeyDown={(e) => e.key === 'Enter' && handleCreateDeck()}
                        />
                        <div className="modal-actions">
                            <button className="btn btn-secondary" onClick={() => setShowNewDeck(false)}>
                                Cancel
                            </button>
                            <button className="btn btn-primary" onClick={handleCreateDeck}>
                                Create
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Import Modal */}
            {showImport && (
                <div className="modal-overlay" onClick={() => setShowImport(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <h2>Import Deck</h2>
                        <p className="modal-description">
                            Import a deck from a CSV or JSON file.
                        </p>
                        <div className="import-formats">
                            <div className="format-info">
                                <strong>CSV:</strong> front,back (one card per line)
                            </div>
                            <div className="format-info">
                                <strong>JSON:</strong> {"{ name, cards: [{ front, back }] }"}
                            </div>
                        </div>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".csv,.json"
                            onChange={handleFileImport}
                            style={{ display: 'none' }}
                        />
                        <div className="modal-actions">
                            <button className="btn btn-secondary" onClick={() => setShowImport(false)}>
                                Cancel
                            </button>
                            <button className="btn btn-primary" onClick={() => fileInputRef.current?.click()}>
                                Choose File
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation */}
            {deleteConfirm && (
                <div className="modal-overlay" onClick={() => setDeleteConfirm(null)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <h2>Delete Deck?</h2>
                        <p className="modal-description">
                            Are you sure you want to delete "{deleteConfirm.name}"? This cannot be undone.
                        </p>
                        <div className="modal-actions">
                            <button className="btn btn-secondary" onClick={() => setDeleteConfirm(null)}>
                                Cancel
                            </button>
                            <button className="btn btn-danger" onClick={handleDeleteConfirm}>
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
