import { useState, useCallback } from 'react';
import { getSettings, saveSession as persistSession } from '../utils/storage';

export function useSession(initialDeck) {
    const settings = getSettings();

    const [sessionState, setSessionState] = useState(() => createInitialState(initialDeck));

    function createInitialState(deck) {
        return {
            mainDeck: [...(deck?.cards || [])],
            sideDeck1: [],
            sideDeck2: [],
            currentCard: deck?.cards?.[0] || null,
            currentIndex: 0,
            activeDeck: 'main',
            isFlipped: false,
            sessionName: '',
            deckName: deck?.name || '',
            deckId: deck?.id || '',
            stats: {
                cardsReviewed: 0,
                correctCount: 0,
                missedCount: 0,
                startTime: new Date().toISOString(),
            },
        };
    }

    const flipCard = useCallback(() => {
        setSessionState(prev => ({
            ...prev,
            isFlipped: !prev.isFlipped,
        }));
    }, []);

    const getActiveCards = useCallback((state) => {
        switch (state.activeDeck) {
            case 'side1': return state.sideDeck1;
            case 'side2': return state.sideDeck2;
            default: return state.mainDeck;
        }
    }, []);

    const setActiveCards = useCallback((state, cards) => {
        switch (state.activeDeck) {
            case 'side1': return { ...state, sideDeck1: cards };
            case 'side2': return { ...state, sideDeck2: cards };
            default: return { ...state, mainDeck: cards };
        }
    }, []);

    const moveToNextCard = useCallback((state) => {
        const cards = getActiveCards(state);
        if (cards.length === 0) {
            return { ...state, currentCard: null, currentIndex: 0, isFlipped: false };
        }
        const nextIndex = state.currentIndex >= cards.length ? 0 : state.currentIndex;
        return {
            ...state,
            currentCard: cards[nextIndex] || cards[0],
            currentIndex: nextIndex,
            isFlipped: false,
        };
    }, [getActiveCards]);

    const gotIt = useCallback(() => {
        setSessionState(prev => {
            const cards = getActiveCards(prev);
            if (cards.length === 0 || !prev.currentCard) return prev;

            // Remove current card and add to back
            const currentId = prev.currentCard.id;
            const filtered = cards.filter(c => c.id !== currentId);
            const newCards = [...filtered, prev.currentCard];

            let newState = setActiveCards(prev, newCards);
            newState = {
                ...newState,
                stats: {
                    ...newState.stats,
                    cardsReviewed: newState.stats.cardsReviewed + 1,
                    correctCount: newState.stats.correctCount + 1,
                },
            };

            return moveToNextCard(newState);
        });
    }, [getActiveCards, setActiveCards, moveToNextCard]);

    const missedIt = useCallback(() => {
        const reentryInterval = settings.reentryInterval || 3;

        setSessionState(prev => {
            const cards = getActiveCards(prev);
            if (cards.length === 0 || !prev.currentCard) return prev;

            // Remove current card
            const currentId = prev.currentCard.id;
            const filtered = cards.filter(c => c.id !== currentId);

            // Insert card after N cards (or at end if deck is small)
            const insertPos = Math.min(reentryInterval, filtered.length);
            const newCards = [
                ...filtered.slice(0, insertPos),
                prev.currentCard,
                ...filtered.slice(insertPos),
            ];

            let newState = setActiveCards(prev, newCards);
            newState = {
                ...newState,
                stats: {
                    ...newState.stats,
                    cardsReviewed: newState.stats.cardsReviewed + 1,
                    missedCount: newState.stats.missedCount + 1,
                },
            };

            return moveToNextCard(newState);
        });
    }, [settings.reentryInterval, getActiveCards, setActiveCards, moveToNextCard]);

    const moveToSideDeck = useCallback((deckNum) => {
        setSessionState(prev => {
            if (!prev.currentCard) return prev;

            const cards = getActiveCards(prev);
            const currentId = prev.currentCard.id;
            const filtered = cards.filter(c => c.id !== currentId);

            let newState = setActiveCards(prev, filtered);

            // Add to appropriate side deck
            if (deckNum === 1) {
                newState = { ...newState, sideDeck1: [...newState.sideDeck1, prev.currentCard] };
            } else {
                newState = { ...newState, sideDeck2: [...newState.sideDeck2, prev.currentCard] };
            }

            return moveToNextCard(newState);
        });
    }, [getActiveCards, setActiveCards, moveToNextCard]);

    const switchDeck = useCallback((deck) => {
        setSessionState(prev => {
            const newState = { ...prev, activeDeck: deck, currentIndex: 0, isFlipped: false };
            const cards = getActiveCards(newState);
            return {
                ...newState,
                currentCard: cards[0] || null,
            };
        });
    }, [getActiveCards]);

    const setSessionName = useCallback((name) => {
        setSessionState(prev => ({ ...prev, sessionName: name }));
    }, []);

    const saveSession = useCallback(() => {
        const endTime = new Date();
        const startTime = new Date(sessionState.stats.startTime);
        const duration = Math.floor((endTime - startTime) / 1000);

        persistSession({
            name: sessionState.sessionName || `${sessionState.deckName} Session`,
            deckName: sessionState.deckName,
            deckId: sessionState.deckId,
            stats: {
                ...sessionState.stats,
                duration,
                mainDeckRemaining: sessionState.mainDeck.length,
                sideDeck1Count: sessionState.sideDeck1.length,
                sideDeck2Count: sessionState.sideDeck2.length,
            },
        });
    }, [sessionState]);

    const resetSession = useCallback((deck) => {
        setSessionState(createInitialState(deck));
    }, []);

    const moveToMain = useCallback(() => {
        setSessionState(prev => {
            if (!prev.currentCard) return prev;

            const cards = getActiveCards(prev);
            const currentId = prev.currentCard.id;
            const filtered = cards.filter(c => c.id !== currentId);

            let newState = setActiveCards(prev, filtered);

            // Add to main deck
            newState = { ...newState, mainDeck: [...newState.mainDeck, prev.currentCard] };

            return moveToNextCard(newState);
        });
    }, [getActiveCards, setActiveCards, moveToNextCard]);

    return {
        ...sessionState,
        flipCard,
        gotIt,
        missedIt,
        moveToSideDeck,
        moveToMain,
        switchDeck,
        setSessionName,
        saveSession,
        resetSession,
    };
}
