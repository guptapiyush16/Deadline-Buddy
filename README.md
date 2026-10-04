# 🎓 Deadline Buddy — The Open-Source Scholarship Compass

> **"Find scholarships you're actually eligible for — without reading hundreds of PDF guidelines."**  
> *Built for the [Hacktoberfest 2026 Weekend Challenge: Build for a Friend](https://dev.to/challenges/hacktoberfest-weekend-2026-10-01).*

[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-61dafb.svg)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-7.1-646cff.svg)](https://vitejs.dev/)
[![Tests](https://img.shields.io/badge/Tests-Passing%20(11%2F11)-brightgreen.svg)](https://vitest.dev/)
[![Zero API Keys](https://img.shields.io/badge/API%20Keys-Zero%20Required-success.svg)](#zero-api-keys-guarantee)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## 📖 The Story: Building for a Friend

My close friend is a 3rd-year Computer Science undergraduate at NIT Karnataka, Surathkal in India. Like thousands of ambitious students worldwide, their dream is to pursue a Master's degree abroad in AI and Distributed Systems.

A few weeks ago, I watched them spend an entire weekend buried under dozens of open browser tabs: **DAAD** in Germany, **EduCanada**, **Fulbright** in the US, **Chevening** and **Commonwealth** in the UK. Each scholarship program had 40- to 80-page PDF guidelines filled with dense institutional jargon:
- *"Does a 4-year Indian B.Tech degree count as final-year standing right now?"*
- *"Does an 8.4 / 10 CGPA satisfy the 'first-class honours or 2:1 equivalent' threshold?"*
- *"Does a national hackathon finalist certificate meet 'demonstrated community leadership'?"*

Existing scholarship portals were useless: they either served as lead-generation farms or slapped an opaque *"87% Match"* badge on a card without explaining **why** they qualified. The alternative—spending 20 hours drafting an essay only to be rejected over a technical disqualifier on page 52—was heartbreaking.

**Deadline Buddy was built for my friend and ambitious students worldwide.**

---

## ⚡ The 5-Step Product Experience

Deadline Buddy transforms scholarship discovery into a transparent, stress-free 5-step loop:

1. **📄 Document Intake:** Drag-and-drop unofficial transcripts, resumes, or certificates (PDF, DOCX, TXT). *(For reviewers: a 1-click `⚡ Load Sample Student Documents` button is included on Step 1).*
2. **👤 Structured Profile Verification:** The system extracts key attributes (GPA, current year of study, program length, graduation year, degrees, skills, achievements) into an editable profile with supporting document evidence quotes.
3. **🌍 Destination Country Selection:** Select a target country (USA, Canada, UK, Germany, Australia, Netherlands, Singapore, Japan) with regional guides, currencies, and official portal links.
4. **⚖️ Deterministic Eligibility Matching:** Pure code evaluates published criteria against the student's profile, categorizing each award into **Eligible (✓)**, **Needs Verification (🟡)**, or **Ineligible (✕)**.
5. **🔍 The Signature "Why?" Evidence Drawer & AI Strategy Advisor:**
   - Click any card to inspect an exact side-by-side audit trail: published rule vs. your profile value vs. original document quote.
   - Click **`⚡ Ask Open AI Strategy Advisor`** for personalized gap analysis, feasibility scoring, and alternative scholarship recommendations.
   - Click **`🧪 Open AI Guideline Lab`** to paste raw institutional PDF text and test guideline parsing.

---

## 🧠 Architectural Philosophy: AI for Extraction, Code for Truth

The single most dangerous design flaw in AI applications is letting a non-deterministic LLM make hidden decisions on eligibility. If an LLM is asked *"Does this student qualify for this scholarship?"*, it will frequently hallucinate or give inconsistent answers.

Deadline Buddy solves this with a **Dual-Engine Architecture**:

```
     [ Uploaded Documents (Resume / Transcript / Certificates) ]
                                 │
                                 ▼
      ┌─────────────────────────────────────────────────────┐
      │  Open AI Document Extractor & Local Heuristics Pipeline │
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
      │          Three-State Explainable Evaluation         │
      │  🟢 Eligible    🟡 Needs Verification    🔴 Ineligible │
      └──────────────────────────┬──────────────────────────┘
                                 │
                                 ▼
      ┌─────────────────────────────────────────────────────┐
      │      Interactive "Why?" Evidence Drawer & Advisor    │
      │      • Exact supporting quotes from your documents  │
      │      • AI Strategy Advisor with gap action steps     │
      └─────────────────────────────────────────────────────┘
```

### The Three Eligibility States

1. **🟢 Eligible:** Every checkable published requirement passes strictly.
2. **🔴 Ineligible:** A hard rule failed (e.g. scholarship requires a completed Bachelor's degree, but the student is currently a 3rd-year undergraduate).
3. **🟡 Needs Verification (The Crucial Third State):** The scholarship requires subjective criteria (like "demonstrated community leadership") or university nomination that cannot be conclusively proven from the uploaded documents. **We refuse to guess or hallucinate an approval when proof is missing.**

---

## 🔒 Zero API Keys Guarantee

**Deadline Buddy runs 100% out of the box with zero external API keys.**

- **Zero Paid Dependencies:** No OpenAI, Claude, or proprietary API keys required.
- **Client-Side Document Parsing:** In-browser PDF (`pdfjs-dist`) and DOCX (`mammoth`) text extraction.
- **Local AST / Heuristics Engine:** Fast deterministic profile extractor for zero-latency local execution.
- **100% Data Privacy:** Your transcripts and resumes are never transmitted to third-party AI companies or servers. Everything is processed locally in memory.
- *(Optional)* Support for local **Ollama** (`llama3.2`, `mistral`) or self-hosted open-weight endpoints.

---

## 🚀 Quickstart Guide

### Prerequisites
- Node.js 18+ (tested on Node 20 & 22)
- npm or pnpm

### 1. Installation
```bash
git clone https://github.com/your-username/deadline-buddy.git
cd deadline-buddy
npm install
```

### 2. Start Development Server
```bash
npm run dev
```
Open **`http://localhost:3000`** in your browser.

### 3. Quick 1-Click Demo
1. On Step 1 (Upload Documents), click the **`⚡ Load Sample Student Documents`** button.
2. The system loads realistic sample documents (Resume and NITK Semester 5 Transcript).
3. Click **`Proceed to Profile Verification →`** to review extracted credentials.
4. Click **`Explore Target Destinations →`** and choose a country (e.g., Canada, Germany, UK).
5. Review the categorized scholarship cards. Click any card to open the **"Why?" Evidence Drawer** and test the **AI Strategy Advisor**!

---

## 🧪 Testing & Validation

The codebase includes comprehensive unit tests verifying the deterministic eligibility engine, boundary conditions (such as the ±3% GPA uncertainty band), and the AI Strategy Advisor:

```bash
# Run unit test suite
npm run test

# Type-check TypeScript codebase
npm run check

# Create production build
npm run build
```

---

## 🌐 How to Host (Deployment Guide)

Deadline Buddy runs **100% client-side** with zero external databases or paid API keys, making it effortlessly hostable on any free modern hosting service in under 60 seconds.

### Step 1: Push Code to GitHub

```bash
git init
git add .
git commit -m "feat: Deadline Buddy — Open-Source Scholarship Compass"
git branch -M main
git remote add origin https://github.com/<your-username>/deadline-buddy.git
git push -u origin main
```

---

### Option A: Deploy on Vercel (Recommended — 60 Seconds, 100% Free)

1. Go to [vercel.com](https://vercel.com) and log in with your GitHub account.
2. Click **"Add New..."** → **"Project"**.
3. Select your `deadline-buddy` repository and click **Import**.
4. The repository already includes [`vercel.json`](file:///d:/Projects/Deadlinne%20buddy/vercel.json) with preconfigured settings:
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist/public`
5. Click **Deploy**.
6. In ~30 seconds, your site will be live with a free `*.vercel.app` URL and automatic HTTPS!

---

### Option B: Deploy on Netlify (100% Free)

1. Go to [netlify.com](https://netlify.com) and log in.
2. Click **"Add new site"** → **"Import an existing project"**.
3. Connect your GitHub repository.
4. The repository already includes [`netlify.toml`](file:///d:/Projects/Deadlinne%20buddy/netlify.toml), so Netlify automatically reads:
   - **Build command:** `npm run build`
   - **Publish directory:** `dist/public`
5. Click **Deploy Site**.

---

### Option C: Deploy with Docker / Render / Railway

If you prefer full-stack containerized hosting:
1. Connect your repo to [Render](https://render.com) or [Railway](https://railway.app).
2. Choose **Docker** as the environment (the project includes a production-ready `Dockerfile`).
3. Set Port to `3000`. Deploy!


---

## 📂 Project Structure

```
├── client/                     # Frontend Application (React 19 + Vite + Tailwind CSS)
│   ├── src/
│   │   ├── pages/Home.tsx      # Main 5-Step Scholarship Discovery Application
│   │   ├── lib/extractText.ts  # Client-side PDF / DOCX / TXT extraction
│   │   ├── index.css           # Premium design tokens & responsive components
│   │   └── App.tsx             # Root router & theme provider
├── shared/                     # Universal Logic (Client & Server Isomorphic)
│   ├── eligibility.ts          # Pure deterministic eligibility rules engine (3 states)
│   ├── eligibility.test.ts     # Vitest test suite for eligibility & AI advisor
│   ├── aiAdvisor.ts            # Open AI Strategy Advisor gap diagnosis engine
│   ├── scholarships.ts         # 26 verified scholarships across 8 global destinations
│   ├── requirements.ts         # Discriminated union schemas for scholarship criteria
│   ├── heuristics.ts           # Local AST document & evidence extractor
│   ├── sampleData.ts           # Realistic sample documents for demo testing
│   └── profile.ts              # Zod schemas for student profiles and evidence quotes
├── server/                     # Optional Express & tRPC Backend Services
├── Decisions.md                # Architectural Decision Record (logged per project rules)
├── Flow.md                     # Runtime execution trace & data flow documentation
├── required_from_piyu.md       # API key & configuration audit (0 required)
└── SUBMISSION.md               # DEV.to Hacktoberfest submission post draft
```

---

## 📜 License

Distributed under the **MIT License**. See `LICENSE` for details. Built with ❤️ for ambitious students navigating scholarship deadlines everywhere.
