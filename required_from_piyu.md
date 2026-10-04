# Required from Piyu (Setup & API Keys)

Hello Piyu! Here is the clear breakdown of what is required from you to run, demo, and submit **Duewise (Deadline Buddy)**.

---

## 1. Do You Need to Provide Any API Keys?

### 👉 Short Answer: **NO API KEYS ARE REQUIRED (0).**

The project is **100% functional, self-contained, and ready to run immediately** without requiring any paid, closed, or external API keys (no OpenAI key, no Anthropic key, no AWS key needed).

### Why?
One of the core judging criteria for the Hacktoberfest **"Build for a Friend"** challenge is **Open Innovation**:
1. **Privacy-Preserving Local Engine:** We built a local AST/heuristic parser and client-side multi-format reader (`pdfjs-dist` + `mammoth` + text extractor) that parses resumes and transcripts entirely locally in the browser/node sandbox.
2. **Deterministic Rules Engine:** The eligibility checks run via pure TypeScript functions in `shared/eligibility.ts`. It compares the student's profile against structured requirements without needing to make expensive cloud LLM calls that could hallucinate.
3. **Evidence Grounding:** Quotes and evidence trails are extracted and cross-referenced directly from the uploaded document text.

---

## 2. Optional Enhancements (If You Want to Hook Up an Open LLM)

If you have a local open-weight model running (such as **Ollama** running `llama3:8b` or `mistral`) or want to connect an open model endpoint, the codebase can optionally accept these environment variables in your `.env` file:

```env
# OPTIONAL: Only if you want to route extraction through a local Ollama instance
OLLAMA_BASE_URL="http://localhost:11434"
OLLAMA_MODEL="llama3.1:8b"

# OPTIONAL: Port configuration (defaults to 3000)
PORT=3000
```

> **Note:** Even if these are completely omitted or left blank, the app will automatically and seamlessly use the built-in local deterministic extractor. You do not need to configure anything to run the full application.

---

## 3. How to Run the Project Locally

To run the development server on Windows or any platform:

```bash
# Start development server (boots in ~400ms)
npm run dev

# Run all automated tests (11/11 passing tests)
npm test

# Type-check TypeScript
npm run check
```

Then open your browser at:
`http://localhost:3000`

---

## 4. How to Demo for Judges or Video Walkthrough

1. Open `http://localhost:3000`.
2. Notice the app starts **clean and pristine on Step 1 (Upload Documents)**.
3. Click the button:
   **`⚡ Load Sample Student Documents (1-Click Demo)`**
   *(This immediately loads sample Resume and Semester 5 Transcript).*
4. Click **"Proceed to Profile Verification →"** to inspect the extracted attributes (CGPA 8.4/10, 3rd year B.Tech, skills, hackathon achievements).
5. Edit any field (e.g., change Year from 3 to 4, or change GPA) and notice how the confidence meter and eligibility re-evaluate!
6. Select a destination country (e.g. **Canada** or **Germany** or **USA**).
7. Explore the 4 filter tabs (`All`, `✓ Eligible`, `🟡 Needs verification`, `✕ Not eligible`).
8. Click on any status pill to trigger the signature **"Why am I not eligible?" / "Why am I eligible?" Evidence Drawer**.
9. Inside the drawer, click **`⚡ Ask Open AI Strategy Advisor`** to generate a diagnostic gap plan with feasibility analysis and alternative scholarships!
10. Click **"🧪 AI Guideline Lab"** in the top navigation to demonstrate client-side unstructured guideline extraction!
11. Click **"How Open AI Works"** in the topbar to show judges the open innovation pipeline!

---

## 5. What is Ready for Submission?
- A complete, copy-paste-ready submission draft has been created at [`SUBMISSION.md`](file:///d:/Projects/Deadlinne%20buddy/SUBMISSION.md) matching the official DEV.to Hacktoberfest challenge template.
