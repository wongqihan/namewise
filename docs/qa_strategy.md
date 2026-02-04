# Quality Assurance & Accuracy Strategy

## The Accuracy Challenge
**Core Problem**: A single mistake (wrong pronunciation or offensive cultural advice) can damage trust irreparably.

**Goal**: Build a system that is honest about uncertainty and prioritizes "do no harm" over providing an answer.

---

## 1. Multi-Layer Validation System

### Layer 1: Gemini Analysis with Confidence Scoring
```
Input: Name + Context
↓
Gemini 3 Flash analyzes with structured prompt
↓
Output: {
  pronunciation: {...},
  cultural_advice: {...},
  confidence: 'high' | 'medium' | 'low',
  reasoning: "Detected Singaporean Chinese pattern based on..."
}
```

**Confidence Thresholds**:
- **High (>90%)**: Clear pattern match (e.g., "Wong" + Singapore location + "Qi Han" structure)
- **Medium (60-90%)**: Ambiguous (e.g., name order unclear, multiple possible origins)
- **Low (<60%)**: Insufficient context or unfamiliar pattern

### Layer 2: Cross-Validation (For Critical Cases)
For **Medium** confidence, query Gemini 3 Pro for second opinion:
- If both models agree → Upgrade to High
- If models disagree → Stay Medium, show both interpretations

### Layer 3: Pronunciation Verification
**Problem**: Gemini generates text pronunciation, but TTS might mispronounce it.

**Solution**:
1. Generate IPA (International Phonetic Alphabet) - standardized
2. Generate "sounds-like" - user-friendly
3. Use Google Cloud TTS with **specific locale** (not generic English)
   - Example: For "Qi Han Wong", use `zh-SG` locale, not `en-US`
4. **Audio validation prompt**: After generating audio, have Gemini analyze the waveform/transcription to verify it matches intent

---

## 2. Cultural Accuracy Safeguards

### Expert Review Database
Build a curated database of **verified cultural rules** that Gemini must follow:
```json
{
  "vietnamese_addressing": {
    "rule": "Always use given name (last word), never family name",
    "severity": "CRITICAL",
    "verified_by": "Vietnamese cultural consultant",
    "last_updated": "2026-02-01"
  },
  "icelandic_patronymic": {
    "rule": "Never use patronymic as surname in address",
    "severity": "CRITICAL",
    "verified_by": "Icelandic embassy cultural attaché",
    "last_updated": "2026-01-15"
  }
}
```

### Gemini Prompt Structure
```
You MUST follow these verified cultural rules:
1. [Rule from expert database]
2. [Rule from expert database]
...

If your analysis CONFLICTS with any verified rule, flag it and defer to the rule.
```

### Red Flag Detection
Implement regex-based safety checks for obvious errors:
- "Use Mr. Nguyen" → **REJECT** (Vietnamese family name misuse)
- "Shorten Qi Han to Qi" → **REJECT** (Chinese compound name violation)

---

## 3. Transparency & Disclaimer System

### Show Your Work
Every response includes a "Why?" collapsible section:
```
🔍 How we analyzed this:
- Origin detected: Singapore (from profile location)
- Name structure: Chinese compound given name (2 characters)
- Confidence: High (92%)
- Key signal: "Wong" is common Cantonese surname
```

### Explicit Limitations
```
⚠️ Limitations:
- This is AI-generated guidance. When in doubt, ask the person directly.
- Cultural practices vary individually; not all [nationality] follow the same norms.
- Pronunciation may vary by regional accent.
```

### User Correction Mechanism
"Is this wrong?" button → Opens feedback form:
- "What's incorrect?"
- "What's the correct pronunciation/etiquette?"
- Submitted to human review queue

---

## 4. Testing Strategy

### Test Cases (Minimum 100 Names Across 26 Edge Cases)

**Example Test Matrix**:
| Name | Origin | Expected Pronunciation | Expected Etiquette | Edge Case # |
|------|--------|----------------------|-------------------|------------|
| Qi Han Wong | Singapore | Chee Hahn Wong | Use full "Qi Han" | #2 (Compound) |
| Nguyễn Văn An | Vietnam | Win Vahn Ahn | Call by "An", not "Mr. Nguyen" | #12 (Vietnamese) |
| Natasha Petrovna | Russia | ... | Use "Natasha Petrovna" | #18 (Russian) |

**Validation Method**:
1. **Native speaker verification**: For each test case, have a native speaker:
   - Listen to the audio
   - Read the cultural tip
   - Rate accuracy (1-5 scale)
2. **Threshold**: 95% of test cases must score 4+ before launch

### A/B Testing Post-Launch
- **Control group**: Gets basic "sounds-like" only
- **Test group**: Gets full cultural context
- **Metric**: User reports accuracy as "Helpful" vs "Incorrect"

---

## 5. Error Handling & Graceful Degradation

### When Confidence is Low (<60%)
**Option A - Honest Admission**:
```
❓ Uncertain Analysis
We're not confident about this name's origin or pronunciation.

Possible interpretations:
1. [Option 1 with reasoning]
2. [Option 2 with reasoning]

💡 Recommendation: Ask the person directly: "How do you pronounce your name?"
```

**Option B - Refuse to Answer**:
```
🚫 Unable to Analyze
We don't have enough context to provide accurate guidance for this name.

To help us:
- Check if the person's profile includes location or language info
- Try selecting more context (bio, company name)
```

### When TTS Fails
- Fallback to IPA + "sounds-like" text only
- Clear message: "Audio unavailable for this name. See phonetic guide above."

### When Gemini API is Down
- Cache recent results (with expiry)
- Or show: "Service temporarily unavailable. Try again in a moment."

---

## 6. Continuous Improvement Loop

### Week 1-4 (Beta):
- Invite 100 LinkedIn power users (recruiters, salespeople) from diverse backgrounds
- Collect feedback: "Was this helpful? Was this accurate?"
- Daily review of "Report Error" submissions

### Month 2-6:
- Partner with cultural organizations (e.g., "Asian Pacific American Heritage" groups, "Icelandic Society")
- Host "Name Accuracy Sessions" - community members test their own names
- Iterate on edge cases based on real-world failures

### Ongoing:
- Gemini model updates → Regression test entire test suite
- Quarterly expert review of cultural rules database
- Public changelog: "We improved accuracy for [X] names this month"

---

## 7. Ethical Considerations

### Privacy
- **Do NOT store names + personal data** beyond session cache
- **Do NOT train on user data** without explicit consent
- **Clear in privacy policy**: "We send name + public profile context to Google Gemini API"

### Bias Mitigation
- **Challenge**: Gemini trained primarily on Western data → May perform worse on underrepresented cultures
- **Nationality Assumption Risk**: Location ≠ Nationality (Malaysian in Singapore, etc.)
- **Solution**:
  - Over-sample test cases from Global South, Indigenous names
  - Partner with linguists from those communities
  - If certain demographics report <80% accuracy, add explicit warning
  - **Test specifically**: "Qi Han Wong" with Malaysia birthplace + Singapore location
  - **Red flag test**: Any output containing "Singaporean", "Malaysian" (nationality claims) should ERROR

### Harm Reduction
- **No guesses for sacred names**: If name pattern suggests religious/sacred origin (e.g., certain Indigenous names), show:
  ```
  🙏 This name may have sacred or culturally sensitive origins.
  We recommend asking the person directly about pronunciation and appropriate forms of address.
  ```

---

## Launch Readiness Checklist

- [ ] 100 test cases validated by native speakers (>95% accuracy)
- [ ] Expert cultural consultants reviewed tips for top 10 naming systems
- [ ] Privacy policy approved by legal team
- [ ] Error reporting system live and monitored
- [ ] Gemini API failover tested
- [ ] Beta user feedback incorporated
- [ ] Public disclaimer visible in UI
- [ ] Pronunciation audio validated for top 20 languages
- [ ] Confidence scoring calibrated (manual review of 50 "high confidence" predictions)
- [ ] Red flag detection system tested (should catch 100% of critical errors)
