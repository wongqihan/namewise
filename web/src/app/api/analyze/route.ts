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

        // Use fetch to call Gemini API directly instead of SDK
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            throw new Error('GEMINI_API_KEY not configured');
        }

        const prompt = `You are an expert in names, their origins, and cultural context. Analyze this name and provide helpful information for someone meeting this person professionally.

Name: ${name}
${context ? `Context: ${context}` : ''}

Respond in JSON format with these fields:
{
    "confidence": "high" | "medium" | "low",
    "sounds_like": "phonetic pronunciation guide using simple English sounds (e.g., 'JEAN-pee-AIR' for Jean-Pierre)",
    "given_name": "first/given name(s)",
    "family_name": "surname/family name", 
    "location": "most likely country/region of origin",
    "formality_warning": "brief note if there are important formality rules (e.g., 'Do not use first name until invited')" or null,
    "cultural_note": "one helpful cultural context (e.g., name order conventions, common nicknames)"
}

Be concise. Focus on practical pronunciation help and avoiding cultural missteps.`;

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
        const analysis = {
            confidence: rawAnalysis.confidence,
            sounds_like: rawAnalysis.sounds_like,
            pronunciation: rawAnalysis.sounds_like, // Alias for backward compatibility
            components: {
                given_name: rawAnalysis.given_name,
                family_name: rawAnalysis.family_name,
            },
            profile_location: rawAnalysis.location,
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
