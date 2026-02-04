# Implementation Plan - NameWise

NameWise is a browser extension that helps users pronounce non-Anglo names correctly using on-screen context and the Gemini 3 API.

## User Review Required
> [!IMPORTANT]
> **Gemini 3 Models**: Utilizing `gemini-3-flash-preview` for low-latency audio generation and context analysis.
> **Backend Requirement**: The extension will require a companion Next.js backend to handle API requests securely (hiding the API key) and to process audio. We will deploy this to Vercel (or similar) or run locally for the prototype.

## Proposed Changes

### Directory Structure
We will create a new project directory: `/Users/wongqihan/Antigravity/Projects/namewise` containing:
- `/extension`: The Chrome Extension (Manifest V3, React for Popup, Vanilla JS for Content Script).
- `/web`: The Next.js backend for API proxying and marketing page.

### Component: Backend (Next.js)
**Location**: `/web`
- **Route**: `/api/pronounce`
    - **Method**: POST
    - **Body**: `{ name: string, context: string, targetLanguage?: string }`
    - **Logic**:
        1.  Construct a prompt for `gemini-3-flash-preview`.
        2.  **Enhanced Prompt** (see [edge_cases.md](file:///Users/wongqihan/.gemini/antigravity/brain/e1b517ac-fb81-43bc-85f8-3ed050999956/edge_cases.md) for full context):
            ```
            Analyze the name '{name}' with context '{context}' (location, company, bio).
            
            CRITICAL RULES:
            1. Detect LINGUISTIC PATTERNS (Chinese, Arabic, Russian, etc.), NOT nationalities
            2. Use profile location as CONTEXT ONLY (e.g., "Common in Singapore" not "Singaporean")
            3. NEVER claim nationality/ethnicity (location ≠ nationality)
            4. East Asian Name Order: Use location to infer name order convention
            5. Compound Names: Chinese two-character given names (e.g., 'Qi Han') are ONE name
            6. Vietnamese: Always address by given name (last word), never family name
            7. Icelandic: Patronymics are NOT surnames. Use given name only
            8. Hispanic: Detect dual surnames (paternal + maternal)
            
            Return analysis with confidence level. If ambiguous, provide interpretations.
            ```
        3.  Return JSON: `{
                ipa: string,
                sounds_like: string,
                audio_base64: string,
                pattern_detected: string,  // "Chinese naming pattern" not "Chinese person"
                profile_location: string,   // "Singapore" (factual from profile)
                confidence: 'high' | 'medium' | 'low',
                components: { 
                    given_name: string, 
                    family_name: string,
                    name_order: 'western' | 'traditional' | 'ambiguous'
                },
                short_name_suggestion?: string,
                cultural_note: string,      // Regional convention, not nationality claim
                warnings?: string[]  // e.g., "Don't shorten 'Qi Han' to 'Qi'"
            }`.

### Component: Browser Extension
**Location**: `/extension`
- **Manifest V3**: Permissions `activeTab`, `contextMenus`, `storage`.
- **Background Script**:
    - Listen for `contextMenus` click ("NameWise: Pronounce").
    - Capture selected text (`name`).
    - Capture surrounding paragraph or page title (`context`).
    - Call Backend API.
    - Play audio directly or open a small popup.
- **Content Script**:
    - Optional: For specific sites (LinkedIn), inject a small "Speaker" icon next to profile names if feasible (harder to make robust).
    - **MVP Approach**: "Select text & Right Click" or "Select text & Floating Button". We will implement the **Floating Button** on selection as it's more discoverable.
- **Popup UI** (React):
    - Settings: "Auto-play audio", "Preferred Voice".
    - History: List of recently pronounced names.

## Verification Plan

### Automated Tests
- **Backend API Test**:
    - Create a test script `test_api.sh` to curl the local `/api/pronounce` endpoint with a mocked request (e.g., `{ name: "Siobhan", context: "Irish female name" }`).
    - Verify response contains `audio_base64` and correct `sounds_like` ("Shiv-awn").

### Manual Verification
1.  **Backend Setup**:
    - Run `npm run dev` in `/web`.
    - Verify `http://localhost:3000/api/pronounce` is accessible.
2.  **Extension Load**:
    - Load "Unpacked Extension" in Chrome.
3.  **End-to-End Test**:
    - Go to a Wikipedia page with a foreign name (e.g., "Saoirse Ronan").
    - Select "Saoirse".
    - Click the NameWise floating button.
    - **Expected**: A small tooltip appears showing "SEER-sha" (Irish) and audio plays automatically.
