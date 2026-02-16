import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Allowed origins — only your webapp and Chrome extensions
const ALLOWED_ORIGINS = [
    'https://namewise-api-107651002763.asia-southeast1.run.app',
    'http://localhost:3000',
    'http://127.0.0.1:3000',
];

function isAllowedOrigin(origin: string | null): boolean {
    if (!origin) return true; // Same-origin requests have no Origin header
    if (origin.startsWith('chrome-extension://')) return true;
    return ALLOWED_ORIGINS.includes(origin);
}

export function middleware(request: NextRequest) {
    const origin = request.headers.get('origin');
    const allowed = isAllowedOrigin(origin);

    // Block disallowed origins
    if (!allowed) {
        return new NextResponse(JSON.stringify({ error: 'Forbidden' }), {
            status: 403,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    const allowOrigin = origin || '*';

    // Handle preflight requests
    if (request.method === 'OPTIONS') {
        return new NextResponse(null, {
            status: 200,
            headers: {
                'Access-Control-Allow-Origin': allowOrigin,
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400',
            },
        });
    }

    // Add CORS headers to response
    const response = NextResponse.next();
    response.headers.set('Access-Control-Allow-Origin', allowOrigin);
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type');

    return response;
}

export const config = {
    matcher: '/api/:path*',
};
