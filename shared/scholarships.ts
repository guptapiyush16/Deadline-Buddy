/**
 * Curated scholarship dataset (v1).
 *
 * Each entry's `requirements` were drafted from the official page and are meant
 * to be reviewed by a human before each cycle — see scripts/extract-requirements.ts
 * for the open-model extraction step that produces the first draft.
 *
 * IMPORTANT: deadlines marked `deadlineEstimated: true` are based on the previous
 * cycle. The UI always says so and links to the official source.
 */
import type { Requirement } from "./requirements";

export type CountryKey =
  | "usa"
  | "canada"
  | "uk"
  | "germany"
  | "australia"
  | "netherlands"
  | "singapore"
  | "japan";

export type Country = {
  key: CountryKey;
  name: string;
  short: string;
  flag: string;
  region: string;
  accent: string;
  accentSoft: string;
  glow: string;
  landscape: string;
  guide: string;
  guideLabel: string;
  intro: string;
  note: string;
  currency: string;
};

export type FundingType = "full" | "partial" | "stipend";

export type Scholarship = {
  id: string;
  countryKey: CountryKey;
  name: string;
  provider: string;
  levelLabel: string;
  funding: FundingType;
  award: string;
  /** ISO date (yyyy-mm-dd). */
  deadline: string;
  deadlineEstimated: boolean;
  summary: string;
  source: string;
  lastReviewed: string;
  requirements: Requirement[];
};

export const REVIEW_DATE = "October 2026";

export const countries: Record<CountryKey, Country> = {
  usa: {
    key: "usa",
    name: "United States",
    short: "US",
    flag: "🇺🇸",
    region: "North America",
    accent: "#5774d8",
    accentSoft: "#eef1ff",
    glow: "linear-gradient(135deg, #efb1a6 0%, #a6bfe7 52%, #536cb0 100%)",
    landscape: "SEQUOIA · CALIFORNIA",
    guide: "https://educationusa.state.gov/your-5-steps-us-study/finance-your-studies",
    guideLabel: "EducationUSA funding guide",
    intro: "Big opportunities, with a little more paperwork to decode.",
    note: "US funding mixes university awards, assistantships and external fellowships — always check which one you're reading.",
    currency: "USD",
  },
  canada: {
    key: "canada",
    name: "Canada",
    short: "CA",
    flag: "🇨🇦",
    region: "North America",
    accent: "#ef7050",
    accentSoft: "#fff0ea",
    glow: "linear-gradient(135deg, #f4c6a8 0%, #b7d9d7 52%, #6f9b9d 100%)",
    landscape: "BANFF · ALBERTA",
    guide: "https://www.educanada.ca/scholarships-bourses/index.aspx?lang=eng",
    guideLabel: "EduCanada scholarships",
    intro: "A strong fit for curious builders who want room to grow.",
    note: "Most Canadian graduate awards are applied for after (or alongside) admission — your offer letter matters.",
    currency: "CAD",
  },
  uk: {
    key: "uk",
    name: "United Kingdom",
    short: "UK",
    flag: "🇬🇧",
    region: "Europe",
    accent: "#9c65bb",
    accentSoft: "#f5edfb",
    glow: "linear-gradient(135deg, #d7b6df 0%, #9bb3da 48%, #657ea8 100%)",
    landscape: "LAKE DISTRICT · CUMBRIA",
    guide: "https://study-uk.britishcouncil.org/scholarships-funding",
    guideLabel: "Study UK funding",
    intro: "One-year master's, focused research, a clear route forward.",
    note: "Several big UK awards ask for work experience or a completed degree at the time you apply — read the timing carefully.",
    currency: "GBP",
  },
  germany: {
    key: "germany",
    name: "Germany",
    short: "DE",
    flag: "🇩🇪",
    region: "Europe",
    accent: "#c58d3d",
    accentSoft: "#fbf4e5",
    glow: "linear-gradient(135deg, #f2cf9f 0%, #c0cda7 50%, #708d8b 100%)",
    landscape: "BLACK FOREST · BADEN",
    guide: "https://www.daad.de/en/study-and-research-in-germany/scholarships/",
    guideLabel: "DAAD scholarship database",
    intro: "Low tuition and a practical path for research-minded students.",
    note: "DAAD options vary by level and field; a convincing study plan carries real weight.",
    currency: "EUR",
  },
  australia: {
    key: "australia",
    name: "Australia",
    short: "AU",
    flag: "🇦🇺",
    region: "Oceania",
    accent: "#2a9d93",
    accentSoft: "#e8f7f4",
    glow: "linear-gradient(135deg, #f4cf9b 0%, #92d0bb 52%, #3f8c8e 100%)",
    landscape: "GREAT OCEAN ROAD · VICTORIA",
    guide: "https://www.studyaustralia.gov.au/en/plan-your-move/scholarships",
    guideLabel: "Study Australia scholarships",
    intro: "For ambitious students who want a new horizon.",
    note: "Australian awards can cover tuition, living costs or both — and some government awards are country-restricted.",
    currency: "AUD",
  },
  netherlands: {
    key: "netherlands",
    name: "Netherlands",
    short: "NL",
    flag: "🇳🇱",
    region: "Europe",
    accent: "#e07a2f",
    accentSoft: "#fff3e8",
    glow: "linear-gradient(135deg, #f7c59a 0%, #b9cfe0 50%, #5d86a6 100%)",
    landscape: "KEUKENHOF · SOUTH HOLLAND",
    guide: "https://www.studyinnl.org/finances/scholarships",
    guideLabel: "Study in NL scholarships",
    intro: "English-taught programmes and a famously direct culture.",
    note: "Dutch awards are usually tied to a specific university and programme — shortlist programmes first.",
    currency: "EUR",
  },
  singapore: {
    key: "singapore",
    name: "Singapore",
    short: "SG",
    flag: "🇸🇬",
    region: "Asia",
    accent: "#df5f6a",
    accentSoft: "#fff0f1",
    glow: "linear-gradient(135deg, #f2b7b4 0%, #edcab1 46%, #7da7ae 100%)",
    landscape: "MARINA BAY · SINGAPORE",
    guide: "https://www.moe.gov.sg/financial-matters/awards-scholarships",
    guideLabel: "MOE awards & scholarships",
    intro: "A compact ecosystem with serious research momentum.",
    note: "Research degrees are often fully funded; coursework master's rarely are.",
    currency: "SGD",
  },
  japan: {
    key: "japan",
    name: "Japan",
    short: "JP",
    flag: "🇯🇵",
    region: "Asia",
    accent: "#c2577a",
    accentSoft: "#fdeef3",
    glow: "linear-gradient(135deg, #f6c1cf 0%, #d9c8e6 50%, #7b8fb5 100%)",
    landscape: "ARASHIYAMA · KYOTO",
    guide: "https://www.studyinjapan.go.jp/en/",
    guideLabel: "Study in Japan",
    intro: "Government-funded research routes with generous stipends.",
    note: "MEXT applications go through the Japanese embassy in your country — timelines start early.",
    currency: "JPY",
  },
};

export const countryOrder: CountryKey[] = [
  "usa", "canada", "uk", "germany", "australia", "netherlands", "singapore", "japan",
];

const ANY_DEGREE_LEVEL_GRAD: Requirement = {
  id: "level-grad",
  kind: "targetLevel",
  levels: ["masters", "phd"],
  text: "Funds postgraduate study (master's or PhD).",
};

export const scholarships: Scholarship[] = [
  // ───────────────────────── United States ─────────────────────────
  {
    id: "knight-hennessy",
    countryKey: "usa",
    name: "Knight-Hennessy Scholars",
    provider: "Stanford University",
    levelLabel: "Master's / PhD",
    funding: "full",
    award: "Full tuition + living stipend (up to 3 years)",
    deadline: "2026-10-08",
    deadlineEstimated: true,
    summary: "Stanford's flagship graduate scholarship for future leaders, open to every nationality.",
    source: "https://knight-hennessy.stanford.edu/",
    lastReviewed: REVIEW_DATE,
    requirements: [
      ANY_DEGREE_LEVEL_GRAD,
      { id: "khs-degree", kind: "degreeCompletedBy", year: 2027, text: "Bachelor's degree completed before enrolling (autumn 2027)." },
      { id: "khs-recent", kind: "maxYearsSinceGraduation", years: 7, text: "First bachelor's earned no more than 7 years before applying." },
      { id: "khs-leadership", kind: "evidence", topic: "leadership", text: "Demonstrated independence of thought, purposeful leadership and a civic mindset." },
    ],
  },
  {
    id: "fulbright-nehru-masters",
    countryKey: "usa",
    name: "Fulbright-Nehru Master's Fellowships",
    provider: "USIEF (US-India Educational Foundation)",
    levelLabel: "Master's",
    funding: "full",
    award: "Tuition, living costs, airfare (1–2 years)",
    deadline: "2027-05-15",
    deadlineEstimated: true,
    summary: "Fully funded US master's for Indian professionals with community-facing experience.",
    source: "https://www.usief.org.in/",
    lastReviewed: REVIEW_DATE,
    requirements: [
      { id: "fn-nat", kind: "nationality", allowed: ["india"], text: "Open to Indian citizens residing in India." },
      { id: "fn-level", kind: "targetLevel", levels: ["masters"], text: "Funds a master's degree in the US." },
      { id: "fn-degree", kind: "degreeCompletedBy", year: 2026, text: "Must already hold the equivalent of a US bachelor's degree when applying." },
      { id: "fn-work", kind: "minWorkExperience", months: 36, text: "At least three years of full-time professional work experience." },
    ],
  },
  {
    id: "tata-cornell",
    countryKey: "usa",
    name: "Tata Scholarship at Cornell",
    provider: "Cornell University · Tata Education and Development Trust",
    levelLabel: "Undergraduate",
    funding: "full",
    award: "Covers full demonstrated financial need",
    deadline: "2027-01-02",
    deadlineEstimated: true,
    summary: "Need-based aid for Indian students admitted to Cornell as undergraduates.",
    source: "https://finaid.cornell.edu/",
    lastReviewed: REVIEW_DATE,
    requirements: [
      { id: "tata-nat", kind: "nationality", allowed: ["india"], text: "Indian citizens only." },
      { id: "tata-level", kind: "targetLevel", levels: ["bachelors"], text: "Only for students entering Cornell as first-year undergraduates." },
    ],
  },
  {
    id: "inlaks",
    countryKey: "usa",
    name: "Inlaks Shivdasani Scholarships",
    provider: "Inlaks Shivdasani Foundation",
    levelLabel: "Master's / PhD",
    funding: "full",
    award: "Up to USD 100,000 (tuition, living, travel)",
    deadline: "2027-03-31",
    deadlineEstimated: true,
    summary: "For exceptional Indian students admitted to top US, UK and European universities.",
    source: "https://www.inlaksfoundation.org/scholarships/",
    lastReviewed: REVIEW_DATE,
    requirements: [
      { id: "inlaks-nat", kind: "nationality", allowed: ["india"], text: "Indian citizens resident in India." },
      ANY_DEGREE_LEVEL_GRAD,
      { id: "inlaks-age", kind: "maxAge", age: 30, asOf: "2027-07-01", text: "Under 30 years of age on 1 July of the award year." },
      { id: "inlaks-degree", kind: "degreeCompletedBy", year: 2027, text: "Degree from a recognised Indian institution before the course starts." },
      { id: "inlaks-offer", kind: "offerLetter", text: "Must hold an offer of admission from a top-ranked institution." },
    ],
  },

  // ───────────────────────── Canada ─────────────────────────
  {
    id: "ontario-graduate-scholarship",
    countryKey: "canada",
    name: "Ontario Graduate Scholarship (OGS)",
    provider: "Government of Ontario · participating universities",
    levelLabel: "Master's / PhD",
    funding: "partial",
    award: "CAD 15,000 / year",
    deadline: "2027-01-31",
    deadlineEstimated: true,
    summary: "Merit award for graduate students at Ontario universities, including a quota for international students.",
    source: "https://www.ontario.ca/page/ontario-graduate-scholarship-program",
    lastReviewed: REVIEW_DATE,
    requirements: [
      ANY_DEGREE_LEVEL_GRAD,
      { id: "ogs-gpa", kind: "minGpa", value: 80, scale: 100, text: "At least an A- (≈80%) average in each of the last two completed years." },
      { id: "ogs-offer", kind: "offerLetter", text: "Must be enrolled — or admitted — full-time in a graduate programme at a participating Ontario university." },
    ],
  },
  {
    id: "lester-pearson",
    countryKey: "canada",
    name: "Lester B. Pearson International Scholarship",
    provider: "University of Toronto",
    levelLabel: "Undergraduate",
    funding: "full",
    award: "Tuition, books, fees and residence for 4 years",
    deadline: "2026-11-07",
    deadlineEstimated: true,
    summary: "U of T's most prestigious award for international students starting an undergraduate degree.",
    source: "https://future.utoronto.ca/pearson/",
    lastReviewed: REVIEW_DATE,
    requirements: [
      { id: "lbp-level", kind: "targetLevel", levels: ["bachelors"], text: "Only for students applying to their first undergraduate degree." },
      { id: "lbp-current", kind: "currentLevel", levels: ["high_school"], text: "Applicants must be in their final year of secondary school (or graduated in the last year)." },
      { id: "lbp-nom", kind: "manual", text: "Must be nominated by your school.", why: "Nomination happens outside your documents — only your school can confirm it." },
    ],
  },
  {
    id: "mitacs-globalink",
    countryKey: "canada",
    name: "Mitacs Globalink Research Internship",
    provider: "Mitacs",
    levelLabel: "Undergraduate research",
    funding: "full",
    award: "Funded 12-week research internship + travel",
    deadline: "2026-09-17",
    deadlineEstimated: true,
    summary: "A summer research internship at a Canadian university for senior undergraduates from partner countries.",
    source: "https://www.mitacs.ca/our-programs/globalink-research-internship-students/",
    lastReviewed: REVIEW_DATE,
    requirements: [
      { id: "mg-nat", kind: "nationality", allowed: ["india", "australia", "brazil", "china", "colombia", "france", "germany", "hong kong", "japan", "mexico", "saudi arabia", "taiwan", "tunisia", "ukraine", "united kingdom", "united states"], text: "Students from Mitacs partner countries (India is a partner)." },
      { id: "mg-current", kind: "currentLevel", levels: ["bachelors"], text: "Must be a full-time undergraduate student." },
      { id: "mg-year", kind: "minYearOfStudy", year: 3, text: "In at least the third year of a four-year degree." },
      { id: "mg-gpa", kind: "minGpa", value: 75, scale: 100, text: "Strong academic standing (top of class; roughly 75%+ is a common benchmark)." },
    ],
  },

  // ───────────────────────── United Kingdom ─────────────────────────
  {
    id: "chevening",
    countryKey: "uk",
    name: "Chevening Scholarships",
    provider: "UK Foreign, Commonwealth & Development Office",
    levelLabel: "One-year master's",
    funding: "full",
    award: "Full tuition, monthly stipend, flights",
    deadline: "2026-10-07",
    deadlineEstimated: true,
    summary: "The UK government's global scholarship for future leaders with work experience.",
    source: "https://www.chevening.org/scholarships/",
    lastReviewed: REVIEW_DATE,
    requirements: [
      { id: "chev-nat", kind: "nationality", excluded: ["united kingdom", "united states", "germany", "france", "netherlands", "japan", "australia", "canada"], text: "Citizens of a Chevening-eligible country (India is eligible)." },
      { id: "chev-level", kind: "targetLevel", levels: ["masters"], text: "Funds a one-year taught master's in the UK." },
      { id: "chev-degree", kind: "degreeCompletedBy", year: 2026, text: "All parts of an undergraduate degree completed by the time you apply." },
      { id: "chev-work", kind: "minWorkExperience", months: 24, text: "At least two years (2,800 hours) of work experience." },
    ],
  },
  {
    id: "commonwealth-masters",
    countryKey: "uk",
    name: "Commonwealth Master's Scholarships",
    provider: "Commonwealth Scholarship Commission in the UK",
    levelLabel: "Master's",
    funding: "full",
    award: "Full tuition, stipend, return airfare",
    deadline: "2026-10-15",
    deadlineEstimated: true,
    summary: "Fully funded UK master's for talented graduates from low- and middle-income Commonwealth countries.",
    source: "https://cscuk.fcdo.gov.uk/scholarships/commonwealth-masters-scholarships/",
    lastReviewed: REVIEW_DATE,
    requirements: [
      { id: "csc-nat", kind: "nationality", allowed: ["india", "bangladesh", "pakistan", "sri lanka", "nepal", "nigeria", "kenya", "ghana", "uganda", "tanzania", "rwanda", "zambia", "malawi", "cameroon", "jamaica"], text: "Citizen of an eligible Commonwealth country (India is eligible)." },
      { id: "csc-level", kind: "targetLevel", levels: ["masters"], text: "Funds a taught master's degree in the UK." },
      { id: "csc-degree", kind: "degreeCompletedBy", year: 2027, text: "First degree completed by September 2027." },
      { id: "csc-gpa", kind: "minGpa", value: 60, scale: 100, text: "At least upper second-class (2:1) honours or equivalent (≈60% in India)." },
    ],
  },
  {
    id: "great-scholarships",
    countryKey: "uk",
    name: "GREAT Scholarships",
    provider: "British Council · UK universities",
    levelLabel: "One-year master's",
    funding: "partial",
    award: "GBP 10,000 towards tuition",
    deadline: "2027-05-01",
    deadlineEstimated: true,
    summary: "Country-specific awards for Indian students at participating UK universities.",
    source: "https://study-uk.britishcouncil.org/scholarships-funding/great-scholarships",
    lastReviewed: REVIEW_DATE,
    requirements: [
      { id: "great-nat", kind: "nationality", allowed: ["india", "bangladesh", "china", "egypt", "ghana", "indonesia", "kenya", "malaysia", "mexico", "nigeria", "pakistan", "thailand", "turkey", "vietnam"], text: "Citizens of a GREAT partner country (India is included)." },
      { id: "great-level", kind: "targetLevel", levels: ["masters"], text: "Funds a one-year postgraduate taught course." },
      { id: "great-english", kind: "englishTest", ielts: 6.5, toefl: 90, text: "Meets the university's English requirement (often IELTS 6.5 / TOEFL 90)." },
      { id: "great-offer", kind: "offerLetter", text: "Must hold (or have applied for) a place at a participating UK university." },
    ],
  },
  {
    id: "rhodes-india",
    countryKey: "uk",
    name: "Rhodes Scholarship (India)",
    provider: "Rhodes Trust · University of Oxford",
    levelLabel: "Postgraduate at Oxford",
    funding: "full",
    award: "All university fees + living stipend",
    deadline: "2026-07-31",
    deadlineEstimated: true,
    summary: "The oldest international graduate scholarship — postgraduate study at Oxford.",
    source: "https://www.rhodeshouse.ox.ac.uk/scholarships/applications/",
    lastReviewed: REVIEW_DATE,
    requirements: [
      { id: "rh-nat", kind: "nationality", allowed: ["india"], text: "Indian citizens (for the India constituency)." },
      ANY_DEGREE_LEVEL_GRAD,
      { id: "rh-age", kind: "maxAge", age: 25, asOf: "2026-10-01", text: "Aged 19–25 on 1 October of the application year." },
      { id: "rh-degree", kind: "degreeCompletedBy", year: 2027, text: "Undergraduate degree completed before starting at Oxford." },
    ],
  },

  // ───────────────────────── Germany ─────────────────────────
  {
    id: "daad-study-scholarship",
    countryKey: "germany",
    name: "DAAD Study Scholarship — Master's (all disciplines)",
    provider: "German Academic Exchange Service (DAAD)",
    levelLabel: "Master's",
    funding: "stipend",
    award: "EUR 992 / month + insurance + travel allowance",
    deadline: "2026-11-15",
    deadlineEstimated: true,
    summary: "DAAD's main master's scholarship for international graduates in any field.",
    source: "https://www.daad.de/en/study-and-research-in-germany/scholarships/",
    lastReviewed: REVIEW_DATE,
    requirements: [
      { id: "daad-level", kind: "targetLevel", levels: ["masters"], text: "Funds a full master's degree at a German university." },
      { id: "daad-final", kind: "finalYearOrGraduated", text: "Applicants must be in the final year of their bachelor's, or already graduated." },
      { id: "daad-recent", kind: "maxYearsSinceGraduation", years: 6, text: "Bachelor's completed no more than six years before applying." },
      { id: "daad-gpa", kind: "minGpa", value: 7, scale: 10, text: "Above-average academic results (we use ≈70% as a working threshold)." },
    ],
  },
  {
    id: "daad-epos",
    countryKey: "germany",
    name: "DAAD EPOS — Development-Related Postgraduate Courses",
    provider: "DAAD",
    levelLabel: "Master's",
    funding: "stipend",
    award: "EUR 992 / month + tuition-related costs + travel",
    deadline: "2026-10-31",
    deadlineEstimated: true,
    summary: "Postgraduate courses with special relevance to developing countries, for professionals.",
    source: "https://www.daad.de/en/study-and-research-in-germany/scholarships/",
    lastReviewed: REVIEW_DATE,
    requirements: [
      { id: "epos-level", kind: "targetLevel", levels: ["masters", "phd"], text: "Funds selected development-related master's and PhD courses." },
      { id: "epos-degree", kind: "degreeCompletedBy", year: 2026, text: "Bachelor's degree already completed." },
      { id: "epos-work", kind: "minWorkExperience", months: 24, text: "At least two years of relevant professional experience." },
    ],
  },
  {
    id: "deutschlandstipendium",
    countryKey: "germany",
    name: "Deutschlandstipendium",
    provider: "Federal Government & private sponsors",
    levelLabel: "Bachelor's / Master's",
    funding: "stipend",
    award: "EUR 300 / month (at least 2 semesters)",
    deadline: "2027-08-31",
    deadlineEstimated: true,
    summary: "Merit stipend open to international students enrolled at participating German universities.",
    source: "https://www.deutschlandstipendium.de/deutschlandstipendium/en/",
    lastReviewed: REVIEW_DATE,
    requirements: [
      { id: "dst-level", kind: "targetLevel", levels: ["bachelors", "masters"], text: "For students in a bachelor's or master's programme." },
      { id: "dst-offer", kind: "offerLetter", text: "Must be enrolled (or admitted) at a participating German university." },
      { id: "dst-gpa", kind: "minGpa", value: 75, scale: 100, text: "Outstanding academic record (universities set their own bar; ≈75%+ is typical)." },
    ],
  },

  // ───────────────────────── Australia ─────────────────────────
  {
    id: "australia-awards",
    countryKey: "australia",
    name: "Australia Awards Scholarships",
    provider: "Australian Government (DFAT)",
    levelLabel: "Master's / PhD",
    funding: "full",
    award: "Full tuition, living allowance, travel",
    deadline: "2027-04-30",
    deadlineEstimated: true,
    summary: "Long-term development awards for citizens of participating Indo-Pacific countries.",
    source: "https://www.dfat.gov.au/people-to-people/australia-awards",
    lastReviewed: REVIEW_DATE,
    requirements: [
      { id: "aa-nat", kind: "nationality", allowed: ["bangladesh", "bhutan", "maldives", "nepal", "pakistan", "sri lanka", "indonesia", "vietnam", "cambodia", "laos", "myanmar", "philippines", "timor-leste", "papua new guinea", "fiji", "mongolia"], text: "Citizens of participating countries. India is not currently a participating country." },
      ANY_DEGREE_LEVEL_GRAD,
    ],
  },
  {
    id: "research-training-program",
    countryKey: "australia",
    name: "Research Training Program (RTP) Scholarship",
    provider: "Australian Government · universities",
    levelLabel: "Research master's / PhD",
    funding: "full",
    award: "Tuition offset + living stipend (varies by university)",
    deadline: "2026-10-31",
    deadlineEstimated: true,
    summary: "Government-funded scholarships for research degrees, open to international applicants.",
    source: "https://www.education.gov.au/research-block-grants/research-training-program",
    lastReviewed: REVIEW_DATE,
    requirements: [
      { id: "rtp-level", kind: "targetLevel", levels: ["masters", "phd"], text: "For higher-degree-by-research students (research master's or PhD)." },
      { id: "rtp-degree", kind: "degreeCompletedBy", year: 2027, text: "Bachelor's (honours or equivalent) completed before commencement." },
      { id: "rtp-gpa", kind: "minGpa", value: 75, scale: 100, text: "First-class or high second-class honours equivalent (≈75%+)." },
      { id: "rtp-research", kind: "evidence", topic: "research", text: "Evidence of research experience or potential." },
    ],
  },
  {
    id: "sydney-scholars-india",
    countryKey: "australia",
    name: "Sydney Scholars India Scholarship",
    provider: "The University of Sydney",
    levelLabel: "Undergraduate / Postgraduate coursework",
    funding: "partial",
    award: "Up to AUD 40,000 (one-off)",
    deadline: "2027-01-15",
    deadlineEstimated: true,
    summary: "For Indian students admitted to a University of Sydney coursework degree.",
    source: "https://www.sydney.edu.au/scholarships/",
    lastReviewed: REVIEW_DATE,
    requirements: [
      { id: "ssi-nat", kind: "nationality", allowed: ["india"], text: "Indian citizens only." },
      { id: "ssi-level", kind: "targetLevel", levels: ["bachelors", "masters"], text: "For undergraduate or postgraduate coursework degrees." },
      { id: "ssi-offer", kind: "offerLetter", text: "Must hold an offer for an eligible University of Sydney degree." },
    ],
  },

  // ───────────────────────── Netherlands ─────────────────────────
  {
    id: "holland-scholarship",
    countryKey: "netherlands",
    name: "Holland Scholarship",
    provider: "Dutch Ministry of Education · Dutch universities",
    levelLabel: "Bachelor's / Master's",
    funding: "partial",
    award: "EUR 5,000 (one-off, first year)",
    deadline: "2027-02-01",
    deadlineEstimated: true,
    summary: "For non-EEA students starting a bachelor's or master's at a participating Dutch institution.",
    source: "https://www.studyinnl.org/finances/holland-scholarship",
    lastReviewed: REVIEW_DATE,
    requirements: [
      { id: "hs-nat", kind: "nationality", excluded: ["netherlands", "germany", "france", "italy", "spain", "belgium", "austria", "sweden", "denmark", "finland", "ireland", "portugal", "poland", "norway", "iceland", "liechtenstein", "switzerland"], text: "Nationality outside the European Economic Area." },
      { id: "hs-level", kind: "targetLevel", levels: ["bachelors", "masters"], text: "First year of a bachelor's or master's programme." },
      { id: "hs-english", kind: "englishTest", ielts: 6.5, toefl: 90, text: "Meets the programme's English requirement (commonly IELTS 6.5)." },
    ],
  },
  {
    id: "orange-tulip",
    countryKey: "netherlands",
    name: "Orange Tulip Scholarship (India)",
    provider: "Nuffic Neso India · Dutch universities",
    levelLabel: "Bachelor's / Master's",
    funding: "partial",
    award: "Partial to full tuition waiver (varies by programme)",
    deadline: "2027-04-01",
    deadlineEstimated: true,
    summary: "Programme-specific awards for Indian students admitted to participating Dutch universities.",
    source: "https://www.studyinnl.org/finances/scholarships",
    lastReviewed: REVIEW_DATE,
    requirements: [
      { id: "ots-nat", kind: "nationality", allowed: ["india"], text: "Indian nationals (the India edition of OTS)." },
      { id: "ots-level", kind: "targetLevel", levels: ["bachelors", "masters"], text: "Bachelor's or master's programmes." },
      { id: "ots-offer", kind: "offerLetter", text: "Must be admitted to a participating programme." },
    ],
  },
  {
    id: "amsterdam-excellence",
    countryKey: "netherlands",
    name: "Amsterdam Excellence Scholarship",
    provider: "University of Amsterdam",
    levelLabel: "Master's",
    funding: "full",
    award: "EUR 25,000 for one academic year",
    deadline: "2027-01-15",
    deadlineEstimated: true,
    summary: "For exceptionally talented non-EU students in selected UvA master's programmes.",
    source: "https://www.uva.nl/en",
    lastReviewed: REVIEW_DATE,
    requirements: [
      { id: "aes-level", kind: "targetLevel", levels: ["masters"], text: "Selected English-taught master's programmes." },
      { id: "aes-gpa", kind: "minGpa", value: 8, scale: 10, text: "Outstanding grades (≈80%+ as a working threshold)." },
      { id: "aes-rank", kind: "manual", text: "Graduating in the top 10% of your class.", why: "Class rank isn't usually printed on transcripts — ask your department for a rank certificate." },
    ],
  },

  // ───────────────────────── Singapore ─────────────────────────
  {
    id: "nus-research-scholarship",
    countryKey: "singapore",
    name: "NUS Research Scholarship",
    provider: "National University of Singapore",
    levelLabel: "Research master's / PhD",
    funding: "full",
    award: "Full tuition + monthly stipend",
    deadline: "2026-11-15",
    deadlineEstimated: true,
    summary: "Funding for research degrees at NUS, open to international students.",
    source: "https://nusgs.nus.edu.sg/scholarships/",
    lastReviewed: REVIEW_DATE,
    requirements: [
      { id: "nusrs-level", kind: "targetLevel", levels: ["masters", "phd"], text: "Research-based master's or PhD programmes." },
      { id: "nusrs-degree", kind: "degreeCompletedBy", year: 2027, text: "Good bachelor's degree completed before enrolment." },
      { id: "nusrs-gpa", kind: "minGpa", value: 70, scale: 100, text: "At least second-upper honours or equivalent (≈70%+)." },
      { id: "nusrs-research", kind: "evidence", topic: "research", text: "Research aptitude (projects, papers, or strong references)." },
    ],
  },
  {
    id: "singa",
    countryKey: "singapore",
    name: "Singapore International Graduate Award (SINGA)",
    provider: "A*STAR · NUS · NTU · SUTD",
    levelLabel: "PhD",
    funding: "full",
    award: "Full tuition + monthly stipend for 4 years",
    deadline: "2026-12-01",
    deadlineEstimated: true,
    summary: "A four-year PhD scholarship in science and engineering at Singapore's top institutions.",
    source: "https://www.a-star.edu.sg/Scholarships/for-graduate-studies/singapore-international-graduate-award-singa",
    lastReviewed: REVIEW_DATE,
    requirements: [
      { id: "singa-level", kind: "targetLevel", levels: ["phd"], text: "PhD applicants only." },
      { id: "singa-field", kind: "field", keywords: ["computer", "engineering", "science", "physics", "chemistry", "biology", "mathematics", "data"], text: "Science or engineering fields." },
    ],
  },
  {
    id: "asean-undergraduate",
    countryKey: "singapore",
    name: "ASEAN Undergraduate Scholarship",
    provider: "Ministry of Education Singapore · universities",
    levelLabel: "Undergraduate",
    funding: "partial",
    award: "Tuition subsidy + annual living allowance",
    deadline: "2027-03-15",
    deadlineEstimated: true,
    summary: "For ASEAN citizens starting an undergraduate degree in Singapore.",
    source: "https://www.moe.gov.sg/financial-matters/awards-scholarships",
    lastReviewed: REVIEW_DATE,
    requirements: [
      { id: "asean-nat", kind: "nationality", allowed: ["brunei", "cambodia", "indonesia", "laos", "malaysia", "myanmar", "philippines", "thailand", "vietnam"], text: "Citizens of ASEAN member countries (excluding Singapore)." },
      { id: "asean-level", kind: "targetLevel", levels: ["bachelors"], text: "First undergraduate degree." },
    ],
  },

  // ───────────────────────── Japan ─────────────────────────
  {
    id: "mext-research",
    countryKey: "japan",
    name: "MEXT Scholarship — Research Students (Embassy track)",
    provider: "Japanese Government (MEXT)",
    levelLabel: "Master's / PhD (research)",
    funding: "full",
    award: "≈ JPY 144,000 / month + tuition + flights",
    deadline: "2027-05-20",
    deadlineEstimated: true,
    summary: "Japan's government scholarship for graduate research, applied for via the embassy in your country.",
    source: "https://www.studyinjapan.go.jp/en/",
    lastReviewed: REVIEW_DATE,
    requirements: [
      ANY_DEGREE_LEVEL_GRAD,
      { id: "mext-age", kind: "maxAge", age: 34, asOf: "2028-04-01", text: "Born on or after 2 April 1993 (under 35 at arrival)." },
      { id: "mext-degree", kind: "degreeCompletedBy", year: 2028, text: "Bachelor's degree completed before arriving in Japan." },
      { id: "mext-gpa", kind: "minGpa", value: 2.3, scale: 3, text: "Grade average of at least 2.3 on MEXT's 3-point conversion (≈77%)." },
    ],
  },
  {
    id: "jasso-honors",
    countryKey: "japan",
    name: "JASSO Monbukagakusho Honors Scholarship",
    provider: "Japan Student Services Organization",
    levelLabel: "All levels",
    funding: "stipend",
    award: "JPY 48,000 / month",
    deadline: "2027-04-30",
    deadlineEstimated: true,
    summary: "Monthly support for privately financed international students already enrolled in Japan.",
    source: "https://www.jasso.go.jp/en/",
    lastReviewed: REVIEW_DATE,
    requirements: [
      { id: "jasso-level", kind: "targetLevel", levels: ["bachelors", "masters", "phd"], text: "Undergraduate or graduate students." },
      { id: "jasso-offer", kind: "offerLetter", text: "Must be enrolled at a Japanese university (applied for through your university)." },
    ],
  },
  {
    id: "adb-jsp",
    countryKey: "japan",
    name: "ADB-Japan Scholarship Program",
    provider: "Asian Development Bank",
    levelLabel: "Master's",
    funding: "full",
    award: "Full tuition, stipend, insurance, travel",
    deadline: "2027-03-31",
    deadlineEstimated: true,
    summary: "For citizens of ADB borrowing members to study development-related master's in Asia-Pacific.",
    source: "https://www.adb.org/work-with-us/careers/japan-scholarship-program",
    lastReviewed: REVIEW_DATE,
    requirements: [
      { id: "adb-nat", kind: "nationality", allowed: ["india", "bangladesh", "nepal", "pakistan", "sri lanka", "indonesia", "vietnam", "philippines", "mongolia", "cambodia", "uzbekistan"], text: "Citizens of an ADB borrowing member country (India qualifies)." },
      { id: "adb-level", kind: "targetLevel", levels: ["masters"], text: "Master's programmes at participating institutions." },
      { id: "adb-work", kind: "minWorkExperience", months: 24, text: "At least two years of full-time professional experience." },
      { id: "adb-age", kind: "maxAge", age: 35, asOf: "2027-08-01", text: "Not older than 35 at the time of application." },
    ],
  },
];

export function scholarshipsFor(countryKey: CountryKey): Scholarship[] {
  return scholarships.filter((item) => item.countryKey === countryKey);
}

export function findScholarship(id: string): Scholarship | undefined {
  return scholarships.find((item) => item.id === id);
}
