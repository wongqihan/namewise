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

        const prompt = `You are an expert linguist and cultural advisor specializing in names from all cultures. Help professionals correctly pronounce and respectfully address people they meet.

Name: ${name}
${contextString ? `\nContext:\n${contextString}` : ''}

Respond in JSON format:
{
    "confidence": "high" | "medium" | "low",
    "sounds_like": "Clear phonetic pronunciation using simple English syllables. Use capital letters for stressed syllables. Example: 'JEAN-pee-AIR' for Jean-Pierre",
    "given_name": "Given/first name(s)",
    "family_name": "Family/surname",
    "formality_warning": "Brief etiquette note if important (e.g., 'Use family name until invited to use given name') - or null",
    "cultural_note": "1-2 helpful sentences: name meaning, common nicknames, or a relevant cultural insight. Be warm but concise."
}

Be conversational and helpful. Focus on practical pronunciation tips and cultural context.`;

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
            sounds_like: rawAnalysis.sounds_like,
            pronunciation: rawAnalysis.sounds_like,
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
