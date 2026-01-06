import './KeyboardHelp.css';

const shortcuts = [
    { key: 'Space / Enter', action: 'Flip card' },
    { key: '1', action: 'Got it (correct)' },
    { key: '2', action: 'Missed it (incorrect)' },
    { key: '3', action: 'Move to left deck' },
    { key: '4', action: 'Move to right deck' },
    { key: '5', action: 'Switch to Side 1' },
    { key: '6', action: 'Switch to Main' },
    { key: '7', action: 'Switch to Side 2' },
    { key: '?', action: 'Toggle this help' },
    { key: 'Esc', action: 'End session' },
];

export default function KeyboardHelp({ onClose }) {
    return (
        <div className="keyboard-help-overlay" onClick={onClose}>
            <div className="keyboard-help" onClick={e => e.stopPropagation()}>
                <h2>Keyboard Shortcuts</h2>

                <div className="shortcuts-list">
                    {shortcuts.map(({ key, action }) => (
                        <div key={key} className="shortcut-row">
                            <kbd className="shortcut-key">{key}</kbd>
                            <span className="shortcut-action">{action}</span>
                        </div>
                    ))}
                </div>

                <button className="help-close-btn" onClick={onClose}>
                    Got it!
                </button>
            </div>
        </div>
    );
}
