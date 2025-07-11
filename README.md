# TUM Moodle Course Hider Extension

This Chrome extension automatically hides unwanted courses on [TUM Moodle](https://www.moodle.tum.de). It helps declutter your dashboard by filtering out courses based on keywords you define.

---

## Installation

1. **Download or Clone the Repository**
   - Download the ZIP or run:
     ```
     git clone https://github.com/yourusername/tum-moodle-course-hider.git
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

- Each line is a keyword.
- Example:
Versammlung
Fachschaft


Any course title containing one of these keywords (case-insensitive) will be hidden.

After editing `keywords.txt`, **reload the extension** in `chrome://extensions/` and refresh Moodle.

---

## ⚠️ Disclaimer

This project is provided *as is*, with no warranty. Use at your own risk. The author is **not liable** for any issues arising from its use.

---

## License

MIT License – see [LICENSE](LICENSE) for details.

