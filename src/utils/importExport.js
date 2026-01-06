// Parse CSV content to cards array
export function parseCSV(text) {
    const lines = text.trim().split('\n');
    const cards = [];

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        // Skip header row if it looks like one
        if (i === 0 && line.toLowerCase().includes('front') && line.toLowerCase().includes('back')) {
            continue;
        }

        // Parse CSV line (handle quoted fields)
        const parsed = parseCSVLine(line);
        if (parsed.length >= 2) {
            cards.push({
                front: parsed[0],
                back: parsed[1],
            });
        }
    }

    return cards;
}

// Parse a single CSV line handling quotes
function parseCSVLine(line) {
    const result = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        const nextChar = line[i + 1];

        if (char === '"') {
            if (inQuotes && nextChar === '"') {
                current += '"';
                i++; // Skip next quote
            } else {
                inQuotes = !inQuotes;
            }
        } else if (char === ',' && !inQuotes) {
            result.push(current.trim());
            current = '';
        } else {
            current += char;
        }
    }

    result.push(current.trim());
    return result;
}

// Parse JSON content to deck
export function parseJSON(text) {
    const data = JSON.parse(text);

    // Handle array of cards or full deck object
    if (Array.isArray(data)) {
        return {
            name: 'Imported Deck',
            cards: data.map(card => ({
                front: card.front || card.question || '',
                back: card.back || card.answer || '',
            })),
        };
    }

    return {
        name: data.name || 'Imported Deck',
        cards: (data.cards || []).map(card => ({
            front: card.front || card.question || '',
            back: card.back || card.answer || '',
        })),
    };
}

// Export deck to CSV string
export function exportToCSV(deck) {
    const lines = ['front,back'];

    for (const card of deck.cards) {
        const front = escapeCSV(card.front);
        const back = escapeCSV(card.back);
        lines.push(`${front},${back}`);
    }

    return lines.join('\n');
}

// Escape a value for CSV
function escapeCSV(value) {
    if (value.includes(',') || value.includes('"') || value.includes('\n')) {
        return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
}

// Export deck to JSON string
export function exportToJSON(deck) {
    return JSON.stringify({
        name: deck.name,
        created: deck.created,
        cards: deck.cards.map(card => ({
            front: card.front,
            back: card.back,
        })),
    }, null, 2);
}

// Parse bulk text (one card per line, configurable delimiter)
export function parseBulkText(text, delimiter = '|') {
    const lines = text.trim().split('\n');
    const cards = [];

    for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;

        const parts = trimmed.split(delimiter);
        if (parts.length >= 2) {
            cards.push({
                front: parts[0].trim(),
                back: parts.slice(1).join(delimiter).trim(),
            });
        }
    }

    return cards;
}

// Download helper
export function downloadFile(content, filename, type = 'text/plain') {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}
