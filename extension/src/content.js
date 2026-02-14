// NameWise Content Script - Runs on LinkedIn pages

// Configuration
const BUBBLE_OFFSET = 8;
const CARD_WIDTH = 380;

// State
let currentBubble = null;
let currentCard = null;
let selectedText = '';
let selectionContext = {};

// Helper: Check if culture uses family name first
function isFamilyFirst(origin) {
  if (!origin) return false;
  const familyFirstCultures = ['chinese', 'japanese', 'korean', 'vietnamese', 'hungarian'];
  return familyFirstCultures.some(c => origin.toLowerCase().includes(c));
}

// Deterministic English name list — fallback when Gemini misclassifies has_english_name
const COMMON_ENGLISH_NAMES = new Set([
  'aaron', 'adam', 'adrian', 'alan', 'albert', 'alex', 'alexander', 'alfred', 'alice', 'amanda',
  'amber', 'amy', 'andrew', 'andy', 'angela', 'ann', 'anna', 'anne', 'anthony', 'ashley',
  'barbara', 'benjamin', 'betty', 'bill', 'bob', 'brandon', 'brian', 'bruce', 'carl', 'carol',
  'caroline', 'catherine', 'charles', 'charlie', 'charlotte', 'chris', 'christian', 'christina',
  'christopher', 'claire', 'cynthia', 'dale', 'dan', 'daniel', 'david', 'deborah', 'dennis',
  'diana', 'donald', 'donna', 'dorothy', 'douglas', 'dylan', 'edward', 'elizabeth', 'emily',
  'emma', 'eric', 'eugene', 'eva', 'evan', 'evelyn', 'frank', 'fred', 'gary', 'george', 'grace',
  'greg', 'gregory', 'hannah', 'harold', 'harry', 'heather', 'helen', 'henry', 'ivy', 'jack',
  'jacob', 'james', 'jane', 'janet', 'jason', 'jean', 'jeff', 'jeffrey', 'jennifer', 'jenny',
  'jeremy', 'jessica', 'jill', 'jimmy', 'joan', 'joe', 'john', 'jonathan', 'joseph', 'joyce',
  'judith', 'judy', 'julia', 'julie', 'justin', 'karen', 'kate', 'katherine', 'kathleen', 'kathryn',
  'kathy', 'keith', 'kelly', 'ken', 'kenneth', 'kevin', 'kim', 'kimberly', 'larry', 'laura',
  'lauren', 'lawrence', 'lee', 'leonard', 'leslie', 'lily', 'linda', 'lisa', 'louis', 'lucy',
  'lynn', 'mandy', 'margaret', 'maria', 'marie', 'marilyn', 'mark', 'martin', 'mary', 'matthew',
  'max', 'megan', 'melissa', 'michael', 'michelle', 'mike', 'nancy', 'natalie', 'nathan',
  'nicholas', 'nicole', 'olivia', 'oscar', 'pamela', 'patricia', 'patrick', 'paul', 'paula',
  'peter', 'philip', 'rachel', 'ralph', 'randy', 'raymond', 'rebecca', 'richard', 'robert',
  'robin', 'roger', 'ronald', 'rose', 'ruby', 'russell', 'ruth', 'ryan', 'sally', 'sam',
  'samantha', 'samuel', 'sandra', 'sarah', 'scott', 'sean', 'sharon', 'shirley', 'simon',
  'sophia', 'sophie', 'stanley', 'stephanie', 'stephen', 'steve', 'steven', 'susan', 'teresa',
  'terry', 'thomas', 'timothy', 'tina', 'todd', 'tom', 'tommy', 'tony', 'tracy', 'tyler',
  'vanessa', 'victor', 'victoria', 'vincent', 'virginia', 'vivian', 'walter', 'wayne', 'wendy',
  'william', 'zachary'
]);

// Client-side fallback: check if the FIRST word is a common English given name
// Only checks first word to avoid false positives on surnames like Lee/Kim
function hasEnglishGivenName(name) {
  if (!name) return false;
  const firstWord = name.toLowerCase().replace(/[^a-z\s]/g, '').split(/\s+/)[0];
  return COMMON_ENGLISH_NAMES.has(firstWord);
}

// Initialize on page load
document.addEventListener('mouseup', handleSelection);
document.addEventListener('keydown', handleKeydown);

function handleSelection(event) {
  const selection = window.getSelection();
  const text = selection.toString().trim();

  console.log('[NameWise] Mouse up, selected text:', text);

  // Close existing bubble if clicking elsewhere
  if (currentBubble && !currentBubble.contains(event.target)) {
    removeBubble();
  }

  // Check if selection looks like a name (2-5 words, no numbers)
  if (text && isLikelyName(text)) {
    console.log('[NameWise] Showing bubble for:', text);
    selectedText = text;
    selectionContext = extractContext();
    showBubble(selection);
  }
}

function isLikelyName(text) {
  // Simple heuristics to detect if selection is a name
  const words = text.split(/\s+/);
  if (words.length < 1 || words.length > 5) return false;
  if (/\d/.test(text)) return false;
  if (text.length < 2 || text.length > 100) return false;
  // Check for common non-name patterns
  if (/^(the|a|an|and|or|but|in|on|at|to|for)\s/i.test(text)) return false;
  return true;
}

function extractContext() {
  // Extract context from LinkedIn page
  const context = {};

  // Try to get location
  const locationEl = document.querySelector('.text-body-small.inline.t-black--light');
  if (locationEl) context.location = locationEl.textContent.trim();

  // Try to get headline
  const headlineEl = document.querySelector('.text-body-medium.break-words');
  if (headlineEl) context.headline = headlineEl.textContent.trim();

  // Try to get current company
  const companyEl = document.querySelector('[data-field="experience_company"]');
  if (companyEl) context.company = companyEl.textContent.trim();

  // Page URL as additional context
  context.url = window.location.href;

  return context;
}

function showBubble(selection) {
  removeBubble();

  const range = selection.getRangeAt(0);
  const rect = range.getBoundingClientRect();

  // Create bubble element
  const bubble = document.createElement('div');
  bubble.className = 'namewise-bubble';
  bubble.innerHTML = `
    <div class="namewise-bubble-icon">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/>
        <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
        <line x1="12" x2="12" y1="19" y2="22"/>
      </svg>
    </div>
  `;

  // Position bubble above selection
  bubble.style.left = `${rect.left + rect.width / 2}px`;
  bubble.style.top = `${rect.top + window.scrollY - BUBBLE_OFFSET}px`;

  bubble.addEventListener('click', handleBubbleClick);

  document.body.appendChild(bubble);
  currentBubble = bubble;

  // Animate in
  requestAnimationFrame(() => {
    bubble.classList.add('namewise-bubble-visible');
  });
}

function removeBubble() {
  if (currentBubble) {
    currentBubble.remove();
    currentBubble = null;
  }
}

function handleBubbleClick(event) {
  event.stopPropagation();
  showCard();
}

async function showCard() {
  removeCard();

  // Get bubble position for animation origin
  const bubbleRect = currentBubble?.getBoundingClientRect();

  // Create card element
  const card = document.createElement('div');
  card.className = 'namewise-card';
  card.innerHTML = `
    <div class="namewise-card-content">
      <button class="namewise-close" aria-label="Close">&times;</button>
      <div class="namewise-loading">
        <div class="namewise-spinner"></div>
        <p>Analyzing name origin...</p>
      </div>
    </div>
  `;

  // Position card - check if it would go off-screen
  const CARD_HEIGHT = 400; // Approximate max card height
  if (bubbleRect) {
    const viewportHeight = window.innerHeight;
    const spaceBelow = viewportHeight - bubbleRect.bottom;
    const spaceAbove = bubbleRect.top;

    // Position horizontally
    let leftPos = Math.max(20, bubbleRect.left - CARD_WIDTH / 2);
    leftPos = Math.min(leftPos, window.innerWidth - CARD_WIDTH - 20);
    card.style.left = `${leftPos}px`;

    // Position vertically - show above if not enough space below
    if (spaceBelow < CARD_HEIGHT && spaceAbove > spaceBelow) {
      // Position above the selection
      card.style.top = `${bubbleRect.top + window.scrollY - CARD_HEIGHT - 10}px`;
    } else {
      // Position below the selection
      card.style.top = `${bubbleRect.bottom + window.scrollY + 10}px`;
    }
  } else {
    card.style.left = '50%';
    card.style.top = '100px';
    card.style.transform = 'translateX(-50%)';
  }

  document.body.appendChild(card);
  currentCard = card;

  // Add event listeners
  card.querySelector('.namewise-close').addEventListener('click', removeCard);

  // Animate in
  requestAnimationFrame(() => {
    card.classList.add('namewise-card-visible');
  });

  // Remove bubble
  removeBubble();

  // Fetch analysis from API
  try {
    const result = await chrome.runtime.sendMessage({
      type: 'ANALYZE_NAME',
      name: selectedText,
      context: selectionContext,
    });

    if (result.success) {
      // Client-side fallback: if Gemini missed an English given name, override
      if (!result.data.has_english_name && hasEnglishGivenName(selectedText)) {
        console.log('[NameWise] Client-side English name override for:', selectedText);
        result.data.has_english_name = true;
      }
      renderCardContent(result.data);
    } else {
      renderError(result.error);
    }
  } catch (error) {
    renderError(error.message);
  }
}

function renderCardContent(data) {
  if (!currentCard) return;

  const content = currentCard.querySelector('.namewise-card-content');

  content.innerHTML = `
    <button class="namewise-close" aria-label="Close">&times;</button>
    
    <div class="namewise-header">
      <h2 class="namewise-name">${escapeHtml(selectedText)}</h2>
      ${data.confidence ? `<span class="namewise-confidence namewise-confidence-${data.confidence}">${data.confidence === 'high' ? '✓ High confidence' : data.confidence === 'medium' ? '◐ Medium' : '? Low confidence'}</span>` : ''}
    </div>
    
    <div class="namewise-pronunciation">
      ${escapeHtml(data.sounds_like || data.pronunciation)}
    </div>
    
    <div class="namewise-info">
      <div class="namewise-info-row">
        <span class="namewise-info-icon">👤</span>
        <span>${(isFamilyFirst(data.detected_origin) && !data.has_english_name)
      ? `Family: ${escapeHtml(data.components?.family_name || 'N/A')} | Given: ${escapeHtml(data.components?.given_name || 'N/A')}`
      : `Given: ${escapeHtml(data.components?.given_name || 'N/A')} | Family: ${escapeHtml(data.components?.family_name || 'N/A')}`
    }</span>
      </div>
      ${data.profile_location ? `
        <div class="namewise-info-row">
          <span class="namewise-info-icon">📍</span>
          <span>Location: ${escapeHtml(data.profile_location)}</span>
        </div>
      ` : ''}
    </div>
    
    ${data.warnings?.length ? `
      <div class="namewise-warning">
        <span class="namewise-warning-icon">⚠️</span>
        <span>${escapeHtml(data.warnings[0])}</span>
      </div>
    ` : ''}
    
    ${data.cultural_note ? `
      <div class="namewise-tip">
        <span class="namewise-tip-icon">💡</span>
        <span>${escapeHtml(data.cultural_note)}</span>
      </div>
    ` : ''}
    
    <button class="namewise-play-btn namewise-loading-audio" id="namewise-play">
      <span class="namewise-play-icon">⏳</span>
      <span>Loading audio...</span>
    </button>
    
    <div class="namewise-footer">
      <span>Powered by AI · by <a href="https://www.linkedin.com/in/qi-han-wong-34955261/" target="_blank" rel="noopener">Qihan</a></span>
      <span>·</span>
      <a href="https://ko-fi.com/qihanwong" target="_blank" rel="noopener">Help cover server costs</a>
    </div>
  `;

  // Re-add close listener
  content.querySelector('.namewise-close').addEventListener('click', removeCard);

  // Load audio asynchronously
  const playBtn = content.querySelector('#namewise-play');
  if (playBtn) {
    loadAudioAsync(data, playBtn);
  }

  // Animate content in
  content.classList.add('namewise-content-loaded');
}

function renderError(message) {
  if (!currentCard) return;

  const content = currentCard.querySelector('.namewise-card-content');
  content.innerHTML = `
    <button class="namewise-close" aria-label="Close">&times;</button>
    <div class="namewise-error">
      <span class="namewise-error-icon">❌</span>
      <h3>Unable to Analyze</h3>
      <p>${escapeHtml(message || 'Something went wrong. Please try again.')}</p>
      <button class="namewise-retry-btn" id="namewise-retry">Retry</button>
    </div>
  `;

  content.querySelector('.namewise-close').addEventListener('click', removeCard);
  content.querySelector('#namewise-retry').addEventListener('click', () => {
    removeCard();
    // Re-trigger analysis
    if (selectedText) {
      showCard();
    }
  });
}

// Load audio asynchronously from TTS endpoint
async function loadAudioAsync(data, button) {
  try {
    // For CJK cultures WITHOUT English names, reorder to family-first
    // If has English name (Andy Low), keep original order
    let ttsName = selectedText;
    if (isFamilyFirst(data.detected_origin) && !data.has_english_name && data.components?.family_name && data.components?.given_name) {
      ttsName = `${data.components.family_name} ${data.components.given_name}`;
    }

    const result = await chrome.runtime.sendMessage({
      type: 'FETCH_TTS',
      name: ttsName,
      native_script: data.native_script,
      tts_language: data.has_english_name ? 'english' : data.tts_language, // Override to English if has English name
      has_english_name: data.has_english_name,
      detected_origin: data.detected_origin,
      sounds_like: data.sounds_like || data.tts_text,
      cultural_note: data.cultural_note
    });

    if (result.success && result.audio_base64) {
      // Store audio data on button for later playback
      button.dataset.audioBase64 = result.audio_base64;
      button.classList.remove('namewise-loading-audio');
      button.innerHTML = '<span class="namewise-play-icon">▶️</span><span>Play Audio</span>';
      button.addEventListener('click', () => playAudio(result.audio_base64, button));
    } else {
      // No Gemini audio available - disable button
      button.classList.remove('namewise-loading-audio');
      button.disabled = true;
      button.innerHTML = '<span>Audio unavailable</span>';
    }
  } catch (error) {
    console.error('[NameWise] TTS load failed:', error);
    // No fallback - show unavailable
    button.classList.remove('namewise-loading-audio');
    button.disabled = true;
    button.innerHTML = '<span>Audio unavailable</span>';
  }
}

async function playAudio(base64Audio, button, ttsText) {
  const originalHTML = button.innerHTML;
  button.innerHTML = '<span class="namewise-play-icon">⏸️</span><span>Playing...</span>';
  button.classList.add('namewise-playing');

  const onComplete = () => {
    button.innerHTML = '<span class="namewise-play-icon">✓</span><span>Played</span>';
    button.classList.remove('namewise-playing');
    setTimeout(() => {
      button.innerHTML = originalHTML;
    }, 2000);
  };

  const onError = () => {
    button.innerHTML = '<span>Audio error</span>';
    button.classList.remove('namewise-playing');
  };

  // If we have base64 audio, use it (Google Cloud TTS returns MP3)
  if (base64Audio) {
    console.log('[NameWise] Got audio_base64, length:', base64Audio.length);
    try {
      const audio = new Audio(`data:audio/mp3;base64,${base64Audio}`);
      audio.onended = onComplete;
      audio.onerror = () => {
        console.error('[NameWise] Audio playback error');
        onError();
      };
      await audio.play();
      console.log('[NameWise] Audio playing successfully');
    } catch (e) {
      console.error('[NameWise] Failed to play audio:', e.message);
      onError();
    }
  } else {
    onError();
  }
}

function removeCard() {
  if (currentCard) {
    currentCard.classList.add('namewise-card-closing');
    setTimeout(() => {
      currentCard?.remove();
      currentCard = null;
    }, 200);
  }
}

function handleKeydown(event) {
  if (event.key === 'Escape') {
    removeCard();
    removeBubble();
  }
}

function escapeHtml(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function showReportForm(data) {
  if (!currentCard) return;

  const content = currentCard.querySelector('.namewise-card-content');
  content.innerHTML = `
    <button class="namewise-close" aria-label="Close">&times;</button>
    <div class="namewise-report-form">
      <h3 style="margin: 0 0 16px 0; font-size: 16px;">Report an Error</h3>
      <p style="font-size: 13px; color: #666; margin-bottom: 12px;">
        Help us improve! What was wrong with the pronunciation or cultural guidance for "${escapeHtml(selectedText)}"?
      </p>
      <textarea id="namewise-feedback" placeholder="e.g., The pronunciation should be... / The cultural tip is incorrect because..." style="width: 100%; height: 80px; padding: 10px; border: 1px solid #ddd; border-radius: 8px; font-size: 13px; resize: none; font-family: inherit;"></textarea>
      <button id="namewise-submit-report" class="namewise-play-btn" style="margin-top: 12px;">Submit Feedback</button>
      <p style="font-size: 11px; color: #999; margin-top: 8px; text-align: center;">Thank you for helping us be more accurate!</p>
    </div>
  `;

  content.querySelector('.namewise-close').addEventListener('click', removeCard);

  content.querySelector('#namewise-submit-report').addEventListener('click', () => {
    const feedback = content.querySelector('#namewise-feedback').value;
    if (feedback.trim()) {
      // In production, send this to your backend
      console.log('[NameWise] Feedback submitted:', {
        name: selectedText,
        originalData: data,
        feedback: feedback
      });

      content.innerHTML = `
        <button class="namewise-close" aria-label="Close">&times;</button>
        <div style="text-align: center; padding: 30px 0;">
          <span style="font-size: 48px;">✅</span>
          <h3 style="margin: 12px 0 8px 0;">Thank you!</h3>
          <p style="color: #666; font-size: 13px;">Your feedback helps us improve.</p>
        </div>
      `;
      content.querySelector('.namewise-close').addEventListener('click', removeCard);

      setTimeout(removeCard, 2000);
    }
  });
}

console.log('NameWise content script loaded');
