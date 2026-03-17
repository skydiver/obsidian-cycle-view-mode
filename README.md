# Cycle View Mode

An Obsidian plugin that cycles between Reading, Live Preview, and Source Mode with a single click or hotkey.

## Usage

Open any note, then cycle view modes using one of:

- **Status bar:** Click the mode indicator in the bottom-right corner (e.g., "✏ Live Preview")
- **Command palette:** Search for "Cycle view mode"
- **Hotkey:** Assign a custom hotkey in Settings → Hotkeys

The cycle order is: Reading → Live Preview → Source Mode → Reading.

## What the status bar shows

| Icon           | Mode                             |
| -------------- | -------------------------------- |
| 👁 Reading     | Reading view (rendered markdown) |
| ✏ Live Preview | Live Preview (WYSIWYG editing)   |
| <> Source      | Source Mode (raw markdown)       |

## Requirements

- Obsidian v1.4.0 or later

## Installation

### From Community Plugins

1. Open Settings → Community plugins → Browse
2. Search for "Cycle View Mode"
3. Click Install, then Enable

### Manual

1. Download `main.js` and `manifest.json` from the latest release
2. Create a folder `.obsidian/plugins/cycle-view-mode/` in your vault
3. Copy the two files into that folder
4. Enable the plugin in Settings → Community plugins
