# SketchVision

Mobile-first PWA for pencil artists: lessons, reference and analysis tools, shading practice, gallery and progress tracking.

## Run
```
python -m venv .venv && source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
python app.py        # http://localhost:5000
```
Service workers need HTTPS or localhost. To test install on Android, deploy over HTTPS.

## File map
| File | Purpose |
|---|---|
| `app.py` | Flask app factory: serves the shell, `/sw.js`, `/api/health`, security headers |
| `config.py` | Settings (secret key, upload limit, cookie flags, DB path) |
| `templates/index.html` | Single-page shell: header, tab nav, `#view` |
| `static/js/app.js` | Hash router, page renderers, lesson progress, online/offline indicator |
| `static/css/app.css` | Palette tokens, layout, accessible focus styles |
| `static/data/lessons.json` | Lesson content (cached offline) |
| `static/sw.js` | Precache + offline fallback; never caches `/api/` |
| `static/manifest.webmanifest`, `static/icons/` | Installability |

## Build plan (each step tested before the next)
1. Foundation: shell, Academy, offline cache (done)
2. User Management: SQLite, hashed passwords, sessions
3. Progress Tracker + Chart.js; move completion into the database
4. Reference Studio (canvas, works offline)
5. Shading Trainer (canvas, works offline)
6. Gallery: validated uploads, safe file names, tags, search
7. Sketch Analyzer: OpenCV grayscale, Canny edges, contours
8. Loomis Converter: MediaPipe face landmarks, approximate guides, manual adjustment, export

## Honesty rules
No fake AI. Analyzer output is image measurements, not an art evaluation. Loomis guides are 2D approximations.
