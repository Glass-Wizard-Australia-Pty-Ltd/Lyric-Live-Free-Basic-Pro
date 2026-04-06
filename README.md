# Lyric Live — Wheelie Fun Hub Integration
### Arts Mobile Community Center

A web-based lyrics display application built for the **Wheelie Fun Hub** at the **Arts Mobile Community Center**. Designed for live performances, sing-alongs, and community events — no server required.

---

## Features

| Feature | Free | Basic | Pro |
|---------|------|-------|-----|
| Song library | ✅ | ✅ | ✅ |
| Setlist (max items) | 5 | 20 | Unlimited |
| Verse navigation | ✅ | ✅ | ✅ |
| Themes | Dark | 4 themes | 5 themes (incl. Wheelie Fun) |
| Font sizes | Medium, Large | 4 sizes | 5 sizes (incl. Giant) |
| Full-screen projection mode | ❌ | ✅ | ✅ |
| Auto-advance setlist | ❌ | ❌ | ✅ |

---

## Getting Started

Open `index.html` directly in any modern browser — no build step or server needed.

```
open index.html
```

Or serve it locally:

```bash
npx serve .
# then visit http://localhost:3000
```

Your active plan, display settings, and setlist are **automatically saved** in browser `localStorage` and restored the next time you open the app.

---

## Project Structure

```
├── index.html          # Main application entry point
├── css/
│   └── styles.css      # All styles (Wheelie Fun Hub theme)
├── js/
│   └── app.js          # Application logic
└── data/
    └── songs.json      # Song library (add your own songs here)
```

---

## Adding Songs

Edit `data/songs.json` to add songs to the library. Each song follows this schema:

```json
{
  "id": 6,
  "title": "My Song",
  "artist": "Artist Name",
  "category": "Category",
  "verses": [
    {
      "type": "verse",
      "lines": [
        "First line of the verse",
        "Second line of the verse"
      ]
    },
    {
      "type": "chorus",
      "lines": [
        "First line of the chorus",
        "Second line of the chorus"
      ]
    }
  ]
}
```

Supported verse types: `verse`, `chorus`, `bridge`, `pre-chorus`, `outro`, `intro`

---

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `← / →` or `↑ / ↓` | Previous / Next verse |
| `Page Up / Page Down` | Previous / Next verse |
| `P` | Toggle projection mode |
| `Esc` | Close projection / modal |

---

## Tiers (Demo)

Click the **Free / Basic / Pro** badge in the top-right corner to cycle through tiers and preview available features.

---

## About

Built for the **Wheelie Fun Hub** at the **Arts Mobile Community Center** to support live performances, community sing-alongs, and arts events.
