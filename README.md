# 🎬 7TV Emotes for Adobe Premiere Pro

Add Twitch emotes to your videos! Browse thousands of emotes from [7TV](https://7tv.app/) and import them directly into your Premiere Pro projects.

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![Premiere Pro](https://img.shields.io/badge/Premiere%20Pro-2021%2B-purple)
![License](https://img.shields.io/badge/license-MIT-green)

## ✨ Features

- 🔍 **Search & Browse** - Access thousands of emotes from the 7TV library
- ⚡ **Quick Import** - Click any emote to add it to your project
- ⭐ **Favorites** - Save your most-used emotes for quick access
- 🕐 **Recent History** - Track your last 20 imported emotes
- 🎨 **Animated Support** - Import both static and animated (GIF) emotes
- 🎯 **Smart Filters** - Filter by animated, static, or zero-width emotes
- ⚙️ **Customizable** - Choose import size (2x, 3x, or 4x resolution)

## 📋 Requirements

- **Adobe Premiere Pro 2021 or later** (version 15.0+)
- **Windows 10/11** or **macOS 10.14+**
- **Internet connection** (to download emotes)

## 🚀 Installation

### Easy Install (Recommended)

1. **Download** this extension folder
2. **Run the installer**:
   - **Windows**: Right-click `install.bat` → Run as Administrator
   - **Mac/Linux**: Run `npm install` in terminal
3. **Restart Premiere Pro**
4. **Open the panel**: Go to `Window > Extensions > 7TV Emotes`

📖 **Detailed instructions**: See [INSTALL.md](INSTALL.md)

⚡ **Super quick guide**: See [QUICKSTART.md](QUICKSTART.md)

## 📖 How to Use

### Basic Usage

1. **Open the panel** from `Window > Extensions > 7TV Emotes`
2. **Browse emotes** by scrolling through the grid
3. **Search** by typing in the search bar (minimum 2 characters)
4. **Click an emote** to import it to your project
5. The emote will be added to your Project panel and ready to use!

### Tabs

- **All** - Browse all available emotes from 7TV
- **Favorites** ⭐ - Quick access to your saved favorites
- **Recent** 🕐 - View your last 20 imported emotes

### Filters

Use the filter buttons to narrow down results:
- **Animated** - Show only animated (GIF) emotes
- **Static** - Show only static (PNG/WebP) emotes
- **Zero-Width** - Show only zero-width emotes (overlay emotes)

### Settings ⚙️

Click the gear icon (⚙️) in the top-right to access:
- **Import Size** - Choose resolution: 2x (128px), 3x (192px), or 4x (256px)
- **Clear Cache** - Clear stored API data
- **Clear Favorites** - Remove all saved favorites
- **Debug Mode** - Enable console logging (for troubleshooting)

### Tips & Tricks

- **Add to Favorites**: Click the ☆ icon on any emote
- **Remove from Favorites**: Click the ★ icon on favorited emotes
- **Quick Search**: Type at least 2 characters to search
- **Pagination**: Use ← → buttons to browse more emotes
- **Import Size**: Higher resolution = better quality but larger file size

## 🔧 Troubleshooting

### Extension doesn't appear in Premiere Pro

**Enable CEP Debugging:**

**Windows:**
1. Press `Win + R` and type `regedit`
2. Navigate to `HKEY_CURRENT_USER\Software\Adobe\CSXS.11`
3. Create a new String value named `PlayerDebugMode` with value `1`
4. Restart Premiere Pro

**Mac:**
1. Open Terminal
2. Run: `defaults write com.adobe.CSXS.11 PlayerDebugMode 1`
3. Restart Premiere Pro

### Emotes won't import

- Check your internet connection
- Make sure you have write permissions to your temp folder
- Try clearing the cache (Settings > Clear Cache)
- Enable Debug Mode to see error messages

### Search not working

- Make sure you type at least 2 characters
- Wait 300ms after typing (search is debounced)
- Try clearing the cache and searching again

### Extension is slow

- Clear the cache (Settings > Clear Cache)
- Close and reopen the panel
- Reduce import size to 2x or 3x

## 🎯 Keyboard Shortcuts

Currently, this extension uses mouse/click interactions only. Keyboard shortcuts may be added in future versions.

## 📝 Known Limitations

- Emotes are imported as static files (not live-linked)
- WebP format is converted to PNG/GIF before import
- Maximum 100 emotes per page
- Recent history limited to 20 emotes
- Favorites stored in browser localStorage (limited to ~5MB)

## 🤝 Contributing

This is an open-source project! Contributions, issues, and feature requests are welcome.

## 📄 License

MIT License - feel free to use and modify!

## 🙏 Credits

- **7TV Platform**: [https://7tv.app/](https://7tv.app/)
- **7TV API**: [https://7tv.io/](https://7tv.io/)
- **7TV GitHub**: [https://github.com/SevenTV](https://github.com/SevenTV)

## 📚 Documentation

- **[QUICKSTART.md](QUICKSTART.md)** - Get started in 60 seconds
- **[INSTALL.md](INSTALL.md)** - Detailed installation guide
- **[DOCUMENTATION.md](DOCUMENTATION.md)** - Full technical documentation
- **[CHANGELOG.md](CHANGELOG.md)** - Version history

## 📞 Support

Having issues?
1. Check [INSTALL.md](INSTALL.md) for installation help
2. Read [DOCUMENTATION.md](DOCUMENTATION.md) for technical details
3. Enable Debug Mode in settings to see error logs
4. Open an issue on GitHub with debug logs

---

**Made with ❤️ for the streaming community**

*Not affiliated with 7TV or Twitch*
