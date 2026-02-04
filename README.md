# NameWise

AI-powered name pronunciation and cultural etiquette guide for LinkedIn.

## Project Structure

```
namewise/
├── docs/           # PRD, design spec, and research documentation
├── extension/      # Chrome extension (Manifest V3)
│   ├── manifest.json
│   ├── popup.html
│   ├── icons/
│   └── src/
│       ├── background.js
│       ├── content.js
│       └── content.css
└── web/            # Next.js backend API
    └── src/
        └── app/
            └── api/
                └── analyze/
                    └── route.ts
```

## Quick Start

### 1. Setup Backend

```bash
cd web
cp .env.example .env
# Add your GEMINI_API_KEY to .env
npm run dev
```

### 2. Load Extension

1. Open Chrome → `chrome://extensions`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select the `extension/` folder

### 3. Test

1. Go to any LinkedIn profile
2. Select a name with your cursor
3. Click the NameWise bubble
4. Hear pronunciation and view cultural tips

## API

`POST /api/analyze`

```json
{
  "name": "Qi Han Wong",
  "context": {
    "location": "Singapore",
    "headline": "Software Engineer"
  }
}
```

Response:
```json
{
  "sounds_like": "Chee Hahn Wong",
  "ipa": "/tʃiː hɑːn wɒŋ/",
  "components": {
    "given_name": "Qi Han",
    "family_name": "Wong",
    "name_order": "western"
  },
  "profile_location": "Singapore",
  "confidence": "high",
  "cultural_note": "Use full 'Qi Han' when addressing. Both words form the given name.",
  "warnings": ["Don't shorten 'Qi Han' to 'Qi' - it's a compound given name"]
}
```

## Documentation

- [PRD](docs/PRD.md) - Product requirements
- [Design Spec](docs/design_spec.md) - UI/UX specifications
- [Edge Cases](docs/edge_cases.md) - 26 global naming patterns
- [QA Strategy](docs/qa_strategy.md) - Quality assurance approach
- [Cultural Sensitivities](docs/cultural_sensitivities.md) - Sensitivity guidelines
