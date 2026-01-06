import { useState, useEffect } from 'react';
import DeckList from './components/DeckList';
import DeckEditor from './components/DeckEditor';
import DrillSession from './components/DrillSession';
import SessionHistory from './components/SessionHistory';
import Settings from './components/Settings';
import { getSettings } from './utils/storage';
import './index.css';

export default function App() {
  const [view, setView] = useState('list'); // 'list' | 'edit' | 'drill' | 'history' | 'settings'
  const [currentDeck, setCurrentDeck] = useState(null);
  const [settings, setSettings] = useState(() => getSettings());

  // Apply dark mode
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', settings.darkMode ? 'dark' : 'light');
  }, [settings.darkMode]);

  // Refresh settings when returning from settings page
  const handleSettingsBack = () => {
    setSettings(getSettings());
    setView('list');
  };

  const handleEditDeck = (deck) => {
    setCurrentDeck(deck);
    setView('edit');
  };

  const handleDrill = (deck) => {
    setCurrentDeck(deck);
    setView('drill');
  };

  const handleEndDrill = () => {
    setCurrentDeck(null);
    setView('list');
  };

  switch (view) {
    case 'edit':
      return (
        <DeckEditor
          deck={currentDeck}
          onBack={() => setView('list')}
          onDrill={handleDrill}
        />
      );

    case 'drill':
      return (
        <DrillSession
          deck={currentDeck}
          onEnd={handleEndDrill}
        />
      );

    case 'history':
      return (
        <SessionHistory onBack={() => setView('list')} />
      );

    case 'settings':
      return (
        <Settings onBack={handleSettingsBack} />
      );

    default:
      return (
        <DeckList
          onEditDeck={handleEditDeck}
          onDrill={handleDrill}
          onSettings={() => setView('settings')}
          onHistory={() => setView('history')}
        />
      );
  }
}
