import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

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

        const response = await genAI.models.generateContent({
            model: 'gemini-2.0-flash',
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
            },
        });

        const text = response.text || '';

        // Parse the JSON response
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            throw new Error('Invalid response format');
        }

        const analysis = JSON.parse(jsonMatch[0]);
        return NextResponse.json(analysis, { headers: corsHeaders });

    } catch (error) {
        console.error('Analysis error:', error);
        return NextResponse.json(
            { error: 'Failed to analyze name' },
            { status: 500, headers: corsHeaders }
        );
    }
}
