// NameWise Background Service Worker
const API_BASE_URL = 'https://namewise-api-107651002763.asia-southeast1.run.app/api';

// Listen for messages from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === 'ANALYZE_NAME') {
        analyzeName(request.name, request.context)
            .then(result => sendResponse({ success: true, data: result }))
            .catch(error => sendResponse({ success: false, error: error.message }));
        return true; // Keep message channel open for async response
    }

    if (request.type === 'FETCH_TTS') {
        // Use timeout to avoid service worker dying
        fetchTTSWithTimeout(request.name, request.native_script, request.ipa, request.tts_language, request.detected_origin, request.sounds_like, request.cultural_note, 25000)
            .then(result => sendResponse({ success: true, audio_base64: result.audio_base64 }))
            .catch(error => {
                console.error('[NameWise] TTS fetch error:', error.message);
                sendResponse({ success: false, error: error.message });
            });
        return true;
    }
});

async function analyzeName(name, context) {
    const response = await fetch(`${API_BASE_URL}/analyze`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, context }),
    });

    if (!response.ok) {
        throw new Error('Failed to analyze name');
    }

    return response.json();
}

async function fetchTTSWithTimeout(name, native_script, ipa, tts_language, detected_origin, sounds_like, cultural_note, timeoutMs) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
        const response = await fetch(`${API_BASE_URL}/tts`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name, native_script, ipa, tts_language, detected_origin, sounds_like, cultural_note }),
            signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            throw new Error('Failed to generate TTS');
        }

        return response.json();
    } catch (error) {
        clearTimeout(timeoutId);
        if (error.name === 'AbortError') {
            throw new Error('TTS request timed out');
        }
        throw error;
    }
}
