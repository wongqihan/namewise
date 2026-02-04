# NameWise - Product Requirements Document (PRD)

**Version**: 1.0  
**Last Updated**: 2026-02-04  
**Status**: Planning Phase - Approved for Implementation

---

## 1. Product Vision

**Mission**: Help professionals pronounce and address colleagues' names correctly, fostering respect and inclusivity in global business contexts.

**Problem Statement**:
- Professionals frequently encounter names from unfamiliar linguistic backgrounds
- Mispronunciation damages rapport and signals disrespect
- Existing tools (database lookups like NameShouts) lack cultural context and can't handle new names
- No solution addresses the "how to address" question (e.g., "Qi Han" vs "Qi", patronymics, etc.)

**Solution**: AI-powered browser extension that provides:
1. Accurate pronunciation (audio + phonetics)
2. Name structure breakdown (given/family, compound names)
3. Cultural etiquette guidance (addressing conventions)
4. Confidence scoring (honest about uncertainty)

---

## 2. Target Users

### Primary Persona: "Global Networker Sarah"
- **Role**: Sales Executive, Recruiter, or Customer Success Manager
- **Pain**: Makes 10-20+ LinkedIn cold calls daily across APAC, EMEA
- **Need**: Quick, accurate pronunciation before joining a call
- **Motivation**: Building trust; avoiding awkward "how do I say your name?" moments

### Secondary Persona: "Inclusive Leader David"
- **Role**: Team Lead managing diverse, distributed team
- **Pain**: Wants to pronounce teammates' names correctly but feels awkward asking
- **Need**: Cultural context about addressing norms (e.g., Russian patronymics)

### Anti-Persona: NOT for
- Casual social media users (LinkedIn focus only for MVP)
- Academics researching etymology (we're practical, not academic)

---

## 3. Core Features (MVP)

### 3.1 Name Selection & Context Extraction
- User selects name text on LinkedIn profile
- Extension scrapes context: location, company, headline, bio snippet
- Floating "NameWise" bubble appears above selection

### 3.2 AI-Powered Analysis (Gemini 3 Flash)
**Input**: Name + Context  
**Output**:
- Phonetic pronunciation (IPA + "sounds-like" English)
- Audio file (Google Cloud TTS with locale-specific voice)
- Name structure: Given/Family breakdown
- Location reference (NOT nationality)
- Cultural guidance (regional addressing conventions)
- Confidence level: High/Medium/Low
- Warnings (e.g., "Don't shorten compound names")

**Critical Rules** (see [edge_cases.md](file:///Users/wongqihan/.gemini/antigravity/brain/e1b517ac-fb81-43bc-85f8-3ed050999956/edge_cases.md)):
- 26 global naming patterns (East Asian order, patronymics, compound names, etc.)
- NEVER claim nationality (location ≠ ethnicity)
- NEVER show flag emojis
- Detect linguistic patterns, not identity

### 3.3 User Interface
**Card Design** (see [design_system.md](file:///Users/wongqihan/.gemini/antigravity/brain/e1b517ac-fb81-43bc-85f8-3ed050999956/design_system.md)):
- Glassmorphism card with purple-blue gradient
- Hero pronunciation text (28px, high contrast)
- Info box: Given/Family + Location
- Warning box (soft yellow): Critical etiquette
- Tip box: Regional conventions
- Play Audio button (primary CTA)

**Interaction**:
1. Select name → Bubble appears
2. Click bubble → Card animates in
3. Click "Play Audio" → Hear pronunciation
4. Click outside or ESC → Dismiss

### 3.4 Error Handling & Transparency
**Low Confidence (<60%)**:
```
❓ Uncertain Analysis
We're only 45% confident about this pronunciation.

Possible interpretations:
1. [Option A with reasoning]
2. [Option B with reasoning]

💡 Recommendation: Ask the person directly.
```

**API Failure**: Show retry + offline fallback message

**No Context**: Prompt user to select more text (bio, etc.)

---

## 4. Technical Architecture

### 4.1 Stack
- **Extension**: Chrome Manifest V3 (React + TypeScript)
- **Backend**: Next.js API routes (hosted separately)
- **AI**: Google Gemini 3 Flash (pronunciation logic)
- **TTS**: Google Cloud Text-to-Speech (locale-aware audio)
- **Hosting**: Vercel (backend), Chrome Web Store (extension)

### 4.2 Data Flow
```
LinkedIn Page
    ↓ (User selects name)
Content Script → Extract context (name, location, bio)
    ↓
Background Script → POST /api/analyze
    ↓
Next.js Backend → Gemini 3 Flash API
    ↓ (Text analysis + phonetics)
Next.js Backend → Google TTS API
    ↓ (Audio generation)
Next.js Backend → Return JSON
    ↓
Extension → Render card + play audio
```

### 4.3 Privacy & Data Handling
- **NO persistent storage** of names (session cache only)
- **NO training** on user data without consent
- Clear privacy policy: "Name + public profile context sent to Google Gemini"
- GDPR/CCPA compliant

---

## 5. Quality Assurance Strategy

### 5.1 Multi-Layer Validation
1. **Gemini 3 Flash** (primary analysis)
2. **Gemini 3 Pro** (cross-validation for medium confidence cases)
3. **Red flag regex** (auto-reject obvious errors like "Mr. Nguyen" for Vietnamese)

### 5.2 Expert Review Database
Curated cultural rules from verified sources:
```json
{
  "vietnamese_addressing": {
    "rule": "Always use given name, never family name",
    "severity": "CRITICAL",
    "verified_by": "Vietnamese cultural consultant"
  }
}
```

### 5.3 Native Speaker Testing
- **100 test cases** across 26 edge case patterns
- **95%+ accuracy threshold** before launch
- Rating: 1-5 scale by native speakers

### 5.4 User Feedback Loop
- "Report Error" button → Human review queue
- Weekly accuracy review during beta
- Public changelog: "Improved accuracy for X names this month"

---

## 6. Cultural Sensitivity Guidelines

### 6.1 Core Principles (see [cultural_sensitivities.md](file:///Users/wongqihan/.gemini/antigravity/brain/e1b517ac-fb81-43bc-85f8-3ed050999956/cultural_sensitivities.md))
1. **Respect chosen names** over legal names (trans/non-binary affirmed names)
2. **No nationality assumptions** (Malaysian in Singapore ≠ Singaporean)
3. **Sacred names**: Flag religious/ceremonial names, recommend asking person
4. **Pronunciation as identity**: Person's preference > linguistic "correctness"
5. **Tone accuracy**: Warn for tonal languages (Chinese, Vietnamese)
6. **Gender neutrality**: Use they/them in tips, avoid assumptions
7. **No "exotic" language**: Factual descriptions only
8. **No caste/class mentions**: Never reference social hierarchy

### 6.2 Red Flag Auto-Reject Words
- "exotic", "unusual", "difficult", "foreign"
- "real name" (implies chosen names invalid)
- Gendered pronouns (use they/them)
- Nationality claims ("Singaporean", "Malaysian")
- Caste/class references

---

## 7. Success Metrics

### 7.1 Adoption Metrics
- **Week 1**: 100 beta users (invited LinkedIn power users)
- **Month 1**: 1,000 active users
- **Month 6**: 10,000+ MAU

### 7.2 Quality Metrics
- **Accuracy**: >95% "helpful" rating from user feedback
- **<5%** "report error" rate
- **<2%** critical errors (offensive cultural guidance)

### 7.3 Engagement Metrics
- **Average 3+ names** analyzed per session
- **70%+ audio playback rate** (users actually listen)
- **<10% bounce rate** (don't close immediately)

### 7.4 NPS (Net Promoter Score)
- Target: **60+** (considered "excellent" for B2B tools)

---

## 8. Non-Goals (Out of Scope for MVP)

- ❌ Mobile support (Chrome extensions don't work on mobile)
- ❌ Real-time meeting integration (Zoom/Teams bots)
- ❌ Support for non-LinkedIn sites (Facebook, Twitter, etc.)
- ❌ User-uploaded custom pronunciations (Phase 2 feature)
- ❌ Offline mode (requires internet for AI)

---

## 9. Launch Roadmap

### Phase 0: Planning (Current - Week 2)
- [x] Product concept validated
- [x] 26 edge cases documented
- [x] Design system finalized
- [x] QA strategy defined
- [ ] Expert cultural consultant partnerships secured

### Phase 1: MVP Development (Week 3-8)
- [ ] Backend API (Next.js + Gemini integration)
- [ ] Chrome extension (Manifest V3)
- [ ] 100 test cases validated
- [ ] Privacy/legal review complete

### Phase 2: Closed Beta (Week 9-12)
- [ ] 100 beta users (recruiters, sales teams)
- [ ] Daily accuracy monitoring
- [ ] Iterate on edge cases from real failures
- [ ] A/B test confidence thresholds

### Phase 3: Public Launch (Week 13+)
- [ ] Chrome Web Store submission
- [ ] ProductHunt launch
- [ ] LinkedIn post from founder
- [ ] Partnership with diversity/inclusion orgs

### Phase 4: Growth & Iteration (Month 4+)
- [ ] Mobile web app (manual name input)
- [ ] "Sonic Business Card" (user-recorded pronunciations)
- [ ] Expand to Gmail, Salesforce, HubSpot
- [ ] Native mobile apps (iOS/Android)

---

## 10. Open Questions & Risks

### 10.1 Open Questions
1. **Monetization**: Free tier + premium ($5/mo)? Or Chrome Web Store one-time fee ($9.99)?
2. **Gemini API costs**: At scale, $0.01/request → need to evaluate unit economics
3. **Legal**: Do we need EULA for cultural guidance? (Disclaimer: "AI-generated, not legal advice")

### 10.2 Risks
| Risk | Severity | Mitigation |
|------|----------|------------|
| AI gives offensive cultural advice | **HIGH** | Expert review + red flag detection + user reporting |
| Gemini API downtime | Medium | Cache recent results + fallback to text-only mode |
| Chrome Web Store rejection | Medium | Follow Manifest V3 guidelines strictly |
| Low adoption (users don't see value) | Medium | Beta testing with real users before public launch |

---

## 11. Appendices

- [Edge Cases Documentation](file:///Users/wongqihan/.gemini/antigravity/brain/e1b517ac-fb81-43bc-85f8-3ed050999956/edge_cases.md) - 26 global naming patterns
- [QA Strategy](file:///Users/wongqihan/.gemini/antigravity/brain/e1b517ac-fb81-43bc-85f8-3ed050999956/qa_strategy.md) - Multi-layer validation approach
- [Design System](file:///Users/wongqihan/.gemini/antigravity/brain/e1b517ac-fb81-43bc-85f8-3ed050999956/design_system.md) - Visual design & interaction patterns
- [Cultural Sensitivities](file:///Users/wongqihan/.gemini/antigravity/brain/e1b517ac-fb81-43bc-85f8-3ed050999956/cultural_sensitivities.md) - 10 additional sensitivity considerations
- [Implementation Plan](file:///Users/wongqihan/.gemini/antigravity/brain/e1b517ac-fb81-43bc-85f8-3ed050999956/implementation_plan.md) - Technical implementation details

---

**Approval Status**: ✅ Approved by Product Owner (2026-02-04)  
**Next Step**: Begin Phase 1 MVP Development
