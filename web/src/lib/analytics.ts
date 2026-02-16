// Lightweight Supabase analytics logger for NameWise
// Logs usage data async (fire-and-forget) so it never blocks API responses

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://uaqytphsufutdsmhrskf.supabase.co';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || '';

interface AnalyticsEvent {
    source: 'extension' | 'webapp' | 'unknown';
    detected_origin: string | null;
    confidence: string | null;
    ip_hash: string;
}

async function hashString(input: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(input);
    const hash = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(hash))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('')
        .slice(0, 16); // First 16 chars is enough for uniqueness
}

export async function logAnalysis(event: AnalyticsEvent): Promise<void> {
    if (!SUPABASE_ANON_KEY) {
        console.warn('[Analytics] SUPABASE_ANON_KEY not set, skipping');
        return;
    }

    try {
        await fetch(`${SUPABASE_URL}/rest/v1/namewise_analytics`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'apikey': SUPABASE_ANON_KEY,
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                'Prefer': 'return=minimal',
            },
            body: JSON.stringify({
                source: event.source,
                detected_origin: event.detected_origin,
                confidence: event.confidence,
                ip_hash: event.ip_hash,
            }),
        });
    } catch (error) {
        // Never throw — analytics should never break the main flow
        console.error('[Analytics] Failed to log:', error);
    }
}

export { hashString };
