import { useState } from 'react';
import { getSettings, saveSettings } from '../utils/storage';
import './Settings.css';

export default function Settings({ onBack }) {
    const [settings, setSettings] = useState(() => getSettings());

    const handleChange = (key, value) => {
        const updated = { ...settings, [key]: value };
        setSettings(updated);
        saveSettings(updated);

        // Apply dark mode immediately
        if (key === 'darkMode') {
            document.documentElement.setAttribute('data-theme', value ? 'dark' : 'light');
        }
    };

    return (
        <div className="settings-page">
            <header className="settings-header">
                <button className="btn btn-ghost" onClick={onBack}>
                    ← Back
                </button>
                <h1>Settings</h1>
            </header>

            <div className="settings-list">
                <div className="setting-item">
                    <div className="setting-info">
                        <h3>Dark Mode</h3>
                        <p>Use dark color scheme</p>
                    </div>
                    <label className="toggle">
                        <input
                            type="checkbox"
                            checked={settings.darkMode}
                            onChange={(e) => handleChange('darkMode', e.target.checked)}
                        />
                        <span className="toggle-slider"></span>
                    </label>
                </div>

                <div className="setting-item">
                    <div className="setting-info">
                        <h3>Missed Card Reentry</h3>
                        <p>Number of cards before a missed card reappears</p>
                    </div>
                    <div className="setting-input">
                        <button
                            className="btn-stepper"
                            onClick={() => handleChange('reentryInterval', Math.max(1, settings.reentryInterval - 1))}
                            disabled={settings.reentryInterval <= 1}
                        >
                            −
                        </button>
                        <span className="stepper-value">{settings.reentryInterval}</span>
                        <button
                            className="btn-stepper"
                            onClick={() => handleChange('reentryInterval', Math.min(10, settings.reentryInterval + 1))}
                            disabled={settings.reentryInterval >= 10}
                        >
                            +
                        </button>
                    </div>
                </div>
            </div>

            <div className="settings-footer">
                <p className="settings-version">Flashcard Driller v1.0</p>
                <p className="settings-note">All data is stored locally on your device.</p>
            </div>
        </div>
    );
}
