# NameWise Edge Cases

## 1. East Asian Name Order Ambiguity
**Problem**: Chinese/Japanese/Korean names use Family-Given order traditionally, but Western order on LinkedIn.

**Example**: "Qi Han Wong"
- LinkedIn (Western): Given "Qi Han" | Family "Wong"
- Traditional: Family "Wong Qi" or "Wong" | Given "Han"

**Solution**: Use context clues:
- Profile location (Singapore → Western order likely)
- Common surname patterns ("Wong" is surname)
- Company/education location
- If ambiguous, show both interpretations

## 2. Compound First Names (East Asian)
**Problem**: Two-character Chinese given names are ONE name, not first+middle.

**Example**: "Qi Han" is a single given name, not "Qi" + middle name "Han"

**Solution**: 
- Gemini detects Chinese naming patterns
- Warns against shortening: "Use full 'Qi Han' - both words form the given name"
- Flag common mistakes (people calling someone by half their name)

## 3. Western Hyphenated Names
**Problem**: Determining if hyphen is cultural or stylistic.

**Examples**:
- "Jean-Claude Dubois" (French - both parts essential)
- "Mary-Kate Olsen" (English - stylistic, could use "Mary")

**Solution**: Cultural database + Gemini inference about acceptability of shortening.

## 4. Hispanic Multiple Surnames
**Problem**: Two surnames (maternal + paternal), often truncated incorrectly by Western systems.

**Example**: "María García López"
- Full: Given "María" | Paternal "García" | Maternal "López"
- Professional: Often "María García" (drops maternal)
- Wrong: "María López" or just "López"

**Solution**: Detect Hispanic naming pattern, explain the structure.

## 5. Mononyms (Single Names)
**Problem**: Many Indonesian, Javanese names are single names.

**Example**: "Sukarno", "Widodo"

**Solution**: 
- Detect single-name pattern
- Explain: "Single name (common in Indonesia). Use full name."

## 6. Western Name + East Asian Surname
**Problem**: Adopted English first names with Chinese surnames.

**Example**: "David Wang"
- Given: "David" (adopted English name)
- Family: "Wang" (Chinese surname)
- Chinese name might be "Wang Wei" (not shown)

**Solution**: 
- Detect pattern (common English name + Chinese surname)
- Note: "English given name used professionally. Original Chinese name may differ."

## 7. Transliteration Variations
**Problem**: Same name, multiple spellings.

**Examples**:
- "Mohammed" / "Muhammad" / "Mohamed"
- "Aleksandr" / "Alexander"
- "Sofía" / "Sophia"

**Solution**: Acknowledge variations, provide pronunciation for the specific spelling.

## 8. Titles Embedded in Name Field
**Problem**: LinkedIn fields sometimes include titles.

**Examples**:
- "Dr. Priya Sharma"
- "John Smith, PhD"
- "María González III"

**Solution**: Strip titles before analysis, but preserve for context.

## 9. Preferred vs Legal Names
**Problem**: Profile shows preferred name, not legal name.

**Example**: "Alex" (preferred) vs "Alexander" (legal)

**Solution**: Pronounce what's shown, but note if it's likely a shortened version.

## 10. Non-Latin Scripts in Profile
**Problem**: Some profiles show names in original script + romanization.

**Example**: "王琪涵 (Qi Han Wang)"

**Solution**: 
- Use original script for better pronunciation accuracy
- Gemini can read multiple scripts directly
- Provide transliteration explanation

## 11. Married Name Ambiguity
**Problem**: Unclear which surname is current.

**Example**: "Sarah Johnson-Smith" (hyphenated married name vs birth name Johnson, married to Smith)

**Solution**: Explain both parts, note cultural context (Anglo practice).

## 12. Vietnamese Name Structure
**Problem**: Vietnamese names are Family-Middle-Given, but "Given" is used for address.

**Example**: "Nguyễn Văn An"
- Family: "Nguyễn" (extremely common)
- Middle: "Văn"
- Given: "An"
- **Address as**: "An" (NOT "Nguyễn")

**Solution**: Critical cultural rule - explain Vietnamese always use given name.

## 13. Icelandic Patronymics
**Problem**: "Last names" are patronymics, not family names.

**Example**: "Björk Guðmundsdóttir"
- Given: "Björk"
- Patronymic: "Guðmundsdóttir" (daughter of Guðmundur)
- **Address as**: "Björk" (NEVER "Ms. Guðmundsdóttir")

**Solution**: Detect Icelandic pattern, warn about patronymic misuse.

## 14. South Indian Patronymics
**Problem**: Father's name as initial/prefix, not a surname.

**Example**: "S. Ramanujan"
- Patronymic: "S" (Srinivasa, father's name)
- Given: "Ramanujan"
- **Address as**: "Ramanujan" (NOT "Mr. S")

**Modern variations**:
- "K. Viswanathan" - K could be father's name OR village/caste
- "Sundar Pichai" - Dropped patronymic entirely (modern trend)

**Solution**: 
- Detect South Indian pattern (initial + name)
- Explain: "First initial is patronymic. Address by given name."
- Note modern trend of dropping initials entirely

## 15. Thai Names
**Problem**: Long formal names, but everyone uses nicknames.

**Example**: Official "Somchai Jaidee" but goes by "Tle"

**Solution**: Note that Thai nicknames are unrelated to legal names - ask the person directly.

## 16. Name Order in Email Addresses
**Problem**: Email might give clues to preferred order.

**Example**: 
- Email: `qihan.wong@company.com` → Confirms Western order
- Email: `wong.qihan@company.com` → Might prefer traditional order

**Solution**: Use email as context signal if available.

## 17. Arabic Names with Ibn/Bin
**Problem**: "Ibn/bin" means "son of" but isn't always used in modern addressing.

**Example**: "Mohammed bin Salman Al Saud"
- Given: "Mohammed"
- Patronymic: "bin Salman" (son of Salman)
- Family/Tribal: "Al Saud"
- **Modern address**: Often "Mr. Mohammed" or full name in formal settings

**Solution**:
- Detect "ibn/bin/bint" pattern
- Explain patronymic structure
- Note: First name + title is common in professional contexts

## 18. Russian Patronymics (Middle Name)
**Problem**: Patronymic is mandatory in formal address, not optional middle name.

**Example**: "Vladimir Vladimirovich Putin"
- Given: "Vladimir"
- Patronymic: "Vladimirovich" (son of Vladimir)
- Surname: "Putin"
- **Formal address**: "Vladimir Vladimirovich" (NOT "Mr. Putin")

**Solution**: 
- Detect -ovich/-evich (male) or -ovna/-evna (female) endings
- Explain: "Use first name + patronymic in professional settings"

## 19. Sikh Names (Singh/Kaur NOT Surnames)
**Problem**: Singh/Kaur are religious identifiers, not family names.

**Example**: "Harpreet Singh Bedi"
- Given: "Harpreet"
- Religious: "Singh" (meaning "lion", all Sikh males)
- Family (modern): "Bedi" (caste name, contradicts egalitarian intent)
- **Address**: "Harpreet" or "Mr. Singh" acceptable

**Ideal practice**: Should be just "Harpreet Singh" (no caste surname).

**Solution**: 
- Detect Singh/Kaur
- Explain egalitarian origin
- Note modern deviation with caste surnames

## 20. Ethiopian Patronymic Chain
**Problem**: Father's name as "last name", grandfather's for official docs.

**Example**: "Lemlem Mengesha Abraha"
- Given: "Lemlem"
- Father's name: "Mengesha"
- Grandfather's name: "Abraha" (official docs only)
- **Address**: "Lemlem" or "Ms. Lemlem"

**Solution**: 
- Detect East African pattern
- Explain: "Father's name, not a surname"
- Women don't change names after marriage

## 21. Myanmar/Burmese (No Family Names)
**Problem**: Single or multi-part names with no inheritance.

**Example**: "Aung San Suu Kyi"
- This is ONE name (not "First: Aung San, Last: Suu Kyi")
- Named after grandfather "Aung San" + astrological elements
- **Address**: Full name or "Ms. Suu Kyi" (Western adaptation)

**Solution**: 
- Detect Burmese pattern
- Explain: "Single personal name, not divided"
- Note LinkedIn may force artificial first/last split

## 22. Brazilian Multi-Part Names
**Problem**: Multiple given names + maternal + paternal surnames.

**Example**: "Luiz Inácio Lula da Silva"
- Given: "Luiz Inácio"
- Nickname: "Lula" (unrelated to legal name)
- Maternal: "da Silva" (most commonly used)
- **Address**: Often by nickname or maternal surname

**Solution**: Detect Portuguese pattern, explain Brazilian convention differs from Spanish Hispanic.

## 23. Turkish Names (Post-1934)
**Problem**: Surnames mandated in 1934, older generation may have different practices.

**Example**: "Mustafa Kemal Atatürk"
- Given: "Mustafa Kemal"
- Adopted surname: "Atatürk" (1934 law)
- **Pre-1934**: Would have been "Mustafa Kemal" only

**Solution**: Note historical context if relevant.

## 24. Malay Names (Bin/Binti)
**Problem**: Similar to Arabic but different cultural context.

**Example**: "Siti Nurhaliza binti Tarudin"
- Given: "Siti Nurhaliza"
- Patronymic: "binti Tarudin" (daughter of Tarudin)
- **Address**: "Siti" or "Ms. Siti"

**Solution**: Distinguish from Arabic usage, explain Malaysian context.

## 25. Nigerian Names (Yoruba/Igbo/Hausa)
**Problem**: Different ethnic groups, different rules.

**Yoruba Example**: "Oluwaseun Ayodeji" (both parts are one given name)
**Igbo Example**: "Chukwuemeka Obi" (Obi = family name)
**Hausa Example**: Often use "dan" (son of) like Arabic

**Solution**: Detect ethnic linguistic patterns, explain diversity.

## 26. Gender-Neutral Names
**Problem**: Name doesn't indicate gender, cultural etiquette unclear.

**Examples**: "Alex", "Jordan", "Taylor", "凯" (Kai - Chinese)

**Solution**: 
- Acknowledge ambiguity
- Use gender-neutral language in cultural tips
- Suggest checking profile for pronouns
