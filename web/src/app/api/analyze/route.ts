import { NextRequest, NextResponse } from 'next/server';

// Force dynamic rendering (skip static generation)
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// CORS headers for Chrome extension
const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
};

export async function OPTIONS() {
    return NextResponse.json({}, { headers: corsHeaders });
}

export async function POST(request: NextRequest) {
    try {
        const { name, context } = await request.json();

        if (!name) {
            return NextResponse.json({ error: 'Name is required' }, { status: 400, headers: corsHeaders });
        }

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            throw new Error('GEMINI_API_KEY not configured');
        }

        // Build context string from LinkedIn data
        const contextParts = [];
        if (context?.location) contextParts.push(`Profile location: ${context.location}`);
        if (context?.headline) contextParts.push(`Professional headline: ${context.headline}`);
        const contextString = contextParts.length > 0 ? contextParts.join('\n') : '';

        const prompt = `You are an expert linguist specializing in name pronunciation across all cultures. Help professionals correctly pronounce names.

Name: ${name}
${contextString ? `\nContext:\n${contextString}` : ''}

PHONETIC RULES BY LANGUAGE (apply based on detected origin):

**Mandarin Chinese (pinyin):**
- "ie" → "yeh" (not "ee"), "iu" → "yo", "ui" → "way", "üe" → "weh"
- "q" → "ch", "x" → "sh", "zh" → "j", "c" → "ts", "z" → "dz"
- Example: Jiequan → "jyeh-CHWAN", Xiaoming → "shyow-MING"

**Japanese:**
- Vowels are pure: a=ah, i=ee, u=oo, e=eh, o=oh
- Double consonants: slight pause. Long vowels: extend sound.
- Example: Kenji → "KEN-jee", Yuki → "YOO-kee"

**Korean:**
- "eo" → "uh", "eu" → "uh" (short), "ae" → "eh", "oe" → "weh"
- Example: Jiyeon → "jee-YUHN", Seojun → "suh-JOON"

**Vietnamese:**
- Tones affect meaning but for English speakers focus on syllables
- "Nguyen" → "nWIN" or "noo-YEN", "Phuong" → "fuhng"

**Arabic:**
- Emphasize guttural sounds in transcription
- Example: Fatima → "FAH-tee-mah", Ahmed → "AH-med"

**Hindi/South Asian:**
- "a" at end is often schwa (uh), retroflex consonants
- Example: Priya → "PREE-yah", Aditya → "ah-DIT-yah"

**European names:** Use standard phonetic approximations.

**CRITICAL for Chinese names - Detect romanization style from SURNAME:**
- Southern Chinese surnames (Hokkien/Cantonese/Hakka/Teochew - SG/MY/HK): Ong, Tan, Lim, Goh, Ng, Teo, Koh, Chua, Wong, Chan, Leung, Lau, Cheung, Ho, Yeo, Wee, Fung, Chow, Yip → tts_language: "english", detected_origin: "Southern Chinese"
- Mandarin Pinyin surnames (Mainland China): Wang, Chen, Lin, Zhang, Liu, Huang, Li, Wu, Yang, Zhou, Xu, Zhao → tts_language: "mandarin", detected_origin: "Mandarin Chinese"
**The SURNAME is the primary indicator.** "Wong" = Southern Chinese (could be Cantonese/Hakka) → English. "Wang" = Pinyin → Mandarin.
If profile location is Singapore, Malaysia, Hong Kong, US, UK, Australia → default to "english" for Chinese names ONLY.

**IMPORTANT for Malay Muslim names:**
- Names with "Bin" or "Binti" (patronymics) are MALAY, not Arabic → tts_language: "malay", detected_origin: "Malay"
- Example: "Abdullah Bin Ahmad" → Malay (not Arabic), tts_language: "malay"
- Do NOT use Arabic script for Malay names. Use romanized form only.

**tts_language rule:** Match the NAME'S origin language, not the person's location.
- Malay name (Abdullah Bin Ahmad) → tts_language: "malay", NO native_script
- Arabic name (Fatima Hassan) in UAE without Bin/Binti → tts_language: "arabic"
- Chinese name (Wong Qi Han) in Singapore → tts_language: "english" (exception for Southern Chinese)

Respond in JSON:
{
    "confidence": "high" | "medium" | "low",
    "detected_origin": "Language/culture of origin (e.g., 'Southern Chinese', 'Arabic', 'Japanese', 'Korean')",
    "tts_language": "Match the name's origin: 'arabic' for Arabic names, 'japanese' for Japanese, etc. Only Southern Chinese uses 'english'.",
    "has_english_name": "true if the name includes an English/Western given name (e.g., Andy, Kevin, Justin), false otherwise",
    "sounds_like": "Phonetic pronunciation. For CJK names without English given name: family-first (WONG chee-HAHN). For CJK with English given name: English-first (AN-dee LOW). Use capitals for stress.",
    "native_script": "Name in native script if applicable (e.g., 杰权邱 for Chinese). Null if already native or unknown.",
    "given_name": "Given/first name(s) - include English name if present",
    "family_name": "Family/surname",
    "formality_warning": "Brief etiquette tip for addressing this person",
    "cultural_note": "1-2 sentences of cultural insight. Do NOT guess or assume specific Chinese characters from romanized names (same pinyin can map to many different characters). Focus on general cultural context, common surname origins, or naming conventions."
}`;

        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }],
                    generationConfig: {
                        responseMimeType: 'application/json',
                    },
                }),
            }
        );

        if (!response.ok) {
            const error = await response.text();
            console.error('Gemini API error:', error);
            throw new Error('Gemini API request failed');
        }

        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

        // Parse the JSON response
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            throw new Error('Invalid response format');
        }

        const rawAnalysis = JSON.parse(jsonMatch[0]);

        // Transform to match expected format for content.js
        // Use actual profile location from context, not Gemini's guess
        const analysis = {
            confidence: rawAnalysis.confidence,
            detected_origin: rawAnalysis.detected_origin,
            tts_language: rawAnalysis.tts_language || 'english', // For smart TTS voice selection
            has_english_name: rawAnalysis.has_english_name === true || rawAnalysis.has_english_name === 'true',
            sounds_like: rawAnalysis.sounds_like,
            pronunciation: rawAnalysis.sounds_like,
            native_script: rawAnalysis.native_script || null, // For TTS to use native characters
            components: {
                given_name: rawAnalysis.given_name,
                family_name: rawAnalysis.family_name,
            },
            profile_location: context?.location || null, // Use actual LinkedIn location
            warnings: rawAnalysis.formality_warning ? [rawAnalysis.formality_warning] : [],
            cultural_note: rawAnalysis.cultural_note,
        };

        return NextResponse.json(analysis, { headers: corsHeaders });

    } catch (error) {
        console.error('Analysis error:', error);
        return NextResponse.json(
            { error: 'Failed to analyze name' },
            { status: 500, headers: corsHeaders }
        );
    }
}
