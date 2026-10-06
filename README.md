# Talento: Your Career Compass

Build a complete, production-ready responsive web application called “Talento”.

PRODUCT OVERVIEW

Talento is an AI-powered recruitment and career platform that connects job seekers with employers. The platform has two completely different user roles:

1. Job Seeker

2. Employer / HR

The user MUST choose their role during onboarding before entering the platform. Each role should have its own dashboard, navigation, features, and user experience.

The application should feel like a real finished product, not a simple prototype. Build all pages, navigation, interactions, forms, dashboards, states, empty states, validation, and responsive layouts.

DESIGN & BRANDING

- Product name: Talento

- Tagline: “Right Talent. Brighter Futures.”

- Modern, professional, trustworthy SaaS/recruitment design.

- Clean white interface with teal/green as the primary brand color and dark navy text.

- Use rounded cards, subtle shadows, modern typography, clean spacing, professional icons, and clear visual hierarchy.

- Mobile-first responsive design, also optimized for desktop.

- Use realistic sample data instead of empty screens.

- Add loading, success, error, empty, and confirmation states.

- Make the UI accessible and easy to understand.

- Keep the design consistent across every screen.

ONBOARDING & AUTHENTICATION

Create an onboarding flow:

1. Welcome / Landing Screen

   - Talento logo

   - “Right Talent. Brighter Futures.”

   - Short explanation of the platform

   - CTA: Get Started

   - Login option

2. Choose Role

   The user chooses:

   - Job Seeker

   - Employer / HR

3. Sign Up

   - Full Name

   - Email

   - Password

   - Continue with Google

   - Continue with Microsoft

4. Email Verification

   - Verification message

   - Resend verification email

   - Change email

5. Role-specific profile setup.

JOB SEEKER EXPERIENCE

Create a dedicated Job Seeker dashboard with bottom navigation:

Home | Jobs | My CV | More

HOME

Show:

- Personalized welcome message

- Profile completion percentage

- CV status

- Career readiness percentage

- Recommended jobs

- Recently viewed jobs

- Career development suggestions

AI CV BUILDER

Allow the user to:

- Create a CV using AI

- Upload an existing CV (PDF/DOC/DOCX)

- Create a CV manually

If the user chooses AI:

- Ask the user for information in a simple conversational form.

- Extract information such as:

  - Personal information

  - Education

  - Skills

  - Work experience

  - Projects

  - Certifications

  - Languages

- Generate a professional structured CV.

- Allow editing of every section.

- Provide CV templates.

- Allow preview.

- Allow download as PDF.

- Allow updating the CV at any time.

MY CV

Display:

- AI-generated CV

- CV completion percentage

- Edit CV

- Upload new CV

- Download PDF

- Preview CV

AI CAREER ANALYSIS

Analyze the user's:

- Degree

- Major

- Skills

- Experience

- Projects

- Certifications

- CV

Generate:

- Overall career readiness percentage

- Skills summary

- Strengths

- Areas for improvement

- Recommended skills

Show the percentage visually using a circular progress indicator.

CAREER GAP ANALYSIS

Allow the user to enter or select a target job.

Compare:

USER PROFILE vs JOB REQUIREMENTS

Display:

- Overall Match %

- Matching skills

- Missing skills

- Skills that need improvement

- Education match

- Experience match

- Certification match

Example:

“Data Analyst — 91% Match”

Break down the score:

- SQL: Match

- Excel: Match

- Power BI: Missing

- Data Visualization: Needs Improvement

- Experience: Match

Do not only show the percentage. Always explain WHY the user matches or does not match.

JOB RECOMMENDATIONS

Create an AI-powered job recommendation system.

For every recommended job display:

- Job title

- Company

- Location

- Employment type

- Required skills

- Match %

- Why it matches

- Missing requirements

Allow:

- Apply

- Save Job

- View Details

Sort jobs by relevance/match score.

JOB DETAILS

Display:

- Company

- Job title

- Location

- Employment type

- Salary if available

- Job description

- Requirements

- Skills

- Match %

- Match explanation

- Missing skills

- Apply button

- Save button

CAREER PATH

Based on Career Gap Analysis, generate a personalized development roadmap.

Example:

Step 1:

Learn Power BI — 4 weeks

Step 2:

Build a Data Analytics project — 2 weeks

Step 3:

Improve SQL — 2 weeks

Step 4:

Add project to CV — 1 week

Step 5:

Apply to relevant jobs

Show:

- Progress

- Completed steps

- Current step

- Recommended next step

MY APPLICATIONS

Show all applications with statuses:

- Applied

- Under Review

- Shortlisted

- Interview

- Rejected

Allow the user to open an application and view its details.

SAVED JOBS

Allow users to save jobs and manage their saved jobs.

MORE / SETTINGS

Include:

- Personal Information

- My Profile

- Career Analysis

- Career Path

- Notifications

- Language

- Privacy

- Terms of Service

- Help Center

- Contact Us

- Logout

EMPLOYER / HR EXPERIENCE

Create a separate HR dashboard with navigation:

Home | Candidates | Jobs | More

HR HOME

Show:

- Active Jobs

- Total Applicants

- Shortlisted Candidates

- Interviews

- Recent applications

- Recommended candidates

- Hiring activity

AI CANDIDATE SEARCH

Create a natural-language search interface.

The HR should be able to type something like:

“I need a fresh graduate in AI with Python and SQL, preferably in Riyadh.”

The AI should understand the request and convert it into searchable criteria.

Allow filters:

- University

- Degree

- Major

- GPA

- Skills

- Experience

- Certifications

- Location

- Availability

- Graduation year

Show matching candidates with:

- Name

- Education

- Skills

- Experience

- Match %

AI CANDIDATE MATCHING

When HR selects a job, automatically compare candidates against the job requirements.

For every candidate display:

- Match %

- Matching skills

- Missing skills

- Education match

- Experience match

- Certification match

- AI Match Insight

Example:

Sarah Ahmed — 94% Match

Omar Ali — 89% Match

Lina Abdullah — 87% Match

The Match % must be based on multiple factors, not just keywords.

AI CV SCREENING

Allow HR to upload multiple CVs.

The AI should extract:

- Education

- University

- GPA

- Skills

- Experience

- Projects

- Certifications

- Languages

Automatically organize candidates and make them searchable.

CANDIDATE PROFILE

Create a detailed candidate profile containing:

- Profile photo

- Name

- Education

- University

- GPA

- Skills

- Experience

- Projects

- Certifications

- CV

Add an “AI Match Insights” section showing:

- Overall Match %

- Why the candidate matches

- Strong matching areas

- Missing requirements

- Areas that may need development

Allow HR to:

- Shortlist candidate

- Save candidate

- Contact candidate

- View CV

AI JOB POSTING

Allow HR to create a job by entering simple information.

Fields:

- Job title

- Description

- Location

- Employment type

- Salary

- Required education

- Required skills

- Experience

- Certifications

The AI should transform the information into a professional job description.

Allow:

- Edit

- Preview

- Publish

- Save as Draft

JOB MANAGEMENT

Create a Jobs Management page.

Each job should show:

- Job title

- Status: Active / Draft / Closed

- Number of applicants

- Number shortlisted

- Interviews

- Hired

Allow HR to:

- Create job

- Edit job

- Pause job

- Close job

- View applicants

APPLICATION MANAGEMENT

For every job, display applicants grouped by status:

All

Under Review

Shortlisted

Interview

Rejected

Allow HR to move candidates between statuses.

SAVED CANDIDATES

Allow HR to bookmark candidates and create a saved candidate list.

COMPANY PROFILE

Allow HR to manage:

- Company logo

- Company name

- Description

- Industry

- Company size

- Website

- Location

- Team members

HR SETTINGS

Include:

- Account information

- Company information

- Team members

- Notifications

- Language

- Privacy

- Terms

- Help Center

- Contact Us

- Logout

AI / MATCHING LOGIC

The application should conceptually calculate Match % using multiple dimensions:

- Skills match

- Education match

- Experience match

- Certifications

- Job requirements

- Relevant projects

Display the final percentage clearly.

Do NOT show a percentage without an explanation.

Every AI recommendation should explain:

- Why this is recommended

- What matches

- What is missing

- What the user should do next

DATA & APPLICATION STRUCTURE

Create a proper application architecture with reusable components and realistic data models for:

Users

Job Seekers

Employers

Companies

CVs

Skills

Jobs

Applications

Saved Jobs

Saved Candidates

Career Analyses

Career Gaps

Career Paths

Notifications

Implement authentication and role-based access so:

- Job Seekers cannot access HR dashboards.

- HR users cannot access Job Seeker dashboards.

- Each user sees only the data relevant to their account.

NAVIGATION

After login:

- Job Seeker → Job Seeker Dashboard

- Employer/HR → HR Dashboard

Ensure every button and navigation item leads to a real page or functional interaction.

IMPORTANT UX REQUIREMENTS

- Do not create placeholder buttons.

- Do not leave pages empty.

- Do not create duplicate screens unnecessarily.

- Include realistic sample candidates, jobs, applications, skills, and companies.

- Add search, filtering, sorting, saving, editing, and status changes where relevant.

- Make percentages visually prominent.

- Make AI features visually recognizable but not excessive.

- Keep the experience simple for students and professional for HR users.

- Make all forms validated.

- Include responsive mobile and desktop layouts.

FINAL PRODUCT GOAL

The final application should communicate one clear value proposition:

“Talento helps people understand where they stand, what they are missing, find the right opportunities, and build a path toward them — while helping companies find and evaluate the right talent faster.”

Build the complete end-to-end experience rather than only creating static UI screens.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://talento-ai-connect.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/ce9482fd-df37-456f-ade9-f38fb1b28d76).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
