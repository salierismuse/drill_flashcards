import { useEffect, useCallback } from 'react';

export function useKeyboard(handlers, enabled = true) {
    const handleKeyDown = useCallback((event) => {
        if (!enabled) return;

        // Don't trigger shortcuts when typing in inputs
        if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
            return;
        }

        const key = event.key.toLowerCase();

        if (key === ' ' || key === 'enter') {
            event.preventDefault();
            handlers.onFlip?.();
        } else if (key === '1') {
            event.preventDefault();
            handlers.onGotIt?.();
        } else if (key === '2') {
            event.preventDefault();
            handlers.onMissed?.();
        } else if (key === '3') {
            event.preventDefault();
            handlers.onMove1?.();
        } else if (key === '4') {
            event.preventDefault();
            handlers.onMove2?.();
        } else if (key === '5') {
            event.preventDefault();
            handlers.onSwitchSide1?.();
        } else if (key === '6') {
            event.preventDefault();
            handlers.onSwitchMain?.();
        } else if (key === '7') {
            event.preventDefault();
            handlers.onSwitchSide2?.();
        } else if (key === 'escape') {
            event.preventDefault();
            handlers.onEnd?.();
        } else if (key === '?') {
            event.preventDefault();
            handlers.onHelp?.();
        }
    }, [handlers, enabled]);

    useEffect(() => {
        if (enabled) {
            window.addEventListener('keydown', handleKeyDown);
            return () => window.removeEventListener('keydown', handleKeyDown);
        }
    }, [handleKeyDown, enabled]);
}
