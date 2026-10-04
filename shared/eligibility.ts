/**
 * Deterministic eligibility engine.
 *
 *   evaluate(profile, scholarship, today) → Evaluation
 *
 * This is the ONLY place an eligibility verdict is decided. The open model
 * extracts facts and writes explanations, but never decides the outcome.
 *
 * Rules:
 *   - any requirement that FAILS        → "ineligible"
 *   - else any requirement UNKNOWN      → "verification"  (missing data never passes)
 *   - else                              → "eligible"
 *
 * Pure functions only — runs identically in the browser (live re-checks as the
 * student edits their profile) and on the server (to ground the explanation).
 */
import type { Requirement } from "./requirements";
import { LEVEL_LABELS, type ProfileField, type StudentProfile } from "./profile";
import { scholarships, type CountryKey, type Scholarship } from "./scholarships";

export type Status = "eligible" | "verification" | "ineligible";
export type CheckOutcome = "pass" | "fail" | "unknown";

export type CheckResult = {
  requirement: Requirement;
  outcome: CheckOutcome;
  /** The student's value, in plain words ("8.4 / 10", "3rd year of 4", "Not found in your documents"). */
  yourValue: string;
  /** One-sentence reason for the outcome. */
  reason: string;
  /** Profile field this check looked at — lets the UI show the supporting document quote. */
  field?: ProfileField;
};

export type Evaluation = {
  scholarshipId: string;
  status: Status;
  checks: CheckResult[];
  passed: number;
  failed: number;
  unknown: number;
  headline: string;
  daysLeft: number;
  closed: boolean;
};

/** If the student's normalised grade is within this band of the threshold, we refuse to call it. */
export const GPA_UNCERTAINTY_BAND = 0.03;

const NOT_FOUND = "Not found in your documents";

const COUNTRY_ALIASES: Record<string, string> = {
  bharat: "india",
  indian: "india",
  "republic of india": "india",
  usa: "united states",
  us: "united states",
  "united states of america": "united states",
  american: "united states",
  uk: "united kingdom",
  britain: "united kingdom",
  "great britain": "united kingdom",
  british: "united kingdom",
  england: "united kingdom",
  pakistani: "pakistan",
  bangladeshi: "bangladesh",
  nepali: "nepal",
  nepalese: "nepal",
  "sri lankan": "sri lanka",
  chinese: "china",
  german: "germany",
  dutch: "netherlands",
  holland: "netherlands",
  japanese: "japan",
  canadian: "canada",
  australian: "australia",
  singaporean: "singapore",
  indonesian: "indonesia",
  vietnamese: "vietnam",
  filipino: "philippines",
  nigerian: "nigeria",
  kenyan: "kenya",
};

export function normalizeCountry(value: string): string {
  const cleaned = value.trim().toLowerCase().replace(/\./g, "").replace(/\s+/g, " ");
  return COUNTRY_ALIASES[cleaned] ?? cleaned;
}

function titleCase(value: string): string {
  return value.replace(/\b\w/g, (char) => char.toUpperCase());
}

function ordinal(value: number): string {
  const suffix = value % 10 === 1 && value !== 11 ? "st" : value % 10 === 2 && value !== 12 ? "nd" : value % 10 === 3 && value !== 13 ? "rd" : "th";
  return `${value}${suffix}`;
}

export function formatMonths(months: number): string {
  if (months === 0) return "None";
  if (months < 12) return `${months} month${months === 1 ? "" : "s"}`;
  const years = Math.floor(months / 12);
  const rest = months % 12;
  return rest ? `${years} yr ${rest} mo` : `${years} year${years === 1 ? "" : "s"}`;
}

/** Academic year that ends next summer: Oct 2026 → 2027. Final-year students graduate in this year. */
function academicEndYear(today: Date): number {
  return today.getMonth() >= 6 ? today.getFullYear() + 1 : today.getFullYear();
}

function hasGraduated(profile: StudentProfile, today: Date): boolean {
  if (profile.currentLevel === "masters" || profile.currentLevel === "phd") return true;
  return profile.graduationYear !== null && profile.graduationYear < today.getFullYear();
}

function check(
  requirement: Requirement,
  outcome: CheckOutcome,
  yourValue: string,
  reason: string,
  field?: ProfileField,
): CheckResult {
  return { requirement, outcome, yourValue, reason, field };
}

function evaluateRequirement(req: Requirement, p: StudentProfile, today: Date): CheckResult {
  switch (req.kind) {
    case "targetLevel": {
      if (!p.targetLevel) return check(req, "unknown", NOT_FOUND, "We couldn't tell which degree you're applying for.", "targetLevel");
      const value = LEVEL_LABELS[p.targetLevel];
      const wanted = req.levels.map((level) => LEVEL_LABELS[level]).join(" or ");
      return req.levels.includes(p.targetLevel)
        ? check(req, "pass", value, `You're applying for a ${value} degree, which this award funds.`, "targetLevel")
        : check(req, "fail", value, `This award only funds ${wanted} study; you're applying for a ${value}.`, "targetLevel");
    }

    case "currentLevel": {
      if (!p.currentLevel) return check(req, "unknown", NOT_FOUND, "We couldn't tell what you're currently studying.", "currentLevel");
      const value = LEVEL_LABELS[p.currentLevel];
      const wanted = req.levels.map((level) => LEVEL_LABELS[level]).join(" or ");
      return req.levels.includes(p.currentLevel)
        ? check(req, "pass", `${value} student`, `You're currently at ${value} level, as required.`, "currentLevel")
        : check(req, "fail", `${value} student`, `Applicants must currently be at ${wanted} level; your profile says ${value}.`, "currentLevel");
    }

    case "nationality": {
      if (!p.nationality) return check(req, "unknown", NOT_FOUND, "Your documents don't state your nationality.", "nationality");
      const nat = normalizeCountry(p.nationality);
      const value = titleCase(nat);
      if (req.excluded?.includes(nat)) return check(req, "fail", value, `Citizens of ${value} are not eligible for this award.`, "nationality");
      if (req.allowed && !req.allowed.includes(nat)) return check(req, "fail", value, `${value} is not on the list of eligible countries.`, "nationality");
      return check(req, "pass", value, `${value} is an eligible nationality.`, "nationality");
    }

    case "minGpa": {
      if (p.gpa === null || !p.gpaScale) return check(req, "unknown", NOT_FOUND, "We couldn't find your grade average and its scale.", "gpa");
      const yours = p.gpa / p.gpaScale;
      const needed = req.value / req.scale;
      const value = `${p.gpa} / ${p.gpaScale} (≈${Math.round(yours * 100)}%)`;
      const neededLabel = `${req.value} / ${req.scale} (≈${Math.round(needed * 100)}%)`;
      const diff = yours - needed;
      if (diff >= GPA_UNCERTAINTY_BAND) return check(req, "pass", value, `Your grades clear the ${neededLabel} threshold comfortably.`, "gpa");
      if (diff <= -GPA_UNCERTAINTY_BAND) return check(req, "fail", value, `The threshold is ${neededLabel}; your average converts to about ${Math.round(yours * 100)}%.`, "gpa");
      return check(req, "unknown", value, `You're within ${Math.round(GPA_UNCERTAINTY_BAND * 100)} points of the ${neededLabel} threshold — official grade conversions vary, so confirm with the provider.`, "gpa");
    }

    case "degreeCompletedBy": {
      if (p.currentLevel === "masters" || p.currentLevel === "phd") return check(req, "pass", "Bachelor's already completed", "You already hold a bachelor's degree.", "currentLevel");
      if (p.currentLevel === "high_school") return check(req, "fail", "High school student", `A completed bachelor's is needed by ${req.year}.`, "currentLevel");
      if (p.graduationYear === null) return check(req, "unknown", NOT_FOUND, "We couldn't find your (expected) graduation year.", "graduationYear");
      const value = `Graduating ${p.graduationYear}`;
      return p.graduationYear <= req.year
        ? check(req, "pass", value, `You graduate in ${p.graduationYear}, in time for the ${req.year} requirement.`, "graduationYear")
        : check(req, "fail", value, `Your degree must be complete by ${req.year}; you graduate in ${p.graduationYear}.`, "graduationYear");
    }

    case "finalYearOrGraduated": {
      if (hasGraduated(p, today)) return check(req, "pass", "Already graduated", "You've already completed your degree.", "graduationYear");
      if (p.yearOfStudy !== null && p.programYears !== null) {
        const value = `${ordinal(p.yearOfStudy)} year of ${p.programYears}`;
        return p.yearOfStudy >= p.programYears
          ? check(req, "pass", value, "You're in the final year of your degree.", "yearOfStudy")
          : check(req, "fail", value, `Applicants must be in their final year; you're in your ${ordinal(p.yearOfStudy)} year of ${p.programYears}. You can apply next cycle.`, "yearOfStudy");
      }
      if (p.graduationYear !== null) {
        const value = `Graduating ${p.graduationYear}`;
        return p.graduationYear <= academicEndYear(today)
          ? check(req, "pass", value, `Graduating in ${p.graduationYear} means you're in your final year now.`, "graduationYear")
          : check(req, "fail", value, `Graduating in ${p.graduationYear} means you're not yet in your final year.`, "graduationYear");
      }
      return check(req, "unknown", NOT_FOUND, "We couldn't tell which year of study you're in.", "yearOfStudy");
    }

    case "minYearOfStudy": {
      if (p.yearOfStudy === null) return check(req, "unknown", NOT_FOUND, "We couldn't tell which year of study you're in.", "yearOfStudy");
      const value = `${ordinal(p.yearOfStudy)} year`;
      return p.yearOfStudy >= req.year
        ? check(req, "pass", value, `You're in your ${ordinal(p.yearOfStudy)} year, as required.`, "yearOfStudy")
        : check(req, "fail", value, `Applicants must be in at least their ${ordinal(req.year)} year.`, "yearOfStudy");
    }

    case "maxYearsSinceGraduation": {
      if (p.graduationYear === null) return check(req, "unknown", NOT_FOUND, "We couldn't find your graduation year.", "graduationYear");
      const since = today.getFullYear() - p.graduationYear;
      const value = p.graduationYear >= today.getFullYear() ? `Graduating ${p.graduationYear}` : `Graduated ${p.graduationYear}`;
      return since <= req.years
        ? check(req, "pass", value, `Your degree is recent enough (limit: ${req.years} years).`, "graduationYear")
        : check(req, "fail", value, `You graduated ${since} years ago; the limit is ${req.years}.`, "graduationYear");
    }

    case "minWorkExperience": {
      const needed = formatMonths(req.months);
      if (p.workExperienceMonths === null) return check(req, "unknown", NOT_FOUND, `Your documents don't mention work experience; ${needed} is required.`, "workExperienceMonths");
      const value = formatMonths(p.workExperienceMonths);
      return p.workExperienceMonths >= req.months
        ? check(req, "pass", value, `You have ${value} of experience (needed: ${needed}).`, "workExperienceMonths")
        : check(req, "fail", value, `${needed} of work experience is required; your documents show ${value.toLowerCase()}.`, "workExperienceMonths");
    }

    case "field": {
      const haystack = `${p.field ?? ""} ${p.degreeName ?? ""}`.trim().toLowerCase();
      if (!haystack) return check(req, "unknown", NOT_FOUND, "We couldn't find your field of study.", "field");
      const value = p.field ?? p.degreeName ?? "";
      return req.keywords.some((keyword) => haystack.includes(keyword.toLowerCase()))
        ? check(req, "pass", value, "Your field is within the eligible disciplines.", "field")
        : check(req, "fail", value, "Your field isn't among the eligible disciplines.", "field");
    }

    case "englishTest": {
      if (!p.englishTest) return check(req, "unknown", NOT_FOUND, "No English test score found. Many programmes let you submit it later — but you'll need one.", "englishTest");
      const { type, score } = p.englishTest;
      const value = `${type} ${score}`;
      const needed = type === "IELTS" ? req.ielts : type === "TOEFL" ? req.toefl : type === "PTE" ? req.pte : undefined;
      if (needed === undefined) return check(req, "unknown", value, `This award doesn't publish a ${type} threshold — check whether it's accepted.`, "englishTest");
      return score >= needed
        ? check(req, "pass", value, `Your ${type} score meets the ${needed} requirement.`, "englishTest")
        : check(req, "fail", value, `${type} ${needed} is required; your score is ${score}.`, "englishTest");
    }

    case "maxAge": {
      if (p.birthYear === null) return check(req, "unknown", NOT_FOUND, `There's an age limit (${req.age}), but your documents don't show your date of birth.`, "birthYear");
      const asOfYear = Number(req.asOf.slice(0, 4));
      const maxAge = asOfYear - p.birthYear;
      const minAge = maxAge - 1;
      const value = `Born ${p.birthYear} (≈${minAge}–${maxAge} on ${req.asOf})`;
      if (maxAge <= req.age) return check(req, "pass", value, `You're within the age limit of ${req.age}.`, "birthYear");
      if (minAge > req.age) return check(req, "fail", value, `The age limit is ${req.age} on ${req.asOf}; you'll be over it.`, "birthYear");
      return check(req, "unknown", value, `Right on the age limit — it depends on your exact birthday.`, "birthYear");
    }

    case "evidence": {
      const items = p[req.topic];
      const label = req.topic === "community" ? "community work" : req.topic;
      if (items.length === 0) return check(req, "unknown", NOT_FOUND, `This award weighs ${label}, but your documents don't contain enough information about it.`, req.topic);
      return check(req, "pass", items[0], `Your documents show ${label} evidence. The committee judges its strength — we only confirm it exists.`, req.topic);
    }

    case "offerLetter": {
      if (p.hasOfferLetter === true) return check(req, "pass", "Offer letter in hand", "You already hold a university offer.", "hasOfferLetter");
      return check(req, "unknown", p.hasOfferLetter === false ? "No offer yet" : NOT_FOUND, "This award needs an admission offer first — apply to the programme, then come back.", "hasOfferLetter");
    }

    case "manual":
      return check(req, "unknown", "Can't be checked from documents", req.why);
  }
}

const OUTCOME_ORDER: Record<CheckOutcome, number> = { fail: 0, unknown: 1, pass: 2 };

export function daysUntil(deadline: string, today: Date): number {
  const end = new Date(`${deadline}T23:59:59`);
  const start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  return Math.floor((end.getTime() - start.getTime()) / 86_400_000);
}

export function evaluate(profile: StudentProfile, scholarship: Scholarship, today: Date = new Date()): Evaluation {
  const checks = scholarship.requirements
    .map((req) => evaluateRequirement(req, profile, today))
    .sort((a, b) => OUTCOME_ORDER[a.outcome] - OUTCOME_ORDER[b.outcome]);

  const failed = checks.filter((item) => item.outcome === "fail").length;
  const unknown = checks.filter((item) => item.outcome === "unknown").length;
  const passed = checks.length - failed - unknown;
  const status: Status = failed > 0 ? "ineligible" : unknown > 0 ? "verification" : "eligible";

  const headline =
    status === "eligible"
      ? `All ${passed} checkable requirements match your profile.`
      : checks[0].reason;

  const daysLeft = daysUntil(scholarship.deadline, today);
  return { scholarshipId: scholarship.id, status, checks, passed, failed, unknown, headline, daysLeft, closed: daysLeft < 0 };
}

export function evaluateMany(profile: StudentProfile, list: Scholarship[], today: Date = new Date()): Map<string, Evaluation> {
  return new Map(list.map((item) => [item.id, evaluate(profile, item, today)]));
}

export function countryCounts(profile: StudentProfile, countryKey: CountryKey, today: Date = new Date()) {
  const list = scholarships.filter((item) => item.countryKey === countryKey);
  const counts = { total: list.length, eligible: 0, verification: 0, ineligible: 0, open: 0 };
  for (const item of list) {
    const result = evaluate(profile, item, today);
    counts[result.status]++;
    if (!result.closed) counts.open++;
  }
  return counts;
}

export const STATUS_LABELS: Record<Status, string> = {
  eligible: "Eligible",
  verification: "Needs verification",
  ineligible: "Not eligible",
};
