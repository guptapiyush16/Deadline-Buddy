# Application Execution Flow

This document details how execution travels across modules, components, and functions within **Duewise (Deadline Buddy)**.

---

## 1. High-Level System Architecture

```mermaid
graph TD
    User([Browser Client]) -->|Loads HTML| IndexHTML[client/index.html]
    IndexHTML -->|Imports Entry| MainTSX[client/src/main.tsx]
    MainTSX -->|Mounts Component| AppTSX[client/src/App.tsx]
    AppTSX -->|Provides Context & Routing| RouterSwitch[wouter Switch]
    RouterSwitch -->|Route: '/'| Home[client/src/pages/Home.tsx]

    subgraph Document Intake Pipeline
        Home -->|Drop / File Selection| FileParser[client/src/lib/extractText.ts]
        Home -->|1-Click Demo| SampleData[shared/sampleData.ts]
        FileParser -->|Plain text strings| Extractor[shared/heuristics.ts: extractProfileFromText]
        SampleData -->|Preset document text| Extractor
        Extractor -->|StudentProfile & Evidence[]| ProfileState[React profile State]
    end

    subgraph Deterministic Rules Engine
        ProfileState -->|Reactive Dependency| Engine[shared/eligibility.ts: evaluate]
        Dataset[shared/scholarships.ts] -->|Requirements List| Engine
        Engine -->|Per-requirement evaluation| CheckReq[evaluateRequirement]
        CheckReq -->|Pass / Fail / Unknown| EvalResult[Evaluation Map]
    end

    subgraph UI Render & Interaction
        EvalResult --> Dashboard[Live Scholarship Cards List]
        Dashboard -->|Click Status Pill| Drawer[Signature Why? Evidence Drawer]
        Dashboard -->|Toggle Bookmark| SavedState[Saved Shortlist with Deadline Sorting]
        Dashboard -->|Topbar Action| ArchModal[Open AI Architecture Inspector]
    end
```

---

## 2. Frontend Lifecycle & Mounting Flow

1. **HTML & Entrypoint Boot:**
   - [client/index.html](file:///d:/Projects/Deadlinne%20buddy/client/index.html) loads Vite's main script at [client/src/main.tsx](file:///d:/Projects/Deadlinne%20buddy/client/src/main.tsx).
   - [main.tsx](file:///d:/Projects/Deadlinne%20buddy/client/src/main.tsx) initializes the React DOM root, injects React Query `QueryClientProvider`, sets up tRPC link, and mounts `<App />`.

2. **App Core Shell Setup:**
   - [client/src/App.tsx](file:///d:/Projects/Deadlinne%20buddy/client/src/App.tsx) wraps the application inside:
     - `ErrorBoundary`: Catches unhandled runtime UI errors.
     - `ThemeProvider`: Sets the color theme token baseline.
     - `TooltipProvider` & `Toaster`: Global UI utility feedback.
     - `Router`: Uses `wouter` to resolve `/` to `<Home />`.

3. **Home Page State Initialization:**
   - [client/src/pages/Home.tsx](file:///d:/Projects/Deadlinne%20buddy/client/src/pages/Home.tsx) initializes:
     - `currentStep`: `"upload"` | `"profile"` | `"country"` | `"dashboard"`.
     - `documents`: Initialized with Rahul's sample documents or user-uploaded files.
     - `profile`: Extracted student attributes (`StudentProfile`).
     - `evidenceList`: Document quotes supporting extracted fields (`Evidence[]`).
     - `selectedCountryKey`: Active destination (e.g. `"canada"`, `"germany"`, `"usa"`).
     - `activeFilter`: `"all"` | `"eligible"` | `"verification"` | `"ineligible"`.
     - `sortMode`: `"deadline"` | `"match"`.
     - `savedIds`: Bookmarked scholarship IDs.
     - `selectedScholarshipId`: Active scholarship inspected in the "Why?" drawer.

---

## 3. Function & Module Execution Pathways

### A. Document Intake & Profile Parsing Flow
```
User drops files OR clicks "Load Rahul's Sample Documents"
    │
    ├── Path 1: 1-Click Demo (handleLoadSample)
    │     └── Reads SAMPLE_DOCUMENTS from shared/sampleData.ts
    │
    └── Path 2: File Upload (handleFileUpload)
          └── Iterates through files:
                └── extractTextFromFile(file) (client/src/lib/extractText.ts)
                      ├── PDF: pdfjs.getDocument -> page.getTextContent()
                      ├── DOCX: mammoth.extractRawText()
                      └── TXT / MD: FileReader.readAsText()
    │
    ▼
extractProfileFromText(documents) (shared/heuristics.ts)
    ├── Extracts name, nationality, GPA/scale, degree, field, year of study
    ├── Detects graduation year, skills, achievements, leadership, research
    ├── Gathers exact evidence quotes with source document filenames
    └── Returns { profile: StudentProfile, evidence: Evidence[], ... }
    │
    ▼
setProfile(result.profile) & setEvidenceList(result.evidence)
    │
    ▼
Navigates to Step 2: "profile" (Editable Profile Review Form)
```

### B. Deterministic Eligibility Evaluation Flow
```
profile state changes (via initial extraction or live user edits)
    │
    ▼
evaluationsMap useMemo hook recomputes:
    └── For each scholarship in shared/scholarships.ts:
          └── evaluate(profile, scholarship) (shared/eligibility.ts)
                │
                ├── Iterates over scholarship.requirements:
                │     └── evaluateRequirement(req, profile, today)
                │           ├── "targetLevel": checks if req.levels.includes(profile.targetLevel)
                │           ├── "nationality": checks allowed / excluded country lists
                │           ├── "minGpa": normalizes student's GPA and requirement scale:
                │           │     ├── diff >= 0.03  → "pass"
                │           │     ├── diff <= -0.03 → "fail"
                │           │     └── |diff| < 0.03 → "unknown" (Uncertainty Band)
                │           ├── "finalYearOrGraduated": checks yearOfStudy vs programYears
                │           ├── "minWorkExperience": checks profile.workExperienceMonths
                │           └── "evidence": checks if leadership/research lists have items
                │
                ├── Computes status:
                │     ├── If any check failed   → status = "ineligible"
                │     ├── Else if any unknown   → status = "verification"
                │     └── Else (all passed)     → status = "eligible"
                │
                └── Returns Evaluation { scholarshipId, status, checks, headline, daysLeft, ... }
    │
    ▼
Display list live-updates:
    ├── Recalculates countryCounts: { total, eligible, verification, ineligible }
    └── Recalculates displayScholarships: filtered by activeFilter & sorted by sortMode
```

### C. Signature "Why Am I Not Eligible?" Drawer Flow
```
User clicks Status Badge on a scholarship card
    │
    ▼
setSelectedScholarshipId(scholarship.id)
    │
    ▼
React resolves:
    ├── selectedScholarship = scholarships.find(s => s.id === id)
    └── selectedEval = evaluationsMap.get(id)
    │
    ▼
Overlay renders .reason-drawer with side-by-side evidence:
    ├── Header: Status badge (Eligible / Needs verification / Ineligible)
    ├── For each item in selectedEval.checks:
    │     ├── Outcome pill: "✓ PASSED" | "✕ NOT MET" | "🟡 NEEDS VERIFICATION"
    │     ├── Published Requirement: check.requirement.text
    │     └── Extracted Evidence: check.yourValue + check.reason
    ├── Source Callout: link to official university / government program page
    └── Action Button: "Edit Profile to Re-test"
```

### D. Shortlist & Deadline Tracking Flow
```
User clicks Save button (toggleSave(scholarship.id))
    │
    ▼
setSavedIds(prev => toggled)
    │
    ▼
User clicks "Saved shortlist" tab (setViewSavedOnly(true))
    │
    ▼
displayScholarships filters scholarships by savedIds:
    └── Sorts by daysLeft (deadline soonest)
          └── Cards display urgency indicator (e.g. "(26 days left)")
```

### E. Open AI Strategy Advisor Flow
```
User opens "Why?" Evidence Drawer and clicks "⚡ Ask Open AI Strategy Advisor"
    │
    ▼
setAdvisorLoading(true)
    │
    ▼
generateStrategyPlan(profile, selectedScholarship, selectedEval) (shared/aiAdvisor.ts)
    ├── Analyzes failed & unknown checks from selectedEval
    ├── Categorizes feasibility:
    │     ├── All pass: "Immediate Action Required"
    │     ├── Academic stage mismatch: "Target Next Academic Cycle"
    │     └── Level / citizenship blocker: "Alternative Track Recommended"
    ├── Formulates keyObstacles:
    │     ├── Obstacle title, detailed breakdown, and action guidance
    ├── Recommends alternatives:
    │     └── Filters viable scholarships in the same country / field
    └── Formulates concrete recommendedNextSteps
    │
    ▼
setStrategyPlan(plan) & setAdvisorLoading(false)
    │
    ▼
Renders interactive Strategy Plan card inside drawer with actionable recommendations
```

### F. AI Guideline Lab & Playground Flow
```
User clicks "🧪 AI Guideline Lab" in topbar navigation
    │
    ▼
setShowParserModal(true)
    │
    ▼
User pastes raw multi-page scholarship guideline text into textarea
    │
    ▼
User clicks "Extract Structured Criteria"
    │
    ▼
Executes client-side AST pattern matcher:
    ├── Scans for GPA thresholds (e.g. "minimum 75%", "GPA of 3.5")
    ├── Scans for citizenship / nationality lists
    ├── Scans for graduation standing / degree requirements
    └── Scans for English test bands (IELTS, TOEFL)
    │
    ▼
Displays extracted structured JSON rules and plain-English preview cards
```

### G. Production Deployment Flow (Vercel / Netlify / Cloudflare)
```
Git Repository Pushed to GitHub
    │
    ▼
Vercel / Netlify Webhook Triggered
    │
    ▼
Build Step Executes:
    ├── `npm run build` invokes `vite build`
    ├── Bundles React 19 app + Tailwind CSS + pdfjs-dist assets
    └── Outputs optimized static assets to `dist/public`
    │
    ▼
Edge CDN Distribution:
    ├── Serves `dist/public/index.html` on all routes (SPA rewrite via vercel.json / netlify.toml)
    ├── Cached worldwide with zero server cold starts
    └── Zero backend runtime cost or API key exposure
```


