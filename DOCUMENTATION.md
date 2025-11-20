# 7TV Premiere Pro Extension - Technical Documentation

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Project Structure](#project-structure)
3. [Technology Stack](#technology-stack)
4. [API Integration](#api-integration)
5. [File Transfer System](#file-transfer-system)
6. [State Management](#state-management)
7. [Performance Optimizations](#performance-optimizations)
8. [Security Considerations](#security-considerations)
9. [Development Setup](#development-setup)
10. [Build & Deployment](#build--deployment)
11. [Troubleshooting](#troubleshooting)

---

## Architecture Overview

This extension follows the CEP (Common Extensibility Platform) architecture with three main layers:

```
┌─────────────────────────────────────┐
│   Client Layer (HTML/CSS/JS)       │  ← User Interface
│   - UI rendering                    │
│   - API calls                       │
│   - State management                │
└──────────────┬──────────────────────┘
               │ CSInterface Bridge
┌──────────────▼──────────────────────┐
│   Host Layer (ExtendScript/JSX)    │  ← Premiere Pro Integration
│   - File I/O operations             │
│   - Project manipulation            │
│   - Timeline operations             │
└─────────────────────────────────────┘
```

### Communication Flow

1. **User Action** → UI Event Handler (main.js)
2. **API Request** → 7TV GraphQL API (api.js)
3. **Data Processing** → Normalize & Cache
4. **File Download** → Fetch from CDN
5. **Binary Transfer** → Chunked transfer to ExtendScript (premiere.js)
6. **File Write** → Write to temp folder (index.jsx)
7. **Import** → Add to Premiere Pro project (index.jsx)

---

## Project Structure

```
7tv-premiere-extension/
├── CSXS/
│   └── manifest.xml              # Extension metadata & configuration
├── client/                       # Frontend (runs in Chromium)
│   ├── index.html               # Main UI structure
│   ├── css/
│   │   └── styles.css           # Dark theme styling
│   ├── js/
│   │   ├── main.js              # UI logic & event handlers
│   │   ├── api.js               # 7TV API client
│   │   └── premiere.js          # CSInterface bridge
│   └── lib/
│       └── CSInterface.js       # Adobe CEP library
├── host/
│   └── index.jsx                # ExtendScript for Premiere Pro
├── .debug                       # Debug port configuration
├── install.bat                  # Windows installer
├── install.js                   # Cross-platform installer
├── package.json                 # NPM metadata
├── README.md                    # User documentation
└── DOCUMENTATION.md             # This file
```

---

## Technology Stack

### Frontend (Client Layer)

- **HTML5** - Semantic markup
- **CSS3** - Grid layout, animations, dark theme
- **Vanilla JavaScript (ES6+)** - No frameworks
- **Chromium Embedded Framework (CEF)** - Provided by CEP

### Backend (Host Layer)

- **ExtendScript (JSX)** - Adobe's JavaScript variant
- **Premiere Pro API** - `app.project`, `app.project.importFiles()`

### APIs & Services

- **7TV GraphQL API** - `https://7tv.io/v3/gql`
- **7TV CDN** - `https://cdn.7tv.app/emote/{id}/{size}.{format}`

### CEP Version

- **CEP 11** - Compatible with Premiere Pro 2021+ (v15.0+)

---

## API Integration

### 7TV GraphQL API

#### Endpoint
```
POST https://7tv.io/v3/gql
Content-Type: application/json
```

#### Query: Fetch All Emotes
```graphql
query AllEmotes($query: String!, $page: Int, $limit: Int) {
  emotes(query: $query, page: $page, limit: $limit) {
    count
    items {
      id
      name
      flags
      animated
      tags
      owner {
        username
        display_name
      }
    }
  }
}
```

**Variables:**
```json
{
  "query": "",
  "page": 1,
  "limit": 100
}
```

#### Query: Search Emotes
Same query structure, but with non-empty `query` string.

**Variables:**
```json
{
  "query": "pepe",
  "page": 1,
  "limit": 100
}
```

### Response Structure

```json
{
  "data": {
    "emotes": {
      "count": 50000,
      "items": [
        {
          "id": "60ae3e54259ac5a73e56a426",
          "name": "Clap",
          "flags": 0,
          "animated": false,
          "tags": ["clap", "applause"],
          "owner": {
            "username": "user123",
            "display_name": "User"
          }
        }
      ]
    }
  }
}
```

### Emote Flags

Flags are bitwise integers:
- `1` (bit 0) - Animated
- `256` (bit 8) - Zero-width

### CDN URLs

Format: `https://cdn.7tv.app/emote/{emoteId}/{size}.{format}`

**Sizes:**
- `1x` - 32px
- `2x` - 64px
- `3x` - 96px
- `4x` - 128px

**Formats:**
- `webp` - Static emotes (best compression)
- `gif` - Animated emotes
- `avif` - Alternative format (not widely supported)

### Caching Strategy

- **In-Memory Cache** - `Map` object stores API responses
- **Cache Keys** - `all_{page}` or `search_{query}_{page}`
- **No Expiration** - Cache persists until cleared manually
- **localStorage** - Favorites and recent emotes

---

## File Transfer System

### Challenge

ExtendScript has a parameter size limit (~32KB). Large binary files cannot be passed directly.

### Solution: Chunked Binary Transfer

1. **Download** - Fetch emote from CDN in client layer
2. **Convert** - Convert response to `Uint8Array`
3. **Chunk** - Split into 1KB chunks
4. **Transfer** - Send chunks sequentially to ExtendScript
5. **Reassemble** - Write chunks to file using `String.fromCharCode()`
6. **Import** - Use `app.project.importFiles()`

### Implementation

#### Client Side (premiere.js)

```javascript
async downloadAndImport(emoteId, emoteName, url, animated, progressCallback) {
  // 1. Download
  const response = await fetch(url);
  const arrayBuffer = await response.arrayBuffer();
  const bytes = new Uint8Array(arrayBuffer);
  
  // 2. Determine extension
  const ext = animated ? 'gif' : 'png';
  const fileName = `${emoteName}_${emoteId}.${ext}`;
  
  // 3. Start write operation
  await this.evalScript(`startFileWrite("${fileName}")`);
  
  // 4. Send chunks
  const chunkSize = 1000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    const chunk = bytes.slice(i, i + chunkSize);
    const chunkArray = Array.from(chunk).join(',');
    await this.evalScript(`writeFileChunk([${chunkArray}])`);
    progressCallback((i / bytes.length) * 100);
  }
  
  // 5. Finish and import
  const result = await this.evalScript(`finishFileWrite()`);
  return JSON.parse(result);
}
```

#### Host Side (index.jsx)

```javascript
var currentFile = null;
var currentFileName = '';

function startFileWrite(fileName) {
  currentFileName = fileName;
  currentFile = new File(getTempFolder() + fileName);
  currentFile.encoding = 'BINARY';
  currentFile.open('w');
}

function writeFileChunk(byteArray) {
  if (!currentFile) return false;
  var str = '';
  for (var i = 0; i < byteArray.length; i++) {
    str += String.fromCharCode(byteArray[i]);
  }
  currentFile.write(str);
  return true;
}

function finishFileWrite() {
  if (!currentFile) return '{"success":false}';
  currentFile.close();
  
  // Import to project
  var imported = app.project.importFiles([currentFile.fsName]);
  
  return JSON.stringify({
    success: true,
    path: currentFile.fsName,
    addedToTimeline: false
  });
}
```

---

## State Management

### Global State (main.js)

```javascript
let allEmotes = [];           // Currently loaded emotes
let filteredEmotes = [];      // After filters applied
let currentPage = 1;          // Current pagination page
let totalPages = 1;           // Total pages available
let totalCount = 0;           // Total emote count
let currentQuery = '';        // Current search query
let isLoading = false;        // Loading state flag
let searchTimeout = null;     // Debounce timer
let debugMode = false;        // Debug console visibility
let favorites = [];           // Favorited emotes
let recentEmotes = [];        // Recently imported emotes
let importSize = '4x';        // Default import resolution
```

### Persistent State (localStorage)

```javascript
// Keys
'7tv_favorites'      // JSON array of emote objects
'7tv_recent'         // JSON array of emote objects
'7tv_import_size'    // String: '2x', '3x', or '4x'

// Storage limits
MAX_RECENT = 20      // Maximum recent emotes
localStorage quota ≈ 5MB
```

### State Synchronization

- **Favorites** - Saved on every add/remove
- **Recent** - Saved after each import
- **Import Size** - Saved on change
- **Cache** - In-memory only, cleared on reload

---

## Performance Optimizations

### 1. Debounced Search

```javascript
searchTimeout = setTimeout(async () => {
  await performSearch(query, 1);
}, 300); // 300ms delay
```

### 2. Lazy Image Loading

```html
<img loading="lazy" src="..." />
```

### 3. API Response Caching

```javascript
if (this.cache.has(cacheKey)) {
  return this.cache.get(cacheKey);
}
```

### 4. Chunked File Transfer

- 1KB chunks prevent parameter overflow
- Progress callbacks for UX feedback

### 5. Limited Debug Console

```javascript
const MAX_DEBUG_ENTRIES = 100;
while (debugConsole.children.length > MAX_DEBUG_ENTRIES) {
  debugConsole.removeChild(debugConsole.firstChild);
}
```

### 6. Request Timeout

```javascript
const controller = new AbortController();
const timeout = setTimeout(() => controller.abort(), 30000);
```

---

## Security Considerations

### 1. Code Injection Prevention

**Vulnerability:** Single quotes in filenames could break `evalScript()`

**Fix:** Escape quotes before passing to ExtendScript
```javascript
fileName = fileName.replace(/'/g, "\\'");
```

### 2. HTTPS Only

All API calls use HTTPS:
- `https://7tv.io/v3/gql`
- `https://cdn.7tv.app/emote/...`

### 3. No Credentials Stored

- No API keys required
- No user authentication
- Public API only

### 4. localStorage Quota Handling

```javascript
try {
  localStorage.setItem(key, value);
} catch (e) {
  if (e.name === 'QuotaExceededError') {
    // Handle gracefully
  }
}
```

### 5. Input Validation

- Emote IDs validated by API
- File extensions whitelisted (gif, png, webp)
- No eval() usage in client code

---

## Development Setup

### Prerequisites

- Node.js (for installer script)
- Adobe Premiere Pro 2021+
- Text editor (VS Code recommended)

### Enable CEP Debugging

**Windows:**
```
HKEY_CURRENT_USER\Software\Adobe\CSXS.11
PlayerDebugMode = "1"
```

**Mac:**
```bash
defaults write com.adobe.CSXS.11 PlayerDebugMode 1
```

### Install Extension

1. Clone repository
2. Run installer:
   - Windows: `install.bat`
   - Mac/Linux: `npm install`
3. Restart Premiere Pro

### Debug Tools

1. **Chrome DevTools** - Right-click panel → Inspect
2. **Debug Console** - Enable in Settings menu
3. **ExtendScript Toolkit** - For JSX debugging

### Debug Port

Configured in `.debug`:
```xml
<Host Name="PPRO" Port="8088"/>
```

Access at: `http://localhost:8088`

---

## Build & Deployment

### Version Bump

1. Update `package.json` version
2. Update `manifest.xml` version
3. Update README.md badge

### Pre-Release Checklist

- [ ] Test on Windows & Mac
- [ ] Test on Premiere Pro 2021, 2022, 2023, 2024
- [ ] Verify all emote formats (static, animated, zero-width)
- [ ] Test with slow internet connection
- [ ] Test localStorage quota handling
- [ ] Clear all console.log statements (or wrap in DEBUG flag)
- [ ] Update documentation

### Package for Distribution

1. Remove development files:
   - `node_modules/`
   - `.git/`
   - `test-api.html`
   - `CODE_AUDIT.md`

2. Create ZIP archive:
   ```
   7tv-premiere-extension-v1.0.0.zip
   ```

3. Include:
   - All source files
   - README.md
   - DOCUMENTATION.md
   - LICENSE
   - install.bat / install.js

### Distribution Channels

- GitHub Releases
- Adobe Exchange (requires approval)
- Direct download from website

---

## Troubleshooting

### Common Issues

#### Extension doesn't load

**Symptoms:** Extension not in Window > Extensions menu

**Solutions:**
1. Enable PlayerDebugMode
2. Check manifest.xml syntax
3. Verify folder name matches Extension ID
4. Restart Premiere Pro

#### API requests fail

**Symptoms:** "Failed to load emotes" error

**Solutions:**
1. Check internet connection
2. Verify 7TV API is online (https://7tv.io/)
3. Clear cache and retry
4. Check browser console for CORS errors

#### Import fails

**Symptoms:** "Import failed" notification

**Solutions:**
1. Check temp folder permissions
2. Verify file format support
3. Enable debug mode to see error details
4. Try smaller import size (2x instead of 4x)

#### localStorage quota exceeded

**Symptoms:** "Storage full!" notification

**Solutions:**
1. Clear favorites
2. Clear browser cache
3. Reduce number of recent emotes

### Debug Mode

Enable in Settings menu to see:
- API request/response logs
- File transfer progress
- Error stack traces
- Performance metrics

### Log Files

ExtendScript logs: `%TEMP%/premiere_jsx.log` (Windows)

---

## API Rate Limits

7TV API has no documented rate limits, but best practices:
- Cache responses aggressively
- Debounce search queries
- Use pagination instead of fetching all emotes

---

## Browser Compatibility

CEP uses Chromium Embedded Framework:
- **CEP 11** = Chromium 88
- Supports ES6+, async/await, fetch API
- No need for polyfills

---

## Future Enhancements

### Planned Features

- [ ] Drag-and-drop to timeline
- [ ] Emote preview on hover
- [ ] Keyboard shortcuts
- [ ] Custom emote collections
- [ ] Batch import
- [ ] Auto-update checker

### Performance Improvements

- [ ] Implement LRU cache with TTL
- [ ] Add retry logic with exponential backoff
- [ ] Optimize image loading with IntersectionObserver
- [ ] Implement virtual scrolling for large lists

### UX Improvements

- [ ] Emote size preview
- [ ] Tooltips with emote info
- [ ] Undo/redo for favorites
- [ ] Export/import favorites

---

## Contributing

### Code Style

- Use 2-space indentation
- Use camelCase for variables
- Use PascalCase for classes
- Add JSDoc comments for functions
- Keep functions under 50 lines

### Testing

- Test on both Windows and Mac
- Test with different Premiere Pro versions
- Test with slow network conditions
- Test edge cases (empty results, API errors)

### Pull Request Process

1. Fork repository
2. Create feature branch
3. Make changes
4. Test thoroughly
5. Update documentation
6. Submit PR with description

---

## License

MIT License - See LICENSE file for details

---

## Contact & Support

- **Issues:** GitHub Issues
- **Discussions:** GitHub Discussions
- **7TV Discord:** https://discord.gg/7tv

---

**Last Updated:** 2024
**Version:** 1.0.0
