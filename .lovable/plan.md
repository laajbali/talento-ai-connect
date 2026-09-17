# Talento language, theme, and navigation update

## Goal
Keep Talento’s current structure and visual identity while making English/Arabic behavior complete, improving dark-mode clarity, and simplifying the homepage and navigation exactly as requested.

## Implementation

### 1. Complete bilingual interface
- Expand the shared translation system into a complete English/Arabic catalogue for every visible interface string across onboarding, job-seeker, employer/HR, CV, settings, empty, loading, validation, confirmation, and error states.
- Route all headings, labels, buttons, placeholders, descriptions, cards, filters, statuses, notifications, dialogs, tooltips, and toast messages through the shared translator.
- Translate static sample-facing content where it is part of the interface, including job/candidate explanations, workflow labels, and status text.
- Keep stable internal values in English for filtering and business logic, translating only their displayed labels.
- Never pass user-entered names through translation. Names will continue to render directly from registration/profile/company data, unchanged in both languages.
- Apply the persisted language globally, with `lang` and `dir` switching between English/LTR and Arabic/RTL.
- Make directional controls RTL-aware: reverse arrows where appropriate, use logical start/end spacing and borders, and correct alignment/order across desktop and mobile.
- Use the same language preference on public, onboarding, seeker, and employer screens, including functional language controls where users can access them.

### 2. Theme behavior and dark-mode contrast
- Make first-time visits explicitly default to Light mode, while continuing to honor a user’s saved manual choice.
- Refine the existing dark semantic tokens to use a deep navy/charcoal page background, lighter card/sidebar/input surfaces, brighter primary text, readable secondary text, and visible subtle borders/dividers.
- Add or refine semantic status treatments so Applied, Under Review, Shortlisted, Interview, and Rejected remain distinct, readable, and consistent in both themes.
- Improve shared buttons, icons, skill tags, match pills, search fields, navigation states, and form controls through semantic tokens rather than page-specific hardcoded colors.
- Preserve the existing turquoise/green accent and keep Light mode visually unchanged except where shared consistency requires a minor correction.
- Keep printable CV templates professional and legible while ensuring their surrounding preview controls work correctly in dark mode.

### 3. Homepage cleanup
- Keep `/` as the public main page.
- Remove the large match-preview card from the right side of the introduction area and let the existing introduction occupy the available space without changing its visual language.
- Keep only the header’s Get Started and Log In actions; remove the repeated action buttons from the introduction and lower journey cards while preserving the remaining informational content.
- Keep both retained actions linked to their current working onboarding/login destinations.

### 4. Back controls and logo behavior
- Change navigation-back controls to icon-only arrows with accessible labels; do not show “Back” or its Arabic equivalent visually.
- Preserve browser-history behavior and safe role-home fallbacks, and ensure arrow direction follows LTR/RTL.
- Remove links and click behavior from every Talento logo instance in headers, side navigation, onboarding, and other shared shells; keep the logo visually unchanged.

### 5. Verification
- Check every route in both English and Arabic for untranslated interface text, while confirming names remain byte-for-byte unchanged.
- Verify language persistence, LTR/RTL switching, Light as the first-visit default, saved Dark preference, and readable status/skill/match styling.
- Verify homepage action counts and destinations, non-clickable logos, and arrow-only back navigation.
- Test representative seeker, employer, onboarding, CV, form, empty, error, and notification screens at desktop and mobile/tablet widths.
- Run the project’s automated checks and browser interaction checks before completion.

## Technical details
- Continue using the existing React context/local-storage language and theme providers; no backend or data-model changes are required.
- Centralize translated display values and status labels so filtering, navigation, and saved demo data remain stable.
- Use CSS logical properties/Tailwind start-end utilities and semantic design tokens for RTL and theme safety.
