import { useState, useRef } from 'react';
import { saveDeck, createCard } from '../utils/storage';
import { parseCSV, parseBulkText, exportToCSV, exportToJSON, downloadFile } from '../utils/importExport';
import { renderMarkdown } from '../utils/markdown';
import ImageCropper from './ImageCropper';
import './DeckEditor.css';

export default function DeckEditor({ deck, onBack, onDrill }) {
    const [editedDeck, setEditedDeck] = useState({ ...deck });
    const [editingCard, setEditingCard] = useState(null);
    const [newCardFront, setNewCardFront] = useState('');
    const [newCardBack, setNewCardBack] = useState('');

    // Cropper state
    const [cropImage, setCropImage] = useState(null);
    const [pendingCropResolve, setPendingCropResolve] = useState(null);

    const [showBulkImport, setShowBulkImport] = useState(false);
    const [bulkText, setBulkText] = useState('');
    const [bulkDelimiter, setBulkDelimiter] = useState('|');
    const [showExport, setShowExport] = useState(false);
    const fileInputRef = useRef(null);
    const frontInputRef = useRef(null);

    const handleSave = () => {
        saveDeck(editedDeck);
    };

    const handleNameChange = (name) => {
        const updated = { ...editedDeck, name };
        setEditedDeck(updated);
        saveDeck(updated);
    };

    const handleAddCard = () => {
        if (!newCardFront.trim() || !newCardBack.trim()) return;

        // Check for duplicates
        const isDuplicate = editedDeck.cards.some(
            c => c.front.trim().toLowerCase() === newCardFront.trim().toLowerCase()
        );

        if (isDuplicate) {
            if (!confirm('A card with this front already exists. Add anyway?')) {
                return;
            }
        }

        const card = createCard(newCardFront.trim(), newCardBack.trim());
        const updated = {
            ...editedDeck,
            cards: [...editedDeck.cards, card],
        };
        setEditedDeck(updated);
        saveDeck(updated);
        setNewCardFront('');
        setNewCardBack('');

        // Focus back on front input
        setTimeout(() => frontInputRef.current?.focus(), 0);
    };

    const handleKeyDown = (e, setValue, value, onEnter) => {
        // Shift+Enter to submit
        if (e.shiftKey && e.key === 'Enter' && onEnter) {
            e.preventDefault();
            onEnter();
            return;
        }

        // Formatting shortcuts
        if (e.ctrlKey) {
            let wrapper = '';
            if (e.key === 's') wrapper = '~'; // Subscript
            if (e.key === 'd') wrapper = '^'; // Superscript

            if (wrapper) {
                e.preventDefault();
                const start = e.target.selectionStart;
                const end = e.target.selectionEnd;
                const textBefore = value.substring(0, start);
                const selected = value.substring(start, end);
                const textAfter = value.substring(end);

                const newValue = `${textBefore}${wrapper}${selected}${wrapper}${textAfter}`;
                setValue(newValue);

                // Restore cursor/selection after render
                requestAnimationFrame(() => {
                    e.target.selectionStart = start + 1;
                    e.target.selectionEnd = end + 1;
                });
            }
        }
    };

    const handlePaste = async (e, setFunction, currentVal) => {
        const items = e.clipboardData?.items;
        if (!items) return;

        for (const item of items) {
            if (item.type.indexOf('image') !== -1) {
                e.preventDefault();
                const blob = item.getAsFile();
                if (!blob) continue;

                const reader = new FileReader();
                reader.onload = (event) => {
                    const base64 = event.target.result;
                    setCropImage(base64);

                    // Create a promise that resolves when the user confirms/skips crop
                    new Promise((resolve) => {
                        setPendingCropResolve(() => resolve);
                    }).then((finalImage) => {
                        const cursorPosition = e.target.selectionStart;
                        const textBefore = currentVal.substring(0, cursorPosition);
                        const textAfter = currentVal.substring(e.target.selectionEnd);
                        const newText = `${textBefore}\n![image](${finalImage})\n${textAfter}`;
                        setFunction(newText);

                        // Cleanup
                        setCropImage(null);
                        setPendingCropResolve(null);
                    });
                };
                reader.readAsDataURL(blob);
                return; // Stop after first image
            }
        }
    };

    const handleCropConfirm = (finalImage) => {
        if (pendingCropResolve) {
            pendingCropResolve(finalImage);
        }
    };

    const handleCropCancel = () => {
        setCropImage(null);
        setPendingCropResolve(null);
    };

    const handleUpdateCard = (cardId, front, back) => {
        const updated = {
            ...editedDeck,
            cards: editedDeck.cards.map(c =>
                c.id === cardId ? { ...c, front, back } : c
            ),
        };
        setEditedDeck(updated);
        saveDeck(updated);
        setEditingCard(null);
    };

    const handleDeleteCard = (cardId) => {
        const updated = {
            ...editedDeck,
            cards: editedDeck.cards.filter(c => c.id !== cardId),
        };
        setEditedDeck(updated);
        saveDeck(updated);
    };

    const handleFlipAndCopy = (card) => {
        const flippedFront = card.back;
        const flippedBack = card.front;

        // Check duplicates for this specific action? 
        // User asked for "create and add another card", implies manual intent.
        // We'll trust the user here or show a mild prompt if they really want to.
        // Actually, let's just do it directly as requested for speed.

        const newCard = createCard(flippedFront, flippedBack);
        const updated = {
            ...editedDeck,
            cards: [...editedDeck.cards, newCard],
        };
        setEditedDeck(updated);
        saveDeck(updated);
    };

    const handleBulkImport = () => {
        if (!bulkText.trim()) return;

        const parsed = parseBulkText(bulkText, bulkDelimiter);

        let addedCount = 0;
        let skippedCount = 0;

        const newCards = parsed.filter(c => {
            const isDuplicate = editedDeck.cards.some(
                existing => existing.front.trim().toLowerCase() === c.front.trim().toLowerCase()
            );
            if (isDuplicate) {
                skippedCount++;
                return false;
            }
            addedCount++;
            return true;
        }).map((c, i) => ({
            id: `card-${Date.now()}-${i}`,
            front: c.front,
            back: c.back,
            created: new Date().toISOString(),
        }));

        if (skippedCount > 0) {
            alert(`Skipped ${skippedCount} duplicate card(s). Added ${addedCount} new card(s).`);
        }

        const updated = {
            ...editedDeck,
            cards: [...editedDeck.cards, ...newCards],
        };
        setEditedDeck(updated);
        saveDeck(updated);
        setBulkText('');
        setShowBulkImport(false);
    };

    const handleFileImport = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            const text = await file.text();
            const parsed = parseCSV(text);

            let addedCount = 0;
            let skippedCount = 0;

            const newCards = parsed.filter(c => {
                const isDuplicate = editedDeck.cards.some(
                    existing => existing.front.trim().toLowerCase() === c.front.trim().toLowerCase()
                );
                if (isDuplicate) {
                    skippedCount++;
                    return false;
                }
                addedCount++;
                return true;
            }).map((c, i) => ({
                id: `card-${Date.now()}-${i}`,
                front: c.front,
                back: c.back,
                created: new Date().toISOString(),
            }));

            if (skippedCount > 0) {
                alert(`Skipped ${skippedCount} duplicate card(s) from CSV. Added ${addedCount} new card(s).`);
            }

            const updated = {
                ...editedDeck,
                cards: [...editedDeck.cards, ...newCards],
            };
            setEditedDeck(updated);
            saveDeck(updated);
        } catch (err) {
            alert('Error importing file: ' + err.message);
        }

        e.target.value = '';
    };

    const handleExport = (format) => {
        const filename = editedDeck.name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
        if (format === 'csv') {
            downloadFile(exportToCSV(editedDeck), `${filename}.csv`, 'text/csv');
        } else {
            downloadFile(exportToJSON(editedDeck), `${filename}.json`, 'application/json');
        }
        setShowExport(false);
    };

    return (
        <div className="deck-editor">
            <header className="editor-header">
                <button className="btn btn-ghost back-btn" onClick={onBack}>
                    ← Back
                </button>
                <input
                    type="text"
                    className="deck-name-input"
                    value={editedDeck.name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    placeholder="Deck name..."
                />
                <button
                    className="btn btn-primary"
                    onClick={() => onDrill(editedDeck)}
                    disabled={editedDeck.cards.length === 0}
                >
                    Start Drilling
                </button>
            </header>

            <div className="editor-actions">
                <button className="btn btn-secondary" onClick={() => setShowBulkImport(true)}>
                    📝 Bulk Add
                </button>
                <button className="btn btn-secondary" onClick={() => fileInputRef.current?.click()}>
                    📁 Import CSV
                </button>
                <button className="btn btn-secondary" onClick={() => setShowExport(true)}>
                    📤 Export
                </button>
                <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv"
                    onChange={handleFileImport}
                    style={{ display: 'none' }}
                />
            </div>

            <div className="add-card-form">
                <h3>Add New Card <span className="shortcut-hint">Shift+Enter to submit</span></h3>
                <p className="formatting-hint">Supports: **bold**, *italic*, ^sup^ (Ctrl+D), ~sub~ (Ctrl+S)</p>
                <div className="card-inputs">
                    <div className="input-group">
                        <label>Front (Question)</label>
                        <textarea
                            ref={frontInputRef}
                            value={newCardFront}
                            onChange={(e) => setNewCardFront(e.target.value)}
                            onKeyDown={(e) => handleKeyDown(e, setNewCardFront, newCardFront, handleAddCard)}
                            onPaste={(e) => handlePaste(e, setNewCardFront, newCardFront)}
                            placeholder="Enter question or prompt..."
                            rows={3}
                        />
                    </div>
                    <div className="input-group">
                        <label>Back (Answer)</label>
                        <textarea
                            value={newCardBack}
                            onChange={(e) => setNewCardBack(e.target.value)}
                            onKeyDown={(e) => handleKeyDown(e, setNewCardBack, newCardBack, handleAddCard)}
                            onPaste={(e) => handlePaste(e, setNewCardBack, newCardBack)}
                            placeholder="Enter answer..."
                            rows={3}
                        />
                    </div>
                </div>
                <button
                    className="btn btn-primary add-card-btn"
                    onClick={handleAddCard}
                    disabled={!newCardFront.trim() || !newCardBack.trim()}
                >
                    Add Card
                </button>
            </div>

            <div className="cards-list">
                <h3>Cards ({editedDeck.cards.length})</h3>

                {editedDeck.cards.length === 0 ? (
                    <p className="no-cards">No cards yet. Add some cards above!</p>
                ) : (
                    <div className="cards-grid">
                        {editedDeck.cards.map((card, index) => (
                            <div key={card.id} className="card-item">
                                {editingCard === card.id ? (
                                    <CardEditForm
                                        card={card}
                                        onSave={(front, back) => handleUpdateCard(card.id, front, back)}
                                        onCancel={() => setEditingCard(null)}
                                        handlePaste={handlePaste}
                                        handleKeyDown={handleKeyDown}
                                    />
                                ) : (
                                    <>
                                        <div className="card-number">#{index + 1}</div>
                                        <div className="card-preview">
                                            <div className="card-side">
                                                <span className="side-label">Front:</span>
                                                <div
                                                    className="card-text"
                                                    dangerouslySetInnerHTML={{ __html: renderMarkdown(card.front) }}
                                                />
                                            </div>
                                            <div className="card-side">
                                                <span className="side-label">Back:</span>
                                                <div
                                                    className="card-text"
                                                    dangerouslySetInnerHTML={{ __html: renderMarkdown(card.back) }}
                                                />
                                            </div>
                                        </div>
                                        <div className="card-actions">
                                            <button
                                                className="btn btn-icon"
                                                onClick={() => setEditingCard(card.id)}
                                                aria-label="Edit card"
                                                title="Edit Card"
                                            >
                                                ✏️
                                            </button>
                                            <button
                                                className="btn btn-icon"
                                                onClick={() => handleFlipAndCopy(card)}
                                                aria-label="Flip and Copy"
                                                title="Create Flipped Copy (Front ↔ Back)"
                                            >
                                                🔄
                                            </button>
                                            <button
                                                className="btn btn-icon btn-icon-danger"
                                                onClick={() => handleDeleteCard(card.id)}
                                                aria-label="Delete card"
                                                title="Delete Card"
                                            >
                                                🗑️
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Bulk Import Modal */}
            {showBulkImport && (
                <div className="modal-overlay" onClick={() => setShowBulkImport(false)}>
                    <div className="modal modal-lg" onClick={e => e.stopPropagation()}>
                        <h2>Bulk Add Cards</h2>
                        <p className="modal-description">
                            Enter one card per line, with front and back separated by the delimiter.
                        </p>
                        <div className="delimiter-input">
                            <label>Delimiter:</label>
                            <input
                                type="text"
                                value={bulkDelimiter}
                                onChange={(e) => setBulkDelimiter(e.target.value || '|')}
                                maxLength={5}
                            />
                        </div>
                        <textarea
                            className="bulk-textarea"
                            value={bulkText}
                            onChange={(e) => setBulkText(e.target.value)}
                            placeholder={`Example:\nWhat is 2+2?${bulkDelimiter}4\nCapital of France?${bulkDelimiter}Paris`}
                            rows={10}
                        />
                        <div className="modal-actions">
                            <button className="btn btn-secondary" onClick={() => setShowBulkImport(false)}>
                                Cancel
                            </button>
                            <button className="btn btn-primary" onClick={handleBulkImport}>
                                Add Cards
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Export Modal */}
            {showExport && (
                <div className="modal-overlay" onClick={() => setShowExport(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <h2>Export Deck</h2>
                        <p className="modal-description">
                            Choose a format to export "{editedDeck.name}".
                        </p>
                        <div className="export-options">
                            <button className="btn btn-secondary export-option" onClick={() => handleExport('csv')}>
                                📄 Export as CSV
                            </button>
                            <button className="btn btn-secondary export-option" onClick={() => handleExport('json')}>
                                📋 Export as JSON
                            </button>
                        </div>
                        <div className="modal-actions">
                            <button className="btn btn-secondary" onClick={() => setShowExport(false)}>
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Image Cropper Modal */}
            {cropImage && (
                <ImageCropper
                    imageSrc={cropImage}
                    onConfirm={handleCropConfirm}
                    onCancel={handleCropCancel}
                />
            )}
        </div>
    );
}

function CardEditForm({ card, onSave, onCancel, handlePaste, handleKeyDown }) {
    const [front, setFront] = useState(card.front);
    const [back, setBack] = useState(card.back);

    return (
        <div className="card-edit-form">
            <div className="input-group">
                <label>Front</label>
                <textarea
                    value={front}
                    onChange={(e) => setFront(e.target.value)}
                    onKeyDown={(e) => handleKeyDown(e, setFront, front)}
                    onPaste={(e) => handlePaste(e, setFront, front)}
                    rows={2}
                    autoFocus
                />
            </div>
            <div className="input-group">
                <label>Back</label>
                <textarea
                    value={back}
                    onChange={(e) => setBack(e.target.value)}
                    onKeyDown={(e) => handleKeyDown(e, setBack, back)}
                    onPaste={(e) => handlePaste(e, setBack, back)}
                    rows={2}
                />
            </div>
            <div className="edit-actions">
                <button className="btn btn-secondary" onClick={onCancel}>
                    Cancel
                </button>
                <button
                    className="btn btn-primary"
                    onClick={() => onSave(front, back)}
                    disabled={!front.trim() || !back.trim()}
                >
                    Save
                </button>
            </div>
        </div>
    );
}
