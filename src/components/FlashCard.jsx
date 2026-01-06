import { useState } from 'react';
import { renderMarkdown } from '../utils/markdown';
import './FlashCard.css';

export default function FlashCard({ card, isFlipped, onFlip }) {
    const [isAnimating, setIsAnimating] = useState(false);

    const handleFlip = () => {
        if (isAnimating) return;
        setIsAnimating(true);
        onFlip();
        setTimeout(() => setIsAnimating(false), 300);
    };

    if (!card) {
        return (
            <div className="flashcard-container">
                <div className="flashcard empty">
                    <div className="flashcard-content">
                        <p className="empty-message">No cards in this deck</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flashcard-container" onClick={handleFlip}>
            <div className={`flashcard ${isFlipped ? 'flipped' : ''}`}>
                <div className="flashcard-face flashcard-front">
                    <div
                        className="flashcard-content"
                        dangerouslySetInnerHTML={{ __html: renderMarkdown(card.front) }}
                    />
                    <p className="flip-hint">Click or press Space to flip</p>
                </div>
                <div className="flashcard-face flashcard-back">
                    <div
                        className="flashcard-content"
                        dangerouslySetInnerHTML={{ __html: renderMarkdown(card.back) }}
                    />
                    <p className="flip-hint">Click or press Space to flip back</p>
                </div>
            </div>
        </div>
    );
}
