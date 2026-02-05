#!/usr/bin/env node

/**
 * NameWise Audio Test Generator - Comprehensive Suite (5 per category)
 * With retry logic to reduce failures
 */

const fs = require('fs');
const API_URL = 'https://namewise-api-107651002763.asia-southeast1.run.app';
const MAX_RETRIES = 3;

const testCases = [
    // SOUTHERN CHINESE (English TTS)
    { name: 'Wong Qi Han', category: 'Southern Chinese', expectedVoice: 'english', hasEnglishName: false },
    { name: 'Tan Jia Hui', category: 'Southern Chinese', expectedVoice: 'english', hasEnglishName: false },
    { name: 'Lim Cheng Wei', category: 'Southern Chinese', expectedVoice: 'english', hasEnglishName: false },
    { name: 'Ng Kok Leong', category: 'Southern Chinese', expectedVoice: 'english', hasEnglishName: false },
    { name: 'Goh Mei Ling', category: 'Southern Chinese', expectedVoice: 'english', hasEnglishName: false },

    // SOUTHERN CHINESE + ENGLISH NAME
    { name: 'Andy Lim', category: 'Southern Chinese + English Name', expectedVoice: 'english', hasEnglishName: true },
    { name: 'Kevin Tan', category: 'Southern Chinese + English Name', expectedVoice: 'english', hasEnglishName: true },
    { name: 'Michelle Wong', category: 'Southern Chinese + English Name', expectedVoice: 'english', hasEnglishName: true },
    { name: 'David Ng', category: 'Southern Chinese + English Name', expectedVoice: 'english', hasEnglishName: true },
    { name: 'Jenny Chan', category: 'Southern Chinese + English Name', expectedVoice: 'english', hasEnglishName: true },

    // MANDARIN CHINESE (Mandarin TTS)
    { name: 'Wang Qihan', category: 'Mandarin Chinese', expectedVoice: 'mandarin', hasEnglishName: false },
    { name: 'Zhang Wei', category: 'Mandarin Chinese', expectedVoice: 'mandarin', hasEnglishName: false },
    { name: 'Liu Xiang', category: 'Mandarin Chinese', expectedVoice: 'mandarin', hasEnglishName: false },
    { name: 'Chen Xiaoming', category: 'Mandarin Chinese', expectedVoice: 'mandarin', hasEnglishName: false },
    { name: 'Li Na', category: 'Mandarin Chinese', expectedVoice: 'mandarin', hasEnglishName: false },

    // MANDARIN CHINESE + ENGLISH NAME
    { name: 'Thomas Jiang', category: 'Mandarin Chinese + English Name', expectedVoice: 'english', hasEnglishName: true },
    { name: 'David Chen', category: 'Mandarin Chinese + English Name', expectedVoice: 'english', hasEnglishName: true },
    { name: 'Michael Zhang', category: 'Mandarin Chinese + English Name', expectedVoice: 'english', hasEnglishName: true },
    { name: 'Sophie Wang', category: 'Mandarin Chinese + English Name', expectedVoice: 'english', hasEnglishName: true },
    { name: 'Emily Liu', category: 'Mandarin Chinese + English Name', expectedVoice: 'english', hasEnglishName: true },

    // JAPANESE
    { name: 'Kenji Tanaka', category: 'Japanese', expectedVoice: 'japanese', hasEnglishName: false },
    { name: 'Yuki Yamamoto', category: 'Japanese', expectedVoice: 'japanese', hasEnglishName: false },
    { name: 'Sakura Watanabe', category: 'Japanese', expectedVoice: 'japanese', hasEnglishName: false },
    { name: 'Hiroshi Nakamura', category: 'Japanese', expectedVoice: 'japanese', hasEnglishName: false },
    { name: 'Akiko Sato', category: 'Japanese', expectedVoice: 'japanese', hasEnglishName: false },

    // JAPANESE + ENGLISH NAME
    { name: 'Ken Yamamoto', category: 'Japanese + English Name', expectedVoice: 'english', hasEnglishName: true },
    { name: 'Lisa Tanaka', category: 'Japanese + English Name', expectedVoice: 'english', hasEnglishName: true },
    { name: 'Amy Suzuki', category: 'Japanese + English Name', expectedVoice: 'english', hasEnglishName: true },
    { name: 'Ryan Nakamura', category: 'Japanese + English Name', expectedVoice: 'english', hasEnglishName: true },
    { name: 'Sarah Watanabe', category: 'Japanese + English Name', expectedVoice: 'english', hasEnglishName: true },

    // KOREAN
    { name: 'Jiyeon Park', category: 'Korean', expectedVoice: 'korean', hasEnglishName: false },
    { name: 'Seojun Kim', category: 'Korean', expectedVoice: 'korean', hasEnglishName: false },
    { name: 'Minjae Lee', category: 'Korean', expectedVoice: 'korean', hasEnglishName: false },
    { name: 'Eunji Choi', category: 'Korean', expectedVoice: 'korean', hasEnglishName: false },
    { name: 'Hyunwoo Jung', category: 'Korean', expectedVoice: 'korean', hasEnglishName: false },

    // KOREAN + ENGLISH NAME
    { name: 'Justin Kim', category: 'Korean + English Name', expectedVoice: 'english', hasEnglishName: true },
    { name: 'Sarah Park', category: 'Korean + English Name', expectedVoice: 'english', hasEnglishName: true },
    { name: 'Brian Lee', category: 'Korean + English Name', expectedVoice: 'english', hasEnglishName: true },
    { name: 'Grace Choi', category: 'Korean + English Name', expectedVoice: 'english', hasEnglishName: true },
    { name: 'Daniel Kang', category: 'Korean + English Name', expectedVoice: 'english', hasEnglishName: true },

    // VIETNAMESE
    { name: 'Thi-Mai Nguyen', category: 'Vietnamese', expectedVoice: 'vietnamese', hasEnglishName: false },
    { name: 'Phuong Tran', category: 'Vietnamese', expectedVoice: 'vietnamese', hasEnglishName: false },
    { name: 'Duc Le', category: 'Vietnamese', expectedVoice: 'vietnamese', hasEnglishName: false },
    { name: 'Linh Pham', category: 'Vietnamese', expectedVoice: 'vietnamese', hasEnglishName: false },
    { name: 'Minh Hoang', category: 'Vietnamese', expectedVoice: 'vietnamese', hasEnglishName: false },

    // MALAY
    { name: 'Abdullah Bin Ahmad', category: 'Malay', expectedVoice: 'malay', hasEnglishName: false },
    { name: 'Siti Binti Hassan', category: 'Malay', expectedVoice: 'malay', hasEnglishName: false },
    { name: 'Ahmad Bin Ibrahim', category: 'Malay', expectedVoice: 'malay', hasEnglishName: false },
    { name: 'Fatimah Binti Osman', category: 'Malay', expectedVoice: 'malay', hasEnglishName: false },
    { name: 'Mohd Razak Bin Ismail', category: 'Malay', expectedVoice: 'malay', hasEnglishName: false },

    // ARABIC
    { name: 'Fatima Hassan', category: 'Arabic', expectedVoice: 'arabic', hasEnglishName: false },
    { name: 'Ahmed Al-Rashid', category: 'Arabic', expectedVoice: 'arabic', hasEnglishName: false },
    { name: 'Mohammed Al-Fayed', category: 'Arabic', expectedVoice: 'arabic', hasEnglishName: false },
    { name: 'Aisha Khalid', category: 'Arabic', expectedVoice: 'arabic', hasEnglishName: false },
    { name: 'Omar Al-Farouq', category: 'Arabic', expectedVoice: 'arabic', hasEnglishName: false },

    // HINDI
    { name: 'Priya Sharma', category: 'Hindi', expectedVoice: 'hindi', hasEnglishName: false },
    { name: 'Rajesh Patel', category: 'Hindi', expectedVoice: 'hindi', hasEnglishName: false },
    { name: 'Aditya Kumar', category: 'Hindi', expectedVoice: 'hindi', hasEnglishName: false },
    { name: 'Sunita Rao', category: 'Hindi', expectedVoice: 'hindi', hasEnglishName: false },
    { name: 'Vikram Malhotra', category: 'Hindi', expectedVoice: 'hindi', hasEnglishName: false },

    // TAMIL
    { name: 'Lakshmi Venkatesh', category: 'Tamil', expectedVoice: 'tamil', hasEnglishName: false },
    { name: 'Murugan Krishnan', category: 'Tamil', expectedVoice: 'tamil', hasEnglishName: false },
    { name: 'Priya Subramaniam', category: 'Tamil', expectedVoice: 'tamil', hasEnglishName: false },
    { name: 'Arun Ramasamy', category: 'Tamil', expectedVoice: 'tamil', hasEnglishName: false },
    { name: 'Kavitha Selvaraj', category: 'Tamil', expectedVoice: 'tamil', hasEnglishName: false },

    // INDONESIAN
    { name: 'Budi Santoso', category: 'Indonesian', expectedVoice: 'indonesian', hasEnglishName: false },
    { name: 'Siti Rahayu', category: 'Indonesian', expectedVoice: 'indonesian', hasEnglishName: false },
    { name: 'Agus Wijaya', category: 'Indonesian', expectedVoice: 'indonesian', hasEnglishName: false },
    { name: 'Dewi Lestari', category: 'Indonesian', expectedVoice: 'indonesian', hasEnglishName: false },
    { name: 'Rizky Pratama', category: 'Indonesian', expectedVoice: 'indonesian', hasEnglishName: false },

    // THAI
    { name: 'Somchai Sriprasert', category: 'Thai', expectedVoice: 'thai', hasEnglishName: false },
    { name: 'Nattaporn Saetang', category: 'Thai', expectedVoice: 'thai', hasEnglishName: false },
    { name: 'Pichaya Wongsawat', category: 'Thai', expectedVoice: 'thai', hasEnglishName: false },
    { name: 'Kamol Thongchai', category: 'Thai', expectedVoice: 'thai', hasEnglishName: false },
    { name: 'Siriwan Charoensuk', category: 'Thai', expectedVoice: 'thai', hasEnglishName: false },

    // FILIPINO
    { name: 'Maria Santos', category: 'Filipino', expectedVoice: 'filipino', hasEnglishName: false },
    { name: 'Jose Reyes', category: 'Filipino', expectedVoice: 'filipino', hasEnglishName: false },
    { name: 'Ana Cruz', category: 'Filipino', expectedVoice: 'filipino', hasEnglishName: false },
    { name: 'Juan Dela Cruz', category: 'Filipino', expectedVoice: 'filipino', hasEnglishName: false },
    { name: 'Rosa Garcia', category: 'Filipino', expectedVoice: 'filipino', hasEnglishName: false },

    // FRENCH
    { name: 'Jean-Pierre Dubois', category: 'French', expectedVoice: 'french', hasEnglishName: false },
    { name: 'Marie Curie', category: 'French', expectedVoice: 'french', hasEnglishName: false },
    { name: 'François Hollande', category: 'French', expectedVoice: 'french', hasEnglishName: false },
    { name: 'Sophie Marceau', category: 'French', expectedVoice: 'french', hasEnglishName: false },
    { name: 'Pierre Dupont', category: 'French', expectedVoice: 'french', hasEnglishName: false },

    // SPANISH
    { name: 'María García', category: 'Spanish', expectedVoice: 'spanish', hasEnglishName: false },
    { name: 'Carlos Rodriguez', category: 'Spanish', expectedVoice: 'spanish', hasEnglishName: false },
    { name: 'José Martinez', category: 'Spanish', expectedVoice: 'spanish', hasEnglishName: false },
    { name: 'Ana Lopez', category: 'Spanish', expectedVoice: 'spanish', hasEnglishName: false },
    { name: 'Pedro Sanchez', category: 'Spanish', expectedVoice: 'spanish', hasEnglishName: false },

    // ITALIAN
    { name: 'Giuseppe Rossi', category: 'Italian', expectedVoice: 'italian', hasEnglishName: false },
    { name: 'Maria Bianchi', category: 'Italian', expectedVoice: 'italian', hasEnglishName: false },
    { name: 'Giovanni Ferrari', category: 'Italian', expectedVoice: 'italian', hasEnglishName: false },
    { name: 'Francesca Romano', category: 'Italian', expectedVoice: 'italian', hasEnglishName: false },
    { name: 'Marco Colombo', category: 'Italian', expectedVoice: 'italian', hasEnglishName: false },

    // PORTUGUESE
    { name: 'João Silva', category: 'Portuguese', expectedVoice: 'portuguese', hasEnglishName: false },
    { name: 'Ana Santos', category: 'Portuguese', expectedVoice: 'portuguese', hasEnglishName: false },
    { name: 'Pedro Oliveira', category: 'Portuguese', expectedVoice: 'portuguese', hasEnglishName: false },
    { name: 'Maria Costa', category: 'Portuguese', expectedVoice: 'portuguese', hasEnglishName: false },
    { name: 'Carlos Ferreira', category: 'Portuguese', expectedVoice: 'portuguese', hasEnglishName: false },

    // GERMAN
    { name: 'Hans Müller', category: 'German', expectedVoice: 'german', hasEnglishName: false },
    { name: 'Wolfgang Schmidt', category: 'German', expectedVoice: 'german', hasEnglishName: false },
    { name: 'Heidi Bauer', category: 'German', expectedVoice: 'german', hasEnglishName: false },
    { name: 'Klaus Fischer', category: 'German', expectedVoice: 'german', hasEnglishName: false },
    { name: 'Ingrid Weber', category: 'German', expectedVoice: 'german', hasEnglishName: false },

    // DUTCH
    { name: 'Jan van der Berg', category: 'Dutch', expectedVoice: 'dutch', hasEnglishName: false },
    { name: 'Pieter de Vries', category: 'Dutch', expectedVoice: 'dutch', hasEnglishName: false },
    { name: 'Anna Jansen', category: 'Dutch', expectedVoice: 'dutch', hasEnglishName: false },
    { name: 'Willem Bakker', category: 'Dutch', expectedVoice: 'dutch', hasEnglishName: false },
    { name: 'Sophie Visser', category: 'Dutch', expectedVoice: 'dutch', hasEnglishName: false },

    // SWEDISH
    { name: 'Erik Johansson', category: 'Swedish', expectedVoice: 'swedish', hasEnglishName: false },
    { name: 'Anna Andersson', category: 'Swedish', expectedVoice: 'swedish', hasEnglishName: false },
    { name: 'Lars Karlsson', category: 'Swedish', expectedVoice: 'swedish', hasEnglishName: false },
    { name: 'Karin Lindgren', category: 'Swedish', expectedVoice: 'swedish', hasEnglishName: false },
    { name: 'Olof Persson', category: 'Swedish', expectedVoice: 'swedish', hasEnglishName: false },

    // NORWEGIAN
    { name: 'Ole Hansen', category: 'Norwegian', expectedVoice: 'norwegian', hasEnglishName: false },
    { name: 'Ingrid Larsen', category: 'Norwegian', expectedVoice: 'norwegian', hasEnglishName: false },
    { name: 'Erik Olsen', category: 'Norwegian', expectedVoice: 'norwegian', hasEnglishName: false },
    { name: 'Kari Pedersen', category: 'Norwegian', expectedVoice: 'norwegian', hasEnglishName: false },
    { name: 'Thor Nilsen', category: 'Norwegian', expectedVoice: 'norwegian', hasEnglishName: false },

    // DANISH
    { name: 'Søren Nielsen', category: 'Danish', expectedVoice: 'danish', hasEnglishName: false },
    { name: 'Mette Jensen', category: 'Danish', expectedVoice: 'danish', hasEnglishName: false },
    { name: 'Lars Christensen', category: 'Danish', expectedVoice: 'danish', hasEnglishName: false },
    { name: 'Hanne Petersen', category: 'Danish', expectedVoice: 'danish', hasEnglishName: false },
    { name: 'Anders Madsen', category: 'Danish', expectedVoice: 'danish', hasEnglishName: false },

    // FINNISH
    { name: 'Mikko Korhonen', category: 'Finnish', expectedVoice: 'finnish', hasEnglishName: false },
    { name: 'Tuula Virtanen', category: 'Finnish', expectedVoice: 'finnish', hasEnglishName: false },
    { name: 'Jukka Mäkinen', category: 'Finnish', expectedVoice: 'finnish', hasEnglishName: false },
    { name: 'Sari Nieminen', category: 'Finnish', expectedVoice: 'finnish', hasEnglishName: false },
    { name: 'Pekka Heikkinen', category: 'Finnish', expectedVoice: 'finnish', hasEnglishName: false },

    // RUSSIAN
    { name: 'Dmitri Petrov', category: 'Russian', expectedVoice: 'russian', hasEnglishName: false },
    { name: 'Natasha Ivanova', category: 'Russian', expectedVoice: 'russian', hasEnglishName: false },
    { name: 'Vladimir Kozlov', category: 'Russian', expectedVoice: 'russian', hasEnglishName: false },
    { name: 'Olga Sokolova', category: 'Russian', expectedVoice: 'russian', hasEnglishName: false },
    { name: 'Sergei Popov', category: 'Russian', expectedVoice: 'russian', hasEnglishName: false },

    // POLISH
    { name: 'Wojciech Kowalski', category: 'Polish', expectedVoice: 'polish', hasEnglishName: false },
    { name: 'Anna Nowak', category: 'Polish', expectedVoice: 'polish', hasEnglishName: false },
    { name: 'Piotr Wiśniewski', category: 'Polish', expectedVoice: 'polish', hasEnglishName: false },
    { name: 'Katarzyna Wójcik', category: 'Polish', expectedVoice: 'polish', hasEnglishName: false },
    { name: 'Tomasz Lewandowski', category: 'Polish', expectedVoice: 'polish', hasEnglishName: false },

    // GREEK
    { name: 'Nikos Papadopoulos', category: 'Greek', expectedVoice: 'greek', hasEnglishName: false },
    { name: 'Maria Georgiou', category: 'Greek', expectedVoice: 'greek', hasEnglishName: false },
    { name: 'Dimitri Konstantinos', category: 'Greek', expectedVoice: 'greek', hasEnglishName: false },
    { name: 'Elena Antoniadis', category: 'Greek', expectedVoice: 'greek', hasEnglishName: false },
    { name: 'Stavros Nikolaou', category: 'Greek', expectedVoice: 'greek', hasEnglishName: false },

    // HEBREW
    { name: 'Yael Cohen', category: 'Hebrew', expectedVoice: 'hebrew', hasEnglishName: false },
    { name: 'Avi Goldstein', category: 'Hebrew', expectedVoice: 'hebrew', hasEnglishName: false },
    { name: 'Miriam Levy', category: 'Hebrew', expectedVoice: 'hebrew', hasEnglishName: false },
    { name: 'David Friedman', category: 'Hebrew', expectedVoice: 'hebrew', hasEnglishName: false },
    { name: 'Rachel Shapiro', category: 'Hebrew', expectedVoice: 'hebrew', hasEnglishName: false },

    // TURKISH
    { name: 'Mehmet Yilmaz', category: 'Turkish', expectedVoice: 'turkish', hasEnglishName: false },
    { name: 'Ayşe Özdemir', category: 'Turkish', expectedVoice: 'turkish', hasEnglishName: false },
    { name: 'Ahmet Kaya', category: 'Turkish', expectedVoice: 'turkish', hasEnglishName: false },
    { name: 'Fatma Çelik', category: 'Turkish', expectedVoice: 'turkish', hasEnglishName: false },
    { name: 'Mustafa Demir', category: 'Turkish', expectedVoice: 'turkish', hasEnglishName: false },

    // EDGE CASES
    { name: 'Dr. John Smith', category: 'Edge Cases', expectedVoice: 'english', hasEnglishName: true },
    { name: 'Mandy Chi Man LO, PhD', category: 'Edge Cases', expectedVoice: 'english', hasEnglishName: true },
    { name: 'Md Aolad Hossain', category: 'Edge Cases', expectedVoice: 'hindi', hasEnglishName: false },
    { name: 'Sk Abdul Rahman', category: 'Edge Cases', expectedVoice: 'hindi', hasEnglishName: false },
    { name: 'Alex Kim', category: 'Edge Cases', expectedVoice: 'english', hasEnglishName: true },
];

async function sleep(ms) {
    return new Promise(r => setTimeout(r, ms));
}

async function testWithRetry(testCase, retries = MAX_RETRIES) {
    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            const analyzeResponse = await fetch(`${API_URL}/api/analyze`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: testCase.name, context: {} })
            });

            if (!analyzeResponse.ok) {
                if (attempt < retries) { await sleep(1000 * attempt); continue; }
                return { error: `Analyze HTTP ${analyzeResponse.status}` };
            }
            const analysis = await analyzeResponse.json();

            const ttsResponse = await fetch(`${API_URL}/api/tts`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: testCase.name,
                    native_script: analysis.native_script,
                    tts_language: analysis.has_english_name ? 'english' : analysis.tts_language,
                    detected_origin: analysis.detected_origin,
                    cultural_note: analysis.cultural_note
                })
            });

            if (!ttsResponse.ok) {
                if (attempt < retries) { await sleep(1000 * attempt); continue; }
                return { ...analysis, ttsError: `TTS HTTP ${ttsResponse.status}` };
            }
            const ttsData = await ttsResponse.json();

            return { ...analysis, audioBase64: ttsData.audio_base64 };
        } catch (error) {
            if (attempt < retries) { await sleep(1000 * attempt); continue; }
            return { error: error.message };
        }
    }
}

// Relaxed voice matching for similar languages
function isVoiceAcceptable(actualVoice, expectedVoice) {
    const actual = actualVoice?.toLowerCase() || '';
    const expected = expectedVoice?.toLowerCase() || '';

    // Exact match is always OK
    if (actual.includes(expected)) return true;

    // Fuzzy matches for similar languages
    const fuzzyGroups = [
        ['tamil', 'hindi', 'indian'],
        ['filipino', 'spanish', 'tagalog'],
        ['norwegian', 'danish', 'swedish', 'nordic'],
        ['indonesian', 'malay'],
        ['cantonese', 'southern', 'hokkien'],
    ];

    for (const group of fuzzyGroups) {
        if (group.some(v => expected.includes(v)) && group.some(v => actual.includes(v))) {
            return true;
        }
    }

    return false;
}

async function generateHtml() {
    console.log(`🧪 NameWise Audio Test - ${testCases.length} names (with ${MAX_RETRIES}x retry)\n`);

    const results = [];
    for (let i = 0; i < testCases.length; i++) {
        const test = testCases[i];
        const data = await testWithRetry(test);

        const effectiveVoice = data.has_english_name ? 'english' : data.tts_language;
        const voiceMatch = isVoiceAcceptable(effectiveVoice, test.expectedVoice);
        const englishMatch = data.has_english_name === test.hasEnglishName;

        results.push({ test, data, passed: !data.error && !data.ttsError && voiceMatch && englishMatch });
        process.stdout.write(`\rProcessed ${i + 1}/${testCases.length}`);
        await sleep(80);
    }

    const grouped = {};
    results.forEach(r => {
        if (!grouped[r.test.category]) grouped[r.test.category] = [];
        grouped[r.test.category].push(r);
    });

    const passed = results.filter(r => r.passed).length;
    const failed = results.filter(r => !r.passed).length;

    const html = `<!DOCTYPE html>
<html>
<head>
    <title>NameWise Audio Verification</title>
    <meta charset="utf-8">
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; max-width: 1400px; margin: 0 auto; padding: 40px; background: #f5f5f7; color: #1d1d1f; }
        h1 { text-align: center; margin-bottom: 10px; }
        .subtitle { text-align: center; color: #86868b; margin-bottom: 40px; }
        .stats { display: flex; justify-content: center; gap: 20px; margin-bottom: 40px; }
        .stat-card { background: white; padding: 15px 25px; border-radius: 12px; box-shadow: 0 2px 10px rgba(0,0,0,0.05); text-align: center; }
        .stat-val { font-size: 24px; font-weight: 700; display: block; }
        .stat-label { font-size: 14px; color: #86868b; }
        .stat-card.passed .stat-val { color: #34c759; }
        .stat-card.failed .stat-val { color: #ff3b30; }
        
        .section { margin-bottom: 40px; }
        .section-title { font-size: 20px; font-weight: 600; color: #1d1d1f; margin-bottom: 16px; padding-bottom: 8px; border-bottom: 2px solid #0071e3; }
        
        .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px; }
        .card { background: white; border-radius: 16px; padding: 16px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); transition: transform 0.2s; position: relative; overflow: hidden; }
        .card:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.1); }
        .card.failed { border: 2px solid #ff3b30; }
        
        .card-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px; }
        .name { font-size: 16px; font-weight: 600; margin: 0; }
        .status-icon { font-size: 16px; }
        
        .phonetic { font-family: "SF Mono", "Menlo", monospace; font-size: 13px; color: #b45309; background: #fffbe6; padding: 4px 8px; border-radius: 6px; display: inline-block; margin-bottom: 12px; }
        
        .meta-row { display: flex; justify-content: space-between; font-size: 12px; color: #86868b; margin-bottom: 6px; }
        .meta-label { font-weight: 500; }
        .meta-val { color: #1d1d1f; }
        
        .play-btn { width: 100%; border: none; padding: 10px; border-radius: 8px; background: #0071e3; color: white; font-size: 14px; font-weight: 500; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px; margin-top: 12px; transition: background 0.2s; }
        .play-btn:hover { background: #0077ed; }
        .play-btn:active { transform: scale(0.98); }
        .play-btn:disabled { background: #e5e5e7; color: #86868b; cursor: not-allowed; }
        
        .error-msg { color: #ff3b30; font-size: 11px; margin-top: 8px; background: #fff2f2; padding: 6px; border-radius: 4px; word-break: break-all; }
    </style>
</head>
<body>
    <h1>NameWise Audio Verification 🎧</h1>
    <p class="subtitle">Generated on ${new Date().toLocaleString()} • ${testCases.length} test cases</p>
    
    <div class="stats">
        <div class="stat-card passed">
            <span class="stat-val">${passed}</span>
            <span class="stat-label">Passed</span>
        </div>
        <div class="stat-card failed">
            <span class="stat-val">${failed}</span>
            <span class="stat-label">Failed</span>
        </div>
    </div>

    ${Object.entries(grouped).map(([category, items]) => `
    <div class="section">
        <h2 class="section-title">${category}</h2>
        <div class="grid">
            ${items.map(r => renderCard(r)).join('')}
        </div>
    </div>
    `).join('')}

    <script>
        function playAudio(base64) {
            const audio = new Audio("data:audio/mp3;base64," + base64);
            audio.play().catch(e => alert('Playback failed: ' + e.message));
        }
    </script>
</body>
</html>`;

    fs.writeFileSync('audio-test.html', html);
    console.log(`\n\n✅ Generated audio-test.html`);
    console.log(`   ${passed} passed, ${failed} failed`);
}

function renderCard(r) {
    const origin = r.data.detected_origin || 'Unknown';
    const voice = r.data.has_english_name ? 'English (Override)' : (r.data.tts_language || 'Unknown');
    const phonetic = r.data.sounds_like || 'N/A';
    const isError = r.data.error || r.data.ttsError;

    return `
    <div class="card ${r.passed ? '' : 'failed'}">
        <div class="card-header">
            <h3 class="name">${r.test.name}</h3>
            <span class="status-icon">${r.passed ? '✅' : '❌'}</span>
        </div>
        
        <div class="phonetic">${phonetic}</div>
        
        <div class="meta-row">
            <span class="meta-label">Origin</span>
            <span class="meta-val">${origin}</span>
        </div>
        <div class="meta-row">
            <span class="meta-label">Voice</span>
            <span class="meta-val">${voice}</span>
        </div>
        
        ${isError ? `<div class="error-msg">${r.data.error || r.data.ttsError}</div>` : ''}
        
        <button class="play-btn" 
                onclick="playAudio('${r.data.audioBase64 || ''}')" 
                ${!r.data.audioBase64 ? 'disabled' : ''}>
            <span>▶️</span> Play Audio
        </button>
    </div>
    `;
}

generateHtml();
