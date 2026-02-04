# Additional Cultural Sensitivities

## 1. Chosen Name vs Legal Name
**Issue**: LinkedIn may show a chosen name, not legal name.

**Examples**:
- Trans/non-binary individuals using affirmed names
- Anglicized names vs birth names ("Michael" for "Mikhail")
- Nicknames unrelated to legal names (Thai practice)

**Our approach**:
```
✅ Pronounce what's shown on profile
✅ Note: "LinkedIn shows chosen names. This may differ from legal/formal documents."
❌ Never ask "What's your REAL name?"
```

## 2. Religious/Sacred Names
**Issue**: Some names have specific religious protocols.

**Examples**:
- "Muhammad" - High respect required in Islamic culture
- Indigenous names with ceremonial significance
- Hindu deity names - casual use may offend

**Our approach**:
```
If pattern detected:
🙏 "This name may have religious significance. 
   We recommend asking the person directly about 
   pronunciation and addressing preferences."
   
[Skip AI Guess] [Show Pattern Anyway]
```

## 3. Pronunciation as Identity
**Issue**: Person's chosen pronunciation > "linguistically correct"

**Example**:
- "Hermione" → Most people say "Her-my-oh-nee" (Harry Potter influence)
- But the Greek origin is "Her-my-OH-neh"

**Our approach**:
```
💬 Confidence: Medium (70%)

Based on linguistic pattern: "Her-my-OH-neh"
Common pronunciation: "Her-my-oh-nee"

💡 Tip: When in doubt, the person's preference 
   overrides linguistic "correctness."
```

## 4. Tone Accuracy (Chinese/Vietnamese)
**Issue**: Wrong tone can change meaning or sound offensive.

**Example (Chinese)**:
- "Ma" can mean: mother (mā), hemp (má), horse (mǎ), or scold (mà)

**Our approach**:
```
⚠️ Tonal Language Detected
Chinese has 4 tones. Getting this wrong can 
change the word's meaning entirely.

Audio uses neutral tone. For precise pronunciation, 
ask the person or check for tone marks in their name.
```

## 5. Colonial Name Legacies
**Issue**: Anglicized names often erase indigenous identity.

**Example**:
- "John Kilpatrick" (Anglicized) vs "Seán Mac Giolla Phádraig" (Irish Gaelic)
- Many African names replaced by "Christian names"

**Our approach**:
```
If LinkedIn shows Anglicized name but bio mentions 
indigenous/original name:

📌 Note: Profile shows "John Kilpatrick"
Bio mentions: "Seán Mac Giolla Phádraig"

Would you like pronunciation for:
[Anglicized Name] [Indigenous Name] [Both]
```

## 6. Honorifics as Cultural Requirement
**Issue**: Some cultures require honorifics; omitting them is disrespectful.

**Example**:
- Japanese: "-san", "-sama", "-sensei"
- Korean: "-ssi", "-nim"
- Arabic: "Sheikh", "Hajji"

**Our approach**:
```
In Japan, always append "-san" when addressing:
"Tanaka-san" (NOT just "Tanaka")

Exception: Very close friends may use first name only.
In professional contexts, always use honorific.
```

## 7. Caste/Class Sensitivity
**Issue**: Some surnames indicate caste/class (India, Japan, etc.)

**Example**:
- Indian surnames often indicate caste (Brahmin, Kshatriya, etc.)
- Japanese "burakumin" surnames historically discriminated against

**Our approach**:
```
❌ Never mention caste/class: "This is a Brahmin name"
✅ Generic: "Common in [region]"

If surname has known class implications:
💡 Use given name when possible. Surname may carry 
   historical associations. Follow person's lead.
```

## 8. Name Length Assumptions
**Issue**: Long names aren't "difficult" - that's ableist framing.

**Bad framing**:
```
❌ "This is a difficult/complex/hard name"
❌ "Unusual name"
```

**Good framing**:
```
✅ "Multi-syllable name"
✅ "Contains sounds not common in English"
✅ Neutral description, no value judgment
```

## 9. Gendered Language in Tips
**Issue**: Assuming gender from name patterns.

**Example**:
- "Singh" is typically male, but some non-binary Sikhs use it
- Russian "-ovna" is female patronymic, but may be used non-standardly

**Our approach**:
```
❌ "He should be addressed as..."
✅ "This person can be addressed as..."
✅ "In professional settings, use..."

Use they/them pronouns in all cultural tips unless 
profile explicitly states pronouns.
```

## 10. "Exotic" Fetishization
**Issue**: Comments that make names seem "foreign" or "other"

**Bad phrasing**:
```
❌ "Beautiful exotic name!"
❌ "Interesting unusual name"
❌ "Where is this from?" (implies outsider status)
```

**Good phrasing**:
```
✅ "Pattern: [Linguistic family]"
✅ "Common in: [Regions]"
✅ Factual, not othering
```

---

## Implementation in QA

### Red Flag Phrases to Auto-Reject:
- "exotic", "unusual", "difficult", "foreign"
- "real name", "actual name" (implies chosen names aren't valid)
- Gendered pronouns (he/she) in cultural tips
- Any mention of caste/class hierarchies
- "Where are you from?" framing

### Sensitivity Checklist:
- [ ] Respects chosen names over legal names
- [ ] Warns for religious/sacred name patterns
- [ ] Acknowledges person's pronunciation > linguistic correctness
- [ ] Handles tonal languages with humility
- [ ] Recognizes colonial name contexts
- [ ] Includes proper honorific guidance
- [ ] Never mentions caste/class
- [ ] Avoids "difficulty" framing
- [ ] Uses gender-neutral language
- [ ] No exoticizing or othering language
