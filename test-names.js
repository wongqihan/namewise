#!/usr/bin/env node

/**
 * NameWise API Test Script - Comprehensive Edition
 * Tests pronunciation analysis and TTS voice selection for various name types
 * 
 * Usage: node test-names.js [--tts]
 * Add --tts flag to also test TTS audio generation
 */

const API_URL = 'https://namewise-api-107651002763.asia-southeast1.run.app';

const testCases = [
    // =====================================================================
    // SOUTHERN CHINESE (English TTS) - Hokkien/Cantonese/Hakka surnames
    // =====================================================================
    { name: 'Wong Qi Han', expectedOrigin: 'Southern Chinese', expectedVoice: 'english', hasEnglishName: false },
    { name: 'Ong Wei Lin', expectedOrigin: 'Southern Chinese', expectedVoice: 'english', hasEnglishName: false },
    { name: 'Tan Jia Hui', expectedOrigin: 'Southern Chinese', expectedVoice: 'english', hasEnglishName: false },
    { name: 'Lim Cheng Wei', expectedOrigin: 'Southern Chinese', expectedVoice: 'english', hasEnglishName: false },
    { name: 'Goh Mei Ling', expectedOrigin: 'Southern Chinese', expectedVoice: 'english', hasEnglishName: false },
    { name: 'Ng Kok Leong', expectedOrigin: 'Southern Chinese', expectedVoice: 'english', hasEnglishName: false },
    { name: 'Teo Boon Kiat', expectedOrigin: 'Southern Chinese', expectedVoice: 'english', hasEnglishName: false },
    { name: 'Chua Siew Ping', expectedOrigin: 'Southern Chinese', expectedVoice: 'english', hasEnglishName: false },
    { name: 'Chan Tai Man', expectedOrigin: 'Southern Chinese', expectedVoice: 'english', hasEnglishName: false },
    { name: 'Leung Ka Fai', expectedOrigin: 'Southern Chinese', expectedVoice: 'english', hasEnglishName: false },
    { name: 'Lau Wing Keung', expectedOrigin: 'Southern Chinese', expectedVoice: 'english', hasEnglishName: false },
    { name: 'Cheung Chi Wai', expectedOrigin: 'Southern Chinese', expectedVoice: 'english', hasEnglishName: false },

    // Southern Chinese WITH English names (should still be English TTS but English word order)
    { name: 'Andy Lim', expectedOrigin: 'Southern Chinese', expectedVoice: 'english', hasEnglishName: true },
    { name: 'Kevin Tan', expectedOrigin: 'Southern Chinese', expectedVoice: 'english', hasEnglishName: true },
    { name: 'Michelle Wong', expectedOrigin: 'Southern Chinese', expectedVoice: 'english', hasEnglishName: true },
    { name: 'David Ng', expectedOrigin: 'Southern Chinese', expectedVoice: 'english', hasEnglishName: true },
    { name: 'Jenny Chan', expectedOrigin: 'Southern Chinese', expectedVoice: 'english', hasEnglishName: true },

    // =====================================================================
    // MAINLAND CHINESE (Mandarin TTS) - Pinyin surnames
    // =====================================================================
    { name: 'Wang Qihan', expectedOrigin: 'Mandarin Chinese', expectedVoice: 'mandarin', hasEnglishName: false },
    { name: 'Zhang Wei', expectedOrigin: 'Mandarin Chinese', expectedVoice: 'mandarin', hasEnglishName: false },
    { name: 'Liu Xiang', expectedOrigin: 'Mandarin Chinese', expectedVoice: 'mandarin', hasEnglishName: false },
    { name: 'Chen Xiaoming', expectedOrigin: 'Mandarin Chinese', expectedVoice: 'mandarin', hasEnglishName: false },
    { name: 'Li Na', expectedOrigin: 'Mandarin Chinese', expectedVoice: 'mandarin', hasEnglishName: false },
    { name: 'Huang Feihong', expectedOrigin: 'Mandarin Chinese', expectedVoice: 'mandarin', hasEnglishName: false },
    { name: 'Wu Lei', expectedOrigin: 'Mandarin Chinese', expectedVoice: 'mandarin', hasEnglishName: false },
    { name: 'Yang Mi', expectedOrigin: 'Mandarin Chinese', expectedVoice: 'mandarin', hasEnglishName: false },
    { name: 'Zhou Jielun', expectedOrigin: 'Mandarin Chinese', expectedVoice: 'mandarin', hasEnglishName: false },
    { name: 'Xu Zhimo', expectedOrigin: 'Mandarin Chinese', expectedVoice: 'mandarin', hasEnglishName: false },

    // Mainland Chinese WITH English names (should switch to English TTS)
    { name: 'Thomas Jiang', expectedOrigin: 'Chinese', expectedVoice: 'english', hasEnglishName: true },
    { name: 'David Chen', expectedOrigin: 'Chinese', expectedVoice: 'english', hasEnglishName: true },
    { name: 'Michael Zhang', expectedOrigin: 'Chinese', expectedVoice: 'english', hasEnglishName: true },
    { name: 'Sophie Wang', expectedOrigin: 'Chinese', expectedVoice: 'english', hasEnglishName: true },
    { name: 'Alan Guo', expectedOrigin: 'Chinese', expectedVoice: 'english', hasEnglishName: true },

    // =====================================================================
    // JAPANESE (Japanese TTS)
    // =====================================================================
    { name: 'Kenji Tanaka', expectedOrigin: 'Japanese', expectedVoice: 'japanese', hasEnglishName: false },
    { name: 'Yuki Yamamoto', expectedOrigin: 'Japanese', expectedVoice: 'japanese', hasEnglishName: false },
    { name: 'Takeshi Suzuki', expectedOrigin: 'Japanese', expectedVoice: 'japanese', hasEnglishName: false },
    { name: 'Sakura Watanabe', expectedOrigin: 'Japanese', expectedVoice: 'japanese', hasEnglishName: false },
    { name: 'Hiroshi Nakamura', expectedOrigin: 'Japanese', expectedVoice: 'japanese', hasEnglishName: false },
    { name: 'Akiko Sato', expectedOrigin: 'Japanese', expectedVoice: 'japanese', hasEnglishName: false },

    // Japanese WITH English names
    { name: 'Ken Yamamoto', expectedOrigin: 'Japanese', expectedVoice: 'english', hasEnglishName: true },
    { name: 'Lisa Tanaka', expectedOrigin: 'Japanese', expectedVoice: 'english', hasEnglishName: true },

    // =====================================================================
    // KOREAN (Korean TTS)
    // =====================================================================
    { name: 'Jiyeon Park', expectedOrigin: 'Korean', expectedVoice: 'korean', hasEnglishName: false },
    { name: 'Seojun Kim', expectedOrigin: 'Korean', expectedVoice: 'korean', hasEnglishName: false },
    { name: 'Minjae Lee', expectedOrigin: 'Korean', expectedVoice: 'korean', hasEnglishName: false },
    { name: 'Eunji Choi', expectedOrigin: 'Korean', expectedVoice: 'korean', hasEnglishName: false },
    { name: 'Hyunwoo Jung', expectedOrigin: 'Korean', expectedVoice: 'korean', hasEnglishName: false },
    { name: 'Sooyoung Kang', expectedOrigin: 'Korean', expectedVoice: 'korean', hasEnglishName: false },

    // Korean WITH English names
    { name: 'Justin Kim', expectedOrigin: 'Korean', expectedVoice: 'english', hasEnglishName: true },
    { name: 'Sarah Park', expectedOrigin: 'Korean', expectedVoice: 'english', hasEnglishName: true },
    { name: 'Brian Lee', expectedOrigin: 'Korean', expectedVoice: 'english', hasEnglishName: true },

    // =====================================================================
    // VIETNAMESE (Vietnamese TTS)
    // =====================================================================
    { name: 'Thi-Mai Nguyen', expectedOrigin: 'Vietnamese', expectedVoice: 'vietnamese', hasEnglishName: false },
    { name: 'Phuong Tran', expectedOrigin: 'Vietnamese', expectedVoice: 'vietnamese', hasEnglishName: false },
    { name: 'Duc Le', expectedOrigin: 'Vietnamese', expectedVoice: 'vietnamese', hasEnglishName: false },
    { name: 'Linh Pham', expectedOrigin: 'Vietnamese', expectedVoice: 'vietnamese', hasEnglishName: false },
    { name: 'Minh Hoang', expectedOrigin: 'Vietnamese', expectedVoice: 'vietnamese', hasEnglishName: false },

    // Vietnamese WITH English names
    { name: 'Tony Nguyen', expectedOrigin: 'Vietnamese', expectedVoice: 'english', hasEnglishName: true },
    { name: 'Linda Tran', expectedOrigin: 'Vietnamese', expectedVoice: 'english', hasEnglishName: true },

    // =====================================================================
    // MALAY (Malay TTS - NOT Arabic!)
    // =====================================================================
    { name: 'Abdullah Bin Ahmad', expectedOrigin: 'Malay', expectedVoice: 'malay', hasEnglishName: false },
    { name: 'Siti Binti Hassan', expectedOrigin: 'Malay', expectedVoice: 'malay', hasEnglishName: false },
    { name: 'Ahmad Bin Ibrahim', expectedOrigin: 'Malay', expectedVoice: 'malay', hasEnglishName: false },
    { name: 'Fatimah Binti Osman', expectedOrigin: 'Malay', expectedVoice: 'malay', hasEnglishName: false },
    { name: 'Mohd Razak Bin Ismail', expectedOrigin: 'Malay', expectedVoice: 'malay', hasEnglishName: false },

    // =====================================================================
    // ARABIC (Arabic TTS)
    // =====================================================================
    { name: 'Fatima Hassan', expectedOrigin: 'Arabic', expectedVoice: 'arabic', hasEnglishName: false },
    { name: 'Ahmed Al-Rashid', expectedOrigin: 'Arabic', expectedVoice: 'arabic', hasEnglishName: false },
    { name: 'Mohammed Al-Fayed', expectedOrigin: 'Arabic', expectedVoice: 'arabic', hasEnglishName: false },
    { name: 'Aisha Khalid', expectedOrigin: 'Arabic', expectedVoice: 'arabic', hasEnglishName: false },
    { name: 'Omar Al-Farouq', expectedOrigin: 'Arabic', expectedVoice: 'arabic', hasEnglishName: false },

    // =====================================================================
    // SOUTH ASIAN - Hindi/Bengali/Tamil
    // =====================================================================
    { name: 'Md Aolad Hossain', expectedOrigin: 'Bengali', expectedVoice: 'hindi', hasEnglishName: false },
    { name: 'Priya Sharma', expectedOrigin: 'Hindi', expectedVoice: 'hindi', hasEnglishName: false },
    { name: 'Rajesh Krishnamurthy', expectedOrigin: 'Indian', expectedVoice: 'hindi', hasEnglishName: false },
    { name: 'Aditya Patel', expectedOrigin: 'Indian', expectedVoice: 'hindi', hasEnglishName: false },
    { name: 'Sunita Rao', expectedOrigin: 'Indian', expectedVoice: 'hindi', hasEnglishName: false },
    { name: 'Mohd Razak', expectedOrigin: 'Malay', expectedVoice: 'malay', hasEnglishName: false }, // Mohd without Bin could be ambiguous
    { name: 'Sk Abdul Rahman', expectedOrigin: 'Bengali', expectedVoice: 'hindi', hasEnglishName: false },

    // =====================================================================
    // EUROPEAN - French
    // =====================================================================
    { name: 'Jean-Pierre Dubois', expectedOrigin: 'French', expectedVoice: 'french', hasEnglishName: false },
    { name: 'Marie Curie', expectedOrigin: 'French', expectedVoice: 'french', hasEnglishName: false },
    { name: 'François Hollande', expectedOrigin: 'French', expectedVoice: 'french', hasEnglishName: false },

    // =====================================================================
    // EUROPEAN - Spanish
    // =====================================================================
    { name: 'María García', expectedOrigin: 'Spanish', expectedVoice: 'spanish', hasEnglishName: false },
    { name: 'Carlos Rodriguez', expectedOrigin: 'Spanish', expectedVoice: 'spanish', hasEnglishName: false },
    { name: 'José Martinez', expectedOrigin: 'Spanish', expectedVoice: 'spanish', hasEnglishName: false },

    // =====================================================================
    // EUROPEAN - German
    // =====================================================================
    { name: 'Hans Müller', expectedOrigin: 'German', expectedVoice: 'german', hasEnglishName: false },
    { name: 'Wolfgang Schmidt', expectedOrigin: 'German', expectedVoice: 'german', hasEnglishName: false },
    { name: 'Heidi Bauer', expectedOrigin: 'German', expectedVoice: 'german', hasEnglishName: false },

    // =====================================================================
    // EUROPEAN - Italian
    // =====================================================================
    { name: 'Giuseppe Rossi', expectedOrigin: 'Italian', expectedVoice: 'italian', hasEnglishName: false },
    { name: 'Maria Bianchi', expectedOrigin: 'Italian', expectedVoice: 'italian', hasEnglishName: false },
    { name: 'Giovanni Ferrari', expectedOrigin: 'Italian', expectedVoice: 'italian', hasEnglishName: false },

    // =====================================================================
    // EUROPEAN - Russian
    // =====================================================================
    { name: 'Dmitri Petrov', expectedOrigin: 'Russian', expectedVoice: 'russian', hasEnglishName: false },
    { name: 'Natasha Ivanova', expectedOrigin: 'Russian', expectedVoice: 'russian', hasEnglishName: false },
    { name: 'Vladimir Kozlov', expectedOrigin: 'Russian', expectedVoice: 'russian', hasEnglishName: false },

    // =====================================================================
    // EUROPEAN - Portuguese
    // =====================================================================
    { name: 'João Silva', expectedOrigin: 'Portuguese', expectedVoice: 'portuguese', hasEnglishName: false },
    { name: 'Ana Santos', expectedOrigin: 'Portuguese', expectedVoice: 'portuguese', hasEnglishName: false },

    // =====================================================================
    // EUROPEAN - Dutch
    // =====================================================================
    { name: 'Jan van der Berg', expectedOrigin: 'Dutch', expectedVoice: 'dutch', hasEnglishName: false },
    { name: 'Pieter de Vries', expectedOrigin: 'Dutch', expectedVoice: 'dutch', hasEnglishName: false },

    // =====================================================================
    // EUROPEAN - Polish
    // =====================================================================
    { name: 'Wojciech Kowalski', expectedOrigin: 'Polish', expectedVoice: 'polish', hasEnglishName: false },
    { name: 'Anna Nowak', expectedOrigin: 'Polish', expectedVoice: 'polish', hasEnglishName: false },

    // =====================================================================
    // EUROPEAN - Greek
    // =====================================================================
    { name: 'Nikos Papadopoulos', expectedOrigin: 'Greek', expectedVoice: 'greek', hasEnglishName: false },
    { name: 'Maria Georgiou', expectedOrigin: 'Greek', expectedVoice: 'greek', hasEnglishName: false },

    // =====================================================================
    // NORDIC - Swedish
    // =====================================================================
    { name: 'Erik Johansson', expectedOrigin: 'Swedish', expectedVoice: 'swedish', hasEnglishName: false },
    { name: 'Anna Andersson', expectedOrigin: 'Swedish', expectedVoice: 'swedish', hasEnglishName: false },

    // =====================================================================
    // NORDIC - Norwegian
    // =====================================================================
    { name: 'Ole Hansen', expectedOrigin: 'Norwegian', expectedVoice: 'norwegian', hasEnglishName: false },

    // =====================================================================
    // NORDIC - Danish
    // =====================================================================
    { name: 'Søren Nielsen', expectedOrigin: 'Danish', expectedVoice: 'danish', hasEnglishName: false },

    // =====================================================================
    // MIDDLE EASTERN - Hebrew
    // =====================================================================
    { name: 'Yael Cohen', expectedOrigin: 'Hebrew', expectedVoice: 'hebrew', hasEnglishName: false },
    { name: 'Avi Goldstein', expectedOrigin: 'Hebrew', expectedVoice: 'hebrew', hasEnglishName: false },

    // =====================================================================
    // MIDDLE EASTERN - Turkish
    // =====================================================================
    { name: 'Mehmet Yilmaz', expectedOrigin: 'Turkish', expectedVoice: 'turkish', hasEnglishName: false },
    { name: 'Ayşe Özdemir', expectedOrigin: 'Turkish', expectedVoice: 'turkish', hasEnglishName: false },

    // =====================================================================
    // SOUTHEAST ASIAN - Indonesian
    // =====================================================================
    { name: 'Budi Santoso', expectedOrigin: 'Indonesian', expectedVoice: 'indonesian', hasEnglishName: false },
    { name: 'Siti Rahayu', expectedOrigin: 'Indonesian', expectedVoice: 'indonesian', hasEnglishName: false },

    // =====================================================================
    // SOUTHEAST ASIAN - Filipino
    // =====================================================================
    { name: 'Maria Santos', expectedOrigin: 'Filipino', expectedVoice: 'filipino', hasEnglishName: false },
    { name: 'Jose Reyes', expectedOrigin: 'Filipino', expectedVoice: 'filipino', hasEnglishName: false },

    // =====================================================================
    // SOUTHEAST ASIAN - Thai
    // =====================================================================
    { name: 'Somchai Sriprasert', expectedOrigin: 'Thai', expectedVoice: 'thai', hasEnglishName: false },

    // =====================================================================
    // EDGE CASES - Titles and suffixes
    // =====================================================================
    { name: 'Dr. John Smith', expectedOrigin: 'English', expectedVoice: 'english', hasEnglishName: true },
    { name: 'Mandy Chi Man LO, PhD', expectedOrigin: 'Southern Chinese', expectedVoice: 'english', hasEnglishName: true },

    // =====================================================================
    // EDGE CASES - Ambiguous names
    // =====================================================================
    { name: 'Alex Kim', expectedOrigin: 'Korean', expectedVoice: 'english', hasEnglishName: true },
    { name: 'Sam Lee', expectedOrigin: 'Korean', expectedVoice: 'english', hasEnglishName: true },
];

async function testAnalyze(name) {
    try {
        const response = await fetch(`${API_URL}/api/analyze`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, context: {} })
        });

        if (!response.ok) {
            return { error: `HTTP ${response.status}` };
        }

        return await response.json();
    } catch (error) {
        return { error: error.message };
    }
}

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function runTests() {
    console.log('🧪 NameWise API Test Script - Comprehensive Edition\n');
    console.log('='.repeat(120));
    console.log(`${'Name'.padEnd(30)} | ${'Check'} | ${'Origin'.padEnd(20)} | ${'Voice'.padEnd(12)} | ${'Eng?'} | Phonetic`);
    console.log('='.repeat(120));

    let passed = 0;
    let failed = 0;
    const failures = [];

    for (const test of testCases) {
        const result = await testAnalyze(test.name);

        if (result.error) {
            console.log(`${test.name.padEnd(30)} | ❌❌❌ | ERROR: ${result.error}`);
            failed++;
            failures.push({ name: test.name, reason: result.error });
            await delay(100);
            continue;
        }

        // Check origin contains expected
        const originMatch = result.detected_origin?.toLowerCase().includes(test.expectedOrigin.toLowerCase());

        // Check TTS language - if has_english_name, expect english
        const effectiveVoice = result.has_english_name ? 'english' : result.tts_language;
        const voiceMatch = effectiveVoice?.toLowerCase().includes(test.expectedVoice.toLowerCase());

        // Check has_english_name
        const englishNameMatch = result.has_english_name === test.hasEnglishName;

        const checks = [
            originMatch ? '✅' : '❌',
            voiceMatch ? '✅' : '❌',
            englishNameMatch ? '✅' : '❌'
        ].join('');

        const allPassed = originMatch && voiceMatch && englishNameMatch;

        const phonetic = (result.sounds_like || '').substring(0, 30);

        console.log(`${test.name.padEnd(30)} | ${checks} | ${(result.detected_origin || 'N/A').padEnd(20)} | ${(result.tts_language || 'N/A').padEnd(12)} | ${result.has_english_name ? 'Y' : 'N'.padEnd(4)} | ${phonetic}`);

        if (allPassed) {
            passed++;
        } else {
            failed++;
            failures.push({
                name: test.name,
                expected: `${test.expectedOrigin}/${test.expectedVoice}/eng:${test.hasEnglishName}`,
                got: `${result.detected_origin}/${result.tts_language}/eng:${result.has_english_name}`
            });
        }

        // Small delay to avoid rate limiting
        await delay(100);
    }

    console.log('='.repeat(120));
    console.log(`\n📊 Results: ${passed} passed, ${failed} failed out of ${testCases.length} tests\n`);

    if (failures.length > 0) {
        console.log('❌ FAILURES:');
        failures.forEach(f => {
            if (f.reason) {
                console.log(`  - ${f.name}: ${f.reason}`);
            } else {
                console.log(`  - ${f.name}: Expected ${f.expected}, Got ${f.got}`);
            }
        });
        console.log('');
    }

    if (failed > 0) {
        process.exit(1);
    } else {
        console.log('✅ All tests passed!\n');
    }
}

runTests();
