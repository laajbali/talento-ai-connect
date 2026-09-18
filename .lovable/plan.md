# Talento navigation, demo, and AI assistant update

## Goal
Refine the existing Talento product without redesigning it: simplify role navigation, correct logout and back behavior, add a fast demo entry, add role-aware AI assistance, and consistently apply the supplied logo.

## Implementation

### 1. Brand asset
- Upload the standalone logo supplied by the user through the project asset flow and make the shared `Logo` component render that single asset at its natural aspect ratio.
- Keep the logo non-clickable and replace all existing logo instances automatically through the shared component on landing, authentication, onboarding, sidebars, and mobile headers.
- Do not crop, recolor, redraw, or create alternate logo versions.

### 2. Shared navigation and header cleanup
- Keep exactly four primary destinations per role in the shared navigation configuration:
  - Job Seeker: Home, Jobs, My CV, More.
  - Employer / HR: Home, Candidates, Jobs, More.
- Remove the secondary-link block from the large-screen sidebar so More-page tools are not duplicated there.
- Keep the same four-item configuration for mobile bottom navigation.
- Remove Language, Appearance, and HR Search shortcuts from the application header while retaining Notifications and the user avatar.
- Keep Language and Appearance in each role’s More/settings flow, and keep AI Candidate Search in Candidates.

### 3. Back-button rules
- Treat all eight primary destinations as primary pages and omit the back arrow there.
- Keep the existing RTL-aware, icon-only back arrow on secondary pages.
- Improve fallback destinations so secondary screens return to the most relevant parent when browser history is unavailable, including job details to Jobs, candidate details/search to Candidates, and settings/company/career tools to More.

### 4. Logout and avatars
- Centralize demo-session logout so sidebar and More-page logout actions perform the same sequence: clear the persisted Talento session/state, navigate to `/`, and prevent role dashboards from reopening.
- Generate seeker and HR header avatars from the first two initials of the authenticated user’s name, updating whenever the session name changes.
- Use the company page only for company branding/details; never place the Talento logo inside a user avatar.

### 5. More-page information architecture
- Keep the Job Seeker More page as the sole secondary hub for account tools, applications, saved jobs, career tools, preferences, support, and AI Assistant.
- Reorganize Employer / HR More into:
  1. Company — Company Profile, Team.
  2. Preferences — Notifications, Language, Appearance, Privacy.
  3. Support — Help Center, Terms of Service.
  4. AI Tools / Assistance — AI Assistant.
- Remove only the standalone Contact Us entries; retain the existing Contact Us form and link inside Help Center.
- Remove AI Candidate Search and other candidate-specific duplicates from HR More while preserving their existing routes and access from Candidates.
- Reuse the existing company screen for both Company Profile and Team, using a section target so no duplicate page is created.

### 6. Fast role-based Demo Mode
- Keep the public landing page and all existing Login/Create Account/Google/Microsoft paths.
- Update the existing Choose Your Role screen so its primary action enters a prepared demo session immediately for the selected role, with no verification or setup delay.
- Keep a clear Create Account path from the same flow for users who want the full registration experience.
- Ensure the chosen role controls the dashboard and role guard exactly as it does today.

### 7. Real role-aware AI Assistant
- Reuse the existing Lovable AI gateway and server-function pattern; do not use canned/random responses.
- Add one shared assistant experience with role-aware prompts and separate guarded route entries for Job Seeker and HR, linked only from More.
- Include suggested questions tailored to each role, conversation loading/error/retry states, and concise guidance grounded in Talento’s existing screens and matching model.
- Do not add the assistant to the header, sidebar, or bottom navigation.

### 8. Match explanations and existing AI integrity
- Preserve all existing real AI functions for CV generation, career analysis, candidate search, match insights, CV screening, and job-post writing.
- Keep deterministic weighted matching as the evidence layer and ensure list/detail displays pair every percentage with matching factors, missing requirements, improvement areas, and the relevant dimension breakdown where space allows.
- Reuse the matching result fields instead of inventing new percentages or duplicating formulas.

### 9. Responsive and functional verification
- Test signed-out landing, demo entry, both role guards, both logout locations, and browser refresh after logout.
- Test mobile, tablet, and large desktop layouts for exact four-item navigation, no duplicated tools, correct primary/secondary back behavior, header cleanup, avatar initials, More-page organization, and no overflow.
- Test Help Center → Contact Us, Company → Team targeting, AI Assistant responses for both roles, existing AI entry points, and all retained links.
- Run automated checks plus browser interaction checks without changing the established Talento visual design.

## Technical details
- Continue using the existing TanStack routes, shared AppShell, local persisted demo store, translation/theme providers, semantic design tokens, and real AI server functions.
- Add only the two assistant route files referenced by navigation; do not delete or duplicate existing feature routes.
- Add unique metadata to the assistant routes and preserve metadata on every existing content route.
- The standalone logo upload is required before the logo replacement can be completed exactly.
