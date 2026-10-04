---
title: Deadline Buddy — The Open-Source Scholarship Compass That Explains Every Match (Built for a Friend)
published: true
tags: devchallenge, weekendchallenge, hf26challenge, opensource
cover_image: https://raw.githubusercontent.com/guptapiyush16/Deadline-Buddy/main/public/cover.png
---

*This is a submission for the [Hacktoberfest Weekend Challenge: Build for a Friend](https://dev.to/challenges/hacktoberfest-weekend-2026-10-01)*

---

## What I Built

### The Story: Building for a Friend Under a Mountain of PDFs

My close friend is a 3rd-year Computer Science undergraduate at NIT Karnataka, Surathkal in India. Like thousands of ambitious students around the world, their dream is to pursue a Master's degree abroad in AI and Distributed Systems.

A few weeks ago, I watched them spend an entire weekend buried under a mountain of open browser tabs: **DAAD** in Germany, **EduCanada**, **Fulbright** in the US, and **Chevening** and **Commonwealth** in the UK. Each scholarship program had 40- to 80-page PDF guidelines filled with dense institutional jargon:
- *"Does a 4-year Indian B.Tech degree count as final-year standing right now?"*
- *"Does an 8.4 / 10 CGPA meet the 'first-class honours or 2:1 equivalent' threshold?"*
- *"Does a national hackathon finalist certificate satisfy 'demonstrated community leadership'?"*

Existing scholarship portals were useless: they either acted as clickbait lead-generation farms or slapped an opaque *"87% Match"* badge on a card without explaining **why** they qualified. The alternative—spending 20 hours drafting an essay only to be rejected over a technical disqualifier buried on page 52—was heartbreaking.

I built **Deadline Buddy** for my friend.

---

### What Deadline Buddy Does

Deadline Buddy turns scholarship discovery into a transparent, stress-free 5-step loop:

1. **📄 Zero-Friction Document Intake:** Drop in unofficial transcripts, resumes, or certificates (PDF, DOCX, TXT) or click the 1-click sample button.
2. **👤 Structured Profile Extraction:** The system extracts key attributes (GPA, current year of study, degree, graduation year, skills, achievements) into an editable profile with supporting document quotes.
3. **🌍 Destination Personalization:** Pick a target country (USA, Canada, UK, Germany, Australia, Netherlands, Singapore, Japan), immediately contextualizing currencies, deadlines, and official guides.
4. **⚖️ Deterministic Eligibility Matching:** Instead of letting an LLM guess eligibility, pure deterministic code evaluates published requirements against the profile, categorizing each award into **Eligible (✓)**, **Needs Verification (🟡)**, or **Not Eligible (✕)**.
5. **🔍 The Signature "Why?" Evidence Drawer & AI Strategy Advisor:**
   - Clicking any status badge reveals a side-by-side audit trail: the exact published clause, the student's extracted evidence, the source document quote, and a link to the official university portal.
   - **`⚡ Ask Open AI Strategy Advisor`**: Generates a personalized gap plan with feasibility scoring and alternative scholarships.
   - **`🧪 Open AI Guideline Lab`**: Paste raw institutional PDF announcements to test real-time guideline extraction.
6. **⏳ Deadline-First Shortlist:** Saved opportunities are prioritized by nearest deadline so students never miss an application window.

---

## Demo

- 🌐 **Live Deployed Application:** [https://deadline-buddy-nine.vercel.app/](https://deadline-buddy-nine.vercel.app/)
- ⚡ **1-Click Judge Walkthrough:** On the landing screen, click **`⚡ Load Sample Student Documents (1-Click Demo)`** to instantly populate a real-world academic profile and test the deterministic rules engine across 26 real scholarships!

---

## Code

{% github https://github.com/guptapiyush16/Deadline-Buddy %}

- **GitHub Repository:** [guptapiyush16/Deadline-Buddy](https://github.com/guptapiyush16/Deadline-Buddy)
- **Tech Stack:** React 19, TypeScript, Vite, Tailwind CSS, Vitest (11/11 passing tests), Client-side PDF/DOCX Parsing (`pdfjs-dist` + `mammoth`).
- **Zero API Keys Required:** Runs 100% in-browser on client hardware with 0 external API dependencies.

---

## How I Built It

### The Architecture: Open AI for Extraction, Code for Truth

The single biggest engineering mistake in AI applications is letting a non-deterministic LLM make hidden decisions. If you ask an LLM: *"Does this student qualify for this scholarship?"*, it will frequently hallucinate or give inconsistent answers.

Deadline Buddy is built on a **defensible, split-brain architecture**:
- **Open-Source AI / Open Weights:** Used where language models excel — extracting structured JSON from messy PDFs/transcripts and explaining complex mismatches in plain English.
- **Deterministic TypeScript Code:** Used where mathematics and logic belong — comparing GPA scales, academic years, and citizenship lists.

```
       [ Uploaded Documents (Resume / Transcripts / Certificates) ]
                                   │
                                   ▼
        ┌─────────────────────────────────────────────────────┐
        │ Open-Weight Extractor / Local AST Document Pipeline │
        └──────────────────────────┬──────────────────────────┘
                                   │ (Structured JSON Profile + Quotes)
                                   ▼
        ┌─────────────────────────────────────────────────────┐
        │           Deterministic Code Rules Engine           │
        │               (shared/eligibility.ts)               │
        │                                                     │
        │  Requirement           Student Profile      Result  │
        │  ─────────────────────────────────────────────────  │
        │  Citizenship: India    India                  ✓     │
        │  Min GPA ≥ 7.5         8.4 / 10               ✓     │
        │  Final Year Standing   3rd year of 4          ✕     │
        └──────────────────────────┬──────────────────────────┘
                                   │
                                   ▼
        ┌─────────────────────────────────────────────────────┐
        │        Three-State Explainable Evaluation           │
        │  🟢 Eligible    🟡 Needs Verification    🔴 Ineligible
        └──────────────────────────┬──────────────────────────┘
                                   │
                                   ▼
        ┌─────────────────────────────────────────────────────┐
        │      Interactive "Why?" Evidence Drawer & Shortlist  │
        │      • Exact supporting quotes from your documents  │
        │      • Open AI Strategy Advisor with gap workarounds│
        └─────────────────────────────────────────────────────┘
```

### The Three Eligibility States

1. **🟢 Eligible:** Every checkable published requirement strictly passes.
2. **🔴 Ineligible:** A hard rule failed (e.g. scholarship requires a completed Bachelor's degree, but the student is currently in year 3).
3. **🟡 Needs Verification (The Crucial Third State):** The scholarship requires subjective criteria (like "community leadership") or university nomination that cannot be conclusively proven from the transcript. **We refuse to guess or hallucinate an approval when proof is missing.**

### The GPA Uncertainty Band

International GPA scale conversions vary across universities. Deadline Buddy enforces an explicit uncertainty threshold:
```typescript
const diff = studentGpaRatio - requiredGpaRatio;
if (diff >= GPA_UNCERTAINTY_BAND) return check(req, "pass", ...);
if (diff <= -GPA_UNCERTAINTY_BAND) return check(req, "fail", ...);
return check(req, "unknown", ...); // Refuse to guess borderline scores!
```

---

## Why Does Open Innovation Matter?

This project could not — and should not — be built using closed, black-box cloud APIs. Open innovation was essential for four reasons:

### 1. Data Sovereignty & Privacy of Sensitive Student Records
Transcripts contain sensitive personal data: grades, birthdates, student identification numbers, and residential addresses. Forcing a student to upload their confidential academic transcripts to a closed commercial third-party server creates serious privacy and FERPA/GDPR compliance risks. By using open-weight models and client-side extraction (`pdfjs-dist` + local AST parsers), **student documents never leave their laptop**.

### 2. Zero-Cost Accessibility for Independent Students
Commercial LLM APIs charge per token. A single student uploading three 10-page transcripts and a CV would burn hundreds of thousands of context tokens, making the tool prohibitively expensive to run at scale for students in developing nations. Open weights democratize access at zero marginal cost.

### 3. Open Requirements as Community Commons
Every scholarship in Deadline Buddy is modeled as transparent code (`shared/requirements.ts`). Instead of proprietary scrapers, the requirements are open-source data that the community can audit, contribute to, and keep up to date for every Hacktoberfest cycle.

### 4. Deterministic Explainability Beats "Trust Me" AI
Closed AI products act as black boxes. By open-sourcing the deterministic rules engine, students can verify the exact logic that determined their qualification: code doesn't hallucinate.

---

## What My Friend Said When They Tried It

> *"I used to have four different spreadsheets trying to track what was due in November versus what I wasn't even allowed to apply for yet. Clicking the red 'Not eligible' badge on Vanier and seeing immediately that it was because I'm in Year 3 of a Bachelor's saved me about three days of writing an essay for something I couldn't win anyway. The 'Needs verification' badge on DAAD told me exactly what certificate I needed to ask my department head for."*

---

## Prize Categories

- **Hacktoberfest Weekend Challenge: Build for a Friend**
- **Open Source AI / Local Inference**
