# Flashcard Driller

A focused, offline-first flashcard application designed for rapid knowledge acquisition. Built with React and Electron, featuring a serene Ancient Temple theme to enhance concentration.

## Features

- **Drill Mode**: Rapid-fire review with keyboard shortcuts (Space to flip, 1/2/3/4 for grading).
- **Spaced Repetition**: Manages card frequency based on your performance.
- **Deck Management**: Create, edit, duplicate, and delete decks easily.
- **Rich Text Support**: Cards support Markdown rendering.
- **Session History**: Track your study performance over time.
- **Import/Export**: Share decks via JSON or CSV.
- **Portable**: runs as a standalone executable on Windows.
- **Fullscreen Mode**: Toggle with Shift+F4.

## Installation

1. Download the latest release (Flashcard Driller.exe).
2. Run the executable. No installation required.

## Development

If you wish to modify or build the application from source:

### Prerequisites

- Node.js (v18 or higher)
- npm

### Setup

1. Clone the repository.
2. Install dependencies:
   ```bash
   npm install
   ```

### Running Locally

Start the development server:
```bash
npm run electron:dev
```

### Building

Create a portable Windows executable:
```bash
npm run dist
```
The output file will be located in the `release/win-unpacked` directory.

## Keyboard Shortcuts

- **Space**: Flip card
- **Shift + Enter**: Add card (in editor)
- **Shift + F4**: Toggle Fullscreen
- **1 / Q**: Mark as Missed
- **2 / W**: Mark as Correct
- **3 / E**: Send to Side Deck 1
- **4 / R**: Send to Side Deck 2

## License

MIT License. See LICENSE file for details.
