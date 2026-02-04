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
        if (context?.company) contextParts.push(`Current company: ${context.company}`);
        const contextString = contextParts.length > 0 ? contextParts.join('\n') : '';

        const prompt = `You are an expert linguist and cultural advisor specializing in names from all cultures around the world. Your goal is to help professionals correctly pronounce and respectfully address people they meet.

Analyze this name and provide comprehensive, helpful information:

Name: ${name}
${contextString ? `\nContext from their LinkedIn profile:\n${contextString}` : ''}

Respond in JSON format with these fields:
{
    "confidence": "high" | "medium" | "low" - how confident you are in this analysis,
    "sounds_like": "A clear phonetic pronunciation guide using simple English syllables. Make it intuitive for English speakers. For example: 'JEAN-pee-AIR' for Jean-Pierre, 'CHEE HAHN WONG' for Qi Han Wong. Use capital letters for stressed syllables.",
    "given_name": "The person's given/first name(s)",
    "family_name": "The person's family/surname",
    "formality_warning": "Important formality or etiquette notes, e.g., 'In Japanese business culture, always use family name + san until invited to use given name' or 'In Chinese culture, the family name comes first' - or null if none",
    "cultural_note": "A warm, informative cultural note about this name. Include interesting details like: common nicknames, famous people with this name, meaning of the name, regional variations, or fun conversation starters. Make it feel personal and helpful, not clinical. 2-3 sentences that would help someone connect with this person."
}

Guidelines:
- Be warm and conversational in the cultural_note, like a helpful colleague sharing insight
- Include specific, actionable pronunciation tips
- If the name has a meaning, share it!
- Mention any common nicknames or variations they might go by
- If there's a famous namesake, mention it as a memory aid
- Consider the context (their location, company) when relevant`;

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
