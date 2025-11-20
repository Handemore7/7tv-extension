# Changelog

All notable changes to the 7TV Premiere Pro Extension will be documented in this file.

## [1.0.0] - 2024

### 🎉 Initial Release

#### Features
- ✨ Browse thousands of 7TV emotes
- 🔍 Search emotes by name
- ⭐ Favorites system with localStorage persistence
- 🕐 Recent emotes history (last 20)
- 🎨 Support for animated (GIF) and static emotes
- 🎯 Filters: Animated, Static, Zero-Width
- 📄 Pagination (100 emotes per page)
- ⚙️ Settings menu with import size selection (2x/3x/4x)
- 🎨 Dark theme UI matching Premiere Pro
- 📊 Progress bar during import
- 🔔 Toast notifications for user feedback
- 🐛 Debug mode for troubleshooting

#### Technical
- GraphQL API integration with 7TV v3
- Chunked binary file transfer (1KB chunks)
- Request timeout (30s) with AbortController
- API response caching
- Debounced search (300ms)
- Lazy image loading
- localStorage quota handling
- Code injection prevention
- Debug console with 100 entry limit

#### Performance
- In-memory API cache
- Lazy loading images
- Optimized chunked transfer
- Limited debug console entries

#### Security
- HTTPS-only API calls
- Input sanitization
- No credentials stored
- localStorage quota error handling

---

## [Unreleased]

### Planned Features
- [ ] Drag-and-drop to timeline
- [ ] Emote preview on hover
- [ ] Keyboard shortcuts
- [ ] Custom emote collections
- [ ] Batch import
- [ ] Auto-update checker
- [ ] Export/import favorites
- [ ] Emote size preview
- [ ] Retry logic with exponential backoff
- [ ] LRU cache with TTL

---

## Version History

- **1.0.0** - Initial public release
