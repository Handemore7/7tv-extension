# 7TV Emotes for Adobe Premiere Pro

A CEP panel extension that integrates 7TV emotes directly into Adobe Premiere Pro, allowing you to browse, search, and add Twitch emotes to your video projects.

## Overview

This plugin provides seamless access to the 7TV emote library (https://7tv.app/) within Premiere Pro. Browse thousands of emotes, search by name or tags, and drag them directly into your timeline.

## Technology Stack

- **Frontend**: HTML5, CSS3, JavaScript
- **Premiere Pro API**: ExtendScript (JSX)
- **CEP Version**: CEP 11 (Premiere Pro 2021+)
- **7TV API**: REST API v3 (https://7tv.io/v3/)
- **Image Formats**: WebP, GIF, PNG, JPEG

## Project Structure

```
7tv-premiere-plugin/
├── CSXS/
│   └── manifest.xml          # Extension configuration
├── client/
│   ├── index.html            # Panel UI
│   ├── css/
│   │   └── styles.css
│   ├── js/
│   │   ├── main.js           # UI logic
│   │   ├── api.js            # 7TV API client
│   │   └── premiere.js       # ExtendScript bridge
├── host/
│   └── index.jsx             # ExtendScript for Premiere Pro
├── .debug                    # Debug configuration
├── package.json
└── README.md
```

## Development Plan

### Phase 1: Project Setup
- [x] Create CEP extension folder structure
- [x] Create manifest.xml with extension metadata
- [x] Set up basic HTML panel structure
- [x] Configure ExtendScript host file
- [x] Set up .debug file for development
- [x] Test extension loads in Premiere Pro

### Phase 2: 7TV Integration
- [x] Implement 7TV API client
  - [x] Fetch global emote sets
  - [x] Search emotes by name
  - [x] Handle pagination
- [x] Create emote browser UI
  - [x] Grid layout for emotes
  - [x] Search bar
  - [x] Filter options (animated/static)
- [x] Implement image loading and caching
- [x] Handle different image formats (WebP, GIF, PNG)

### Phase 3: Premiere Pro Integration
- [x] Implement emote download functionality
- [x] Create temp directory management
- [x] ExtendScript: Import media to project
- [x] ExtendScript: Add media to timeline at playhead
- [x] Handle WebP to PNG/JPEG conversion if needed
- [x] Handle animated emotes (GIF support)

### Phase 4: Polish & Features
- [ ] Add favorites system
- [ ] Implement recent emotes history
- [ ] Add drag-and-drop to timeline
- [ ] Loading states and error handling
- [ ] Emote preview on hover
- [ ] Settings panel (default size, format preferences)
- [ ] Clean up temp files on close

## Installation (For Development)

1. Clone this repository
2. Enable CEP debugging:
   - Windows: Set `PlayerDebugMode` registry key to `1`
   - Mac: Run `defaults write com.adobe.CSXS.11 PlayerDebugMode 1`
3. Copy extension folder to:
   - Windows: `C:\Program Files (x86)\Common Files\Adobe\CEP\extensions\`
   - Mac: `/Library/Application Support/Adobe/CEP/extensions/`
4. Restart Premiere Pro
5. Open panel: Window > Extensions > 7TV Emotes

## 7TV API Reference

- **Base URL**: `https://7tv.io/v3/`
- **Global Emotes**: `GET /emote-sets/global`
- **Search Emotes**: `GET /emotes?query={search}`
- **CDN URL**: `https://cdn.7tv.app/emote/{emote_id}/{size}.{format}`
  - Sizes: `1x`, `2x`, `3x`, `4x`
  - Formats: `webp`, `avif`, `gif`

## Key Challenges & Solutions

| Challenge | Solution |
|-----------|----------|
| WebP Support | Convert to PNG/JPEG before importing to Premiere |
| Animated Emotes | Prioritize GIF format, convert WebP animations if needed |
| File Management | Download to temp folder, clean up after import |
| Performance | Lazy loading, image caching, pagination |

## Requirements

- Adobe Premiere Pro 2021 or later
- Windows 10/11 or macOS 10.14+
- Internet connection for fetching emotes

## Contributing

This is an open-source project. Contributions are welcome!

## License

MIT License

## Credits

- 7TV Platform: https://7tv.app/
- 7TV GitHub: https://github.com/SevenTV

---

**Status**: 🚧 In Development

Last Updated: 2024
