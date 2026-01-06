import './DeckCard.css';

export default function DeckCard({ deck, onEdit, onDrill, onDuplicate, onDelete }) {
    const cardCount = deck.cards?.length || 0;
    const modified = new Date(deck.modified).toLocaleDateString();

    return (
        <div className="deck-card">
            <div className="deck-card-header">
                <h3 className="deck-name">{deck.name}</h3>
                <span className="deck-card-count">{cardCount} cards</span>
            </div>

            <p className="deck-modified">Modified {modified}</p>

            <div className="deck-card-actions">
                <button
                    className="btn btn-primary deck-drill-btn"
                    onClick={() => onDrill(deck)}
                    disabled={cardCount === 0}
                >
                    Start Drilling
                </button>

                <div className="deck-secondary-actions">
                    <button
                        className="btn btn-icon"
                        onClick={() => onEdit(deck)}
                        aria-label="Edit deck"
                        title="Edit deck"
                    >
                        {/* Edit Icon (Quill) */}
                        <svg viewBox="0 0 24 24" style={{ width: '20px', height: '20px', minWidth: '20px' }} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 20h9" />
                            <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                        </svg>
                    </button>
                    <button
                        className="btn btn-icon btn-icon-duplicate"
                        onClick={() => onDuplicate(deck)}
                        aria-label="Duplicate deck"
                        title="Duplicate deck"
                    >
                        {/* Duplicate Icon (Copy) */}
                        <svg viewBox="0 0 24 24" style={{ width: '20px', height: '20px', minWidth: '20px' }} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                        </svg>
                    </button>
                    <button
                        className="btn btn-icon btn-icon-danger"
                        onClick={() => onDelete(deck)}
                        aria-label="Delete deck"
                        title="Delete deck"
                    >
                        {/* Delete Icon (Flame) */}
                        <svg viewBox="0 0 24 24" style={{ width: '20px', height: '20px', minWidth: '20px' }} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.1.2-2.2.6-3a2.68 2.68 0 0 1 2.9-6.5z" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
}
