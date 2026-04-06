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
| Glass Wizard AI music | ✅ | ✅ | ✅ |

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

---

## Glass Wizard Integration

Lyric Live is integrated with [**Glass Wizard**](https://github.com/Glass-Wizard-Australia-Pty-Ltd/Glass-Wizard-Github) — an AI music generation and XRPL NFT platform by Glass Wizard Australia Pty Ltd.

### What it does

The **Glass Wizard** tab in the sidebar lets you generate an AI-composed backing track for any song in the library, powered by the Glass Wizard Music API.

| Setting | Options |
|---------|---------|
| **Style** | Pop, Electronic, Ambient, Jazz, Classical, Experimental |
| **Scale** | C Major, A Minor, G Major, D Minor, Pentatonic, Blues, Dorian, Lydian |

### How to use it

1. Run a local Glass Wizard server (or point to a deployed instance):
   ```bash
   git clone https://github.com/Glass-Wizard-Australia-Pty-Ltd/Glass-Wizard-Github
   cd Glass-Wizard-Github
   npm install
   npm run dev   # starts on http://localhost:3000
   ```
2. Open Lyric Live and click the **🎵 Glass Wizard** tab in the sidebar.
3. Enter `http://localhost:3000` (or your deployed URL) in the **API URL** field.
4. Choose a **Style** and **Scale**, then click **✨ Generate AI Music**.
5. The generated track name, tempo, style, and note count are displayed in the panel.
6. Click **Open Glass Wizard Studio ↗** to visit the full studio for XRPL NFT minting.
