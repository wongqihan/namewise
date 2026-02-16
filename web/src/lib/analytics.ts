// Lightweight Supabase analytics logger for NameWise
// Logs usage data async (fire-and-forget) so it never blocks API responses

const SUPABASE_URL = 'https://uaqytphsufutdsmhrskf.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVhcXl0cGhzdWZ1dGRzbWhyc2tmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYyOTg1NTEsImV4cCI6MjA4MTg3NDU1MX0.BNR3CnJCk1TybI0DBvZYZlIXP05OeapFwx7RqKbcqkE';

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
