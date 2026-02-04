# NameWise - Design Specification

**Version**: 1.0  
**Last Updated**: 2026-02-04  
**Status**: Final - Ready for Implementation

---

## 1. Design Philosophy

**Core Principle**: "Respectful Clarity"
- **Respectful**: Honors cultural significance of names; never "exotic" or othering
- **Clarity**: Information instantly scannable during real-time calls

**Design Values**:
- **Honest**: Show confidence levels; admit uncertainty
- **Minimal**: Only essential information; avoid clutter
- **Accessible**: WCAG AAA compliant (7:1 contrast, keyboard nav, screen readers)
- **Premium**: Glassmorphism and smooth animations convey quality

---

## 2. Visual System

### 2.1 Color Palette

```css
/* Primary Colors */
--primary-purple: hsl(260, 80%, 65%);     /* Buttons, active states */
--primary-blue: hsl(200, 90%, 60%);       /* Info backgrounds */

/* Semantic Colors */
--warning-yellow: hsl(45, 100%, 85%);     /* Soft yellow for warnings */
--success-green: hsl(140, 60%, 50%);      /* Confirmation states */
--error-red: hsl(0, 70%, 60%);            /* Critical errors only */

/* Neutrals */
--glass-white: hsla(0, 0%, 100%, 0.85);   /* Card background */
--glass-border: hsla(0, 0%, 100%, 0.2);   /* Subtle borders */
--text-primary: hsl(220, 20%, 10%);       /* High contrast text */
--text-secondary: hsl(220, 10%, 40%);     /* Supporting text */
```

**Accessibility**: All text-to-background combinations meet WCAG AAA (7:1 minimum)

### 2.2 Typography

**Font Stack**:
```css
font-family: 'Inter Variable', -apple-system, 'Segoe UI', 'Noto Sans', sans-serif;
```

**Type Scale**:
| Element | Size | Weight | Line Height | Use Case |
|---------|------|--------|-------------|----------|
| Name Header | 14px | 600 | 1.4 | Profile name |
| Hero Pronunciation | 28px | 700 | 1.2 | Primary pronunciation |
| Info Labels | 12px | 500 | 1.5 | Given/Family labels |
| Body Text | 14px | 400 | 1.5 | Tips, warnings |
| Button Text | 14px | 600 | 1 | CTAs |

**Why Inter**:
- Excellent internationalization (Vietnamese tones, Arabic diacritics)
- Optimized for UI at small sizes
- Variable font = single file, all weights

### 2.3 Spacing (8pt Grid)

All spacing in multiples of 8px:
- **8px**: Icon-to-text spacing
- **16px**: Between sections
- **24px**: Card padding
- **32px**: Between major blocks

---

## 3. Component Specifications

### 3.1 Main Card

**Dimensions**:
- Max width: `400px`
- Min height: `280px`
- Padding: `24px`
- Border radius: `20px`

**Background (Glassmorphism)**:
```css
backdrop-filter: blur(20px) saturate(180%);
background: linear-gradient(
  135deg,
  hsla(260, 80%, 65%, 0.1),
  hsla(200, 90%, 60%, 0.1)
);
border: 1px solid var(--glass-border);
box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
```

### 3.2 Name Header
```
┌────────────────────┐
│ Qi Han Wong        │  14px, weight 600, color: text-primary
└────────────────────┘
```

### 3.3 Pronunciation (Hero)
```
┌────────────────────┐
│ CHEE HAHN WONG     │  28px, weight 700, letter-spacing: -0.01em
└────────────────────┘
```
- Hyphenated syllables for clarity
- ALL CAPS for stressed syllables (optional, depends on ambiguity)

### 3.4 Info Box
```
┌─────────────────────────────┐
│ 👤 Given: Qi Han | Family: Wong │
│ 📍 Location: Singapore           │
└─────────────────────────────┘
```
- Background: `hsla(200, 90%, 60%, 0.08)`
- Padding: `12px`
- Border radius: `8px`
- Font: 12px, weight 400

**NO Pattern Label**: Removed to avoid ethnicity labeling

### 3.5 Warning Box
```
┌─────────────────────────────┐
│ ⚠️ Use full "Qi Han" - both  │
│    words form the given name │
└─────────────────────────────┘
```
- Background: `hsl(45, 100%, 85%)` (soft yellow, not alarming red)
- Icon: Warning triangle (⚠️)
- Border-left: `4px solid hsl(45, 100%, 50%)`

### 3.6 Tip Box
```
┌─────────────────────────────┐
│ 💡 In Southeast Asian        │
│    professional contexts...  │
└─────────────────────────────┘
```
- Background: `hsla(200, 90%, 60%, 0.05)`
- Icon: Lightbulb (💡)

### 3.7 Play Audio Button
```css
width: 100%;
height: 44px;  /* Minimum touch target */
background: linear-gradient(135deg, hsl(260, 80%, 65%), hsl(260, 80%, 55%));
color: white;
border-radius: 12px;
font-weight: 600;
```

**States**:
- Default: `▶️ Play Audio`
- Hover: Scale 1.02, shadow increase
- Active: Scale 0.98
- Playing: `⏸️ Playing... 2s` (shows duration)
- Success: `✓ Played` (2s, then reset)

---

## 4. Interaction Patterns

### 4.1 Activation Flow
```
1. User selects text
   ↓
2. Floating bubble appears (150ms scale 0→1, ease-out)
   Position: Above selection, offset +8px
   ↓
3. Hover: Bubble lifts (shadow 4px → 8px)
   ↓
4. Click: Bubble → Loading spinner (morph animation)
   ↓
5. Card animates in from bubble position (300ms spring curve)
   ↓
6. Content fades in sequential (stagger 100ms):
   - Name (0ms)
   - Pronunciation (100ms)
   - Info box (200ms)
   - Warnings/Tips (300ms)
   - CTA (400ms)
```

### 4.2 Audio Playback
- Button press: Immediate audio start
- Visual: Pulse animation (2Hz sine wave, 10% scale)
- Duration display: "Playing... 2s"
- Completion: "✓ Played" for 2s, then reset

### 4.3 Dismissal
- Click outside card: Dismiss after 500ms delay (prevent accidental)
- ESC key: Immediate dismiss
- Animation: Fade out + scale down to 0.95 (200ms)

---

## 5. Animation Specifications

### 5.1 Spring Physics (Natural Feel)
```javascript
spring: {
  tension: 180,
  friction: 20,
  mass: 1
}
```
Used for: Card entrance, hover states

### 5.2 Micro-interactions (60fps)
- Button press: Scale 1 → 0.95 (100ms) → 1 (150ms)
- Checkbox: Checkmark draws in (200ms)
- Tooltip: Fade + translateY(4px) (150ms)

### 5.3 Reduced Motion Support
```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 6. Accessibility (WCAG AAA)

### 6.1 Keyboard Navigation
**Tab Order**:
1. Play Audio button
2. "Show more" (if collapsed)
3. "Report error" link
4. Close button (×)

**Shortcuts**:
- `Space` / `Enter`: Play audio
- `Esc`: Close card

### 6.2 Screen Reader Optimization
```html
<div role="dialog" 
     aria-labelledby="name-title" 
     aria-describedby="pronunciation">
  <h2 id="name-title">Qi Han Wong</h2>
  <p id="pronunciation" aria-live="polite">
    Pronounced: Chee Hahn Wong
  </p>
  <button aria-label="Play audio pronunciation of Qi Han Wong">
    <span aria-hidden="true">▶️</span> Play Audio
  </button>
</div>
```

### 6.3 High Contrast Mode
- Detect: `@media (prefers-contrast: high)`
- Changes:
  - Remove glassmorphism → Solid backgrounds
  - Increase border weight: 1px → 2px
  - Boost text contrast to 10:1+

### 6.4 Touch Targets
- Minimum size: **44x44px** (WCAG AAA)
- Applies to: Buttons, close icon, links

---

## 7. Responsive Behavior

### 7.1 Desktop (Default)
- Card: Max width 400px, centered over selection
- Animations: Full spring physics enabled

### 7.2 Mobile (< 480px)
**Note**: Chrome extensions don't work on mobile. This is for future mobile web app.

**Layout Changes**:
- Card: Full width minus 16px margins
- Slide in from bottom (native app feel)
- Compact mode in landscape (hide tips by default)

**Touch Interactions**:
- Long press on name: Show card (alternative to button)
- Swipe down: Dismiss
- Tap outside: Dismiss after 500ms delay

---

## 8. Loading & Error States

### 8.1 Loading Phases
```
Phase 1 (0-500ms):
  Spinner + "Analyzing name origin..."

Phase 2 (500ms-2s):
  Progress bar + "Generating pronunciation..."

Phase 3 (>2s):
  "Taking longer than usual. Complex name pattern."
```

### 8.2 Low Confidence (<60%)
```
┌─────────────────────────────┐
│ ❓ Uncertain Analysis        │
│                              │
│ We're only 45% confident.   │
│                              │
│ Possible interpretations:    │
│ 1. [Option A]                │
│ 2. [Option B]                │
│                              │
│ 💡 Ask the person directly.  │
│                              │
│ [Show Best Guess] [Skip]     │
└─────────────────────────────┘
```

### 8.3 API Failure
```
┌─────────────────────────────┐
│ ❌ Unable to Connect         │
│                              │
│ Couldn't reach pronunciation │
│ service. Try again?          │
│                              │
│ [Retry]                      │
└─────────────────────────────┘
```

---

## 9. Cultural Sensitivity in Design

### 9.1 No Nationality Assumptions
- ❌ Flag emojis (🇸🇬)
- ❌ "Singaporean name"
- ✅ "Location: Singapore" (factual)
- ✅ "Pattern: [Linguistic family]"

### 9.2 Respectful Language
- ❌ "Exotic", "unusual", "difficult"
- ✅ "Multi-syllable", "Contains sounds uncommon in English"

### 9.3 Gender Neutrality
- Use "they/them" in all cultural tips
- Never assume gender from name patterns

### 9.4 Chosen Names
- Respect what's shown on profile
- Never ask for "real name"

---

## 10. Design Tokens (CSS Variables)

```css
:root {
  /* Colors */
  --color-primary: hsl(260, 80%, 65%);
  --color-warning: hsl(45, 100%, 85%);
  --color-text: hsl(220, 20%, 10%);
  
  /* Spacing */
  --space-xs: 8px;
  --space-sm: 16px;
  --space-md: 24px;
  --space-lg: 32px;
  
  /* Typography */
  --font-size-sm: 12px;
  --font-size-base: 14px;
  --font-size-hero: 28px;
  
  /* Borders */
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 20px;
  
  /* Shadows */
  --shadow-sm: 0 2px 8px rgba(0,0,0,0.1);
  --shadow-md: 0 8px 32px rgba(0,0,0,0.1);
}
```

---

## 11. Implementation Checklist

- [ ] Inter Variable font loaded
- [ ] All contrast ratios tested (WCAG AAA)
- [ ] Keyboard navigation functional
- [ ] Screen reader tested (NVDA/VoiceOver)
- [ ] Spring animations implemented (framer-motion)
- [ ] Reduced motion support verified
- [ ] High contrast mode tested
- [ ] 44x44px touch targets confirmed
- [ ] Loading states implemented
- [ ] Error states designed
- [ ] Glassmorphism backdrop-filter working (Safari support?)
- [ ] No flag emojis (cultural sensitivity review)

---

**Design Approval**: ✅ Approved (2026-02-04)  
**Next Step**: Begin component development
