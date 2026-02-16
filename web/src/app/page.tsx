'use client';

import { useState, useRef, FormEvent } from 'react';
import Image from 'next/image';

interface AnalysisResult {
  detected_origin: string;
  sounds_like: string;
  confidence: string;
  components: {
    given_name: string;
    family_name: string;
  };
  native_script: string;
  has_english_name: boolean;
  cultural_note: string;
  warnings: string[];
  tts_language: string;
}

// Same English name fallback as the extension
const COMMON_ENGLISH_NAMES = new Set([
  'aaron', 'adam', 'alan', 'alex', 'alexander', 'alice', 'amanda', 'amy', 'andrew', 'andy',
  'angela', 'anna', 'anthony', 'ashley', 'barbara', 'benjamin', 'betty', 'billy', 'bob', 'brandon',
  'brenda', 'brian', 'bruce', 'carl', 'carol', 'catherine', 'charles', 'charlotte', 'chris', 'christina',
  'christine', 'christopher', 'cindy', 'claire', 'cynthia', 'daniel', 'david', 'deborah', 'dennis', 'diana',
  'donald', 'donna', 'dorothy', 'douglas', 'dylan', 'edward', 'elizabeth', 'emily', 'emma', 'eric',
  'eugene', 'eva', 'evelyn', 'frank', 'fred', 'gary', 'george', 'gloria', 'grace', 'gregory',
  'hannah', 'harold', 'harry', 'heather', 'helen', 'henry', 'howard', 'irene', 'jack', 'jacob',
  'james', 'jane', 'janet', 'jason', 'jean', 'jeff', 'jeffrey', 'jennifer', 'jenny', 'jeremy',
  'jerry', 'jessica', 'jimmy', 'joan', 'joe', 'john', 'jonathan', 'joseph', 'joshua', 'joyce',
  'judith', 'judy', 'julia', 'julie', 'justin', 'karen', 'katherine', 'kathleen', 'kathryn', 'kathy',
  'keith', 'kelly', 'kenneth', 'kevin', 'kimberly', 'larry', 'laura', 'lauren', 'lawrence', 'leslie',
  'lily', 'linda', 'lisa', 'lori', 'louise', 'lucy', 'margaret', 'maria', 'marie', 'marilyn',
  'mark', 'martha', 'martin', 'mary', 'matthew', 'melissa', 'michael', 'michelle', 'mike', 'nancy',
  'natalie', 'nathan', 'nicholas', 'nicole', 'olivia', 'pamela', 'patricia', 'patrick', 'paul', 'peter',
  'philip', 'rachel', 'ralph', 'randy', 'raymond', 'rebecca', 'richard', 'robert', 'robin', 'roger',
  'ronald', 'rose', 'ruby', 'russell', 'ruth', 'ryan', 'samantha', 'samuel', 'sandra', 'sara',
  'sarah', 'scott', 'sean', 'sharon', 'shirley', 'sophia', 'sophie', 'stanley', 'stephanie', 'stephen',
  'steve', 'steven', 'susan', 'tammy', 'teresa', 'terry', 'theresa', 'thomas', 'timothy', 'tina',
  'todd', 'tom', 'tommy', 'tony', 'tracy', 'tyler', 'victoria', 'vincent', 'virginia', 'walter',
  'wayne', 'wendy', 'william', 'willie'
]);

function hasEnglishGivenName(name: string): boolean {
  if (!name) return false;
  const firstWord = name.toLowerCase().replace(/[^a-z\s]/g, '').split(/\s+/)[0];
  return COMMON_ENGLISH_NAMES.has(firstWord);
}

function isFamilyFirst(origin: string): boolean {
  if (!origin) return false;
  const o = origin.toLowerCase();
  return ['chinese', 'japanese', 'korean', 'vietnamese', 'hungarian'].some(c => o.includes(c));
}

export default function Home() {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState('');
  const [audioLoading, setAudioLoading] = useState(false);
  const [audioPlaying, setAudioPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const exampleNames = [
    'Wong Qi Han', 'Yuki Tanaka', 'Priya Krishnamurthy',
    'Fatima Al-Rashid', 'Björk Guðmundsdóttir'
  ];

  async function analyzeByName(n: string) {
    setName(n);
    setLoading(true);
    setError('');
    setResult(null);
    if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
    setAudioPlaying(false);
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: n.trim(), context: '', source: 'webapp' }),
      });
      if (!res.ok) throw new Error('Analysis failed');
      const data = await res.json();
      if (!data.has_english_name && hasEnglishGivenName(n)) data.has_english_name = true;
      setResult(data);
    } catch {
      setError('Unable to analyze this name. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e?: FormEvent) {
    e?.preventDefault();
    if (!name.trim()) return;
    analyzeByName(name.trim());
  }

  async function playAudio() {
    if (!result) return;

    if (audioRef.current) {
      if (audioPlaying) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        setAudioPlaying(false);
        return;
      }
      audioRef.current.play();
      setAudioPlaying(true);
      return;
    }

    setAudioLoading(true);
    try {
      let ttsName = name.trim();
      if (isFamilyFirst(result.detected_origin) && !result.has_english_name && result.components?.family_name && result.components?.given_name) {
        ttsName = `${result.components.family_name} ${result.components.given_name}`;
      }

      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: ttsName,
          native_script: result.native_script,
          tts_language: result.has_english_name ? 'english' : result.tts_language,
          has_english_name: result.has_english_name,
          detected_origin: result.detected_origin,
          sounds_like: result.sounds_like,
          cultural_note: result.cultural_note,
        }),
      });

      if (!res.ok) throw new Error('TTS failed');
      const data = await res.json();

      if (data.audio_base64) {
        const audio = new Audio(`data:audio/mp3;base64,${data.audio_base64}`);
        audio.onended = () => setAudioPlaying(false);
        audioRef.current = audio;
        audio.play();
        setAudioPlaying(true);
      }
    } catch {
      setError('Audio generation failed. Please try again.');
    } finally {
      setAudioLoading(false);
    }
  }

  const useTraditionalOrder = result ? isFamilyFirst(result.detected_origin) && !result.has_english_name : false;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      {/* Header — compact */}
      <header style={{
        width: '100%',
        background: 'linear-gradient(135deg, hsl(260, 80%, 55%), hsl(260, 80%, 40%))',
        padding: '20px 20px 36px',
        textAlign: 'center',
        color: 'white',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '6px' }}>
          <Image
            src="/icon128.png"
            alt="NameWise"
            width={38}
            height={38}
            style={{ borderRadius: '10px' }}
          />
          <h1 style={{ fontSize: '24px', fontWeight: 700, letterSpacing: '-0.5px' }}>NameWise</h1>
        </div>
        <p style={{ fontSize: '14px', opacity: 0.85, fontWeight: 400 }}>
          Pronounce every name with confidence
        </p>
      </header>

      {/* Search */}
      <div style={{
        width: '100%',
        maxWidth: '520px',
        padding: '0 16px',
        marginTop: '-22px',
      }}>
        <form onSubmit={handleSubmit} style={{
          background: 'white',
          borderRadius: '16px',
          boxShadow: '0 4px 24px rgba(0,0,0,0.1)',
          padding: '6px',
          display: 'flex',
          gap: '6px',
          overflow: 'hidden',
          boxSizing: 'border-box',
        }}>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Enter a name..."
            style={{
              flex: 1,
              minWidth: 0,
              padding: '14px 16px',
              border: 'none',
              outline: 'none',
              fontSize: '16px',
              borderRadius: '12px',
              background: 'transparent',
              color: 'hsl(220, 20%, 14%)',
              fontFamily: 'inherit',
              boxSizing: 'border-box',
            }}
          />
          <button
            type="submit"
            disabled={loading || !name.trim()}
            style={{
              padding: '14px 20px',
              background: loading ? 'hsl(260, 30%, 70%)' : 'linear-gradient(135deg, hsl(260, 80%, 55%), hsl(260, 80%, 48%))',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontSize: '15px',
              fontWeight: 600,
              cursor: loading ? 'wait' : 'pointer',
              transition: 'all 0.2s',
              fontFamily: 'inherit',
              whiteSpace: 'nowrap',
              flexShrink: 0,
              boxSizing: 'border-box',
            }}
          >
            {loading ? '...' : 'Analyze'}
          </button>
        </form>

        {/* Example chips — tight under search, no label */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '6px',
          justifyContent: 'center',
          marginTop: '10px',
        }}>
          {exampleNames.map(n => (
            <button
              key={n}
              onClick={() => analyzeByName(n)}
              disabled={loading}
              style={{
                padding: '5px 10px',
                background: 'rgba(255,255,255,0.6)',
                border: '1px solid hsl(260, 30%, 90%)',
                borderRadius: '16px',
                fontSize: '11px',
                color: 'hsl(260, 50%, 45%)',
                cursor: loading ? 'wait' : 'pointer',
                transition: 'all 0.15s',
                fontFamily: 'inherit',
              }}
            >
              {n}
            </button>
          ))}
        </div>
      </div>

      {/* Value prop — 3-step explainer (only shown when no result) */}
      {!result && !loading && (
        <div style={{
          maxWidth: '520px',
          width: '100%',
          padding: '0 16px',
          marginTop: '32px',
        }}>
          <div style={{
            display: 'flex',
            gap: '12px',
            justifyContent: 'center',
          }}>
            {[
              { icon: '✏️', label: 'Enter a name' },
              { icon: '🔊', label: 'Hear it spoken' },
              { icon: '🌍', label: 'Learn the culture' },
            ].map((step, i) => (
              <div key={i} style={{
                flex: 1,
                textAlign: 'center',
                padding: '16px 8px',
                background: 'rgba(255,255,255,0.6)',
                borderRadius: '12px',
                backdropFilter: 'blur(10px)',
              }}>
                <div style={{ fontSize: '24px', marginBottom: '6px' }}>{step.icon}</div>
                <div style={{ fontSize: '12px', color: 'hsl(220, 10%, 40%)', fontWeight: 500, lineHeight: '1.3' }}>
                  {step.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Loading state */}
      {loading && !result && (
        <div style={{
          maxWidth: '520px', width: '100%', padding: '0 16px', marginTop: '32px', textAlign: 'center',
        }}>
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '32px 20px',
            boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
            color: 'hsl(260, 80%, 48%)',
            fontSize: '15px',
            fontWeight: 500,
          }}>
            <div style={{ fontSize: '28px', marginBottom: '8px', animation: 'pulse 1.5s infinite' }}>🎙️</div>
            Analyzing pronunciation...
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div style={{
          maxWidth: '520px', width: '100%', padding: '0 16px', marginTop: '20px',
        }}>
          <div style={{
            background: 'hsl(0, 80%, 97%)',
            border: '1px solid hsl(0, 60%, 88%)',
            borderRadius: '12px',
            padding: '14px 16px',
            color: 'hsl(0, 60%, 40%)',
            fontSize: '14px',
          }}>
            {error}
          </div>
        </div>
      )}

      {/* Result Card */}
      {result && (
        <div style={{
          maxWidth: '520px', width: '100%', padding: '0 16px', marginTop: '24px',
        }}>
          <div style={{
            background: 'white',
            borderRadius: '16px',
            boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
            overflow: 'hidden',
          }}>
            {/* Name header */}
            <div style={{
              padding: '20px 20px 16px',
              borderBottom: '1px solid hsl(220, 15%, 94%)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                <h2 style={{ fontSize: '22px', fontWeight: 700, color: 'hsl(220, 20%, 10%)' }}>
                  {name.trim()}
                </h2>
                {result.confidence && (
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: '4px',
                    padding: '4px 10px',
                    background: result.confidence.toLowerCase().includes('high') ? 'hsl(140, 50%, 92%)' : 'hsl(35, 90%, 96%)',
                    color: result.confidence.toLowerCase().includes('high') ? 'hsl(140, 60%, 30%)' : 'hsl(35, 80%, 30%)',
                    borderRadius: '20px',
                    fontSize: '12px', fontWeight: 600,
                  }}>
                    {result.confidence.toLowerCase().includes('high') ? '✓' : '~'} {result.confidence}
                  </span>
                )}
              </div>
              <p style={{ fontSize: '13px', color: 'hsl(220, 10%, 50%)', marginTop: '2px' }}>
                {result.detected_origin}
                {result.native_script && ` · ${result.native_script}`}
              </p>
            </div>

            {/* Pronunciation */}
            <div style={{ padding: '16px 20px' }}>
              <p style={{
                fontSize: '26px', fontWeight: 700,
                color: 'hsl(260, 80%, 48%)',
                letterSpacing: '0.5px',
                marginBottom: '12px',
              }}>
                {result.sounds_like}
              </p>

              {/* Play button */}
              <button
                onClick={playAudio}
                disabled={audioLoading}
                style={{
                  width: '100%',
                  padding: '12px',
                  background: audioPlaying
                    ? 'linear-gradient(135deg, hsl(0, 70%, 55%), hsl(0, 70%, 48%))'
                    : 'linear-gradient(135deg, hsl(260, 80%, 55%), hsl(260, 80%, 48%))',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '15px',
                  fontWeight: 600,
                  cursor: audioLoading ? 'wait' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  transition: 'all 0.2s',
                  fontFamily: 'inherit',
                }}
              >
                {audioLoading ? (
                  <>Loading audio...</>
                ) : audioPlaying ? (
                  <>■ Stop</>
                ) : (
                  <>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                    Play Pronunciation
                  </>
                )}
              </button>
            </div>

            {/* Name components */}
            {result.components && (result.components.given_name || result.components.family_name) && (
              <div style={{
                padding: '12px 20px',
                background: 'hsl(220, 20%, 97%)',
                display: 'flex',
                gap: '16px',
                fontSize: '14px',
              }}>
                {useTraditionalOrder ? (
                  <>
                    {result.components.family_name && (
                      <span><strong style={{ color: 'hsl(220, 10%, 40%)' }}>Family:</strong> {result.components.family_name}</span>
                    )}
                    {result.components.given_name && (
                      <span><strong style={{ color: 'hsl(220, 10%, 40%)' }}>Given:</strong> {result.components.given_name}</span>
                    )}
                  </>
                ) : (
                  <>
                    {result.components.given_name && (
                      <span><strong style={{ color: 'hsl(220, 10%, 40%)' }}>Given:</strong> {result.components.given_name}</span>
                    )}
                    {result.components.family_name && (
                      <span><strong style={{ color: 'hsl(220, 10%, 40%)' }}>Family:</strong> {result.components.family_name}</span>
                    )}
                  </>
                )}
              </div>
            )}

            {/* Cultural note */}
            {result.cultural_note && (
              <div style={{
                margin: '0 20px', padding: '12px 14px',
                background: 'hsl(35, 90%, 96%)',
                border: '1px solid hsl(35, 80%, 88%)',
                borderRadius: '10px',
                fontSize: '13px', lineHeight: '1.5',
                color: 'hsl(35, 50%, 25%)',
                marginTop: '8px',
              }}>
                <strong>💡 Cultural Note:</strong> {result.cultural_note}
              </div>
            )}

            {/* Etiquette tips */}
            {result.warnings && result.warnings.length > 0 && result.warnings.map((warning, i) => (
              <div key={i} style={{
                margin: i === result.warnings.length - 1 ? '8px 20px 16px' : '8px 20px 0',
                padding: '12px 14px',
                background: 'hsl(210, 80%, 96%)',
                border: '1px solid hsl(210, 60%, 88%)',
                borderRadius: '10px',
                fontSize: '13px', lineHeight: '1.5',
                color: 'hsl(210, 50%, 30%)',
              }}>
                <strong>🤝 Etiquette:</strong> {warning}
              </div>
            ))}
          </div>

          {/* Chrome extension CTA — shown AFTER a successful analysis, desktop only */}
          <div className="desktop-only" style={{
            marginTop: '16px',
            padding: '12px 16px',
            background: 'rgba(255,255,255,0.7)',
            border: '1px solid hsl(260, 40%, 88%)',
            borderRadius: '12px',
            fontSize: '13px',
            color: 'hsl(220, 10%, 30%)',
            textAlign: 'center',
            backdropFilter: 'blur(10px)',
          }}>
            🧩 Use NameWise directly on LinkedIn →{' '}
            <a
              href="https://chrome.google.com/webstore/detail/namewise"
              target="_blank"
              rel="noopener"
              style={{ color: 'hsl(260, 80%, 48%)', fontWeight: 600, textDecoration: 'none' }}
            >
              Install Chrome Extension
            </a>
          </div>
        </div>
      )}

      {/* Page footer — always visible */}
      <div style={{
        marginTop: 'auto',
        paddingTop: '32px',
        paddingBottom: '24px',
        fontSize: '12px',
        color: 'hsl(220, 10%, 50%)',
        textAlign: 'center',
      }}>
        Powered by AI · by{' '}
        <a href="https://www.linkedin.com/in/qi-han-wong-34955261/" target="_blank" rel="noopener" style={{ color: 'hsl(260, 80%, 55%)', textDecoration: 'none' }}>
          Qihan
        </a>
        {' · '}
        <a href="https://ko-fi.com/qihanwong" target="_blank" rel="noopener" style={{ color: 'hsl(260, 80%, 55%)', textDecoration: 'none' }}>
          Help cover server costs
        </a>
      </div>
    </div>
  );
}
