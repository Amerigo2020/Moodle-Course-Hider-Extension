# TUM Moodle Course Hider Extension

> **🍴 Fork Notice**: This is a fork of [Nicolas-Palencia/Moodle-Course-Hider-Extension](https://github.com/Nicolas-Palencia/Moodle-Course-Hider-Extension) with additional features.

This Chrome extension automatically hides unwanted courses on [TUM Moodle](https://www.moodle.tum.de). It helps declutter your dashboard by filtering out courses based on keywords you define.

## ✨ New Features in This Fork

- 🎓 **Automatic Semester Selection**: Automatically selects "SoSe 2025" when loading the course overview
- ⚙️ **Configurable Default Semester**: Easy to change the default semester in the code
- 🔧 **Enhanced Code Quality**: Improved error handling and documentation

## Features

- 🎯 **Smart Filtering**: Hide courses based on customizable keywords
- 🔄 **Dynamic Updates**: Automatically handles dynamically loaded content
- 🛡️ **Secure**: Follows Chrome extension security best practices
- 🚀 **Lightweight**: Minimal performance impact
- 📝 **Easy Configuration**: Simple text-based keyword management

---

## Installation

1. **Download or Clone the Repository**
   - Download the ZIP or run:
     ```bash
     git clone https://github.com/Amerigo2020/Moodle-Course-Hider-Extension.git
     ```
   - Open the folder.

2. **Load the Extension in Chrome**
   - Open Chrome and go to `chrome://extensions/`
   - Enable **Developer mode** (toggle in the top right).
   - Click **Load unpacked**.
   - Select the folder containing this repository.
   - The extension will now be active on TUM Moodle.

---

## Configuration

You can edit which courses are hidden by modifying `keywords.txt`:

- Each line is a keyword (case-insensitive matching)
- Lines starting with `#` are comments and will be ignored
- Example:
  ```
  # Hide student council meetings
  Versammlung
  Fachschaft
  
  # Hide specific course codes
  IN2064
  MA3409
  ```

Any course title containing one of these keywords will be hidden.

After editing `keywords.txt`, **reload the extension** in `chrome://extensions/` and refresh Moodle.

### 🎓 Semester Selection Configuration

This fork automatically selects "SoSe 2025" when you load the course overview. To change the default semester:

1. Open `script.js`
2. Find the `DEFAULT_SEMESTER` setting in the CONFIG section:
   ```javascript
   DEFAULT_SEMESTER: '2025-1', // SoSe 2025
   ```
3. Change the value to your preferred semester:
   - `'2025-1'` = SoSe 2025
   - `'2024-2'` = WiSe 2024/2025  
   - `'2024-1'` = SoSe 2024
   - etc.
4. **Reload the extension** in `chrome://extensions/` and refresh Moodle.

---

## Development

If you want to contribute or modify the extension:

1. **Install dependencies** (optional, for linting):
   ```bash
   npm install
   ```

2. **Lint the code**:
   ```bash
   npm run lint
   ```

3. **Auto-fix linting issues**:
   ```bash
   npm run lint:fix
   ```

---

## Security & Privacy

- ✅ **No data collection**: The extension doesn't collect or transmit any personal data
- ✅ **Minimal permissions**: Only requests necessary permissions for TUM Moodle
- ✅ **Local processing**: All filtering happens locally in your browser
- ✅ **Open source**: Code is fully auditable

---

## Troubleshooting

### Extension not working?
1. Check that you're on `https://www.moodle.tum.de`
2. Reload the extension in `chrome://extensions/`
3. Refresh the Moodle page
4. Check browser console for any error messages

### Courses not being hidden?
1. Verify your keywords in `keywords.txt` are spelled correctly
2. Remember that matching is case-insensitive
3. Check that the course title actually contains the keyword

---

## Version History

### v1.1.0
- 🔒 **Security improvements**: Added timeout handling, input validation
- 🚀 **Performance**: Debounced DOM updates, improved observer logic
- 🛠️ **Code quality**: Added ESLint configuration, comprehensive error handling
- 📖 **Documentation**: Enhanced code comments and README

### v1.0.0
- Initial release

---

## ⚠️ Disclaimer

This project is provided *as is*, with no warranty. Use at your own risk. The author is **not liable** for any issues arising from its use.

---

## License

MIT License – see [LICENSE](LICENSE.txt) for details.

