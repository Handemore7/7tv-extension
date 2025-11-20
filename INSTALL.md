# 📦 Installation Guide

## Quick Install (Windows)

1. **Download** the extension folder
2. **Right-click** `install.bat` → **Run as Administrator**
3. **Restart** Adobe Premiere Pro
4. **Open**: `Window > Extensions > 7TV Emotes`

## Quick Install (Mac)

1. **Download** the extension folder
2. **Open Terminal** in the extension folder
3. **Run**: `npm install`
4. **Restart** Adobe Premiere Pro
5. **Open**: `Window > Extensions > 7TV Emotes`

---

## Manual Installation

### Windows

1. **Copy** the entire `7tv-extension` folder
2. **Paste** to: `C:\Program Files (x86)\Common Files\Adobe\CEP\extensions\`
3. **Enable CEP Debugging**:
   - Press `Win + R`
   - Type `regedit` and press Enter
   - Navigate to: `HKEY_CURRENT_USER\Software\Adobe\CSXS.XX` -where XX corresponds to the CEP version compatible with your Premiere Pro version (e.g., CSXS.12 for PPro 25.0)-
   - Right-click → New → String Value
   - Name: `PlayerDebugMode`
   - Value: `1`
4. **Restart** Premiere Pro
5. **Open**: `Window > Extensions > 7TV Emotes`

### Mac

1. **Copy** the entire `7tv-extension` folder
2. **Paste** to: `/Library/Application Support/Adobe/CEP/extensions/`
3. **Enable CEP Debugging**:
   - Open Terminal
   - Run: `defaults write com.adobe.CSXS.XX PlayerDebugMode 1` -where XX corresponds to the CEP version compatible with your Premiere Pro version (e.g., CSXS.12 for PPro 25.0)-
4. **Restart** Premiere Pro
5. **Open**: `Window > Extensions > 7TV Emotes`

---

## Troubleshooting

### Extension doesn't appear

✅ **Check Premiere Pro version** - Requires 2021 or later (v15.0+)

✅ **Enable CEP debugging** - See steps above

✅ **Check folder location** - Must be in CEP extensions folder

✅ **Restart Premiere Pro** - Close completely and reopen

### Permission errors

✅ **Run installer as Administrator** (Windows)

✅ **Use sudo** for copying files (Mac)

✅ **Check folder permissions** - Ensure write access

### Still not working?

1. Check `manifest.xml` exists in `CSXS/` folder
2. Verify folder name is `7tv-extension`
3. Look for errors in Premiere Pro console
4. See [DOCUMENTATION.md](DOCUMENTATION.md) for advanced troubleshooting

---

## Uninstallation

### Windows
Delete folder: `C:\Program Files (x86)\Common Files\Adobe\CEP\extensions\7tv-extension`

### Mac
Delete folder: `/Library/Application Support/Adobe/CEP/extensions/7tv-extension`

Then restart Premiere Pro.

---

## System Requirements

- **Premiere Pro**: 2021 or later (version 15.0+)
- **Windows**: 10 or 11
- **Mac**: macOS 10.14 or later
- **Internet**: Required for downloading emotes
- **Disk Space**: ~5MB for extension + temp storage for emotes

---

Need help? See [README.md](README.md) or [DOCUMENTATION.md](DOCUMENTATION.md)
