# NameWise Pronunciation Rules

> **Last Updated:** February 2026  
> **Purpose:** Comprehensive documentation of all pronunciation, TTS, and name handling rules implemented in NameWise.

---

## Architecture Overview

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   Extension     │ --> │   Analyze API    │ --> │     TTS API     │
│   (content.js)  │     │   (Gemini)       │     │  (Google Cloud) │
└─────────────────┘     └──────────────────┘     └─────────────────┘
                               │                         │
                               ▼                         ▼
                        Returns:                  Uses:
                        - detected_origin         - tts_language
                        - tts_language            - native_script
                        - sounds_like             - name (reordered)
                        - native_script
                        - components
```

---

## 1. Language Detection & Voice Selection

### TTS Language Priority
```
tts_language (from Gemini) > detected_origin > "english" (fallback)
```

### Supported Languages (26)

| Language | Code | Voice | Family First? |
|----------|------|-------|---------------|
| English (default) | en-US | en-US-Wavenet-D | ❌ |
| Mandarin Chinese | cmn-CN | cmn-CN-Wavenet-A | ✅ |
| Japanese | ja-JP | ja-JP-Wavenet-A | ✅ |
| Korean | ko-KR | ko-KR-Wavenet-A | ✅ |
| Vietnamese | vi-VN | vi-VN-Wavenet-A | ✅ |
| Thai | th-TH | th-TH-Standard-A | ❌ |
| Hindi | hi-IN | hi-IN-Wavenet-A | ❌ |
| Tamil | ta-IN | ta-IN-Wavenet-A | ❌ |
| Arabic | ar-XA | ar-XA-Wavenet-A | ❌ |
| Hebrew | he-IL | he-IL-Wavenet-A | ❌ |
| Russian | ru-RU | ru-RU-Wavenet-A | ❌ |
| Spanish | es-ES | es-ES-Wavenet-B | ❌ |
| French | fr-FR | fr-FR-Wavenet-A | ❌ |
| German | de-DE | de-DE-Wavenet-A | ❌ |
| Italian | it-IT | it-IT-Wavenet-A | ❌ |
| Portuguese | pt-BR | pt-BR-Wavenet-A | ❌ |
| Dutch | nl-NL | nl-NL-Wavenet-A | ❌ |
| Polish | pl-PL | pl-PL-Wavenet-A | ❌ |
| Turkish | tr-TR | tr-TR-Wavenet-A | ❌ |
| Indonesian | id-ID | id-ID-Wavenet-A | ❌ |
| Malay | ms-MY | ms-MY-Wavenet-A | ❌ |
| Filipino | fil-PH | fil-PH-Wavenet-A | ❌ |
| Greek | el-GR | el-GR-Wavenet-A | ❌ |
| Swedish | sv-SE | sv-SE-Wavenet-A | ❌ |
| Norwegian | nb-NO | nb-NO-Wavenet-A | ❌ |
| Danish | da-DK | da-DK-Wavenet-A | ❌ |
| Finnish | fi-FI | fi-FI-Wavenet-A | ❌ |

---

## 2. Chinese Name Handling (Complex)

### Romanization Detection

Chinese names use different romanization systems based on region:

| Region | System | Example Surnames | TTS Voice |
|--------|--------|------------------|-----------|
| **Mainland China** | Pinyin | Wang, Chen, Zhang, Liu, Huang | Mandarin 🇨🇳 |
| **Singapore/Malaysia** | Hokkien | Ong, Tan, Lim, Goh, Ng, Teo, Koh, Chua, Tay, Heng | English 🇬🇧 |
| **Hong Kong** | Cantonese | Wong, Chan, Leung, Lau, Cheung, Tam | English 🇬🇧 |
| **Taiwan** | Wade-Giles | - | Context-dependent |

### Decision Logic

```javascript
if (romanization is Hokkien/Cantonese) {
  tts_language = "english";  // SG/MY/HK pronunciation
  use_native_script = false;
} else if (romanization is Pinyin) {
  tts_language = "mandarin";  // China pronunciation
  use_native_script = true;   // Use 汉字
}
```

### Location Override

If profile location is Singapore, Malaysia, Hong Kong, US, UK, or Australia:
→ Default to English voice for Chinese names.

---

## 3. Name Order Rules

### Family-First Cultures
- Chinese (all variants)
- Japanese
- Korean
- Vietnamese
- Hungarian

### Implementation

```javascript
// UI Display
if (isFamilyFirst(detected_origin)) {
  display: "Family: Wong | Given: Qi Han"
} else {
  display: "Given: John | Family: Smith"
}

// TTS Text
if (isFamilyFirst(detected_origin)) {
  ttsName = `${family_name} ${given_name}`;  // "Wong Qi Han"
} else {
  ttsName = selectedText;  // Original order
}
```

---

## 4. Phonetic Transcription Rules

### Mandarin Chinese (Pinyin)
| Pinyin | Sounds Like |
|--------|-------------|
| ie | yeh (not "ee") |
| iu | yo |
| ui | way |
| üe | weh |
| q | ch |
| x | sh |
| zh | j |
| c | ts |
| z | dz |

**Example:** Jiequan → "jyeh-CHWAN"

### Japanese
Pure vowels:
- a = ah
- i = ee
- u = oo
- e = eh
- o = oh

Double consonants: slight pause  
Long vowels: extend sound

**Example:** Kenji → "KEN-jee"

### Korean
| Romanization | Sounds Like |
|--------------|-------------|
| eo | uh |
| eu | uh (short) |
| ae | eh |
| oe | weh |

**Example:** Jiyeon → "jee-YUHN"

### Vietnamese
Focus on syllables (tones less critical for English speakers)

**Examples:**
- Nguyen → "nWIN" or "noo-YEN"
- Phuong → "fuhng"

### Arabic
Emphasize guttural sounds

**Examples:**
- Fatima → "FAH-tee-mah"
- Ahmed → "AH-med"

### Hindi/South Asian
- Final "a" often schwa (uh)
- Retroflex consonants

**Examples:**
- Priya → "PREE-yah"
- Aditya → "ah-DIT-yah"

---

## 5. Text Processing for TTS

### Abbreviation Expansion

| Abbreviation | Expanded To | Common In |
|--------------|-------------|-----------|
| Md | Muhammad | Bangladesh, South Asia |
| Mohd | Mohammad | Malaysia, Middle East |
| Sk | Sheikh | South Asia |
| Dr | Doctor | Universal |

```javascript
name.replace(/\bMd\b\.?/gi, 'Muhammad')
    .replace(/\bMohd\b\.?/gi, 'Mohammad')
    .replace(/\bSk\b\.?/gi, 'Sheikh')
    .replace(/\bDr\b\.?/gi, 'Doctor')
```

### Native Script Usage

| Language | Use Native Script? | Condition |
|----------|-------------------|-----------|
| Mandarin | ✅ Yes | Only for Mainland China Pinyin |
| Japanese | ✅ Yes | When available |
| Korean | ✅ Yes | When available |
| Vietnamese | ❌ No | Already Latin-based |
| Others | ❌ No | Use romanized |

```javascript
const useNativeScript = native_script && langConfig.code !== 'en-US';
```

---

## 6. Lessons Learned

### What We'd Do Differently

1. **Define the pronunciation matrix upfront**
   - Create comprehensive language/voice/order/script decision table before coding
   
2. **Separate concerns from the start**
   - `display_phonetic` (for humans)
   - `tts_text` (what voice says)
   - `tts_language_code` (which voice)
   
3. **Test with diverse names first**
   - Create test suite of 15+ names covering all language groups
   
4. **Centralize language rules**
   - Single config file for all language logic
   
5. **Consider SSML**
   - Speech Synthesis Markup Language for fine-grained control

### Key Insight

> Pronunciation is far more complex than "just call TTS". Cultural context, romanization systems, diaspora variations, and name order all significantly impact accuracy.

---

## 7. Test Cases

Use these names to verify the system:

| Name | Expected Origin | Expected Voice | Expected Order |
|------|-----------------|----------------|----------------|
| Jiequan Qiu | Mandarin Chinese | Mandarin | QIU jyeh-CHWAN |
| Andy Wang | Singaporean Chinese | English | WANG |
| Ong Qi Han | Singaporean Chinese | English | ONG chee-HAHN |
| Wang Qihan | Mandarin Chinese | Mandarin | 王其涵 |
| Kenji Tanaka | Japanese | Japanese | TANAKA KEN-jee |
| Jiyeon Park | Korean | Korean | PARK jee-YUHN |
| Thi-Mai Nguyen | Vietnamese | Vietnamese | NGUYEN tee-MY |
| Md Aolad Hossain | Bengali | Hindi | Muhammad... |
| Ahmed Al-Rashid | Arabic | Arabic | AH-med... |
| Jean-Pierre Dubois | French | French | zhon pee-AIR... |
