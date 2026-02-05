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

// Language code mapping
const languageMap: { [key: string]: { code: string; voice: string } } = {
    'chinese': { code: 'cmn-CN', voice: 'cmn-CN-Wavenet-A' },
    'mandarin': { code: 'cmn-CN', voice: 'cmn-CN-Wavenet-A' },
    'cantonese': { code: 'yue-HK', voice: 'yue-HK-Standard-A' },
    'japanese': { code: 'ja-JP', voice: 'ja-JP-Wavenet-A' },
    'korean': { code: 'ko-KR', voice: 'ko-KR-Wavenet-A' },
    'vietnamese': { code: 'vi-VN', voice: 'vi-VN-Wavenet-A' },
    'thai': { code: 'th-TH', voice: 'th-TH-Standard-A' },
    'hindi': { code: 'hi-IN', voice: 'hi-IN-Wavenet-A' },
    'tamil': { code: 'ta-IN', voice: 'ta-IN-Wavenet-A' },
    'arabic': { code: 'ar-XA', voice: 'ar-XA-Wavenet-A' },
    'russian': { code: 'ru-RU', voice: 'ru-RU-Wavenet-A' },
    'spanish': { code: 'es-ES', voice: 'es-ES-Wavenet-B' },
    'french': { code: 'fr-FR', voice: 'fr-FR-Wavenet-A' },
    'german': { code: 'de-DE', voice: 'de-DE-Wavenet-A' },
    'italian': { code: 'it-IT', voice: 'it-IT-Wavenet-A' },
    'portuguese': { code: 'pt-BR', voice: 'pt-BR-Wavenet-A' },
    'dutch': { code: 'nl-NL', voice: 'nl-NL-Wavenet-A' },
    'polish': { code: 'pl-PL', voice: 'pl-PL-Wavenet-A' },
    'turkish': { code: 'tr-TR', voice: 'tr-TR-Wavenet-A' },
    'indonesian': { code: 'id-ID', voice: 'id-ID-Wavenet-A' },
    'malay': { code: 'ms-MY', voice: 'ms-MY-Wavenet-A' },
    'filipino': { code: 'fil-PH', voice: 'fil-PH-Wavenet-A' },
    'greek': { code: 'el-GR', voice: 'el-GR-Wavenet-A' },
    'hebrew': { code: 'he-IL', voice: 'he-IL-Wavenet-A' },
    'swedish': { code: 'sv-SE', voice: 'sv-SE-Wavenet-A' },
    'norwegian': { code: 'nb-NO', voice: 'nb-NO-Wavenet-A' },
    'danish': { code: 'da-DK', voice: 'da-DK-Wavenet-A' },
    'finnish': { code: 'fi-FI', voice: 'fi-FI-Wavenet-A' },
    'default': { code: 'en-US', voice: 'en-US-Wavenet-D' },
};

function detectLanguage(culturalNote: string): { code: string; voice: string } {
    const note = culturalNote.toLowerCase();
    for (const [key, value] of Object.entries(languageMap)) {
        if (note.includes(key)) {
            return value;
        }
    }
    return languageMap['default'];
}

export async function OPTIONS() {
    return NextResponse.json({}, { headers: corsHeaders });
}

export async function POST(request: NextRequest) {
    try {
        const { name, native_script, tts_language, detected_origin, cultural_note } = await request.json();

        if (!name) {
            return NextResponse.json({ error: 'Name is required' }, { status: 400, headers: corsHeaders });
        }

        // Dynamic import to avoid build-time evaluation
        const textToSpeech = await import('@google-cloud/text-to-speech');

        let client;
        if (process.env.GOOGLE_CREDENTIALS_JSON) {
            const credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS_JSON);
            client = new textToSpeech.TextToSpeechClient({ credentials });
        } else {
            client = new textToSpeech.TextToSpeechClient({
                keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
            });
        }

        // Use tts_language (smart selection) > detected_origin > default
        const langSource = tts_language || detected_origin || 'english';
        const langConfig = detectLanguage(langSource);

        // For English TTS, always use romanized name. For CJK, use native script if available.
        const useNativeScript = native_script && langConfig.code !== 'en-US';
        const cleanName = name.replace(/\s*\([^)]*\)/g, '').trim();
        const textToSpeak = useNativeScript ? native_script : cleanName;

        const ttsRequest = {
            input: { text: textToSpeak },
            voice: {
                languageCode: langConfig.code,
                name: langConfig.voice,
            },
            audioConfig: {
                audioEncoding: 'MP3' as const,
                speakingRate: 0.9,
            },
        };

        const [response] = await client.synthesizeSpeech(ttsRequest);

        if (!response.audioContent) {
            throw new Error('No audio content returned');
        }

        const audioBase64 = Buffer.from(response.audioContent as Uint8Array).toString('base64');

        return NextResponse.json({ audio_base64: audioBase64 }, { headers: corsHeaders });

    } catch (error) {
        console.error('TTS error:', error);
        return NextResponse.json(
            { error: 'Failed to generate audio' },
            { status: 500, headers: corsHeaders }
        );
    }
}
