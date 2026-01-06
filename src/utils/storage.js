import { v4 as uuidv4 } from 'uuid';

const DECKS_KEY = 'flashcard-driller-decks';
const SESSIONS_KEY = 'flashcard-driller-sessions';
const SETTINGS_KEY = 'flashcard-driller-settings';

// Default settings
const defaultSettings = {
  reentryInterval: 3,
  darkMode: true,
};

// Deck operations
export function getDecks() {
  const data = localStorage.getItem(DECKS_KEY);
  return data ? JSON.parse(data) : [];
}

export function getDeck(id) {
  const decks = getDecks();
  return decks.find(d => d.id === id) || null;
}

export function saveDeck(deck) {
  const decks = getDecks();
  const index = decks.findIndex(d => d.id === deck.id);
  
  const now = new Date().toISOString();
  const updatedDeck = {
    ...deck,
    modified: now,
    created: deck.created || now,
  };
  
  if (index >= 0) {
    decks[index] = updatedDeck;
  } else {
    decks.push(updatedDeck);
  }
  
  localStorage.setItem(DECKS_KEY, JSON.stringify(decks));
  return updatedDeck;
}

export function deleteDeck(id) {
  const decks = getDecks().filter(d => d.id !== id);
  localStorage.setItem(DECKS_KEY, JSON.stringify(decks));
}

export function duplicateDeck(id) {
  const deck = getDeck(id);
  if (!deck) return null;
  
  const newDeck = {
    ...deck,
    id: uuidv4(),
    name: `${deck.name} (Copy)`,
    created: new Date().toISOString(),
    modified: new Date().toISOString(),
    cards: deck.cards.map(card => ({
      ...card,
      id: uuidv4(),
    })),
  };
  
  return saveDeck(newDeck);
}

export function createDeck(name) {
  return saveDeck({
    id: uuidv4(),
    name,
    cards: [],
  });
}

export function createCard(front, back) {
  return {
    id: uuidv4(),
    front,
    back,
    created: new Date().toISOString(),
  };
}

// Session operations
export function getSessions() {
  const data = localStorage.getItem(SESSIONS_KEY);
  return data ? JSON.parse(data) : [];
}

export function saveSession(session) {
  const sessions = getSessions();
  sessions.unshift({
    ...session,
    endTime: new Date().toISOString(),
  });
  // Keep last 50 sessions
  const trimmed = sessions.slice(0, 50);
  localStorage.setItem(SESSIONS_KEY, JSON.stringify(trimmed));
}

export function clearSessions() {
  localStorage.setItem(SESSIONS_KEY, JSON.stringify([]));
}

// Settings operations
export function getSettings() {
  const data = localStorage.getItem(SETTINGS_KEY);
  return data ? { ...defaultSettings, ...JSON.parse(data) } : defaultSettings;
}

export function saveSettings(settings) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}
